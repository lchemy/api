import "reflect-metadata";

import { ROUTES_METADATA_KEY } from "../constants";
import { Controller } from "../controllers";
import { RouteConfig, RouteHandler, RouteMetadata } from "../models";

export type RouteMethodDecorator<A> = (target: Controller, propertyKey: string, descriptor: TypedPropertyDescriptor<RouteHandler<A>>) => void;

export function route<A = any>(method: RouteConfig["method"], path: string, auth?: RouteConfig["auth"], metadata?: RouteMetadata): RouteMethodDecorator<A> {
	return (target, propertyKey) => {
		const handler = (target as any)[propertyKey] as RouteHandler<A>,
			config = { method, path, handler, auth, metadata } as RouteConfig;

		let routes = Reflect.getOwnMetadata(ROUTES_METADATA_KEY, target) as RouteConfig[];
		if (routes == null) {
			routes = [];
			Reflect.defineMetadata(ROUTES_METADATA_KEY, routes, target);
		}

		routes.push(config);
	};
}
