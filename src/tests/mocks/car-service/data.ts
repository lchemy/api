import { Chance } from "chance";
import { Map } from "immutable";

import { db } from "./db";
import { Driver, DriverReview, Passenger, PassengerReview, Ride } from "./models";

const BATCH_INSERT_LIMIT = 100;
const MIN_START_TIME = new Date("2018-01-01 00:00:00");
const PRICE_BASE = 2.00;
const PRICE_PER_MIN = 0.40;
const PRICE_PER_MILE = 1.20;

export async function createTables(): Promise<void> {
	await db.raw(`
		CREATE TABLE drivers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name STRING
		);
	`);
	await db.raw(`
		CREATE TABLE passengers (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			name STRING
		);
	`);
	await db.raw(`
		CREATE TABLE rides (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			driver_id INTEGER,
			passenger_id INTEGER,
			start_time DATETIME,
			distance NUMERIC,
			price NUMERIC,
			duration NUMERIC
		);
	`);
	await db.raw(`
		CREATE TABLE driver_reviews (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ride_id INTEGER,
			rating INTEGER,
			message VARCHAR(255)
		);
	`);
	await db.raw(`
		CREATE TABLE passenger_reviews (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ride_id INTEGER,
			rating INTEGER,
			message VARCHAR(255)
		);
	`);
}

export async function clearData(): Promise<void> {
	await db.raw(`
		DELETE FROM drivers;
	`);
	await db.raw(`
		DELETE FROM passengers;
	`);
	await db.raw(`
		DELETE FROM rides;
	`);
	await db.raw(`
		DELETE FROM driver_reviews;
	`);
	await db.raw(`
		DELETE FROM passenger_reviews;
	`);
}

export async function deleteTables(): Promise<void> {
	await db.raw(`
		DROP TABLE IF EXISTS drivers;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS passengers;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS rides;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS driver_reviews;
	`);
	await db.raw(`
		DROP TABLE IF EXISTS passenger_reviews;
	`);
}

export interface Data {
	drivers: Driver[];
	passengers: Passenger[];
	rides: Ride[];
	driverReviews: DriverReview[];
	passengerReviews: PassengerReview[];

	driversMap: Map<number, Driver>;
	passengersMap: Map<number, Passenger>;
	ridesMap: Map<number, Ride>;
	driverReviewsMap: Map<number, DriverReview>;
	passengerReviewsMap: Map<number, PassengerReview>;
}

export async function mockData(seed: Chance.Seed = 0): Promise<Data> {
	const chance = new Chance(seed);

	// generate drivers
	const driversCount = chance.integer({ min: 5, max: 10 });
	const drivers = Array(driversCount).fill(undefined).map((_, i) => {
		return {
			id: i + 1,
			name: chance.name(),
			history: [] as Ride[]
		} as Driver;
	});
	const targetDriverRatings = drivers.map(() => {
		const rating = chance.normal({ mean: 4.25, dev: 1.25 });
		if (rating > 5) {
			return 5;
		} else if (rating < 1) {
			return 1;
		} else {
			return rating;
		}
	});

	// insert drivers
	await db.batchInsert("drivers", drivers.map((driver) => {
		return {
			id: driver.id,
			name: driver.name
		};
	}), BATCH_INSERT_LIMIT);

	// generate passengers
	const passengersCount = chance.integer({ min: 25, max: 100 });
	const passengers = Array(passengersCount).fill(undefined).map((_, i) => {
		return {
			id: i + 1,
			name: chance.name(),
			history: [] as Ride[]
		} as Passenger;
	});
	const targetPassengerRatings = drivers.map(() => {
		const rating = chance.normal({ mean: 4.5, dev: 1.5 });
		if (rating > 5) {
			return 5;
		} else if (rating < 1) {
			return 1;
		} else {
			return rating;
		}
	});

	// insert passengers
	await db.batchInsert("passengers", passengers.map((passenger) => {
		return {
			id: passenger.id,
			name: passenger.name
		};
	}), BATCH_INSERT_LIMIT);

	// generate rides
	const ridesCount = chance.integer({ min: 100, max: 500 });
	const rides = Array(ridesCount).fill(undefined).map((_, i) => {
		const driver = chance.pickone(drivers),
			passenger = chance.pickone(passengers);

		let minStartTimeMillis = MIN_START_TIME.getTime();
		if (driver.history.length > 0) {
			const lastRide = driver.history[driver.history.length - 1];
			minStartTimeMillis = Math.max(minStartTimeMillis, lastRide.startTime.getTime() + lastRide.duration * 1000 * 60);
		}
		if (passenger.history.length > 0) {
			const lastRide = passenger.history[passenger.history.length - 1];
			minStartTimeMillis = Math.max(minStartTimeMillis, lastRide.startTime.getTime() + lastRide.duration * 1000 * 60);
		}
		const startTimeMillis = chance.integer({ min: minStartTimeMillis, max: minStartTimeMillis + 30 * 24 * 60 * 60 * 1000 }),
			startTime = new Date(startTimeMillis),
			duration = chance.integer({ min: 5 * 60, max: 3 * 60 * 60 }) / 60,
			distance = chance.floating({ min: 5, max: 45 }) * duration / 60,
			price = PRICE_BASE + duration * PRICE_PER_MIN + distance * PRICE_PER_MILE;

		const ride = {
			id: i + 1,
			driver,
			passenger,
			startTime,
			distance,
			price,
			duration,
			reviews: {
				driver: undefined,
				passenger: undefined
			}
		} as Ride;

		driver.history.push(ride);
		passenger.history.push(ride);

		return ride;
	});

	// insert rides
	await db.batchInsert("rides", rides.map((ride) => {
		return {
			id: ride.id,
			driver_id: ride.driver.id,
			passenger_id: ride.passenger.id,
			start_time: ride.startTime,
			distance: ride.distance,
			price: ride.price,
			duration: ride.duration
		};
	}), BATCH_INSERT_LIMIT);

	// write driver reviews
	const driverReviews = rides.filter(() => {
		return chance.floating({ min: 0, max: 1}) > .05;
	}).map((ride, i) => {
		const targetDriverRating = targetDriverRatings[ride.driver.id - 1];

		let rating = chance.normal({ mean: targetDriverRating, dev: 1 });
		if (rating > 5) {
			rating = 5;
		} else if (rating < 1) {
			rating = 1;
		}

		const review = {
			id: i + 1,
			driver: ride.driver,
			message: chance.sentence(),
			rating,
			ride
		} as DriverReview;

		ride.reviews.driver = review;

		return review;
	});

	// insert driver reviews
	await db.batchInsert("driver_reviews", driverReviews.map((review) => {
		return {
			id: review.id,
			ride_id: review.ride.id,
			rating: review.rating,
			message: review.message
		};
	}), BATCH_INSERT_LIMIT);

	// write passenger reviews
	const passengerReviews = rides.filter(() => {
		return chance.floating({ min: 0, max: 1}) > .01;
	}).map((ride, i) => {
		const targetPassengerRating = targetPassengerRatings[ride.passenger.id - 1];

		let rating = chance.normal({ mean: targetPassengerRating, dev: 1 });
		if (rating > 5) {
			rating = 5;
		} else if (rating < 1) {
			rating = 1;
		}

		const review = {
			id: i + 1,
			passenger: ride.passenger,
			message: chance.sentence(),
			rating,
			ride
		} as PassengerReview;

		ride.reviews.passenger = review;

		return review;
	});

	// insert passenger reviews
	await db.batchInsert("passenger_reviews", passengerReviews.map((review) => {
		return {
			id: review.id,
			ride_id: review.ride.id,
			rating: review.rating,
			message: review.message
		};
	}), BATCH_INSERT_LIMIT);

	// compute driver metrics
	drivers.filter((driver) => {
		return driver.history.length > 0;
	}).forEach((driver) => {
		const stats = driver.history.reduce((memo, ride) => {
			if (ride.reviews.driver != null) {
				memo.totalRating += ride.reviews.driver.rating;
				memo.reviewsCount += 1;
			}
			memo.totalDistance += ride.distance;
			memo.totalEarnings += ride.price;
			return memo;
		}, {
			totalRating: 0,
			reviewsCount: 0,
			totalDistance: 0,
			totalEarnings: 0
		});

		driver.metrics = [{
			driverId: driver.id,
			averageRating: stats.totalRating / stats.reviewsCount,
			reviewsCount: stats.reviewsCount,
			totalDistance: stats.totalDistance,
			totalEarnings: stats.totalEarnings
		}];
	});

	// compute passenger metrics
	passengers.filter((passenger) => {
		return passenger.history.length > 0;
	}).forEach((passenger) => {
		const stats = passenger.history.reduce((memo, ride) => {
			if (ride.reviews.passenger != null) {
				memo.totalRating += ride.reviews.passenger.rating;
				memo.reviewsCount += 1;
			}
			memo.totalDistance += ride.distance;
			memo.totalCosts += ride.price;
			return memo;
		}, {
			totalRating: 0,
			reviewsCount: 0,
			totalDistance: 0,
			totalCosts: 0
		});

		passenger.metrics = [{
			passengerId: passenger.id,
			averageRating: stats.totalRating / stats.reviewsCount,
			reviewsCount: stats.reviewsCount,
			totalDistance: stats.totalDistance,
			totalCosts: stats.totalCosts
		}];
	});

	const driversMap = Map(drivers.map((driver) => [driver.id, driver] as [number, Driver])),
		passengersMap = Map(passengers.map((passenger) => [passenger.id, passenger] as [number, Passenger])),
		ridesMap = Map(rides.map((ride) => [ride.id, ride] as [number, Ride])),
		driverReviewsMap = Map(driverReviews.map((review) => [review.id, review] as [number, DriverReview])),
		passengerReviewsMap = Map(passengerReviews.map((review) => [review.id, review] as [number, PassengerReview]));

	return {
		drivers,
		passengers,
		rides,
		driverReviews,
		passengerReviews,
		driversMap,
		passengersMap,
		ridesMap,
		driverReviewsMap,
		passengerReviewsMap
	};
}
