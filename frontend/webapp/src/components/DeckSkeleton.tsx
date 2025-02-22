import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const DeckSkeleton: React.FC = () => {
  return (
    <div className="w-full md:w-7/8 bg-[#242424] rounded-xl p-2">
      {/* Deck Name Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-9 w-3/4 bg-gray-700/50 rounded" />
      </div>
      {/* Private/Public Visibility Skeleton */}
      <div className="mb-4">
        <Skeleton className="h-6 w-1/6 bg-gray-700/50 rounded" />
      </div>
      {/* Language Details: from/to and created/modified */}
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-1/4 bg-gray-700/50 rounded" />
        <Skeleton className="h-4 w-1/3 bg-gray-700/50 rounded" />
      </div>
      {/* Refine Box Skeleton */}
      <div className="mt-20">
        <Skeleton className="h-14 w-full bg-gray-700/50 rounded-lg border border-gray-700/50" />
      </div>
    </div>
  );
};

export default DeckSkeleton; 