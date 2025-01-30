"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import WordPairTile from "@/components/WordPairTile";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { Deck, WordPair } from "@/types/decks";

const DeckPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deck_id as string;
  const [deck, setDeck] = useState<Deck | null>(null);
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeckData = async () => {
      const { data: deckData, error: deckError } = await api.decks.getById(deckId);
      if (deckError) {
        setError(deckError);
        setLoading(false);
        return;
      }

      if (deckData) {
        setDeck(deckData);
        const { data: wordPairsData, error: wordPairsError } = await api.decks.getWordPairs(deckId);
        if (wordPairsError) {
          setError(wordPairsError);
        } else if (wordPairsData) {
          setWordPairs(wordPairsData);
        }
      }
      setLoading(false);
    };

    fetchDeckData();
  }, [deckId]);

  const shuffleWordPairs = () => {
    setWordPairs((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const reverseWordPairs = () => {
    setWordPairs((prev) => [...prev].reverse());
  };

  const handlePractice = () => {
    // Implement practice modal
  };

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8 flex">
      {loading ? (
        <LoadingSpinner />
      ) : deck ? (
        <>
          <div className="w-1/2 pr-4">
            <h1 className="text-2xl font-bold mb-4">{deck.name}</h1>
            <p>
              {deck.language_from} ➔ {deck.language_to}
            </p>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={shuffleWordPairs}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
              >
                Shuffle
              </button>
              <button
                onClick={reverseWordPairs}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
              >
                Reverse
              </button>
              <button
                onClick={handlePractice}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Practice
              </button>
            </div>
          </div>
          <div className="w-1/2 pl-4 space-y-4 overflow-y-auto">
            {wordPairs.map((pair) => (
              <WordPairTile key={pair.id} pair={pair} />
            ))}
          </div>
        </>
      ) : (
        <p>Deck not found.</p>
      )}
    </div>
  );
};

export default DeckPage; 