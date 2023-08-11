import PartisiaSdk from 'partisia-sdk'
import config from './config'
import type { ISdkConnection } from 'partisia-sdk/dist/sdk'

export type WalletConnection = {
  connection: ISdkConnection
  seed: string
}

export type OptionalWalletConnection = WalletConnection | undefined | null

const sdk = new PartisiaSdk()

export const connect = async () => {
  await sdk.connect({
    chainId: config.chainId,
    permissions: config.permissions,
    dappName: config.dAppName,
  })

  if (sdk.connection) return { connection: sdk.connection, seed: sdk.seed }
  else throw new Error('Connection failed')
}
