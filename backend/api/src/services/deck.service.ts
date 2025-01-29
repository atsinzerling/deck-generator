import { Database } from 'sqlite';
import { WordPair } from '../types/deck';
import { SaveDeckRequest, UpdateDeckRequest } from '../types/api';

export class DeckService {
  constructor(private db: Database) {}

  async getAllDecks() {
    return this.db.all('SELECT * FROM decks ORDER BY created_at DESC');
  }

  async getDeckWordpairs(deckId: number) {
    return this.db.all(
      'SELECT * FROM wordpairs WHERE deck_id = ? ORDER BY created_at ASC',
      [deckId]
    );
  }

  async createDeck(request: SaveDeckRequest) {
    const { name, language_from, language_to, wordpairs } = request;
    
    const result = await this.db.run(
      'INSERT INTO decks (name, language_from, language_to) VALUES (?, ?, ?)',
      [name, language_from, language_to]
    );

    const deckId = result.lastID!;
    
    for (const pair of wordpairs) {
      await this.db.run(
        'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES (?, ?, ?)',
        [deckId, pair.word_original, pair.word_translation]
      );
    }

    return { id: deckId, name, language_from, language_to, wordpairs };
  }

  async updateDeck(request: UpdateDeckRequest) {
    const { id, name, language_from, language_to, wordpairs } = request;
    
    await this.db.run(
      'UPDATE decks SET name = ?, language_from = ?, language_to = ? WHERE id = ?',
      [name, language_from, language_to, id]
    );

    await this.db.run('DELETE FROM wordpairs WHERE deck_id = ?', [id]);

    for (const pair of wordpairs) {
      await this.db.run(
        'INSERT INTO wordpairs (deck_id, word_original, word_translation) VALUES (?, ?, ?)',
        [id, pair.word_original, pair.word_translation]
      );
    }

    return { id, name, language_from, language_to, wordpairs };
  }

  async deleteDeck(id: number) {
    await this.db.run('DELETE FROM wordpairs WHERE deck_id = ?', [id]);
    await this.db.run('DELETE FROM decks WHERE id = ?', [id]);
  }
} 