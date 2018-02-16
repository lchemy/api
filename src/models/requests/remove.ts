export {
	RemoveWithFilterRequestBuilder
} from "@lchemy/orm";

export interface RemoveManyRequest<T, A = any> {
	items: T[];
	auth?: A;
}

export interface RemoveOneRequest<T, A = any> {
	item: T;
	auth?: A;
}

export type RemoveManyRequestBuilder<T, A = any> = () => RemoveManyRequest<T, A>;
export type RemoveOneRequestBuilder<T, A = any> = () => RemoveOneRequest<T, A>;
