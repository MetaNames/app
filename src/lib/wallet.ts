import PartisiaSdk from 'partisia-sdk'
import config from './config'
import type { MetaMaskSdk } from '@metanames/sdk'

export type OptionalWalletClient = PartisiaSdk | MetaMaskSdk | undefined | null

const metaMaskSnapId = 'npm:@partisiablockchain/snap';

export const connectPartisia = async () => {
  const sdk = new PartisiaSdk()

  await sdk.connect({
    chainId: config.chainId,
    permissions: config.permissions,
    dappName: config.dAppName,
  })

  if (sdk.connection) return sdk
  else throw new Error('Connection failed')
}

export const connectMetaMask = async () => {
  if (!('ethereum' in window)) {
    throw new Error('MetaMask is not installed');
  }

  const metamask = window.ethereum as MetaMaskSdk;

  await metamask.request({
    method: 'wallet_requestSnaps',
    params: {
      [metaMaskSnapId]: {}
    }
  });

  return metamask
}

export const getAddress = async (wallet: OptionalWalletClient): Promise<string | undefined> => {
  if (!wallet) return;

  if ('connection' in wallet) {
    if (!wallet.connection) return;

    const address = wallet.connection.account.address;
    return address;
  } else if ('request' in wallet) {
    return await wallet.request({
      method: 'wallet_invokeSnap',
      params: {
        snapId: metaMaskSnapId,
        request: { method: 'get_address' }
      },
    })
  } else return;
}
