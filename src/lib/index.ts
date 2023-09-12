import { MetaNamesSdk, Enviroment } from '@metanames/sdk'
import config from './config'

const environment = config.environment === 'test' ? Enviroment.testnet : Enviroment.mainnet

export const metaNamesSdk = new MetaNamesSdk(environment)

export const metaNamesSdkFactory = () => new MetaNamesSdk(environment)
