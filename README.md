# Lifee Workspace

Lifee 是一个面向 iOS 和 Android 的个人生活与财务记录 App，采用本地优先架构。

## Active Architecture

- `apps/mobile`: Expo + React Native + TypeScript App。
- `packages/shared`: 跨模块领域类型与校验。
- `backend-docs/SupabaseArchitecture.md`: Supabase Auth、PostgreSQL、RLS、Storage 和同步设计。
- `FrontendArchitecture.md`: App 前端架构规范。

`apps/backend` 是迁移前的 NestJS 实现，仅保留作历史参考；移动端的新后端能力统一使用 Supabase。

## Target Stack

- React Native + Expo
- React Navigation
- Zustand
- Expo Secure Store
- Expo SQLite
- Supabase
- Jest + React Native Testing Library + Maestro
- EAS Build / Submit / Update

## Mobile Start

完成依赖安装和本地环境文件后：

```bash
pnpm install
cp apps/mobile/.env.example apps/mobile/.env
pnpm dev:mobile
```

然后使用 Expo Go 扫码，或在安装了模拟器时运行：

```bash
pnpm ios
pnpm android
```

`apps/mobile/.env` 不提交 Git。只允许客户端使用 Supabase URL 和 Anon/Publishable Key，严禁放入 `service_role`。

## Verification

```bash
pnpm typecheck
pnpm lint
pnpm test
```

详细迁移顺序见 `FrontendArchitecture.md` Appendix A。
