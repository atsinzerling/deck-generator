import { 
	CreateDeckRequest,
	CreateDeckResponse,
	UpdateDeckRequest,
	UpdateDeckResponse,
	GetAllDecksResponse,
	GetDeckWordpairsResponse,
	GetDeckByIdResponse,
	GenerateDeckRequest,
	GenerateDeckResponse,
	RefineDeckRequest,
	RefineDeckResponse
  } from "@/types/api";

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
    getAll: () => apiRequest<GetAllDecksResponse[]>('/api/decks'),
    getById: (deckId: string) => apiRequest<GetDeckByIdResponse>(`/api/decks/${deckId}`),
    getWordPairs: (deckId: string) => apiRequest<GetDeckWordpairsResponse[]>(`/api/decks/${deckId}/wordpairs`),
    create: (deck: CreateDeckRequest) => apiRequest<CreateDeckResponse>('/api/decks', {
      method: 'POST',
      body: JSON.stringify(deck),
    }),
    update: (deckId: string, deck: UpdateDeckRequest) => apiRequest<UpdateDeckResponse>(`/api/decks/${deckId}`, {
      method: 'PUT',
      body: JSON.stringify(deck),
    }),
    delete: (deckId: string) => apiRequest<void>(`/api/decks/${deckId}`, {
      method: 'DELETE',
    }),
    generate: (prompt: GenerateDeckRequest) => apiRequest<GenerateDeckResponse>('/api/decks/generate', {
      method: 'POST',
      body: JSON.stringify(prompt),
    }),
    refine: (prompt: RefineDeckRequest) => apiRequest<RefineDeckResponse>('/api/decks/refine', {
      method: 'POST',
      body: JSON.stringify(prompt),
    }),
  },
}; 