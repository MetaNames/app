export const optionalEnv = (value: string | undefined, fallback: string) => {
	if (value === undefined || value === '' || value === 'undefined') return fallback;

	return value;
};
