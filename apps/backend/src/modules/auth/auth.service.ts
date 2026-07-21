import { Injectable } from '@nestjs/common'
import { WechatLoginDto } from './dto/wechat-login.dto'
import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async loginWithWechat(dto: WechatLoginDto) {
    void dto
    void this.authRepository

    return {
      accessToken: 'placeholder-token',
      expiresIn: 7200,
      user: {
        id: 'placeholder-user-id',
        nickname: 'Lifee User'
      }
    }
  }
}
