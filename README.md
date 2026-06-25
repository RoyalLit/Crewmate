<div align="center">

# Crewmute

**The campus carpool app for Indian college students.**  
Post a ride. Find your crew. Split the fare.

<br>

[![CI](https://img.shields.io/github/actions/workflow/status/RoyalLit/Crewmute/ci.yml?branch=main&label=CI&logo=github&style=flat-square)](https://github.com/RoyalLit/Crewmute/actions)
[![Node](https://img.shields.io/badge/Node-20_LTS-339933?logo=node.js&style=flat-square)](backend/package.json)
[![Expo](https://img.shields.io/badge/Expo-SDK_54-000020?logo=expo&style=flat-square)](mobile/package.json)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&style=flat-square)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## What is Crewmute?

Every weekend, thousands of Indian college students travel home via shared cabs and spend hours coordinating through fragmented WhatsApp groups. Crewmute replaces that chaos with a dedicated platform — verified students can post or browse intercity rides, request seats, and coordinate through in-app chat, all from a single mobile app.

## Features

| | |
|---|---|
| 🔐 **Auth** | College email OTP, student ID fallback, JWT (15m access / 7d refresh), bcrypt (12 rounds) |
| 🚗 **Rides** | Post, browse, filter by route & date, auto-expire after departure, real-time seat counters |
| ✉️ **Requests** | Request seats, accept/reject/withdraw, push notifications on every state change |
| 💬 **Chat** | Real-time 1:1 messaging via Socket.io, read receipts, unlocked automatically on match |
| 👤 **Profile** | Photo upload via Cloudinary, college identity, verification badges |
| 🎨 **Design** | Full light + dark mode, WCAG 2.1 AA contrast, 44pt touch targets, reduce-motion support |
| 📊 **Observability** | Prometheus metrics, Pino structured logging, AsyncLocalStorage request tracing |

## Tech Stack

**Mobile** — React Native 0.81 · Expo SDK 54 · Expo Router v6 · NativeWind 4 · TanStack Query 5 · Zustand 4 · Socket.io Client · Reanimated 4

**Backend** — Node.js 20 LTS · Express 4 · TypeScript 5 · MongoDB 7 + Mongoose 8 · Socket.io 4 · Zod · Pino · Prometheus

**Infrastructure** — Railway · MongoDB Atlas · Cloudinary · GitHub Actions CI · Docker · Expo EAS

## Quick Start

**Prerequisites:** Node.js 20 LTS, npm 10+, a MongoDB connection string (free [Atlas](https://www.mongodb.com/atlas) tier works).

```bash
git clone https://github.com/RoyalLit/Crewmute.git && cd Crewmute
```

**Backend**
```bash
cd backend
npm install
cp .env.example .env   # fill in MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET
npm run dev            # → http://localhost:5000  |  GET /health → { status: "ok" }
```

**Mobile**
```bash
cd mobile
npm install
npx expo start         # press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

<details>
<summary><b>Environment variables</b></summary>

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | ✅ | JWT signing key (min 64 chars) |
| `REFRESH_TOKEN_SECRET` | ✅ | JWT refresh signing key (min 64 chars) |
| `EMAIL_HOST` | For OTP | SMTP host |
| `EMAIL_USER` | For OTP | Sender email address |
| `EMAIL_PASS` | For OTP | SMTP app password |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `PORT` | No (5000) | Server port |
| `CLIENT_URL` | No (*) | CORS allowed origin |
| `NODE_ENV` | No (development) | `development` or `production` |

### Mobile (`mobile/.env`)

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:5000/api/v1`) |

</details>

## Testing

```bash
# Backend
cd backend
npm test              # 13 E2E tests across 3 suites
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint

# Mobile
cd mobile
npm test
npm run typecheck
```

## Project Structure

```
Crewmute/
├── mobile/              # React Native + Expo app
│   ├── app/             # Expo Router file-based routes
│   ├── src/             # Components, hooks, stores, API, design tokens
│   └── assets/          # Images, fonts
├── backend/             # Node.js + Express API
│   ├── src/
│   │   ├── features/    # Feature modules (auth, rides, requests, chats, users)
│   │   ├── middleware/   # Auth, error handler, rate limiter, metrics
│   │   ├── config/      # Env validation, constants
│   │   ├── db/          # Mongoose models, connection
│   │   └── shared/      # Logger, errors, response helpers
│   └── tests/           # Integration + E2E tests (13 tests)
├── docs/                # Architecture, ADRs, API reference
├── scripts/             # Seed and migration scripts
└── .github/             # CI workflow, issue/PR templates
```

## Documentation

| Document | Description |
|---|---|
| [PRD.md](PRD.md) | Product requirements, personas, and feature scope |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, layer responsibilities, API reference |
| [DESIGN.md](DESIGN.md) | Design system — tokens, components, patterns |
| [docs/DECISIONS.md](docs/DECISIONS.md) | Architectural Decision Records |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

## Contributing

- **Branches:** `main` (stable) ← `dev` ← `feature/*`  
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`, …)  
- **PRs:** CI must pass, TypeScript must compile clean, all new logic must have tests.

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow.

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">
  <sub>Built by <a href="https://github.com/RoyalLit">Pahul</a> · Amity University Punjab</sub>
</div>
