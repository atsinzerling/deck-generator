import { query, closeDB } from "../src/db";

async function main() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS decks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        language_from TEXT NOT NULL,
        language_to TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wordpairs (
        id SERIAL PRIMARY KEY,
        deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        word_original TEXT NOT NULL,
        word_translation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Migration completed successfully');
  } finally {
    await closeDB();
  }
}

main().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
}); 