import type { PhoneRegion } from '../models/auth'

export const MAINLAND_PHONE_REGEX = /^1[3-9]\d{9}$/
export const E164_PHONE_REGEX = /^\+[1-9]\d{7,14}$/

const ALLOWED_PHONE_INPUT_REGEX = /^[\d\s()-]*$/
const PHONE_SEPARATOR_REGEX = /[\s()-]/g

export function normalizePhone(
  region: PhoneRegion,
  countryCodeInput: string,
  phoneInput: string
) {
  const rawPhone = phoneInput.trim()
  if (!ALLOWED_PHONE_INPUT_REGEX.test(rawPhone)) {
    throw new Error('手机号只能包含数字、空格、括号或短横线。')
  }

  // AutoFill 和通讯录号码可能带空格或短横线，校验前仅移除允许的分隔符。
  const phone = rawPhone.replace(PHONE_SEPARATOR_REGEX, '')

  if (region === 'mainland') {
    if (!MAINLAND_PHONE_REGEX.test(phone)) {
      throw new Error('请输入有效的中国大陆手机号。')
    }
    const normalizedPhone = `+86${phone}`
    if (!E164_PHONE_REGEX.test(normalizedPhone)) {
      throw new Error('手机号格式无效。')
    }
    return normalizedPhone
  }

  const countryCode = countryCodeInput.trim()
  if (!/^[1-9]\d{0,2}$/.test(countryCode)) {
    throw new Error('请输入有效的国际区号。')
  }

  const normalizedPhone = `+${countryCode}${phone}`
  if (!E164_PHONE_REGEX.test(normalizedPhone)) {
    throw new Error('请输入有效的国际手机号。')
  }
  return normalizedPhone
}

export function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('请输入有效邮箱地址。')
  }
  return email
}

export function maskPhone(phone: string) {
  const mainlandMatch = phone.match(/^\+86(1[3-9]\d{9})$/)
  if (mainlandMatch?.[1]) {
    return `${mainlandMatch[1].slice(0, 3)}****${mainlandMatch[1].slice(-4)}`
  }
  if (phone.length <= 8) return phone
  return `${phone.slice(0, Math.max(2, phone.length - 7))}***${phone.slice(-4)}`
}

export function maskEmail(email: string) {
  const [name = '', domain = ''] = email.split('@')
  const visibleName = name.length <= 2 ? `${name.slice(0, 1)}*` : `${name.slice(0, 2)}***`
  return `${visibleName}@${domain}`
}
