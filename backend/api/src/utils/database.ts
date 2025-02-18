import 'dotenv/config';

export function getDbConnectionString() : string {
	const connectionString = `postgresql://${process.env.PG_USER}:${process.env.PG_PASSWORD}@${process.env.PG_HOST}:${process.env.PG_PORT}/${process.env.PG_DATABASE}`;
	return connectionString;
};


