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
  DeckSummary,
  ExtractNameRequest,
  ExtractNameResponse,
} from '../types/decks';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export interface ApiError {
  message: string;
  code: number;
  type?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
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

    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    return data as ApiResponse<T>;
  } catch (error) {
    console.error('API request failed', error);
    return { success: false, error: { message: 'Unknown error', code: 500 } };
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
    extractName: (request: ExtractNameRequest) => apiRequest<ExtractNameResponse>('/api/decks/extract-name', {
      method: 'POST',
      body: JSON.stringify(request),
    }),
  },
}; 