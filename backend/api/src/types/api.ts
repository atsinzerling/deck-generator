import { Deck, WordPair, DeckWithWordPairs} from "./deck";

export interface APIError {
  message: string;
  status: number;
}

export interface CreateDeckRequest extends DeckWithWordPairs {
}

export interface CreateDeckResponse extends Deck {
}

export interface UpdateDeckRequest extends DeckWithWordPairs {
  id: string;
}

export interface UpdateDeckResponse extends Deck {
}

//GetAllDecksRequest is empty
//GetAllDecksResponse is Deck[]
export interface GetAllDecksResponse extends Deck {
}

//GetDeckWordpairsRequest is deckId
//GetDeckWordpairsResponse is WordPair[]
export interface GetDeckWordpairsResponse extends WordPair {
}

//GetDeckByIdRequest is deckId
export interface GetDeckByIdResponse extends Deck {
}

//DeleteDeckRequest is deckId
//DeleteDeckResponse is void

export interface GenerateDeckRequest {
  prompt: string;
}

export interface GenerateDeckResponse extends DeckWithWordPairs {
}

export interface RefineDeckRequest {
  prompt: string;
  history: string[];
  current_deck: DeckWithWordPairs;
} 

export interface RefineDeckResponse extends DeckWithWordPairs {
}