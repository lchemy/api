import { provide } from "@lchemy/di";
import { Transaction } from "knex";

import { ReadableService, WritableService } from "../../../index";

import {
	CategoriesDao,
	GameAuthorsDao,
	GameRatingsDao,
	GamesDao,
	ReviewsDao,
	UserInfosDao,
	UsersDao
} from "./daos";
import {
	AuthUser,
	Category,
	Game,
	GameRating,
	Review,
	User,
	UserInfo,
	gameValidator,
	reviewInsertValidator,
	reviewUpdateValidator,
	userInsertValidator,
	userUpdateValidator
} from "./models";
import {
	CategoriesOrm,
	GameRatingsOrm,
	GamesOrm,
	ReviewsOrm,
	UsersOrm
} from "./orms";

@provide()
export class CategoriesService extends ReadableService<Category, CategoriesOrm, AuthUser> {
	constructor(protected dao: CategoriesDao) {
		super(dao);
	}
}

@provide()
export class GamesService extends WritableService<Game, GamesOrm, AuthUser> {
	protected validator = gameValidator;

	constructor(
		protected dao: GamesDao,
		protected gameAuthorsDao: GameAuthorsDao
	) {
		super(dao);
	}

	protected async afterInsert(insertedGame: Game, targetGame: Game, _1?: AuthUser, trx?: Transaction): Promise<Game> {
		const gameAuthors = targetGame.authors.map((author) => {
			return { game: insertedGame, author };
		});

		await this.gameAuthorsDao.insertMany(() => {
			return {
				items: gameAuthors
			};
		}, trx);

		return this.dao.findOneByPrimaryFields(() => {
			return {
				item: insertedGame
			};
		}, trx) as Promise<Game>;
	}

	protected async afterUpdate(updatedGame: Game, targetGame: Game, auth?: AuthUser, trx?: Transaction): Promise<Game> {
		const newGameAuthors = targetGame.authors.map((author) => {
			return { game: updatedGame, author };
		});

		await this.gameAuthorsDao.replaceMany((orm) => {
			return {
				items: newGameAuthors,
				filter: orm.gameId.$eq(updatedGame.id),
				auth
			};
		}, trx);

		return this.dao.findOneByPrimaryFields(() => {
			return {
				item: updatedGame
			};
		}, trx) as Promise<Game>;
	}

	protected async beforeRemove(game: Game, _0?: AuthUser, trx?: Transaction): Promise<void> {
		await this.gameAuthorsDao.removeWithFilter((orm) => {
			return {
				filter: orm.gameId.$eq(game.id),
				expected: game.authors.length
			};
		}, trx);
	}
}

@provide()
export class UsersService extends WritableService<User, UsersOrm, AuthUser> {
	insertValidator = userInsertValidator;
	updateValidator = userUpdateValidator;

	constructor(
		protected dao: UsersDao,
		protected userInfosDao: UserInfosDao
	) {
		super(dao);
	}

	protected async afterInsert(insertedUser: User, targetUser: User, _0?: AuthUser, trx?: Transaction): Promise<User> {
		await this.upsertInfo(insertedUser.id, targetUser.info, trx);

		return this.dao.findOneByPrimaryFields(() => {
			return {
				item: insertedUser
			};
		}, trx) as Promise<User>;
	}

	protected async afterUpdate(updatedUser: User, targetUser: User, _0?: AuthUser, trx?: Transaction): Promise<User> {
		await this.upsertInfo(updatedUser.id, targetUser.info, trx);

		return this.dao.findOneByPrimaryFields(() => {
			return {
				item: updatedUser
			};
		}, trx) as Promise<User>;
	}

	protected async beforeRemove(user: User, _0?: AuthUser, trx?: Transaction): Promise<void> {
		await this.userInfosDao.removeOne(() => {
			return {
				item: {
					userId: user.id
				} as any
			};
		}, trx);
	}

	private async upsertInfo(id: number, info: UserInfo, trx?: Transaction): Promise<void> {
		await this.userInfosDao.upsertOne(() => {
			return {
				item: {
					...info,
					userId: id
				}
			};
		}, trx);
	}
}

@provide()
export class ReviewsService extends WritableService<Review, ReviewsOrm, AuthUser> {
	protected insertValidator = reviewInsertValidator;
	protected updateValidator = reviewUpdateValidator;

	constructor(protected dao: ReviewsDao) {
		super(dao);
	}

	protected onInsert(item: Review, auth?: AuthUser, trx?: Transaction): Promise<Review> {
		return this.dao.upsertOne(() => {
			return { item, auth };
		}, trx);
	}

	protected onUpdate(item: Review, auth?: AuthUser, trx?: Transaction): Promise<Review> {
		return this.dao.upsertOne(() => {
			return { item, auth };
		}, trx);
	}
}

@provide()
export class GameRatingsService extends ReadableService<GameRating, GameRatingsOrm, AuthUser> {
	constructor(protected dao: GameRatingsDao) {
		super(dao);
	}
}
