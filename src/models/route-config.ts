import { ApiRequest } from "./api-request";

export type RouteHandler<A = any> = (request: ApiRequest<A>) => Promise<any> | any;

export type RouteAuth<A = any> = (auth?: A) => Promise<boolean> | boolean;

export interface RouteMetadata {
	description?: string;
	contentType?: string;
	authStrategies?: string[];
}

export interface BaseRouteConfig<A = any> {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	path: string;
	handler: RouteHandler<A>;
	metadata?: RouteMetadata;
}

export interface Route<A = any> extends BaseRouteConfig<A> {
	auth?: "none";
}

export interface RouteConfig<A = any> extends BaseRouteConfig<A> {
	auth?: RouteAuth<A> | "required" | "optional" | "none";
}
