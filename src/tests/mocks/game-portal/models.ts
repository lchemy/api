import { Validator, rules } from "@lchemy/model/validation";

export interface AuthUser {
	isAdmin: boolean;
}

export interface Category {
	id: number;
	name: string;
	games?: Game[];
}

export interface Game {
	id: number;
	category: Category;
	name: string;
	authors: User[];
	reviews?: Review[];
}

export interface GameAuthor {
	game: Game;
	author: User;
}

export interface User {
	id: number;
	email: string;
	name: string;
	info: UserInfo;
	games?: Game[];
	reviews?: Review[];
}

export interface UserInfo {
	userId?: number;
	age: number;
}

export interface Review {
	id: number;
	game: Game;
	author: User;
	rating: number;
	title: string;
	body: string;
}

export interface GameRating {
	game: Game;
	rating: number;
}

export const gameValidator = new Validator<Game>({
	category: [
		rules.required(),
		rules.model({
			id: [
				rules.required(),
				rules.isInt()
			]
		})
	],
	name: [
		rules.required(),
		rules.isString()
	],
	authors: [
		rules.required(),
		rules.isArray(),
		rules.each([
			rules.required(),
			rules.model({
				id: [
					rules.required(),
					rules.isInt()
				]
			})
		])
	]
});

export const userUpdateValidator = new Validator<User>({
	name: [
		rules.required(),
		rules.isString()
	],
	info: [
		rules.required(),
		rules.model({
			age: [
				rules.required(),
				rules.isInt()
			]
		})
	]
});

export const userInsertValidator = userUpdateValidator.extend({
	email: [
		rules.required(),
		rules.isEmail()
	]
});

export const reviewUpdateValidator = new Validator<Review>({
	rating: [
		rules.required(),
		rules.isInt()
	],
	title: [
		rules.required(),
		rules.isString()
	],
	body: [
		rules.required(),
		rules.isString()
	]
});

export const reviewInsertValidator = reviewUpdateValidator.extend({
	game: [
		rules.required(),
		rules.model({
			id: [
				rules.required(),
				rules.isInt()
			]
		})
	],
	author: [
		rules.required(),
		rules.model({
			id: [
				rules.required(),
				rules.isInt()
			]
		})
	]
});
