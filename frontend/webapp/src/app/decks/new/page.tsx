"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { ShortWordPair} from "@/types/decks";
import { GenerateDeckRequest, RefineDeckRequest } from "@/types/api";

const NewDeck: React.FC = () => {
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [theme, setTheme] = useState("");
  const [pairCount, setPairCount] = useState<number>(10);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [wordPairs, setWordPairs] = useState<ShortWordPair[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    const payload: GenerateDeckRequest = {
      prompt: `Create a deck from ${fromLanguage} to ${toLanguage} with ${pairCount} word pairs on the topic/theme of ${theme}.`
    };

    const { data, error: apiError } = await api.decks.generate(payload);
    if (apiError) {
      setError(apiError);
    } else if (data) {
		console.log(data);
		console.log(data.wordpairs);
      setWordPairs(data.wordpairs);
      setIsRefining(true);
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
        name: theme,
        language_from: fromLanguage,
        language_to: toLanguage,
        wordpairs: wordPairs,
      }),
    };

    const { data, error: apiError } = await api.decks.refine(payload);
    if (apiError) {
      setError(apiError);
    } else if (data) {
      setWordPairs(data.wordpairs);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    const payload = {
      name: `${theme} Deck`,
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
    <div className="flex h-screen w-full font-roboto bg-[#1a1a1a] text-gray-200">
      <div className="w-1/2 p-8 bg-[#242424]">
        <div className="space-y-4 max-w-lg mx-auto">
          {error && <div className="text-red-500">{error}</div>}
          <div>
            <input
              type="text"
              name="fromLanguage"
              placeholder="Translate from (e.g. English)"
              className="w-full p-3 border-0 rounded-lg bg-[#2f2f2f] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={fromLanguage}
              onChange={(e) => setFromLanguage(e.target.value)}
              disabled={isRefining}
            />
          </div>
          <div>
            <input
              type="text"
              name="toLanguage"
              placeholder="Translate to (e.g. Spanish)"
              className="w-full p-3 border-0 rounded-lg bg-[#2f2f2f] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={toLanguage}
              onChange={(e) => setToLanguage(e.target.value)}
              disabled={isRefining}
            />
          </div>
          <div>
            <input
              type="text"
              name="proficiency"
              placeholder="Your proficiency (optional)"
              className="w-full p-3 border-0 rounded-lg bg-[#2f2f2f] text-gray-200 placeholder-gray-500 focus:极ring-2 focus:ring-blue-500 focus:outline-none"
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value)}
              disabled={isRefining}
            />
          </div>
          <div>
            <input
              type="text"
              name="theme"
              placeholder="Theme or topic"
              className="w-full p-3 border-0 rounded-lg bg-[#2f极2f2f] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              disabled={isRefining}
            />
          </div>
          <div>
            <input
              type="number"
              name="pairCount"
              placeholder="Number of word pairs"
              className="w-full p-3 border-0 rounded-lg bg-[#2f2f2f] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              value={pairCount}
              onChange={(e) => setPairCount(Number(e.target.value))}
              disabled={isRefining}
            />
          </div>
          {isRefining && (
            <div>
              <textarea
                name="additionalPrompt"
                placeholder="Additional instructions..."
                className="w-full p-3 border-0 rounded-lg bg-[#2f2f2f] text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-none"
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
              />
            </div>
          )}
          <button
            onClick={isRefining ? handleRefine : handleGenerate}
            className="w-full p-3 rounded-lg bg-[#4f46e5] text-white hover:bg-[#4338ca] transition-colors duration-200"
            disabled={loading}
          >
            {isRefining ? "Refine Deck" : "Generate Deck"}
          </button>
          {wordPairs.length > 0 && (
            <div className="flex space-x-4 mt-8">
              <button
                onClick={handleSave}
                className="w-1/2 p-3 rounded-lg bg-[#059669] text-white hover:bg-[#047857] transition-colors duration-200"
                disabled={loading}
              >
                Save Deck
              </button>
              <button
                onClick={() => {
                  setWordPairs([]);
                  setIsRefining(false);
                }}
                className="w-1/2 p-3 rounded-lg bg-[#dc2626] text-white hover:bg-[#b91c1c] transition-colors duration-200"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          )}
          {loading && <LoadingSpinner />}
        </div>
      </div>
      <div className="w-1/2 p-8 bg-[#1a1a1a] overflow-y-auto">
        <div className="max-w-lg mx-auto space-y-4">
          {wordPairs.map((pair, index) => (
            <div key={index} className="flex space-x-4">
              <div className="w-1/2 p-4 bg-[#2f2f2f] rounded-lg shadow-lg text-gray-200">
                {pair.word_original}
              </div>
              <div className="w-1/2 p-4 bg-[#242424] rounded-lg shadow-lg text-gray-200">
                {pair.word_translation}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewDeck; 