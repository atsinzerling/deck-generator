"use client";
import React, { useState, useEffect } from "react";
import { parseTextIntoWordPairs, parseImportFile } from "@/lib/importUtil";
import { ExtractNameRequest, WordPairSummary } from "@/types/decks";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaste } from "@fortawesome/free-solid-svg-icons";
import { FormatInfoTooltip } from "./FormatInfoTooltip";
import { api } from "@/lib/api";
import { Circles, MutatingDots } from "react-loader-spinner";

interface ImportPaneProps {
  secondStage: boolean;
  setSecondStage: (val: boolean) => void;
  generating: boolean;
  fromLanguage: string;
  setFromLanguage: (val: string) => void;
  toLanguage: string;
  setToLanguage: (val: string) => void;
  deckName: string;
  setDeckName: (val: string) => void;
  wordPairs: WordPairSummary[];
  setWordPairs: (pairs: WordPairSummary[]) => void;
  handleSave: () => void;
  onCancel: () => void;
}

const ImportPane: React.FC<ImportPaneProps> = ({
  secondStage,
  setSecondStage,
  generating,
  fromLanguage,
  setFromLanguage,
  toLanguage,
  setToLanguage,
  deckName,
  setDeckName,
  wordPairs,
  setWordPairs,
  handleSave,
  onCancel,
}) => {
  const [importText, setImportText] = useState("");
  const [termSeparator, setTermSeparator] = useState("tab");
  const [rowSeparator, setRowSeparator] = useState("newline");
  const [customTermSeparator, setCustomTermSeparator] = useState(" - ");
  const [customRowSeparator, setCustomRowSeparator] = useState("\\n\\n");

  const [extractingName, setExtractingName] = useState(false);

  // Helper: parse the import text whenever user changes text or separators
  const parseImportText = (text: string) => {
    try {
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
      return parseTextIntoWordPairs(text, termSep, rowSep);
    } catch (error) {
      toast.error("Failed to parse import text. Please check your format and try again.");
      return [];
    }
  };

  useEffect(() => {
    const newPairs = parseImportText(importText);
    setWordPairs(newPairs);
  }, [
    importText,
    termSeparator,
    rowSeparator,
    customTermSeparator,
    customRowSeparator,
    setWordPairs,
  ]);

  const onContinue = () => {
    setSecondStage(true);
  };

  const onContinueAndExtractName = async () => {
    setExtractingName(true);
    setSecondStage(true);
    const request: ExtractNameRequest = {
      wordpairs: wordPairs,
    };
    const {success, data, error: apiError} = await api.decks.extractName(request);
    if (!success) {
      toast.error("Failed to extract name. Please enter deck name, languageFrom, and languageTo manually.");
    } else if (data) {
      setDeckName(data.name);
      setFromLanguage(data.languageFrom);
      setToLanguage(data.languageTo);
    }
    setExtractingName(false);
  }

  // Handle drop files
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
            onContinue();
          } else {
            toast.error("No valid word pairs found in the file");
          }
        } catch (error) {
          toast.error(
            "Failed to parse file: " +
              (error instanceof Error ? error.message : "Unknown error")
          );
        }
      }
    };
    reader.readAsText(file);
  };

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
      "text/csv": [".csv"],
      "application/json": [".json"],
    },
  });

  // Handle text area "Tab" insertion
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue =
        textarea.value.substring(0, start) + "\t" + textarea.value.substring(end);
      setImportText(newValue);
      // move cursor after inserted tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1;
      }, 0);
    }
  };

  // Handle clipboard paste
  const handlePasteFromClipboard = () => {
    navigator.clipboard.readText().then((text) => {
      setImportText(text);
    });
  };

  return (
    <div className="space-y-6">
      {/* If user hasn't continued, show the "import" form */}
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

          {/* Text area + paste button */}
          <div className="relative">
            <div className="absolute top-3 right-4 flex gap-3">
              <Button variant="ghost" size="icon" onClick={handlePasteFromClipboard}>
                <FontAwesomeIcon icon={faPaste} className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
            <Textarea
              className="w-full h-32 bg-[#1a1a1a] border border-gray-600 rounded-lg p-4 font-mono text-sm text-gray-400 resize-none focus:outline-none"
              placeholder="Paste your deck data here..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              onKeyDown={handleTextareaKeyDown}
            />
          </div>

          {/* Term separator */}
          <div className="space-y-3 mb-3">
            <h3 className="text-sm font-medium text-gray-300">Term separator</h3>
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

          {/* Row separator */}
          <div className="space-y-3 mb-3">
            <h3 className="text-sm font-medium text-gray-300">Row separator</h3>
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

          {/* Continue button if we have some wordPairs */}
          {wordPairs.length > 0 && (
            <Button
              onClick={onContinueAndExtractName}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#4f46e5] rounded-lg hover:bg-[#4338ca] text-white"
            >
              Continue
            </Button>
          )}
        </>
      ) : (
        // Once user clicks Continue, show the "final" part of import flow
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-1/2 space-y-2">
              <label className="block text-sm font-medium flex items-center">
                From Language
                {extractingName && (
                  <div className="ml-2">
                    <Circles
                      height="16"
                      width="16"
                      color="#4f46e5"
                      ariaLabel="extracting-language"
                      visible={true}
                    />
                  </div>
                )}
              </label>
              <Input
                type="text"
                name="fromLanguage"
                placeholder="e.g., English"
                value={fromLanguage}
                onChange={(e) => setFromLanguage(e.target.value)}
                disabled={generating || extractingName}
                className="bg-[#1a1a1a] border-gray-600"
              />
            </div>
            <div className="w-1/2 space-y-2">
              <label className="block text-sm font-medium flex items-center">
                To Language
                {extractingName && (
                  <div className="ml-2">
                    <Circles
                      height="16"
                      width="16"
                      color="#4f46e5"
                      ariaLabel="extracting-language"
                      visible={true}
                    />
                  </div>
                )}
              </label>
              <Input
                type="text"
                name="toLanguage"
                placeholder="e.g., Spanish"
                value={toLanguage}
                onChange={(e) => setToLanguage(e.target.value)}
                disabled={generating || extractingName}
                className="bg-[#1a1a1a] border-gray-600"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium flex items-center">
              Deck Name
              {extractingName && (
                <div className="ml-2">
                  <Circles
                    height="16"
                    width="16"
                    color="#4f46e5"
                    ariaLabel="extracting-name"
                    visible={true}
                  />
                </div>
              )}
              <div className="ml-2">
                  <MutatingDots
                    height="14"
                    width="14"
                    radius="2"
                    color="#4f46e5"
                    secondaryColor="#4f46e5"
                    ariaLabel="extracting-name"
                    visible={true}
                  />
                </div>
            </label>
            <Input
              type="text"
              name="deckName"
              placeholder="Name for your deck"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              disabled={extractingName}
              className="bg-[#1a1a1a] border-gray-600"
            />
          </div>
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
        </div>
      )}
    </div>
  );
};

export default ImportPane; 