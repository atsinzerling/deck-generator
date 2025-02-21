"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import {Textarea} from "@/components/ui/Textarea";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faFileCode,
  faFileCsv,
  faCopy,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

interface WordPair {
  wordOriginal: string;
  wordTranslation: string;
}

interface ExportModalProps {
  wordPairs: WordPair[];
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ wordPairs, onClose }) => {
  const [termSeparator, setTermSeparator] = useState("tab");
  const [rowSeparator, setRowSeparator] = useState("newline");
  const [customTermSeparator, setCustomTermSeparator] = useState(" - ");
  const [customRowSeparator, setCustomRowSeparator] = useState("\\n\\n");

  const getExportText = () => {
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
    return wordPairs
      .map((pair) => `${pair.wordOriginal}${termSep}${pair.wordTranslation}`)
      .join(rowSep);
  };

  const downloadFile = (dataStr: string, fileName: string, mimeType: string) => {
    const a = document.createElement("a");
    a.setAttribute("href", `data:${mimeType};charset=utf-8,` + encodeURIComponent(dataStr));
    a.setAttribute("download", fileName);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAsJson = () => {
    const dataStr = JSON.stringify(wordPairs, null, 2);
    downloadFile(dataStr, "deck.json", "text/json");
  };

  const downloadAsCsv = () => {
    const csvContent = wordPairs
      .map((pair) => `${pair.wordOriginal},${pair.wordTranslation}`)
      .join("\n");
    downloadFile(csvContent, "deck.csv", "text/csv");
  };

  const downloadAsText = () => {
    const textContent = getExportText();
    downloadFile(textContent, "deck.txt", "text/plain");
  };

  const copyToClipboard = () => {
    navigator.clipboard
      .writeText(getExportText())
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy"));
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-[#242424] rounded-xl p-6 w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Export</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} className="h-4 w-4 text-gray-400 hover:text-white" />
          </Button>
        </div>

        {/* Export Options */}
        <div className="flex gap-3 mb-6">
          <Button
            onClick={downloadAsJson}
            className="flex-1 px-4 py-2.5 bg-[#2f2f2f] rounded-lg hover:bg-[#363636] flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faFileCode} className="h-4 w-4" />
            Export as JSON
          </Button>
          <Button
            onClick={downloadAsCsv}
            className="flex-1 px-4 py-2.5 bg-[#2f2f2f] rounded-lg hover:bg-[#363636] flex items-center justify-center gap-2"
          >
            <FontAwesomeIcon icon={faFileCsv} className="h-4 w-4" />
            Export as CSV
          </Button>
        </div>

        <div className="text-center text-gray-400 my-4">or</div>

        {/* Term Separator Options */}
        <div className="space-y-3 mb-6">
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
                {termSeparator === "tab" && <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />}
              </div>
              <span className="text-sm text-gray-200">Tab</span>
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
                {termSeparator === "comma" && <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />}
              </div>
              <span className="text-sm text-gray-200">Comma</span>
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
                {termSeparator === "custom" && <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />}
              </div>
              <input
                type="text"
                placeholder="Custom"
                value={customTermSeparator}
                onChange={(e) => {
                  setTermSeparator("custom");
                  setCustomTermSeparator(e.target.value);
                }}
                className="bg-transparent border-b border-gray-600 w-20 text-sm focus:outline-none focus:border-gray-400"
              />
            </label>
          </div>
        </div>

        {/* Row Separator Options */}
        <div className="space-y-3 mb-6">
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
                {rowSeparator === "newline" && <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />}
              </div>
              <span className="text-sm text-gray-200">New line</span>
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
                {rowSeparator === "semicolon" && <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />}
              </div>
              <span className="text-sm text-gray-200">Semicolon</span>
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
                {rowSeparator === "custom" && <div className="w-2 h-2 rounded-full bg-[#4f46e5]" />}
              </div>
              <input
                type="text"
                placeholder="Custom"
                value={customRowSeparator}
                onChange={(e) => {
                  setRowSeparator("custom");
                  setCustomRowSeparator(e.target.value);
                }}
                className="bg-transparent border-b border-gray-600 w-20 text-sm focus:outline-none focus:border-gray-400"
              />
            </label>
          </div>
        </div>

        {/* Export Text Area and Actions */}
        <div className="relative">
          <div className="absolute top-2 right-2 flex gap-2">
            <Button variant="ghost" size="icon" onClick={copyToClipboard}>
              <FontAwesomeIcon icon={faCopy} className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadAsText}>
              <FontAwesomeIcon icon={faDownload} className="h-4 w-4" />
            </Button>
          </div>
          <Textarea
            className="w-full h-48 bg-[#1a1a1a] rounded-lg p-4 font-mono text-sm resize-none focus:outline-none"
            readOnly
            value={getExportText()}
          />
        </div>
      </div>
    </div>
  );
};

export default ExportModal; 