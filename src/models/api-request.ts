export interface ApiRequestParams {
	[key: string]: string | undefined;
}

export interface ApiRequestQuery {
	[key: string]: string | string[] | undefined;
}

export interface ApiRequestHeaders {
	[key: string]: string | undefined;
}

export interface ApiRequest<A = any> {
	params?: ApiRequestParams;
	query?: ApiRequestQuery;
	headers?: ApiRequestHeaders;
	body?: any;
	auth?: A;
}
