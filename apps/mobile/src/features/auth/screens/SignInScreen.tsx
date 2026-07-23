import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AuthBackground } from '../components/AuthBackground'
import { AuthBrand } from '../components/AuthBrand'
import { AuthGlassCard } from '../components/AuthGlassCard'
import { MailIcon, PhoneIcon } from '../components/AuthIcons'
import { SocialLoginButtons } from '../components/SocialLoginButtons'
import { useAuthFlow } from '../hooks/useAuthFlow'
import type { AuthMethod, PhoneRegion } from '../models/auth'
import { theme } from '../../../design/theme'
import { env } from '../../../core/config/env'

interface SignInScreenProps {
  previewMode?: boolean
  onClose?: () => void
}

export function SignInScreen({ previewMode = false, onClose }: SignInScreenProps) {
  const flow = useAuthFlow()
  const busy = flow.loadingAction !== null || flow.loginHintLoading
  const isRequestingOtp = flow.loadingAction === 'request-otp'
  const isVerifyingOtp = flow.loadingAction === 'verify-otp'
  const socialLoading = flow.loadingAction === 'wechat' || flow.loadingAction === 'github'
    ? flow.loadingAction
    : null

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <StatusBar style="dark" />
      <AuthBackground />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.layout}
      >
        <ScrollView
          bounces={false}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {onClose && (
            <View style={styles.previewHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="关闭登录预览"
                hitSlop={8}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                onPress={onClose}
              >
                <Text style={styles.closeText}>×</Text>
              </Pressable>
              <Text style={styles.previewTitle}>登录流程预览</Text>
              <View style={styles.previewSpacer} />
            </View>
          )}
          <AuthBrand />

          <AuthGlassCard>
            {previewMode && (
              <View style={styles.previewBanner}>
                <Text style={styles.previewBannerTitle}>当前为界面预览</Text>
                <Text style={styles.previewBannerText}>
                  配置 Supabase URL 与 Key 后，才能真实发送验证码和完成 OAuth。
                </Text>
              </View>
            )}
            {!flow.pendingOtp ? (
              <>
                <AuthMethodTabs
                  disabled={busy}
                  method={flow.method}
                  onChange={flow.setMethod}
                />

                {flow.method === 'phone' ? (
                  flow.loginHintLoading ? (
                    <View accessibilityLabel="正在读取上次登录账号" style={styles.hintLoading}>
                      <ActivityIndicator color={theme.color.brand} size="small" />
                      <Text style={styles.hintLoadingText}>正在安全读取上次登录账号…</Text>
                    </View>
                  ) : flow.showRememberedPhone && flow.rememberedPhoneDisplay ? (
                    <RememberedPhoneCard
                      disabled={busy}
                      maskedPhone={flow.rememberedPhoneDisplay}
                      onUseOtherPhone={flow.useOtherPhone}
                    />
                  ) : (
                    <View style={styles.manualPhoneSection}>
                      <PhoneFields
                        countryCode={flow.countryCode}
                        disabled={busy}
                        phone={flow.phone}
                        region={flow.phoneRegion}
                        onChangeCountryCode={flow.setCountryCode}
                        onChangePhone={flow.setPhone}
                        onChangeRegion={flow.setPhoneRegion}
                      />
                      {flow.loginHint && flow.rememberedPhoneDisplay && (
                        <Pressable
                          accessibilityRole="button"
                          disabled={busy}
                          hitSlop={8}
                          style={({ pressed }) => pressed && styles.pressed}
                          onPress={flow.useRememberedPhone}
                        >
                          <Text style={styles.backToRememberedText}>
                            返回使用 {flow.rememberedPhoneDisplay}
                          </Text>
                        </Pressable>
                      )}
                    </View>
                  )
                ) : (
                  <EmailFields
                    disabled={busy}
                    email={flow.email}
                    onChangeEmail={flow.setEmail}
                  />
                )}
              </>
            ) : (
              <OtpFields
                disabled={busy}
                displayTarget={flow.pendingOtp.displayTarget}
                otp={flow.otp}
                resendSeconds={flow.resendSeconds}
                onChangeIdentity={flow.editIdentity}
                onChangeOtp={flow.setOtp}
                onResend={() => void flow.resendOtp()}
              />
            )}

            {flow.error && (
              <View accessibilityRole="alert" style={styles.errorBanner}>
                <View style={styles.errorDot} />
                <Text style={styles.errorText}>{flow.error}</Text>
              </View>
            )}
            {flow.notice && !flow.error && (
              <View style={styles.noticeBanner}>
                <View style={styles.noticeDot} />
                <Text style={styles.noticeText}>{flow.notice}</Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              disabled={busy}
              style={({ pressed }) => [
                styles.primaryButton,
                busy && styles.disabled,
                pressed && styles.pressed
              ]}
              onPress={() => {
                if (flow.pendingOtp) void flow.verifyOtp()
                else if (flow.showRememberedPhone) void flow.continueWithLoginHint()
                else void flow.requestOtp()
              }}
            >
              {(isRequestingOtp || isVerifyingOtp) && (
                <ActivityIndicator color={theme.color.onBrand} size="small" />
              )}
              <Text style={styles.primaryButtonText}>
                {flow.pendingOtp
                  ? isVerifyingOtp ? '验证中…' : '确认登录'
                  : isRequestingOtp ? '发送中…'
                    : flow.showRememberedPhone && flow.rememberedPhoneDisplay
                      ? `继续使用 ${flow.rememberedPhoneDisplay}`
                      : '获取验证码'}
              </Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>或继续使用</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialLoginButtons
              disabled={busy}
              loadingProvider={socialLoading}
              onPress={provider => void flow.signInWithSocialProvider(provider)}
            />

            <AgreementRow
              accepted={flow.agreementAccepted}
              disabled={busy}
              onChange={flow.setAgreementAccepted}
            />
          </AuthGlassCard>

          <View style={styles.securityNote}>
            <View style={styles.securityLine} />
            <Text style={styles.securityText}>会话加密保存在本机 · 密钥不会进入客户端</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

function RememberedPhoneCard({
  maskedPhone,
  disabled,
  onUseOtherPhone
}: {
  maskedPhone: string
  disabled: boolean
  onUseOtherPhone: () => void
}) {
  return (
    <View style={styles.rememberedCard}>
      <View style={styles.rememberedIcon}>
        <PhoneIcon color={theme.color.onBrand} size={21} />
      </View>
      <View style={styles.rememberedContent}>
        <Text style={styles.rememberedEyebrow}>上次验证的手机号</Text>
        <Text accessibilityLabel={`上次验证账号 ${maskedPhone}`} style={styles.rememberedPhone}>
          {maskedPhone}
        </Text>
        <Text style={styles.rememberedCaption}>仍需短信验证码确认身份</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        hitSlop={8}
        style={({ pressed }) => pressed && styles.pressed}
        onPress={onUseOtherPhone}
      >
        <Text style={styles.otherPhoneText}>使用其他手机号</Text>
      </Pressable>
    </View>
  )
}

interface AuthMethodTabsProps {
  method: AuthMethod
  disabled: boolean
  onChange: (method: AuthMethod) => void
}

function AuthMethodTabs({ method, disabled, onChange }: AuthMethodTabsProps) {
  return (
    <View accessibilityRole="tablist" style={styles.methodTabs}>
      {([
        { key: 'phone' as const, label: '手机号', Icon: PhoneIcon },
        { key: 'email' as const, label: '邮箱', Icon: MailIcon }
      ]).map(item => {
        const selected = item.key === method
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            disabled={disabled}
            style={({ pressed }) => [
              styles.methodTab,
              selected && styles.methodTabSelected,
              pressed && styles.pressed
            ]}
            onPress={() => onChange(item.key)}
          >
            <item.Icon color={selected ? theme.color.onBrand : theme.color.textTertiary} size={19} />
            <Text style={[styles.methodTabText, selected && styles.methodTabTextSelected]}>
              {item.label}
            </Text>
          </Pressable>
        )
      })}
    </View>
  )
}

interface PhoneFieldsProps {
  region: PhoneRegion
  countryCode: string
  phone: string
  disabled: boolean
  onChangeRegion: (region: PhoneRegion) => void
  onChangeCountryCode: (value: string) => void
  onChangePhone: (value: string) => void
}

function PhoneFields({
  region,
  countryCode,
  phone,
  disabled,
  onChangeRegion,
  onChangeCountryCode,
  onChangePhone
}: PhoneFieldsProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>选择号码地区</Text>
      <View style={styles.regionRow}>
        {([
          { key: 'mainland' as const, label: '本地手机号  +86' },
          { key: 'international' as const, label: '其他手机号' }
        ]).map(item => {
          const selected = region === item.key
          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              disabled={disabled}
              style={({ pressed }) => [
                styles.regionButton,
                selected && styles.regionButtonSelected,
                pressed && styles.pressed
              ]}
              onPress={() => onChangeRegion(item.key)}
            >
              <Text style={[styles.regionText, selected && styles.regionTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          )
        })}
      </View>
      <View style={styles.inputShell}>
        <PhoneIcon color={theme.color.brand} size={20} />
        {region === 'international' ? (
          <View style={styles.countryCode}>
            <Text style={styles.plus}>+</Text>
            <TextInput
              accessibilityLabel="国际区号"
              editable={!disabled}
              importantForAutofill="no"
              inputMode="numeric"
              keyboardType="number-pad"
              maxLength={3}
              placeholder="1"
              placeholderTextColor={theme.color.textDisabled}
              style={styles.countryCodeInput}
              value={countryCode}
              onChangeText={onChangeCountryCode}
            />
          </View>
        ) : (
          <Text style={styles.prefix}>+86</Text>
        )}
        <View style={styles.inputDivider} />
        <TextInput
          accessibilityLabel="手机号"
          autoComplete="tel"
          editable={!disabled}
          importantForAutofill="yes"
          inputMode="tel"
          keyboardType="phone-pad"
          maxLength={18}
          placeholder="请输入手机号"
          placeholderTextColor={theme.color.textDisabled}
          style={styles.input}
          textContentType="telephoneNumber"
          value={phone}
          onChangeText={onChangePhone}
        />
      </View>
      <Text style={styles.fieldHint}>
        {region === 'mainland' ? '验证码将发送至中国大陆手机号' : '请输入国家/地区代码与完整号码'}
      </Text>
    </View>
  )
}

function EmailFields({
  email,
  disabled,
  onChangeEmail
}: {
  email: string
  disabled: boolean
  onChangeEmail: (value: string) => void
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>邮箱地址</Text>
      <View style={styles.inputShell}>
        <MailIcon color={theme.color.brand} size={20} />
        <TextInput
          accessibilityLabel="邮箱地址"
          autoCapitalize="none"
          autoComplete="email"
          editable={!disabled}
          keyboardType="email-address"
          placeholder="name@example.com"
          placeholderTextColor={theme.color.textDisabled}
          returnKeyType="done"
          style={styles.input}
          value={email}
          onChangeText={onChangeEmail}
        />
      </View>
      <Text style={styles.fieldHint}>我们会发送 6 位验证码，不需要设置密码</Text>
    </View>
  )
}

interface OtpFieldsProps {
  displayTarget: string
  otp: string
  resendSeconds: number
  disabled: boolean
  onChangeOtp: (value: string) => void
  onChangeIdentity: () => void
  onResend: () => void
}

function OtpFields({
  displayTarget,
  otp,
  resendSeconds,
  disabled,
  onChangeOtp,
  onChangeIdentity,
  onResend
}: OtpFieldsProps) {
  return (
    <View style={styles.fieldGroup}>
      <View style={styles.otpHeading}>
        <View>
          <Text style={styles.otpTitle}>输入验证码</Text>
          <Text style={styles.otpTarget}>已发送至 {displayTarget}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          hitSlop={8}
          onPress={onChangeIdentity}
        >
          <Text style={styles.changeText}>更换账号</Text>
        </Pressable>
      </View>
      <View style={[styles.inputShell, styles.otpShell]}>
        <TextInput
          accessibilityLabel="六位验证码"
          autoComplete="one-time-code"
          editable={!disabled}
          importantForAutofill="yes"
          inputMode="numeric"
          keyboardType="number-pad"
          maxLength={6}
          placeholder="······"
          placeholderTextColor={theme.color.textDisabled}
          style={styles.otpInput}
          textContentType="oneTimeCode"
          value={otp}
          onChangeText={value => onChangeOtp(value.replace(/\D/g, ''))}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || resendSeconds > 0}
        hitSlop={8}
        style={({ pressed }) => pressed && styles.pressed}
        onPress={onResend}
      >
        <Text style={[styles.resendText, resendSeconds > 0 && styles.resendTextDisabled]}>
          {resendSeconds > 0 ? `${resendSeconds} 秒后重新发送` : '重新发送验证码'}
        </Text>
      </Pressable>
    </View>
  )
}

function AgreementRow({
  accepted,
  disabled,
  onChange
}: {
  accepted: boolean
  disabled: boolean
  onChange: (accepted: boolean) => void
}) {
  const openDocument = (name: string) => {
    const url = name === '用户协议' ? env.termsUrl : env.privacyUrl
    if (url) {
      void Linking.openURL(url).catch(() => Alert.alert(name, '暂时无法打开该页面，请稍后重试。'))
      return
    }
    Alert.alert(name, `请在环境变量中配置正式${name}地址。`)
  }

  return (
    <View style={styles.agreementRow}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        disabled={disabled}
        hitSlop={8}
        style={[styles.checkbox, accepted && styles.checkboxChecked]}
        onPress={() => onChange(!accepted)}
      >
        {accepted && <Text style={styles.checkmark}>✓</Text>}
      </Pressable>
      <Text style={styles.agreementText}>
        登录即表示你已阅读并同意
        <Text style={styles.agreementLink} onPress={() => openDocument('用户协议')}>《用户协议》</Text>
        与
        <Text style={styles.agreementLink} onPress={() => openDocument('隐私政策')}>《隐私政策》</Text>
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.color.background },
  layout: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: theme.spacing[6],
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[6]
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.auth.glassSurface,
    borderWidth: 1,
    borderColor: theme.auth.glassBorder,
    borderRadius: theme.radius.full
  },
  closeText: {
    marginTop: -2,
    color: theme.color.text,
    fontSize: 27,
    fontWeight: '400',
    lineHeight: 31
  },
  previewTitle: { color: theme.color.textSecondary, fontSize: 13, fontWeight: '700' },
  previewSpacer: { width: 38 },
  previewBanner: {
    gap: theme.spacing[1],
    padding: theme.spacing[3],
    backgroundColor: theme.auth.noticeSurface,
    borderRadius: theme.radius.md
  },
  previewBannerTitle: { color: theme.color.accent, fontSize: 12, fontWeight: '800' },
  previewBannerText: { color: theme.color.textSecondary, fontSize: 11, lineHeight: 16 },
  methodTabs: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    padding: 4,
    backgroundColor: theme.auth.controlTrack,
    borderRadius: theme.radius.full
  },
  methodTab: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    borderRadius: theme.radius.full
  },
  methodTabSelected: {
    backgroundColor: theme.color.brand,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 3
  },
  methodTabText: { color: theme.color.textTertiary, fontSize: 14, fontWeight: '700' },
  methodTabTextSelected: { color: theme.color.onBrand },
  hintLoading: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.auth.glassControl,
    borderRadius: 18
  },
  hintLoadingText: { color: theme.color.textTertiary, fontSize: 12 },
  rememberedCard: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    backgroundColor: theme.auth.brandTint,
    borderWidth: 1,
    borderColor: theme.auth.brandBorder,
    borderRadius: 20
  },
  rememberedIcon: {
    width: 42,
    height: 42,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.color.brand,
    borderRadius: theme.radius.full
  },
  rememberedContent: { flex: 1, minWidth: 0 },
  rememberedEyebrow: {
    color: theme.color.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4
  },
  rememberedPhone: {
    marginTop: 3,
    color: theme.color.text,
    fontSize: 19,
    fontWeight: '800',
    fontVariant: ['tabular-nums']
  },
  rememberedCaption: { marginTop: 4, color: theme.color.textTertiary, fontSize: 10 },
  otherPhoneText: {
    color: theme.color.brand,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'right'
  },
  manualPhoneSection: { gap: theme.spacing[3] },
  backToRememberedText: {
    alignSelf: 'flex-end',
    color: theme.color.brand,
    fontSize: 11,
    fontWeight: '700'
  },
  fieldGroup: { gap: theme.spacing[3] },
  fieldLabel: {
    color: theme.color.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3
  },
  regionRow: { flexDirection: 'row', gap: theme.spacing[2] },
  regionButton: {
    paddingHorizontal: theme.spacing[3],
    paddingVertical: 8,
    backgroundColor: theme.auth.glassControl,
    borderWidth: 1,
    borderColor: theme.color.borderOverlay,
    borderRadius: theme.radius.full
  },
  regionButtonSelected: {
    backgroundColor: theme.auth.brandTint,
    borderColor: theme.auth.brandBorder
  },
  regionText: { color: theme.color.textTertiary, fontSize: 12, fontWeight: '600' },
  regionTextSelected: { color: theme.color.brand, fontWeight: '700' },
  inputShell: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.auth.glassStrong,
    borderWidth: 1,
    borderColor: theme.color.borderOverlay,
    borderRadius: 18
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 14,
    color: theme.color.text,
    fontSize: 16
  },
  prefix: { color: theme.color.text, fontSize: 15, fontWeight: '700' },
  countryCode: { flexDirection: 'row', alignItems: 'center' },
  plus: { color: theme.color.text, fontSize: 15, fontWeight: '700' },
  countryCodeInput: {
    width: 36,
    paddingVertical: 14,
    color: theme.color.text,
    fontSize: 15,
    fontWeight: '700'
  },
  inputDivider: {
    width: StyleSheet.hairlineWidth,
    height: 22,
    backgroundColor: theme.color.border
  },
  fieldHint: { color: theme.color.textTertiary, fontSize: 11, lineHeight: 16 },
  primaryButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[2],
    backgroundColor: theme.color.brand,
    borderRadius: 18,
    shadowColor: theme.color.shadowBrand,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5
  },
  primaryButtonText: { color: theme.color.onBrand, fontSize: 16, fontWeight: '800' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3] },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: theme.color.divider },
  dividerText: { color: theme.color.textTertiary, fontSize: 11 },
  agreementRow: { flexDirection: 'row', alignItems: 'flex-start', gap: theme.spacing[2] },
  checkbox: {
    width: 20,
    height: 20,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    backgroundColor: theme.auth.glassSurface,
    borderWidth: 1,
    borderColor: theme.color.border,
    borderRadius: 7
  },
  checkboxChecked: { backgroundColor: theme.color.brand, borderColor: theme.color.brand },
  checkmark: { color: theme.color.onBrand, fontSize: 13, fontWeight: '900' },
  agreementText: { flex: 1, color: theme.color.textTertiary, fontSize: 11, lineHeight: 18 },
  agreementLink: { color: theme.color.brand, fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.auth.dangerSurface,
    borderRadius: theme.radius.md
  },
  errorDot: { width: 7, height: 7, backgroundColor: theme.color.danger, borderRadius: theme.radius.full },
  errorText: { flex: 1, color: theme.color.danger, fontSize: 12, lineHeight: 17 },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    padding: theme.spacing[3],
    backgroundColor: theme.auth.noticeSurface,
    borderRadius: theme.radius.md
  },
  noticeDot: { width: 7, height: 7, backgroundColor: theme.color.accent, borderRadius: theme.radius.full },
  noticeText: { flex: 1, color: theme.color.accent, fontSize: 12, lineHeight: 17 },
  otpHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  otpTitle: { color: theme.color.text, fontSize: 18, fontWeight: '800' },
  otpTarget: { marginTop: 4, color: theme.color.textTertiary, fontSize: 12 },
  changeText: { color: theme.color.brand, fontSize: 12, fontWeight: '700' },
  otpShell: { justifyContent: 'center' },
  otpInput: {
    flex: 1,
    paddingVertical: 10,
    color: theme.color.text,
    fontSize: 25,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    letterSpacing: 10,
    textAlign: 'center'
  },
  resendText: { alignSelf: 'flex-end', color: theme.color.brand, fontSize: 12, fontWeight: '700' },
  resendTextDisabled: { color: theme.color.textDisabled },
  securityNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: theme.spacing[2] },
  securityLine: { width: 20, height: 1, backgroundColor: theme.color.brand },
  securityText: { color: theme.color.textTertiary, fontSize: 10, letterSpacing: 0.2 },
  disabled: { opacity: theme.opacity.disabled },
  pressed: { opacity: theme.opacity.pressed }
})
