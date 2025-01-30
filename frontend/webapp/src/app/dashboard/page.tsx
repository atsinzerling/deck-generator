"use client";
import React, { useEffect, useState } from "react";
import DeckTile from "@/components/DeckTile";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Deck } from "@/types/decks";

const Dashboard: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchDecks = async () => {
      const { data, error } = await api.decks.getAll();
      if (error) {
        setError(error);
      } else if (data) {
        setDecks(data);
      }
      setLoading(false);
    };

    fetchDecks();
  }, []);

  const handleNewDeck = () => {
    router.push("/decks/new");
  };

  if (error) {
    return <div className="p-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Your Decks</h1>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div
            onClick={handleNewDeck}
            className="cursor-pointer flex items-center justify-center bg-blue-500 text-white rounded-lg p-4 hover:bg-blue-600 transition-colors"
          >
            + New Deck
          </div>
          {decks.map((deck) => (
            <DeckTile
              key={deck.id}
              id={Number(deck.id)}
              name={deck.name}
              languageFrom={deck.language_from}
              languageTo={deck.language_to}
              onClick={() => router.push(`/decks/${deck.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard; 