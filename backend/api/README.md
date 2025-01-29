First run migrations: npx ts-node scripts/migrate.ts
Seed the database: npx ts-node scripts/seed.ts
Start the development server: npm run dev

sudo -i -u postgres
psql
CREATE DATABASE deckgen;
CREATE USER pguser WITH PASSWORD '';
GRANT ALL PRIVILEGES ON DATABASE deckgen TO pguser;
\q
exit