import { query, closeDB } from "../src/db";

async function main() {
  try {
    // Sample deck
    const deckResult = await query(`
      INSERT INTO decks (name, language_from, language_to)
      VALUES ($1, $2, $3)
      RETURNING id, name, language_from, language_to, created_at, last_modified
    `, ['Basic Greetings', 'English', 'Spanish']);

    const deckId = deckResult.rows[0].id;

    // Sample word pairs
    const samplePairs = [
      ['Hello', 'Hola'],
      ['Good morning', 'Buenos días'],
      ['Good night', 'Buenas noches'],
      ['Thank you', 'Gracias'],
    ];

    const insertWordPairText = 'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES ($1, $2, $3)';
    for (const [original, translation] of samplePairs) {
      await query(insertWordPairText, [deckId, original, translation]);
    }

    console.log('Seed completed successfully');
  } finally {
    await closeDB();
  }
}

main().catch(error => {
  console.error('Seed failed:', error);
  process.exit(1);
});
