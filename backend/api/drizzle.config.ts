import { defineConfig } from "drizzle-kit";
import { getDbConnectionString } from "./src/utils/database";

export default defineConfig({
	out: './src/drizzle',
	schema: './src/drizzle/schema.ts',
	dialect: 'postgresql',
	dbCredentials: {
	  url: getDbConnectionString(),
	},
  });
