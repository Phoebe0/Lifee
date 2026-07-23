import { useCallback, useEffect, useState } from 'react'
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
        await authService.verifyPhoneOtp(pendingOtp.target, otp)
      } else {
        await authService.verifyEmailOtp(pendingOtp.target, otp)
      }
    } catch (verifyError) {
      setError(authErrorMessage(verifyError))
    } finally {
      setLoadingAction(null)
    }
  }, [otp, pendingOtp])

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
    setCountryCode(value.replace(/\D/g, ''))
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
    setMethod,
    setPhoneRegion: updatePhoneRegion,
    setCountryCode: updateCountryCode,
    setPhone: updatePhone,
    setEmail: updateEmail,
    setOtp: updateOtp,
    setAgreementAccepted: updateAgreement,
    requestOtp,
    verifyOtp,
    resendOtp: requestOtp,
    signInWithSocialProvider,
    editIdentity
  }
}
