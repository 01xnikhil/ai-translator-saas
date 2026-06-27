import React, { useState, useEffect } from "react";
import api from "../api";
import { useAuth } from "../AuthContext";

function Translate() {
  const [languages, setLanguages] = useState({});
  const [text, setText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("en");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { email, logout } = useAuth();

  useEffect(() => {
    api.get("/api/languages").then((res) => setLanguages(res.data));
  }, []);

  const handleTranslate = async () => {
    if (!text.trim()) {
      setError("Please enter some text to translate.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/api/translate", {
        text,
        source_lang: sourceLang,
        target_lang: targetLang,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const swapLanguages = () => {
    if (sourceLang === "auto") return;
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  const handleClear = () => {
    setText("");
    setResult(null);
    setError("");
  };

  const copyToClipboard = () => {
    const textToCopy = result?.translated_text || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      alert("Copied to clipboard! 📋");
    } else {
      alert("Nothing to copy yet!");
    }
  };

  const handleSpeak = () => {
    const textToSpeak = result?.translated_text || "";
    if (textToSpeak) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = targetLang;
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Nothing to speak yet!");
    }
  };
const [selectedWord, setSelectedWord] = useState(null);
const [wordDetails, setWordDetails] = useState(null);
const [dictLoading, setDictLoading] = useState(false);

const handleWordClick = async (word) => {
  const cleanWord = word.replace(/[.,!?;:()"'’]/g, "").trim();
  if (!cleanWord) return;

  setSelectedWord(cleanWord);
  setDictLoading(true);
  setWordDetails(null);

  try {
    const res = await api.get(`/api/dictionary/${cleanWord}`);
    setWordDetails(res.data);
  } catch (err) {
    setWordDetails({ error: "Meaning not found for this word." });
  } finally {
    setDictLoading(false);
  }
};
  return (
    <div className="app-screen">
      {/* Top Navigation Bar */}
      <header className="topbar">
        <div className="brand-logo-area">
          <div className="app-logo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896 3.066 2.457 5.857 4.594 8.194m-4.594-8.194L15 3.75M2.586 11H12" />
            </svg>
          </div>
          <h2>AI Translator <span className="pro-badge">PRO</span></h2>
        </div>
        <div className="user-info">
          <div className="user-avatar">{email ? email[0].toUpperCase() : "U"}</div>
          <span className="user-email">{email}</span>
          <button className="logout-btn" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="translator-container">
        {/* Controls Header */}
        <div className="translator-controls">
          <div className="select-wrapper">
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)}>
              {Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </div>

          <button className="swap-btn" onClick={swapLanguages} disabled={sourceLang === "auto"} title="Swap Languages">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>

          <div className="select-wrapper">
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)}>
              {Object.entries(languages)
                .filter(([code]) => code !== "auto")
                .map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Translation Workspace */}
        <div className="workspace">
          {/* Input Panel */}
          <div className="panel input-panel">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to translate..."
              maxLength={5000}
            />
            <div className="panel-footer">
              <span className="char-count">{text.length}/5000</span>
              <div className="input-actions">
                {text && (
                  <button className="icon-btn clear-btn" onClick={handleClear} title="Clear text">
                    ✕
                  </button>
                )}
                <button className="action-btn translate-action" onClick={handleTranslate} disabled={loading}>
                  {loading ? <div className="btn-spinner"></div> : "Translate"}
                </button>
              </div>
            </div>
          </div>

          {/* Output/Result Panel */}
<div className="panel output-panel">
  <div className="result-wrapper-layout">
    <div className="result-content">
      {loading ? (
        <div className="loading-wrapper">
          <div className="pulse-loader"></div>
          <p>AI is thinking...</p>
        </div>
      ) : result ? (
        <>
          {result.detected_language && (
            <div className="detected-tag">
              Detected: {result.detected_language}
            </div>
          )}
          
          <p className="translated-text">
            {result.translated_text.split(" ").map((word, index) => (
              <span 
                key={index} 
                className={`clickable-word ${selectedWord === word.replace(/[.,!?;:()"'’]/g, "").trim() ? "active-word" : ""}`}
                onClick={() => handleWordClick(word)}
              >
                {word}{" "}
              </span>
            ))}
          </p>

          {(selectedWord || dictLoading) && (
            <div className="dictionary-panel">
              <div className="dict-header">
                <h4>Smart Dictionary: <span>{selectedWord}</span></h4>
                <button className="close-dict-btn" onClick={() => { setSelectedWord(null); setWordDetails(null); }}>✕</button>
              </div>
              
              {dictLoading ? (
                <p className="dict-status">Searching dictionary...</p>
              ) : wordDetails?.error ? (
                <p className="dict-status error">{wordDetails.error}</p>
              ) : wordDetails ? (
                <div className="dict-body">
                  <p className="dict-def"><strong>Meaning:</strong> {wordDetails.definition}</p>
                  {wordDetails.synonyms && wordDetails.synonyms.length > 0 && (
  <p className="dict-syns">
    <strong>Synonyms:</strong>{" "}
    <div className="syn-tags-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
      {wordDetails.synonyms.map((syn, i) => (
        <span key={i} className="syn-tag" style={{ background: 'rgba(29, 158, 117, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
          {syn}
        </span>
      ))}
    </div>
  </p>
)}
                </div>
              ) : null}
            </div>
          )}
        </>
      ) : (
        <p className="empty-text">Translation will appear here...</p>
      )}
    </div>
    
    {/* Speak & Copy Buttons */}
    <div className="panel-actions">
      <button className="icon-btn" onClick={handleSpeak} disabled={!result} title="Listen (Speak)">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
        </svg>
      </button>
      <button className="icon-btn" onClick={copyToClipboard} disabled={!result} title="Copy to clipboard">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="18" height="18">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0A2.25 2.25 0 0113.5 5.25h-3a2.25 2.25 0 01-2.166-1.612m7.332 0c.055.194.084.4.084.612v1.5c0 1.036-.84 1.875-1.875 1.875h-5.25A1.875 1.875 0 016 5.625V4.125c0-.212.03-.418.084-.612m7.332 0c.546.546.91 1.285.91 2.102v12.42c0 .817-.364 1.556-.91 2.102m0-16.624a2.25 2.25 0 00-2.25-2.25h-3a2.25 2.25 0 00-2.25 2.25m-.017 16.625a2.25 2.25 0 01-2.245-2.25V5.25m0 13.5c-.546-.546-.91-1.285-.91-2.102V5.25" />
        </svg>
      </button>
    </div>
  </div>
  
  {error && (
    <div className="panel-error">
      <p>{error}</p>
    </div>
  )}
</div>
        </div>
      </main>
    </div>
  );
}

export default Translate;