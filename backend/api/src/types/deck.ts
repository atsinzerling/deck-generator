export interface WordPair {
  word_original: string;
  word_translation: string;
}

export interface Deck {
  id?: number;
  name: string;
  language_from: string;
  language_to: string;
  deck?: WordPair[];
}

export interface GenerateResponse {
  deck_name: string;
  language_from: string;
  language_to: string;
  deck: WordPair[];
} 