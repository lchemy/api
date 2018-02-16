import { ColumnField } from "@lchemy/orm";
import { Map, Set } from "immutable";

import { getFieldValue } from "./get-field-value";

export type ItemRecord = Map<string, any>;
export type ItemRecordsMap = Map<ItemRecord, object>;

export function createRecordsMap(fields: Set<ColumnField>, items: object[]): ItemRecordsMap {
	return items.reduce<ItemRecordsMap>((memo, item) => {
		return memo.set(createRecordMap(fields, item), item);
	}, Map());
}

export function createRecordMap(fields: Set<ColumnField>, item: object): ItemRecord {
	const obj = fields.reduce((memo, field) => {
		const key = field["🜁"].fieldPath;
		memo[key] = getFieldValue(field, item);
		return memo;
	}, {} as { [key: string]: any });
	return Map(obj);
}
