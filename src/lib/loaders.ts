import { metaNamesSdkFactory } from './sdk';

export function analyzeDomain(name: string) {
	try {
		const analyzed = metaNamesSdkFactory().domainRepository.analyze(name);

		return { analyzed };
	} catch (e) {
		if (e instanceof Error) return { error: e.message };
		else return { error: 'Something went wrong' };
	}
}
