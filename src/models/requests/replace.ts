import { Filter, Orm } from "@lchemy/orm";

export interface ReplaceRequest<T, A = any> {
	items: T[];
	filter: Filter;
	auth?: A;
}

export type ReplaceRequestBuilder<O extends Orm, T, A = any> = (orm: O) => ReplaceRequest<T, A>;
