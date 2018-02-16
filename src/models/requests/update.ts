export {
	UpdateWithFilterRequestBuilder
} from "@lchemy/orm";

export interface UpdateManyRequest<T, A = any> {
	items: T[];
	auth?: A;
}

export interface UpdateOneRequest<T, A = any> {
	item: T;
	auth?: A;
}

export type UpdateManyRequestBuilder<T, A = any> = () => UpdateManyRequest<T, A>;
export type UpdateOneRequestBuilder<T, A = any> = () => UpdateOneRequest<T, A>;
