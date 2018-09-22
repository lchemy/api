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

import { $driverMetricsSchema, $driverReviewsSchema, $driversSchema, $passengerMetricsSchema, $passengerReviewsSchema, $passengersSchema, $ridesSchema } from "./schemas";

// TODO: add auth user to the orms

export interface DriversOrm extends RelationalOrm {
	id: ColumnField<number>;
	name: ColumnField<string>;

	metrics: JoinOneField<DriverMetricsOrm>;

	history: JoinManyField<RidesOrm>;
}
export const $driversOrm: OrmRef<DriversOrm> = buildOrm($driversSchema).defineRelation("driver", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		name: column(schema.name),
		metrics: join.many($driverMetricsOrm).on((metrics, driver) => driver.id.$eq(metrics.driverId)),
		history: join.many($ridesOrm).on((ride, driver) => ride.driverId.$eq(driver.id))
	};
});

export interface PassengersOrm extends RelationalOrm {
	id: ColumnField<number>;
	name: ColumnField<string>;

	metrics: JoinOneField<PassengerMetricsOrm>;

	history: JoinManyField<RidesOrm>;
}
export const $passengersOrm: OrmRef<PassengersOrm> = buildOrm($passengersSchema).defineRelation("passenger", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		name: column(schema.name),
		metrics: join.many($passengerMetricsOrm).on((metrics, passenger) => passenger.id.$eq(metrics.passengerId)),
		history: join.many($ridesOrm).on((ride, passenger) => ride.passengerId.$eq(passenger.id))
	};
});

export interface RidesOrm extends RelationalOrm {
	id: ColumnField<number>;
	driverId: ColumnField<number>;
	driver: JoinOneField<DriversOrm>;
	passengerId: ColumnField<number>;
	passenger: JoinOneField<PassengersOrm>;

	startTime: ColumnField<Date>;
	distance: ColumnField<number>;
	price: ColumnField<number>;
	duration: ColumnField<number>;

	reviews: {
		driver: JoinOneField<DriverReviewsOrm>,
		passenger: JoinOneField<PassengerReviewsOrm>
	};
}
export const $ridesOrm: OrmRef<RidesOrm> = buildOrm($ridesSchema).defineRelation("ride", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		driverId: column(schema.driverId).exclude().alias((ride) => ride.driver.id),
		driver: join.one($driversOrm).on((ride, driver) => ride.driverId.$eq(driver.id)),
		passengerId: column(schema.passengerId).exclude().alias((ride) => ride.passenger.id),
		passenger: join.one($passengersOrm).on((ride, passenger) => ride.passengerId.$eq(passenger.id)),

		startTime: column(schema.startTime),
		distance: column(schema.distance),
		price: column(schema.price),
		duration: column(schema.duration),

		reviews: {
			driver: join.one($driverReviewsOrm).on((ride, review) => ride.id.$eq(review.rideId)).optional(),
			passenger: join.one($passengerReviewsOrm).on((ride, review) => ride.id.$eq(review.rideId)).optional()
		}
	};
});

export interface DriverReviewsOrm extends RelationalOrm {
	id: ColumnField<number>;
	rideId: ColumnField<number>;
	ride: JoinOneField<RidesOrm>;
	rating: ColumnField<number>;
	message: ColumnField<string>;
}
export const $driverReviewsOrm: OrmRef<DriverReviewsOrm> = buildOrm($driverReviewsSchema).defineRelation("driverReview", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		rideId: column(schema.rideId).exclude().alias((review) => review.ride.id),
		ride: join.one($ridesOrm).on((review, ride) => review.rideId.$eq(ride.id)),
		rating: column(schema.rating),
		message: column(schema.message)
	};
});

export interface PassengerReviewsOrm extends RelationalOrm {
	id: ColumnField<number>;
	rideId: ColumnField<number>;
	ride: JoinOneField<RidesOrm>;
	rating: ColumnField<number>;
	message: ColumnField<string>;
}
export const $passengerReviewsOrm: OrmRef<PassengerReviewsOrm> = buildOrm($passengerReviewsSchema).defineRelation("passengerReview", ({ column, join, schema }) => {
	return {
		id: column(schema.id),
		rideId: column(schema.rideId).exclude().alias((review) => review.ride.id),
		ride: join.one($ridesOrm).on((review, ride) => review.rideId.$eq(ride.id)),
		rating: column(schema.rating),
		message: column(schema.message)
	};
});

export interface DriverMetricsOrm extends AggregateOrm {
	driverId: ColumnField<number>;
	averageRating: AggregateField;
	reviewsCount: AggregateField;
	totalDistance: AggregateField;
	totalEarnings: AggregateField;
}
export const $driverMetricsOrm: OrmRef<DriverMetricsOrm> = buildOrm($driverMetricsSchema).defineAggregation("driverMetrics", ({ aggregate, column, schema }) => {
	return {
		driverId: column(schema.driverId),
		averageRating: aggregate(schema.driverRating).average().asFloat().include(),
		reviewsCount: aggregate(schema.driverRating).count().asInt().include(),
		totalDistance: aggregate(schema.distance).sum().asFloat().include(),
		totalEarnings: aggregate(schema.price).sum().asFloat().include()
	};
});

export interface PassengerMetricsOrm extends AggregateOrm {
	passengerId: ColumnField<number>;
	averageRating: AggregateField;
	reviewsCount: AggregateField;
	totalDistance: AggregateField;
	totalCosts: AggregateField;
}
export const $passengerMetricsOrm: OrmRef<PassengerMetricsOrm> = buildOrm($passengerMetricsSchema).defineAggregation("passengerMetrics", ({ aggregate, column, schema }) => {
	return {
		passengerId: column(schema.passengerId),
		averageRating: aggregate(schema.passengerRating).average().asFloat().include(),
		reviewsCount: aggregate(schema.passengerRating).count().asInt().include(),
		totalDistance: aggregate(schema.distance).sum().asFloat().include(),
		totalCosts: aggregate(schema.price).sum().asFloat().include()
	};
});
