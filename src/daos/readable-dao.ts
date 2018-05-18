import { Orm, findAll, findAllWithCount, findCount, findOne } from "@lchemy/orm";
import { Transaction } from "knex";

import {
	FindAllByPrimaryFieldsRequestBuilder,
	FindAllRequestBuilder,
	FindAllWithCountRequestBuilder,
	FindCountRequestBuilder,
	FindExistsByPrimaryFieldsRequestBuilder,
	FindOneByPrimaryFieldsRequestBuilder,
	FindOneRequestBuilder
} from "../models";
import { createFilterFromFieldValues } from "../utilities";

import { Dao } from "./dao";

export abstract class ReadableDao<M, O extends Orm, A = any> extends Dao<M, O> {
	findAllRaw(builder: FindAllRequestBuilder<O, A>, trx?: Transaction): Promise<object[]> {
		return findAll(this.ormRef, builder, trx);
	}

	async findAll(builder: FindAllRequestBuilder<O, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.findAllRaw(builder, trx);
		return this.dbJsonsToModels(rows);
	}

	findAllWithCountRaw(builder: FindAllWithCountRequestBuilder<O, A>, trx?: Transaction): Promise<{ count: number, rows: object[] }> {
		return findAllWithCount(this.ormRef, builder, trx);
	}

	async findAllWithCount(builder: FindAllWithCountRequestBuilder<O, A>, trx?: Transaction): Promise<{ count: number, rows: M[] }> {
		const { count, rows } = await this.findAllWithCountRaw(builder, trx);
		return {
			count,
			rows: this.dbJsonsToModels(rows)
		};
	}

	findOneRaw(builder: FindOneRequestBuilder<O, A>, trx?: Transaction): Promise<object | undefined> {
		return findOne(this.ormRef, builder, trx);
	}

	async findOne(builder: FindOneRequestBuilder<O, A>, trx?: Transaction): Promise<M | undefined> {
		const row = await this.findOneRaw(builder, trx);
		return row != null ? this.dbJsonToModel(row) : undefined;
	}

	findCount(builder: FindCountRequestBuilder<O, A>, trx?: Transaction): Promise<number> {
		return findCount(this.ormRef, builder, trx);
	}

	async findAllRawByPrimaryFields(builder: FindAllByPrimaryFieldsRequestBuilder<O, object, A>, trx?: Transaction): Promise<object[]> {
		const primaryFields = await this.primaryFields;

		return findAll(this.ormRef, (orm) => {
			const { fields, items, auth } = builder(orm),
				filter = createFilterFromFieldValues(primaryFields, items),
				pagination = { limit: items.length };
			return { fields, filter, pagination, auth };
		}, trx);
	}

	async findAllByPrimaryFields(builder: FindAllByPrimaryFieldsRequestBuilder<O, M, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.findAllRawByPrimaryFields((orm) => {
			const { items, fields, auth } = builder(orm);
			return {
				items: this.modelsToDbJsons(items),
				fields,
				auth
			};
		}, trx);
		return this.dbJsonsToModels(rows);
	}

	async findOneRawByPrimaryFields(builder: FindOneByPrimaryFieldsRequestBuilder<O, object, A>, trx?: Transaction): Promise<object | undefined> {
		const primaryFields = await this.primaryFields;

		return findOne(this.ormRef, (orm) => {
			const { fields, filter: builderFilter, item, auth } = builder(orm),
				primaryFieldFilter = createFilterFromFieldValues(primaryFields, [item]),
				filter = builderFilter != null ? primaryFieldFilter.and(builderFilter) : primaryFieldFilter;
			return { fields, filter, auth };
		}, trx);
	}

	async findOneByPrimaryFields(builder: FindOneByPrimaryFieldsRequestBuilder<O, M, A>, trx?: Transaction): Promise<M | undefined> {
		const row = await this.findOneRawByPrimaryFields((orm) => {
			const { fields, filter, item, auth } = builder(orm);
			return {
				fields,
				filter,
				item: this.modelToDbJson(item),
				auth
			};
		}, trx);
		return row != null ? this.dbJsonToModel(row) : undefined;
	}

	async findExistsWithFilter(builder: FindCountRequestBuilder<O, A>, trx?: Transaction): Promise<boolean> {
		const count = await this.findCount(builder, trx);
		return count !== 0;
	}

	async findExistsRawByPrimaryFields(builder: FindExistsByPrimaryFieldsRequestBuilder<object, A>, trx?: Transaction): Promise<boolean> {
		const primaryFields = await this.primaryFields;

		const count = await findCount(this.ormRef, () => {
			const { item, auth } = builder(),
				filter = createFilterFromFieldValues(primaryFields, [item]);
			return { filter, auth };
		}, trx);

		return count !== 0;
	}

	findExistsByPrimaryFields(builder: FindExistsByPrimaryFieldsRequestBuilder<M, A>, trx?: Transaction): Promise<boolean> {
		return this.findExistsRawByPrimaryFields(() => {
			const { item, auth } = builder();
			return {
				item: this.modelToDbJson(item),
				auth
			};
		}, trx);
	}
}
