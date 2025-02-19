import { z } from 'zod';

export const GenerateDeckRequestSchema = z.object({
	prompt: z.string().min(1, { message: "Prompt is required" })
  });
  
export const RefineDeckRequestSchema = z.object({
	prompt: z.string().min(1, { message: "Prompt is required" }),
	history: z.array(z.string()),
	currentDeck: z.object({
	  name: z.string().min(1),
	  languageFrom: z.string().min(1),
	  languageTo: z.string().min(1),
	  wordpairs: z.array(z.object({
		wordOriginal: z.string(),
		wordTranslation: z.string()
	  }))
	})
  });
  
export const CreateDeckRequestSchema = z.object({
	name: z.string().min(1, { message: "Name is required" }),
	languageFrom: z.string().min(1, { message: "languageFrom is required" }),
	languageTo: z.string().min(1, { message: "languageTo is required" }),
	wordpairs: z.array(z.object({
	  wordOriginal: z.string(),
	  wordTranslation: z.string()
	}))
  });
  
export const UpdateDeckRequestSchema = z.object({
	id: z.number().min(1, { message: "ID is required" }),
	name: z.string().min(1, { message: "Name is required" }),
	languageFrom: z.string().min(1, { message: "languageFrom is required" }),
	languageTo: z.string().min(1, { message: "languageTo is required" }),
	wordpairs: z.array(z.object({
	  wordOriginal: z.string(),
	  wordTranslation: z.string()
	}))
  });