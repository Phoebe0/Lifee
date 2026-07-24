export type RootStackParamList = {
  Auth: undefined
  AuthPreview: undefined
  Main: undefined
  CreateTransaction: { initialType?: 'income' | 'expense'; transactionId?: string } | undefined
}

export type AppTabParamList = {
  Home: undefined
  Transactions: undefined
  Analytics: undefined
  Profile: undefined
}
