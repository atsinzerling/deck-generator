import { Deck, WordPair } from "./deck";
import * as Endpoints from "./endpoints";

export interface APIError {
  message: string;
  status: number;
}

// Re-export endpoint types for easier imports
export type {
  Endpoints.GenerateDeckRequest,
  Endpoints.GenerateDeckResponse,
  Endpoints.RefineDeckRequest,
  Endpoints.RefineDeckResponse,
  Endpoints.GetAllDecksResponse,
  Endpoints.GetDeckWordpairsResponse,
  Endpoints.CreateDeckRequest,
  Endpoints.CreateDeckResponse,
  Endpoints.UpdateDeckRequest,
  Endpoints.UpdateDeckResponse,
};

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