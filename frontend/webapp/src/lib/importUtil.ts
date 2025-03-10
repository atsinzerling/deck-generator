import { WordPairSummary } from "@/types/decks";
import Papa from 'papaparse';  // You'll need to install this: npm install papaparse @types/papaparse

export interface ImportResult {
  wordPairs: WordPairSummary[];
  name: string;
  languageFrom: string;
  languageTo: string;
}

// Simple text import with separators
export function parseTextIntoWordPairs(text: string, termSeparator: string, rowSeparator: string): WordPairSummary[] {
  if (!text) return [];
  
  const rows = text.split(rowSeparator).filter(row => row.trim());
  const pairs = rows.map(row => {
    const terms = row.split(termSeparator);
    return terms.map(term => term.trim());
  }).filter(pair => pair.length >= 2 && (pair[0] || pair[1]));
  
  const wordPairs = pairs.map((pair, index) => ({
    wordOriginal: pair[0],
    wordTranslation: pair[1],
    position: index + 1,
  }));
  
  return wordPairs;
}

// Parse JSON file
export function parseJSONFile(content: string): ImportResult {
	const data = JSON.parse(content);

	const wordPairs = data.wordPairs.filter((pair: any) => pair.wordOriginal || pair.wordTranslation).map((pair: any, index: number) => ({
		wordOriginal: pair.wordOriginal || "",
		wordTranslation: pair.wordTranslation || "",
		position: index + 1,
	}));

	return {
		wordPairs,
		name: data.name,
		languageFrom: data.languageFrom,
		languageTo: data.languageTo
	};
}

// Parse CSV file
export function parseCSVFile(content: string, filename: string): ImportResult {
  const parseResult = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim()
  });
  
  if (parseResult.errors.length > 0) {
    throw new Error(`CSV parsing error: ${parseResult.errors[0].message}`);
  }
  if (!parseResult.meta.fields) {
    throw new Error("CSV header is missing");
  }
  if (parseResult.meta.fields.length < 2) {
    throw new Error("CSV header must contain at least two columns");
  }
  
  const languageFrom = parseResult.meta.fields[0];
  const languageTo = parseResult.meta.fields[1];
  
  const wordPairs: WordPairSummary[] = parseResult.data
    .filter((row: any) => row[languageFrom] || row[languageTo])
    .map((row: any, index: number) => ({
      wordOriginal: row[languageFrom] || "",
      wordTranslation: row[languageTo] || "",
      position: index + 1,
    }));
  
  const name = filename.replace(/\.[^/.]+$/, "");
  
  return { wordPairs, name, languageFrom, languageTo };
}

// Detect file type and parse accordingly
export function parseImportFile(content: string, filename: string): ImportResult {

  if (filename.endsWith(".json")) {
    return parseJSONFile(content);
  } else if (filename.endsWith(".csv")) {
    return parseCSVFile(content, filename);
  } else {
    throw new Error("Unsupported file type: " + filename);
  }
}

