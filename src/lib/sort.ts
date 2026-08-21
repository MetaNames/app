export type SortDirection = 'ascending' | 'descending' | 'none';

export const compareByKey =
	<T>(key: keyof T, direction: SortDirection) =>
	(a: T, b: T) => {
		const sign = direction === 'ascending' ? 1 : -1;
		const [aVal, bVal] = [a[key], b[key]];

		if (typeof aVal === 'string' && typeof bVal === 'string')
			return sign * aVal.localeCompare(bVal);

		return sign * (Number(aVal) - Number(bVal));
	};
