import { create } from 'zustand';
import { DeckSummary, WordPairEntity } from '@/types/decks';

interface DeckState {
  currentDeck: DeckSummary | null;
  wordPairs: WordPairEntity[];
  setDeckData: (deck: DeckSummary, wordPairs: WordPairEntity[]) => void;
  clearDeckData: () => void;
}

export const useDeckStore = create<DeckState>((set) => ({
  currentDeck: null,
  wordPairs: [],
  setDeckData: (deck, wordPairs) => set({ currentDeck: deck, wordPairs }),
  clearDeckData: () => set({ currentDeck: null, wordPairs: [] }),
}));

