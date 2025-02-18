import { relations } from "drizzle-orm/relations";
import { decks, wordpairs } from "./schema";

export const wordpairsRelations = relations(wordpairs, ({one}) => ({
	deck: one(decks, {
		fields: [wordpairs.deckId],
		references: [decks.id]
	}),
}));

export const decksRelations = relations(decks, ({many}) => ({
	wordpairs: many(wordpairs),
}));