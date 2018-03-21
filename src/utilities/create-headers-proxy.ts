import { ApiRequestHeaders } from "../models";

export function createHeadersProxy<T extends ApiRequestHeaders>(headers: T): T {
	const simplifiedHeaders = Object.keys(headers).reduce((memo, key) => {
		memo[key.toLowerCase()] = headers[key];
		return memo;
	}, {} as T);

	return new Proxy(simplifiedHeaders, {
		get: (target, key) => {
			if (typeof key === "string") {
				key = key.toLowerCase();
			}
			return target[key];
		}
	});
}
