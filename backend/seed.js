const db = require("./database");

const translations = [
  {
    key: "welcome",
    english: "Welcome",
    marathi: "स्वागत आहे",
    santhali: "ᱥᱚᱜᱟᱛ"
  },
  {
    key: "hello",
    english: "Hello",
    marathi: "नमस्कार",
    santhali: "ᱡᱚᱦᱟᱨ"
  },
  {
    key: "home",
    english: "Home",
    marathi: "मुख्यपृष्ठ",
    santhali: "ᱚᱲᱟᱜ"
  },
  {
    key: "thank_you",
    english: "Thank you",
    marathi: "धन्यवाद",
    santhali: "ᱥᱟᱨᱦᱟᱣ"
  },
  {
    key: "yes",
    english: "Yes",
    marathi: "होय",
    santhali: "ᱦᱚᱸ"
  },
  {
    key: "no",
    english: "No",
    marathi: "नाही",
    santhali: "ᱵᱟᱝ"
  },
  {
    key: "good_morning",
    english: "Good morning",
    marathi: "शुभ प्रभात",
    santhali: "ᱥᱟᱹᱜᱩᱱ ᱥᱮᱛᱟᱜ"
  },
  {
    key: "good_night",
    english: "Good night",
    marathi: "शुभ रात्री",
    santhali: "ᱥᱟᱹᱜᱩᱱ ᱧᱤᱫᱟᱹ"
  },
  {
    key: "please",
    english: "Please",
    marathi: "कृपया",
    santhali: "ᱫᱟᱭᱟ ᱠᱟᱛᱮ"
  },
  {
    key: "what_is_your_name",
    english: "What is your name?",
    marathi: "तुमचे नाव काय आहे?",
    santhali: "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?"
  }
];

const stmt = db.prepare(`
  INSERT OR REPLACE INTO translations
  (key, english, marathi, santhali)
  VALUES (?, ?, ?, ?)
`);

translations.forEach((item) => {
  stmt.run(
    item.key,
    item.english,
    item.marathi,
    item.santhali
  );
});

stmt.finalize(() => {
  console.log("Translation data inserted successfully.");
  db.close();
});