const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "SIH26042 Backend is running!"
  });
});


// ======================================================
// TRANSLATIONS API
// ======================================================

app.get("/api/translations", (req, res) => {
  db.all(
    "SELECT * FROM translations",
    [],
    (err, rows) => {
      if (err) {
        console.error(err.message);

        return res.status(500).json({
          error: "Failed to fetch translations"
        });
      }

      res.json(rows);
    }
  );
});


// ======================================================
// VOCABULARY SEARCH
// ======================================================

app.get("/api/vocabulary", (req, res) => {
  const search = (req.query.search || "").trim();

  if (!search) {
    return res.json([]);
  }

  db.all(
    `
    SELECT *
    FROM vocabulary
    WHERE english LIKE ?
    LIMIT 20
    `,
    [`%${search}%`],
    (err, rows) => {
      if (err) {
        console.error(err.message);

        return res.status(500).json({
          error: "Failed to search vocabulary"
        });
      }

      res.json(rows);
    }
  );
});


// ======================================================
// FAST DEMO TRANSLATIONS
// These are returned immediately without AI processing.
// ======================================================

const fastTranslations = {

  // -------------------------------
  // 10 COMMON WORDS
  // -------------------------------

  "hello": "ᱡᱚᱦᱟᱨ",

  "thank you": "ᱥᱟᱹᱨᱦᱟᱣ",

  "water": "ᱫᱟᱜ",

  "school": "ᱥᱠᱩᱞ",

  "book": "ᱯᱩᱛᱷᱤ",

  "home": "ᱚᱲᱟᱜ",

  "child": "ᱠᱩᱲᱤ",

  "help": "ᱜᱚᱲᱚ",

  "name": "ᱧᱩᱛᱩᱢ",

  "good": "ᱵᱮᱥ",


  // -------------------------------
  // 10 COMMON SENTENCES
  // -------------------------------

  "hello.": "ᱡᱚᱦᱟᱨ ᱾",

  "how are you?": "ᱟᱢ ᱥᱮᱞᱮᱫ ᱢᱮᱱᱟᱢᱟ?",

  "my name is mrunal.":
    "ᱤᱧᱟᱹᱜ ᱧᱩᱛᱩᱢ ᱢᱨᱩᱱᱟᱞ ᱠᱟᱱᱟ ᱾",

  "what is your name?":
    "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱚᱠᱟ ᱠᱟᱱᱟ?",

  "thank you.":
    "ᱥᱟᱹᱨᱦᱟᱣ ᱾",

  "please help me.":
    "ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱤᱧ ᱮᱢ ᱜᱚᱲᱚ ᱢᱮ ᱾",

  "what is this?":
    "ᱱᱚᱣᱟ ᱚᱠᱟ ᱠᱟᱱᱟ?",

  "i need water.":
    "ᱤᱧ ᱫᱟᱜ ᱥᱟᱵ ᱢᱮᱱᱟᱜᱼᱟ ᱾",

  "i am going to school.":
    "ᱤᱧ ᱥᱠᱩᱞ ᱥᱮᱫ ᱠᱟᱱᱟᱹᱧ ᱾",

  "this is my home.":
    "ᱱᱚᱣᱟ ᱤᱧᱟᱹᱜ ᱚᱲᱟᱜ ᱠᱟᱱᱟ ᱾"
};


// ======================================================
// TRANSLATE API
// ======================================================

app.post("/api/translate", async (req, res) => {

  const {
    text,
    sourceLanguage,
    targetLanguage
  } = req.body;


  // -------------------------------
  // Validate request
  // -------------------------------

  if (
    !text ||
    !sourceLanguage ||
    !targetLanguage
  ) {
    return res.status(400).json({
      error:
        "Text, source language and target language are required"
    });
  }


  const cleanText = text.trim();

  const normalizedText = cleanText
    .toLowerCase()
    .replace(/\s+/g, " ");


  // -------------------------------
  // Same language
  // -------------------------------

  if (sourceLanguage === targetLanguage) {

    return res.json({
      text: cleanText,
      sourceLanguage,
      targetLanguage,
      translation: cleanText,
      source: "same-language"
    });
  }


  // ==================================================
  // FAST DEMO CACHE
  // ==================================================

  if (
    sourceLanguage === "English" &&
    targetLanguage === "Santhali"
  ) {

    const fastResult =
      fastTranslations[normalizedText];


    if (fastResult) {

      console.log(
        `⚡ Fast translation: ${cleanText}`
      );

      return res.json({
        text: cleanText,
        sourceLanguage,
        targetLanguage,
        translation: fastResult,
        source: "fast-demo"
      });
    }
  }


  // ==================================================
  // DATABASE VOCABULARY
  // ==================================================

  if (
    sourceLanguage === "English" &&
    targetLanguage === "Santhali"
  ) {

    db.get(
      `
      SELECT *
      FROM vocabulary
      WHERE LOWER(TRIM(english)) = LOWER(TRIM(?))
      LIMIT 1
      `,
      [cleanText],

      async (err, row) => {

        if (err) {

          console.error(
            "Vocabulary database error:",
            err.message
          );

          return res.status(500).json({
            error: "Vocabulary database error"
          });
        }


        // -------------------------------
        // Vocabulary result
        // -------------------------------

        if (row) {

          console.log(
            `📚 Vocabulary translation: ${cleanText}`
          );

          return res.json({
            text: cleanText,
            sourceLanguage,
            targetLanguage,
            translation: row.santhali_devanagari,
            source: "vocabulary"
          });
        }


        // -------------------------------
        // AI fallback
        // -------------------------------

        try {

          console.log(
            `🤖 AI translation: ${cleanText}`
          );

          const response = await fetch(
            "http://127.0.0.1:5001/translate",
            {
              method: "POST",

              headers: {
                "Content-Type": "application/json"
              },

              body: JSON.stringify({
                text: cleanText,
                sourceLanguage,
                targetLanguage
              })
            }
          );


          const data =
            await response.json();


          if (!response.ok) {

            return res
              .status(response.status)
              .json(data);
          }


          return res.json({
            ...data,
            source: "AI"
          });

        } catch (error) {

          console.error(
            "Python translator error:",
            error.message
          );

          return res.status(500).json({
            error:
              "Could not connect to translation engine"
          });
        }
      }
    );

    return;
  }


  // ==================================================
  // ALL OTHER LANGUAGE COMBINATIONS
  // ==================================================

  try {

    const response = await fetch(
      "http://127.0.0.1:5001/translate",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          text: cleanText,
          sourceLanguage,
          targetLanguage
        })
      }
    );


    const data =
      await response.json();


    if (!response.ok) {

      return res
        .status(response.status)
        .json(data);
    }


    res.json({
      ...data,
      source: "AI"
    });

  } catch (error) {

    console.error(
      "Python translator error:",
      error.message
    );

    res.status(500).json({
      error:
        "Could not connect to translation engine"
    });
  }
});


// ======================================================
// START SERVER
// ======================================================

module.exports = app;