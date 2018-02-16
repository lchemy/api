import { provide } from "@lchemy/di";
import Boom from "boom";

import { ReadableController, WritableController } from "../../../index";

import {
	Category,
	Game,
	GameRating,
	Review,
	User
} from "./models";
import {
	CategoriesOrm,
	GameRatingsOrm,
	GamesOrm,
	ReviewsOrm,
	UsersOrm
} from "./orms";
import {
	CategoriesService,
	GameRatingsService,
	GamesService,
	ReviewsService,
	UsersService
} from "./services";

@provide()
export class CategoriesController extends ReadableController<Category, CategoriesOrm> {
	constructor(protected service: CategoriesService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/categories",
			handler: this.find
		}, {
			method: "GET",
			path: "/categories/:id",
			handler: this.findOne
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): Category {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkParamsMatchesBody(bodyModel: Category, paramModel: Category): boolean {
		return bodyModel.id === paramModel.id;
	}

	protected modelToJson(model: Category): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected jsonToModel(json: object): Category {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class GamesController extends WritableController<Game, GamesOrm> {
	constructor(protected service: GamesService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/games",
			handler: this.find
		}, {
			method: "GET",
			path: "/games/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/games",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/games/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/games/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): Game {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkParamsMatchesBody(bodyModel: Game, paramModel: Game): boolean {
		return bodyModel.id === paramModel.id;
	}

	protected modelToJson(model: Game): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected jsonToModel(json: object): Game {
		if (typeof json !== "object") {
			throw new Error("Invalid json");
		}

		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class UsersController extends WritableController<User, UsersOrm> {
	constructor(protected service: UsersService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/users",
			handler: this.find
		}, {
			method: "GET",
			path: "/users/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/users",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/users/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/users/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): User {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkParamsMatchesBody(bodyModel: User, paramModel: User): boolean {
		return bodyModel.id === paramModel.id;
	}

	protected modelToJson(model: User): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected jsonToModel(json: object): User {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class ReviewsController extends WritableController<Review, ReviewsOrm> {
	constructor(protected service: ReviewsService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/reviews",
			handler: this.find
		}, {
			method: "GET",
			path: "/reviews/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/reviews",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/reviews/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/reviews/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): Review {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkParamsMatchesBody(bodyModel: Review, paramModel: Review): boolean {
		return bodyModel.id === paramModel.id;
	}

	protected modelToJson(model: Review): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected jsonToModel(json: object): Review {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class GameRatingsController extends ReadableController<GameRating, GameRatingsOrm> {
	constructor(protected service: GameRatingsService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/game-ratings",
			handler: this.find
		}, {
			method: "GET",
			path: "/game-ratings/:id",
			handler: this.findOne
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): GameRating {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			game: {
				id: Number(id)
			}
		} as any;
	}

	protected checkParamsMatchesBody(bodyModel: GameRating, paramModel: GameRating): boolean {
		return bodyModel.game.id === paramModel.game.id;
	}

	protected modelToJson(model: GameRating): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected jsonToModel(json: object): GameRating {
		return {
			...json,
			__model: true
		} as any;
	}
}
