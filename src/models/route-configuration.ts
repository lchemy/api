import { ApiRequest } from "./api-request";

export type RouteHandler<A = any> = (request: ApiRequest<A>) => Promise<any> | any;

export type RouteAuth<A = any> = (auth?: A) => Promise<boolean> | boolean;

export interface RouteMetadata {
	description?: string;
	contentType?: string;
}

export interface Route<A = any> {
	method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
	path: string;
	handler: RouteHandler<A>;
	metadata?: RouteMetadata;
}

export interface RouteConfiguration<A = any> extends Route<A> {
	auth?: RouteAuth<A> | "required" | "optional" | "none";
}
