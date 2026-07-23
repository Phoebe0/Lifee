export type AuthMethod = 'phone' | 'email'
export type PhoneRegion = 'mainland' | 'international'
export type SocialProvider = 'wechat' | 'github'

export interface PendingOtp {
  method: AuthMethod
  target: string
  displayTarget: string
}
