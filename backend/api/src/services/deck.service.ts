import { sql, eq, asc, desc } from 'drizzle-orm';
import { db } from '../drizzle/client';
// Import your table schemas – adjust the import path based on your project structure.
import { decks, wordpairs } from '../drizzle/schema';

import { 
  CreateDeckRequest,
  CreateDeckResponse,
  UpdateDeckRequest,
  UpdateDeckResponse,
  GetAllDecksResponse,
  GetDeckWordpairsResponse,
  GetDeckByIdResponse
} from '../types/api';
import { NotFoundError } from '../errors/NotFoundError';

export class DeckService {
  constructor() {}

  async getAllDecks(): Promise<GetAllDecksResponse[]> {
    const decksWithCount = await db
      .select({
        id: sql<number>`id`,
        name: sql<string>`name`,
        languageFrom: sql<string>`language_from`,
        languageTo: sql<string>`language_to`,
        lastModified: sql<string>`last_modified`,
        createdAt: sql<string>`created_at`,
        wordpairCount: sql<number>`wordpair_count`
      })
      .from(sql`deck_with_wordpair_count`)
      .orderBy(desc(sql`last_modified`));

    return decksWithCount;
  }

  async getDeckById(deckId: number): Promise<GetDeckByIdResponse> {
    const deckData = await db
    .select({
      id: sql<number>`id`,
      name: sql<string>`name`,
      languageFrom: sql<string>`language_from`,
      languageTo: sql<string>`language_to`,
      lastModified: sql<string>`last_modified`,
      createdAt: sql<string>`created_at`,
      wordpairCount: sql<number>`wordpair_count`
    })
    .from(sql`deck_with_wordpair_count`)
    .where(eq(sql`id`, deckId))

    if (!deckData[0]) {
      throw new NotFoundError(`Deck with id ${deckId} not found`);
    }
    return deckData[0];
  }

  async getDeckWordpairs(deckId: number): Promise<GetDeckWordpairsResponse[]> {
    const wordPairs = await db
      .select()
      .from(wordpairs)
      .where(eq(wordpairs.deckId, deckId))
      .orderBy(asc(wordpairs.createdAt));

    return wordPairs;
  }

  async createDeck(request: CreateDeckRequest): Promise<CreateDeckResponse> {
    const { name, languageFrom, languageTo, wordpairs: pairs } = request;
    
    // Insert a new deck and return the inserted row
    const insertedDeck = await db
      .insert(decks)
      .values({ name, languageFrom, languageTo })
      .returning();

    if (!insertedDeck[0]) {
      throw new Error('Failed to create deck.');
    }

    const deck = insertedDeck[0];

    // Insert each wordpair for the new deck
    for (const pair of pairs) {
      await db.insert(wordpairs).values({
        deckId: deck.id,
        wordOriginal: pair.wordOriginal,
        wordTranslation: pair.wordTranslation,
      });
    }

    // Since the wordpairs were just inserted, the count is equal to the length of the pairs array.
    const deckWithCount: CreateDeckResponse = {
      ...deck,
      wordpairCount: pairs.length,
    };  
    
    return deckWithCount;
  }

  async updateDeck(request: UpdateDeckRequest): Promise<UpdateDeckResponse> {
    const { id, name, languageFrom, languageTo, wordpairs: pairs } = request;
    
    const updatedDeckRows = await db
      .update(decks)
      .set({ name, languageFrom, languageTo } )
      .where(eq(decks.id, id))
      .returning();

    if (!updatedDeckRows[0]) {
      throw new NotFoundError(`Deck with id ${id} not found`);
    }
    const updatedDeck = updatedDeckRows[0];

    // Remove all existing wordpairs for this deck
    await db.delete(wordpairs).where(eq(wordpairs.deckId, id));

    // Insert new wordpairs for the deck. (Consider adding error handling if needed.)
    for (const pair of pairs) {
      await db.insert(wordpairs).values({
        deckId: id,
        wordOriginal: pair.wordOriginal,
        wordTranslation: pair.wordTranslation,
      });
    }
    const deckWithCount: UpdateDeckResponse = {
      ...updatedDeck,
      wordpairCount: pairs.length,
    };  

    return deckWithCount;
  }

  async deleteDeck(id: number): Promise<void> {
    // Delete wordpairs associated with the deck
    await db.delete(wordpairs).where(eq(wordpairs.deckId, id));
    // Then, delete the deck itself
    await db.delete(decks).where(eq(decks.id, id));
  }

  // Additional methods for GenerateDeck and RefineDeck can be added here if needed
} 