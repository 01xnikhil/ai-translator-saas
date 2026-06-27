# AI Translator

An NLP-powered translation web app with secure authentication, automatic language detection, text-to-speech, and click-to-define word lookups — built with FastAPI, PostgreSQL, and React.

## 🎥 Demo Video




---

## 🎯 Features

### 🔐 User Authentication
- Secure user registration and login system (JWT-based)
- Token-based state management with protected routes
- Personalized user translation dashboard

### 🧠 NLP-Powered Translation
- Automatic source language detection
- Translation across 10+ global languages
- Clean, contextual output rather than raw word-for-word swaps

### 🎙️ Text-to-Speech (TTS)
- One-click playback of translated text using the browser's native speech synthesis
- Helps users hear and practice correct pronunciation instantly

### 📖 Smart Word Lookup
- Click any word in the translated output to look up its meaning
- Shows definitions, synonyms, and part-of-speech in a contextual popup

### 📋 Copy to Clipboard
- One-click copy of the translated text for use anywhere else

---

## 🛠️ Tech Stack
 
- **Frontend:** React, React Router, Axios
- **Backend:** FastAPI, SQLAlchemy, PostgreSQL
- **Auth:** JWT (python-jose), bcrypt password hashing (passlib)
- **NLP/Translation:** langdetect, deep-translator
- **Speech:** Web Speech API (browser-native TTS)
- **Dictionary lookup:** Free Dictionary API
---
 

## 📂 File Structure

```
ai-translator/
├── backend/
│   ├── main.py              # FastAPI app — all API routes (signup, login, translate, languages)
│   ├── auth.py               # Password hashing + JWT create/decode helpers
│   ├── database.py           # SQLAlchemy engine & session setup (PostgreSQL connection)
│   ├── models.py              # SQLAlchemy ORM models (User table)
│   ├── users_db.py           # DB access functions (get/create/check user)
│   ├── create_tables.py      # One-time script to create DB tables
│   ├── requirements.txt      # Python dependencies
│   └── venv/                 # Python virtual environment (not committed)
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js       # Login page (passport/stamp themed UI)
│   │   │   ├── Signup.js      # Signup page
│   │   │   └── Translate.js   # Main translator page (protected route)
│   │   ├── api.js             # Axios instance with JWT auto-attach
│   │   ├── AuthContext.js     # Global auth state (token, email, login, logout)
│   │   ├── ProtectedRoute.js  # Route guard — redirects to /login if not authenticated
│   │   ├── App.js             # Routes setup (React Router)
│   │   ├── App.css            # All app styling
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
│
└── README.md
```

---

## 🚀 Getting Started

### Backend setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt
```

Create a PostgreSQL database:
```sql
CREATE DATABASE translator_db;
```

Update the connection string in `database.py` with your own PostgreSQL username/password, then create the tables:
```bash
python create_tables.py
```

Run the server:
```bash
uvicorn main:app --reload --port 8000
```

Backend runs at `http://localhost:8000` — API docs at `http://localhost:8000/docs`.

### Frontend setup

```bash
cd frontend
npm install
npm start
```

Frontend runs at `http://localhost:3000`.

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth required |
|--------|----------|--------------|----------------|
| POST | `/api/signup` | Register a new user | No |
| POST | `/api/login` | Log in and receive a JWT | No |
| GET | `/api/languages` | List supported languages | No |
| POST | `/api/translate` | Translate text | Yes |
| GET | `/health` | Health check | No |

---

## 🧩 Architecture Notes

- **Separation of concerns:** auth logic (`auth.py`), DB access (`users_db.py`), and routing (`main.py`) are kept in separate files so any one piece (e.g. swapping PostgreSQL for another DB) can change without touching the rest.
- **Stateless auth:** JWTs mean the backend doesn't need to track sessions in memory — any server instance can validate a request independently.
- **Client-side TTS and dictionary lookups:** kept on the frontend (Web Speech API + Free Dictionary API) to avoid unnecessary backend load for features that don't need server state.

---

## 📌 Possible Future Improvements

- Save translation history per user
- Support file/document translation
- Offline-capable PWA mode
- Rate limiting on the translate endpoint

---

 
## 📸 Screenshots
 
**Login**
<img width="1920" height="1020" alt="Screenshot 2026-06-27 102809" src="https://github.com/user-attachments/assets/290dbdc4-a683-4855-bab2-b4040ff6e3f9" />

 
**Signup**
<img width="1920" height="1020" alt="Screenshot 2026-06-27 102957" src="https://github.com/user-attachments/assets/1bb493ad-e241-48da-827e-e3966af733c7" />

 
**Translator**
<img width="1920" height="1020" alt="Screenshot 2026-06-27 103058" src="https://github.com/user-attachments/assets/0ffd74c6-adca-4706-82a0-1448758fc2f5" />


**Working-Output**
 <img width="1920" height="1020" alt="Screenshot 2026-06-27 103235" src="https://github.com/user-attachments/assets/2673f1b2-5d36-422e-b364-11027037248d" />


---

## 👤 Author

Built by [NIKHIL MISHRA]

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
