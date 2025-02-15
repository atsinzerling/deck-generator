"use client";
import React, { useEffect, useState } from "react";
import DeckTile from "@/components/DeckTile";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Deck } from "@/types/decks";
import NewDeckTile from "@/components/NewDeckTile";
import SkeletonDashboard from "@/components/SkeletonDashboard";

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
    <div className="min-h-screen w-full font-roboto bg-[#1a1a1a] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Language Decks</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <SkeletonDashboard />
          ) : (
            <>
              <NewDeckTile onClick={handleNewDeck} />
              
          {decks.map((deck) => (
            <DeckTile
              key={deck.id}
              id={Number(deck.id)}
              name={deck.name}
              languageFrom={deck.language_from}
              languageTo={deck.language_to}
              cardCount={deck.wordpair_count || 0}
              lastModified={deck.last_modified}
              onClick={() => router.push(`/decks/${deck.id}`)}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 