import { container } from "@lchemy/di";

import {
	Data,
	Driver,
	DriverMetrics,
	DriversController,
	Passenger,
	PassengerMetrics,
	PassengersController,
	createTables,
	deleteTables,
	mockData
} from "../mocks/car-service";

describe("car service integration", () => {
	let data: Data;

	beforeEach(async () => {
		await createTables();
		data = await mockData();
	});

	afterEach(async () => {
		await deleteTables();
	});

	describe("drivers controller", () => {
		it("should get drivers", async () => {
			const driversController = container.get(DriversController);

			const { data: actualDrivers, totalCount: actualTotalCount } = await driversController.find({
				query: {
					fields: "id, name, metrics, history.id, history.startTime, history.distance, history.price, history.passenger"
				}
			}) as { data: Driver[], totalCount: number };

			const expectedDrivers = data.drivers;

			expect(actualTotalCount).toBe(expectedDrivers.length);

			actualDrivers.forEach((actualDriver) => {
				const expectedDriver = data.driversMap.get(actualDriver.id)!;
				expect(expectedDriver).toBeDefined();

				expect(actualDriver.name).toBe(expectedDriver.name);
				if (actualDriver.metrics!.length > 0) {
					const actualMetrics = actualDriver.metrics![0],
						expectedMetrics = expectedDriver.metrics![0];
					(Object.keys(actualMetrics) as Array<keyof DriverMetrics>).forEach((key) => {
						expect(actualMetrics[key]).toBeCloseTo(expectedMetrics[key]);
					});
				}

				expect(actualDriver.history.length).toBe(expectedDriver.history.length);
			});
		});

		it("should fail if fields param is invalid", async () => {
			const driversController = container.get(DriversController);

			const out = driversController.find({
				query: {
					fields: "invalidField"
				}
			});

			await expect(out).rejects.toThrow();
		});

		it("should fail if filter param is invalid", async () => {
			const driversController = container.get(DriversController);

			const out = driversController.find({
				query: {
					filter: "id eq"
				}
			});

			await expect(out).rejects.toThrow();
		});
	});

	describe("passengers controller", () => {
		it("should get passengers", async () => {
			const passengersController = container.get(PassengersController);

			const { data: actualPassengers, totalCount: actualTotalCount } = await passengersController.find({
				query: {
					fields: "id, name, metrics, history.id, history.startTime, history.distance, history.price, history.driver"
				}
			}) as { data: Passenger[], totalCount: number };

			const expectedPassengers = data.passengers;

			expect(actualTotalCount).toBe(expectedPassengers.length);

			actualPassengers.forEach((actualPassenger) => {
				const expectedPassenger = data.passengersMap.get(actualPassenger.id)!;
				expect(expectedPassenger).toBeDefined();

				expect(actualPassenger.name).toBe(expectedPassenger.name);
				if (actualPassenger.metrics!.length > 0) {
					const actualMetrics = actualPassenger.metrics![0],
						expectedMetrics = expectedPassenger.metrics![0];
					(Object.keys(actualMetrics) as Array<keyof PassengerMetrics>).forEach((key) => {
						expect(actualMetrics[key]).toBeCloseTo(expectedMetrics[key]);
					});
				}

				expect(actualPassenger.history.length).toBe(expectedPassenger.history.length);
			});
		});
	});
});
