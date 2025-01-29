import { Deck, WordPair } from "./deck";

export interface APIError {
  message: string;
  status: number;
}

export interface GenerateRequest {
  prompt: string;
}

export interface RefineRequest {
  prompt: string;
  history: string[];
  current_deck: Deck;
}

export interface SaveDeckRequest {
  name: string;
  language_from: string;
  language_to: string;
  wordpairs: WordPair[];
}

export interface UpdateDeckRequest extends SaveDeckRequest {
  id: number;
} 