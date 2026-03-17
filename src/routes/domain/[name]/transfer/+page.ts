import { metaNamesSdkFactory } from 'src/lib/sdk.js';

export function load({ params }: { params: { name: string } }) {
	const { name } = params;
	try {
		const analyzed = metaNamesSdkFactory().domainRepository.analyze(name);
		return { analyzed };
	} catch (e) {
		if (e instanceof Error) return { error: e.message };
		else return { error: 'Something went wrong' };
	}
}
