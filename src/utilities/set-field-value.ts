import { ColumnField } from "@lchemy/orm";

export function setFieldValue(field: ColumnField, item: object, value: any): object {
	field["🜁"].path.slice(1).reduce((memo, key, i, list) => {
		if (i === list.size - 1) {
			memo[key] = value;
			return;
		}
		if (memo[key] == null) {
			memo[key] = {};
		}
		return memo[key];
	}, item as any);

	return item;
}
