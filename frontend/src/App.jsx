import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [page, setPage] = useState("translator");

  const [sourceLanguage, setSourceLanguage] =
    useState("Hindi");

  const [targetLanguage, setTargetLanguage] =
    useState("Santhali");

  const [text, setText] = useState("");
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return (
      localStorage.getItem("joharboli-theme") ===
      "dark"
    );
  });

  const [phraseSearch, setPhraseSearch] =
    useState("");

  const [phraseCategory, setPhraseCategory] =
    useState("All");

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const quickAudioCacheRef = useRef(new Map());

  /* =========================
     DARK / LIGHT MODE
  ========================= */

  useEffect(() => {
    document.body.classList.toggle(
      "dark-mode",
      darkMode
    );

    localStorage.setItem(
      "joharboli-theme",
      darkMode ? "dark" : "light"
    );
  }, [darkMode]);

  /* =========================
     PHRASEBOOK
  ========================= */

  const phrasebook = [
    {
      hindi: "नमस्ते।",
      santhali: "ᱡᱚᱦᱟᱨ ᱾",
      category: "Greetings",
    },
    {
      hindi: "आप कैसे हैं?",
      santhali:
        "ᱟᱢ ᱥᱮᱞᱮᱫ ᱢᱮᱱᱟᱢᱟ?",
      category: "Greetings",
    },
    {
      hindi: "मेरा नाम मृणाल है।",
      santhali:
        "ᱤᱧᱟᱹᱜ ᱧᱩᱛᱩᱢ ᱢᱨᱩᱱᱟᱞ ᱠᱟᱱᱟ ᱾",
      category: "Introduction",
    },
    {
      hindi: "आपका नाम क्या है?",
      santhali:
        "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱚᱠᱟ ᱠᱟᱱᱟ?",
      category: "Introduction",
    },
    {
      hindi: "धन्यवाद।",
      santhali: "ᱥᱟᱹᱨᱦᱟᱣ ᱾",
      category: "Daily Conversation",
    },
    {
      hindi: "कृपया मेरी मदद करें।",
      santhali:
        "ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱤᱧ ᱮᱢ ᱜᱚᱲᱚ ᱢᱮ ᱾",
      category: "Daily Conversation",
    },
    {
      hindi: "यह क्या है?",
      santhali:
        "ᱱᱚᱣᱟ ᱚᱠᱟ ᱠᱟᱱᱟ?",
      category: "Daily Conversation",
    },
    {
      hindi: "मुझे पानी चाहिए।",
      santhali:
        "ᱤᱧ ᱫᱟᱜ ᱥᱟᱵ ᱢᱮᱱᱟᱜᱼᱟ ᱾",
      category: "Daily Conversation",
    },
    {
      hindi: "मैं स्कूल जा रहा हूँ।",
      santhali:
        "ᱤᱧ ᱥᱠᱩᱞ ᱥᱮᱫ ᱠᱟᱱᱟᱹᱧ ᱾",
      category: "Education",
    },
    {
      hindi: "बच्चे स्कूल जा रहे हैं।",
      santhali:
        "ᱠᱩᱲᱤ ᱠᱚ ᱥᱠᱩᱞ ᱥᱮᱫ ᱠᱟᱱᱟ ᱾",
      category: "Education",
    },
    {
      hindi: "किताब पढ़ो।",
      santhali:
        "ᱯᱩᱛᱷᱤ ᱯᱟᱲᱦᱟᱣ ᱢᱮ ᱾",
      category: "Education",
    },
    {
      hindi: "यह मेरा घर है।",
      santhali:
        "ᱱᱚᱣᱟ ᱤᱧᱟᱹᱜ ᱚᱲᱟᱜ ᱠᱟᱱᱟ ᱾",
      category: "Family",
    },
  ];

  const quickSpeakWords = [
    { english: "Hello", santhali: "ᱡᱚᱦᱟᱨ" },
    { english: "Thank you", santhali: "ᱥᱟᱹᱨᱦᱟᱣ" },
    { english: "Water", santhali: "ᱫᱟᱜ" },
    { english: "School", santhali: "ᱥᱠᱩᱞ" },
    { english: "Book", santhali: "ᱯᱩᱛᱷᱤ" },
    { english: "Home", santhali: "ᱚᱲᱟᱜ" },
    { english: "Child", santhali: "ᱠᱩᱲᱤ" },
    { english: "Help", santhali: "ᱜᱚᱲᱚ" },
    { english: "Name", santhali: "ᱧᱩᱛᱩᱢ" },
    { english: "Good", santhali: "ᱵᱮᱥ" },
  ];

  const quickSpeakSentences = [
    { english: "Hello.", santhali: "ᱡᱚᱦᱟᱨ ᱾" },
    { english: "How are you?", santhali: "ᱟᱢ ᱥᱮᱞᱮᱫ ᱢᱮᱱᱟᱢᱟ?" },
    { english: "My name is Mrunal.", santhali: "ᱤᱧᱟᱹᱜ ᱧᱩᱛᱩᱢ ᱢᱨᱩᱱᱟᱞ ᱠᱟᱱᱟ ᱾" },
    { english: "What is your name?", santhali: "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱚᱠᱟ ᱠᱟᱱᱟ?" },
    { english: "Thank you.", santhali: "ᱥᱟᱹᱨᱦᱟᱣ ᱾" },
    { english: "Please help me.", santhali: "ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱤᱧ ᱮᱢ ᱜᱚᱲᱚ ᱢᱮ ᱾" },
    { english: "What is this?", santhali: "ᱱᱚᱣᱟ ᱚᱠᱟ ᱠᱟᱱᱟ?" },
    { english: "I need water.", santhali: "ᱤᱧ ᱫᱟᱜ ᱥᱟᱵ ᱢᱮᱱᱟᱜᱼᱟ ᱾" },
    { english: "I am going to school.", santhali: "ᱤᱧ ᱥᱠᱩᱞ ᱥᱮᱫ ᱠᱟᱱᱟᱹᱧ ᱾" },
    { english: "This is my home.", santhali: "ᱱᱚᱣᱟ ᱤᱧᱟᱹᱜ ᱚᱲᱟᱜ ᱠᱟᱱᱟ ᱾" },
  ];

  const letterLearning = [
    ["A", "अ / आ", "ᱚ / ᱟ", "a"], ["B", "ब", "ᱵ", "b"], ["C", "क / स", "ᱠ / ᱥ", "k / s"],
    ["D", "द", "ᱫ", "d"], ["E", "ए", "ᱮ", "e"], ["F", "फ", "ᱯᱷ", "ph"],
    ["G", "ग", "ᱜ", "g"], ["H", "ह", "ᱦ", "h"], ["I", "इ", "ᱤ", "i"],
    ["J", "ज", "ᱡ", "j"], ["K", "क", "ᱠ", "k"], ["L", "ल", "ᱞ", "l"],
    ["M", "म", "ᱢ", "m"], ["N", "न", "ᱱ", "n"], ["O", "ओ", "ᱳ", "o"],
    ["P", "प", "ᱯ", "p"], ["Q", "क्यू / क्व", "—", "no single Ol Chiki letter"],
    ["R", "र", "ᱨ", "r"], ["S", "स", "ᱥ", "s"], ["T", "त", "ᱛ", "t"],
    ["U", "उ", "ᱩ", "u"], ["V", "व", "ᱣ", "w / v"], ["W", "व", "ᱣ", "w"],
    ["X", "क्स", "—", "two-letter sound"], ["Y", "य", "ᱭ", "y"], ["Z", "ज़", "ᱡ", "j / z-like"],
  ];

  const categories = [
    "All",
    "Greetings",
    "Introduction",
    "Daily Conversation",
    "Education",
    "Family",
  ];

  /* =========================
     TRANSLATION
  ========================= */

  const translate = async () => {
    const cleanText = text.trim();

    if (!cleanText) {
      alert("Please enter some text first.");
      return;
    }

    setLoading(true);
    stopSpeaking();

    try {
      const response = await fetch(
        "http://localhost:5000/api/translate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: cleanText,
            sourceLanguage,
            targetLanguage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Translation failed"
        );
      }

      setResult(data);
    } catch (error) {
      console.error(error);

      setResult({
        error:
          "Could not connect to the translation server.",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     LANGUAGE SWAP
  ========================= */

  const swapLanguages = () => {
    const oldSource = sourceLanguage;

    setSourceLanguage(targetLanguage);
    setTargetLanguage(oldSource);

    setText("");
    setResult(null);
  };

  /* =========================
     CLEAR
  ========================= */

  const clearText = () => {
    setText("");
    setResult(null);
    stopSpeaking();
  };

  /* =========================
     EXAMPLES
  ========================= */

  const useExample = (example) => {
    setText(example);
    setPage("translator");
  };

  /* =========================
     VOICE INPUT
  ========================= */

  const startVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        "Speech recognition is not supported in this browser."
      );
      return;
    }

    if (sourceLanguage === "Santhali") {
      alert(
        "Santhali voice input is not enabled yet."
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      sourceLanguage === "Hindi"
        ? "hi-IN"
        : sourceLanguage === "Marathi"
        ? "mr-IN"
        : "en-IN";

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const spokenText =
        event.results[0][0].transcript;

      setText(spokenText);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(
        "Speech recognition error:",
        event.error
      );

      setIsListening(false);

      if (event.error === "not-allowed") {
        alert(
          "Please allow microphone permission."
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    recognition.start();
  };

  /* =========================
     TTS
  ========================= */

  const speakTranslation = async () => {
    if (!result?.translation) return;

    stopSpeaking();

    try {
      const response = await fetch(
        "http://localhost:5002/tts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: result.translation,
            language: targetLanguage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Speech generation failed."
        );
      }

      const blob = await response.blob();

      const audioURL =
        URL.createObjectURL(blob);

      const audio = new Audio(audioURL);

      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioURL);
      };

      setIsSpeaking(true);

      await audio.play();
    } catch (error) {
      console.error(error);

      setIsSpeaking(false);

      alert(
        "Could not generate speech."
      );
    }
  };

  /* =========================
     STOP SPEAKING
  ========================= */

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }

    setIsSpeaking(false);
  };

  /* =========================
     COPY
  ========================= */

  const copyTranslation = async () => {
    if (!result?.translation) return;

    await navigator.clipboard.writeText(
      result.translation
    );

    alert("Translation copied!");
  };

  /* =========================
     SAVE
  ========================= */

  const saveTranslation = () => {
    if (!result?.translation) return;

    const content =
      `${sourceLanguage}:\n${result.text}\n\n` +
      `${targetLanguage}:\n${result.translation}`;

    const blob = new Blob(
      [content],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "translation.txt";

    link.click();

    URL.revokeObjectURL(url);
  };

  /* =========================
     WORKSHEET
  ========================= */

  const generateWorksheet = () => {
    if (!result?.translation) {
      alert(
        "Translate something first."
      );
      return;
    }

    const worksheet = `
JOHARBOLI - BILINGUAL WORKSHEET

${sourceLanguage}
${result.text}

${targetLanguage}
${result.translation}

--------------------------------

Activity:

1. Read the ${sourceLanguage} sentence.

2. Read the ${targetLanguage} translation.

3. Write the translated sentence again.

4. Match the two languages.

--------------------------------

Generated by JoharBoli
`;

    const blob = new Blob(
      [worksheet],
      {
        type: "text/plain",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "joharboli-bilingual-worksheet.txt";

    link.click();

    URL.revokeObjectURL(url);
  };

  const speakQuick = async (santhaliText) => {
    if (!santhaliText || santhaliText === "—") return;

    stopSpeaking();

    try {
      let audioURL = quickAudioCacheRef.current.get(santhaliText);

      if (!audioURL) {
        setIsSpeaking(true);
        const response = await fetch("http://localhost:5002/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: santhaliText, language: "Santhali" }),
        });

        if (!response.ok) throw new Error("Quick speech generation failed.");

        const blob = await response.blob();
        audioURL = URL.createObjectURL(blob);
        quickAudioCacheRef.current.set(santhaliText, audioURL);
      }

      const audio = new Audio(audioURL);
      audioRef.current = audio;
      setIsSpeaking(true);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      await audio.play();
    } catch (error) {
      console.error("Quick Speak error:", error);
      setIsSpeaking(false);
      alert("Could not play quick speech. Make sure the TTS server is running.");
    }
  };

  /* =========================
     PHRASE SPEECH
  ========================= */

  const speakPhrase = async (
    santhaliText
  ) => {
    if (!santhaliText) return;

    try {
      stopSpeaking();

      setIsSpeaking(true);

      const response = await fetch(
        "http://localhost:5002/tts",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: santhaliText,
            language: "Santhali",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Santhali speech generation failed."
        );
      }

      const blob =
        await response.blob();

      const audioURL =
        URL.createObjectURL(blob);

      const audio =
        new Audio(audioURL);

      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(
          audioURL
        );
      };

      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(
          audioURL
        );
      };

      await audio.play();
    } catch (error) {
      console.error(
        "Santhali TTS error:",
        error
      );

      setIsSpeaking(false);

      alert(
        "Could not play Santhali speech. Make sure the TTS server is running."
      );
    }
  };

  /* =========================
     PHRASE SEARCH
  ========================= */

  const filteredPhrases =
    phrasebook.filter((item) => {
      const matchesCategory =
        phraseCategory === "All" ||
        item.category ===
          phraseCategory;

      const search =
        phraseSearch.toLowerCase();

      const matchesSearch =
        item.hindi
          .toLowerCase()
          .includes(search) ||
        item.santhali
          .toLowerCase()
          .includes(search);

      return (
        matchesCategory &&
        matchesSearch
      );
    });

  /* =========================
     CLEANUP
  ========================= */

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  /* =====================================================
     PHRASEBOOK PAGE
  ===================================================== */

  if (page === "phrasebook") {
    return (
      <div
        className={`app ${
          darkMode ? "dark-mode" : ""
        }`}
      >
        <aside className="sidebar">

          <div className="brand">
            <div className="brand-icon">
              🌿
            </div>

            <h1>
              Johar<span>Boli</span>
            </h1>

            <p>
              Bridging Languages
              <br />
              Building Futures
            </p>
          </div>

          <nav>

            <button
              className="nav-item"
              onClick={() =>
                setPage("translator")
              }
            >
              🏠
              <span>Translator</span>
            </button>

            <button
              className="nav-item"
              onClick={
                generateWorksheet
              }
            >
              📄
              <span>Worksheet</span>
            </button>

            <button className="nav-item active">
              📖
              <span>Phrasebook</span>
            </button>

            <button className="nav-item">
              ⬇️
              <span>Offline Mode</span>
            </button>

            <button className="nav-item">
              ℹ️
              <span>About</span>
            </button>

          </nav>

          <div className="sidebar-bottom">

            <p>
              For Inclusive
              <br />
              Education & Empowered
              <br />
              Communities
            </p>

            <span>❤️</span>

            <button
              className="theme-toggle"
              onClick={() =>
                setDarkMode(
                  (current) => !current
                )
              }
            >
              {darkMode
                ? "☀️ Light Mode"
                : "🌙 Dark Mode"}
            </button>

          </div>

        </aside>

        <main className="main">

          <header className="top-header">

            <div>
              <h2>
                JoharBoli{" "}
                <span>Phrasebook</span>
              </h2>

              <p>
                Learn&nbsp; • &nbsp;
                Speak&nbsp; • &nbsp;
                Practice&nbsp; • &nbsp;
                Preserve
              </p>
            </div>

            <div className="offline-badge">
              📖 Language Library
            </div>

          </header>

          <section className="phrasebook-page">

            <button
              className="back-button"
              onClick={() =>
                setPage("translator")
              }
            >
              ← Back to Translator
            </button>

            <div className="phrasebook-title">
              <h1>
                📖 Hindi → Santhali
              </h1>

              <p>
                Common words and sentences
                for learning and everyday
                communication.
              </p>
            </div>

            <section
              style={{
                marginBottom: "28px",
                padding: "22px",
                borderRadius: "18px",
                background: darkMode ? "#163b35" : "#f0f8f4",
                border: darkMode ? "1px solid #2d5a52" : "1px solid #d6ebe2",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ margin: 0 }}>⚡ Quick Speak</h2>
                  <p style={{ margin: "6px 0 0", opacity: 0.75 }}>Common English words and sentences with fast replay.</p>
                </div>
                <span style={{ fontWeight: 700, fontSize: "12px", letterSpacing: "0.08em" }}>20 QUICK PHRASES</span>
              </div>

              <h3 style={{ margin: "12px 0" }}>10 Common Words</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                {quickSpeakWords.map((item) => (
                  <div key={item.english} style={{ padding: "14px", borderRadius: "14px", background: darkMode ? "#204941" : "#ffffff" }}>
                    <strong>{item.english}</strong>
                    <div className="phrase-santhali" style={{ margin: "8px 0" }}>🌿 {item.santhali}</div>
                    <button onClick={() => speakQuick(item.santhali)}>🔊 Speak</button>
                  </div>
                ))}
              </div>

              <h3 style={{ margin: "24px 0 12px" }}>10 Common Sentences</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
                {quickSpeakSentences.map((item) => (
                  <div key={item.english} style={{ padding: "14px", borderRadius: "14px", background: darkMode ? "#204941" : "#ffffff" }}>
                    <strong>{item.english}</strong>
                    <div className="phrase-santhali" style={{ margin: "8px 0" }}>🌿 {item.santhali}</div>
                    <button onClick={() => speakQuick(item.santhali)}>🔊 Speak</button>
                  </div>
                ))}
              </div>

              <h3 style={{ margin: "24px 0 12px" }}>🔤 Learn Letters</h3>
              <p style={{ marginTop: 0, opacity: 0.75 }}>English → Hindi → Santhali (Ol Chiki)</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: "10px" }}>
                {letterLearning.map(([english, hindi, santhali, sound]) => (
                  <div key={english} style={{ padding: "12px", borderRadius: "14px", background: darkMode ? "#204941" : "#ffffff" }}>
                    <div style={{ fontSize: "22px", fontWeight: 800 }}>{english}</div>
                    <div>{hindi}</div>
                    <div className="phrase-santhali" style={{ fontSize: "20px", margin: "6px 0" }}>{santhali}</div>
                    <small>{sound}</small>
                    <br />
                    <button disabled={santhali === "—"} onClick={() => speakQuick(santhali)} style={{ marginTop: "8px" }}>🔊 Hear</button>
                  </div>
                ))}
              </div>
              <p style={{ marginBottom: 0, marginTop: "14px", fontSize: "13px", opacity: 0.7 }}>Note: Ol Chiki does not have a one-to-one English A–Z equivalent. “—” means there is no single Ol Chiki letter for that sound.</p>
            </section>

            <input
              className="phrase-search"
              type="text"
              value={phraseSearch}
              onChange={(e) =>
                setPhraseSearch(
                  e.target.value
                )
              }
              placeholder="🔍 Search a word or sentence..."
            />

            <div className="category-buttons">

              {categories.map(
                (category) => (
                  <button
                    key={category}
                    className={
                      phraseCategory ===
                      category
                        ? "category active"
                        : "category"
                    }
                    onClick={() =>
                      setPhraseCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>
                )
              )}

            </div>

            <div className="phrase-grid">

              {filteredPhrases.map(
                (item, index) => (
                  <div
                    className="phrase-card"
                    key={index}
                  >

                    <span className="phrase-category">
                      {item.category}
                    </span>

                    <h3>
                      🇮🇳 {item.hindi}
                    </h3>

                    <p className="phrase-santhali">
                      🌿 {item.santhali}
                    </p>

                    <div className="phrase-actions">

                      <button
                        onClick={() =>
                          speakPhrase(
                            item.santhali
                          )
                        }
                      >
                        🔊 Santhali
                      </button>

                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(
                            item.santhali
                          )
                        }
                      >
                        📋 Copy
                      </button>

                    </div>

                  </div>
                )
              )}

            </div>

            {filteredPhrases.length ===
              0 && (
              <div className="no-phrases">
                No phrases found.
              </div>
            )}

          </section>

          <footer>
            JoharBoli &nbsp; | &nbsp;
            Built for People, Powered by AI,
            Rooted in India ❤️
          </footer>

        </main>
      </div>
    );
  }

  /* =====================================================
     TRANSLATOR PAGE
  ===================================================== */

  return (
    <div
      className={`app ${
        darkMode ? "dark-mode" : ""
      }`}
    >

      <aside className="sidebar">

        <div className="brand">

          <div className="brand-icon">
            🌿
          </div>

          <h1>
            Johar<span>Boli</span>
          </h1>

          <p>
            Bridging Languages
            <br />
            Building Futures
          </p>

        </div>

        <nav>

          <button className="nav-item active">
            🏠
            <span>Translator</span>
          </button>

          <button
            className="nav-item"
            onClick={
              generateWorksheet
            }
          >
            📄
            <span>Worksheet</span>
          </button>

          <button
            className="nav-item"
            onClick={() =>
              setPage("phrasebook")
            }
          >
            📖
            <span>Phrasebook</span>
          </button>

          <button className="nav-item">
            ⬇️
            <span>Offline Mode</span>
          </button>

          <button className="nav-item">
            ℹ️
            <span>About</span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <p>
            For Inclusive
            <br />
            Education & Empowered
            <br />
            Communities
          </p>

          <span>❤️</span>

          <button
            className="theme-toggle"
            onClick={() =>
              setDarkMode(
                (current) => !current
              )
            }
          >
            {darkMode
              ? "☀️ Light Mode"
              : "🌙 Dark Mode"}
          </button>

        </div>

      </aside>

      <main className="main">

        <header className="top-header">

          <div>

            <h2>
              Welcome to{" "}
              <span>JoharBoli</span>
            </h2>

            <p>
              Translate&nbsp; • &nbsp;
              Speak&nbsp; • &nbsp;
              Learn&nbsp; • &nbsp;
              Empower
            </p>

          </div>

          <div className="offline-badge">
            🟢 Offline Ready
          </div>

        </header>

        <section className="translator-layout">

          <div className="translator-card">

            <div className="tabs">

              <button className="tab active">
                📝 Text Translation
              </button>

              <button className="tab">
                🎙️ Voice Translation
              </button>

              <button className="tab">
                🖼️ Image Translation
              </button>

            </div>

            <div className="language-selectors">

              <div className="language-field">

                <label>
                  From{" "}
                  <span>
                    (Source Language)
                  </span>
                </label>

                <select
                  value={sourceLanguage}
                  onChange={(e) => {
                    setSourceLanguage(
                      e.target.value
                    );
                    setResult(null);
                  }}
                >
                  <option>Hindi</option>
                  <option>English</option>
                  <option>Marathi</option>
                  <option>Santhali</option>
                </select>

              </div>

              <button
                className="swap"
                onClick={
                  swapLanguages
                }
              >
                ⇄
              </button>

              <div className="language-field">

                <label>
                  To{" "}
                  <span>
                    (Target Language)
                  </span>
                </label>

                <select
                  value={targetLanguage}
                  onChange={(e) => {
                    setTargetLanguage(
                      e.target.value
                    );
                    setResult(null);
                  }}
                >
                  <option>Santhali</option>
                  <option>Hindi</option>
                  <option>English</option>
                  <option>Marathi</option>
                </select>

              </div>

            </div>

            <div className="input-area">

              <textarea
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                }}
                placeholder={`Enter ${sourceLanguage} text...`}
                maxLength={500}
              />

              <div className="input-actions">

                <button
                  type="button"
                  onClick={
                    clearText
                  }
                  className="clear-small"
                >
                  ✕
                </button>

                <span>
                  {text.length}/500
                </span>

              </div>

            </div>

            <div className="examples">

              <button
                type="button"
                onClick={() =>
                  useExample(
                    "नमस्ते"
                  )
                }
              >
                Example: नमस्ते
              </button>

              <button
                type="button"
                onClick={() =>
                  useExample(
                    "मेरा नाम मृणाल है"
                  )
                }
              >
                Example: मेरा नाम...
              </button>

              <button
                type="button"
                onClick={() =>
                  useExample(
                    "यह क्या है?"
                  )
                }
              >
                Example: यह क्या है?
              </button>

            </div>

            <button
              type="button"
              className={
                isListening
                  ? "voice-input listening"
                  : "voice-input"
              }
              onClick={
                startVoiceInput
              }
            >
              {isListening
                ? "🎙️ Listening..."
                : "🎤 Speak"}
            </button>

            <button
              type="button"
              className="translate-main"
              onClick={translate}
              disabled={loading}
            >
              {loading
                ? "⏳ Translating..."
                : "文A  Translate"}
            </button>

          </div>

          <aside className="info-card">

            <div className="info-illustration">

              <div className="sun">
                ☀️
              </div>

              <div className="mountains">
                🏔️
              </div>

              <div className="houses">
                🏠 🛖
              </div>

            </div>

            <div className="quote">

              <strong>
                “भाषा जोड़ती है,
                <br />
                ज़िंदगी बदलती है।”
              </strong>

              <p>
                Language connects,
                <br />
                lives transform.
              </p>

            </div>

            <div className="feature-list">

              <div>
                <span>🌿</span>
                Preserve Tribal Languages
              </div>

              <div>
                <span>🎓</span>
                Support Inclusive Education
              </div>

              <div>
                <span>📡</span>
                Enable Offline Access
              </div>

              <div>
                <span>🤝</span>
                Empower Communities
              </div>

            </div>

          </aside>

        </section>

        <section className="result-section">

          <div className="result-header">

            <h2>
              📄 Translation Result
            </h2>

            {result &&
              !result.error && (
                <span className="speech-ready">
                  ● Speech ready
                </span>
              )}

          </div>

          {!result && (
            <div className="empty-result">
              Your translation will
              appear here.
            </div>
          )}

          {result?.error && (
            <div className="error-box">
              ❌ {result.error}
            </div>
          )}

          {result &&
            !result.error && (
              <div className="translation-result">

                <div className="result-box">

                  <div className="result-label">
                    🇮🇳 {sourceLanguage}
                    <span>
                      (Original)
                    </span>
                  </div>

                  <p>
                    {result.text}
                  </p>

                </div>

                <div className="result-arrow">
                  ⇄
                </div>

                <div className="result-box">

                  <div className="result-label">
                    🌿 {targetLanguage}
                    <span>
                      (Translation)
                    </span>
                  </div>

                  <p className="santhali-text">
                    {result.translation}
                  </p>

                </div>

              </div>
            )}

          {result &&
            !result.error && (
              <div className="result-actions">

                <button
                  type="button"
                  onClick={
                    isSpeaking
                      ? stopSpeaking
                      : speakTranslation
                  }
                >
                  🔊{" "}
                  {isSpeaking
                    ? "Stop"
                    : "Speak Translation"}
                </button>

                <button
                  type="button"
                  onClick={
                    copyTranslation
                  }
                >
                  📋 Copy
                </button>

                <button
                  type="button"
                  onClick={
                    saveTranslation
                  }
                >
                  ⬇️ Save
                </button>

              </div>
            )}

        </section>

        <section className="quick-actions">

          <button
            className="quick-card worksheet"
            onClick={
              generateWorksheet
            }
          >

            <div className="quick-icon">
              📄
            </div>

            <div>
              <h3>
                Generate Worksheet
              </h3>

              <p>
                Create bilingual
                worksheets for learning
              </p>
            </div>

            <strong>›</strong>

          </button>

          <button
            className="quick-card phrasebook"
            onClick={() =>
              setPage("phrasebook")
            }
          >

            <div className="quick-icon">
              📖
            </div>

            <div>
              <h3>
                View Phrasebook
              </h3>

              <p>
                Common words and sentences
              </p>
            </div>

            <strong>›</strong>

          </button>

          <button className="quick-card offline">

            <div className="quick-icon">
              ⬇️
            </div>

            <div>
              <h3>
                Download for Offline Use
              </h3>

              <p>
                Use the app without internet
              </p>
            </div>

            <strong>›</strong>

          </button>

        </section>

        <footer>
          JoharBoli &nbsp; | &nbsp;
          Built for People,
          Rooted in India ❤️
        </footer>

      </main>

    </div>
  );
}

export default App;