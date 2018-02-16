import { Chance } from "chance";
import { Map } from "immutable";

import { db } from "./db";
import { Category, Game, GameRating, Review, User } from "./models";

const BATCH_INSERT_LIMIT = 100;

export async function createTables(): Promise<void> {
	await db.raw(`
		CREATE TABLE categories (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name STRING
		);
	`);
	await db.raw(`
		CREATE TABLE games (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			category_id INTEGER,
			name STRING
		);
	`);
	await db.raw(`
		CREATE TABLE game_authors (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			game_id INTEGER,
			author_id INTEGER
		);
	`);
	await db.raw(`
		CREATE TABLE users (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			email STRING,
			name STRING
		);
	`);
	await db.raw(`
		CREATE TABLE user_infos (
			user_id INTEGER,
			age REAL
		);
	`);
	await db.raw(`
		CREATE TABLE reviews (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			game_id INTEGER,
			author_id INTEGER,
			rating REAL,
			title STRING,
			body STRING
		);
	`);
}

export async function clearData(): Promise<void> {
	await db.raw(`
		DELETE FROM categories;
	`);
	await db.raw(`
		DELETE FROM games;
	`);
	await db.raw(`
		DELETE FROM game_authors;
	`);
	await db.raw(`
		DELETE FROM users;
	`);
	await db.raw(`
		DELETE FROM user_infos;
	`);
	await db.raw(`
		DELETE FROM reviews;
	`);
}

export async function deleteTables(): Promise<void> {
	await db.raw(`
		DROP TABLE IF EXISTS categories;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS games;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS game_authors;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS users;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS user_infos;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS reviews;
	`);
}

export interface Data {
	categories: Category[];
	games: Game[];
	users: User[];
	reviews: Review[];
	ratings: GameRating[];

	categoriesMap: Map<number, Category>;
	gamesMap: Map<number, Game>;
	usersMap: Map<number, User>;
	reviewsMap: Map<number, Review>;
	ratingsMap: Map<number, GameRating>;
}

export async function mockData(seed: Chance.Seed = 0): Promise<Data> {
	const chance = new Chance(seed);

	// generate categories
	const categoriesCount = 3;
	const categories = chance.unique(chance.word, categoriesCount).map((name, i) => {
		return {
			id: i + 1,
			name,
			games: []
		} as Category;
	});

	// insert categories
	await db.batchInsert("categories", categories.map((category) => {
		return {
			id: category.id,
			name: category.name
		};
	}), BATCH_INSERT_LIMIT);

	// generate users
	const usersCount = chance.integer({ min: 25, max: 50 });
	const users = Array(usersCount).fill(undefined).map((_, i) => {
		return {
			id: i + 1,
			email: chance.email(),
			name: chance.name(),
			info: {
				age: chance.age()
			},
			games: [],
			reviews: []
		} as User;
	});

	// insert users
	await db.batchInsert("users", users.map((user) => {
		return {
			id: user.id,
			email: user.email,
			name: user.name
		};
	}), BATCH_INSERT_LIMIT);

	// insert user infos
	await db.batchInsert("user_infos", users.map((user) => {
		return {
			user_id: user.id,
			age: user.info.age
		};
	}), BATCH_INSERT_LIMIT);

	// generate games
	const gamesCount = chance.integer({ min: 5, max: 10 });
	const games = Array(gamesCount).fill(undefined).map((_, i) => {
		const category = chance.pickone(categories),
			authorsCount = chance.integer({ min: 1, max: 3 }),
			authors = chance.pickset(users, authorsCount),
			name = chance.n(chance.word, chance.integer({ min: 1, max: 3})).join(" ");

		const game = {
			id: i + 1,
			category,
			name,
			authors,
			reviews: []
		} as Game;

		category.games!.push(game);
		authors.forEach((author) => {
			author.games!.push(game);
		});

		return game;
	});

	// insert games
	await db.batchInsert("games", games.map((game) => {
		return {
			id: game.id,
			category_id: game.category.id,
			name: game.name
		};
	}), BATCH_INSERT_LIMIT);

	// insert game authors
	await db.batchInsert("game_authors", games.reduce((memo, game) => {
		return memo.concat(game.authors.map((author) => {
			return {
				game_id: game.id,
				author_id: author.id
			};
		}));
	}, [] as any[]), BATCH_INSERT_LIMIT);

	// generate reviews
	const reviewsCount = chance.integer({ min: 50, max: 150 });
	const reviews = Array(reviewsCount).fill(undefined).map((_, i) => {
		const game = chance.pickone(games),
			author = chance.pickone(users),
			rating = Math.min(10, Math.max(1, chance.normal({ mean: 6.5, dev: 2 })));

		const review = {
			id: i + 1,
			game,
			author,
			rating,
			title: chance.sentence(),
			body: chance.paragraph()
		} as Review;

		game.reviews!.push(review);
		author.reviews!.push(review);

		return review;
	});

	// insert reviews
	await db.batchInsert("reviews", reviews.map((review) => {
		return {
			id: review.id,
			game_id: review.game.id,
			author_id: review.author.id,
			rating: review.rating,
			title: review.title,
			body: review.body
		};
	}), BATCH_INSERT_LIMIT);

	const ratings = games.filter((game) => {
		return game.reviews!.length > 0;
	}).map((game) => {
		const reviewRatings = game.reviews!.map((review) => review.rating),
			rating = reviewRatings.reduce((prev, curr) => prev + curr, 0) / reviewRatings.length;

		return {
			game,
			rating
		} as GameRating;
	});

	const categoriesMap = Map(categories.map((category) => [category.id, category] as [number, Category])),
		gamesMap = Map(games.map((game) => [game.id, game] as [number, Game])),
		usersMap = Map(users.map((user) => [user.id, user] as [number, User])),
		reviewsMap = Map(reviews.map((review) => [review.id, review] as [number, Review])),
		ratingsMap = Map(ratings.map((rating) => [rating.game.id, rating] as [number, GameRating]));

	return {
		categories,
		games,
		users,
		reviews,
		ratings,
		categoriesMap,
		gamesMap,
		usersMap,
		reviewsMap,
		ratingsMap
	};
}
