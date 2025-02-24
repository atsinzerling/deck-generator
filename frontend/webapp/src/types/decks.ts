/**
 * This file defines the types used for deck and wordpair interactions.
 *
 * Naming Conventions:
 * -------------------
 * Deck Types:
 * - DeckCreateInput: Payload for deck insertion. Contains basic fields and an optional list of wordpairs.
 * - DeckUpdateInput: Payload for updating a deck. Contains basic fields (without timestamps) and an optional wordpairs list.
 * - DeckEntity:   Represents a deck as stored in the database.
 * - DeckSummary:  Extends DeckEntity with the computed "wordpairCount". 
 * - DeckDetail:   Extends DeckSummary by including the full list of associated wordpairs.
 * - DeckOptionalReturn: Similar to DeckDetail but with "wordpairCount" and "wordpairs" optional.
 *
 * WordPair Types:
 * - WordPairInput:  Minimal data required for inserting/updating a wordpair.
 * - WordPairSummary: A lightweight version of a wordpair (includes id, deckId, and the word values).
 * - WordPairEntity:  Full representation of a wordpair including timestamps.
 */

export interface WordPairInput {
  wordOriginal: string;
  wordTranslation: string;
}

export interface WordPairSummary {
  wordOriginal: string;
  wordTranslation: string;
  position: number;
}

export interface WordPairUpdateInput {
  id?: number;
  deckId?: number;
  wordOriginal: string;
  wordTranslation: string;
  position?: number;
}

export interface WordPairEntity {
  id: number;
  deckId: number;
  wordOriginal: string;
  wordTranslation: string;
  position: number;
  createdAt: string;
  lastModified: string;
}

export interface DeckCreateInput {
  name: string;
  languageFrom: string;
  languageTo: string;
  /**
   * Optional array of wordpairs to be inserted along with the deck.
   */
  wordpairs?: WordPairInput[];
}

export interface DeckUpdateInput {
  id: number;
  name: string;
  languageFrom: string;
  languageTo: string;
  /**
   * Optional array of wordpairs. If not provided, only deck metadata is updated.
   */
  wordpairs?: WordPairUpdateInput[];
}

/**
 * This interface represents a deck row as stored in the DB (excluding computed fields).
 */
export interface DeckEntity {
  id: number;
  name: string;
  languageFrom: string;
  languageTo: string;
  createdAt: string;
  lastModified: string;
}

/**
 * DeckSummary extends DeckEntity with the computed wordpairCount.
 * This type is ideal for list endpoints where a count is necessary.
 */
export interface DeckSummary extends DeckEntity {
  wordpairCount: number;
}

/**
 * DeckDetail provides full deck details including the complete wordpairs list.
 * This is used on a detailed view or edit page.
 */
export interface DeckDetail extends DeckSummary {
  wordpairs: WordPairEntity[];
}

/**
 * DeckOptionalReturn is used by deck insertion and update endpoints to return their
 * intended result. It is similar to DeckDetail, but the last two fields (wordpairCount and wordpairs)
 * are optional. This offers flexibility, for instance, when the full list of wordpairs isn't returned.
 */
export interface DeckOptionalReturn extends DeckEntity {
  wordpairCount?: number;
  wordpairs?: WordPairEntity[];
}

export interface DeckSummaryOptionalReturn extends DeckSummary {
  wordpairs?: WordPairEntity[];
}

export interface LLMDeck{
  name: string;
  languageFrom: string;
  languageTo: string;
  wordpairs: WordPairInput[];
}

export interface GenerateDeckRequest {
  languageFrom: string;
  languageTo: string;
  pairCount: number;
  theme: string;
  additionalPrompt: string;
}

export interface RefineDeckRequest {
  prompt: string;
  history: string[];
  currentDeck: LLMDeck;
} 