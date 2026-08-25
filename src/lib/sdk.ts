import {
	getRecordValidator,
	MetaNamesSdk,
	RecordClassEnum,
	type ConfigOverrides
} from '@metanames/sdk';
import { config } from './config';

export const getRecordClassFrom = (string: string) =>
	RecordClassEnum[string as keyof typeof RecordClassEnum];
export const metaNamesSdkFactory = (override: ConfigOverrides = {}) =>
	new MetaNamesSdk(config.sdkEnvironment, override);

// RecordClassEnum values are numeric, and the on-chain record map is keyed by the enum's
// NAME (`Record<string, string|Buffer>`, e.g. domain.records.Twitter), so these lists are
// deliberately the string names — they must stay comparable with Object.keys(domain.records).
export const socialRecords = [RecordClassEnum.Twitter, RecordClassEnum.Discord].map(
	(v) => RecordClassEnum[v] as string
);
export const profileRecords = [
	RecordClassEnum.Bio,
	RecordClassEnum.Email,
	RecordClassEnum.Uri,
	RecordClassEnum.Wallet,
	RecordClassEnum.Price
].map((v) => RecordClassEnum[v] as string);

export const getValidator = (klass: string) => getRecordValidator(getRecordClassFrom(klass));
