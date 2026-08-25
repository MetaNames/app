export type SortDirection = 'ascending' | 'descending' | 'none' | 'other';

export const compareByKey =
	<T>(key: keyof T, direction: SortDirection) =>
	(a: T, b: T) => {
		const sign = direction === 'ascending' ? 1 : -1;
		const [aVal, bVal] = [a[key], b[key]];

		if (typeof aVal === 'string' && typeof bVal === 'string')
			return sign * aVal.localeCompare(bVal);

		return sign * (Number(aVal) - Number(bVal));
	};

/**
 * Sort a copy of `items` by `sortKey`/`direction` and return the page slice.
 * Never mutates the input array (the caller keeps ownership of its prop).
 */
export const paginateSorted = <T>(
	items: T[],
	sortKey: keyof T,
	direction: SortDirection,
	page: number,
	rowsPerPage: number
): T[] => {
	const start = page * rowsPerPage;
	return [...items].sort(compareByKey(sortKey, direction)).slice(start, start + rowsPerPage);
};
