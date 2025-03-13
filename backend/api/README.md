made changes to sql:

update schem: npx drizzle-kit introspect
generate migration: npx drizzle-kit generate

made changes to schema:

generate migration: npx drizzle-kit generate
push to database: npx drizzle-kit push


after making changes to endpoints structure: npx tsoa routes && npx tsoa spec


First run migrations: npx ts-node scripts/migrate.ts
Seed the database: npx ts-node scripts/seed.ts
Start the development server: npm run dev
Swagger: npx tsoa routes && npx tsoa spec

sudo -i -u postgres
psql
CREATE DATABASE deckgen;
CREATE USER pguser WITH PASSWORD '';
GRANT ALL PRIVILEGES ON DATABASE deckgen TO pguser;
\q
exit

start postgre:

sudo service postgresql start