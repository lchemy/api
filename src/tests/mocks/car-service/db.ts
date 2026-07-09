import { knex } from "knex";

export const db = knex({
	client: "sqlite3",
	connection: {
		filename: ":memory:",
		debug: true
	},
	useNullAsDefault: true
});

afterAll(async () => {
	await db.destroy();
});
