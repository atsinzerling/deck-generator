"use client";
import React, { useEffect, useState } from "react";
import DeckTile from "@/components/dashboard/DeckTile";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { DeckSummary } from "@/types/decks";
import NewDeckTile from "@/components/dashboard/NewDeckTile";
import SkeletonDashboard from "@/components/dashboard/SkeletonDashboard";
import toast from "react-hot-toast";

const Dashboard: React.FC = () => {
  const [decks, setDecks] = useState<DeckSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDecks = async () => {
      const { data, error } = await api.decks.getAllDecks();
      if (error) {
        toast.error(
          typeof error === "string" ? error : error.error || "Failed to fetch decks."
        );
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
              languageFrom={deck.languageFrom}
              languageTo={deck.languageTo}
              cardCount={deck.wordpairCount || 0}
              lastModified={deck.lastModified}
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