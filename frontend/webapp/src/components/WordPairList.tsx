import React from 'react';
import { ScrollArea } from "@/components/ui/ScrollArea";
import WordPairTile from "@/components/WordPairTile";
import { ShortWordPair } from "@/types/decks";
import WordPairPlaceholder from "@/components/WordPairPlaceholder";
import { Circles } from 'react-loader-spinner';

interface WordPairListProps {
  wordPairs: ShortWordPair[];
  title?: string;
  loading?: boolean;
}

const WordPairList: React.FC<WordPairListProps> = ({ 
  wordPairs,
  loading = false
}) => {

  return (
    <div className="h-full bg-[#242424] rounded-xl p-6 flex flex-col max-h-[calc(100vh)] relative">
      {/* <h2 className="text-2xl font-bold mb-8">{title}</h2> */}
      {wordPairs.length === 0 && !loading ? (
    <WordPairPlaceholder />
  ) : (
    <div className="flex-1 min-h-0">
      <ScrollArea className="h-full">
        <div className="space-y-4 pr-4">
          {wordPairs.map((pair, index) => (
            <WordPairTile key={index} pair={pair} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )}
      {loading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
          <Circles
            height="80"
            width="80"
            color="#4f46e5"
            ariaLabel="loading-indicator"
            visible={true}
          />
        </div>
      )}
    </div>
  );
};

export default WordPairList; 