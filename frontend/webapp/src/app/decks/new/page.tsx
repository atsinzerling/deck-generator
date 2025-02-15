"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { ShortWordPair, ShortDeckWithWordPairs } from "@/types/decks";
import { GenerateDeckRequest, RefineDeckRequest } from "@/types/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import WordPairList from "@/components/WordPairList";

const NewDeck: React.FC = () => {
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [theme, setTheme] = useState("");
  const [pairCount, setPairCount] = useState<number>(5);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [wordPairs, setWordPairs] = useState<ShortWordPair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deckName, setDeckName] = useState("");
  const router = useRouter();

  const updateDeckDetails = (data: ShortDeckWithWordPairs) => {
    setWordPairs(data.wordpairs);

    if (data.wordpairs.length > 0) {
      setPairCount(data.wordpairs.length);
    }
    
    if (data.language_from) {
      setFromLanguage(data.language_from);
    }
    if (data.language_to) {
      setToLanguage(data.language_to);
    }
    
    if (data.name) {
      setDeckName(data.name);
      if (!theme) {
        setTheme(data.name);
      }
    }
    
    setIsRefining(true);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const payload: GenerateDeckRequest = {
      prompt: `Create a deck from ${fromLanguage} to ${toLanguage} with ${pairCount} word pairs on the topic/theme of ${theme}.${additionalPrompt ? ` Additional instructions: ${additionalPrompt}` : ''}`
    };

    const { data, error: apiError } = await api.decks.generate(payload);
    if (apiError) {
      setError(apiError);
    } else if (data) {
      updateDeckDetails(data);
    }
    setLoading(false);
  };

  const handleRefine = async () => {
    setLoading(true);
    setError(null);

    const payload: RefineDeckRequest = {
      prompt: additionalPrompt,
      history: [],
      current_deck: ({
        name: deckName || theme,
        language_from: fromLanguage,
        language_to: toLanguage,
        wordpairs: wordPairs,
      }),
    };

    const { data, error: apiError } = await api.decks.refine(payload);
    if (apiError) {
      setError(apiError);
    } else if (data) {
      updateDeckDetails(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      name: deckName || `${theme} Deck`,
      language_from: fromLanguage,
      language_to: toLanguage,
      wordpairs: wordPairs.map((pair) => ({
        word_original: pair.word_original,
        word_translation: pair.word_translation,
      })),
    };

    const { data, error: apiError } = await api.decks.create(payload);
    if (apiError) {
      setError(apiError);
    } else if (data) {
      router.push(`/decks/${data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full font-roboto bg-[#1a1a1a] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2 bg-[#242424] rounded-xl p-6">
            <h1 className="text-3xl font-bold mb-8">Create New Deck</h1>
            <div className="space-y-6">
              {error && <div className="text-red-500">{error}</div>}
              
              <div className="flex gap-4">
                <div className="w-1/2 space-y-2">
                  <label className="block text-sm font-medium">From Language</label>
                  <Input
                    type="text"
                    name="fromLanguage"
                    placeholder="e.g., English"
                    value={fromLanguage}
                    onChange={(e) => setFromLanguage(e.target.value)}
                    disabled={isRefining}
                    className="bg-[#1a1a1a] border-gray-600"
                  />
                </div>

                <div className="w-1/2 space-y-2">
                  <label className="block text-sm font-medium">Proficiency Level</label>
                  <Input
                    type="text"
                    name="proficiency"
                    placeholder="Your proficiency level"
                    value={proficiency}
                    onChange={(e) => setProficiency(e.target.value)}
                    disabled={isRefining}
                    className="bg-[#1a1a1a] border-gray-600"
                  />
                </div>
              </div>

              <div className="flex gap-4">
              <div className="w-1/2 space-y-2">
                  <label className="block text-sm font-medium">To Language</label>
                  <Input
                    type="text"
                    name="toLanguage"
                    placeholder="e.g., Spanish"
                    value={toLanguage}
                    onChange={(e) => setToLanguage(e.target.value)}
                    disabled={isRefining}
                    className="bg-[#1a1a1a] border-gray-600"
                  />
                </div>

                <div className="w-1/2 space-y-2">
                  <label className="block text-sm font-medium">Number of Word Pairs</label>
                  <Input
                    type="number"
                    name="pairCount"
                    placeholder="e.g., 20"
                    value={pairCount}
                    onChange={(e) => setPairCount(Number(e.target.value))}
                    disabled={isRefining}
                    className="bg-[#1a1a1a] border-gray-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Theme/Topic</label>
                <Input
                  type="text"
                  name="theme"
                  placeholder="e.g., Business, Travel, Food"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  disabled={isRefining}
                  className="bg-[#1a1a1a] border-gray-600"
                />
              </div>

              {isRefining && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Deck Name</label>
                  <Input
                    type="text"
                    name="deckName"
                    placeholder="Name for your deck"
                    value={deckName}
                    onChange={(e) => setDeckName(e.target.value)}
                    className="bg-[#1a1a1a] border-gray-600"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium">{ isRefining ? "Refine Instructions" : "Additional Instructions"}</label>
                <Textarea
                  name="additionalPrompt"
                  placeholder={isRefining ? "How would you want to refine the deck?" : "Any specific requirements or focus areas..."}
                  value={additionalPrompt}
                  onChange={(e) => setAdditionalPrompt(e.target.value)}
                  className="bg-[#1a1a1a] border-gray-600 h-24 resize-none"
                />
              </div>

              <div className="space-y-4">
                <Button
                  onClick={isRefining ? handleRefine : handleGenerate}
                  disabled={loading}
                  className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white"
                >
                  {isRefining ? "Refine Word Pairs" : "Generate Word Pairs"}
                </Button>

                {wordPairs.length > 0 && (
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      variant="secondary"
                      className="w-1/2 bg-green-600 hover:bg-green-700"
                    >
                      Save Deck
                    </Button>
                    <Button
                      onClick={() => {
                        setWordPairs([]);
                        setIsRefining(false);
                      }}
                      disabled={loading}
                      variant="destructive"
                      className="w-1/2"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <WordPairList wordPairs={wordPairs} isRefining={isRefining} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDeck; 