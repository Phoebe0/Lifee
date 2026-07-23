# Lifee 后端认证模块

移动端只持有 Supabase Project URL 与 Publishable/Anon Key。短信密钥、GitHub Client Secret、微信 AppSecret 全部保存在 Supabase 后端，不得加入 `EXPO_PUBLIC_*`。

## Provider 配置

### 手机号 OTP

在 Supabase Dashboard 的 Authentication / Providers 中启用 Phone。

- 中国大陆号码由客户端规范化为 `+86xxxxxxxxxxx`。
- 其他地区号码由客户端规范化为 E.164 格式。
- 可以直接配置 Supabase 支持的短信供应商。
- 若中国大陆与海外需要不同供应商，在 Authentication / Hooks 配置 Send SMS HTTP Hook，按 `event.user.phone` 的 `+86` 前缀路由。
- OTP 与手机号不得写入应用日志。

### 邮箱 OTP

启用 Email Provider，并在邮件模板中使用 `{{ .Token }}` 输出 6 位 OTP。允许的移动端回跳地址：

```text
lifee://auth/callback
```

如使用 Magic Link，也复用同一回跳地址；客户端已经实现深链会话交换。

建议使用 Development Build 验证 OAuth 自定义 Scheme，并同时配置正式的用户协议与隐私政策 URL。

### GitHub

1. 在 GitHub 创建 OAuth App。
2. 将 Supabase Dashboard 展示的 Callback URL 配置到 GitHub。
3. 在 Supabase Authentication / Providers / GitHub 保存 Client ID 与 Client Secret。
4. 在 Authentication / URL Configuration 中加入 `lifee://auth/callback`。

### 微信

微信密钥只能进入后端。Lifee 使用 Supabase Custom OAuth Provider，客户端 Provider ID 默认为：

```text
custom:wechat
```

在 Authentication / Providers 新建 OAuth2 Provider，填写微信开放平台提供的 Authorization、Token 和 UserInfo 地址，并启用 `email_optional`。将 Supabase 给出的 Callback URL 登记到微信开放平台。

微信开放平台的 App 登录能力、Universal Link、应用审核及主体资质必须在发布前完成。若微信当前接口返回结构无法直接满足 Custom Provider 的 UserInfo 映射，应在自有服务端增加标准 OAuth/OIDC 适配层；不要在客户端交换 AppSecret。

## 数据库生命周期

迁移 `202607230002_auth_user_provisioning.sql` 将 `auth.users` 与 `public.profiles` 解耦：

- 任意 Provider 首次创建 Auth 用户后，数据库自动创建 Profile。
- 客户端没有高权限插入 Profile 的能力。
- 迁移会补齐已有 Auth 用户的 Profile。

## 上线检查

- Phone、Email、GitHub、`custom:wechat` 分环境配置。
- Redirect URL 包含 `lifee://auth/callback`。
- 短信与 OAuth Secret 只保存在 Supabase。
- Auth Rate Limits 与 CAPTCHA 按生产流量启用。
- 验证跨用户读取受 RLS 拒绝。
