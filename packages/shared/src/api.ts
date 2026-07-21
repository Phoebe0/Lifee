export interface ApiResponse<T> {
  code: string
  message: string
  data: T
  traceId: string
  serverTime: number
}

export interface PageResult<T> {
  items: T[]
  page: number
  pageSize: number
  total: number
  hasMore: boolean
}
