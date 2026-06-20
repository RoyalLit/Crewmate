<div align="center">
  <h1>Crewmute</h1>
  <p><strong>Campus Carpool — Find your crew, split the ride.</strong></p>
  <p>
    <a href=".github/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/RoyalLit/Crewmute/ci.yml?branch=main&label=CI&logo=github" alt="CI Status"></a>
    <a href="https://github.com/RoyalLit/Crewmute/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
    <a href="mobile/package.json"><img src="https://img.shields.io/badge/Expo-54-000020?logo=expo" alt="Expo SDK 54"></a>
    <a href="backend/package.json"><img src="https://img.shields.io/badge/Node-20-339933?logo=node.js" alt="Node 20"></a>
    <a href="https://github.com/RoyalLit/Crewmute/blob/main/docs/DECISIONS.md"><img src="https://img.shields.io/badge/ADR-8%20records-6C63FF" alt="ADRs"></a>
    <a href="https://github.com/RoyalLit/Crewmute/blob/main/AGENT_RULES.md"><img src="https://img.shields.io/badge/constitution-AGENT_RULES-FF6584" alt="Engineering Constitution"></a>
    <a href="https://github.com/RoyalLit/Crewmute"><img src="https://img.shields.io/github/repo-size/RoyalLit/Crewmute?label=size&logo=GitHub" alt="Repo Size"></a>
  </p>
</div>

---

**Crewmute** is a mobile-first carpool platform for Indian college students. Post or browse intercity shared-cab rides for weekend and holiday travel, coordinate with verified co-passengers, and split costs transparently — all in one app.

Built with React Native + Expo (mobile) and Node.js + Express + MongoDB (backend).

## ✨ Features

| Category | Capabilities |
|----------|-------------|
| **Auth** | Email OTP verification, student ID fallback, JWT access/refresh tokens (15m/7d), bcrypt password hashing |
| **Rides** | Post, browse, filter by route/date, auto-expire, real-time seat counters |
| **Requests** | Request seats, accept/reject/withdraw, atomic MongoDB transactions, push notifications |
| **Chat** | Real-time 1:1 messaging via Socket.io, read receipts, auto-created on match |
| **Profile** | Photo upload (Cloudinary), college identity, verification badges |
| **Design** | Light + dark mode, WCAG 2.1 AA contrast, reduce-motion support, 44pt touch targets |
| **Observability** | Prometheus metrics, structured logging (pino), AsyncLocalStorage request tracing, slow query logging |

## 📱 Screenshots

> Screenshots will be added pre-launch. Drop PNGs into `mobile/assets/screenshots/` and update the table below.

| | | |
|:---:|:---:|:---:|
| *Onboarding* | *Ride Feed* | *Chat* |

## 🛠 Built With

**Mobile** — React Native 0.81 · Expo SDK 54 · Expo Router 6 · NativeWind 4 · TanStack Query 5 · Zustand 4 · Socket.io Client · expo-image · Reanimated 4

**Backend** — Node.js 20 LTS · Express 4 · TypeScript 5 · MongoDB 7 + Mongoose 8 · Socket.io 4 · JWT + bcrypt · Pino · Prometheus · Zod

**Infrastructure** — Railway (deploy) · MongoDB Atlas · Cloudinary · GitHub Actions CI · Docker · Expo EAS

## 🚀 Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 20 LTS ([nvm](https://github.com/nvm-sh/nvm) recommended) |
| npm | 10+ |
| MongoDB | Atlas account ([free tier](https://www.mongodb.com/atlas)) or local instance |

### 1. Clone

```bash
git clone https://github.com/RoyalLit/Crewmute.git
cd crewmute
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — fill in MONGO_URI, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET at minimum
npm run dev
# → http://localhost:5000  |  GET /health → { status: "ok" }
```

### 3. Mobile

```bash
cd mobile
npm install
npx expo start
# Press 'a' (Android), 'i' (iOS), or scan QR with Expo Go
```

<details>
<summary><b>Environment Variables</b></summary>

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | ✅ | JWT signing key (min 64 chars) |
| `REFRESH_TOKEN_SECRET` | ✅ | JWT refresh key (min 64 chars) |
| `EMAIL_HOST` | For OTP | SMTP host |
| `EMAIL_USER` | For OTP | Sender email |
| `EMAIL_PASS` | For OTP | SMTP app password |
| `CLOUDINARY_CLOUD_NAME` | For uploads | Cloudinary account |
| `CLOUDINARY_API_KEY` | For uploads | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | For uploads | Cloudinary API secret |
| `PORT` | No (default: 5000) | Server port |
| `CLIENT_URL` | No (default: *) | CORS origin |
| `NODE_ENV` | No (default: development) | `development` or `production` |

### Mobile (`mobile/.env`)

| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_API_URL` | Backend base URL (e.g. `http://localhost:5000/api/v1`) |
| `EXPO_PUBLIC_GOOGLE_PLACES_KEY` | Google Places API key (optional — falls back to Nominatim) |

</details>

## 🧪 Running Tests

### Backend

```bash
cd backend
npm test              # 13 E2E tests across 3 suites
npm run test:coverage # With coverage report
npm run typecheck     # tsc --noEmit (0 errors)
npm run lint          # ESLint
```

### Mobile

```bash
cd mobile
npm test
npm run typecheck     # tsc --noEmit (0 errors)
npm run lint
```

## 📁 Project Structure

```
crewmute/
├── mobile/              # React Native + Expo app
│   ├── app/             # Expo Router file-based routes
│   ├── src/             # Components, hooks, stores, API, design tokens
│   └── assets/          # Images, fonts
├── backend/             # Node.js + Express API
│   ├── src/
│   │   ├── features/    # Feature-first modules (auth, rides, etc.)
│   │   ├── middleware/   # Auth, error handler, rate limiter, metrics
│   │   ├── config/      # Env validation, constants
│   │   ├── db/          # Mongoose models, connection
│   │   └── shared/      # Logger, errors, response helpers
│   └── tests/           # Integration + E2E tests
├── docs/                # PRD, ARCHITECTURE, DESIGN, ADRs, API docs
├── scripts/             # Seed, migration scripts
├── .github/             # CI workflows, issue/PR templates
├── AGENT_RULES.md       # Engineering constitution
└── README.md
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [AGENT_RULES.md](AGENT_RULES.md) | Engineering constitution — all contributors must read |
| [PRD.md](docs/PRD.md) | Product requirements and scope |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design and API reference |
| [DESIGN.md](docs/DESIGN.md) | Design system and UI specification |
| [DECISIONS.md](docs/DECISIONS.md) | Architectural decision records (8 ADRs) |
| [SECURITY.md](SECURITY.md) | Security policy and vulnerability reporting |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |

## 🤝 Contributing

All contributors (human and AI) **must read** [AGENT_RULES.md](AGENT_RULES.md) before making any change. It is the source of truth for how work is done in this repository.

- **Branch strategy:** `main` → `dev` → `feature/*`
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`)
- **Code review:** All changes go through PRs. CI must pass before merge.

See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=RoyalLit/Crewmute&type=Date&theme=dark">
    <img width="600" alt="Star History Chart" src="https://api.star-history.com/svg?repos=RoyalLit/Crewmute&type=Date">
  </picture>
  <br><br>
  <sub>Built with ❤️ by <a href="https://github.com/RoyalLit">Pahul</a> · Amity University Punjab</sub>
</div>
