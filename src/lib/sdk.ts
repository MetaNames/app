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

export const socialRecords = [RecordClassEnum.Twitter, RecordClassEnum.Discord].map(
	(v) => RecordClassEnum[v]
);
export const profileRecords = [
	RecordClassEnum.Bio,
	RecordClassEnum.Email,
	RecordClassEnum.Uri,
	RecordClassEnum.Wallet,
	RecordClassEnum.Price
].map((v) => RecordClassEnum[v]);

export const getValidator = (klass: string) => getRecordValidator(getRecordClassFrom(klass))
