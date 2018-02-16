import { parseApiFilter } from "@lchemy/api-filter-parser";
import { AggregateField, ColumnField, DerivedField, Field, Filter, Orm, OrmRef, SortBy, SortDirection } from "@lchemy/orm";
import Boom from "boom";
import { Map, Set } from "immutable";
import { Transaction } from "knex";

import { MAX_API_ORM_DEPTH } from "../constants";

export type ApiField = Field | { [key: string]: Field };

export abstract class Dao<M, O extends Orm> {
	protected abstract ormRef: OrmRef<O>;

	protected primaryFields = this.evaluateOrmBuilder<Set<ColumnField>>((orm) => {
		return orm["🜀"].primaryFields;
	});

	private apiFieldCache = Map<string, ApiField>();

	async withTransaction<T>(executor: (tx: Transaction) => T | Promise<T>, trx?: Transaction): Promise<T> {
		if (trx != null) {
			return executor(trx);
		}
		const orm = await this.ormRef["🜅"],
			db = await orm["🜀"].schema["🜃"].database;
		return db.transaction(async (tx) => executor(tx));
	}

	parseApiFilter(input: string, maxDepth: number = MAX_API_ORM_DEPTH): Promise<Filter> {
		return parseApiFilter(this.ormRef, input, maxDepth);
	}

	parseApiFields(input: string, maxDepth: number = MAX_API_ORM_DEPTH): Promise<ApiField[]> {
		const paths = input.split(",").map((path) => path.trim());
		return Promise.all(paths.map((path) => {
			return this.parseApiField(path, maxDepth);
		}));
	}

	parseApiSorts(input: string, maxDepth: number = MAX_API_ORM_DEPTH): Promise<SortBy[]> {
		const sorts = input.split(",").map((path) => path.trim());

		return Promise.all(sorts.map(async (sort) => {
			const [path, sortDir] = sort.split(" ", 2);

			let direction = SortDirection.ASCENDING;
			if (sortDir != null) {
				switch (sortDir.trim().toLowerCase()) {
					case "":
					case "asc":
					case "ascending":
						direction = SortDirection.ASCENDING;
						break;
					case "desc":
					case "descending":
						direction = SortDirection.DESCENDING;
						break;
					default:
						throw Boom.badRequest(`Invalid sort direction ${ sortDir }`);
				}
			}

			const field = await this.parseApiField(path, maxDepth);
			if (!(field instanceof AggregateField || field instanceof ColumnField || field instanceof DerivedField)) {
				throw Boom.badRequest(`Invalid sort path ${ path }, sortable field not found`);
			}

			return {
				field,
				direction
			};
		}));
	}

	async parseApiField(input: string, maxDepth: number): Promise<ApiField> {
		const path = input.trim();

		if (this.apiFieldCache.has(path)) {
			return this.apiFieldCache.get(path)!;
		}

		return this.evaluateOrmBuilder((orm) => {
			const field = path.split(".").reduce((memo, key) => {
				if (memo == null) {
					return undefined;
				}
				if (maxDepth != null && memo instanceof Field && memo["🜁"].depth > maxDepth) {
					throw new Error(`Invalid field with path ${ path }, exceeds max join depth of ${ maxDepth }`);
				}
				return memo[key];
			}, orm as any) as ApiField | undefined;

			if (field == null) {
				throw new Error(`Invalid field with path ${ path }`);
			}

			this.apiFieldCache = this.apiFieldCache.set(path, field);

			return field;
		});
	}

	async evaluateOrmBuilder<T>(builder: (orm: O) => T | Promise<T>): Promise<T> {
		if (this.ormRef == null) {
			await Promise.resolve();
		}
		const orm = await this.ormRef["🜅"];
		return builder(orm);
	}

	protected modelToDbJson(model: M): object {
		return model as any;
	}

	protected dbJsonToModel(json: object): M {
		return json as any;
	}

	protected modelsToDbJsons(models: M[]): object[] {
		return models.map((model) => this.modelToDbJson(model));
	}
	protected dbJsonsToModels(jsons: object[]): M[] {
		return jsons.map((json) => this.dbJsonToModel(json));
	}
}
