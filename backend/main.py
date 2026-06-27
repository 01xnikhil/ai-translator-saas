"""
AI Translator backend (NLP-based) with JWT authentication.

Flow:
1. /api/signup -> creates user, returns JWT token.
2. /api/login -> verifies credentials, returns JWT token.
3. /api/translate -> requires a valid JWT in the Authorization header.
"""
import nltk
from nltk.corpus import wordnet
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from langdetect import detect, DetectorFactory, LangDetectException
from deep_translator import GoogleTranslator
from sqlalchemy.orm import Session
from database import get_db

from auth import hash_password, verify_password, create_access_token, decode_access_token
import users_db
try:
    wordnet.ensure_loaded()
except LookupError:
    nltk.download('wordnet')
    
DetectorFactory.seed = 0

app = FastAPI(title="AI Translator (NLP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")

SUPPORTED_LANGUAGES = {
    "auto": "Detect automatically",
    "en": "English",
    "hi": "Hindi",
    "es": "Spanish",
    "fr": "French",
    "de": "German",
    "zh-cn": "Chinese (Simplified)",
    "ja": "Japanese",
    "ar": "Arabic",
    "ru": "Russian",
    "pt": "Portuguese",
}


# ---------- Schemas ----------

class SignupRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    email: str


class TranslateRequest(BaseModel):
    text: str
    target_lang: str = "en"
    source_lang: str = "auto"


class TranslateResponse(BaseModel):
    original_text: str
    detected_language: str | None
    translated_text: str
    target_lang: str


# ---------- Auth dependency ----------
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> str:
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    email = payload["sub"]
    if not users_db.user_exists(db, email):
        raise HTTPException(status_code=401, detail="User no longer exists")
    return email

# ---------- Auth routes ----------

@app.post("/api/signup", response_model=TokenResponse)
def signup(req: SignupRequest, db: Session = Depends(get_db)):
    if users_db.user_exists(db, req.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if len(req.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    hashed = hash_password(req.password)
    users_db.create_user(db, req.email, hashed)
    token = create_access_token({"sub": req.email})
    return TokenResponse(access_token=token, email=req.email)


@app.post("/api/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = users_db.get_user(db, req.email)
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    token = create_access_token({"sub": req.email})
    return TokenResponse(access_token=token, email=req.email)


# ---------- App routes ----------

@app.get("/api/languages")
def get_languages():
    return SUPPORTED_LANGUAGES


@app.post("/api/translate", response_model=TranslateResponse)
def translate(req: TranslateRequest, current_user: str = Depends(get_current_user)):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="text cannot be empty")

    detected = None
    source = req.source_lang

    if source == "auto":
        try:
            detected = detect(text)
            source = detected
        except LangDetectException:
            raise HTTPException(
                status_code=400,
                detail="Could not detect language — text too short or ambiguous.",
            )
    else:
        detected = source

    try:
        translated = GoogleTranslator(source=source, target=req.target_lang).translate(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")

    return TranslateResponse(
        original_text=text,
        detected_language=detected,
        translated_text=translated,
        target_lang=req.target_lang,
    )

@app.get("/api/dictionary/{word}")
async def get_word_details(word: str):
    clean_word = word.strip().strip(".,!?;:()\"'")
    synsets = wordnet.synsets(clean_word)
    
    if not synsets:
        raise HTTPException(status_code=404, detail="Word not found in dictionary")
    
    definition = synsets[0].definition()
    
    synonyms = set()
    for synset in synsets:
        for lemma in synset.lemmas():
            syn_name = lemma.name().replace("_", " ")
            if syn_name.lower() != clean_word.lower():
                synonyms.add(syn_name)
    
    return {
        "word": clean_word,
        "definition": definition.capitalize(),
        "synonyms": list(synonyms)[:5]
    }
@app.get("/health")
def health():
    return {"status": "ok"} 