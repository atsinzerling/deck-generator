import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/Card";

interface DeckTileProps {
  id: number;
  name: string;
  languageFrom: string;
  languageTo: string;
  onClick: () => void;
}

const DeckTile: React.FC<DeckTileProps> = ({ id, name, languageFrom, languageTo, onClick }) => {
  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-lg transition-shadow">
      <CardHeader>
        <h2 className="text-lg font-semibold">{name}</h2>
      </CardHeader>
      <CardContent>
        <p>{languageFrom} ➔ {languageTo}</p>
      </CardContent>
    </Card>
  );
};

export default DeckTile; 