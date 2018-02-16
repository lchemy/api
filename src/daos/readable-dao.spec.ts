import { container } from "@lchemy/di";
import * as ormLib from "@lchemy/orm";

import { DriversDao } from "../tests/mocks/car-service/daos";

describe("readable dao", () => {
	let dao: DriversDao;

	beforeEach(() => {
		jest.restoreAllMocks();
		dao = container.get(DriversDao);
	});

	it("should find all raw", async () => {
		const expected = [{
			id: 1,
			name: "hello"
		}, {
			id: 2,
			name: "world"
		}];

		jest.spyOn(ormLib, "findAll").mockImplementationOnce(() => {
			return Promise.resolve(expected);
		});

		const actual = await dao.findAllRaw(() => {
			return {};
		});

		expect(actual).toEqual(expected);
	});

	it("should find all models", async () => {
		const expectedRaw = [{
			id: 1,
			name: "hello"
		}, {
			id: 2,
			name: "world"
		}];

		const expected = expectedRaw.map((raw) => {
			return {
				__model: true,
				...raw
			};
		});

		jest.spyOn(ormLib, "findAll").mockImplementationOnce(() => {
			return Promise.resolve(expectedRaw);
		});

		const actual = await dao.findAll(() => {
			return {};
		});

		expect(actual).toEqual(expected);
	});

	it("should find all with count raw", async () => {
		const expected = {
			count: 5,
			rows: [{
				id: 1,
				name: "hello"
			}, {
				id: 2,
				name: "world"
			}]
		};

		jest.spyOn(ormLib, "findAllWithCount").mockImplementationOnce(() => {
			return Promise.resolve(expected);
		});

		const actual = await dao.findAllWithCountRaw(() => {
			return {};
		});

		expect(actual).toEqual(expected);
	});

	it("should find all with count models", async () => {
		const expectedRaw = {
			count: 5,
			rows: [{
				id: 1,
				name: "hello"
			}, {
				id: 2,
				name: "world"
			}]
		};

		const expected = {
			count: expectedRaw.count,
			rows: expectedRaw.rows.map((raw) => {
				return {
					__model: true,
					...raw
				};
			})
		};

		jest.spyOn(ormLib, "findAllWithCount").mockImplementationOnce(() => {
			return Promise.resolve(expectedRaw);
		});

		const actual = await dao.findAllWithCount(() => {
			return {};
		});

		expect(actual).toEqual(expected);
	});

	it("should find one raw", async () => {
		const expected = {
			id: 1,
			name: "hello"
		};

		jest.spyOn(ormLib, "findOne").mockImplementationOnce(() => {
			return Promise.resolve(expected);
		});

		const actual = await dao.findOneRaw(() => {
			return {};
		});

		expect(actual).toEqual(expected);
	});

	it("should find one models", async () => {
		const expectedRaw = {
			id: 1,
			name: "hello"
		};

		const expected = {
			__model: true,
			...expectedRaw
		};

		jest.spyOn(ormLib, "findOne").mockImplementationOnce(() => {
			return Promise.resolve(expectedRaw);
		});

		const actual = await dao.findOne(() => {
			return {};
		});

		expect(actual).toEqual(expected);

		jest.spyOn(ormLib, "findOne").mockImplementationOnce(() => {
			return Promise.resolve(undefined);
		});

		const actualNone = await dao.findOne(() => {
			return {};
		});

		expect(actualNone).toBeUndefined();
	});

	it("should find count", async () => {
		const expected = 15;

		jest.spyOn(ormLib, "findCount").mockImplementationOnce(() => {
			return Promise.resolve(expected);
		});

		const actual = await dao.findCount(() => {
			return {};
		});

		expect(actual).toEqual(expected);
	});

	it("should find all raw by primary fields", async () => {
		const expected = [{
			id: 1,
			name: "hello"
		}, {
			id: 2,
			name: "world"
		}];

		jest.spyOn(ormLib, "findAll").mockImplementationOnce((async (ormRef, builder) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("driver.id IN (1, 2)");

			return expected;
		}) as typeof ormLib["findAll"]);

		const actual = await dao.findAllRawByPrimaryFields(() => {
			return {
				items: [{
					id: 1
				}, {
					id: 2
				}]
			};
		});

		expect(actual).toEqual(expected);
	});

	it("should find all model by primary fields", async () => {
		const expectedRaw = [{
			id: 1,
			name: "hello"
		}, {
			id: 2,
			name: "world"
		}];

		const expected = expectedRaw.map((raw) => {
			return {
				__model: true,
				...raw
			};
		});

		jest.spyOn(ormLib, "findAll").mockImplementationOnce((async (ormRef, builder) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("driver.id IN (1, 2)");

			return expected;
		}) as typeof ormLib["findAll"]);

		const actual = await dao.findAllByPrimaryFields(() => {
			return {
				items: [{
					id: 1
				}, {
					id: 2
				}] as any[]
			};
		});

		expect(actual).toEqual(expected);
	});

	it("should find one raw by primary fields", async () => {
		const expected = {
			id: 1,
			name: "hello"
		};

		jest.spyOn(ormLib, "findOne").mockImplementationOnce((async (ormRef, builder) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("driver.id IN (1)");

			return expected;
		}) as typeof ormLib["findOne"]);

		const actual = await dao.findOneRawByPrimaryFields(() => {
			return {
				item: {
					id: 1
				}
			};
		});

		expect(actual).toEqual(expected);
	});

	it("should find all model by primary fields", async () => {
		const expectedRaw = {
			id: 1,
			name: "hello"
		};

		const expected = {
			__model: true,
			...expectedRaw
		};

		jest.spyOn(ormLib, "findOne").mockImplementationOnce((async (ormRef, builder) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("driver.id IN (1)");

			return expected;
		}) as typeof ormLib["findOne"]);

		const actual = await dao.findOneByPrimaryFields(() => {
			return {
				item: {
					id: 1
				} as any
			};
		});

		expect(actual).toEqual(expected);

		jest.spyOn(ormLib, "findOne").mockImplementationOnce((() => {
			return Promise.resolve(undefined);
		}) as typeof ormLib["findOne"]);

		const actualNone = await dao.findOneByPrimaryFields(() => {
			return {
				item: {
					id: 1
				} as any
			};
		});

		expect(actualNone).toBeUndefined();
	});

	it("should find exists with filter", async () => {
		jest.spyOn(ormLib, "findCount").mockImplementationOnce(() => {
			return Promise.resolve(1);
		});

		const actualExists = await dao.findExistsWithFilter(() => {
			return {};
		});

		expect(actualExists).toBe(true);

		jest.spyOn(ormLib, "findCount").mockImplementationOnce(() => {
			return Promise.resolve(0);
		});

		const actualNotExists = await dao.findExistsWithFilter(() => {
			return {};
		});

		expect(actualNotExists).toBe(false);
	});

	it("should find exists raw by primary fields", async () => {
		jest.spyOn(ormLib, "findCount").mockImplementationOnce((async (ormRef, builder) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("driver.id IN (1)");

			return 1;
		}) as typeof ormLib["findCount"]);

		const actual = await dao.findExistsRawByPrimaryFields(() => {
			return {
				item: {
					id: 1
				}
			};
		});

		expect(actual).toBe(true);
	});

	it("should find all model by primary fields", async () => {
		jest.spyOn(ormLib, "findCount").mockImplementationOnce((async (ormRef, builder) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("driver.id IN (1)");

			return 1;
		}) as typeof ormLib["findCount"]);

		const actual = await dao.findExistsByPrimaryFields(() => {
			return {
				item: {
					id: 1
				} as any
			};
		});

		expect(actual).toBe(true);
	});
});
