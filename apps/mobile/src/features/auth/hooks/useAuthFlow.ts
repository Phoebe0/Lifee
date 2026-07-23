import { useCallback, useEffect, useState } from 'react'
import {
  secureLoginHintStorage,
  type PhoneLoginHint
} from '../../../core/security/secureLoginHintStorage'
import type {
  AuthMethod,
  PendingOtp,
  PhoneRegion,
  SocialProvider
} from '../models/auth'
import { authService } from '../services/authService'
import {
  maskEmail,
  maskPhone,
  normalizeEmail,
  normalizePhone
} from '../utils/authValidation'

type LoadingAction = 'request-otp' | 'verify-otp' | SocialProvider | null

function authErrorMessage(error: unknown) {
  const fallback = '登录没有完成，请检查信息后重试。'
  if (!(error instanceof Error)) return fallback
  const message = error.message.toLowerCase()
  if (message.includes('rate') || message.includes('seconds')) return '操作太频繁，请稍后再试。'
  if (message.includes('expired') || message.includes('invalid token')) return '验证码无效或已过期，请重新获取。'
  if (message.includes('provider is not enabled')) return '该登录方式尚未在后端启用。'
  if (message.includes('network')) return '网络连接不可用，请检查网络后重试。'
  return error.message || fallback
}

export function useAuthFlow() {
  const [method, setMethodState] = useState<AuthMethod>('phone')
  const [phoneRegion, setPhoneRegion] = useState<PhoneRegion>('mainland')
  const [countryCode, setCountryCode] = useState('1')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null)
  const [agreementAccepted, setAgreementAccepted] = useState(false)
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [loginHint, setLoginHint] = useState<PhoneLoginHint | null>(null)
  const [loginHintLoading, setLoginHintLoading] = useState(true)
  const [usingOtherPhone, setUsingOtherPhone] = useState(false)

  useEffect(() => {
    let active = true

    void secureLoginHintStorage.get()
      .then(hint => {
        if (active) setLoginHint(hint)
      })
      .catch(() => {
        // Login Hint 只是便捷提示，读取失败时退回普通登录，不阻断认证。
        if (active) setLoginHint(null)
      })
      .finally(() => {
        if (active) setLoginHintLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = setTimeout(() => setResendSeconds(value => value - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendSeconds])

  const requireAgreement = useCallback(() => {
    if (agreementAccepted) return true
    setError('请先阅读并同意用户协议与隐私政策。')
    return false
  }, [agreementAccepted])

  const requestOtp = useCallback(async () => {
    if (!requireAgreement()) return

    try {
      setLoadingAction('request-otp')
      setError(null)
      setNotice(null)

      if (method === 'phone') {
        const target = normalizePhone(phoneRegion, countryCode, phone)
        await authService.sendPhoneOtp(target)
        setPendingOtp({ method, target, displayTarget: maskPhone(target) })
      } else {
        const target = normalizeEmail(email)
        await authService.sendEmailOtp(target)
        setPendingOtp({ method, target, displayTarget: maskEmail(target) })
      }

      setOtp('')
      setResendSeconds(60)
      setNotice('验证码已发送，请留意短信或邮件。')
    } catch (requestError) {
      setError(authErrorMessage(requestError))
    } finally {
      setLoadingAction(null)
    }
  }, [countryCode, email, method, phone, phoneRegion, requireAgreement])

  const continueWithLoginHint = useCallback(async () => {
    if (!loginHint || !requireAgreement()) return

    try {
      setLoadingAction('request-otp')
      setError(null)
      setNotice(null)
      await authService.sendPhoneOtp(loginHint.e164)
      setPendingOtp({
        method: 'phone',
        target: loginHint.e164,
        displayTarget: maskPhone(loginHint.e164)
      })
      setOtp('')
      setResendSeconds(60)
      setNotice('验证码已发送，请留意短信。')
    } catch (requestError) {
      setError(authErrorMessage(requestError))
    } finally {
      setLoadingAction(null)
    }
  }, [loginHint, requireAgreement])

  const verifyOtp = useCallback(async () => {
    if (!pendingOtp) return
    if (!/^\d{6}$/.test(otp)) {
      setError('请输入 6 位验证码。')
      return
    }

    try {
      setLoadingAction('verify-otp')
      setError(null)
      if (pendingOtp.method === 'phone') {
        const session = await authService.verifyPhoneOtp(pendingOtp.target, otp)
        const verifiedPhone = session?.user.phone
        const verifiedAt = session?.user.phone_confirmed_at

        if (verifiedPhone && verifiedAt) {
          const hint: PhoneLoginHint = {
            version: 1,
            method: 'phone',
            e164: verifiedPhone,
            region: verifiedPhone.startsWith('+86') ? 'mainland' : 'international',
            verifiedAt
          }

          try {
            await secureLoginHintStorage.set(hint)
            setLoginHint(hint)
          } catch {
            // OTP 登录已经成功时，账号提示写入失败不能反向中断登录。
          }
        }
      } else {
        await authService.verifyEmailOtp(pendingOtp.target, otp)
      }
    } catch (verifyError) {
      setError(authErrorMessage(verifyError))
    } finally {
      setLoadingAction(null)
    }
  }, [otp, pendingOtp])

  const resendOtp = useCallback(async () => {
    if (!pendingOtp || resendSeconds > 0) return

    try {
      setLoadingAction('request-otp')
      setError(null)
      setNotice(null)
      if (pendingOtp.method === 'phone') {
        await authService.sendPhoneOtp(pendingOtp.target)
      } else {
        await authService.sendEmailOtp(pendingOtp.target)
      }
      setResendSeconds(60)
      setNotice('验证码已重新发送。')
    } catch (requestError) {
      setError(authErrorMessage(requestError))
    } finally {
      setLoadingAction(null)
    }
  }, [pendingOtp, resendSeconds])

  const signInWithSocialProvider = useCallback(async (provider: SocialProvider) => {
    if (!requireAgreement()) return
    try {
      setLoadingAction(provider)
      setError(null)
      await authService.signInWithSocialProvider(provider)
    } catch (socialError) {
      setError(authErrorMessage(socialError))
    } finally {
      setLoadingAction(null)
    }
  }, [requireAgreement])

  const setMethod = useCallback((nextMethod: AuthMethod) => {
    setMethodState(nextMethod)
    setPendingOtp(null)
    setOtp('')
    setError(null)
    setNotice(null)
  }, [])

  const editIdentity = useCallback(() => {
    setPendingOtp(null)
    setOtp('')
    setError(null)
    setNotice(null)
  }, [])

  const updatePhoneRegion = useCallback((value: PhoneRegion) => {
    setPhoneRegion(value)
    setError(null)
  }, [])

  const updateCountryCode = useCallback((value: string) => {
    setCountryCode(value)
    setError(null)
  }, [])

  const updatePhone = useCallback((value: string) => {
    setPhone(value)
    setError(null)
  }, [])

  const updateEmail = useCallback((value: string) => {
    setEmail(value)
    setError(null)
  }, [])

  const updateOtp = useCallback((value: string) => {
    setOtp(value)
    setError(null)
  }, [])

  const updateAgreement = useCallback((accepted: boolean) => {
    setAgreementAccepted(accepted)
    if (accepted) setError(null)
  }, [])

  const useOtherPhone = useCallback(() => {
    setMethodState('phone')
    setUsingOtherPhone(true)
    setPhone('')
    setPendingOtp(null)
    setOtp('')
    setError(null)
    setNotice(null)
  }, [])

  const useRememberedPhone = useCallback(() => {
    setMethodState('phone')
    setUsingOtherPhone(false)
    setPendingOtp(null)
    setOtp('')
    setError(null)
    setNotice(null)
  }, [])

  return {
    method,
    phoneRegion,
    countryCode,
    phone,
    email,
    otp,
    pendingOtp,
    agreementAccepted,
    loadingAction,
    error,
    notice,
    resendSeconds,
    loginHint,
    loginHintLoading,
    rememberedPhoneDisplay: loginHint ? maskPhone(loginHint.e164) : null,
    showRememberedPhone: method === 'phone' && Boolean(loginHint) && !usingOtherPhone,
    setMethod,
    setPhoneRegion: updatePhoneRegion,
    setCountryCode: updateCountryCode,
    setPhone: updatePhone,
    setEmail: updateEmail,
    setOtp: updateOtp,
    setAgreementAccepted: updateAgreement,
    requestOtp,
    continueWithLoginHint,
    verifyOtp,
    resendOtp,
    signInWithSocialProvider,
    editIdentity,
    useOtherPhone,
    useRememberedPhone
  }
}
