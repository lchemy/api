import {
	ColumnField, Orm, insertMany, insertOne, removeMany, removeOne,
	removeWithFilter, updateMany, updateOne, updateWithFilter
} from "@lchemy/orm";
import { Set } from "immutable";
import { Transaction } from "knex";

import {
	InsertManyRequestBuilder,
	InsertOneRequestBuilder,
	RemoveManyRequestBuilder,
	RemoveOneRequestBuilder,
	RemoveWithFilterRequestBuilder,
	UpdateManyRequestBuilder,
	UpdateOneRequestBuilder,
	UpdateWithFilterRequestBuilder
} from "../models";

import { ReadableDao } from "./readable-dao";

export abstract class WritableDao<M, O extends Orm, A = any> extends ReadableDao<M, O, A> {
	protected insertableFields = this.evaluateOrmBuilder((orm) => {
		return Set(this.getInsertableFields(orm));
	});

	protected updatableFields = this.evaluateOrmBuilder((orm) => {
		return Set(this.getUpdatableFields(orm));
	});

	async insertManyRaw(builder: InsertManyRequestBuilder<object, A>, trx?: Transaction): Promise<object[]> {
		const fields = (await this.insertableFields).toArray();
		if (fields.length === 0) {
			throw new Error(`Cannot insert row with no fields specified`);
		}

		return this.withTransaction(async (tx) => {
			const persistedItems = await insertMany(this.ormRef, () => {
				const { items } = builder();
				return { fields, items };
			}, tx);

			return this.findAllRawByPrimaryFields(() => {
				return {
					items: persistedItems
				};
			}, tx);
		}, trx);
	}

	async insertMany(builder: InsertManyRequestBuilder<M, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.insertManyRaw(() => {
			const { items } = builder();
			return {
				items: this.modelsToDbJsons(items)
			};
		}, trx);

		return this.dbJsonsToModels(rows);
	}

	async insertOneRaw(builder: InsertOneRequestBuilder<object, A>, trx?: Transaction): Promise<object> {
		const fields = (await this.insertableFields).toArray();
		if (fields.length === 0) {
			throw new Error(`Cannot insert row with no fields specified`);
		}

		return this.withTransaction(async (tx) => {
			const persistedItem = await insertOne(this.ormRef, () => {
				const { item } = builder();
				return { fields, item };
			}, tx);

			const results = await this.findAllRawByPrimaryFields(() => {
				return {
					items: [
						persistedItem
					]
				};
			}, tx);

			return results[0];
		}, trx);
	}

	async insertOne(builder: InsertOneRequestBuilder<M, A>, trx?: Transaction): Promise<M> {
		const row = await this.insertOneRaw(() => {
			const { item } = builder();
			return {
				item: this.modelToDbJson(item)
			};
		}, trx);

		return this.dbJsonToModel(row);
	}

	async updateManyRaw(builder: UpdateManyRequestBuilder<object, A>, trx?: Transaction): Promise<object[]> {
		const fields = (await this.updatableFields).toArray(),
			{ items, auth } = builder();

		return this.withTransaction(async (tx) => {
			if (fields.length > 0) {
				await updateMany(this.ormRef, () => {
					return { fields, items, auth };
				}, tx);
			}

			return this.findAllRawByPrimaryFields(() => {
				return { items, auth };
			}, tx);
		}, trx);
	}

	async updateMany(builder: UpdateManyRequestBuilder<M, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.updateManyRaw(() => {
			const { items, auth } = builder();
			return {
				items: this.modelsToDbJsons(items),
				auth
			};
		}, trx);

		return this.dbJsonsToModels(rows);
	}

	async updateOneRaw(builder: UpdateOneRequestBuilder<object, A>, trx?: Transaction): Promise<object> {
		const fields = (await this.updatableFields).toArray(),
			{ item, auth } = builder();

		return this.withTransaction(async (tx) => {
			if (fields.length > 0) {
				await updateOne(this.ormRef, () => {
					return { fields, item, auth };
				}, tx);
			}

			const results = await this.findAllRawByPrimaryFields(() => {
				return {
					items: [
						item
					]
				};
			}, tx);

			return results[0];
		}, trx);
	}

	async updateOne(builder: UpdateOneRequestBuilder<M, A>, trx?: Transaction): Promise<M> {
		const row = await this.updateOneRaw(() => {
			const { item, auth } = builder();
			return {
				item: this.modelToDbJson(item),
				auth
			};
		}, trx);

		return this.dbJsonToModel(row);
	}

	async updateWithFilterRaw(builder: UpdateWithFilterRequestBuilder<O, A>, trx?: Transaction): Promise<object[]> {
		const request = await this.evaluateOrmBuilder(builder);

		return this.withTransaction(async (tx) => {
			await updateWithFilter(this.ormRef, () => request, tx);

			const { filter, auth, expected } = request,
				pagination = { limit: expected };
			return this.findAllRaw(() => {
				return { filter, auth, pagination };
			}, tx);
		}, trx);
	}

	async updateWithFilter(builder: UpdateWithFilterRequestBuilder<O, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.updateWithFilterRaw(builder, trx);
		return this.dbJsonsToModels(rows);
	}

	removeManyRaw(builder: RemoveManyRequestBuilder<object, A>, trx?: Transaction): Promise<number> {
		return removeMany(this.ormRef, builder, trx);
	}

	removeMany(builder: RemoveManyRequestBuilder<M, A>, trx?: Transaction): Promise<number> {
		return this.removeManyRaw(() => {
			const { items, auth } = builder();
			return {
				items: this.modelsToDbJsons(items),
				auth
			};
		}, trx);
	}

	removeOneRaw(builder: RemoveOneRequestBuilder<object, A>, trx?: Transaction): Promise<boolean> {
		return removeOne(this.ormRef, builder, trx);
	}

	removeOne(builder: RemoveOneRequestBuilder<M, A>, trx?: Transaction): Promise<boolean> {
		return this.removeOneRaw(() => {
			const { item, auth } = builder();
			return {
				item: this.modelToDbJson(item),
				auth
			};
		}, trx);
	}

	removeWithFilter(builder: RemoveWithFilterRequestBuilder<O, A>, trx?: Transaction): Promise<number> {
		return removeWithFilter(this.ormRef, builder, trx);
	}

	protected abstract getInsertableFields(orm: O): ColumnField[];

	protected getUpdatableFields(orm: O): ColumnField[] {
		return this.getInsertableFields(orm);
	}
}
