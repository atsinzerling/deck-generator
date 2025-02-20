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

interface ApiResponse<T> {
  data?: T;
  error?: string;
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

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Deck-related API functions
export const api = {
  decks: {
    getAllDecks: () => apiRequest<DeckSummary[]>('/api/decks'),
    getDeckById: (deckId: string, includeWordpairs?: boolean) => 
      apiRequest<DeckSummaryOptionalReturn>(`/api/decks/${deckId}${includeWordpairs ? '?includeWordpairs=true' : ''}`),
    createDeck: (deck: DeckCreateInput) => apiRequest<DeckOptionalReturn>('/api/decks', {
      method: 'POST',
      body: JSON.stringify(deck),
    }),
    updateDeck: (deck: DeckUpdateInput) => apiRequest<DeckOptionalReturn>(`/api/decks/${deck.id}`, {
      method: 'PUT',
      body: JSON.stringify(deck),
    }),
    deleteDeck: (deckId: string) => apiRequest<void>(`/api/decks/${deckId}`, {
      method: 'DELETE',
    }),

    getWordpairs: (deckId: string) => apiRequest<WordPairEntity[]>(`/api/decks/${deckId}/wordpairs`),
    createWordpairs: (deckId: string, wordpairs: WordPairInput[]) => apiRequest<WordPairEntity[]>(`/api/decks/${deckId}/wordpairs`, {
      method: 'POST',
      body: JSON.stringify(wordpairs),
    }),
    updateWordpairs: (deckId: string, wordpairs: WordPairUpdateInput[]) => apiRequest<WordPairEntity[]>(`/api/decks/${deckId}/wordpairs`, {
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