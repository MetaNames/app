import { MetaNamesSdk, Enviroment, RecordClassEnum } from '@metanames/sdk';
import config from './config';

const environment = config.environment === 'test' ? Enviroment.testnet : Enviroment.mainnet;

export const getRecordClassFrom = (string: string) =>
	RecordClassEnum[string as keyof typeof RecordClassEnum];
export const metaNamesSdkFactory = () => new MetaNamesSdk(environment);
export const websiteUrl = `${import.meta.env.VITE_WEBSITE_URL}`;
