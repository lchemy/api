import { provide } from "@lchemy/di";

import { ReadableService, WritableService } from "../../../index";

import {
	DriverMetricsDao,
	DriverReviewsDao,
	DriversDao,
	PassengerMetricsDao,
	PassengerReviewsDao,
	PassengersDao,
	RidesDao
} from "./daos";
import {
	Driver,
	DriverMetrics,
	DriverReview,
	Passenger,
	PassengerMetrics,
	PassengerReview,
	Ride,
	driverReviewValidator,
	driverValidator,
	passengerReviewValidator,
	passengerValidator,
	rideValidator
} from "./models";
import {
	DriverMetricsOrm,
	DriverReviewsOrm,
	DriversOrm,
	PassengerMetricsOrm,
	PassengerReviewsOrm,
	PassengersOrm,
	RidesOrm
} from "./orms";

@provide()
export class DriversService extends WritableService<Driver, DriversOrm> {
	protected validator = driverValidator;

	constructor(protected dao: DriversDao) {
		super(dao);
	}
}

@provide()
export class PassengersService extends WritableService<Passenger, PassengersOrm> {
	protected validator = passengerValidator;

	constructor(protected dao: PassengersDao) {
		super(dao);
	}
}

@provide()
export class RidesService extends WritableService<Ride, RidesOrm> {
	protected validator = rideValidator;

	constructor(protected dao: RidesDao) {
		super(dao);
	}
}

@provide()
export class DriverReviewsService extends WritableService<DriverReview, DriverReviewsOrm> {
	protected validator = driverReviewValidator;

	constructor(protected dao: DriverReviewsDao) {
		super(dao);
	}
}

@provide()
export class PassengerReviewsService extends WritableService<PassengerReview, PassengerReviewsOrm> {
	protected validator = passengerReviewValidator;

	constructor(protected dao: PassengerReviewsDao) {
		super(dao);
	}
}

@provide()
export class DriverMetricsService extends ReadableService<DriverMetrics, DriverMetricsOrm> {
	constructor(protected dao: DriverMetricsDao) {
		super(dao);
	}
}

@provide()
export class PassengerMetricsService extends ReadableService<PassengerMetrics, PassengerMetricsOrm> {
	constructor(protected dao: PassengerMetricsDao) {
		super(dao);
	}
}
