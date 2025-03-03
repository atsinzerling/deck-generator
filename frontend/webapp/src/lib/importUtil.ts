import { WordPairSummary } from "@/types/decks";

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
  
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error("CSV file must contain at least a header row and one data row");
    }
    
    const header = parseCSVRow(lines[0]);
    if (header.length < 2) {
      throw new Error("CSV header must contain at least two columns");
    }
    
    const languageFrom = header[0];
    const languageTo = header[1];
    
    const wordPairs: WordPairSummary[] = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const row = parseCSVRow(lines[i]);
      if (row.length >= 2 && (row[0] || row[1])) {
        wordPairs.push({
          wordOriginal: row[0],
          wordTranslation: row[1],
          position: wordPairs.length + 1,
        });
      }
    }
    
    const name = filename.replace(/\.[^/.]+$/, "");
    
    return { wordPairs, name, languageFrom, languageTo };
}

// Helper function to parse CSV row, handling quotes properly
function parseCSVRow(row: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    
    if (char === '"') {
      if (inQuotes && i + 1 < row.length && row[i + 1] === '"') {
        // Double quotes inside quotes = escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
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

