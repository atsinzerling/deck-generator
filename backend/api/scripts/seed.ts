import { getDB } from "../src/db";

async function main() {
  const db = await getDB();

  // Sample deck
  const result = await db.run(`
    INSERT INTO decks (name, language_from, language_to)
    VALUES ('Basic Greetings', 'English', 'Spanish')
  `);

  const deckId = result.lastID;

  // Sample word pairs
  const samplePairs = [
    ['Hello', 'Hola'],
    ['Good morning', 'Buenos días'],
    ['Good night', 'Buenas noches'],
    ['Thank you', 'Gracias'],
  ];

  for (const [original, translation] of samplePairs) {
    await db.run(`
      INSERT INTO wordpairs (deck_id, word_original, word_translation)
      VALUES (?, ?, ?)
    `, [deckId, original, translation]);
  }

  console.log('Seed completed successfully');
  process.exit(0);
}

main().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
