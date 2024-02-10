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
