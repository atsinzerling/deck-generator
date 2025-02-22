import React from "react";
import CustomScrollArea from "@/components/CustomScrollArea";
import WordPairTile from "@/components/WordPairTile";
import { WordPairUpdateInput } from "@/types/decks";
import { Circles } from "react-loader-spinner";
import WordPairListSkeleton from "@/components/WordPairListSkeleton";

interface WordPairListProps {
  wordPairs: WordPairUpdateInput[];
  title?: string;
  loading?: boolean; // when waiting for data, show skeleton
  generating?: boolean; // when generating data, show spinner
  emptyMessage1?: string; // when empty, show messages
  emptyMessage2?: string;
}

const WordPairList: React.FC<WordPairListProps> = ({
  wordPairs,
  loading = false,
  generating = false,
  emptyMessage1 = "It looks like you haven't added any word pairs yet. Add some to get started!",
  emptyMessage2 = "Fill in the form and click Generate to create your custom language learning deck",
}) => {
  return (
    <div className="h-full bg-[#242424] rounded-xl p-6 flex flex-col max-h-[calc(100vh)] relative">
      {/* <h2 className="text-2xl font-bold mb-8">{title}</h2> */}
      {loading ? (
        <WordPairListSkeleton />
      ) : (
        <>
          {!generating && wordPairs.length === 0 ? ( // when not generating and empty , show empty message
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
              <div className="text-2xl font-medium text-center">
                {emptyMessage1}
              </div>
              <div className="text-sm text-gray-500 text-center max-w-md">
                {emptyMessage2}
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <CustomScrollArea className="h-full">
                <div className="space-y-4 pr-4">
                  {wordPairs.map((pair, index) => (
                    <WordPairTile key={index} pair={pair} />
                  ))}
                </div>
              </CustomScrollArea>
            </div>
          )}
        </>
      )}
      {generating && (
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
