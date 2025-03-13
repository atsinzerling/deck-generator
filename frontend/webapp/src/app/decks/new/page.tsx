"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { DeckCreateInput, LLMDeck, WordPairInput, WordPairSummary } from "@/types/decks";
import { GenerateDeckRequest, RefineDeckRequest } from "@/types/decks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import WordPairList from "@/components/newpage/WordPairList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSync,
  faMagicWandSparkles,
  faPaste,
  faFileImport,
  faQuestionCircle,
  faTimes,
  faUndo,
} from "@fortawesome/free-solid-svg-icons";
import { PreserveToggle } from "@/components/PreserveToggle";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import ImportPane from "@/components/newpage/ImportPane";
import GeneratePane from "@/components/newpage/GeneratePane";

const NewDeck: React.FC = () => {
  const [deckName, setDeckName] = useState("");
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [theme, setTheme] = useState("");
  const [wordPairs, setWordPairs] = useState<WordPairSummary[]>([]);

  const [secondStage, setSecondStage] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<"generate" | "import">(
    "generate"
  );

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const [leftPaneHeight, setLeftPaneHeight] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      if (leftPaneRef.current) {
        const height = leftPaneRef.current.getBoundingClientRect().height;
        setLeftPaneHeight(height);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);

    return () => window.removeEventListener("resize", updateHeight);
  }, [secondStage, selectedTab]);

  const router = useRouter();

  const handleSave = async () => {
    setGenerating(true);

    const payload : DeckCreateInput = {
      name: deckName || `${theme} Deck`,
      languageFrom: fromLanguage,
      languageTo: toLanguage,
      wordpairs: wordPairs.map((pair) => ({
        wordOriginal: pair.wordOriginal,
        wordTranslation: pair.wordTranslation,
      })),
    };

    const {
      success,
      data,
      error: apiError,
    } = await api.decks.createDeck(payload);
    if (!success) {
      toast.error("Failed to save deck.");
    } else if (data) {
      toast.success("Deck saved successfully!");
      router.push(`/decks/${data.id}`);
    }
    setGenerating(false);
  };

  const handleReset = () => {
    setWordPairs([]);
    setSecondStage(false);
    setDeckName("");
    setFromLanguage("");
    setToLanguage("");
    setTheme("");
    setResetKey(prevKey => prevKey + 1);
  };

  return (
    <div className="min-h-[calc(100vh-4.55rem)] w-full font-roboto bg-[#1a1a1a] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Pane */}
          <div
            ref={leftPaneRef}
            className="w-full md:w-1/2 bg-[#242424] rounded-xl p-6"
          >
            <h1 className="text-3xl font-bold mb-4">Create New Deck</h1>
            <div className="flex border-b border-gray-700 mb-6">
              {(!secondStage || selectedTab === "generate") && (
                <button
                  className={`px-4 py-2 font-medium text-md ${
                    selectedTab === "generate"
                      ? "text-[#4f46e5] border-b-2 border-[#4f46e5]"
                      : "hover:text-gray-200"
                  }`}
                  onClick={() => setSelectedTab("generate")}
                >
                  Generate
                </button>
              )}
              {(!secondStage || selectedTab === "import") && (
                <button
                  className={`px-4 py-2 font-medium text-md ${
                    selectedTab === "import"
                      ? "text-[#4f46e5] border-b-2 border-[#4f46e5]"
                      : "hover:text-gray-200"
                  }`}
                  disabled={generating}
                  onClick={() => setSelectedTab("import")}
                >
                  Import
                </button>
              )}
            </div>

            {selectedTab === "generate" && (
              <GeneratePane
                key={`generate-${resetKey}`}
                secondStage={secondStage}
                setSecondStage={setSecondStage}
                generating={generating}
                setGenerating={setGenerating}
                fromLanguage={fromLanguage}
                setFromLanguage={setFromLanguage}
                toLanguage={toLanguage}
                setToLanguage={setToLanguage}
                deckName={deckName}
                setDeckName={setDeckName}
                theme={theme}
                setTheme={setTheme}
                wordPairs={wordPairs}
                setWordPairs={setWordPairs}
                handleSave={handleSave}
                onCancel={() => {
                  router.push("/dashboard");
                }}
              />
            )}
            {selectedTab === "import" && (
              <ImportPane
                key={`import-${resetKey}`}
                secondStage={secondStage}
                setSecondStage={setSecondStage}
                generating={generating}
                fromLanguage={fromLanguage}
                setFromLanguage={setFromLanguage}
                toLanguage={toLanguage}
                setToLanguage={setToLanguage}
                deckName={deckName}
                setDeckName={setDeckName}
                wordPairs={wordPairs}
                setWordPairs={setWordPairs}
                handleSave={handleSave}
                onCancel={() => router.push("/dashboard")}
              />
            )}
          </div>

          {/* Right Pane */}
          <div className="w-full md:w-1/2">
            <div
              className="relative h-full bg-[#242424] rounded-xl p-6 flex flex-col overflow-auto"
              style={{
                maxHeight: leftPaneHeight
                  ? `max(calc(100vh - 9.1rem), ${leftPaneHeight}px)`
                  : "calc(100vh - 9.1rem)",
              }}
            >
              {wordPairs.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-medium">Word Pairs Preview</h1>
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-white"
                    title="Reset word pairs"
                  >
                    <FontAwesomeIcon icon={faUndo} className="h-4 w-4" />
                  </button>
                </div>
              )}
              <WordPairList
                wordPairs={
                  !secondStage && selectedTab === "generate" ? [] : wordPairs
                }
                generating={generating}
                emptyMessage1={selectedTab === "generate" ? "Generated word pairs will appear here" : "Imported word pairs will appear here"}
                emptyMessage2={selectedTab === "generate" ? "Fill in the form and click Generate to create your custom language learning deck" : "Drop a CSV or JSON file and we will extract your word pairs"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDeck;
