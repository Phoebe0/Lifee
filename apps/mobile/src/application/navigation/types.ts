export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  CreateTransaction: { initialType?: 'income' | 'expense' } | undefined
}

export type AppTabParamList = {
  Home: undefined
  Transactions: undefined
  Assets: undefined
  Profile: undefined
}
