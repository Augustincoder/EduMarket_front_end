# EduMarket Frontend 📱 — Telegram Mini App Freelance Marketplace

[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC.svg?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/Zustand-5-443E38.svg?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154.svg?style=for-the-badge&logo=react-query)](https://tanstack.com/query)

> A student micro-task marketplace optimized for the Telegram Mini App (TMA) ecosystem.

---

## Key Capabilities

- **Task marketplace** — clients post tasks, freelancers bid; escrow-style flow with delivery review.
- **Real-time chat** — Socket.io rooms with files, voice messages and a shared workspace overlay.
- **Reputation system** — verified student profiles, leaderboards, referrals, VIP tier.
- **Admin panel** — users, categories, disputes, complaints, financial ledger, audit logs, broadcast.
- **Deep Telegram integration** — MainButton/BackButton, haptics, initData-based auth.

---

## Architecture & State Management

- **Zustand** — synchronous UI/auth state (only minimal guard fields are persisted; the profile is re-fetched on boot).
- **TanStack Query** — server state with stale-while-revalidate and socket-driven cache invalidation.
- **@tanstack/react-virtual** — virtualized task feeds and chat history.

---

## Setup

### Prerequisites
- **Node.js** v20+

### Install
```bash
git clone https://gitlab.com/edumarket3/EduMarket_front_end.git
cd EduMarket_front_end
npm ci
```

### Environment
Copy the example file and fill in your values:
```bash
cp .env.example .env
```
**Never commit `.env`** — it is git-ignored. See `.env.example` for the full list of required variables.

### Development
```bash
npm run dev   # http://localhost:5173
```

### Production build
```bash
npm run build   # outputs ./dist
npm run preview
```

---

## Testing & Quality

- **Unit & component tests** — `vitest` + `@testing-library/react`:
  ```bash
  npm run test:run
  ```
- **Linting** — ESLint flat config:
  ```bash
  npm run lint
  ```
- **E2E tests** — planned (Playwright), not yet implemented.

### CI/CD (GitLab)
The pipeline is defined in `.gitlab-ci.yml` and runs on every push and merge request:
1. **lint** — ESLint
2. **test** — Vitest
3. **build** — production bundle (artifact)
4. **security** — GitLab SAST, Secret Detection and Dependency Scanning templates

---

## Deployment

### Vercel / static hosting
1. Build command: `npm run build`, output directory: `dist`.
2. Configure the environment variables from `.env.example` in the hosting UI.
3. SPA rewrites are provided via `vercel.json` (Vercel) and `public/_redirects` (Netlify/Cloudflare).

### Docker (self-hosted)
Vite injects env vars at **build time**, so pass them as build args:
```bash
docker build \
  --build-arg VITE_API_URL="https://api.example.com/api/v1" \
  --build-arg VITE_SOCKET_URL="https://api.example.com" \
  -t edumarket-frontend .

docker run -p 8080:80 edumarket-frontend
```

---

## Releases

Versioning uses `standard-version`:
```bash
npm run release        # auto bump from conventional commits
npm run release:minor  # force minor
```

---

## License

This project is licensed under the **MIT License** — see [LICENSE](LICENSE).
