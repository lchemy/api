import { ExpressionError, ParseError, ValueError } from "@lchemy/api-filter-parser";
import { Filter, Orm, Pagination, SortBy } from "@lchemy/orm";
import Boom from "boom";

import { ApiField } from "../daos";
import { ApiRequest, ApiRequestParams } from "../models";
import { ReadableService } from "../services";

import { ModelController } from "./model-controller";

export interface QueryFilterMap<O extends Orm, A = any> {
	[key: string]: (orm: O, value?: string | string[], auth?: A) => Filter | undefined;
}

export type ParamsFilter<O extends Orm, A = any> = (orm: O, params: ApiRequestParams, auth?: A) => Filter | undefined;

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
	defaultRequestLimit?: number | null;
	maxRequestLimit?: number | null;
	findParamsFilter?: ParamsFilter<O, A>;
	findOneParamsFilter?: ParamsFilter<O, A>;
}

export abstract class ReadableController<M extends object, O extends Orm, A = any> extends ModelController<M, O, A> {
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

	private get defaultQueryLimit(): number | null {
		if (this.config.defaultRequestLimit === undefined) {
			return 50;
		}
		if (this.config.defaultRequestLimit === null) {
			return this.maxQueryLimit;
		}
		return this.config.defaultRequestLimit;
	}

	private get maxQueryLimit(): number | null {
		return this.config.maxRequestLimit !== undefined ? this.config.maxRequestLimit : 500;
	}

	private get findParamsFilter(): ParamsFilter<O, A> {
		return this.config.findParamsFilter != null ? this.config.findParamsFilter : () => undefined;
	}

	private get findOneParamsFilter(): ParamsFilter<O, A> {
		return this.config.findOneParamsFilter != null ? this.config.findOneParamsFilter : this.findParamsFilter;
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
			const paramsFilter = this.findParamsFilter(orm, params, auth);

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

		await this.assertValidFindOneParams(params);

		const model = await this.service.findByPrimaryFields((orm) => {
			const filter = this.findOneParamsFilter(orm, params, auth);
			return { fields, filter, item, auth };
		});

		if (model == null) {
			throw Boom.notFound();
		}

		return {
			data: this.modelToJson(model)
		};
	}

	protected abstract findOneParamsToModel(params?: ApiRequestParams): M;

	protected async assertValidFindParams(_params: ApiRequestParams): Promise<void> {
		return;
	}

	protected assertValidFindOneParams(params: ApiRequestParams): Promise<void> {
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

		try {
			const fields = await this.service.parseApiFields(rawFields);
			return fields;
		} catch (err) {
			const boom = Boom.badRequest("Invalid fields query parameter");
			if (err.message != null) {
				(boom.output.payload as any).reason = err.message;
			}
			throw boom;
		}
	}

	protected async parseRequestFilter({ query, auth }: ApiRequest): Promise<Filter | undefined> {
		const rawFilter = query != null ? query[this.queryKeys.filter] : undefined;
		if (Array.isArray(rawFilter)) {
			throw Boom.badRequest();
		}

		let filter: Filter | undefined;
		if (rawFilter != null && rawFilter !== "") {
			try {
				filter = await this.service.parseApiFilter(rawFilter);
			} catch (err) {
				const boom = Boom.badRequest("Invalid filter query parameter");
				if (err instanceof ParseError) {
					(boom.output.payload as any).reason = err.message;
					(boom.output.payload as any).annotatedInput = err.annotatedInput;
				}
				if (err instanceof ExpressionError || err instanceof ValueError) {
					(boom.output.payload as any).reason = err.message;
				}
				throw boom;
			}
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
		if (limit == null) {
			limit = this.maxQueryLimit;
		} else {
			if (limit < 0) {
				limit = 0;
			} else if (this.maxQueryLimit != null && limit > this.maxQueryLimit) {
				throw Boom.badRequest(`Cannot set limit above max query limit of ${ this.maxQueryLimit }`);
			}
		}

		return { offset, limit };
	}
}
