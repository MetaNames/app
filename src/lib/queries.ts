export const accountCoinsQuery = `query AccountSingleQuery($address: BLOCKCHAIN_ADDRESS!) {
	account(address: $address) {
		...Coins_Account
	}
}

fragment Byoc_Account on Account {
	displayCoins {
		symbol
		balance
		conversionRate
		balanceAsGas
	}
	id
}

fragment Coins_Account on Account {
	...Byoc_Account
	...NonBridgeableCoins_Account
}

fragment NonBridgeableCoins_Account on Account {
	mpc20Balances {
		contract
		symbol
		balance
	}
}`;
