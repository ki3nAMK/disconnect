# GeTON 🎲💰

**GeTON** is a Telegram-integrated Web3 project that allows users to connect their TON wallets and participate in **Play-to-Earn** games inspired by **Monopoly**.

Built for seamless gaming, social interaction, and crypto integration — all within Telegram.

---

## 🚀 Features

-   🔐 Connect to TON wallet
-   🎮 Play Monopoly-style Play-to-Earn games
-   👫 Add and interact with friends
-   📱 Optimized for Telegram Mini Apps

---

## 🧰 Tech Stack

-   [Nestjs](https://nestjs.com/)
- MongoDB (or your DB of choice)
- WebSockets (for real-time features)
- Swagger (API documentation)
- Yarn / npm
---

## 📁 Project Structure

```
src/
├── app.controller.spec.ts
├── app.controller.ts
├── app.gateway.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── common/
│   ├── dto/
│   │   ├── email.dto.ts
│   │   ├── files.ts
│   │   ├── ids.dto.ts
│   │   ├── index.ts
│   │   ├── no-special-characters.ts
│   │   ├── pagination.dto.ts
│   │   └── times.ts
│   ├── logger/
│   │   ├── index.ts
│   │   ├── logger.module.ts
│   │   └── logger.service.ts
│   └── seeds/
│       └── seeds.module.ts
├── configs/
│   ├── api-docs.config.ts
│   ├── configuration.config.ts
│   └── index.ts
├── constants/
│   └── index.ts
├── constraints/
│   └── jwt.constraint.ts
├── decorators/
│   ├── auth.decorator.ts
│   ├── current-user.decorator.ts
│   ├── roles.decorator.ts
│   └── swagger-form-data.decorator.ts
├── helpers/
│   ├── filter-file-upload.helper.ts
│   ├── pagination.helper.ts
│   ├── string.helper.ts
│   └── time.helper.ts
├── i18n/
│   ├── en/
│   │   └── auths.json
│   └── jp/
│       └── auths.json
├── interceptors/
│   ├── httpError.filter.ts
│   ├── mongoose-class-serializer.interceptor.ts
│   ├── swagger-array-conversion.interceptor.ts
│   ├── transform.interceptor.ts
│   └── interfaces/
│       ├── index.ts
│       ├── pagination.interface.ts
│       └── transform.interface.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── check-proof.dto.ts
│   │   │   ├── forgotPassword.dto.ts
│   │   │   ├── index.ts
│   │   │   ├── sign-in.dto.ts
│   │   │   ├── sign-up.dto.ts
│   │   │   ├── update-info.dto.ts
│   │   │   ├── update-password-by-code.dto.ts
│   │   │   ├── update-password.dto.ts
│   │   │   └── verify-code-by-email.dto.ts
│   │   ├── enums/
│   │   │   └── index.ts
│   │   ├── guards/
│   │   │   ├── jwt-access-token.guard.ts
│   │   │   ├── jwt-refresh-token.guard.ts
│   │   │   ├── local.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── interfaces/
│   │   │   ├── index.ts
│   │   │   ├── refresh-token.interface.ts
│   │   │   └── token.interface.ts
│   │   ├── strategies/
│   │   │   ├── jwt-access-token.strategy.ts
│   │   │   ├── jwt-refresh-token.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── ton-api.service.ts
│   │   ├── ton-proof.service.ts
│   │   └── wrappers/
│   │       ├── wallet-contract-v4-r1.ts
│   │       └── wallets-data.ts
│   ├── backups/
│   │   ├── backups.controller.ts
│   │   ├── backups.module.ts
│   │   └── backups.service.ts
│   ├── cron/
│   │   ├── cron.module.ts
│   │   └── cron.service.ts
│   ├── excel/
│   │   ├── excel.controller.ts
│   │   ├── excel.module.ts
│   │   └── excel.service.ts
│   ├── files/
│   ├── mails/
│   ├── middleware/
│   │   ├── index.ts
│   │   ├── logger.middleware.ts
│   │   └── redirect.middleware.ts
│   ├── queue/
│   │   ├── exec.processor.ts
│   │   ├── queue.module.ts
│   │   └── queue.service.ts
│   ├── settings/
│   ├── shared/
│   │   ├── base/
│   │   │   └── base.entity.ts
│   │   ├── shared.controller.ts
│   │   ├── shared.module.ts
│   │   └── shared.service.ts
│   └── users/
├── repositories/
│   ├── base/
│   │   ├── base.abstract.repository.ts
│   │   └── base.interface.repository.ts
│   ├── files.repository.ts
│   ├── index.ts
│   ├── setting.repository.ts
│   └── users.repository.ts
├── served/
│   ├── swagger-custom.js
│   └── swagger.svg
├── services/
│   └── base/
│       ├── base.abstract.service.ts
│       └── base.interface.service.ts
└── types/
    ├── common.type.ts
    └── requests.type.ts
```

# Variables and Functions

```
// camelCase for variables and functions
const userData = {};
```

# Constants:

```
// SCREAMING_SNAKE_CASE for constants
TON_HUB_API=https://testnet-v4.tonhubapi.com
```

## ⚙️ Installation

```bash
# Clone the repository
git clone https://gitlab.1bitlab.io/geton/gt-api.git
cd gt-web-game

# Install dependencies
yarn install

# Start the development server
yarn start:dev
```
