import { query } from '../db';
import { WordPair } from '../types/deck';
import { SaveDeckRequest, UpdateDeckRequest } from '../types/api';

export class DeckService {
  constructor() {}

  async getAllDecks() {
    const result = await query('SELECT * FROM decks ORDER BY created_at DESC');
    return result.rows;
  }

  async getDeckWordpairs(deckId: number) {
    const result = await query(
      'SELECT * FROM wordpairs WHERE deck_id = $1 ORDER BY created_at ASC',
      [deckId]
    );
    return result.rows;
  }

  async createDeck(request: SaveDeckRequest) {
    const { name, language_from, language_to, wordpairs } = request;
    
    const result = await query(
      'INSERT INTO decks (name, language_from, language_to) VALUES ($1, $2, $3) RETURNING id',
      [name, language_from, language_to]
    );

    const deckId = result.rows[0].id;
    
    const insertWordPairText = 'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES ($1, $2, $3)';
    for (const pair of wordpairs) {
      await query(insertWordPairText, [deckId, pair.word_original, pair.word_translation]);
    }

    return { id: deckId, name, language_from, language_to, wordpairs };
  }

  async updateDeck(request: UpdateDeckRequest) {
    const { id, name, language_from, language_to, wordpairs } = request;
    
    await query(
      'UPDATE decks SET name = $1, language_from = $2, language_to = $3 WHERE id = $4',
      [name, language_from, language_to, id]
    );

    await query('DELETE FROM wordpairs WHERE deck_id = $1', [id]);

    const insertWordPairText = 'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES ($1, $2, $3)';
    for (const pair of wordpairs) {
      await query(insertWordPairText, [id, pair.word_original, pair.word_translation]);
    }

    return { id, name, language_from, language_to, wordpairs };
  }

  async deleteDeck(id: number) {
    await query('DELETE FROM wordpairs WHERE deck_id = $1', [id]);
    await query('DELETE FROM decks WHERE id = $1', [id]);
  }
} 