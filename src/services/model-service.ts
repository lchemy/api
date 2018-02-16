import { Filter, Orm, SortBy } from "@lchemy/orm";
import { Transaction } from "knex";

import { ApiField, Dao } from "../daos";

export abstract class ModelService<M, O extends Orm> {
	constructor(protected dao: Dao<M, O>) {

	}

	parseApiFilter(input: string, maxDepth?: number): Promise<Filter> {
		return this.dao.parseApiFilter(input, maxDepth);
	}

	parseApiFields(input: string, maxDepth?: number): Promise<ApiField[]> {
		return this.dao.parseApiFields(input, maxDepth);
	}

	parseApiSorts(input: string, maxDepth?: number): Promise<SortBy[]> {
		return this.dao.parseApiSorts(input, maxDepth);
	}

	withTransaction<T>(executor: (tx: Transaction) => T | Promise<T>, trx?: Transaction): Promise<T> {
		return this.dao.withTransaction(executor, trx);
	}

	async evaluateOrmBuilder<T>(builder: (orm: O) => T | Promise<T>): Promise<T> {
		return this.dao.evaluateOrmBuilder(builder);
	}
}
