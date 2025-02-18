import { pgTable, foreignKey, serial, integer, text, timestamp } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"


export const wordpairs = pgTable("wordpairs", {
	id: serial().primaryKey().notNull(),
	deckId: integer("deck_id").notNull(),
	wordOriginal: text("word_original").notNull(),
	wordTranslation: text("word_translation").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastModified: timestamp("last_modified", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.deckId],
			foreignColumns: [decks.id],
			name: "wordpairs_deck_id_fkey"
		}).onDelete("cascade"),
]);

export const decks = pgTable("decks", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	languageFrom: text("language_from").notNull(),
	languageTo: text("language_to").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastModified: timestamp("last_modified", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
