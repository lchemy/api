import { Orm } from "@lchemy/orm";
import { FindRequestField } from "@lchemy/orm/models";

export {
	FindOneRequestBuilder,
	FindAllRequestBuilder,
	FindCountRequestBuilder,
	FindAllWithCountRequestBuilder
} from "@lchemy/orm";

export interface FindAllByPrimaryFieldsRequest<T, A = any> {
	fields?: FindRequestField[];
	items: T[];
	auth?: A;
}

export interface FindOneByPrimaryFieldsRequest<T, A = any> {
	fields?: FindRequestField[];
	item: T;
	auth?: A;
}

export interface FindExistsByPrimaryFieldsRequest<T, A = any> {
	// TODO: item should be a deep partial
	item: T;
	auth?: A;
}

export type FindAllByPrimaryFieldsRequestBuilder<O extends Orm, T, A = any> = (orm: O) => FindAllByPrimaryFieldsRequest<T, A>;
export type FindOneByPrimaryFieldsRequestBuilder<O extends Orm, T, A = any> = (orm: O) => FindOneByPrimaryFieldsRequest<T, A>;
export type FindExistsByPrimaryFieldsRequestBuilder<T, A = any> = () => FindExistsByPrimaryFieldsRequest<T, A>;
