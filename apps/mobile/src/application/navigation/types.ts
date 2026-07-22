export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  CreateTransaction: { initialType?: 'income' | 'expense'; transactionId?: string } | undefined
}

export type AppTabParamList = {
  Home: undefined
  Transactions: undefined
  Assets: undefined
  Profile: undefined
}
