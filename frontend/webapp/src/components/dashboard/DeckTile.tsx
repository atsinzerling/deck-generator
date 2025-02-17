import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { formatRelativeDate } from "@/lib/dates";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faExchangeAlt, faLayerGroup, faClock } from '@fortawesome/free-solid-svg-icons';

interface DeckTileProps {
  id: number;
  name: string;
  languageFrom: string;
  languageTo: string;
  cardCount?: number;
  lastModified?: string;
  onClick: () => void;
}

const DeckTile: React.FC<DeckTileProps> = ({ 
  name, 
  languageFrom, 
  languageTo, 
  cardCount = 0,
  lastModified,
  onClick 
}) => {
  return (
    <Card 
      onClick={onClick} 
      className="cursor-pointer hover:bg-[#2f2f2f] transition-colors duration-200 bg-[#242424] text-gray-200"
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-semibold">{name}</h2>
          <FontAwesomeIcon icon={faChevronRight} className="text-gray-500" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-gray-400">
        <p className="text-sm">
          <FontAwesomeIcon icon={faExchangeAlt} className="mr-2" />
          {languageFrom} → {languageTo}
        </p>
        <p className="text-sm">
          <FontAwesomeIcon icon={faLayerGroup} className="mr-2" />
          {cardCount} word pairs
        </p>
        {lastModified && (
          <p className="text-sm">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            Last modified: {formatRelativeDate(lastModified)}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DeckTile; 