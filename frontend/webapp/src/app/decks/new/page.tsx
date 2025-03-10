"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { LLMDeck, WordPairInput, WordPairSummary } from "@/types/decks";
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
} from "@fortawesome/free-solid-svg-icons";
import { PreserveToggle } from "@/components/PreserveToggle";
import toast from "react-hot-toast";
import { parseTextIntoWordPairs, parseImportFile } from "@/lib/importUtil";
import { cn } from "@/lib/utils";
import { useDropzone } from 'react-dropzone';
import { FormatInfoTooltip } from "@/components/newpage/FormatInfoTooltip";

const NewDeck: React.FC = () => {
  const [deckName, setDeckName] = useState("");
  const [fromLanguage, setFromLanguage] = useState("");
  const [toLanguage, setToLanguage] = useState("");
  const [proficiency, setProficiency] = useState("");
  const [theme, setTheme] = useState("");
  const [pairCount, setPairCount] = useState<number>(5);
  const [history, setHistory] = useState<string[]>([]);
  const [preserveExistingPairs, setPreserveExistingPairs] = useState(false);

  const [additionalPrompt, setAdditionalPrompt] = useState("");

  const [wordPairs, setWordPairs] = useState<WordPairSummary[]>([]);

  const [secondStage, setSecondStage] = useState<boolean>(false);
  const [generating, setGenerating] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<"generate" | "import">(
    "generate"
  );

  const [importText, setImportText] = useState("");
  const [termSeparator, setTermSeparator] = useState("tab");
  const [rowSeparator, setRowSeparator] = useState("newline");
  const [customTermSeparator, setCustomTermSeparator] = useState(" - ");
  const [customRowSeparator, setCustomRowSeparator] = useState("\\n\\n");

  const leftPaneRef = useRef<HTMLDivElement>(null);
  const [leftPaneHeight, setLeftPaneHeight] = useState<number | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles && acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0]);
      }
    },
    onDropRejected: () => {
      toast.error("Only CSV and JSON files are supported");
    },
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      // 'text/plain': ['.txt'],
    }
  });

  useEffect(() => {
    setWordPairs(parseImportText(importText));
    // TODO: handle parsing errors
  }, [importText, termSeparator, rowSeparator, customTermSeparator, customRowSeparator]);

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


  const parseImportText = (text: string) => {
    try{
      const termSep =
        termSeparator === "custom"
          ? customTermSeparator
          : termSeparator === "tab"
          ? "\t"
          : ",";
      const rowSep =
        rowSeparator === "custom"
          ? customRowSeparator.replace(/\\n/g, "\n")
          : rowSeparator === "newline"
          ? "\n"
          : ";";
      const importedPairs = parseTextIntoWordPairs(
        text,
        termSep,
        rowSep
      );
      return importedPairs;
    } catch (error) {
      toast.error("Failed to parse import text. Please check your format and try again.");
      return [];
    }
  };

  const handleContinue = () => {
    // setWordPairs(parseImportText(importText)); // is this part needed? apparently now
    setSecondStage(true);
  };

  const handlePasteFromClipboard = () => {
    navigator.clipboard.readText().then((text) => {
      setImportText(text);
    });
  };

  const handleSave = async () => {
    setGenerating(true);

    const payload = {
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

  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab character at cursor position
      const newValue = textarea.value.substring(0, start) + '\t' + textarea.value.substring(end);
      setImportText(newValue);
      
      // Move cursor after the inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === "string") {
        try {
          const result = parseImportFile(text, file.name);
        
          if (result.wordPairs.length > 0) {
            setWordPairs(result.wordPairs);
            setDeckName(result.name);
            setFromLanguage(result.languageFrom);
            setToLanguage(result.languageTo);
            handleContinue();
          } else {
            toast.error("No valid word pairs found in the file");
          }
        } catch (error) {
          toast.error("Failed to parse file: " + (error instanceof Error ? error.message : "Unknown error"));
        }
      }
    };
    reader.readAsText(file);
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
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-1/2 space-y-2">
                    <label className="block text-sm font-medium">
                      From Language
                    </label>
                    <Input
                      type="text"
                      name="fromLanguage"
                      placeholder="e.g., English"
                      value={fromLanguage}
                      onChange={(e) => setFromLanguage(e.target.value)}
                      disabled={secondStage || generating}
                      className="bg-[#1a1a1a] border-gray-600"
                    />
                  </div>

                  <div className="w-1/2 space-y-2">
                    <label className="block text-sm font-medium">
                      To Language
                    </label>
                    <Input
                      type="text"
                      name="toLanguage"
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
                    <label className="block text-sm font-medium">
                      Proficiency Level
                    </label>
                    <Input
                      type="text"
                      name="proficiency"
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
                      name="pairCount"
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
                  <label className="block text-sm font-medium">
                    Theme/Topic
                  </label>
                  <Input
                    type="text"
                    name="theme"
                    placeholder="e.g., Business, Travel, Food"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    disabled={secondStage || generating}
                    className="bg-[#1a1a1a] border-gray-600"
                  />
                </div>

                {secondStage && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Deck Name
                    </label>
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
                  <label className="block text-sm font-medium">
                    {secondStage
                      ? "Refine Instructions"
                      : "Additional Instructions"}
                  </label>
                  <Textarea
                    name="additionalPrompt"
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
                        onClick={() => {
                          router.push("/dashboard");
                        }}
                        disabled={generating}
                        className="w-1/2 px-4 py-2 bg-[#2f2f2f] text-white rounded-lg hover:bg-[#363636]"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {selectedTab === "import" && (
              <div className="space-y-6">
                <div className="space-y-6">
                  {!secondStage ? (
                    <>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                          isDragActive
                            ? "border-[#4f46e5] bg-[#4f46e5]/10"
                            : "border-gray-600"
                        }`}
                      >
                        <input {...getInputProps()} />
                        <i className="fas fa-file-upload text-3xl mb-3 text-gray-400"></i>
                        <div className="mb-2">
                          Drop CSV or JSON file here
                          <FormatInfoTooltip className="ml-1" />
                        </div>
                        <p className="text-sm text-gray-400">or click to browse</p>
                      </div>

                      <div className="flex items-center justify-center">
                        <div className="w-1/3 h-px bg-gray-700"></div>
                        <span className="px-4 text-gray-400">or</span>
                        <div className="w-1/3 h-px bg-gray-700"></div>
                      </div>

                      {/* Export Text Area and Actions */}
                      <div className="relative">
                        <div className="absolute top-3 right-4 flex gap-3">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={handlePasteFromClipboard}
                          >
                            <FontAwesomeIcon
                              icon={faPaste}
                              className="h-4 w-4 text-gray-400"
                            />
                          </Button>
                        </div>
                        <Textarea
                          className="w-full h-32 bg-[#1a1a1a] border border-gray-600 rounded-lg p-4 font-mono text-sm text-gray-400 resize-none focus:outline-none"
                          placeholder="Paste your deck data here..."
                          value={importText}
                          onChange={(e) => {
                            setImportText(e.target.value);
                          }}
                          onKeyDown={handleTextareaKeyDown}
                        />
                      </div>

                      {/* Term Separator Options */}
                      <div className="space-y-3 mb-3">
                        <h3 className="text-sm font-medium text-gray-300">
                          Term separator
                        </h3>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="termSeparator"
                              value="tab"
                              checked={termSeparator === "tab"}
                              onChange={(e) => setTermSeparator(e.target.value)}
                              className="hidden"
                            />
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                              {termSeparator === "tab" && (
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                              )}
                            </div>
                            <span className="text-sm text-white">Tab</span>
                          </label>
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="termSeparator"
                              value="comma"
                              checked={termSeparator === "comma"}
                              onChange={(e) => setTermSeparator(e.target.value)}
                              className="hidden"
                            />
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                              {termSeparator === "comma" && (
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                              )}
                            </div>
                            <span className="text-sm text-white">Comma</span>
                          </label>
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="termSeparator"
                              value="custom"
                              checked={termSeparator === "custom"}
                              onChange={(e) => setTermSeparator(e.target.value)}
                              className="hidden"
                            />
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                              {termSeparator === "custom" && (
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Custom"
                              value={customTermSeparator}
                              onChange={(e) => {
                                setTermSeparator("custom");
                                setCustomTermSeparator(e.target.value);
                              }}
                              className="bg-transparent border-b border-gray-600 w-20 text-sm text-white placeholder-white focus:outline-none focus:border-gray-400"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Row Separator Options */}
                      <div className="space-y-3 mb-3">
                        <h3 className="text-sm font-medium text-gray-300">
                          Row separator
                        </h3>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="rowSeparator"
                              value="newline"
                              checked={rowSeparator === "newline"}
                              onChange={(e) => setRowSeparator(e.target.value)}
                              className="hidden"
                            />
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                              {rowSeparator === "newline" && (
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                              )}
                            </div>
                            <span className="text-sm text-white">New line</span>
                          </label>
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="rowSeparator"
                              value="semicolon"
                              checked={rowSeparator === "semicolon"}
                              onChange={(e) => setRowSeparator(e.target.value)}
                              className="hidden"
                            />
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                              {rowSeparator === "semicolon" && (
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                              )}
                            </div>
                            <span className="text-sm text-white">Semicolon</span>
                          </label>
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-[#1a1a1a] rounded-lg cursor-pointer">
                            <input
                              type="radio"
                              name="rowSeparator"
                              value="custom"
                              checked={rowSeparator === "custom"}
                              onChange={(e) => setRowSeparator(e.target.value)}
                              className="hidden"
                            />
                            <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center">
                              {rowSeparator === "custom" && (
                                <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Custom"
                              value={customRowSeparator}
                              onChange={(e) => {
                                setRowSeparator("custom");
                                setCustomRowSeparator(e.target.value);
                              }}
                              className="bg-transparent border-b border-gray-600 w-20 text-sm text-white placeholder-white focus:outline-none focus:border-gray-400"
                            />
                          </label>
                        </div>
                      </div> 
                    </>
                  ) : (
                    <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1/2 space-y-2">
                        <label className="block text-sm font-medium">
                          From Language
                        </label>
                        <Input
                          type="text"
                          name="fromLanguage"
                          placeholder="e.g., English"
                          value={fromLanguage}
                          onChange={(e) => setFromLanguage(e.target.value)}
                          disabled={generating}
                          className="bg-[#1a1a1a] border-gray-600"
                        />
                      </div>
                      <div className="w-1/2 space-y-2">
                        <label className="block text-sm font-medium">
                          To Language
                        </label>
                        <Input
                          type="text"
                          name="toLanguage"
                          placeholder="e.g., Spanish"
                          value={toLanguage}
                          onChange={(e) => setToLanguage(e.target.value)}
                          disabled={generating}
                          className="bg-[#1a1a1a] border-gray-600"
                        />
                      </div>
                      
                    </div>
                    <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Deck Name
                    </label>
                    <Input
                      type="text"
                      name="deckName"
                      placeholder="Name for your deck"
                      value={deckName}
                      onChange={(e) => setDeckName(e.target.value)}
                      className="bg-[#1a1a1a] border-gray-600"
                    />
                  </div>
                    </div>
                  )}
                  

                  <div className="space-y-4">
                  {!secondStage && wordPairs.length > 0 && <Button
                    onClick={handleContinue}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] text-white"
                  >
                    {/* <FontAwesomeIcon
                      icon={faFileImport}
                      className="h-4 w-4"
                    /> */}
                    Continue
                  </Button>}
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
                        onClick={() => {
                          router.push("/dashboard");
                        }}
                        disabled={generating}
                        className="w-1/2 px-4 py-2 bg-[#2f2f2f] text-white rounded-lg hover:bg-[#363636]"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                  </div>

                </div>
              </div>
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
              <WordPairList
                wordPairs={
                  !secondStage && selectedTab === "generate" ? [] : wordPairs
                }
                generating={generating}
                emptyMessage1={selectedTab === "generate" ? "Generated word pairs will appear here" : "Imported word pairs will appear here"}
                emptyMessage2={selectedTab === "generate" ? "Fill in the form and click Generate to create your custom language learning deck" : "Drop a CSV or JSON file to import your word pairs"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewDeck;
