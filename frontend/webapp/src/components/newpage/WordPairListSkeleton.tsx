import React from "react";
import { Skeleton } from "@/components/ui/Skeleton";

const WordPairListSkeleton: React.FC = () => {
  const skeletonRows = 5; // You can adjust the number of skeleton items here
  return (
    <div className="space-y-4 pr-4">
      {Array.from({ length: skeletonRows }).map((_, index) => (
        <div key={index} className="flex gap-4">
          <Skeleton className="w-1/2 h-14 bg-[#2f2f2f] rounded-lg" />
          <Skeleton className="w-1/2 h-14 bg-[#363636] rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default WordPairListSkeleton; 