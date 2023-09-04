import PartisiaSdk from 'partisia-sdk'
import config from './config'

export type OptionalWalletClient = PartisiaSdk | undefined | null

export const connect = async () => {
  const sdk = new PartisiaSdk()

  await sdk.connect({
    chainId: config.chainId,
    permissions: config.permissions,
    dappName: config.dAppName,
  })

  if (sdk.connection) return sdk
  else throw new Error('Connection failed')
}
