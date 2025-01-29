import { getDB } from "../src/db";

async function main() {
  const db = await getDB();
  
  await db.exec(`
    CREATE TABLE IF NOT EXISTS decks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      language_from TEXT NOT NULL,
      language_to TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wordpairs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deck_id INTEGER NOT NULL,
      word_original TEXT NOT NULL,
      word_translation TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (deck_id) REFERENCES decks(id)
    );
  `);

  console.log('Migration completed successfully');
  process.exit(0);
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
