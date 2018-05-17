import { Filter, Orm, Pagination, SortBy } from "@lchemy/orm";
import Boom from "boom";

import { ApiField } from "../daos";
import { ApiRequest } from "../models";
import { ReadableService } from "../services";

import { ModelController } from "./model-controller";

export interface QueryFilterMap<O extends Orm, A = any> {
	[key: string]: (orm: O, value?: string | string[], auth?: A) => Filter | undefined;
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
		const params = request.params != null ? request.params : {},
			rawFilter = await this.parseRequestFilter(request),
			fields = await this.parseRequestFields(request),
			sortBy = await this.parseRequestSorts(request),
			pagination = await this.parseRequestPagination(request),
			auth = request.auth;

		await this.assertValidFindParams(params);

		const { rows, count } = await this.service.findWithCount((orm) => {
			const paramsFilter = this.getFindParamsFilter(orm, params);

			let filter: Filter | undefined;
			if (rawFilter != null && paramsFilter != null) {
				filter = rawFilter.and(paramsFilter);
			} else if (rawFilter == null) {
				filter = paramsFilter;
			} else {
				filter = rawFilter;
			}

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

		await this.assertValidFindParams(params);

		const model = await this.service.findByPrimaryFields((orm) => {
			const filter = this.getFindOneParamsFilter(orm, params);
			return { fields, filter, item, auth };
		});

		if (model == null) {
			throw Boom.notFound();
		}

		return {
			data: this.modelToJson(model)
		};
	}

	protected abstract findOneParamsToModel(params?: { [key: string]: string | undefined }): M;

	protected getFindParamsFilter(_orm: O, _params?: { [key: string]: string | undefined }): Filter | undefined {
		return;
	}

	protected getFindOneParamsFilter(orm: O, params?: { [key: string]: string | undefined }): Filter | undefined {
		return this.getFindParamsFilter(orm, params);
	}

	protected async assertValidFindParams(_params: { [key: string]: string | undefined }): Promise<void> {
		return;
	}

	protected assertValidFindOneParams(params: { [key: string]: string | undefined }): Promise<void> {
		return this.assertValidFindParams(params);
	}

	protected async parseRequestFields({ query }: ApiRequest): Promise<ApiField[] | undefined> {
		if (query == null) {
			return;
		}

		let rawFields = query[this.queryKeys.fields];
		if (rawFields == null || rawFields === "") {
			return;
		}
		if (Array.isArray(rawFields)) {
			rawFields = rawFields.join(",");
		}

		return this.service.parseApiFields(rawFields);
	}

	protected async parseRequestFilter({ query, auth }: ApiRequest): Promise<Filter | undefined> {
		const rawFilter = query != null ? query[this.queryKeys.filter] : undefined;
		if (Array.isArray(rawFilter)) {
			throw Boom.badRequest();
		}

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

	protected async parseRequestSorts({ query }: ApiRequest): Promise<SortBy[] | undefined> {
		let rawSorts = query != null ? query[this.queryKeys.sorts] : undefined;
		if (Array.isArray(rawSorts)) {
			rawSorts = rawSorts.join(",");
		}

		let sorts: SortBy[] | undefined;
		if (rawSorts != null && rawSorts !== "") {
			sorts = await this.service.parseApiSorts(rawSorts);
		}

		if ((sorts == null || sorts.length === 0) && this.config.defaultSortBy != null) {
			sorts = await this.service.evaluateOrmBuilder((orm) => this.config.defaultSortBy!(orm));
		}

		return sorts;
	}

	protected parseRequestPagination({ query }: ApiRequest): Pagination {
		let rawLimit: string | string[] | undefined,
			rawOffset: string | string[] | undefined;
		if (query != null) {
			rawLimit = query[this.queryKeys.limit];
			if (Array.isArray(rawLimit)) {
				throw Boom.badRequest();
			}

			rawOffset = query[this.queryKeys.offset];
			if (Array.isArray(rawOffset)) {
				throw Boom.badRequest();
			}
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
