# EduMarket — Developer Onboarding Guide
> **Versiya:** 1.0 | **Sana:** 2026-06-09
> **Maqsad:** Yangi developer 1 kunda mahsuldor bo'lishi uchun to'liq qo'llanma.
> **Qoida:** Bu hujjatni o'qimay birorta fayl ochma. 30 daqiqa sarf et — 3 kunni tejaysan.

---

## MUNDARIJA

1. [EduMarket Nima?](#1-edumarket-nima)
2. [Texnologiyalar Stack](#2-texnologiyalar-stack)
3. [Muhit Sozlash (Local Setup)](#3-muhit-sozlash)
4. [Loyiha Tuzilishi](#4-loyiha-tuzilishi)
5. [Birinchi Marta Ishga Tushirish](#5-birinchi-marta-ishga-tushirish)
6. [Muhim Hujjatlar Xaritasi](#6-muhim-hujjatlar-xaritasi)
7. [Kod Yozish Qoidalari](#7-kod-yozish-qoidalari)
8. [Git Workflow](#8-git-workflow)
9. [Test Yozish](#9-test-yozish)
10. [Debug va Log](#10-debug-va-log)
11. [Tez-tez So'raladigan Savollar (FAQ)](#11-faq)
12. [Muhim Kontaktlar](#12-muhim-kontaktlar)

---

## 1. EDUMARKET NIMA?

**EduMarket** — O'zbekistondagi talabalar uchun akademik xizmatlar marketplace'i.
Platforma **Telegram Mini App (TMA)** formatida ishlaydi.

### Biznes Logikasi (5 daqiqada)

```
CLIENT (Topshiriq beruvchi talaba):
  1. Topshiriq yaratadi (matematika, dasturlash, tarjima...)
  2. Narx belgilaydi (so'mda)
  3. Kelgan takliflardan birini tanlaydi
  4. Natijani qabul qiladi → To'lov

FREELANCER (Ijrochi talaba):
  1. Ochiq topshiriqlarni ko'radi
  2. Taklif beradi (o'z narxi va muddatida)
  3. Qabul qilinsa → Bajaradi
  4. Natijani yuboradi → Pul oladi

ADMIN:
  1. Nizolarni hal qiladi
  2. VIP'larni tasdiqlaydi
  3. Broadcast yuboradi
```

### Task Holatlari (MAJBURIY yodlab ol)

```
OPEN → ASSIGNED → IN_PROGRESS → IN_REVIEW → COMPLETED
                                           ↘ DISPUTED → hal qilindi → COMPLETED
```

> ⚠️ **Kritik:** Task holati FAQAT oldinga o'tadi. Hech qachon COMPLETED dan OPEN ga qaytmaydi.

---

## 2. TEXNOLOGIYALAR STACK

### Frontend

| Texnologiya | Versiya | Nima uchun |
|:-----------|:--------|:----------|
| React | 19 | UI framework |
| Vite | Latest | Build tool — tez HMR |
| TailwindCSS | v4 | Utility-first CSS — Design System token'lar |
| Zustand | Latest | Client state management — oddiy va engil |
| React Query (TanStack) | v5 | Server state — caching, refetch, loading |
| React Router | v6 | Client-side routing |
| Socket.IO Client | Latest | Real-time chat |
| Lucide React | Latest | Icon kutubxona |
| react-hot-toast | Latest | Toast notifications |
| Mixpanel | Latest | Analytics |
| Sentry | Latest | Error tracking |

### Backend

| Texnologiya | Versiya | Nima uchun |
|:-----------|:--------|:----------|
| Node.js | 20 LTS | Runtime — LTS = barqaror |
| Express.js | 4.x | HTTP framework |
| Prisma ORM | Latest | Type-safe DB queries |
| PostgreSQL | 15 | Asosiy ma'lumotlar bazasi |
| Redis | 7 | Socket.IO adapter + Rate limiting + Cache |
| Socket.IO | Latest | Real-time WebSocket |
| JWT | Latest | Authentication token |
| bcryptjs | Latest | Parol hashing |
| node-telegram-bot-api | Latest | Telegram Bot API |
| Winston | Latest | Logging |
| node-cron | Latest | Scheduled jobs |
| Sentry | Latest | Error tracking |

### Infratuzilma

| Komponent | Texnologiya | Manzil |
|:----------|:-----------|:-------|
| Frontend hosting | Vercel | Auto-deploy (main branch) |
| Backend server | VPS + PM2 | Manual deploy (hozircha) |
| Database | PostgreSQL (VPS) | Lokal instance |
| Cache | Redis (VPS) | Lokal instance |
| SSL | Let's Encrypt + Nginx | Reverse proxy |

---

## 3. MUHIT SOZLASH

### 3.1 Talablar (Prerequisites)

```bash
# Quyidagilar o'rnatilgan bo'lishi SHART:
node --version   # v20.x.x bo'lishi kerak
npm --version    # v10.x.x bo'lishi kerak
git --version    # istalgan versiya
psql --version   # PostgreSQL 15
redis-cli ping   # PONG qaytishi kerak
```

Agar o'rnatilmagan bo'lsa:
- **Node.js 20 LTS:** https://nodejs.org/en/download
- **PostgreSQL 15:** https://www.postgresql.org/download/
- **Redis:** https://redis.io/docs/install/

---

### 3.2 Reponi Klonlash

```bash
git clone https://github.com/[ORG]/edumarket.git
cd edumarket

# Papka tuzilishi:
# edumarket/
# ├── edumarket-frontend/   ← React app
# ├── edumarket-backend/    ← Express API
# ├── docs/                 ← Barcha hujjatlar (SEN HOZIR SHUNDASIZ)
# └── .github/              ← CI/CD workflows
```

---

### 3.3 Database Sozlash

```bash
# 1. PostgreSQL'da database yaratish
psql -U postgres
CREATE DATABASE edumarket;
CREATE USER edumarket_user WITH PASSWORD 'strong_password_here';
GRANT ALL PRIVILEGES ON DATABASE edumarket TO edumarket_user;
\q

# 2. Redis ishlayaptimi?
redis-cli ping
# PONG → ✅
```

---

### 3.4 Backend Sozlash

```bash
cd edumarket-backend

# 1. Dependencies o'rnatish
npm install

# 2. .env fayl yaratish
cp .env.example .env
# .env faylni to'ldirish (quyida tushuntirish bor)

# 3. Database migratsiyasi
npx prisma migrate dev
# Bu barcha jadvallarni yaratadi

# 4. Seed data (ixtiyoriy — test uchun)
npx prisma db seed

# 5. Prisma Studio (DB ni vizual ko'rish uchun)
npx prisma studio
# http://localhost:5555 da ochiladi
```

#### Backend `.env` To'ldirish

```env
# === SERVER ===
PORT=3000
NODE_ENV=development

# === DATABASE ===
DATABASE_URL="postgresql://edumarket_user:strong_password_here@localhost:5432/edumarket"

# === REDIS ===
REDIS_URL="redis://localhost:6379"

# === TELEGRAM ===
BOT_TOKEN=your_bot_token_here
# Bot token olish: @BotFather → /newbot
BOT_STORAGE_CHANNEL_ID=-100xxxxxxxxxx
# Storage channel: Private kanal yarating, botni admin qiling, ID oling
TELEGRAM_WEBHOOK_SECRET=any_random_32_char_string

# === JWT ===
JWT_SECRET=minimum_32_character_completely_random_string_here
JWT_EXPIRES_IN=7d

# === ADMIN ===
ADMIN_USERNAME=your_secure_admin_username
ADMIN_PASSWORD_HASH=bcrypt_hash_of_your_password
# Hash yaratish:
# node -e "const b=require('bcryptjs'); b.hash('YourPassword123!', 12).then(console.log)"
ADMIN_TELEGRAM_IDS=123456789,987654321

# === SENTRY (ixtiyoriy dev'da) ===
SENTRY_DSN=your_sentry_dsn_or_empty
```

---

### 3.5 Frontend Sozlash

```bash
cd edumarket-frontend

# 1. Dependencies o'rnatish
npm install

# 2. .env fayl yaratish
cp .env.example .env.local
```

#### Frontend `.env.local` To'ldirish

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api/v1

# Telegram Mini App uchun (dev'da ixtiyoriy)
VITE_TELEGRAM_BOT_USERNAME=your_bot_username

# Sentry (ixtiyoriy)
VITE_SENTRY_DSN=
VITE_MIXPANEL_TOKEN=
```

---

### 3.6 Ishga Tushirish

```bash
# Terminal 1: Backend
cd edumarket-backend
npm run dev
# Server http://localhost:3000 da ishga tushadi
# "Server running on port 3000" ko'rinishi kerak

# Terminal 2: Frontend
cd edumarket-frontend
npm run dev
# App http://localhost:5173 da ishga tushadi
```

#### Tekshirish

```bash
# Backend health check
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."} qaytishi kerak

# API versiya
curl http://localhost:3000/api/v1
# {"message":"EduMarket API v1"} qaytishi kerak
```

> ✅ Agar ikkalasi ishlasa — muhit to'g'ri sozlangan!

---

### 3.7 Telegram Mini App Lokal Test

Telegram Mini App'ni lokal test qilish uchun tunnel kerak:

```bash
# ngrok o'rnatish (bir marta)
npm install -g ngrok

# Tunnel ochish (backend)
ngrok http 3000
# https://abc123.ngrok.io → localhost:3000

# Telegram'da @BotFather → /setmenubutton
# URL: https://abc123.ngrok.io (yoki frontend URL)

# Frontend ham tunnel kerak
ngrok http 5173
# Mini App URL: https://xyz789.ngrok.io
```

---

## 4. LOYIHA TUZILISHI

### 4.1 Frontend Tuzilishi

```
edumarket-frontend/
├── public/
│   └── favicon.ico
├── src/
│   ├── api/                    ← API call'lar
│   │   ├── auth.api.js         # Auth endpoint'lar
│   │   ├── task.api.js         # Task CRUD
│   │   ├── bid.api.js          # Bid operatsiyalar
│   │   ├── chat.api.js         # Chat
│   │   ├── file.api.js         # Fayl upload/download
│   │   └── index.js            # Axios instance (base config)
│   │
│   ├── components/             ← Qayta ishlatiladigan komponentlar
│   │   ├── common/             # Button, Card, Badge, Avatar...
│   │   ├── task/               # TaskCard, TaskStatusBadge...
│   │   ├── chat/               # ChatBubble, ChatInput...
│   │   └── layout/             # Header, BottomNav, PageLayout
│   │
│   ├── screens/                ← To'liq sahifalar (screen'lar)
│   │   ├── client/             # ClientHomeScreen, CreateTaskScreen
│   │   ├── freelancer/         # FreelancerHomeScreen, BrowseTasksScreen
│   │   ├── shared/             # ChatScreen, ProfileScreen, TaskDetailScreen
│   │   ├── onboarding/         # OnboardingScreen
│   │   └── admin/              # Admin panel screen'lar
│   │
│   ├── store/                  ← Zustand store'lar
│   │   ├── authStore.js        # User, token, role
│   │   ├── taskStore.js        # Active tasks, filters
│   │   └── uiStore.js          # Modal, sheet, loading states
│   │
│   ├── hooks/                  ← Custom React hooks
│   │   ├── useTasks.js         # React Query hooks (task CRUD)
│   │   ├── useBids.js          # Bid operatsiyalar
│   │   ├── useChat.js          # Socket.IO chat logic
│   │   └── useAuth.js          # Auth state va actions
│   │
│   ├── utils/                  ← Yordamchi funksiyalar
│   │   ├── formatters.js       # Pul formatlash, sana formatlash
│   │   ├── validators.js       # Form validation
│   │   ├── telegram.js         # Telegram Web App SDK helpers
│   │   └── constants.js        # TASK_STATUSES, CATEGORIES...
│   │
│   ├── App.jsx                 ← Root component + Router
│   ├── main.jsx                ← Entry point
│   └── index.css               ← Design System CSS tokenlar (ASOSIY)
│
├── tailwind.config.js          ← Tailwind Design System config
├── vite.config.js
└── package.json
```

---

### 4.2 Backend Tuzilishi

```
edumarket-backend/
├── prisma/
│   ├── schema.prisma           ← Database schema (ASOSIY)
│   └── migrations/             # Auto-generated migratsiyalar
│
├── src/
│   ├── config/
│   │   ├── env.js              ← Env validation (fail-fast)
│   │   ├── prisma.js           ← Prisma client singleton
│   │   └── bot.js              ← Telegram bot singleton
│   │
│   ├── middleware/
│   │   ├── auth.js             ← JWT tekshirish
│   │   ├── adminOnly.js        ← Admin rol tekshirish
│   │   ├── rateLimiter.js      ← Rate limiting (Redis-backed)
│   │   ├── nlpFilter.js        ← Akademik yaxlitlik filter
│   │   └── errorHandler.js     ← Global error handler
│   │
│   ├── modules/                ← Har bir biznes domain
│   │   ├── auth/               # auth.router → controller → service
│   │   ├── task/               # task.stateMachine.js muhim!
│   │   ├── bid/
│   │   ├── chat/
│   │   ├── file/               # Telegram cloud storage hack
│   │   ├── review/
│   │   ├── vip/
│   │   ├── admin/
│   │   └── notification/       # Internal only, router yo'q
│   │
│   ├── utils/
│   │   ├── telegramAuth.js     ← HMAC-SHA256 initData verifier
│   │   ├── jwt.js              ← Token sign/verify
│   │   ├── antifraud.js        ← Fake review detection
│   │   └── AppError.js         ← Custom error class
│   │
│   └── app.js                  ← Express app setup
│
├── .env                        ← (gitignore'da!) Lokal secrets
├── .env.example                ← Template (gitga commit qilinadi)
├── ecosystem.config.js         ← PM2 config (production)
└── package.json
```

---

### 4.3 Qaysi Fayl Qayerda?

| Nima qilmoqchi | Qaysi fayl |
|:--------------|:----------|
| Yangi API endpoint | `src/modules/[modul]/[modul].router.js` |
| Biznes logika | `src/modules/[modul]/[modul].service.js` |
| DB query | `src/modules/[modul]/[modul].service.js` (Prisma) |
| Yangi DB jadval | `prisma/schema.prisma` → migrate |
| Yangi React ekran | `src/screens/[category]/[Name]Screen.jsx` |
| Qayta ishlatiladigan komponent | `src/components/[category]/[Name].jsx` |
| API call funksiya | `src/api/[modul].api.js` |
| Global state | `src/store/[name]Store.js` |
| Design token | `tailwind.config.js` + `src/index.css` |

---

## 5. BIRINCHI MARTA ISHGA TUSHIRISH

### 5.1 Tekshiruv Ro'yxati

```
[ ] Node.js 20 o'rnatildi
[ ] PostgreSQL 15 ishlamoqda
[ ] Redis ishlamoqda
[ ] Repo klonlandi
[ ] edumarket-backend/.env to'ldirildi
[ ] edumarket-frontend/.env.local to'ldirildi
[ ] npm install (backend) bajarildi
[ ] npm install (frontend) bajarildi
[ ] npx prisma migrate dev bajarildi
[ ] Backend ishlamoqda (localhost:3000)
[ ] Frontend ishlamoqda (localhost:5173)
[ ] Health check muvaffaqiyatli
```

### 5.2 Birinchi Task Yaratish (Test)

```bash
# 1. Auth (development modida test user yaratish)
curl -X POST http://localhost:3000/api/v1/auth/dev-login \
  -H "Content-Type: application/json" \
  -d '{"telegramId": 123456789, "firstName": "Test", "role": "CLIENT"}'

# Token olinadi
TOKEN="eyJhbGc..."

# 2. Task yaratish
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Integral hisoblash",
    "description": "Aniq integral hisoblash kerak, 5 ta masala",
    "categoryId": 1,
    "budget": 50000,
    "deadline": "2026-06-20"
  }'
```

---

## 6. MUHIM HUJJATLAR XARITASI

**Loyihada ishlashdan oldin bu hujjatlarni o'qi:**

| Hujjat | Fayl | O'qish vaqti | Nima uchun |
|:-------|:-----|:------------|:----------|
| **Bu hujjat** | `docs/DEVELOPER_ONBOARDING.md` | Hozir | Muhit sozlash |
| **Design System** | `docs/DESIGN_SYSTEM_BIBLE.md` | 20 daqiqa | UI yozishdan oldin MAJBURIY |
| **AI Instructions** | `docs/AI_TASK_INSTRUCTIONS.md` | 10 daqiqa | Komponent yozishdan oldin |
| **UX & User Flow** | `docs/UX_USERFLOW_BIBLE.md` | 30 daqiqa | Screen yaratishdan oldin |
| **Enterprise Audit** | `docs/ENTERPRISE_AUDIT_2026.md` | 20 daqiqa | Nima muammo borligini bilish |
| **Roadmap** | `docs/ENTERPRISE_ROADMAP.md` | 20 daqiqa | Qaysi vazifalar bor |
| **Architecture** | `docs/ARCHITECTURE_OVERVIEW.md` | 15 daqiqa | Tizim qanday ishlaydi |
| **DB Schema** | `prisma/schema.prisma` | 15 daqiqa | Ma'lumotlar tuzilishi |

---

## 7. KOD YOZISH QOIDALARI

### 7.1 Naming Conventions

```javascript
// ✅ TO'G'RI — Fayl nomlari
TaskCard.jsx              // Komponent: PascalCase
taskStore.js              // Store: camelCase
useTasks.js               // Hook: use + PascalCase
task.service.js           // Service: kebab-case
formatCurrency.js         // Utility: camelCase

// ✅ TO'G'RI — O'zgaruvchilar
const taskList = [];              // array: camelCase
const isLoading = false;          // boolean: is/has prefix
const TASK_STATUSES = {};         // constant: UPPER_SNAKE
const handleSubmit = () => {};    // event handler: handle prefix

// ❌ NOTO'G'RI
const tl = [];           // Qisqartma — noaniq
const loading = false;   // boolean uchun is/has kerak
const myFunc = () => {}; // noaniq nom
```

---

### 7.2 Komponent Tuzilishi

```jsx
// STANDART KOMPONENT TUZILISHI
// === TaskCard ===
// Maqsad: Task ma'lumotini ro'yxatda ko'rsatish
// Props: task, onPress, variant

import { formatCurrency, formatDate } from '@/utils/formatters';
import { TaskStatusBadge } from './TaskStatusBadge';

// 1. TYPES / PROP DEFINITIONS (agar TypeScript bo'lsa)
// 2. COMPONENT
export function TaskCard({ task, onPress, variant = 'default' }) {

  // 3. STATE (agar kerak bo'lsa)
  const [isExpanded, setIsExpanded] = useState(false);

  // 4. DERIVED VALUES
  const isUrgent = task.deadline < Date.now() + 24 * 60 * 60 * 1000;

  // 5. HANDLERS
  const handlePress = () => {
    onPress?.(task);
  };

  // 6. LOADING STATE (majburiy async bo'lsa)
  if (!task) return <TaskCardSkeleton />;

  // 7. RENDER
  return (
    <div
      className="bg-edu-surface rounded-2xl border border-edu-border/20
                 shadow-ios p-4 press-scale cursor-pointer"
      onClick={handlePress}
      role="button"
      aria-label={`Topshiriq: ${task.title}`}
    >
      {/* Sarlavha */}
      <h3 className="text-md font-bold text-edu-text">{task.title}</h3>

      {/* Meta */}
      <div className="flex items-center gap-2 mt-2">
        <TaskStatusBadge status={task.status} />
        <span className="text-sm text-edu-muted">
          {formatCurrency(task.budget)}
        </span>
      </div>
    </div>
  );
}

// 8. SKELETON (shu faylda yoki alohida)
export function TaskCardSkeleton() {
  return (
    <div className="h-20 bg-edu-surface rounded-2xl border border-edu-border/20 animate-pulse" />
  );
}
```

---

### 7.3 API Call Tuzilishi

```javascript
// src/api/task.api.js

import { apiClient } from './index'; // Axios instance

// ✅ TO'G'RI: Har bir API call alohida funksiya
export const taskApi = {
  // Barcha tasklarni olish
  getAll: async (filters = {}) => {
    const { data } = await apiClient.get('/tasks', { params: filters });
    return data;
  },

  // Bitta task
  getById: async (taskId) => {
    const { data } = await apiClient.get(`/tasks/${taskId}`);
    return data;
  },

  // Yangi task yaratish
  create: async (taskData) => {
    const { data } = await apiClient.post('/tasks', taskData);
    return data;
  },

  // Task holati o'zgartirish
  updateStatus: async (taskId, status, payload = {}) => {
    const { data } = await apiClient.patch(`/tasks/${taskId}/status`, {
      status,
      ...payload,
    });
    return data;
  },
};
```

---

### 7.4 React Query Hook Tuzilishi

```javascript
// src/hooks/useTasks.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/api/task.api';
import toast from 'react-hot-toast';

// Query Keys (MAJBURIY saqlash — cache invalidation uchun)
export const TASK_KEYS = {
  all: ['tasks'],
  list: (filters) => ['tasks', 'list', filters],
  detail: (id) => ['tasks', 'detail', id],
};

// Barcha tasklarni olish
export function useTaskList(filters = {}) {
  return useQuery({
    queryKey: TASK_KEYS.list(filters),
    queryFn: () => taskApi.getAll(filters),
    staleTime: 30_000,       // 30 sekund fresh
    refetchOnWindowFocus: false,
  });
}

// Task yaratish
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskApi.create,
    onSuccess: (newTask) => {
      // Cache yangilash
      queryClient.invalidateQueries({ queryKey: TASK_KEYS.all });
      toast.success('Topshiriq muvaffaqiyatli yaratildi!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Xato yuz berdi');
    },
  });
}
```

---

### 7.5 Backend Service Tuzilishi

```javascript
// src/modules/task/task.service.js

const { prisma } = require('../../config/prisma');
const { AppError } = require('../../utils/AppError');
const { TASK_STATES, validTransitions } = require('./task.stateMachine');

// ✅ TO'G'RI: Service faqat biznes logika
const taskService = {
  // Task yaratish
  async createTask(clientId, taskData) {
    // 1. Validation
    if (taskData.budget < 5000) {
      throw new AppError('Minimal byudjet 5,000 so\'m', 400, 'BUDGET_TOO_LOW');
    }

    // 2. DB operation
    const task = await prisma.task.create({
      data: {
        ...taskData,
        clientId,
        status: TASK_STATES.OPEN,
      },
      include: {
        client: { select: { id: true, firstName: true, rating: true } },
        category: true,
      },
    });

    // 3. Side effects (notification, analytics)
    // notificationService.notifyNewTask(task); // async, don't await

    return task;
  },

  // Task holati o'zgartirish (state machine)
  async updateTaskStatus(taskId, newStatus, actorId) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      throw new AppError('Topshiriq topilmadi', 404, 'TASK_NOT_FOUND');
    }

    // State machine tekshirish
    if (!validTransitions[task.status]?.includes(newStatus)) {
      throw new AppError(
        `${task.status} dan ${newStatus} ga o'tish mumkin emas`,
        400,
        'INVALID_TRANSITION'
      );
    }

    return prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });
  },
};

module.exports = { taskService };
```

---

## 8. GIT WORKFLOW

### 8.1 Branch Strategiyasi

```
main          ← Production. Har doim ishlaydigan holat. Direct push YO'Q.
  └── develop ← Integration branch. Feature'lar shu yerga merge bo'ladi.
        ├── feature/task-filtering      ← Yangi feature
        ├── feature/payment-click-api   ← Boshqa feature
        ├── fix/chat-message-ordering   ← Bug fix
        └── hotfix/security-patch       ← URGENT production fix
```

### 8.2 Commit Format (Conventional Commits)

```bash
# FORMAT: type(scope): description

# Types:
feat     → Yangi feature
fix      → Bug fix
docs     → Hujjat o'zgarishi
style    → Kod stiliga ta'sir etmaydigan o'zgarish (format, semicolon)
refactor → Kodni qayta yozish (feature/fix emas)
test     → Test qo'shish yoki o'zgartirish
chore    → Build jarayoni, dependency update
perf     → Performance yaxshilash

# MISOL — TO'G'RI:
git commit -m "feat(task): add budget validation on task creation"
git commit -m "fix(chat): resolve message ordering issue with timestamps"
git commit -m "docs(api): add OpenAPI spec for task endpoints"
git commit -m "refactor(profile): split ProfileScreen into sub-components"

# MISOL — NOTO'G'RI:
git commit -m "fix"                    # Noaniq
git commit -m "WIP"                    # Commit qilma — stash qil
git commit -m "various changes"        # Noaniq
git commit -m "hamma narsa qilib bo'ldim"  # O'zbek tilida ham noaniq bo'lmasin
```

### 8.3 Feature Branch Jarayoni

```bash
# 1. Yangi feature boshlash
git checkout develop
git pull origin develop
git checkout -b feature/task-filtering

# 2. Ishlash...
git add .
git commit -m "feat(task): add category filter to task list"
git commit -m "feat(task): add budget range filter"
git commit -m "test(task): add tests for task filtering"

# 3. Push va PR
git push origin feature/task-filtering
# GitHub'da Pull Request oching → develop ga

# 4. PR description template:
## Nima qilindi?
- Task ro'yxatiga kategoriya filter qo'shildi
- Byudjet range filter qo'shildi

## Test qilish uchun:
1. npm run dev
2. FreelancerHome → Browse Tasks
3. Filter tugmasini bosing

## Qanday tekshirdim?
- [x] Unit tests yozildi
- [x] Mobile (375px) da test qilindi
- [x] Dark mode test qilindi
```

---

## 9. TEST YOZISH

### 9.1 Backend Test Tuzilishi

```javascript
// src/modules/task/__tests__/task.service.test.js

const { taskService } = require('../task.service');
const { prisma } = require('../../../config/prisma');

// Mock Prisma
jest.mock('../../../config/prisma', () => ({
  prisma: {
    task: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('taskService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should throw error if budget is less than 5000', async () => {
      await expect(
        taskService.createTask('user-id', { budget: 4000 })
      ).rejects.toThrow('Minimal byudjet 5,000 so\'m');
    });

    it('should create task with OPEN status', async () => {
      prisma.task.create.mockResolvedValue({ id: '1', status: 'OPEN' });

      const task = await taskService.createTask('user-id', {
        title: 'Test task',
        budget: 50000,
        deadline: new Date('2026-07-01'),
      });

      expect(prisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'OPEN' }) })
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('should throw error for invalid state transition', async () => {
      prisma.task.findUnique.mockResolvedValue({ id: '1', status: 'COMPLETED' });

      await expect(
        taskService.updateTaskStatus('1', 'OPEN', 'user-id')
      ).rejects.toThrow('INVALID_TRANSITION');
    });
  });
});
```

### 9.2 Testlarni Ishga Tushirish

```bash
# Backend testlar
cd edumarket-backend
npm test                    # Barcha test
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report

# Frontend testlar
cd edumarket-frontend
npm test                    # Vitest
npm run test:coverage       # Coverage
```

### 9.3 Qaysi Narsalarni Test Qilish SHART

```
KRITIK (test bo'lmasa merge qilinmaydi):
🔴 task.stateMachine.js — barcha o'tishlar
🔴 auth HMAC verification
🔴 escrow logic (to'lov o'tkazmalari)
🔴 bid qabul qilish (faqat bitta freelancer)

MUHIM (test yozish tavsiya qilinadi):
🟡 review anti-fraud detection
🟡 rate limiting
🟡 file upload validation

IXTIYORIY:
🟢 UI komponentlar (snapshot)
🟢 formatters/validators utils
```

---

## 10. DEBUG VA LOG

### 10.1 Backend Loglarni Ko'rish

```bash
# Local development
npm run dev
# Barcha loglar consoleda ko'rinadi

# Production (VPS)
pm2 logs edumarket-backend        # Real-time logs
pm2 logs edumarket-backend --lines 100  # Oxirgi 100 qator

# Log fayllar
tail -f logs/combined.log         # Barcha loglar
tail -f logs/error.log            # Faqat xatolar
```

### 10.2 Winston Log Darajalari

```javascript
// Loglarni qanday ishlatish:
const { logger } = require('../../utils/logger');

logger.info('Task yaratildi', { taskId, clientId });     // Oddiy ma'lumot
logger.warn('Rate limit yaqin', { ip, count });          // Ogohlantirish
logger.error('DB connection failed', { error });          // Xato
logger.debug('SQL query', { query, params });            // Debug (dev only)
```

### 10.3 Prisma Query Debug

```bash
# .env ga qo'shing (faqat development'da)
DEBUG="prisma:query"

# npm run dev ishga tushirganda barcha SQL so'rovlar ko'rinadi:
# prisma:query SELECT "public"."User"."id" FROM "public"."User"
```

### 10.4 Frontend Debug

```javascript
// React Query DevTools (development'da avtomatik)
// http://localhost:5173 pastki o'ng burchakda icon bor

// Zustand DevTools
// Redux DevTools extension o'rnatib, Zustand store'larni ko'rish mumkin

// Network tab
// Browser DevTools → Network → XHR/Fetch filtr
// API so'rovlar va javoblarni ko'rish
```

---

## 11. FAQ

### ❓ "Prisma migration error" chiqdi — nima qilish?

```bash
# 1. Migration holatini ko'ring
npx prisma migrate status

# 2. Agar pending migration bo'lsa
npx prisma migrate dev

# 3. Agar schema bilan conflict bo'lsa
npx prisma migrate reset   # ⚠️ BARCHA MA'LUMOT O'CHADI (faqat development!)
npx prisma migrate dev
npx prisma db seed         # Test datani qayta to'ldirish
```

---

### ❓ "Redis connection refused" — nima qilish?

```bash
# Redis ishlamoqdami?
redis-cli ping
# PONG → ✅ ishlayapti
# Connection refused → ishlamayapti

# Redis'ni ishga tushirish
redis-server                    # Mac/Linux
# Windows: Redis Desktop Manager yoki WSL

# Backend Redis'siz ham ishlaydi (degraded mode)
# Lekin Socket.IO multi-instance va rate limiting ishlamaydi
```

---

### ❓ Telegram initData nima va lokal test qanday?

```javascript
// initData — Telegram'dan keladigan autentifikatsiya string
// Production'da Telegram Mini App avtomatik yuboradi

// Lokal testda:
// 1. Development mode'da auth.service.js'da bypass bor:
if (process.env.NODE_ENV === 'development') {
  // Test user yaratish uchun /auth/dev-login endpoint bor
}

// 2. Yoki ngrok bilan haqiqiy Telegram'da test qilish (7.3 ga qarang)
```

---

### ❓ "God component" nimani anglatadi?

```
ProfileScreen.jsx — 41KB, 830 qator.
Bu fayl juda ko'p narsa qiladi: profil ko'rish, tahrirlash, statistika,
portfolio, sozlamalar... Barchasi bitta faylda.

BU MUAMMO, lekin hozircha shunday.
Yangi kod qo'shayotganda — yangi komponent yarating, shu faylga QISTIRMA.

Kelajakda: ProfileHeader.jsx + ProfileStats.jsx + ... ga bo'linadi.
```

---

### ❓ Hardcoded rang ko'rsam nima qilaman?

```jsx
// Agar shu kabi kod ko'rsangiz:
<div style={{ backgroundColor: '#007AFF' }}>

// ALMASHTIRING:
<div className="bg-edu-primary">
// YOKI
<div style={{ backgroundColor: 'var(--edu-primary)' }}>

// Yo'l xaritasi: ENTERPRISE_ROADMAP.md → Bosqich 2 → Design Token Nomuvofiqlik
```

---

### ❓ Yangi feature uchun qaysi fayllarni o'zgartirish kerak?

```
Yangi endpoint qo'shish (misol: task export):

Backend:
1. src/modules/task/task.router.js    ← Route qo'shish
2. src/modules/task/task.controller.js ← Controller funksiya
3. src/modules/task/task.service.js   ← Biznes logika
4. src/modules/task/__tests__/        ← Test yozish

Frontend:
1. src/api/task.api.js               ← API call funksiya
2. src/hooks/useTasks.js             ← React Query hook
3. src/components/task/              ← Komponent (agar kerak)
4. src/screens/client/               ← Screen (agar yangi)
```

---

## 12. MUHIM KONTAKTLAR

```
LOYIHA HAQIDA SAVOLLAR:
→ docs/ papkasidagi hujjatlarni o'qing

ARXITEKTURA QARORLARI:
→ docs/ADR/ papkasiga qarang (yozilayotgan)

DIZAYN QARORLARI:
→ docs/DESIGN_SYSTEM_BIBLE.md

XAVFSIZLIK MUAMMOLARI:
→ docs/SECURITY_MODEL.md (yozilayotgan)

ISHLAB CHIQISH BLOKERS:
→ GitHub Issues yarating: [BLOCKER] tag bilan

PRODUCTION MUAMMOLARI:
→ docs/RUNBOOK.md (yozilayotgan)
→ docs/INCIDENT_RESPONSE.md (yozilayotgan)
```

---

## BIRINCHI HAFTADA NIMA QILISH KERAK?

```
KUN 1:
[ ] Bu hujjatni to'liq o'qish
[ ] Muhit sozlash (3-bo'lim)
[ ] Backend va Frontend ishga tushirish
[ ] docs/DESIGN_SYSTEM_BIBLE.md o'qish

KUN 2:
[ ] docs/UX_USERFLOW_BIBLE.md o'qish
[ ] Codebase'ni aylanib chiqish (papkalar tuzilishi)
[ ] prisma/schema.prisma o'qish
[ ] Bitta kichik bug fix yoki refactor (amaliyot uchun)

KUN 3:
[ ] docs/ENTERPRISE_AUDIT_2026.md o'qish
[ ] docs/ENTERPRISE_ROADMAP.md o'qish
[ ] Birinchi feature branch yaratish
[ ] Supervisor bilan birinchi PR muhokamasi

KUN 4-5:
[ ] Birinchi real task ustida ishlash
[ ] Test yozish amaliyoti
[ ] Kod review jarayonini tushunish
```

---

*EduMarket Developer Onboarding Guide v1.0 | 2026-06-09*
*Bu hujjat eskirsa — yangilang. "Bu hujjat eskirgan" sababini toping va to'ldiring.*
