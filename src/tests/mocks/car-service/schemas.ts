import { buildSchema } from "@lchemy/orm";

import { db } from "./db";

export const $driversSchema = buildSchema(db).defineTable("drivers", (column) => {
	return {
		id: column.int("id"),
		name: column.string("name")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $passengersSchema = buildSchema(db).defineTable("passengers", (column) => {
	return {
		id: column.int("id"),
		name: column.string("name")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $ridesSchema = buildSchema(db).defineTable("rides", (column) => {
	return {
		id: column.int("id"),
		driverId: column.int("driver_id"),
		passengerId: column.int("passenger_id"),
		startTime: column.dateTime("start_time"),
		distance: column.float("distance"),
		price: column.float("price"),
		duration: column.float("duration")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $driverReviewsSchema = buildSchema(db).defineTable("driver_reviews", (column) => {
	return {
		id: column.int("id"),
		rideId: column.int("ride_id"),
		rating: column.int("rating"),
		message: column.string("message")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $passengerReviewsSchema = buildSchema(db).defineTable("passenger_reviews", (column) => {
	return {
		id: column.int("id"),
		rideId: column.int("ride_id"),
		rating: column.int("rating"),
		message: column.string("message")
	};
}).useFullNames().withPrimaryKey((schema) => schema.id);

export const $driverMetricsSchema = buildSchema(db).defineSubquery("driver_metrics", (qb) => {
	return qb
		.select([
			"rides.id AS ride_id",
			"rides.driver_id",
			"rides.distance",
			"rides.price",
			"rides.duration",
			"driver_reviews.rating AS driver_rating"
		])
		.from("rides")
		.leftJoin("driver_reviews", "rides.id", "driver_reviews.ride_id");
}, (column) => {
	return {
		rideId: column.int("ride_id"),
		driverId: column.int("driver_id"),
		distance: column.float("distance"),
		price: column.float("price"),
		duration: column.float("duration"),
		driverRating: column.int("driver_rating")
	};
}).useFullNames().withPrimaryKey((schema) => schema.driverId);

export const $passengerMetricsSchema = buildSchema(db).defineSubquery("passenger_metrics", (qb) => {
	return qb
		.select([
			"rides.id AS ride_id",
			"rides.passenger_id",
			"rides.distance",
			"rides.price",
			"rides.duration",
			"passenger_reviews.rating AS passenger_rating"
		])
		.from("rides")
		.leftJoin("passenger_reviews", "rides.id", "passenger_reviews.ride_id");
}, (column) => {
	return {
		rideId: column.int("ride_id"),
		passengerId: column.int("passenger_id"),
		distance: column.float("distance"),
		price: column.float("price"),
		duration: column.float("duration"),
		passengerRating: column.int("passenger_rating")
	};
}).useFullNames().withPrimaryKey((schema) => schema.passengerId);
