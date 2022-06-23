import { container } from "@lchemy/di";
import * as ormLib from "@lchemy/orm";

import { RidesDao } from "../tests/mocks/car-service/daos";

describe("writable dao", () => {
	let dao: RidesDao,
		trx: symbol | undefined;

	beforeEach(() => {
		jest.restoreAllMocks();
		trx = undefined;

		dao = container.get(RidesDao);

		// @ts-ignore
		jest.spyOn(dao, "withTransaction").mockImplementation((executor) => {
			if (trx == null) {
				trx = Symbol();
			}
			// @ts-ignore
			return executor(trx);
		});
	});

	it("should insert many raw", async () => {
		const insertItems = [{
			driver: {
				id: 1
			},
			passenger: {
				id: 1
			},
			startTime: new Date(),
			distance: 1,
			price: 1,
			duration: 1
		}, {
			driver: {
				id: 2
			},
			passenger: {
				id: 2
			},
			startTime: new Date(),
			distance: 2,
			price: 2,
			duration: 2
		}];

		const expectedFindAll = insertItems.map((item, i) => {
			return {
				...item,
				id: i + 1
			};
		});

		const expectedInsertMany = expectedFindAll.map((item) => {
			return {
				id: item.id
			};
		});

		jest.spyOn(ormLib, "insertMany").mockImplementationOnce((async (ormRef, builder, tx) => {
			const orm = await ormRef["🜅"],
				request = builder(orm);

			expect(request.items).toBe(insertItems);
			expect(tx).toBe(trx);

			return Promise.resolve(expectedInsertMany);
		}) as typeof ormLib["insertMany"]);

		jest.spyOn(ormLib, "findAll").mockImplementationOnce((async (ormRef, builder, tx) => {
			const orm = await ormRef["🜅"],
				request = builder!(orm),
				filter = request.filter!;

			expect(filter.toString()).toBe("ride.id IN (1, 2)");
			expect(tx).toBe(trx);

			return Promise.resolve(expectedFindAll);
		}) as typeof ormLib["findAll"]);

		const actual = await dao.insertManyRaw(() => {
			return {
				items: insertItems
			};
		});

		expect(actual).toEqual(expectedFindAll);
	});
});
