import type { PermissionTypes } from 'partisia-sdk/dist/sdk-listeners'

type Config = {
  chainId: string
  permissions: PermissionTypes[]
  dAppName: string
}

const config: Config = {
  chainId: 'Partisia Blockchain',
  permissions: ['sign'] as PermissionTypes[],
  dAppName: 'Meta Names',
}

export default config
