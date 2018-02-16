export function getInPath(target: any, path: string): any {
	return path.split(".").reduce((memo, key) => {
		if (memo == null) {
			return undefined;
		}
		return memo[key];
	}, target);
}
