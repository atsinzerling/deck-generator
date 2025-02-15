import React from 'react';
import { ScrollArea } from "@/components/ui/ScrollArea";
import WordPairTile from "@/components/WordPairTile";
import { ShortWordPair } from "@/types/decks";

interface WordPairListProps {
  wordPairs: ShortWordPair[];
  title?: string;
  isRefining?: boolean;
}

const WordPairList: React.FC<WordPairListProps> = ({ 
  wordPairs, 
  title = "Generated Word Pairs",
  isRefining = false
}) => {
  return (
    <div className="h-full bg-[#242424] rounded-xl p-6 flex flex-col max-h-[calc(100vh)]">
      <h2 className="text-2xl font-bold mb-8">{title}</h2>
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-4">
            {wordPairs.map((pair, index) => (
              <WordPairTile key={index} pair={pair} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default WordPairList; 