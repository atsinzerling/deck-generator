"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSync, faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { PreserveToggle } from "@/components/PreserveToggle";
import { GenerateDeckRequest, LLMDeck, RefineDeckRequest } from "@/types/decks";
import { WordPairSummary } from "@/types/decks";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";

interface GeneratePaneProps {
  secondStage: boolean;
  setSecondStage: (value: boolean) => void;
  generating: boolean;
  setGenerating: (value: boolean) => void;
  fromLanguage: string;
  setFromLanguage: (value: string) => void;
  toLanguage: string;
  setToLanguage: (value: string) => void;
  deckName: string;
  setDeckName: (value: string) => void;
  theme: string;
  setTheme: (value: string) => void;
  wordPairs: WordPairSummary[];
  setWordPairs: (value: WordPairSummary[]) => void;

  handleSave: () => void;
  onCancel: () => void;
}

const GeneratePane: React.FC<GeneratePaneProps> = ({
  secondStage,
  setSecondStage,
  generating,
  setGenerating,
  fromLanguage,
  setFromLanguage,
  toLanguage,
  setToLanguage,
  deckName,
  setDeckName,
  theme,
  setTheme,
  wordPairs,
  setWordPairs,
  handleSave,
  onCancel,
}) => {
	const [proficiency, setProficiency] = useState("");
	const [pairCount, setPairCount] = useState<number>(5);
	const [additionalPrompt, setAdditionalPrompt] = useState("");
	const [preserveExistingPairs, setPreserveExistingPairs] = useState(false);
	const [history, setHistory] = useState<string[]>([]);

	const updateDeckDetails = (data: LLMDeck) => {
		const pairs = data.wordpairs.map((pair, index) => ({
		  ...pair,
		  position: index + 1,
		}));
		setWordPairs(pairs);
	
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
	
		setSecondStage(true);
	  };
	
	  const handleGenerate = async () => {
		if (!theme.trim() && !additionalPrompt.trim()) {
		  toast.error(
			"Please provide a theme/topic or additional instructions to generate word pairs."
		  );
		  return;
		}
	
		setGenerating(true);
	
		const payload: GenerateDeckRequest = {
		  languageFrom: fromLanguage,
		  languageTo: toLanguage,
		  pairCount: pairCount,
		  theme: theme,
		  additionalPrompt: additionalPrompt,
		};
	
		const {
		  success,
		  data,
		  error: apiError,
		} = await api.decks.generateDeck(payload);
	
		if (!success) {
		  let message = "Failed to generate deck.";
		  if (apiError?.type === "LLMError" || apiError?.type === "LLMParseError") {
			message =
			  "An error occurred while generating a deck. Try again or change the prompt.";
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
	
		setGenerating(false);
	  };
	
	  const handleRefine = async () => {
		if (!additionalPrompt.trim()) {
		  toast.error("Please provide instructions on how to refine the deck.");
		  return;
		}
	
		setGenerating(true);
	
		const payload: RefineDeckRequest = {
		  prompt: additionalPrompt,
		  history: history,
		  preserveExistingPairs: preserveExistingPairs,
		  currentDeck: {
			name: deckName || theme,
			languageFrom: fromLanguage,
			languageTo: toLanguage,
			wordpairs: wordPairs.map((pair) => ({
			  wordOriginal: pair.wordOriginal,
			  wordTranslation: pair.wordTranslation,
			})),
		  },
		};
	
		const {
		  success,
		  data,
		  error: apiError,
		} = await api.decks.refineDeck(payload);
	
		if (!success) {
		  let message = "Failed to refine deck.";
		  if (apiError?.type === "LLMError" || apiError?.type === "LLMParseError") {
			message =
			  "An error occurred while generating a deck. Try again or change the prompt.";
		  }
		  toast.error(message);
		} else if (data) {
		  let updatedData = data;
		  if (preserveExistingPairs) {
			updatedData = {
			  ...data,
			  wordpairs: [...wordPairs, ...data.wordpairs],
			};
		  }
		  updateDeckDetails(updatedData);
		  toast.success("Deck refined successfully!");
		  setHistory([...history, `refine request: ${additionalPrompt}`]);
		}
	
		setGenerating(false);
	  };



  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <div className="w-1/2 space-y-2">
          <label className="block text-sm font-medium">From Language</label>
          <Input
            type="text"
            placeholder="e.g., English"
            value={fromLanguage}
            onChange={(e) => setFromLanguage(e.target.value)}
            disabled={secondStage || generating}
            className="bg-[#1a1a1a] border-gray-600"
          />
        </div>

        <div className="w-1/2 space-y-2">
          <label className="block text-sm font-medium">To Language</label>
          <Input
            type="text"
            placeholder="e.g., Spanish"
            value={toLanguage}
            onChange={(e) => setToLanguage(e.target.value)}
            disabled={secondStage || generating}
            className="bg-[#1a1a1a] border-gray-600"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/2 space-y-2">
          <label className="block text-sm font-medium">Proficiency Level</label>
          <Input
            type="text"
            placeholder="Your proficiency level"
            value={proficiency}
            onChange={(e) => setProficiency(e.target.value)}
            disabled={secondStage || generating}
            className="bg-[#1a1a1a] border-gray-600"
          />
        </div>

        <div className="w-1/2 space-y-2">
          <label className="block text-sm font-medium">
            Number of Word Pairs
          </label>
          <Input
            type="number"
            placeholder="e.g., 20"
            value={pairCount || ""}
            onChange={(e) => {
              const val = e.target.value;
              setPairCount(val === "" ? 0 : parseInt(val, 10));
            }}
            disabled={secondStage || generating}
            className="bg-[#1a1a1a] border-gray-600"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Theme/Topic</label>
        <Input
          type="text"
          placeholder="e.g., Business, Travel, Food"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          disabled={secondStage || generating}
          className="bg-[#1a1a1a] border-gray-600"
        />
      </div>

      {secondStage && (
        <div className="space-y-2">
          <label className="block text-sm font-medium">Deck Name</label>
          <Input
            type="text"
            placeholder="Name for your deck"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            className="bg-[#1a1a1a] border-gray-600"
          />
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          {secondStage ? "Refine Instructions" : "Additional Instructions"}
        </label>
        <Textarea
          placeholder={
            secondStage
              ? "How would you want to refine the deck?"
              : "Any specific requirements or focus areas..."
          }
          value={additionalPrompt}
          onChange={(e) => setAdditionalPrompt(e.target.value)}
          className="bg-[#1a1a1a] border-gray-600 h-24 resize-none"
        />
        {secondStage && (
          <PreserveToggle
            checked={preserveExistingPairs}
            onChange={setPreserveExistingPairs}
            disabled={generating}
          />
        )}
      </div>

      <div className="space-y-4">
        <Button
          onClick={secondStage ? handleRefine : handleGenerate}
          disabled={generating}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] text-white"
        >
          <FontAwesomeIcon
            icon={secondStage ? faSync : faMagicWandSparkles}
            className="h-4 w-4"
          />
          {secondStage ? "Refine Word Pairs" : "Generate Word Pairs"}
        </Button>

        {secondStage && (
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              disabled={generating}
              className="w-1/2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Save
            </Button>
            <Button
              onClick={onCancel}
              disabled={generating}
              className="w-1/2 px-4 py-2 bg-[#2f2f2f] text-white rounded-lg hover:bg-[#363636]"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratePane; 