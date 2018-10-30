import { Orm } from "@lchemy/orm";
import { Transaction } from "knex";

import { ReplaceRequestBuilder } from "../models";
import { createRecordsMap, getFieldValue, setFieldValue } from "../utilities";

import { UpsertableDao } from "./upsertable-dao";

export abstract class ReplaceableDao<M, O extends Orm, A = any> extends UpsertableDao<M, O, A> {
	async replaceManyRaw(builder: ReplaceRequestBuilder<O, object, A>, trx?: Transaction): Promise<object[]> {
		const uniqueFields = await this.uniqueFields,
			primaryFields = await this.primaryFields,
			updateableFields = await this.updatableFields,
			selectFields = primaryFields.concat(uniqueFields);

		return this.withTransaction(async (tx) => {
			const { items: newItems, filter, auth } = await this.evaluateOrmBuilder(builder);

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

			// determine items to insert, update, and remove
			const newItemRecordsMap = createRecordsMap(uniqueFields, newItems),
				oldItemRecordsMap = createRecordsMap(uniqueFields, oldItems);

			const newItemRecords = newItemRecordsMap.keySeq().toSet(),
				oldItemRecords = oldItemRecordsMap.keySeq().toSet();

			const insertItemRecords = newItemRecords.subtract(oldItemRecords),
				updateItemRecords = newItemRecords.intersect(oldItemRecords),
				removeItemRecords = oldItemRecords.subtract(newItemRecords);

			// get the items to insert, update, and remove
			const insertItems = insertItemRecords.map((record) => newItemRecordsMap.get(record)!).toArray(),
				removeItems = removeItemRecords.map((record) => oldItemRecordsMap.get(record)!).toArray();

			// TODO: merge with upsertable's definition
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

			// remove items
			if (removeItems.length > 0) {
				await this.removeManyRaw(() => {
					return {
						items: removeItems,
						auth
					};
				}, tx);
			}

			// update items
			if (updateItems.length > 0 && updateableFields.size > 0 && !updateableFields.equals(uniqueFields)) {
				await this.updateManyRaw(() => {
					return {
						items: updateItems,
						auth
					};
				}, tx);
			}

			// insert items
			if (insertItems.length > 0) {
				await this.insertManyRaw(() => {
					return {
						items: insertItems,
						auth
					};
				}, tx);
			}

			// get persisted items
			const persistedItems = await this.findAllRaw(() => {
				return {
					fields: selectFields.toArray(),
					auth,
					filter,
					pagination: {
						limit: null
					}
				};
			}, tx);

			// assert persisted count is equal to the new items count
			if (persistedItems.length !== newItems.length) {
				throw new Error(`Expected replace to result in ${ newItems.length } rows but actually found ${ persistedItems.length } rows`);
			}

			return persistedItems;
		}, trx);
	}

	async replaceMany(builder: ReplaceRequestBuilder<O, M, A>, trx?: Transaction): Promise<M[]> {
		const rows = await this.replaceManyRaw((orm) => {
			const { items, filter, auth } = builder(orm);
			return {
				items: this.modelsToDbJsons(items),
				filter,
				auth
			};
		}, trx);

		return this.dbJsonsToModels(rows);
	}
}
