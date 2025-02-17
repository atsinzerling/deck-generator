import { Skeleton } from "@/components/ui/Skeleton";

const SkeletonDashboard = () => {
  return (
    <>
      {[...Array(2)].map((_, index) => (
        <Skeleton
          key={index}
          className="h-44 w-full rounded-lg bg-gray-700/50"
        />
      ))}
    </>
  );
};

export default SkeletonDashboard;
