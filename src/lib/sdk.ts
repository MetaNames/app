import { MetaNamesSdk, RecordClassEnum } from "@metanames/sdk";
import { config } from "./config";

export const getRecordClassFrom = (string: string) =>
	RecordClassEnum[string as keyof typeof RecordClassEnum];
export const metaNamesSdkFactory = () => new MetaNamesSdk(config.sdkEnvironment);
