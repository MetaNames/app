import { MetaNamesSdk, Enviroment, RecordClassEnum } from '@metanames/sdk'
import config from './config'

const environment = config.environment === 'test' ? Enviroment.testnet : Enviroment.mainnet

export const metaNamesSdk = new MetaNamesSdk(environment)

export const getRecordClassFrom = (string: string) => RecordClassEnum[string as keyof typeof RecordClassEnum]
