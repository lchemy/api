export interface UpsertManyRequest<T, A = any> {
	items: T[];
	auth?: A;
}

export interface UpsertOneRequest<T, A = any> {
	item: T;
	auth?: A;
}

export type UpsertManyRequestBuilder<T, A = any> = () => UpsertManyRequest<T, A>;
export type UpsertOneRequestBuilder<T, A = any> = () => UpsertOneRequest<T, A>;
