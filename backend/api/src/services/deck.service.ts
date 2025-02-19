import { sql, eq, asc, desc, and, notInArray as notIn } from 'drizzle-orm';

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

// Use the new deck/wordpair types from deck2.ts
import {
  DeckCreateInput,
  DeckUpdateInput,
  DeckOptionalReturn,
  WordPairInput,
  WordPairEntity,
  WordPairSummary,
  WordPairUpdateInput,
  DeckEntity,
  DeckDetail,
  DeckSummary,
  DeckSummaryOptionalReturn
} from '../types/deck2';

export class DeckService {
  constructor() {}

  async getAllDecks(): Promise<DeckSummary[]> {
    // This method remains using your view for wordpair counts.
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

  async getDeckById(
    deckId: number,
    includeWordpairs?: boolean
  ): Promise<DeckSummaryOptionalReturn> {
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
      .where(eq(sql`id`, deckId));

    if (!deckData[0]) {
      throw new NotFoundError(`Deck with id ${deckId} not found`);
    }
    const deck = deckData[0];
    if (includeWordpairs) {
      const wordpairs = await this.getDeckWordpairs(deckId);
      return { ...deck, wordpairCount: wordpairs.length, wordpairs: wordpairs };
    }
    return deck;
  }

  async getDeckWordpairs(deckId: number): Promise<WordPairEntity[]> {
    const wordPairs = await db
      .select()
      .from(wordpairs)
      .where(eq(wordpairs.deckId, deckId))
      .orderBy(asc(wordpairs.lastModified));

    return wordPairs;
  }

  /**
   * Create a new deck.
   * If the optional wordpairs are provided in the input, the helper
   * `insertWordpairs` is used in bulk and the returned deck object includes
   * the inserted wordpairs (DeckDetail-like).
   * If wordpairs are not provided, only the deck metadata is returned.
   */
  async createDeck(request: DeckCreateInput): Promise<DeckOptionalReturn> {
    const { name, languageFrom, languageTo, wordpairs: pairs } = request;

    // Insert a new deck and return the inserted row.
    const insertedDeck = await db
      .insert(decks)
      .values({ name, languageFrom, languageTo })
      .returning();

    if (!insertedDeck[0]) {
      throw new Error('Failed to create deck.');
    }

    const deck = insertedDeck[0];

    if (pairs && pairs.length > 0) {
      // Insert wordpairs in bulk.
      const insertedWordpairs: WordPairEntity[] = await this.insertWordpairs(deck.id, pairs);
      return { ...deck, wordpairCount: insertedWordpairs.length, wordpairs: insertedWordpairs };
    }

    return deck;
  }

  /**
   * Updates the deck metadata.
   * If the optional wordpairs field is provided, the helper function `syncWordpairs`
   * is used to synchronize the wordpairs for the given deck.
   * The response contains either just the updated deck metadata, or additionally
   * the wordpairs list and its count.
   */
  async updateDeck(request: DeckUpdateInput): Promise<DeckOptionalReturn> {
    const { id, name, languageFrom, languageTo, wordpairs: pairs } = request;

    const updatedDeckRows = await db
      .update(decks)
      .set({ name, languageFrom, languageTo })
      .where(eq(decks.id, id))
      .returning();

    if (!updatedDeckRows[0]) {
      throw new NotFoundError(`Deck with id ${id} not found`);
    }
    const updatedDeck = updatedDeckRows[0];

    if (pairs) {
      const updatedWordpairs = await this.syncWordpairs(id, pairs);
      return { ...updatedDeck, wordpairCount: updatedWordpairs.length, wordpairs: updatedWordpairs };
    }

    return updatedDeck;
  }

  async deleteDeck(id: number): Promise<void> {
    // Delete wordpairs associated with the deck.
    await db.delete(wordpairs).where(eq(wordpairs.deckId, id));
    // Then, delete the deck itself.
    await db.delete(decks).where(eq(decks.id, id));
  }

  /**
   * Helper method to insert wordpairs in bulk.
   * Given a deckId and an array of wordpairs (without ids), bulk insert and return the inserted records.
   */
  private async insertWordpairs(deckId: number, pairs: WordPairInput[]): Promise<WordPairEntity[]> {
    const insertedWordpairs = await db.insert(wordpairs)
      .values(
        pairs.map((pair) => ({
          deckId,
          wordOriginal: pair.wordOriginal,
          wordTranslation: pair.wordTranslation,
        }))
      )
      .returning();
    return insertedWordpairs;
  }

  /**
   * Helper method to synchronize wordpairs for a deck.
   * This function will ensure that:
   *  - If an empty array is provided, all wordpairs for the deck are deleted.
   *  - For pairs with an existing 'id', they are updated (upserted).
   *  - New pairs (without an 'id') are inserted.
   *
   * The function expects the pairs to be an array of objects that extend WordPairInput with an optional 'id' field.
   */
  private async syncWordpairs(deckId: number, pairs: WordPairUpdateInput[]): Promise<WordPairEntity[]> {
    await db.transaction(async (tx) => {
      if (pairs.length === 0) {
        // No pairs provided: delete all wordpairs for the deck.
        await tx.delete(wordpairs).where(eq(wordpairs.deckId, deckId));
        return;
      }

      // Separate provided wordpairs into those with an existing id and new ones.
      const existingPairs = pairs.filter(pair => pair.id !== undefined);
      const newPairs = pairs.filter(pair => pair.id === undefined);
      const existingIds = existingPairs.map(pair => pair.id!);

      if (existingIds.length > 0) {
        // Delete wordpairs for this deck that are not part of the existing provided pairs.
        await tx.delete(wordpairs).where(
          and(
            eq(wordpairs.deckId, deckId),
            notIn(wordpairs.id, existingIds)
          )
        );
      } else {
        // If there are no existing pairs in the provided payload, delete all for the deck.
        await tx.delete(wordpairs).where(eq(wordpairs.deckId, deckId));
      }

      if (existingPairs.length > 0) {
        // Upsert existing pairs.
        await tx.insert(wordpairs)
          .values(
            existingPairs.map(pair => ({
              id: pair.id,
              deckId,
              wordOriginal: pair.wordOriginal,
              wordTranslation: pair.wordTranslation,
            }))
          )
          .onConflictDoUpdate({
            target: [wordpairs.id],
            set: {
              wordOriginal: wordpairs.wordOriginal,
              wordTranslation: wordpairs.wordTranslation,
            },
          });
      }

      if (newPairs.length > 0) {
        // Insert new pairs.
        await tx.insert(wordpairs)
          .values(
            newPairs.map(pair => ({
              deckId,
              wordOriginal: pair.wordOriginal,
              wordTranslation: pair.wordTranslation,
            }))
          );
      }
    });
    const updatedWordpairs = await db
      .select()
      .from(wordpairs)
      .where(eq(wordpairs.deckId, deckId))
      .orderBy(asc(wordpairs.lastModified));
    return updatedWordpairs;
  }

  /**
   * Public method to create new wordpairs for a given deck.
   */
  public async createWordpairs(deckId: number, pairs: WordPairInput[]): Promise<WordPairEntity[]> {
    return this.insertWordpairs(deckId, pairs);
  }

  /**
   * Public method to update (sync) wordpairs for a given deck.
   * It calls the syncWordpairs helper and then returns the updated list.
   */
  public async updateWordpairs(deckId: number, pairs: WordPairUpdateInput[]): Promise<WordPairEntity[]> {
    return this.syncWordpairs(deckId, pairs);
  }

  /**
   * Public method to delete all wordpairs for a given deck.
   */
  public async deleteWordpairs(deckId: number): Promise<void> {
    await db.delete(wordpairs).where(eq(wordpairs.deckId, deckId));
  }
} 