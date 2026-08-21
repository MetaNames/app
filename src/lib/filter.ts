export const filterDomainsByName = <T extends { name: string }>(domains: T[], search: string) => {
	const query = search.trim().toLowerCase();
	if (query === '') return domains;

	return domains.filter((domain) => domain.name.trim().toLowerCase().includes(query));
};
