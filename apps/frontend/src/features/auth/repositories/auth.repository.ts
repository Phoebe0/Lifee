import { http } from '../../../core/request/request'

export interface WechatLoginParams {
  code: string
  deviceId?: string
}

export interface LoginResult {
  accessToken: string
  expiresIn: number
  user: {
    id: string
    nickname: string
    avatarUrl?: string
  }
}

export const authRepository = {
  loginWithWechat(params: WechatLoginParams) {
    return http.post<LoginResult>('/auth/wechat-login', params, { skipAuth: true })
  }
}
