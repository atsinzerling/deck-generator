import React, { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

interface NewDeckTileProps {
  onClick: () => void;
  prefetch: () => void;
}

const NewDeckTile: React.FC<NewDeckTileProps> = ({ onClick, prefetch }) => {
  useEffect(() => {
    prefetch();
  }, [prefetch]);
  return (
    <div
      onClick={onClick}
      className="bg-[#242424] rounded-xl p-4 cursor-pointer hover:bg-[#2f2f2f] transition-colors duration-200 border-2 border-dashed border-[#4f46e5] flex flex-col items-center justify-center min-h-[11rem] h-full"
    >
      <FontAwesomeIcon 
        icon={faPlus} 
        className="text-4xl text-[#4f46e5] mb-4"
      />
      <span className="text-lg font-semibold text-[#4f46e5]">
        Create New Deck
      </span>
    </div>
  );
};

export default NewDeckTile;
