import {
  DeckCreateInput,
  DeckUpdateInput,
  DeckOptionalReturn,
  WordPairInput,
  WordPairEntity,
  DeckSummaryOptionalReturn,
  WordPairUpdateInput,
  LLMDeck,
  GenerateDeckRequest,
  RefineDeckRequest,
  DeckSummary
} from '../types/decks';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

// Define an interface for structured error returned from the backend
export interface ApiError {
  error: string;
  errorType?: string;
}

// Now allow the error prop to be either a string or ApiError object.
export interface ApiResponse<T> {
  data?: T;
  error?: string | ApiError;
}

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    // If the response has a 204 status (No Content) or no content at all, return an empty object.
    if (response.status === 204) {
      return { data: {} as T };
    }

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
      return { error: data || `API request failed: ${response.statusText}` };
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Deck-related API functions
export const api = {
  decks: {
    getAllDecks: () => apiRequest<DeckSummary[]>('/api/decks'),
    getDeckById: (deckId: number, includeWordpairs?: boolean) => 
      apiRequest<DeckSummaryOptionalReturn>(`/api/decks/${deckId}${includeWordpairs ? '?includeWordpairs=true' : ''}`),
    createDeck: (deck: DeckCreateInput) => apiRequest<DeckOptionalReturn>('/api/decks', {
      method: 'POST',
      body: JSON.stringify(deck),
    }),
    updateDeck: (deck: DeckUpdateInput) => apiRequest<DeckOptionalReturn>(`/api/decks/${deck.id}`, {
      method: 'PUT',
      body: JSON.stringify(deck),
    }),
    deleteDeck: (deckId: number) => apiRequest<void>(`/api/decks/${deckId}`, {
      method: 'DELETE',
    }),

    getWordpairs: (deckId: number) => apiRequest<WordPairEntity[]>(`/api/decks/${deckId}/wordpairs`),
    createWordpairs: (deckId: number, wordpairs: WordPairInput[]) => apiRequest<WordPairEntity[]>(`/api/decks/${deckId}/wordpairs`, {
      method: 'POST',
      body: JSON.stringify(wordpairs),
    }),
    updateWordpairs: (deckId: number, wordpairs: WordPairUpdateInput[]) => apiRequest<WordPairEntity[]>(`/api/decks/${deckId}/wordpairs`, {
      method: 'PUT',
      body: JSON.stringify(wordpairs),
    }),
    
    generateDeck: (request: GenerateDeckRequest) => apiRequest<LLMDeck>('/api/decks/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
    refineDeck: (request: RefineDeckRequest) => apiRequest<LLMDeck>('/api/decks/refine', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  },
}; 