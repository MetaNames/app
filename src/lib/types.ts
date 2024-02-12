export enum DomainTab {
  details = 'details',
  settings = 'settings'
}

export interface AlertMessage {
  message: string;
  action?: {
    label: string;
    callback: () => void;
  }
}

export interface AccountData {
  id: string
  account: {
    displayCoins: {
      symbol: string
      balance: string
      balanceAsGas: string
      conversionRate: string
    }[]
  }
}

export interface Fees {
  fees: number
  symbol: string
  address: string
  feesLabel: number
}
