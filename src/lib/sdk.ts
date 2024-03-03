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
