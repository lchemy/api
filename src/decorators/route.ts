import "reflect-metadata";

import { ROUTES_METADATA_KEY } from "../constants";
import { Controller } from "../controllers";
import { RouteConfiguration, RouteHandler, RouteMetadata } from "../models";

export type RouteMethodDecorator<A> = (target: Controller, propertyKey: string, descriptor: TypedPropertyDescriptor<RouteHandler<A>>) => void;

export function route<A = any>(method: RouteConfiguration["method"], path: string, auth?: RouteConfiguration["auth"], metadata?: RouteMetadata): RouteMethodDecorator<A> {
	return (target, propertyKey) => {
		const handler = (target as any)[propertyKey] as RouteHandler<A>,
			config = { method, path, handler, auth, metadata } as RouteConfiguration;

		let routes = Reflect.getOwnMetadata(ROUTES_METADATA_KEY, target) as RouteConfiguration[];
		if (routes == null) {
			routes = [];
			Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target);
		}

		routes.push(config);
	};
}
