import { provide } from "@lchemy/di";
import { ColumnField } from "@lchemy/orm";

import { ReadableDao, ReplaceableDao, UpsertableDao, WritableDao } from "../../../index";

import {
	AuthUser,
	Category,
	Game,
	GameAuthor,
	GameRating,
	Review,
	User,
	UserInfo
} from "./models";
import {
	$categoriesOrm,
	$gameAuthorsOrm,
	$gameRatingsOrm,
	$gamesOrm,
	$reviewsOrm,
	$userInfosOrm,
	$usersOrm,
	CategoriesOrm,
	GameAuthorsOrm,
	GameRatingsOrm,
	GamesOrm,
	ReviewsOrm,
	UserInfosOrm,
	UsersOrm
} from "./orms";

@provide()
export class CategoriesDao extends ReadableDao<Category, CategoriesOrm, AuthUser> {
	protected ormRef = $categoriesOrm;

	protected modelToDbJson(model: Category): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): Category {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class GamesDao extends WritableDao<Game, GamesOrm, AuthUser> {
	protected ormRef = $gamesOrm;

	protected getInsertableFields(orm: GamesOrm): ColumnField[] {
		return [
			orm.category.id,
			orm.name
		];
	}

	protected getUpdatableFields(orm: GamesOrm): ColumnField[] {
		return [
			orm.name
		];
	}

	protected modelToDbJson(model: Game): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): Game {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class GameAuthorsDao extends ReplaceableDao<GameAuthor, GameAuthorsOrm, AuthUser> {
	protected ormRef = $gameAuthorsOrm;

	protected getInsertableFields(orm: GameAuthorsOrm): ColumnField[] {
		return [
			orm.game.id,
			orm.author.id
		];
	}

	protected getUniqueFields(orm: GameAuthorsOrm): ColumnField[] {
		return [
			orm.game.id,
			orm.author.id
		];
	}

	protected modelToDbJson(model: GameAuthor): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): GameAuthor {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class UsersDao extends WritableDao<User, UsersOrm, AuthUser> {
	protected ormRef = $usersOrm;

	protected getInsertableFields(orm: UsersOrm): ColumnField[] {
		return [
			orm.email,
			orm.name
		];
	}

	protected getUpdatableFields(orm: UsersOrm): ColumnField[] {
		return [
			orm.name
		];
	}

	protected modelToDbJson(model: User): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): User {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class UserInfosDao extends UpsertableDao<UserInfo, UserInfosOrm, AuthUser> {
	protected ormRef = $userInfosOrm;

	protected getInsertableFields(orm: UserInfosOrm): ColumnField[] {
		return [
			orm.userId,
			orm.age
		];
	}

	protected getUpdatableFields(orm: UserInfosOrm): ColumnField[] {
		return [
			orm.age
		];
	}

	protected modelToDbJson(model: UserInfo): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): UserInfo {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class ReviewsDao extends UpsertableDao<Review, ReviewsOrm, AuthUser> {
	protected ormRef = $reviewsOrm;

	protected getInsertableFields(orm: ReviewsOrm): ColumnField[] {
		return [
			orm.author.id,
			orm.game.id,
			orm.rating,
			orm.title,
			orm.body
		];
	}

	protected getUpdatableFields(orm: ReviewsOrm): ColumnField[] {
		return [
			orm.rating,
			orm.title,
			orm.body
		];
	}

	protected getUniqueFields(orm: ReviewsOrm): ColumnField[] {
		return [
			orm.author.id,
			orm.game.id
		];
	}

	protected modelToDbJson(model: Review): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): Review {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class GameRatingsDao extends ReadableDao<GameRating, GameRatingsOrm, AuthUser> {
	protected ormRef = $gameRatingsOrm;

	protected modelToDbJson(model: GameRating): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): GameRating {
		return {
			...json,
			__model: true
		} as any;
	}
}
