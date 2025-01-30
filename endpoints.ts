export interface GenerateDeckRequest {
  prompt: string;
}

export interface GenerateDeckResponse {
  name: string;
  language_from: string;
  language_to: string;
  wordpairs: WordPair[];
}

export interface RefineDeckRequest {
  prompt: string;
  history: string[];
  current_deck: Deck;
}

export interface RefineDeckResponse {
  name: string;
  language_from: string;
  language_to: string;
  wordpairs: WordPair[];
}

export interface GetAllDecksResponse {
  id: number;
  name: string;
  language_from: string;
  language_to: string;
  created_at: string; // ISO string
}

export interface GetDeckWordpairsResponse {
  id: number;
  deck_id: number;
  word_original: string;
  word_translation: string;
  created_at: string; // ISO string
}

export interface CreateDeckRequest {
  name: string;
  language_from: string;
  language_to: string;
  wordpairs: WordPair[];
}

export interface CreateDeckResponse {
  id: number;
  name: string;
  language_from: string;
  language_to: string;
}

export interface UpdateDeckRequest {
  id: number;
  name: string;
  language_from: string;
  language_to: string;
  wordpairs: WordPair[];
}

export interface UpdateDeckResponse {
  id: number;
  name: string;
  language_from: string;
  language_to: string;
} 