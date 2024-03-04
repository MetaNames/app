import { MetaNamesSdk, RecordClassEnum, RecordValidator, type ConfigOverrides } from "@metanames/sdk";
import { config } from "./config";

export const getRecordClassFrom = (string: string) =>
	RecordClassEnum[string as keyof typeof RecordClassEnum];
export const metaNamesSdkFactory = (override: ConfigOverrides = {}) => new MetaNamesSdk(config.sdkEnvironment, override);

export const MAX_RECORD_LENGTH = new RecordValidator().rules.maxLength

export const socialRecords = [RecordClassEnum.Twitter, RecordClassEnum.Discord].map(
	(v) => RecordClassEnum[v]
);
export const profileRecords = [RecordClassEnum.Bio, RecordClassEnum.Uri, RecordClassEnum.Wallet].map(
	(v) => RecordClassEnum[v]
);

export const getRecentDomains = async (count: number) => {
	const metaNamesSdk = metaNamesSdkFactory()
	const recentDomains = await metaNamesSdk.domainRepository.getAll()
		.then((domains) => domains.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, count)
			.map((domain) => ({ name: domain.name, createdAt: domain.createdAt })))
		.catch((error) => {
			console.error(error);
			return [];
		});

	return recentDomains
}
