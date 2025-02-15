import { Deck, WordPair, ShortDeckWithWordPairs} from "./decks";

export interface CreateDeckRequest extends ShortDeckWithWordPairs {
}

export interface CreateDeckResponse extends Deck {
}

export interface UpdateDeckRequest extends ShortDeckWithWordPairs {
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

export interface GenerateDeckResponse extends ShortDeckWithWordPairs {
}

export interface RefineDeckRequest {
  prompt: string;
  history: string[];
  current_deck: ShortDeckWithWordPairs;
} 

export interface RefineDeckResponse extends ShortDeckWithWordPairs {
}