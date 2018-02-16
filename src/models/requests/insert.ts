export interface InsertManyRequest<T, A = any> {
	items: T[];
	auth?: A;
}

export interface InsertOneRequest<T, A = any> {
	item: T;
	auth?: A;
}

export type InsertManyRequestBuilder<T, A = any> = () => InsertManyRequest<T, A>;
export type InsertOneRequestBuilder<T, A = any> = () => InsertOneRequest<T, A>;
