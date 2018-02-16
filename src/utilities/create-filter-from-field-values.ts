import { ColumnField, Filter } from "@lchemy/orm";
import { Set } from "immutable";

import { getFieldValue } from "./get-field-value";

export function createFilterFromFieldValues(fields: Set<ColumnField>, items: object[]): Filter {
	if (fields.size === 1) {
		return createFilterFromSingleFieldValue(fields.first()!, items);
	} else {
		return createFilterFromMultipleFieldValues(fields, items);
	}
}

function createFilterFromSingleFieldValue(field: ColumnField, items: object[]): Filter {
	const values = items.map((item) => {
		const value = getFieldValue(field, item);
		if (value == null) {
			throw new Error(`Expected field ${ field } to be defined on item ${ item }`);
		}
		return value;
	});
	return field.$in(...values);
}

function createFilterFromMultipleFieldValues(fields: Set<ColumnField>, items: object[]): Filter {
	return items.map((item) => {
		return fields.toArray().map((field) => {
			const value = getFieldValue(field, item);
			if (value == null) {
				throw new Error(`Expected field ${ field } to be defined on item ${ item }`);
			}
			return field.$eq(value) as Filter;
		}).reduce((prev, next) => {
			return prev.and(next);
		});
	}).reduce((prev, next) => {
		return prev.or(next);
	});
}
