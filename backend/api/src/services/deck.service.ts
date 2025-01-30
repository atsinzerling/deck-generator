import { query } from '../db';
import { WordPair, Deck } from '../types/deck';
import { 
  CreateDeckRequest,
  CreateDeckResponse,
  UpdateDeckRequest,
  UpdateDeckResponse,
  GetAllDecksResponse,
  GetDeckWordpairsResponse,
  GetDeckByIdResponse,
  GenerateDeckRequest,
  GenerateDeckResponse,
  RefineDeckRequest,
  RefineDeckResponse
} from '../types/api';
import { NotFoundError } from '../errors/NotFoundError';

export class DeckService {
  constructor() {}

  async getAllDecks(): Promise<GetAllDecksResponse[]> {
    const result = await query('SELECT * FROM decks ORDER BY created_at DESC');
    if (result.rows.length === 0) {
      throw new NotFoundError('No decks found');
    }
    return result.rows;
  }

  async getDeckById(deckId: number): Promise<GetDeckByIdResponse> {
    const result = await query('SELECT * FROM decks WHERE id = $1', [deckId]);
    return result.rows[0];
  }

  async getDeckWordpairs(deckId: number): Promise<GetDeckWordpairsResponse[]> {
    const result = await query(
      'SELECT * FROM wordpairs WHERE deck_id = $1 ORDER BY created_at ASC',
      [deckId]
    );
    return result.rows;
  }

  async createDeck(request: CreateDeckRequest): Promise<CreateDeckResponse> {
    const { name, language_from, language_to, wordpairs } = request;
    
    const result = await query(
      'INSERT INTO decks (name, language_from, language_to) VALUES ($1, $2, $3) RETURNING id, name, language_from, language_to',
      [name, language_from, language_to]
    );

    const deck: CreateDeckResponse = result.rows[0];
    
    const insertWordPairText = 'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES ($1, $2, $3)';
    for (const pair of wordpairs) {
      await query(insertWordPairText, [deck.id, pair.word_original, pair.word_translation]);
    }

    return deck;
  }

  async updateDeck(request: UpdateDeckRequest): Promise<UpdateDeckResponse> {
    const { id, name, language_from, language_to, wordpairs } = request;
    
    const result = await query(
      'UPDATE decks SET name = $1, language_from = $2, language_to = $3 WHERE id = $4 RETURNING id, name, language_from, language_to, created_at',
      [name, language_from, language_to, id]
    );

    const updatedDeck: UpdateDeckResponse = result.rows[0];

    await query('DELETE FROM wordpairs WHERE deck_id = $1', [id]);

    const insertWordPairText = 'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES ($1, $2, $3)';
    for (const pair of wordpairs) {
      await query(insertWordPairText, [id, pair.word_original, pair.word_translation]);
      //TODO: handle failed inserts
    }

    return updatedDeck;
  }

  async deleteDeck(id: number): Promise<void> {
    await query('DELETE FROM wordpairs WHERE deck_id = $1', [id]);
    await query('DELETE FROM decks WHERE id = $1', [id]);
  }

  // Additional methods for GenerateDeck and RefineDeck can be added here if needed
} 