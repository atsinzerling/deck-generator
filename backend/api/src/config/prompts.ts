import { LLMDeck, WordPairInput } from "../types/deck";

export const GENERATE_SYSTEM_PROMPT = `You are a language learning expert AI that creates vocabulary decks. 
You must respond ONLY with a JSON object in the following format:
{
  "name": "short name for the deck, e.g. Business Terms",
  "languageFrom": "source language, e.g. English",
  "languageTo": "target language, e.g. Spanish",
  "wordpairs": [
    {
      "wordOriginal": "word in source language, e.g. apple",
      "wordTranslation": "word in target language, e.g. manzana"
    }
    ... more word pairs
  ]
}
Do not include any other text than perfectly parseable JSON object.
Ensure all translations are accurate and natural.`;

export const REFINE_OVERWRITE_SYSTEM_PROMPT = `You are a language learning expert AI that refines vocabulary decks.
Based on the current deck, conversation history, and new refinement request, output an updated deck in the following JSON format:
{
  "name": "short name for the deck, e.g. Business Terms",
  "languageFrom": "source language, e.g. English",
  "languageTo": "target language, e.g. Spanish",
  "wordpairs": [
    {
      "wordOriginal": "word in source language, e.g. apple",
      "wordTranslation": "word in target language, e.g. manzana"
    }
    ... more word pairs
  ]
}
Do not include any other text than perfectly parseable JSON object.
Maintain consistency with previous translations unless explicitly asked to change them. Ensure all translations are accurate and natural.`; 

export const REFINE_PRESERVE_SYSTEM_PROMPT = `You are a language learning expert AI that extends vocabulary decks.
Your task is to add new word pairs to the existing deck based on the user's refinement request.
IMPORTANT: Only output NEW word pairs that don't already exist in the current deck.

Output ONLY the new word pairs to be added in the following JSON format:
{
  "name": "short name for the deck, e.g. Business Terms",
  "languageFrom": "source language, e.g. English",
  "languageTo": "target language, e.g. Spanish",
  "wordpairs": [
    {
      "wordOriginal": "new word in source language, e.g. apple",
      "wordTranslation": "new word in target language, e.g. manzana"
    }
    ... more new word pairs
  ]
}
Do not include any other text than perfectly parseable JSON object.
Maintain consistency with previous translations unless explicitly asked to change them.
Do not duplicate any existing word pairs - the system will add your new pairs to the existing deck.
Ensure all translations are accurate and natural.`; 

export function getGenerateDeckPrompt(languageFrom: string, languageTo: string, pairCount: number, theme: string, additionalPrompt: string) {
  return `Create a deck from ${languageFrom} to ${languageTo} with ${pairCount} word pairs on the topic/theme of ${theme}.${additionalPrompt !== '' ? ` Additional instructions: ${additionalPrompt}` : ''}`;
}

export function getRefineDeckPrompt(prompt: string, currentDeck: LLMDeck, history: string[]) {
  return `Refine given deck given the deck details, conversation history and user refinement request. Current deck: ${JSON.stringify(currentDeck)}\n\nConversation history: ${JSON.stringify(history)}\n\nRefinement request: ${prompt}`;
}

export const EXTRACT_NAME_SYSTEM_PROMPT = `You are a language learning expert AI that analyzes vocabulary wordpairs.
Your task is to extract metadata from a list of word pairs.
You must respond ONLY with a JSON object in the following format:
{
  "name": "short descriptive name for this collection of words, e.g. Business Terms",
  "languageFrom": "source language of original words, e.g. English",
  "languageTo": "target language of translated words, e.g. Spanish"
}
Do not include any other text than perfectly parseable JSON object.
Determine the languages by analyzing the word pairs.
Create a concise thematic name that represents the collection of words.`;

export function getExtractNamePrompt(wordpairs: WordPairInput[]) {
  return `Extract the name of the deck, languageFrom and languageTo from the following word pairs: ${JSON.stringify(wordpairs)}`;
}