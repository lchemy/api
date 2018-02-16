export interface ApiRequest<A = any> {
	params?: { [key: string]: string | undefined };
	query?: { [key: string]: string | undefined };
	body?: any;
	auth?: A;
}
