"use client";

import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

type FormatInfoTooltipProps = {
  className?: string;
};

const FormatInfoTooltip: React.FC<FormatInfoTooltipProps> = ({ className = "" }) => {
  return (
    <span className={`relative group inline-flex items-center ${className}`}>
      <FontAwesomeIcon
        icon={faQuestionCircle}
        className="w-3 h-3 text-gray-400 hover:text-gray-300 cursor-pointer"
      />
      <div className="absolute left-0 bottom-full mb-1 hidden group-hover:block bg-[#2f2f2f] text-xs p-3 rounded shadow-lg w-[28rem] z-10">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1 border-r border-gray-600 pr-3">
            <div className="font-semibold mb-2">CSV Format</div>
            <div className="bg-[#1a1a1a] p-2 rounded">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-700 px-2 py-1">From Language</th>
                    <th className="border border-gray-700 px-2 py-1">To Language</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1">hello</td>
                    <td className="border border-gray-700 px-2 py-1">hola</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1">goodbye</td>
                    <td className="border border-gray-700 px-2 py-1">adiós</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="col-span-1 pl-2">
            <div className="font-semibold mb-2">JSON Format</div>
            <pre className="bg-[#1a1a1a] p-2 rounded text-xs text-left whitespace-pre">
{`{"name": "deck_name",
 "languageFrom": "src_lng",
 "languageTo": "target_lng",
 "wordpairs": [
  {"wordOriginal": "w1",
  "wordTranslation": "w2"},
 ]}`}
            </pre>
          </div>
        </div>
      </div>
    </span>
  );
};

export { FormatInfoTooltip }; 