import {
	AggregateField,
	AggregateOrm,
	ColumnField,
	JoinManyField,
	JoinOneField,
	OrmRef,
	RelationalOrm,
	buildOrm
} from "@lchemy/orm";

import { $categoriesSchema, $gameAuthorsSchema, $gamesSchema, $reviewsSchema, $userInfosSchema, $usersSchema } from "./schemas";

export interface CategoriesOrm extends RelationalOrm {
	id: ColumnField<number>;
	name: ColumnField<string>;

	games: JoinManyField<GamesOrm>;
}
export const $categoriesOrm: OrmRef<CategoriesOrm> = buildOrm($categoriesSchema).defineRelation("category", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		name: column(schema.name),
		games: join.many($gamesOrm).on((game, category) => game.categoryId.$eq(category.id))
	};
});

export interface GamesOrm extends RelationalOrm {
	id: ColumnField<number>;

	categoryId: ColumnField<number>;
	category: JoinOneField<CategoriesOrm>;

	name: ColumnField<string>;

	authors: JoinManyField<UsersOrm>;
	reviews: JoinManyField<ReviewsOrm>;
}
export const $gamesOrm: OrmRef<GamesOrm> = buildOrm($gamesSchema).defineRelation("game", ({ column, join, schema }) => {
	return {
		id: column(schema.id),

		categoryId: column(schema.categoryId).exclude().alias((game) => game.category.id),
		category: join.one($categoriesOrm).on((game, category) => game.categoryId.$eq(category.id)),

		name: column(schema.name),

		authors: join.many($usersOrm).through($gameAuthorsOrm, (user, gameAuthor) => {
			return gameAuthor.authorId.$eq(user.id);
		}).on((_, gameAuthor, game) => {
			return gameAuthor.gameId.$eq(game.id);
		}).include(),

		reviews: join.many($reviewsOrm).on((review, game) => review.gameId.$eq(game.id))
	};
});

export interface GameAuthorsOrm extends RelationalOrm {
	id: ColumnField<number>;

	gameId: ColumnField<number>;
	game: JoinOneField<GamesOrm>;

	authorId: ColumnField<number>;
	author: JoinOneField<UsersOrm>;
}
export const $gameAuthorsOrm: OrmRef<GameAuthorsOrm> = buildOrm($gameAuthorsSchema).defineRelation("gameAuthor", ({ column, join, schema }) => {
	return {
		id: column(schema.id).exclude(),

		gameId: column(schema.gameId).exclude().alias((gameAuthor) => gameAuthor.game.id),
		game: join.one($gamesOrm).on((gameAuthor, game) => gameAuthor.gameId.$eq(game.id)),

		authorId: column(schema.authorId).exclude().alias((gameAuthor) => gameAuthor.author.id),
		author: join.one($usersOrm).on((gameAuthor, user) => gameAuthor.authorId.$eq(user.id))
	};
});

export interface UsersOrm extends RelationalOrm {
	id: ColumnField<number>;
	email: ColumnField<string>;
	name: ColumnField<string>;
	info: JoinOneField<UserInfosOrm>;

	games: JoinManyField<GamesOrm>;
	reviews: JoinManyField<ReviewsOrm>;
}
export const $usersOrm: OrmRef<UsersOrm> = buildOrm($usersSchema).defineRelation("user", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		email: column(schema.email),
		name: column(schema.name),
		info: join.one($userInfosOrm).on((user, info) => info.userId.$eq(user.id)),

		games: join.many($gamesOrm).through($gameAuthorsOrm, (game, gameAuthor) => {
			return gameAuthor.gameId.$eq(game.id);
		}).on((_, gameAuthor, user) => {
			return gameAuthor.authorId.$eq(user.id);
		}),
		reviews: join.many($reviewsOrm).on((review, user) => review.authorId.$eq(user.id))
	};
});

export interface UserInfosOrm extends RelationalOrm {
	userId: ColumnField<number>;
	age: ColumnField<number>;
}
export const $userInfosOrm: OrmRef<UserInfosOrm> = buildOrm($userInfosSchema).defineRelation("userInfo", ({ column, join, schema }) => {
	return {
		userId: column(schema.userId).exclude(),
		age: column(schema.age)
	};
});

export interface ReviewsOrm extends RelationalOrm {
	id: ColumnField<number>;

	gameId: ColumnField<number>;
	game: JoinOneField<GamesOrm>;
	authorId: ColumnField<number>;
	author: JoinOneField<UsersOrm>;

	rating: ColumnField<number>;
	title: ColumnField<string>;
	body: ColumnField<string>;
}
export const $reviewsOrm: OrmRef<ReviewsOrm> = buildOrm($reviewsSchema).defineRelation("review", ({ column, join, schema }) => {
	return {
		id: column(schema.id),

		gameId: column(schema.gameId).exclude().alias((review) => review.game.id),
		game: join.one($gamesOrm).on((review, game) => review.gameId.$eq(game.id)),

		authorId: column(schema.authorId).exclude().alias((review) => review.author.id),
		author: join.one($usersOrm).on((review, author) => review.authorId.$eq(author.id)),

		rating: column(schema.rating),
		title: column(schema.title),
		body: column(schema.body)
	};
});

export interface GameRatingsOrm extends AggregateOrm {
	id: ColumnField<number>;

	gameId: ColumnField<number>;
	game: JoinOneField<GamesOrm>;

	rating: AggregateField<number>;
}
export const $gameRatingsOrm: OrmRef<GameRatingsOrm> = buildOrm($reviewsSchema).defineAggregation("gameRating", ({ column, aggregate, join, schema }) => {
	return {
		id: column(schema.id).exclude(),

		gameId: column(schema.gameId),
		game: join.one($gamesOrm).on((rating, game) => rating.gameId.$eq(game.id)),

		rating: aggregate(schema.rating).average().asFloat().include()
	};
});
