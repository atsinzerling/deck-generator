import React from 'react';
import { Card } from "@/components/ui/Card";
import { WordPairUpdateInput } from "@/types/decks";

interface WordPairTileProps {
  pair: WordPairUpdateInput;
}

const WordPairTile: React.FC<WordPairTileProps> = ({ pair }) => {
  return (
    <div className="flex gap-4">
      <div className="w-1/2 bg-[#2f2f2f] p-4 rounded-lg">
        {pair.wordOriginal}
      </div>
      <div className="w-1/2 bg-[#363636] p-4 rounded-lg">
        {pair.wordTranslation}
      </div>
    </div>
  );
};

export default WordPairTile; 