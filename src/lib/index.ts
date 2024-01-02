import { MetaNamesSdk, Enviroment, RecordClassEnum } from '@metanames/sdk';
import config from './config';

const environment = config.environment === 'test' ? Enviroment.testnet : Enviroment.mainnet;

export const getRecordClassFrom = (string: string) =>
	RecordClassEnum[string as keyof typeof RecordClassEnum];
export const metaNamesSdkFactory = () => new MetaNamesSdk(environment);
export const websiteUrl = `${import.meta.env.VITE_WEBSITE_URL}`;

export const formatDate = (date: Date) => {
	const day = date.getDate();
	const month = date.toLocaleString('default', { month: 'long' });
	const year = date.getFullYear();

	return `${day} ${month}, ${year}`;
};
