import { ApiRequestHeaders } from "../models";

export function createHeadersProxy<T extends ApiRequestHeaders>(headers: T): T {
	const simplifiedHeaders = Object.keys(headers).reduce<T>((memo: T, key: string) => ({
		...memo,
		[key.toLowerCase()]: headers[key]
	}), {} as T);

	return new Proxy(simplifiedHeaders, {
		get: (target: T, key: string | any) => {
			if (typeof key !== "string") {
				key = String(key);
			}
			key = key.toLowerCase();
			return target[key];
		}
	});
}
