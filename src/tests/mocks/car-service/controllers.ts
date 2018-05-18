import { provide } from "@lchemy/di";
import Boom from "boom";

import { ReadableController, WritableController } from "../../../index";

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
	DriverMetricsOrm,
	DriverReviewsOrm,
	DriversOrm,
	PassengerMetricsOrm,
	PassengerReviewsOrm,
	PassengersOrm,
	RidesOrm
} from "./orms";
import {
	DriverMetricsService,
	DriverReviewsService,
	DriversService,
	PassengerMetricsService,
	PassengerReviewsService,
	PassengersService,
	RidesService
} from "./services";

// TODO: add auth

@provide()
export class DriversController extends WritableController<Driver, DriversOrm> {
	constructor(protected service: DriversService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/drivers",
			handler: this.find
		}, {
			method: "GET",
			path: "/drivers/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/drivers",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/drivers/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/drivers/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): Driver {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkUpdateParamsMatchesBody(bodyModel: Driver, paramModel: Driver): boolean {
		return bodyModel.id === paramModel.id;
	}
}

@provide()
export class PassengersController extends WritableController<Passenger, PassengersOrm> {
	constructor(protected service: PassengersService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/passengers",
			handler: this.find
		}, {
			method: "GET",
			path: "/passengers/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/passengers",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/passengers/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/passengers/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): Passenger {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkUpdateParamsMatchesBody(bodyModel: Passenger, paramModel: Passenger): boolean {
		return bodyModel.id === paramModel.id;
	}
}

@provide()
export class RidesController extends WritableController<Ride, RidesOrm> {
	constructor(protected service: RidesService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/rides",
			handler: this.find
		}, {
			method: "GET",
			path: "/rides/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/rides",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/rides/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/rides/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): Ride {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkUpdateParamsMatchesBody(bodyModel: Ride, paramModel: Ride): boolean {
		return bodyModel.id === paramModel.id;
	}
}

@provide()
export class DriverReviewsController extends WritableController<DriverReview, DriverReviewsOrm> {
	constructor(protected service: DriverReviewsService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/driver-reviews",
			handler: this.find
		}, {
			method: "GET",
			path: "/driver-reviews/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/driver-reviews",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/driver-reviews/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/driver-reviews/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): DriverReview {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkUpdateParamsMatchesBody(bodyModel: DriverReview, paramModel: DriverReview): boolean {
		return bodyModel.id === paramModel.id;
	}
}

@provide()
export class PassengerReviewsController extends WritableController<PassengerReview, PassengerReviewsOrm> {
	constructor(protected service: PassengerReviewsService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/passenger-reviews",
			handler: this.find
		}, {
			method: "GET",
			path: "/passenger-reviews/:id",
			handler: this.findOne
		}, {
			method: "POST",
			path: "/passenger-reviews",
			handler: this.insert
		}, {
			method: "PUT",
			path: "/passenger-reviews/:id",
			handler: this.update
		}, {
			method: "DELETE",
			path: "/passenger-reviews/:id",
			handler: this.remove
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): PassengerReview {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			id: Number(id)
		} as any;
	}

	protected checkUpdateParamsMatchesBody(bodyModel: PassengerReview, paramModel: PassengerReview): boolean {
		return bodyModel.id === paramModel.id;
	}
}

@provide()
export class DriverMetricsController extends ReadableController<DriverMetrics, DriverMetricsOrm> {
	constructor(protected service: DriverMetricsService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/driver-metrics",
			handler: this.find
		}, {
			method: "GET",
			path: "/driver-metrics/:id",
			handler: this.findOne
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): DriverMetrics {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			driverId: Number(id)
		} as any;
	}
}

@provide()
export class PassengerMetricsController extends ReadableController<PassengerMetrics, PassengerMetricsOrm> {
	constructor(protected service: PassengerMetricsService) {
		super(service);

		this.addRoutes([{
			method: "GET",
			path: "/passenger-metrics",
			handler: this.find
		}, {
			method: "GET",
			path: "/passenger-metrics/:id",
			handler: this.findOne
		}]);
	}

	protected findOneParamsToModel({ id }: { id: string }): PassengerMetrics {
		if (isNaN(id as any)) {
			throw Boom.badRequest();
		}
		return {
			passengerId: Number(id)
		} as any;
	}
}
