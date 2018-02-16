import { provide } from "@lchemy/di";
import { ColumnField } from "@lchemy/orm";

import { ReadableDao, WritableDao } from "../../../index";

import {
	Driver,
	DriverMetrics,
	DriverReview,
	Passenger,
	PassengerMetrics,
	PassengerReview,
	Ride
} from "./models";
import {
	$driverMetricsOrm,
	$driverReviewsOrm,
	$driversOrm,
	$passengerMetricsOrm,
	$passengerReviewsOrm,
	$passengersOrm,
	$ridesOrm,
	DriverMetricsOrm,
	DriverReviewsOrm,
	DriversOrm,
	PassengerMetricsOrm,
	PassengerReviewsOrm,
	PassengersOrm,
	RidesOrm
} from "./orms";

@provide()
export class DriversDao extends WritableDao<Driver, DriversOrm> {
	protected ormRef = $driversOrm;

	protected getInsertableFields(orm: DriversOrm): ColumnField[] {
		return [
			orm.name
		];
	}

	protected modelToDbJson(model: Driver): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): Driver {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class PassengersDao extends WritableDao<Passenger, PassengersOrm> {
	protected ormRef = $passengersOrm;

	protected getInsertableFields(orm: PassengersOrm): ColumnField[] {
		return [
			orm.name
		];
	}

	protected modelToDbJson(model: Passenger): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): Passenger {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class RidesDao extends WritableDao<Ride, RidesOrm> {
	protected ormRef = $ridesOrm;

	protected getInsertableFields(orm: RidesOrm): ColumnField[] {
		return [
			orm.driverId,
			orm.passengerId,
			orm.startTime,
			orm.distance,
			orm.price,
			orm.duration
		];
	}

	protected getUpdatableFields(orm: RidesOrm): ColumnField[] {
		return [
			orm.startTime,
			orm.distance,
			orm.price,
			orm.duration
		];
	}

	protected modelToDbJson(model: Ride): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): Ride {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class DriverReviewsDao extends WritableDao<DriverReview, DriverReviewsOrm> {
	protected ormRef = $driverReviewsOrm;

	protected getInsertableFields(orm: DriverReviewsOrm): ColumnField[] {
		return [
			orm.rideId,
			orm.rating,
			orm.message
		];
	}

	protected modelToDbJson(model: DriverReview): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): DriverReview {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class PassengerReviewsDao extends WritableDao<PassengerReview, PassengerReviewsOrm> {
	protected ormRef = $passengerReviewsOrm;

	protected getInsertableFields(orm: PassengerReviewsOrm): ColumnField[] {
		return [
			orm.rideId,
			orm.rating,
			orm.message
		];
	}

	protected modelToDbJson(model: PassengerReview): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): PassengerReview {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class DriverMetricsDao extends ReadableDao<DriverMetrics, DriverMetricsOrm> {
	protected ormRef = $driverMetricsOrm;

	protected modelToDbJson(model: DriverMetrics): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): DriverMetrics {
		return {
			...json,
			__model: true
		} as any;
	}
}

@provide()
export class PassengerMetricsDao extends ReadableDao<PassengerMetrics, PassengerMetricsOrm> {
	protected ormRef = $passengerMetricsOrm;

	protected modelToDbJson(model: PassengerMetrics): object {
		const { __model, ...out } = model as any;
		return out;
	}

	protected dbJsonToModel(json: object): PassengerMetrics {
		return {
			...json,
			__model: true
		} as any;
	}
}
