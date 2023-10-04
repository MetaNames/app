import { MetaNamesSdk, Enviroment, RecordClassEnum } from '@metanames/sdk'
import config from './config'

const environment = config.environment === 'test' ? Enviroment.testnet : Enviroment.mainnet

let metaNamesSdk: MetaNamesSdk

export const getSDK = () => {
  if (!metaNamesSdk) metaNamesSdk = new MetaNamesSdk(environment)

  return metaNamesSdk
}

export const getRecordClassFrom = (string: string) => RecordClassEnum[string as keyof typeof RecordClassEnum]
