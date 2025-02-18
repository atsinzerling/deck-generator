import { db, closeDB } from "../src/drizzle/client";
import { decks, wordpairs } from "../src/drizzle/schema";

async function main() {
  try {
    // Insert a sample deck using drizzle and get the inserted row(s)
    const insertedDeck = await db
      .insert(decks)
      .values({
        name: "Basic Greetings",
        languageFrom: "English",
        languageTo: "Spanish",
      })
      .returning();

    if (!insertedDeck[0]) {
      throw new Error("Failed to insert deck");
    }
    
    const deckId = insertedDeck[0].id;

    // Sample word pairs
    const samplePairs: [string, string][] = [
      ["Hello", "Hola"],
      ["Good morning", "Buenos días"],
      ["Good night", "Buenas noches"],
      ["Thank you", "Gracias"],
    ];

    // Insert each wordpair into the wordpairs table for the given deck
    for (const [wordOriginal, wordTranslation] of samplePairs) {
      await db.insert(wordpairs).values({
        deckId,
        wordOriginal,
        wordTranslation,
      });
    }

    console.log("Seed completed successfully");
  } finally {
    await closeDB();
  }
}

main().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
