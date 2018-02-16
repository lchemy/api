import { ColumnField, Orm } from "@lchemy/orm";
import { processAliases } from "@lchemy/orm/utilities";
import { Set } from "immutable";
import { Transaction } from "knex";

import { UpsertManyRequestBuilder, UpsertOneRequestBuilder } from "../models";
import { createFilterFromFieldValues, createRecordsMap, getFieldValue, setFieldValue } from "../utilities";

import { WritableDao } from "./writable-dao";

export abstract class UpsertableDao<M, O extends Orm, A = any> extends WritableDao<M, O, A> {
	protected uniqueFields = this.evaluateOrmBuilder(async (orm) => {
		const primaryFields = await this.primaryFields,
			uniqueFields = Set(this.getUniqueFields(orm));

		if (!uniqueFields.isSuperset(primaryFields) && primaryFields.intersect(uniqueFields).size > 0) {
			throw new Error(`Unique fields must either include all the primary fields or none of them`);
		}

		const allFromOrm = uniqueFields.every((field) => field["🜁"].orm === orm);
		if (allFromOrm) {
			return uniqueFields;
		}

		processAliases(orm);

		uniqueFields.map((field) => {
			if (field["🜁"].orm === orm) {
				return field;
			}
			if (field["🜁"].alias != null && field["🜁"].alias!["🜁"].orm === orm) {
				return field["🜁"].alias;
			}
			throw new Error(`Expected unique field ${ field } to be related to orm ${ orm } directly or via alias`);
		});
		return uniqueFields;
	});

	async upsertManyRaw(builder: UpsertManyRequestBuilder<object, A>, trx?: Transaction): Promise<object[]> {
		const uniqueFields = await this.uniqueFields,
			primaryFields = await this.primaryFields,
			updateableFields = await this.updatableFields,
			selectFields = primaryFields.concat(uniqueFields);

		return this.withTransaction(async (tx) => {
			const { items: newItems, auth } = await this.evaluateOrmBuilder(builder);

			// get a filter to select all the new items via their unique fields
			const filter = createFilterFromFieldValues(uniqueFields, newItems);

			// get old items
			const oldItems = await this.findAllRaw(() => {
				return {
					fields: selectFields.toArray(),
					auth,
					filter,
					pagination: {
						limit: null
					}
				};
			}, tx);

			// determine items to insert and items to update
			const newItemRecordsMap = createRecordsMap(uniqueFields, newItems),
				oldItemRecordsMap = createRecordsMap(uniqueFields, oldItems);

			const newItemRecords = newItemRecordsMap.keySeq().toSet(),
				oldItemRecords = oldItemRecordsMap.keySeq().toSet();

			const insertItemRecords = newItemRecords.subtract(oldItemRecords),
				updateItemRecords = newItemRecords.intersect(oldItemRecords);

			// get the items to insert
			const insertItems = insertItemRecords.map((record) => newItemRecordsMap.get(record)!).toArray();

			// get the items to update
			const updateItems = updateItemRecords.map((record) => {
				const newItem = newItemRecordsMap.get(record)!,
					oldItem = oldItemRecordsMap.get(record)!;

				// ensure that the items to update have the primary fields and that they are the same value as the original
				primaryFields.forEach((field) => {
					const oldValue = getFieldValue(field, oldItem),
						newValue = getFieldValue(field, newItem);

					if (oldValue === newValue) {
						return;
					}

					setFieldValue(field, newItem, oldValue);
				});

				return newItem;
			}).toArray();

			// keep track of persisted items
			const persistedItems: object[] = [];

			// update items
			if (updateItems.length > 0) {
				if (updateableFields.size > 0 && updateableFields !== uniqueFields) {
					await this.updateManyRaw(() => {
						return {
							items: updateItems,
							auth
						};
					}, tx);
				}

				persistedItems.push.apply(persistedItems, ...updateItems);
			}

			// insert items
			if (insertItems.length > 0) {
				const insertedItems = await this.insertManyRaw(() => {
					return {
						items: insertItems,
						auth
					};
				}, tx);

				persistedItems.push.apply(persistedItems, ...insertedItems);
			}

			// return all persisted items
			return this.findAllRawByPrimaryFields(() => {
				return {
					items: persistedItems,
					auth
				};
			}, tx);
		}, trx);
	}

	async upsertMany(builder: UpsertManyRequestBuilder<M, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.upsertManyRaw(() => {
			const { items, auth } = builder();
			return {
				items: this.modelsToDbJsons(items),
				auth
			};
		}, trx);

		return this.dbJsonsToModels(rows);
	}

	async upsertOneRaw(builder: UpsertOneRequestBuilder<object, A>, trx?: Transaction): Promise<object> {
		const { item, auth } = builder();

		const results = await this.upsertManyRaw(() => {
			return {
				items: [item],
				auth
			};
		}, trx);

		return results[0];
	}

	async upsertOne(builder: UpsertOneRequestBuilder<M, A>, trx?: Transaction): Promise<M> {
		const row = await this.upsertOneRaw(() => {
			const { item } = builder();
			return {
				item: this.modelToDbJson(item)
			};
		}, trx);

		return this.dbJsonToModel(row);
	}

	protected getUniqueFields(orm: O): ColumnField[] {
		return orm["🜀"].primaryFields.toArray();
	}
}
