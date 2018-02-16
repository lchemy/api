import { container } from "@lchemy/di";

import {
	CategoriesController,
	Category,
	Data,
	Game,
	GameRating,
	GameRatingsController,
	GamesController,
	Review,
	ReviewsController,
	User,
	UsersController,
	createTables,
	deleteTables,
	mockData
} from "../mocks/game-portal";

describe("game portal integration", () => {
	let data: Data;

	beforeEach(async () => {
		await createTables();
		data = await mockData();
	});

	afterEach(async () => {
		await deleteTables();
	});

	describe("categories controller", () => {
		let ctrl: CategoriesController;
		beforeEach(() => {
			ctrl = container.get(CategoriesController);
		});

		it("should find all", async () => {
			const { data: actualCategories, totalCount: actualTotalCount } = await ctrl.find() as { data: Category[], totalCount: number };

			const expectedCategories = data.categories;

			expect(actualTotalCount).toBe(expectedCategories.length);

			actualCategories.forEach((actualCategory) => {
				const expectedCategory = data.categoriesMap.get(actualCategory.id)!;
				expect(expectedCategory).toBeDefined();
				expect(actualCategory.name).toBe(expectedCategory.name);
			});
		});

		it("should find one", async () => {
			const expectedCategory = data.categories[0];

			const { data: actualCategory } = await ctrl.findOne({
				params: {
					id: String(expectedCategory.id)
				}
			}) as { data: Category };

			expect(actualCategory).toBeDefined();
			expect(actualCategory.name).toBe(expectedCategory.name);
		});

		it("should fail to find one if none exists", async () => {
			const actualNotFoundPromise = ctrl.findOne({
				params: {
					id: String(data.categories.length + 1)
				}
			});
			await expect(actualNotFoundPromise).rejects.toThrow();
		});
	});

	describe("games controller", () => {
		const checkGame = (actualGame: Game, expectedGame: Game): void => {
			expect(actualGame.id).toBe(expectedGame.id);
			expect(actualGame.name).toBe(expectedGame.name);
			expect(actualGame.category.id).toBe(expectedGame.category.id);

			expect(actualGame.authors).toHaveLength(expectedGame.authors.length);
			actualGame.authors.forEach((actualGameAuthor) => {
				const expectedAuthor = expectedGame.authors.find((author) => author.id === actualGameAuthor.id)!;
				expect(expectedAuthor).toBeDefined();
				expect(actualGameAuthor.name).toBe(expectedAuthor.name);
			});
		};

		let ctrl: GamesController;
		beforeEach(() => {
			ctrl = container.get(GamesController);
		});

		it("should find all", async () => {
			const { data: actualGames, totalCount: actualTotalCount } = await ctrl.find() as { data: Game[], totalCount: number };

			const expectedGames = data.games;

			expect(actualTotalCount).toBe(expectedGames.length);

			actualGames.forEach((actualGame) => {
				const expectedGame = data.gamesMap.get(actualGame.id)!;
				expect(expectedGame).toBeDefined();
				checkGame(actualGame, expectedGame);
			});
		});

		it("should find one", async () => {
			const expectedGame = data.games[0];

			const { data: actualGame } = await ctrl.findOne({
				params: {
					id: String(expectedGame.id)
				}
			}) as { data: Game };

			checkGame(actualGame, expectedGame);
		});

		it("should insert", async () => {
			const category = data.categories[0],
				authors = data.users.slice(0, 3);

			const newGame = {
				id: -1,
				category,
				name: "new game",
				authors
			} as Game;

			const { data: insertedGame } = await ctrl.insert({
				body: newGame
			}) as { data: Game };

			newGame.id = data.games.length + 1;
			checkGame(insertedGame, newGame);

			const { data: allGames } = await ctrl.find({
				query: {
					limit: "500"
				}
			}) as { data: Game[] };
			allGames.filter((game) => game.id !== insertedGame.id).forEach((actualGame) => {
				const expectedGame = data.gamesMap.get(actualGame.id)!;
				expect(expectedGame).toBeDefined();
				checkGame(actualGame, expectedGame);
			});
		});

		it("should fail to insert due to validators", async () => {
			//
		});

		it("should update", async () => {
			const existingGame = data.games[0],
				authors = data.users.slice(0, 5);

			const targetGame = {
				...existingGame,
				name: "updated game",
				authors
			};

			const { data: updatedGame } = await ctrl.update({
				params: {
					id: String(existingGame.id)
				},
				body: targetGame
			}) as { data: Game };

			checkGame(updatedGame, targetGame);

			const { data: allGames } = await ctrl.find({
				query: {
					limit: "500"
				}
			}) as { data: Game[] };
			allGames.filter((game) => game.id !== updatedGame.id).forEach((actualGame) => {
				const expectedGame = data.gamesMap.get(actualGame.id)!;
				expect(expectedGame).toBeDefined();
				checkGame(actualGame, expectedGame);
			});
		});

		it("should fail to update due to validators", () => {
			//
		});

		it("should fail to update due to invalid body", async () => {
			const missingBodyPromise = ctrl.update();
			await expect(missingBodyPromise).rejects.toThrow();

			const invalidBodyPromise = ctrl.update({
				body: "wrong body type"
			});
			await expect(invalidBodyPromise).rejects.toThrow();
		});

		it("should fail to update due to mismatched params and body", async () => {
			const mismatchedParamsPromise = ctrl.update({
				params: {
					id: "1"
				},
				body: {
					id: 2
				}
			});
			await expect(mismatchedParamsPromise).rejects.toThrow();
		});

		it("should fail to update due to missing params", async () => {
			const missingParamsPromise = ctrl.update();
			await expect(missingParamsPromise).rejects.toThrow();
		});

		it("should remove", async () => {
			const targetGame = data.games[0];
			const { success } = await ctrl.remove({
				params: {
					id: String(targetGame.id)
				}
			});
			expect(success).toBeTruthy();

			const actualNotFoundPromise = ctrl.findOne({
				params: {
					id: String(targetGame.id)
				}
			});
			await expect(actualNotFoundPromise).rejects.toThrow();

			const { data: allGames } = await ctrl.find({
				query: {
					fields: "id",
					limit: "500"
				}
			}) as { data: Game[] };
			allGames.filter((game) => game.id !== targetGame.id).forEach((actualGame) => {
				const expectedGame = data.gamesMap.get(actualGame.id)!;
				expect(expectedGame).toBeDefined();
			});
		});

		it("should fail to remove due to missing params", async () => {
			const missingParamsPromise = ctrl.remove();
			await expect(missingParamsPromise).rejects.toThrow();
		});
	});

	describe("users controller", () => {
		const checkUser = (actualUser: User, expectedUser: User): void => {
			expect(actualUser.id).toBe(expectedUser.id);
			expect(actualUser.email).toBe(expectedUser.email);
			expect(actualUser.name).toBe(expectedUser.name);
			expect(actualUser.info.age).toBe(expectedUser.info.age);
		};

		let ctrl: UsersController;
		beforeEach(() => {
			ctrl = container.get(UsersController);
		});

		it("should find all", async () => {
			const { data: actualUsers, totalCount: actualTotalCount } = await ctrl.find() as { data: User[], totalCount: number };

			const expectedUsers = data.users;

			expect(actualTotalCount).toBe(expectedUsers.length);

			actualUsers.forEach((actualUser) => {
				const expectedUser = data.usersMap.get(actualUser.id)!;
				expect(expectedUser).toBeDefined();
				checkUser(actualUser, expectedUser);
			});
		});

		it("should find one", async () => {
			const expectedUser = data.users[0];

			const { data: actualUser } = await ctrl.findOne({
				params: {
					id: String(expectedUser.id)
				}
			}) as { data: User };

			expect(actualUser).toBeDefined();
			checkUser(actualUser, expectedUser);
		});

		it("should insert", async () => {
			const newUser = {
				id: -1,
				email: "test@test.com",
				name: "new user",
				info: {
					age: 21
				}
			} as User;

			const { data: insertedUser } = await ctrl.insert({
				body: newUser
			}) as { data: User };

			newUser.id = data.users.length + 1;
			checkUser(insertedUser, newUser);

			const { data: allUsers } = await ctrl.find({
				query: {
					limit: "500"
				}
			}) as { data: User[] };
			allUsers.filter((user) => user.id !== insertedUser.id).forEach((actualUser) => {
				const expectedUser = data.usersMap.get(actualUser.id)!;
				expect(expectedUser).toBeDefined();
				checkUser(actualUser, expectedUser);
			});
		});

		it("should update", async () => {
			const existingUser = data.users[0];

			const targetUser = {
				...existingUser,
				name: "updated user",
				info: {
					age: 99
				}
			};

			const { data: updatedUser } = await ctrl.update({
				params: {
					id: String(existingUser.id)
				},
				body: targetUser
			}) as { data: User };

			checkUser(updatedUser, targetUser);

			const { data: allUsers } = await ctrl.find({
				query: {
					limit: "500"
				}
			}) as { data: User[] };
			allUsers.filter((user) => user.id !== updatedUser.id).forEach((actualUser) => {
				const expectedUser = data.usersMap.get(actualUser.id)!;
				expect(expectedUser).toBeDefined();
				checkUser(actualUser, expectedUser);
			});
		});

		it("should remove", async () => {
			const targetUser = data.users[0];
			const { success } = await ctrl.remove({
				params: {
					id: String(targetUser.id)
				}
			});
			expect(success).toBeTruthy();

			const actualNotFoundPromise = ctrl.findOne({
				params: {
					id: String(targetUser.id)
				}
			});
			await expect(actualNotFoundPromise).rejects.toThrow();

			const { data: allUsers } = await ctrl.find({
				query: {
					fields: "id",
					limit: "500"
				}
			}) as { data: User[] };
			allUsers.filter((user) => user.id !== targetUser.id).forEach((actualUser) => {
				const expectedUser = data.usersMap.get(actualUser.id)!;
				expect(expectedUser).toBeDefined();
			});
		});
	});

	describe("reviews controller", () => {
		let ctrl: ReviewsController;
		beforeEach(() => {
			ctrl = container.get(ReviewsController);
		});

		it("should find all", async () => {
			//
		});

		it("should find one", async () => {
			//
		});

		it("should insert", async () => {
			//
		});

		it("should fail to insert due to validators", async () => {
			//
		});

		it("should update", async () => {
			//
		});

		it("should fail to update due to validators", () => {
			//
		});

		it("should remove", async () => {
			//
		});
	});

	describe("game ratings controller", () => {
		let ctrl: GameRatingsController;
		beforeEach(() => {
			ctrl = container.get(GameRatingsController);
		});

		it("should find all", async () => {
			//
		});

		it("should find one", async () => {
			//
		});
	});
});
