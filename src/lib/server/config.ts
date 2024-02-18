if (!process.env.PROPOSALS_WALLET_PRIVATE_KEY) {
  throw new Error('PROPOSALS_WALLET_PRIVATE_KEY is not set')
}

export const proposalsWalletPrivateKey = `${process.env.PROPOSALS_WALLET_PRIVATE_KEY}`

// TODO: Add resolver based on environment
export const tldMigrationProposalContractAddress = '021e68773e9bd5fc28381802c4b24899499f039ea9'
