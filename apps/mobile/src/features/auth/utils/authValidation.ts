import type { PhoneRegion } from '../models/auth'

const digitsOnly = (value: string) => value.replace(/\D/g, '')

export function normalizePhone(
  region: PhoneRegion,
  countryCodeInput: string,
  phoneInput: string
) {
  const phone = digitsOnly(phoneInput)

  if (region === 'mainland') {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('请输入有效的中国大陆手机号。')
    }
    return `+86${phone}`
  }

  const countryCode = digitsOnly(countryCodeInput)
  if (!/^\d{1,4}$/.test(countryCode) || phone.length < 4) {
    throw new Error('请输入有效的国际区号和手机号。')
  }
  if (`${countryCode}${phone}`.length > 15) {
    throw new Error('国际手机号不能超过 15 位数字。')
  }
  return `+${countryCode}${phone}`
}

export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('请输入有效邮箱地址。')
  }
  return email
}

export function maskPhone(phone: string) {
  if (phone.length <= 8) return phone
  return `${phone.slice(0, -8)} ${phone.slice(-8, -4)} ${phone.slice(-4)}`
}

export function maskEmail(email: string) {
  const [name = '', domain = ''] = email.split('@')
  const visibleName = name.length <= 2 ? `${name.slice(0, 1)}*` : `${name.slice(0, 2)}***`
  return `${visibleName}@${domain}`
}
