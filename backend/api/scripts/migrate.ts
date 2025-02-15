import { query, closeDB } from "../src/db";

async function main() {
  try {
    await query(`
      -- First drop existing triggers
      DROP TRIGGER IF EXISTS update_decks_last_modified ON decks;
      DROP TRIGGER IF EXISTS update_wordpairs_last_modified ON wordpairs;
      
      -- Drop function
      DROP FUNCTION IF EXISTS update_last_modified();
      
      -- Drop tables (order matters due to foreign key constraints)
      DROP TABLE IF EXISTS wordpairs;
      DROP TABLE IF EXISTS decks;

      CREATE TABLE IF NOT EXISTS decks (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        language_from TEXT NOT NULL,
        language_to TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS wordpairs (
        id SERIAL PRIMARY KEY,
        deck_id INTEGER NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
        word_original TEXT NOT NULL,
        word_translation TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create triggers to automatically update last_modified
      CREATE OR REPLACE FUNCTION update_last_modified()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.last_modified = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';

      CREATE TRIGGER update_decks_last_modified
          BEFORE UPDATE ON decks
          FOR EACH ROW
          EXECUTE FUNCTION update_last_modified();

      CREATE TRIGGER update_wordpairs_last_modified
          BEFORE UPDATE ON wordpairs
          FOR EACH ROW
          EXECUTE FUNCTION update_last_modified();
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