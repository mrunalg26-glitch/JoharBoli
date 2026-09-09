const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const db = require("./database");

const csvPath = path.join(
  __dirname,
  "..",
  "database",
  "vocabulary.csv"
);

console.log("Reading vocabulary.csv...");

const records = [];

fs.createReadStream(csvPath)
  .pipe(
    parse({
      columns: true,
      skip_empty_lines: true,
      trim: true
    })
  )
  .on("data", (row) => {
    records.push(row);
  })
  .on("end", () => {

    console.log(`Found ${records.length} vocabulary entries.`);

    db.serialize(() => {

      db.run(`
        CREATE TABLE IF NOT EXISTS vocabulary (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          english TEXT NOT NULL,
          santhali_devanagari TEXT,
          source TEXT,
          verified TEXT
        )
      `, (err) => {

        if (err) {
          console.error(
            "Table creation failed:",
            err.message
          );
          return;
        }

        console.log("Vocabulary table ready.");

        const stmt = db.prepare(`
          INSERT INTO vocabulary
          (
            english,
            santhali_devanagari,
            source,
            verified
          )
          VALUES (?, ?, ?, ?)
        `);

        let count = 0;

        records.forEach((row) => {

          stmt.run(
            row.english,
            row.santhali_devanagari,
            row.source,
            row.verified,
            (err) => {

              if (err) {
                console.error(
                  "Insert error:",
                  err.message
                );
              } else {
                count++;
              }

            }
          );

        });

        stmt.finalize(() => {

          console.log(
            `Imported ${count} vocabulary entries successfully.`
          );

          db.close(() => {
            console.log("Database connection closed.");
          });

        });

      });

    });

  })
  .on("error", (error) => {

    console.error(
      "CSV reading error:",
      error.message
    );

  });