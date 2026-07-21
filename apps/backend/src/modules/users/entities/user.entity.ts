export interface UserEntity {
  id: string
  nickname: string | null
  avatarUrl: string | null
  status: 'active' | 'disabled' | 'deleted'
  createdAt: string
  updatedAt: string
}
