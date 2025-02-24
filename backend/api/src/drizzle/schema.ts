import { pgTable, serial, text, timestamp, index, foreignKey, integer, smallint, pgView } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const decks = pgTable("decks", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	languageFrom: text("language_from").notNull(),
	languageTo: text("language_to").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastModified: timestamp("last_modified", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const wordpairs = pgTable("wordpairs", {
	id: serial().primaryKey().notNull(),
	deckId: integer("deck_id").notNull(),
	wordOriginal: text("word_original").notNull(),
	wordTranslation: text("word_translation").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastModified: timestamp("last_modified", { withTimezone: true, mode: 'string' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	position: smallint().notNull(),
}, (table) => [
	index("idx_wordpairs_deck_id").using("btree", table.deckId.asc().nullsLast().op("int4_ops")),
	foreignKey({
			columns: [table.deckId],
			foreignColumns: [decks.id],
			name: "wordpairs_deck_id_fkey"
		}).onDelete("cascade"),
]);
export const deckWithWordpairCount = pgView("deck_with_wordpair_count", {	id: integer(),
	name: text(),
	languageFrom: text("language_from"),
	languageTo: text("language_to"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }),
	lastModified: timestamp("last_modified", { withTimezone: true, mode: 'string' }),
	wordpairCount: integer("wordpair_count"),
}).as(sql`SELECT d.id, d.name, d.language_from, d.language_to, d.created_at, d.last_modified, count(w.id)::integer AS wordpair_count FROM decks d LEFT JOIN wordpairs w ON d.id = w.deck_id GROUP BY d.id`);