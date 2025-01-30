export interface Deck {
  id: string;
  name: string;
  language_from: string;
  language_to: string;
  created_at: string;
}

export interface DeckWithWordPairs{
	name: string;
	language_from: string;
	language_to: string;
	wordpairs: ShortWordPair[];
}

export interface WordPair {
  id: string;
  deck_id: string;
  word_original: string;
  word_translation: string;
  created_at: string;
}

export interface ShortWordPair {
  word_original: string;
  word_translation: string;
}
