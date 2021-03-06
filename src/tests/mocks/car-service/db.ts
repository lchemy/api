import Knex from "knex";

export const db = Knex({
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
