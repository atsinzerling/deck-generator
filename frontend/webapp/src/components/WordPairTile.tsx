import React from 'react';
import { Card } from "@/components/ui/Card";

interface WordPair {
  word_original: string;
  word_translation: string;
}

interface WordPairTileProps {
  pair: WordPair;
}

const WordPairTile: React.FC<WordPairTileProps> = ({ pair }) => {
  return (
    <div className="flex space-x-4">
      <Card className="w-1/2 p-4 bg-[#2f2f2f] rounded-lg shadow-lg text-gray-200">
        {pair.word_original}
      </Card>
      <Card className="w-1/2 p-4 bg-[#242424] rounded-lg shadow-lg text-gray-200">
        {pair.word_translation}
      </Card>
    </div>
  );
};

export default WordPairTile; 