import { Filter, Orm, Pagination, SortBy } from "@lchemy/orm";
import Boom from "boom";

import { ApiField } from "../daos";
import { ApiRequest } from "../models";
import { ReadableService } from "../services";

import { ModelController } from "./model-controller";

export interface QueryFilterMap<O extends Orm, A = any> {
	[key: string]: (orm: O, value?: string, auth?: A) => Filter | undefined;
}

export interface QueryKeysConfiguration {
	fields: string;
	filter: string;
	sorts: string;
	offset: string;
	limit: string;
}

const DEFAULT_QUERY_KEYS: QueryKeysConfiguration = {
	fields: "fields",
	filter: "filter",
	sorts: "sorts",
	offset: "offset",
	limit: "limit"
};

export interface ReadableControllerConfiguration<O extends Orm, A = any> {
	queryKeys?: Partial<QueryKeysConfiguration>;
	defaultSortBy?: (orm: O) => SortBy[];
	additionalFilterMap?: QueryFilterMap<O, A>;
	defaultRequestLimit?: number;
	maxRequestLimit?: number;
}

export abstract class ReadableController<M, O extends Orm, A = any> extends ModelController<M, O, A> {
	protected config: ReadableControllerConfiguration<O, A> = {};

	private get queryKeys(): QueryKeysConfiguration {
		if (this._queryKeys == null) {
			this._queryKeys = {
				...DEFAULT_QUERY_KEYS,
				...this.config.queryKeys
			};
		}
		return this._queryKeys;
	}
	private _queryKeys!: QueryKeysConfiguration;

	private get defaultQueryLimit(): number {
		return this.config.defaultRequestLimit != null ? this.config.defaultRequestLimit : 50;
	}

	private get maxQueryLimit(): number {
		return this.config.maxRequestLimit != null ? this.config.maxRequestLimit : 500;
	}

	constructor(protected service: ReadableService<M, O, A>) {
		super(service);
	}

	async find(request: ApiRequest<A> = {}): Promise<{ data: object[], totalCount: number }> {
		const fields = await this.parseRequestFields(request),
			filter = await this.parseRequestFilter(request),
			sortBy = await this.parseRequestSorts(request),
			pagination = await this.parseRequestPagination(request),
			auth = request.auth;

		const { rows, count } = await this.service.findWithCount(() => {
			return { fields, sortBy, filter, pagination, auth };
		});

		return {
			data: this.modelsToJsons(rows),
			totalCount: count
		};
	}

	async findOne(request: ApiRequest<A> = {}): Promise<{ data: object }> {
		const params = request.params != null ? request.params : {},
			item = this.findOneParamsToModel(params),
			fields = await this.parseRequestFields(request),
			auth = request.auth;

		const model = await this.service.findByPrimaryFields(() => {
			return { fields, item, auth };
		});

		if (model == null) {
			throw Boom.notFound();
		}

		return {
			data: this.modelToJson(model)
		};
	}

	protected abstract findOneParamsToModel(params: { [key: string]: string | undefined }): M;

	private async parseRequestFields({ query }: ApiRequest): Promise<ApiField[] | undefined> {
		if (query == null) {
			return;
		}

		const rawFields = query[this.queryKeys.fields];
		if (rawFields == null || rawFields === "") {
			return;
		}

		return this.service.parseApiFields(rawFields);
	}

	private async parseRequestFilter({ query, auth }: ApiRequest): Promise<Filter | undefined> {
		const rawFilter = query != null ? query[this.queryKeys.filter] : undefined;

		let filter: Filter | undefined;
		if (rawFilter != null && rawFilter !== "") {
			filter = await this.service.parseApiFilter(rawFilter);
		}

		const additionalFilterMap = this.config.additionalFilterMap;
		if (additionalFilterMap != null) {
			await this.service.evaluateOrmBuilder((orm) => {
				(Object.keys(additionalFilterMap) as Array<keyof typeof additionalFilterMap>).forEach((key) => {
					const queryValue = query != null ? query[key] : undefined,
						additionalFilter = additionalFilterMap[key](orm, queryValue, auth);
					if (additionalFilter != null) {
						if (filter != null) {
							filter = filter.and(additionalFilter);
						} else {
							filter = additionalFilter;
						}
					}
				});
			});
		}

		return filter;
	}

	private async parseRequestSorts({ query }: ApiRequest): Promise<SortBy[] | undefined> {
		const rawSorts = query != null ? query[this.queryKeys.sorts] : undefined;

		let sorts: SortBy[] | undefined;
		if (rawSorts != null && rawSorts !== "") {
			sorts = await this.service.parseApiSorts(rawSorts);
		}

		if (sorts != null && sorts.length > 0) {
			return sorts;
		} else if (this.config.defaultSortBy != null) {
			sorts = await this.service.evaluateOrmBuilder((orm) => this.config.defaultSortBy!(orm));
		}
	}

	private parseRequestPagination({ query }: ApiRequest): Pagination {
		let rawLimit: string | undefined,
			rawOffset: string | undefined;
		if (query != null) {
			rawLimit = query[this.queryKeys.limit];
			rawOffset = query[this.queryKeys.offset];
		}

		const offset = rawOffset != null && !isNaN(rawOffset as any) ? Number(rawOffset) : 0;

		let limit = rawLimit != null && !isNaN(rawLimit as any) ? Number(rawLimit) : this.defaultQueryLimit;
		if (limit < 0) {
			limit = 0;
		} else if (limit > this.maxQueryLimit) {
			throw Boom.badRequest(`Cannot set limit above max query limit of ${ this.maxQueryLimit }`);
		}

		return { offset, limit };
	}
}
