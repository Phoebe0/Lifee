import { Injectable } from '@nestjs/common'

@Injectable()
export class UsersService {
  getCurrentUser() {
    return {
      id: 'placeholder-user-id',
      nickname: 'Lifee User',
      avatarUrl: ''
    }
  }
}
