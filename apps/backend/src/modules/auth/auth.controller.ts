import { Body, Controller, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import { WechatLoginDto } from './dto/wechat-login.dto'

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('wechat-login')
  loginWithWechat(@Body() dto: WechatLoginDto) {
    return this.authService.loginWithWechat(dto)
  }
}
