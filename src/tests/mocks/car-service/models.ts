import { Validator, rules } from "@lchemy/model/validation";

export interface AuthUser {
	isAdmin?: boolean;
	driverId?: number;
	passengerId?: number;
}

export interface Driver {
	id: number;
	name: string;

	metrics?: DriverMetrics[];

	history: Ride[];
}

export interface DriverMetrics {
	driverId: number;
	averageRating: number;
	reviewsCount: number;
	totalDistance: number;
	totalEarnings: number;
}

export interface Passenger {
	id: number;
	name: string;

	metrics?: PassengerMetrics[];

	history: Ride[];
}

export interface PassengerMetrics {
	passengerId: number;
	averageRating: number;
	reviewsCount: number;
	totalDistance: number;
	totalCosts: number;
}

export interface Ride {
	id: number;
	driver: Driver;
	passenger: Passenger;

	startTime: Date;
	distance: number;
	price: number;
	duration: number;

	reviews: {
		driver?: DriverReview,
		passenger?: PassengerReview
	};
}

export interface DriverReview {
	id: number;
	ride: Ride;
	rating: number;
	message?: string;
}

export interface PassengerReview {
	id: number;
	ride: Ride;
	rating: number;
	message?: string;
}



export const driverValidator = new Validator<Driver>({
	name: [
		rules.required(),
		rules.isString()
	]
});

export const passengerValidator = new Validator<Passenger>({
	name: [
		rules.required(),
		rules.isString()
	]
});

export const rideValidator = new Validator<Ride>({
	driver: [
		rules.required(),
		rules.model<Driver>({
			id: [
				rules.required(),
				rules.isNumber()
			]
		})
	],
	passenger: [
		rules.required(),
		rules.model<Passenger>({
			id: [
				rules.required(),
				rules.isNumber()
			]
		})
	],
	distance: [
		rules.required(),
		rules.isNumber()
	],
	price: [
		rules.required(),
		rules.isNumber()
	],
	duration: [
		rules.required(),
		rules.isNumber()
	]
});

export const driverReviewValidator = new Validator<DriverReview>({
	ride: [
		rules.required(),
		rules.model<Ride>({
			id: [
				rules.required(),
				rules.isNumber()
			]
		})
	],
	rating: [
		rules.required(),
		rules.isNumber(),
		rules.min(1),
		rules.max(5)
	],
	message: [
		rules.isString(),
		rules.maxLength(255)
	]
});

export const passengerReviewValidator = new Validator<DriverReview>({
	ride: [
		rules.required(),
		rules.model<Ride>({
			id: [
				rules.required(),
				rules.isNumber()
			]
		})
	],
	rating: [
		rules.required(),
		rules.isNumber(),
		rules.min(1),
		rules.max(5)
	],
	message: [
		rules.isString(),
		rules.maxLength(255)
	]
});
