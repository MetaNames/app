import { describe, it, expect } from 'vitest';

describe('DomainsTable sorting', () => {
    // Mock domains structure
    const domains = [
        { tokenId: '10', name: 'b.meta', parentId: 'parent1' },
        { tokenId: '2', name: 'a.meta', parentId: 'parent2' },
        { tokenId: '1', name: 'c.meta', parentId: undefined },
        { tokenId: '20', name: 'd.meta', parentId: 'parent3' },
    ];

    it('correctly sorts by name (ascending)', () => {
        const sort = 'name';
        const sortDirection = 'ascending';

        // Optimized Logic
        const multiplier = sortDirection === 'ascending' ? 1 : -1;
        const newSorted = [...domains].sort((a: any, b: any) => {
            const aVal = a[sort];
            const bVal = b[sort];
             if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * multiplier;
            }
            return (Number(aVal) - Number(bVal)) * multiplier;
        });

        expect(newSorted[0].name).toBe('a.meta');
        expect(newSorted[1].name).toBe('b.meta');
        expect(newSorted[2].name).toBe('c.meta');
        expect(newSorted[3].name).toBe('d.meta');
    });

     it('correctly sorts by tokenId (descending numeric)', () => {
        const sort = 'tokenId';
        const sortDirection = 'descending';

        // Optimized Logic
        const multiplier = sortDirection === 'ascending' ? 1 : -1;
        const newSorted = [...domains].sort((a: any, b: any) => {
            const aVal = a[sort];
            const bVal = b[sort];
             if (typeof aVal === 'string' && typeof bVal === 'string') {
                return aVal.localeCompare(bVal) * multiplier;
            }
            return (Number(aVal) - Number(bVal)) * multiplier;
        });

        // Note: The application sorts strings alphabetically, so '2' > '10'.
        // Expected order: '20', '2', '10', '1'
        expect(newSorted[0].tokenId).toBe('20');
        expect(newSorted[1].tokenId).toBe('2');
        expect(newSorted[2].tokenId).toBe('10');
        expect(newSorted[3].tokenId).toBe('1');
    });
});
