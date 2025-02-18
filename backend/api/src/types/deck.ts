export interface WordPair {
  id: number;
  deckId: number;
  wordOriginal: string;
  wordTranslation: string;
  createdAt: string;
  lastModified: string;
}

export interface ShortWordPair {
  wordOriginal: string;
  wordTranslation: string;
}

export interface Deck {
  id: number;
  name: string;
  languageFrom: string;
  languageTo: string;
  createdAt: string;
  lastModified: string;
  wordpairCount: number;
}

export interface ShortDeck {
  name: string;
  languageFrom: string;
  languageTo: string;
}

export interface ShortDeckWithWordPairs extends ShortDeck {
	wordpairs: ShortWordPair[];
}