import { buildSchema } from "@lchemy/orm";

import { db } from "./db";

export const $categoriesSchema = buildSchema(db).defineTable("categories", (column) => {
	return {
		id: column.int("id"),
		name: column.string("name")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $gamesSchema = buildSchema(db).defineTable("games", (column) => {
	return {
		id: column.int("id"),
		categoryId: column.int("category_id"),
		name: column.string("name")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $gameAuthorsSchema = buildSchema(db).defineTable("game_authors", (column) => {
	return {
		id: column.int("id"),
		gameId: column.int("game_id"),
		authorId: column.int("author_id")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $usersSchema = buildSchema(db).defineTable("users", (column) => {
	return {
		id: column.int("id"),
		email: column.string("email"),
		name: column.string("name")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $userInfosSchema = buildSchema(db).defineTable("user_infos", (column) => {
	return {
		userId: column.int("user_id"),
		age: column.int("age")
	};
}).useFullNames().withPrimaryKey((schema) => schema.userId);

export const $reviewsSchema = buildSchema(db).defineTable("reviews", (column) => {
	return {
		id: column.int("id"),
		gameId: column.int("game_id"),
		authorId: column.int("author_id"),
		rating: column.float("rating"),
		title: column.string("title"),
		body: column.string("body")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);
