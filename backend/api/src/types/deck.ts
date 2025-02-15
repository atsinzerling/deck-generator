export interface WordPair {
  id: string;
  deck_id: string;
  word_original: string;
  word_translation: string;
  created_at: string;
  last_modified: string;
}

export interface ShortWordPair {
  word_original: string;
  word_translation: string;
}

export interface Deck {
  id: string;
  name: string;
  language_from: string;
  language_to: string;
  created_at: string;
  last_modified: string;
  wordpair_count: number;
}

export interface ShortDeck {
  name: string;
  language_from: string;
  language_to: string;
}

export interface ShortDeckWithWordPairs extends ShortDeck {
	wordpairs: ShortWordPair[];
}