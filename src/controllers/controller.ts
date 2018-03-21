import Boom from "boom";
import "reflect-metadata";

import { ROUTES_METADATA_KEY } from "../constants";
import { ApiRequest, Route, RouteConfig } from "../models";
import { createHeadersProxy } from "../utilities";

export abstract class Controller<A = any> {
	private routes: Array<Route<A>> = [];

	constructor() {
		const metadataRoutes = Reflect.getMetadata(ROUTES_METADATA_KEY, Object.getPrototypeOf(this)) as RouteConfig[] | undefined;
		if (metadataRoutes != null) {
			this.addRoutes(metadataRoutes);
		}
	}

	getRoutes(): Array<Route<A>> {
		return this.routes;
	}

	addRoute(config: RouteConfig<A>): void {
		const route = this.expandConfig(config);
		this.routes.push(route);
	}

	addRoutes(configs: Array<RouteConfig<A>>): void {
		configs.forEach((config) => this.addRoute(config));
	}

	private expandConfig(config: RouteConfig<A>): Route<A> {
		const handler = async (request: ApiRequest<A>) => {
			if (config.auth !== "optional" && config.auth !== "none") {
				const auth = request.auth;
				if (auth == null) {
					throw Boom.unauthorized();
				}

				if (typeof config.auth === "function") {
					const allowed = await config.auth(auth);
					if (!allowed) {
						throw Boom.forbidden();
					}
				}
			}

			if (request.headers != null) {
				request.headers = createHeadersProxy(request.headers);
			}

			return config.handler.call(this, request);
		};

		return {
			method: config.method,
			path: config.path,
			handler,
			metadata: config.metadata,
			auth: config.auth === "none" ? "none" : undefined
		};
	}
}
