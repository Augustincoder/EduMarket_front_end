# EduMarket — Architecture Overview
> **Versiya:** 1.0 | **Sana:** 2026-06-09
> **Maqsad:** Tizimning qanday qurilganligi, qanday ishlashi va nima uchun shunday qarorlar qabul qilinganligi.
> **Qoida:** Har qanday arxitektura o'zgarishidan oldin bu hujjatni yangilang.

---

## MUNDARIJA

1. [Umumiy Ko'rinish](#1-umumiy-korinish)
2. [C4 Model — Tizim Diagramlari](#2-c4-model)
3. [Frontend Arxitekturasi](#3-frontend-arxitekturasi)
4. [Backend Arxitekturasi](#4-backend-arxitekturasi)
5. [Ma'lumotlar Bazasi](#5-malumotlar-bazasi)
6. [Real-time Arxitektura](#6-real-time-arxitektura)
7. [Fayl Saqlash Arxitekturasi](#7-fayl-saqlash-arxitekturasi)
8. [Autentifikatsiya Arxitekturasi](#8-autentifikatsiya-arxitekturasi)
9. [Xavfsizlik Qatlamlari](#9-xavfsizlik-qatlamlari)
10. [Ma'lumotlar Oqimi (Data Flow)](#10-malumotlar-oqimi)
11. [Infratuzilma](#11-infratuzilma)
12. [Hozirgi Kamchiliklar va Kelajak Rejasi](#12-hozirgi-kamchiliklar)

---

## 1. UMUMIY KO'RINISH

### 1.1 Loyiha Haqida

**EduMarket** — O'zbekistondagi talabalar o'rtasida akademik xizmatlar marketplace'i.
**Platform:** Telegram Mini App (TMA) — alohida sayt emas, Telegram ichida ishlaydi.
**Foydalanuvchilar:** Client (topshiriq beruvchi) + Freelancer (ijrochi) + Admin

### 1.2 Asosiy Arxitektura Qarorlari

| Qaror | Tanlangan | Alternativa | Sabab |
|:------|:---------|:-----------|:------|
| Platform | Telegram Mini App | PWA / Native App | 0 ta o'rnatish, Telegram auditoriyasi, auth bepul |
| Backend | Monolith (Express) | Microservices | Jamoa kichik, complexity kerak emas hozir |
| DB | PostgreSQL + Prisma | MongoDB | Relational data, type safety, migration support |
| Real-time | Socket.IO + Redis | WebRTC / SSE | Battle-tested, Redis adapter = scale mumkin |
| File Storage | Telegram Cloud | S3 / Cloudinary | 0 narx, Telegram limiti yetarli (MVP uchun) |
| State (Frontend) | Zustand + React Query | Redux / Jotai | Oddiy API, React Query server cache bilan ajralib turadi |
| Deploy | Vercel + VPS | AWS / GCP | Narxi past, konfiguratsiya minimal |

---

## 2. C4 MODEL

### 2.1 Level 1 — Tizim Konteksti

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EDUMARKET EKOTIZIM                            │
│                                                                         │
│   ┌─────────────┐                         ┌──────────────────────────┐ │
│   │  TALABA     │◄──── Telegram Mini ─────►│  TELEGRAM PLATFORM       │ │
│   │ (Client /   │     App (WebView)        │  telegram.org            │ │
│   │ Freelancer) │                          │  Bot API, initData Auth  │ │
│   └─────────────┘                          └──────────────────────────┘ │
│          │                                            │                 │
│          │ HTTPS                                      │ Webhook         │
│          ▼                                            ▼                 │
│   ┌──────────────────────────────────────────────────────────────────┐  │
│   │                    EDUMARKET TIZIMI                               │  │
│   │   ┌────────────┐      ┌────────────┐      ┌────────────────┐    │  │
│   │   │  Frontend  │◄────►│  Backend   │◄────►│  Telegram Bot  │    │  │
│   │   │  (React)   │ API  │  (Express) │      │  (Notifications)│   │  │
│   │   └────────────┘      └────────────┘      └────────────────┘    │  │
│   └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│   ┌─────────────┐                         ┌──────────────────────────┐ │
│   │   ADMIN     │◄──── Admin Panel ───────►│  SENTRY / MIXPANEL       │ │
│   │             │     (Web browser)        │  Monitoring & Analytics  │ │
│   └─────────────┘                          └──────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Level 2 — Container Diagrami

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          EDUMARKET TIZIMI                               │
│                                                                         │
│  ┌───────────────────────┐    HTTPS     ┌───────────────────────────┐  │
│  │   REACT FRONTEND      │◄────────────►│   EXPRESS BACKEND         │  │
│  │   (Vercel CDN)        │              │   (VPS — Ubuntu 22.04)    │  │
│  │                       │              │                           │  │
│  │   React 19 + Vite     │   WebSocket  │   Port 3000 (PM2)         │  │
│  │   TailwindCSS v4      │◄────────────►│   Nginx reverse proxy     │  │
│  │   Zustand             │   Socket.IO  │                           │  │
│  │   React Query         │              └───────────┬───────────────┘  │
│  │   Socket.IO Client    │                          │                  │
│  └───────────────────────┘              ┌───────────┼───────────────┐  │
│                                         │           │               │  │
│                                         ▼           ▼               ▼  │
│                                 ┌──────────┐ ┌──────────┐ ┌──────────┐│
│                                 │PostgreSQL│ │  Redis   │ │  TG Bot  ││
│                                 │ DB (VPS) │ │  (VPS)   │ │ (Webhook)││
│                                 │          │ │          │ │          ││
│                                 │ Schema:  │ │ Cache    │ │ Push     ││
│                                 │ Users    │ │ Sessions │ │ Notif.   ││
│                                 │ Tasks    │ │ Rate lim.│ │ File     ││
│                                 │ Bids     │ │ Socket   │ │ Storage  ││
│                                 │ Chat     │ │ adapter  │ │          ││
│                                 │ Reviews  │ │          │ │          ││
│                                 └──────────┘ └──────────┘ └──────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 2.3 Level 3 — Backend Komponentlar

```
EXPRESS BACKEND (src/)
│
├── app.js                    ← Express app setup, middleware tartib
│
├── MIDDLEWARE QATLAM
│   ├── helmet()              ← HTTP security headers
│   ├── cors()                ← CORS policy
│   ├── rateLimit()           ← Global rate limit (Redis-backed)
│   ├── requireAuth()         ← JWT verify → req.user
│   ├── adminOnly()           ← Role check
│   ├── nlpFilter()           ← Akademik yaxlitlik filter
│   └── errorHandler()        ← Global error catch
│
├── ROUTER QATLAM
│   ├── /api/v1/auth          → authRouter
│   ├── /api/v1/tasks         → taskRouter
│   ├── /api/v1/bids          → bidRouter
│   ├── /api/v1/chat          → chatRouter
│   ├── /api/v1/files         → fileRouter
│   ├── /api/v1/reviews       → reviewRouter
│   ├── /api/v1/vip           → vipRouter
│   └── /api/v1/admin         → adminRouter
│
├── CONTROLLER QATLAM
│   ├── Request parsing
│   ├── Input validation (joi / express-validator)
│   ├── Service chaqirish
│   └── Response formatlash
│
├── SERVICE QATLAM (BIZNES LOGIKA)
│   ├── Task state machine
│   ├── Bid selection logic
│   ├── Escrow release logic
│   ├── Anti-fraud detection
│   └── Notification triggering
│
├── DATABASE QATLAM
│   └── Prisma ORM → PostgreSQL
│
└── BACKGROUND JOBS (node-cron)
    ├── Deadline reminder (har soat)
    ├── Auto-complete IN_REVIEW (48h) (har 15 daqiqa)
    ├── VIP expiry check (kuniga bir marta)
    └── Data cleanup (haftada bir marta)
```

---

## 3. FRONTEND ARXITEKTURASI

### 3.1 State Boshqaruv Arxitekturasi

```
STATE = CLIENT STATE + SERVER STATE

CLIENT STATE (Zustand):
├── authStore      → user, token, role, isAuthenticated
├── taskStore      → activeFilters, selectedCategory
└── uiStore        → activeModal, activeSheet, isKeyboardOpen

SERVER STATE (React Query):
├── useTaskList()  → /api/v1/tasks (cache: 30s)
├── useTaskById()  → /api/v1/tasks/:id (cache: 60s)
├── useBids()      → /api/v1/tasks/:id/bids (cache: 15s)
├── useChats()     → /api/v1/chat (cache: 0 — real-time)
└── useProfile()   → /api/v1/users/me (cache: 5min)

QOIDA:
- Zustand = UI state, user preferences, auth
- React Query = barcha server ma'lumotlar
- Props drilling = MAX 2 level. Undan chuqurroq → Context yoki store
```

### 3.2 Routing Arxitekturasi

```javascript
// App.jsx — Router tuzilishi
<Router>
  <Routes>
    {/* Auth guard */}
    <Route element={<RequireAuth />}>

      {/* Role-based routing */}
      <Route element={<RoleGuard role="CLIENT" />}>
        <Route path="/client/*" element={<ClientWorkspace />} />
      </Route>

      <Route element={<RoleGuard role="FREELANCER" />}>
        <Route path="/freelancer/*" element={<FreelancerWorkspace />} />
      </Route>

      {/* Shared screens */}
      <Route path="/tasks/:id" element={<TaskDetailScreen />} />
      <Route path="/chat/:chatId" element={<ChatScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/profile/:userId" element={<UserProfileScreen />} />
      <Route path="/notifications" element={<NotificationScreen />} />

    </Route>

    {/* Public routes */}
    <Route path="/onboarding" element={<OnboardingScreen />} />
    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
</Router>
```

### 3.3 API Layer Arxitekturasi

```javascript
// src/api/index.js — Axios singleton

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// REQUEST INTERCEPTOR: Token qo'shish
apiClient.interceptors.request.use((config) => {
  const token = authStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// RESPONSE INTERCEPTOR: Error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired → auto re-auth
      authStore.getState().logout();
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);
```

### 3.4 Komponent Hierarxiyasi

```
Screen (sahifa)
├── Layout wrappers (PageLayout, Header, BottomNav)
├── Section components (TaskSection, BidSection)
│   └── Item components (TaskCard, BidCard, UserCard)
│       └── Primitive components (Badge, Avatar, Button, Icon)
└── Modal/Sheet components (CreateTaskSheet, FilterSheet)

QOIDA:
- Screen: data fetching, state management
- Section: data transformation, list rendering
- Item: pure display, no data fetching
- Primitive: no logic, pure UI
```

---

## 4. BACKEND ARXITEKTURASI

### 4.1 Request-Response Jarayoni

```
HTTP Request
     │
     ▼
┌─────────────┐
│   Nginx     │  ← SSL termination, static files, rate limit (L7)
│ (Port 80/443)│
└─────────────┘
     │
     ▼ HTTP (Port 3000)
┌─────────────┐
│  Express    │
│             │
│ 1. helmet() │  ← Security headers
│ 2. cors()   │  ← CORS check
│ 3. json()   │  ← Body parsing
│ 4. rateLimit│  ← Redis rate limit
│ 5. router   │  ← Route matching
│ 6. auth()   │  ← JWT verify (agar protected route)
│ 7. handler  │  ← Controller function
└─────────────┘
     │
     ▼
┌─────────────┐
│ Controller  │  ← Request parsing, response formatting
└─────────────┘
     │
     ▼
┌─────────────┐
│   Service   │  ← Business logic, validation
└─────────────┘
     │
     ▼
┌─────────────┐
│   Prisma    │  ← Type-safe queries
└─────────────┘
     │
     ▼
┌─────────────┐
│ PostgreSQL  │  ← Data storage
└─────────────┘
     │
     ▼ (Response qaytadi)
HTTP Response → Nginx → Client
```

### 4.2 Error Handling Arxitekturasi

```javascript
// Uchta daraja error handling:

// 1. ROUTE LEVEL — asyncHandler wrapper
router.get('/tasks', requireAuth, asyncHandler(async (req, res) => {
  const tasks = await taskService.getAll();
  res.json({ success: true, data: tasks });
}));

// asyncHandler: async funksiya ichidagi xatolarni next(error) ga uzatadi
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 2. SERVICE LEVEL — AppError
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;       // 'TASK_NOT_FOUND', 'BUDGET_TOO_LOW' ...
    this.isOperational = true;  // Bizning xatomiz (hacker emas)
  }
}

// 3. GLOBAL ERROR HANDLER (middleware/errorHandler.js)
function errorHandler(err, req, res, next) {
  // Operational error (biz kutgan)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: { code: err.code, message: err.message }
    });
  }

  // Unexpected error (dasturlash xatosi)
  logger.error('Unexpected error', { err, req: req.path });
  Sentry.captureException(err);

  return res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Ichki xato yuz berdi' }
  });
}
```

### 4.3 Task State Machine Arxitekturasi

```javascript
// src/modules/task/task.stateMachine.js

const TASK_STATES = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  COMPLETED: 'COMPLETED',
  DISPUTED: 'DISPUTED',
  CANCELED: 'CANCELED',
};

// Kim qaysi o'tishni amalga oshira oladi
const validTransitions = {
  OPEN: {
    ASSIGNED: ['CLIENT'],       // Client bid qabul qiladi
    CANCELED: ['CLIENT'],       // Client bekor qiladi (bid bo'lmaganda)
  },
  ASSIGNED: {
    IN_PROGRESS: ['FREELANCER'], // Freelancer boshlayman deydi
    CANCELED: ['CLIENT', 'ADMIN'],
  },
  IN_PROGRESS: {
    IN_REVIEW: ['FREELANCER'],  // Freelancer natija yubordi
    DISPUTED: ['CLIENT', 'FREELANCER'],
  },
  IN_REVIEW: {
    COMPLETED: ['CLIENT', 'SYSTEM'],  // SYSTEM = auto-complete 48h
    DISPUTED: ['CLIENT'],
  },
  DISPUTED: {
    COMPLETED: ['ADMIN'],       // Admin hal qildi
  },
};

// O'tishni tekshirish
function canTransition(currentStatus, newStatus, actorRole) {
  const allowed = validTransitions[currentStatus]?.[newStatus];
  return allowed?.includes(actorRole) ?? false;
}
```

---

## 5. MA'LUMOTLAR BAZASI

### 5.1 Core Entity Munosabatlari

```
USER ──────────────────────────────────────────────────────────
│  id, telegramId, firstName, role(CLIENT|FREELANCER|ADMIN)
│  rating, reviewCount, isVip, vipExpiresAt
│
├──[1:N]──► TASK (CLIENT sifatida)
│             id, title, description, budget, deadline
│             status, categoryId, clientId
│
├──[1:N]──► BID (FREELANCER sifatida)
│             id, taskId, freelancerId, amount, deadline, message
│             status(PENDING|ACCEPTED|REJECTED)
│
├──[1:N]──► CHAT_MESSAGE
│             id, chatId, senderId, content, fileId(Telegram)
│
└──[1:N]──► REVIEW (yozuvchi sifatida)
              id, taskId, reviewerId, revieweeId, rating, comment

TASK ──────────────────────────────────────────────────────────
│
├──[1:N]──► BID
├──[1:1]──► CHAT (ASSIGNED bo'lganda yaratiladi)
│             id, taskId, clientId, freelancerId
│             └──[1:N]──► CHAT_MESSAGE
│
└──[1:N]──► REVIEW (har bir task 2 ta review: client + freelancer)

CATEGORY ──────────────────────────────────────────────────────
│  id, name, icon, parentId (nested categories)
└──[1:N]──► TASK
```

### 5.2 Indekslar Strategiyasi

```sql
-- Tez-tez so'ratiladigan querylar uchun indekslar:

-- Task ro'yxati (status, category filter bilan)
CREATE INDEX idx_tasks_status ON "Task"(status);
CREATE INDEX idx_tasks_category ON "Task"("categoryId");
CREATE INDEX idx_tasks_client ON "Task"("clientId");
CREATE INDEX idx_tasks_deadline ON "Task"(deadline);

-- Composite: open tasklar kategoriya bo'yicha
CREATE INDEX idx_tasks_status_category ON "Task"(status, "categoryId")
  WHERE status = 'OPEN';

-- Chat messages: chat bo'yicha, vaqt bo'yicha
CREATE INDEX idx_chat_messages ON "ChatMessage"("chatId", "createdAt" DESC);

-- User search: telegramId (auth uchun)
CREATE UNIQUE INDEX idx_users_telegram ON "User"("telegramId");

-- Bid: task + freelancer (bitta freelancer bitta taskga bitta bid)
CREATE UNIQUE INDEX idx_bid_task_freelancer
  ON "Bid"("taskId", "freelancerId")
  WHERE status != 'REJECTED';
```

### 5.3 Soft Delete Strategiyasi

```
QOIDA: Ma'lumot HECH QACHON fizik o'chirilmaydi (audit uchun).

Soft delete pattern:
- User: isActive = false + deactivatedAt timestamp
- Task: isDeleted = false + deletedAt timestamp (admin tomonidan)
- ChatMessage: isDeleted = false (o'chirish funksiyasi yo'q hozircha)
- Review: O'chirib bo'lmaydi (anti-fraud)

Shard:
- deletedAt IS NULL — barcha so'rovlarda MAJBURIY filter
- Prisma middleware bilan avtomatik qilish mumkin (keyinroq)
```

### 5.4 Database Connection Pool

```javascript
// config/prisma.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Connection pool (default Prisma settings + tuning)
// pool_size = 10 (production'da VPS RAM ga qarab o'zgartirish)
// connection_timeout = 20s
// idle_timeout = 600s

module.exports = { prisma };
```

---

## 6. REAL-TIME ARXITEKTURA

### 6.1 Socket.IO Arxitekturasi

```
CLIENT (Socket.IO client)
     │
     │ WebSocket (wss://)
     ▼
EXPRESS SERVER
└── Socket.IO Server
    └── Redis Adapter ← bu kelajakda multi-instance uchun kerak
        └── Redis Pub/Sub

ROOM TIZIMI:
- Har bir chat uchun: room = `chat:${chatId}`
- Har bir user uchun: room = `user:${userId}` (personal notifications)
- Admin uchun: room = `admin` (broadcast)

EVENTS:

CLIENT → SERVER:
  join_chat(chatId)              → chat roomga qo'shilish
  send_message({chatId, content, fileId})  → xabar yuborish
  typing_start(chatId)           → yozish boshladi
  typing_end(chatId)             → yozishni to'xtatdi
  mark_read(chatId)              → o'qildi deb belgilash

SERVER → CLIENT:
  new_message({...message})      → yangi xabar
  user_typing({userId})          → kimdir yozmoqda
  user_stopped_typing({userId})  → to'xtadi
  notification({type, data})     → push notification
  task_updated({taskId, status}) → task holati o'zgardi
```

### 6.2 Socket Auth

```javascript
// Socket.IO middleware — JWT tekshirish
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = payload.userId;
    socket.userRole = payload.role;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Connect bo'lganda personal room'ga qo'shish
io.on('connection', (socket) => {
  socket.join(`user:${socket.userId}`);
  if (socket.userRole === 'ADMIN') socket.join('admin');
});
```

---

## 7. FAYL SAQLASH ARXITEKTURASI

### 7.1 Telegram Cloud Storage Hack

```
MUAMMO: S3/Cloudinary = pul. Talabalar platformasi uchun yechim kerak.

YECHIM: Telegram'ning o'z cloud storage'ini ishlatish.

QANDAY ISHLAYDI:
1. Foydalanuvchi fayl yuboradi → EduMarket API
2. EduMarket Bot → Private storage kanaliga fayl yuboradi
3. Telegram FileID qaytaradi
4. FileID DB'da saqlanadi (telegram_file_id column)
5. Foydalanuvchi faylni yuklamoqchi → EduMarket FileID'dan URL oladi
6. Telegram'dan stream qilib foydalanuvchiga uzatadi

ARXITEKTURA:

Foydalanuvchi → [Upload API] → [Bot sendDocument()] → [Private Kanal]
                                      ↓
                              telegram_file_id DB'da

Foydalanuvchi → [Download API] → [Bot getFile(file_id)] → [Telegram CDN]
                                        ↓
                                  Stream → Foydalanuvchi

CHEKLOVLAR:
- Max fayl hajmi: 50MB (Telegram Bot API limiti)
- Fayl formatlari: Hammasi (Telegram hamma qabul qiladi)
- Download: Token bilan himoyalangan (hamma ko'ra olmaydi)
- Muddati: Telegram FileID abadiy emas (~24 soat link, lekin ID davomiy)
```

### 7.2 File Service Arxitekturasi

```javascript
// src/modules/file/file.service.js

const fileService = {
  // Fayl yuklash (Telegram'ga)
  async uploadFile(fileBuffer, fileName, mimeType, uploadedBy) {
    // 1. Validation
    const MAX_SIZE = 50 * 1024 * 1024; // 50MB
    if (fileBuffer.length > MAX_SIZE) {
      throw new AppError('Fayl hajmi 50MB dan oshmasligi kerak', 400);
    }

    // 2. Telegram'ga yuborish
    const response = await bot.sendDocument(
      process.env.BOT_STORAGE_CHANNEL_ID,
      fileBuffer,
      { caption: `Uploaded by: ${uploadedBy} | ${fileName}` },
      { filename: fileName, contentType: mimeType }
    );

    const telegramFileId = response.document.file_id;

    // 3. DB'da saqlash
    const file = await prisma.file.create({
      data: {
        telegramFileId,
        originalName: fileName,
        mimeType,
        size: fileBuffer.length,
        uploadedBy,
      }
    });

    return file;
  },

  // Fayl yuklab olish
  async downloadFile(fileId, requestingUserId) {
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    // Access check (owner yoki task participant)
    if (!await this.canAccess(file, requestingUserId)) {
      throw new AppError('Ruxsat yo\'q', 403, 'ACCESS_DENIED');
    }

    // Telegram'dan link olish
    const fileLink = await bot.getFileLink(file.telegramFileId);
    return fileLink; // HTTPS URL → stream qilish mumkin
  },
};
```

---

## 8. AUTENTIFIKATSIYA ARXITEKTURASI

### 8.1 Telegram initData HMAC-SHA256

```
QANDAY ISHLAYDI:

1. Foydalanuvchi Telegram'da Mini App'ni ochadi
2. Telegram SDK → initData string'ini beradi
   Format: "auth_date=1234&hash=abcd&user={"id":123,...}"
3. Frontend → initData'ni Backend'ga yuboradi
4. Backend → HMAC-SHA256 tekshiradi (BOT_TOKEN ishlatib)
5. Agar valid → JWT token beradi
6. Frontend → har so'rovda JWT ishlatadi

HMAC TEKSHIRISH:
   data_check_string = URL-decoded initData parametrlar (hash siz, sort qilingan)
   secret_key = HMAC-SHA256(BOT_TOKEN, "WebAppData")
   hash = HMAC-SHA256(secret_key, data_check_string)
   hash === initData.hash → VALID ✅

NIMA UCHUN XAVFSiZ:
- BOT_TOKEN faqat backend'da (env)
- Telegram'ning o'zi imzolagan
- auth_date tekshirish: >24 soat bo'lsa reject
```

### 8.2 JWT Token Arxitekturasi

```javascript
// JWT payload:
{
  "userId": "uuid-here",
  "telegramId": 123456789,
  "role": "CLIENT" | "FREELANCER" | "ADMIN",
  "iat": 1234567890,
  "exp": 1234567890  // 7 kun keyingi
}

// Token hayot sikli:
Issue (Login) → Valid (7 kun) → [Logout: Blacklist] → Invalid
                              → [Expire: 7 kun o'tdi] → Re-auth

// Blacklist (Redis):
key: "bl:{token_hash}"
value: "1"
TTL: token ning qolgan muddati

// HTTP-only cookie:
res.cookie('token', jwtToken, {
  httpOnly: true,      // JS dan ko'rib bo'lmaydi
  secure: true,        // Faqat HTTPS
  sameSite: 'strict',  // CSRF himoyasi
  maxAge: 7 * 24 * 60 * 60 * 1000  // 7 kun
});
```

### 8.3 RBAC (Role-Based Access Control)

```
HOZIRGI HOLAT: 2 rol (USER, ADMIN) — yetarli emas

KELAJAK TARGET (Enterprise):
┌─────────────────────────────────────────────────────┐
│                    RBAC MATRIX                       │
├─────────────────┬────────┬───────────┬──────────────┤
│ Action          │ CLIENT │ FREELANCER│ ADMIN        │
├─────────────────┼────────┼───────────┼──────────────┤
│ Create task     │   ✅   │    ❌     │    ✅        │
│ View tasks      │   ✅   │    ✅     │    ✅        │
│ Submit bid      │   ❌   │    ✅     │    ✅        │
│ Accept bid      │   ✅   │    ❌     │    ✅        │
│ Submit result   │   ❌   │    ✅     │    ✅        │
│ Approve result  │   ✅   │    ❌     │    ✅        │
│ Open dispute    │   ✅   │    ✅     │    ✅        │
│ Resolve dispute │   ❌   │    ❌     │    ✅        │
│ Ban user        │   ❌   │    ❌     │    ✅        │
│ Approve VIP     │   ❌   │    ❌     │    ✅        │
│ Broadcast       │   ❌   │    ❌     │    ✅        │
└─────────────────┴────────┴───────────┴──────────────┘
```

---

## 9. XAVFSIZLIK QATLAMLARI

### 9.1 Defense in Depth (Chuqurlik bo'yicha himoya)

```
QATLAM 1 — NETWORK:
├── Nginx: DDoS basic protection, connection limit
├── Cloudflare (kelajakda): WAF, DDoS mitigation, CDN
└── SSL/TLS: Let's Encrypt (HTTPS majburiy)

QATLAM 2 — APPLICATION LAYER:
├── helmet(): 11 ta HTTP security header
├── CORS: Faqat ruxsatli originlar
├── Rate limiting: Redis-backed, IP + User ID bo'yicha
├── Input validation: Joi / express-validator
└── SQL injection: Prisma ORM parametrlangan query

QATLAM 3 — AUTHENTICATION:
├── Telegram HMAC-SHA256 initData verification
├── JWT + HTTP-only cookie
├── Token blacklist (logout)
└── auth_date expiry (24 soat)

QATLAM 4 — AUTHORIZATION:
├── requireAuth() middleware
├── adminOnly() middleware
├── Resource ownership check (task owner, chat participant)
└── [Kelajak] RBAC + ABAC

QATLAM 5 — DATA:
├── Prisma: Parametrlangan querylar (SQL injection yo'q)
├── DOMPurify: User-generated HTML sanitize
├── NLP filter: Tashqi aloqa urinishlarini bloklash
└── File type validation: mime-type + file header tekshirish

QATLAM 6 — MONITORING:
├── Sentry: Exception tracking
├── Winston: Audit logging
└── [Kelajak] Anomaly detection
```

### 9.2 Hozirgi Zaifliklar (Ochiq muammolar)

```
🔴 KRITIK:
- Admin parol hali ham admin@123 (ENTERPRISE_ROADMAP.md S-01)
- Token revocation yo'q (S-02)
- AdminBroadcast XSS (S-03)

🟡 MUHIM:
- RBAC granular emas (faqat 2 rol)
- Secret rotation mexanizmi yo'q
- GDPR: User data delete endpoint yo'q

📋 REF: docs/ENTERPRISE_ROADMAP.md → Bosqich 1
```

---

## 10. MA'LUMOTLAR OQIMI

### 10.1 Task Yaratish va Topish Flow

```
CLIENT                 FRONTEND              BACKEND               DATABASE
  │                       │                     │                     │
  │── Forma to'ldirdi ───►│                     │                     │
  │                       │── POST /tasks ──────►│                     │
  │                       │   {title, budget...} │                     │
  │                       │                     │── Validate ─────────│
  │                       │                     │── prisma.task.create►│
  │                       │                     │◄─ {task: {...}} ────│
  │                       │◄─ {success, task} ──│                     │
  │◄─ "Topshiriq yaratildi"│                     │                     │
  │                       │                     │── Notification ─────►TG Bot
  │                       │                     │   (background)      │

FREELANCER             FRONTEND              BACKEND               DATABASE
  │                       │                     │                     │
  │── Home ochdi ────────►│                     │                     │
  │                       │── GET /tasks ───────►│                     │
  │                       │   ?status=OPEN      │── prisma.task.findMany►│
  │                       │                     │◄─ [tasks] ──────────│
  │                       │◄─ {tasks: [...]} ───│                     │
  │◄─ Task list ko'rsatildi│                     │                     │
```

### 10.2 Real-time Chat Flow

```
FREELANCER             SOCKET.IO              BACKEND              DATABASE
  │                       │                     │                     │
  │── join_chat(chatId) ──►│                     │                     │
  │                       │── room join ────────►│                     │
  │                       │   chat:{chatId}      │                     │
  │                       │                     │                     │
  │── send_message ───────►│                     │                     │
  │   {content, fileId}   │── emit to room ─────►│                     │
  │                       │                     │── prisma.msg.create ►│
  │                       │                     │◄─ {message} ────────│
  │                       │                     │                     │
CLIENT                  SOCKET.IO              │                     │
  │◄── new_message ────────│◄─── broadcast ──────│                     │
  │    {content, sender}   │    to chat room     │                     │
  │                        │                     │                     │
  │                        │── emit personal ────►│── TG Bot notify ───►TG
  │                        │   user:{clientId}   │   (if offline)      │
```

---

## 11. INFRATUZILMA

### 11.1 Server Konfiguratsiya

```
PRODUCTION SERVER (VPS):
OS:     Ubuntu 22.04 LTS
RAM:    4GB (min), 8GB (recommended)
CPU:    2 vCPU
Disk:   50GB SSD
Provider: Beeline/UCloud (Uzbekistan), Digital Ocean, Hetzner

NGINX KONFIGURATSIYA:
server {
    listen 443 ssl http2;
    server_name api.edumarket.uz;

    ssl_certificate /etc/letsencrypt/live/api.edumarket.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.edumarket.uz/privkey.pem;

    # Gzip
    gzip on;
    gzip_types application/json;

    # Rate limit (Nginx level)
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';  # WebSocket
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

PM2 KONFIGURATSIYA (ecosystem.config.js):
module.exports = {
  apps: [{
    name: 'edumarket-backend',
    script: 'src/app.js',
    instances: 2,          // 2 CPU core
    exec_mode: 'cluster',  // Cluster mode (load balancing)
    max_memory_restart: '1G',
    env_production: {
      NODE_ENV: 'production',
    }
  }]
};
```

### 11.2 Frontend Deploy (Vercel)

```
VERCEL KONFIGURATSIYA:
- Framework: Vite
- Build command: npm run build
- Output directory: dist
- Auto-deploy: main branch → production
- Preview deploy: PR → preview URL

ENVIRONMENT VARIABLES (Vercel dashboard):
VITE_API_URL=https://api.edumarket.uz/api/v1
VITE_MIXPANEL_TOKEN=...
VITE_SENTRY_DSN=...
```

### 11.3 Muhitlar (Environments)

```
LOCAL:
  Frontend: http://localhost:5173
  Backend:  http://localhost:3000
  DB:       localhost:5432
  Redis:    localhost:6379

STAGING: (kelajakda — hozir yo'q)
  Frontend: https://staging.edumarket.uz
  Backend:  https://api-staging.edumarket.uz
  DB:       Alohida staging DB

PRODUCTION:
  Frontend: https://app.edumarket.uz (Vercel)
  Backend:  https://api.edumarket.uz (VPS)
  DB:       PostgreSQL (VPS)
  Redis:    Redis (VPS)
```

---

## 12. HOZIRGI KAMCHILIKLAR VA KELAJAK REJASI

### 12.1 Arxitektura Borjlari (Technical Debt)

| Muammo | Jiddiylik | Tuzatish rejasi |
|:-------|:---------|:---------------|
| Service layer yo'q — controller'lar to'g'ri DB'ga | 🔴 Yuqori | Bosqich 4 (ROADMAP) |
| Repository pattern yo'q | 🔴 Yuqori | Bosqich 4 |
| TypeScript yo'q | 🟡 O'rta | v2.0 da |
| ProfileScreen God Component (41KB) | 🟡 O'rta | Bosqich 4 |
| Framer Motion o'rnatilgan, ishlatilmagan | 🟢 Past | O'chirish |
| i18n o'rnatilgan, ishlatilmagan | 🟢 Past | O'chirish yoki ishlatish |
| Design token nomuvofiqlik | 🟡 O'rta | Bosqich 2 |

### 12.2 Scalability Rejasi

```
HOZIR (MVP — 100-1000 foydalanuvchi):
Frontend: Vercel CDN ← yetarli
Backend: 1 VPS, 2 PM2 instance ← yetarli
DB: Single PostgreSQL ← yetarli
Redis: Single instance ← yetarli

KEYINGI QADAM (1000-10,000 foydalanuvchi):
Backend: 2 VPS + Nginx load balancer (horizontal scaling)
DB: Read replica qo'shish (yozish: primary, o'qish: replica)
Redis: Redis Cluster
CDN: Cloudflare (static assets + DDoS)

KELAJAK (10,000+ foydalanuvchi):
DB Sharding / Table partitioning
Message queue (BullMQ) — background jobs uchun
Microservices ajratish (notification, file storage)
Kubernetes + Docker
```

### 12.3 Monitoring Arxitekturasi (Kelajak)

```
HOZIR:
Sentry (Frontend) ← ishlayapti
Mixpanel (Frontend) ← ishlayapti
Winston (Backend) ← ishlayapti
Health check endpoint ← ishlayapti

TARGET:
┌─────────────────────────────────────────┐
│  MONITORING STACK                        │
│                                          │
│  Prometheus ← metrics collect           │
│       ↓                                  │
│  Grafana ← dashboard + alerting         │
│       ↓                                  │
│  OpsGenie / Telegram Bot ← alert notify │
│                                          │
│  OpenTelemetry ← distributed tracing    │
│  Sentry Performance ← APM              │
│  Uptime Robot ← external uptime check  │
└─────────────────────────────────────────┘
```

---

## XULOSA — ARXITEKTURA BAHO

| Qism | Hozirgi holat | Enterprise target | Ball |
|:-----|:-------------|:-----------------|:-----|
| Frontend arxitektura | React Query + Zustand ✅ | TypeScript + Storybook | 6/10 |
| Backend arxitektura | Yaxshi modullar, service layer yo'q | Service + Repository pattern | 5/10 |
| DB dizayn | Yaxshi schema, indekslar bor | Read replica, partitioning | 6/10 |
| Real-time | Socket.IO + Redis adapter ✅ | Multi-region | 7/10 |
| Fayl saqlash | Telegram hack (0 narx) | S3 + CDN (keyinroq) | 5/10 |
| Auth | HMAC + JWT ✅ | MFA, RBAC granular | 5/10 |
| Xavfsizlik | Asosiy ✅, admin zaif | OWASP, WAF, pentest | 4/10 |
| Infratuzilma | VPS + Vercel ✅ | K8s, multi-region | 4/10 |
| **JAMI** | | | **5.3/10** |

---

*EduMarket Architecture Overview v1.0 | 2026-06-09*
*Bu hujjat har qanday arxitektura o'zgarishidan keyin yangilanishi SHART.*
