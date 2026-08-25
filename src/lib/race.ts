export interface LatestTracker {
	next(): number;
	check(id: number): boolean;
}

export function trackLatest(): LatestTracker {
	let latest = 0;

	return {
		next: () => ++latest,
		check: (id) => id === latest
	};
}
