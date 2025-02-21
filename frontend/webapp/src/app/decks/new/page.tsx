"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { api } from "@/lib/api";
import { LLMDeck, WordPairInput } from "@/types/decks";
import { GenerateDeckRequest, RefineDeckRequest } from "@/types/decks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import WordPairList from "@/components/WordPairList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faSync,
  faMagicWandSparkles
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const NewDeck: React.FC = () => {
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [theme, setTheme] = useState("");
  const [pairCount, setPairCount] = useState<number>(5);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [wordPairs, setWordPairs] = useState<WordPairInput[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [deckName, setDeckName] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();

  const updateDeckDetails = (data: LLMDeck) => {
    setWordPairs(data.wordpairs);

    if (data.wordpairs.length > 0) {
      setPairCount(data.wordpairs.length);
    }
    
    if (data.languageFrom) {
      setFromLanguage(data.languageFrom);
    }
    if (data.languageTo) {
      setToLanguage(data.languageTo);
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

    const payload: GenerateDeckRequest = {
      languageFrom: fromLanguage,
      languageTo: toLanguage,
      pairCount: pairCount,
      theme: theme,
      additionalPrompt: additionalPrompt,
    };

    const { data, error: apiError } = await api.decks.generateDeck(payload);
    if (apiError) {
      let message = "";
      if (
        typeof apiError === "object" &&
        apiError.errorType &&
        (apiError.errorType === "LLMError" || apiError.errorType === "LLMParseError")
      ) {
        message = "An error occurred while generating a deck. Try again or change the prompt.";
      } else {
        message =
          typeof apiError === "string"
            ? apiError
            : apiError.error || "An unexpected error occurred.";
      }
      toast.error(message);
    } else if (data) {
      updateDeckDetails(data);
      toast.success("Deck generated successfully!");
      setHistory([
        ...history,
        `generate request: languageFrom: ${fromLanguage} languageTo: ${toLanguage} pairCount: ${pairCount} topic/theme: ${theme}${
          additionalPrompt ? ` additional prompt: ${additionalPrompt}.` : "."
        }`,
      ]);
    }
    setLoading(false);
  };

  const handleRefine = async () => {
    setLoading(true);

    const payload: RefineDeckRequest = {
      prompt: additionalPrompt,
      history: history,
      currentDeck: ({
        name: deckName || theme,
        languageFrom: fromLanguage,
        languageTo: toLanguage,
        wordpairs: wordPairs,
      }),
    };

    const { data, error: apiError } = await api.decks.refineDeck(payload);
    if (apiError) {
      let message = "";
      if (
        typeof apiError === "object" &&
        apiError.errorType &&
        (apiError.errorType === "LLMError" || apiError.errorType === "LLMParseError")
      ) {
        message = "An error occurred while generating a deck. Try again or change the prompt.";
      } else {
        message =
          typeof apiError === "string"
            ? apiError
            : apiError.error || "An unexpected error occurred.";
      }
      toast.error(message);
    } else if (data) {
      updateDeckDetails(data);
      toast.success("Deck refined successfully!");
      setHistory([...history, `refine request: ${additionalPrompt}`]);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);

    const payload = {
      name: deckName || `${theme} Deck`,
      languageFrom: fromLanguage,
      languageTo: toLanguage,
      wordpairs: wordPairs.map((pair) => ({
        wordOriginal: pair.wordOriginal,
        wordTranslation: pair.wordTranslation,
      })),
    };

    const { data, error: apiError } = await api.decks.createDeck(payload);
    if (apiError) {
      let message =
        typeof apiError === "string"
          ? apiError
          : apiError.error || "An unexpected error occurred.";
      toast.error(message);
    } else if (data) {
      toast.success("Deck saved successfully!");
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
                    value={pairCount || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPairCount(val === '' ? 0 : parseInt(val, 10));
                    }}
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
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] text-white"
                >
                  <FontAwesomeIcon 
                    icon={isRefining ? faSync : faMagicWandSparkles} 
                    className="h-4 w-4" 
                  />
                  {isRefining ? "Refine Word Pairs" : "Generate Word Pairs"}
                </Button>

                {wordPairs.length > 0 && (
                  <div className="flex gap-4">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="w-1/2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={() => {
                        setWordPairs([]);
                        setIsRefining(false);
                      }}
                      disabled={loading}
                      className="w-1/2 px-4 py-2 bg-[#2f2f2f] text-white rounded-lg hover:bg-[#363636]"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2">
            <WordPairList 
              wordPairs={wordPairs}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDeck; 