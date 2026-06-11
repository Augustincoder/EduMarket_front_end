# 🗺️ EduMarket — Enterprise Migration Roadmap
> **Versiya:** 1.0 | **Sana:** 2026-06-09  
> **Maqsad:** 3.6/10 balldan 8-9/10 ballga chiqish uchun to'liq yo'l xaritasi.  
> **Muhim:** Har bir vazifa MUSTAQIL bajarilishi mumkin. Tartibga qattiq rioya qiling — keyingi bosqich oldingilariga bog'liq.

---

## 🎯 UMUMIY KO'RINISH

```
HOZIR                          MAQSAD
3.6/10 ──────────────────────► 8.5/10

Bosqich 1 (1-2 hafta):  Kritik xavfsizlik yamoqlari
Bosqich 2 (2-3 hafta):  Testing infratuzilmasi
Bosqich 3 (1-2 hafta):  CI/CD va Deploy
Bosqich 4 (3-4 hafta):  Arxitektura yaxshilash
Bosqich 5 (2-3 hafta):  To'lov tizimi
Bosqich 6 (2-3 hafta):  Monitoring va Observability
Bosqich 7 (1-2 hafta):  UI/UX to'g'rilashlar
Bosqich 8 (1-2 hafta):  Hujjatlar va Compliance

JAMI: ~17-21 hafta (bir kishi ishlasa)
```

---

## ✅ HAR BIR VAZIFANI BELGILASH TIZIMI

Har bir vazifa quyidagi formatda:
```
[ ] VAZIFA-ID | Nomi | Qiyinlik | Vaqt | Prioritet
    Maqsad: Nima uchun kerak
    Qadamlar: Aniq nima qilish kerak
    Tekshiruv: Bajarilganini qanday bilasiz
```

---

---

# 📦 BOSQICH 1: KRITIK XAVFSIZLIK (1-2 hafta)
> **Nima uchun birinchi?** Bu xatolar HOZIR ham produksiyada xatar. Admin parol `admin@123` — bu qabul qilib bo'lmaydigan holat.

---

## [S-01] Admin Login Xavfsizligi — KRITIK 🔴

**Maqsad:** `auth.service.js` dagi `admin@123` parolni o'chirish, xavfsiz autentifikatsiya qo'shish.

**Holat hozir:** `auth.service.js:137` — `if (username !== 'admin' || password !== 'admin@123')`

**Qadamlar:**

### 1. Backend — Admin parolni env'ga ko'chirish
```javascript
// edumarket-backend/.env ga qo'shing:
ADMIN_USERNAME=your_secure_admin_username
ADMIN_PASSWORD_HASH=bcrypt_hashed_password  // bcryptjs bilan hash qiling

// Hash yaratish:
// node -e "const b=require('bcryptjs'); b.hash('YourPassword123!', 12).then(console.log)"
```

### 2. auth.service.js ni yangilash
```javascript
// ESKI KOD (O'CHIRING):
async function loginAsAdmin(username, password) {
  if (username !== 'admin' || password !== 'admin@123') { ... }
}

// YANGI KOD:
const bcrypt = require('bcryptjs');

async function loginAsAdmin(username, password) {
  // 1. Env dan tekshirish
  const validUsername = env.ADMIN_USERNAME;
  const validPasswordHash = env.ADMIN_PASSWORD_HASH;
  
  if (!validUsername || !validPasswordHash) {
    throw new AppError('Admin tizimi sozlanmagan', 500, 'CONFIG_ERROR');
  }
  
  // 2. Username tekshirish
  if (username !== validUsername) {
    // Timing attack oldini olish uchun har doim hash tekshirish
    await bcrypt.compare('dummy', validPasswordHash);
    throw new AppError('Noto\'g\'ri login yoki parol', 401, 'INVALID_CREDENTIALS');
  }
  
  // 3. Password tekshirish
  const isValid = await bcrypt.compare(password, validPasswordHash);
  if (!isValid) {
    throw new AppError('Noto\'g\'ri login yoki parol', 401, 'INVALID_CREDENTIALS');
  }
  
  // 4. Admin foydalanuvchini toping
  let user = await prisma.user.findFirst({
    where: { role: 'ADMIN' }
  });
  
  if (!user) {
    throw new AppError('Admin foydalanuvchi topilmadi', 404);
  }
  
  const token = generateToken({ userId: user.id, role: user.role });
  return { user: { ...user, telegramId: user.telegramId.toString() }, token };
}
```

### 3. bcryptjs o'rnatish
```bash
cd edumarket-backend
npm install bcryptjs
```

### 4. Admin token muddati qisqartirish
```javascript
// utils/jwt.js — admin uchun alohida token
function generateAdminToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '4h' }); // 24h emas, 4 soat
}
```

**Tekshiruv:**
- `admin@123` bilan login ishlamasligi kerak
- Noto'g'ri parolda `401` qaytishi kerak
- Env da ADMIN_USERNAME va ADMIN_PASSWORD_HASH bo'lishi kerak

---

## [S-02] Token Revocation (Logout) — MUHIM 🟡

**Maqsad:** Logout qilganda token haqiqatan ham o'chsin.

**Holat hozir:** Logout qilsa, token JWT expire bo'lgunicha ishlayveradi.

**Qadamlar:**

### 1. Redis'da token blacklist
```javascript
// edumarket-backend/src/utils/tokenBlacklist.js (YANGI FAYL)
const { pubClient } = require('../config/redis');

async function blacklistToken(token, expiresInSeconds) {
  if (!pubClient.isOpen) return; // Redis yo'q bo'lsa o'tkazib yubor
  const key = `bl:${token}`;
  await pubClient.setEx(key, expiresInSeconds, '1');
}

async function isTokenBlacklisted(token) {
  if (!pubClient.isOpen) return false;
  const result = await pubClient.get(`bl:${token}`);
  return result === '1';
}

module.exports = { blacklistToken, isTokenBlacklisted };
```

### 2. Auth middleware'ni yangilash
```javascript
// src/middleware/auth.js — tekshirish qo'shing
const { isTokenBlacklisted } = require('../utils/tokenBlacklist');

async function requireAuth(req, res, next) {
  // ... mavjud kod ...
  
  // YANGI: Blacklist tekshirish
  const isBlacklisted = await isTokenBlacklisted(token);
  if (isBlacklisted) {
    return next(new AppError('Sessiya muddati tugagan. Qayta kiring.', 401, 'TOKEN_REVOKED'));
  }
  
  // ... davom ...
}
```

### 3. Logout endpoint qo'shish
```javascript
// auth.router.js ga qo'shing:
router.post('/logout', requireAuth, asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const tokenExp = req.user.exp - Math.floor(Date.now() / 1000);
  
  await blacklistToken(token, Math.max(tokenExp, 0));
  
  res.clearCookie('token');
  res.json({ success: true, message: 'Muvaffaqiyatli chiqildi' });
}));
```

**Tekshiruv:**
- Logout qilgandan keyin eski token bilan so'rov `401` qaytarishi kerak
- Redis'da `bl:TOKEN` kaliti bo'lishi kerak

---

## [S-03] AdminBroadcast XSS Zaifligini Yopish — KRITIK 🔴

**Maqsad:** Admin broadcast raw HTML yubora olmasligi kerak.

**Holat hozir:** `AdminBroadcast.jsx` — raw HTML textarea (XSS vektori)

**Qadamlar:**

### 1. Frontend — DOMPurify sanitizatsiya
```javascript
// screens/admin/AdminBroadcast.jsx
import DOMPurify from 'dompurify';

// Xabar yuborishdan oldin tozalash
const handleBroadcast = async () => {
  const sanitizedMessage = DOMPurify.sanitize(message, {
    ALLOWED_TAGS: [],        // Hech qanday HTML tag yo'q
    ALLOWED_ATTR: [],
  });
  
  if (!sanitizedMessage.trim()) {
    return setError('Xabar bo\'sh bo\'lishi mumkin emas');
  }
  
  await adminApi.broadcast({ message: sanitizedMessage, type });
};
```

### 2. Backend — Ikki marta sanitizatsiya (defense in depth)
```javascript
// admin.service.js broadcastMessage funksiyasida:
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

function sanitizeMessage(message) {
  return DOMPurify.sanitize(message, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

// O'rnatish: npm install dompurify jsdom
```

**Tekshiruv:**
- `<script>alert(1)</script>` yuborilsa plain text sifatida ko'rinishi kerak
- `<b>bold</b>` yuborilsa `bold` sifatida ko'rinishi kerak

---

## [S-04] Rate Limiting Mustahkamlash — MUHIM 🟡

**Maqsad:** Auth endpoint'larga yanada qattiqroq limit qo'yish.

**Qadamlar:**

```javascript
// middleware/rateLimiter.js ga qo'shing:

// Admin login: 5 urinish / 15 daqiqa (hozir yo'q)
const adminLoginRateLimiter = createLazyLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: rateLimitResponse('Juda ko\'p admin login urinishi. 15 daqiqadan keyin urinib ko\'ring.'),
  keyGenerator: (req) => `admin_login:${req.ip}`,
}, 'admin_login');

// auth.router.js ga qo'shing:
router.post('/admin-login', adminLoginRateLimiter, asyncHandler(authController.adminLogin));
```

**Tekshiruv:**
- 6-chi urinishda `429` qaytishi kerak

---

## [S-05] GDPR Minimum — Ma'lumot O'chirish 🟡

**Maqsad:** Foydalanuvchi o'z ma'lumotlarini o'chira olishi kerak.

**Qadamlar:**

### 1. Profile router'ga qo'shish
```javascript
// modules/profile/profile.router.js
router.delete('/me', requireAuth, asyncHandler(profileController.deleteMyAccount));
```

### 2. Controller
```javascript
// modules/profile/profile.controller.js
async function deleteMyAccount(req, res) {
  const userId = req.user.userId;
  
  await prisma.$transaction(async (tx) => {
    // 1. PII anonimlashtirish (hard delete emas)
    await tx.user.update({
      where: { id: userId },
      data: {
        fullname: 'Deleted User',
        username: null,
        avatarUrl: null,
        bio: null,
        freelancerBio: null,
        skills: [],
        deletedAt: new Date(),
        // Telegram ID saqlanadi (fraud oldini olish uchun)
      }
    });
    
    // 2. Chat xabarlarni anonim qilish
    await tx.chatMessage.updateMany({
      where: { senderId: userId },
      data: { content: '[Xabar o\'chirildi]', isDeleted: true }
    });
  });
  
  res.json({ success: true, message: 'Hisobingiz muvaffaqiyatli o\'chirildi' });
}
```

**Tekshiruv:**
- `DELETE /api/v1/users/me` so'rov `200` qaytarishi
- User'ning ismi "Deleted User" bo'lishi

---

---

# 📦 BOSQICH 2: TESTING INFRATUZILMASI (2-3 hafta)
> **Nima uchun ikkinchi?** Keyingi barcha o'zgarishlar xavfsiz bo'lishi uchun test kerak. Testsiz refaktor qilish ko'r uchish.

---

## [T-01] Backend Test Infratuzilmasi — KRITIK 🔴

**Maqsad:** Jest + Supertest bilan test yozish muhitini sozlash.

**Qadamlar:**

### 1. O'rnatish
```bash
cd edumarket-backend
npm install --save-dev jest supertest @types/jest jest-extended

# package.json ga qo'shish:
# "test": "jest --runInBand",
# "test:watch": "jest --watch",
# "test:coverage": "jest --coverage"
```

### 2. Jest konfiguratsiyasi
```javascript
// edumarket-backend/jest.config.js (YANGI FAYL)
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/config/**',
    '!src/data/**',
    '!src/migrations/**'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  setupFilesAfterFramework: ['./src/__tests__/setup.js'],
  testTimeout: 30000,
};
```

### 3. Test setup fayli
```javascript
// src/__tests__/setup.js (YANGI FAYL)
const prisma = require('../config/prisma');

// Har bir test faylidan oldin
beforeAll(async () => {
  await prisma.$connect();
});

// Har bir test faylidan keyin
afterAll(async () => {
  await prisma.$disconnect();
});

// Har bir testdan keyin test DB'ni tozalash (test env uchun)
afterEach(async () => {
  if (process.env.NODE_ENV !== 'test') return;
  // Test DB tozalash (kerak bo'lsa)
});
```

### 4. Prisma Mock
```javascript
// src/__tests__/mocks/prisma.mock.js (YANGI FAYL)
// Haqiqiy DB'ga ulanmaslik uchun
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  task: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  },
  bid: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn((fn) => fn(mockPrisma)),
  $disconnect: jest.fn(),
};

module.exports = mockPrisma;
```

---

## [T-02] Eng Muhim Unit Testlar — KRITIK 🔴

**Maqsad:** Escrow va task status o'tishlarini test qilish.

### Test 1: Auth Service

```javascript
// src/__tests__/unit/auth.service.test.js (YANGI FAYL)
jest.mock('../../config/prisma', () => require('../mocks/prisma.mock'));
jest.mock('../../utils/telegramAuth');
jest.mock('../../utils/jwt');

const { loginWithTelegram } = require('../../modules/auth/auth.service');
const { validateInitData } = require('../../utils/telegramAuth');
const { generateToken } = require('../../utils/jwt');
const mockPrisma = require('../mocks/prisma.mock');

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginWithTelegram', () => {
    it('yangi foydalanuvchini yaratishi kerak', async () => {
      validateInitData.mockReturnValue({
        id: '123456789',
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
      });
      
      mockPrisma.user.findUnique.mockResolvedValue(null); // Yangi user
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-id-1',
        telegramId: BigInt('123456789'),
        fullname: 'Test User',
        role: 'USER',
        isOnboardingComplete: false,
        isFreelancer: false,
        streakCount: 1,
        xp: 50,
      });
      generateToken.mockReturnValue('mock-jwt-token');

      const result = await loginWithTelegram('valid-init-data', '127.0.0.1');

      expect(result.isNewUser).toBe(true);
      expect(result.token).toBe('mock-jwt-token');
      expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    });

    it('bloklangan foydalanuvchini rad etishi kerak', async () => {
      validateInitData.mockReturnValue({ id: '123', first_name: 'Banned' });
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-id-2',
        telegramId: BigInt('123'),
        isBanned: true,
        banReason: 'Spam',
        fullname: 'Banned User',
      });

      await expect(loginWithTelegram('init-data', '127.0.0.1'))
        .rejects.toThrow('Hisobingiz bloklangan');
    });

    it('yaroqsiz initData ni rad etishi kerak', async () => {
      validateInitData.mockReturnValue(null);

      await expect(loginWithTelegram('invalid-data', '127.0.0.1'))
        .rejects.toThrow('Telegram ma\'lumotlari yaroqsiz');
    });
  });
});
```

### Test 2: Task State Machine (ENG MUHIM)

```javascript
// src/__tests__/unit/task.stateMachine.test.js (YANGI FAYL)
const { validateTransition, TASK_STATUS } = require('../../modules/task/task.stateMachine');

describe('Task State Machine', () => {
  it('OPEN dan ASSIGNED ga o\'tish mumkin bo\'lishi kerak', () => {
    expect(() => validateTransition(TASK_STATUS.OPEN, TASK_STATUS.ASSIGNED)).not.toThrow();
  });

  it('OPEN dan COMPLETED ga o\'tish mumkin bo\'lmasligi kerak', () => {
    expect(() => validateTransition(TASK_STATUS.OPEN, TASK_STATUS.COMPLETED)).toThrow();
  });

  it('COMPLETED dan boshqa holatga o\'tish mumkin bo\'lmasligi kerak', () => {
    Object.values(TASK_STATUS).forEach(status => {
      if (status !== TASK_STATUS.COMPLETED) {
        expect(() => validateTransition(TASK_STATUS.COMPLETED, status)).toThrow();
      }
    });
  });

  it('IN_REVIEW dan COMPLETED yoki DISPUTED ga o\'tish mumkin bo\'lishi kerak', () => {
    expect(() => validateTransition(TASK_STATUS.IN_REVIEW, TASK_STATUS.COMPLETED)).not.toThrow();
    expect(() => validateTransition(TASK_STATUS.IN_REVIEW, TASK_STATUS.DISPUTED)).not.toThrow();
  });
});
```

### Test 3: Task Service — Bid Qabul Qilish

```javascript
// src/__tests__/unit/task.service.test.js (YANGI FAYL)
jest.mock('../../config/prisma', () => require('../mocks/prisma.mock'));
jest.mock('../../config/socket', () => ({ getIO: jest.fn(() => ({ to: jest.fn(() => ({ emit: jest.fn() })) })) }));
jest.mock('../../modules/notification/notification.service', () => ({ sendNotification: jest.fn() }));

const { acceptBid } = require('../../modules/task/task.service');
const mockPrisma = require('../mocks/prisma.mock');

describe('Task Service — acceptBid', () => {
  beforeEach(() => jest.clearAllMocks());

  it('bid\'ni muvaffaqiyatli qabul qilishi kerak', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      clientId: 'client-1',
      status: 'OPEN',
      bids: [{ id: 'bid-1', freelancerId: 'freelancer-1', proposedPrice: 50000 }],
    });
    
    mockPrisma.$transaction.mockImplementation((fn) => fn(mockPrisma));
    mockPrisma.bid.update.mockResolvedValue({ id: 'bid-1', isAccepted: true });
    mockPrisma.task.update.mockResolvedValue({ id: 'task-1', status: 'ASSIGNED' });

    const result = await acceptBid('task-1', 'bid-1', 'client-1');
    
    expect(mockPrisma.bid.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'bid-1' } })
    );
    expect(mockPrisma.task.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'ASSIGNED' })
      })
    );
  });

  it('boshqa client bid qabul qila olmasligi kerak', async () => {
    mockPrisma.task.findUnique.mockResolvedValue({
      id: 'task-1',
      clientId: 'real-client',
      status: 'OPEN',
      bids: [],
    });

    await expect(acceptBid('task-1', 'bid-1', 'fake-client'))
      .rejects.toThrow();
  });
});
```

---

## [T-03] API Integration Testlar — MUHIM 🟡

```javascript
// src/__tests__/integration/auth.router.test.js (YANGI FAYL)
const request = require('supertest');
const createApp = require('../../app');

// Test uchun alohida app instansiyasi
const app = createApp();

describe('POST /api/v1/auth/telegram', () => {
  it('yaroqsiz initData uchun 401 qaytarishi kerak', async () => {
    const response = await request(app)
      .post('/api/v1/auth/telegram')
      .send({ initData: 'invalid-data' });
    
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('initData bo\'lmasa 400 qaytarishi kerak', async () => {
    const response = await request(app)
      .post('/api/v1/auth/telegram')
      .send({});
    
    expect(response.status).toBe(400);
  });
});

describe('GET /health', () => {
  it('tizim sog\'lomligini ko\'rsatishi kerak', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });
});
```

---

## [T-04] Frontend Unit Testlar — MUHIM 🟡

```javascript
// edumarket-frontend/src/__tests__/stores/authStore.test.js (YANGI FAYL)
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../../store/authStore';
import { act, renderHook } from '@testing-library/react';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout(); // Tozalash
  });

  it('login qilganda token saqlanishi kerak', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth({
        user: { id: '1', fullname: 'Test', role: 'USER' },
        token: 'test-token',
      });
    });
    
    expect(result.current.token).toBe('test-token');
    expect(result.current.user?.fullname).toBe('Test');
  });

  it('logout qilganda hammasi tozalanishi kerak', () => {
    const { result } = renderHook(() => useAuthStore());
    
    act(() => {
      result.current.setAuth({ user: { id: '1' }, token: 'token' });
      result.current.logout();
    });
    
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });
});
```

```javascript
// edumarket-frontend/src/__tests__/hooks/useTasks.test.js (YANGI FAYL)
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMyTasks } from '../../hooks/useTasks';
import { tasksApi } from '../../services/tasks.service';

vi.mock('../../services/tasks.service');

const wrapper = ({ children }) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
};

describe('useMyTasks', () => {
  it('vazifalarni yuklashi kerak', async () => {
    tasksApi.getMine.mockResolvedValue({
      data: { data: [{ id: '1', title: 'Test task', status: 'OPEN' }] }
    });
    
    const { result } = renderHook(() => useMyTasks('CLIENT'), { wrapper });
    
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});
```

**Tekshiruv:**
- `cd edumarket-backend && npm test` — barcha testlar o'tishi kerak
- `cd edumarket-frontend && npm run test:run` — barcha testlar o'tishi kerak
- Coverage kamida 60% bo'lishi kerak (boshlang'ich maqsad)

---

---

# 📦 BOSQICH 3: CI/CD PIPELINE (1-2 hafta)
> **Nima uchun uchinchi?** Testlar bo'lgandan keyin, ularni avtomatik ishlatish uchun CI/CD kerak.

---

## [C-01] GitHub Actions Workflow Yaxshilash — MUHIM 🟡

**Holat hozir:** `main.yml` mavjud lekin testlar ishlamaydi (test fayllari yo'q edi).

**Qadamlar:**

```yaml
# .github/workflows/main.yml ni to'liq almashtiring:
name: EduMarket CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

env:
  NODE_VERSION: '20'

jobs:
  # ─── BACKEND CI ──────────────────────────────────────────────
  backend-test:
    name: Backend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: edumarket-backend
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: edumarket_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: edumarket-backend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npx prisma generate
      
      - name: Run migrations (test DB)
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/edumarket_test
      
      - name: Run tests with coverage
        run: npm run test:coverage
        env:
          NODE_ENV: test
          DATABASE_URL: postgresql://test:test@localhost:5432/edumarket_test
          JWT_SECRET: test-secret-key-minimum-32-chars
          BOT_TOKEN: fake-bot-token
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          directory: ./edumarket-backend/coverage
          flags: backend

  # ─── BACKEND SECURITY AUDIT ──────────────────────────────────
  backend-security:
    name: Backend Security Audit
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: edumarket-backend
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
      - name: Security audit
        run: npm audit --audit-level high
        continue-on-error: true  # Hozircha ogohlantirishlar uchun

  # ─── FRONTEND CI ─────────────────────────────────────────────
  frontend-test:
    name: Frontend Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: edumarket-frontend
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
          cache-dependency-path: edumarket-frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint (no errors allowed)
        run: npm run lint
      
      - name: Run tests
        run: npm run test:run
        env:
          VITE_API_URL: http://localhost:3000
      
      - name: Build check
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
          VITE_SOCKET_URL: ${{ secrets.VITE_SOCKET_URL }}

  # ─── FRONTEND SECURITY ────────────────────────────────────────
  frontend-security:
    name: Frontend Security Audit
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: edumarket-frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
      - run: npm ci
      - run: npm audit --audit-level high
        continue-on-error: true

  # ─── DEPLOY STAGING (develop branch) ─────────────────────────
  deploy-staging:
    name: Deploy to Staging
    needs: [backend-test, frontend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop' && github.event_name == 'push'
    
    steps:
      - name: Deploy backend to staging
        run: echo "TODO: staging deploy script"
        # Keyin SSH yoki Render API bilan to'ldiring

  # ─── DEPLOY PRODUCTION (main branch, manual approve) ─────────
  deploy-production:
    name: Deploy to Production
    needs: [backend-test, frontend-test, backend-security, frontend-security]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    environment:
      name: production
      url: https://your-app.vercel.app  # to'g'rilang
    
    steps:
      - name: Deploy frontend (Vercel)
        run: echo "Vercel auto-deploys from main"
      
      - name: Deploy backend
        run: echo "TODO: production deploy script"
```

---

## [C-02] Pre-commit Hooks — MUHIM 🟡

**Maqsad:** Noto'g'ri kod commit qilinmasin.

```bash
# Root papkada (EduMarket/)
npm init -y
npm install --save-dev husky lint-staged

# Husky o'rnatish
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

```json
// package.json (root) ga qo'shing:
{
  "lint-staged": {
    "edumarket-frontend/src/**/*.{js,jsx}": [
      "eslint --fix",
      "vitest run --reporter=verbose"
    ],
    "edumarket-backend/src/**/*.js": [
      "node --check"
    ]
  }
}
```

**Tekshiruv:**
- `git commit` qilganda eslint avtomatik ishlasin
- Xato bo'lsa commit bloklansin

---

---

# 📦 BOSQICH 4: KOD SIFATI VA ARXITEKTURA (3-4 hafta)
> **Nima uchun to'rtinchi?** Asosiy xavfsizlik va testlar tayyor bo'lgandan keyin kod refaktoriga o'tish mumkin.

---

## [A-01] Design Token Nomuvofiqligini Hal Qilish — MUHIM 🟡

**Holat hozir:** `index.css: --radius-sm: 12px` vs `tailwind.config.js: 'sm': '6px'` — ikki joy turlicha!

**Qadamlar:**

### 1. index.css ni standartlashtirish
```css
/* edumarket-frontend/src/index.css */
:root {
  /* YAGONA MANBAA — radius tokenlar */
  --radius-sm: 8px;     /* chip, badge */
  --radius-md: 12px;    /* tugma, input */
  --radius-lg: 16px;    /* karta */
  --radius-xl: 20px;    /* katta karta */
  --radius-2xl: 24px;   /* hero karta */
  --radius-full: 9999px;
}
```

### 2. tailwind.config.js — CSS variable'lardan o'qisin
```javascript
// edumarket-frontend/tailwind.config.js
borderRadius: {
  'sm':   'var(--radius-sm)',   /* 8px */
  'md':   'var(--radius-md)',   /* 12px */
  'lg':   'var(--radius-lg)',   /* 16px */
  'xl':   'var(--radius-xl)',   /* 20px */
  '2xl':  'var(--radius-2xl)', /* 24px */
  'full': 'var(--radius-full)',
},
```

### 3. Barcha hardcoded ranglarni almashtirish
```bash
# Quyidagi buyruq hardcoded ranglarni topadi:
grep -rn "#007AFF\|#5856D6\|#10B981\|#6366F1\|#7064E2\|#059669" \
  edumarket-frontend/src/ --include="*.jsx"
```

```javascript
// Topilgan har bir faylda:
// ESKI: className="bg-[#007AFF]"
// YANGI: className="bg-edu-primary"

// ESKI: color: '#5856D6'
// YANGI: color: 'var(--edu-accent)'
```

**Tekshiruv:**
- grep buyrug'i hech qanday hardcoded rang topmasligi kerak
- Dark mode'da barcha elementlar to'g'ri ko'rinishi kerak

---

## [A-02] ProfileScreen God Component ni Ajratish — MUHIM 🟡

**Holat hozir:** `ProfileScreen.jsx` — 830 qator, 41KB, hammasi bitta faylda.

**Qadamlar:**

### Fayl tuzilmasi
```
src/screens/shared/Profile/
├── ProfileScreen.jsx           (asosiy, faqat composition)
├── ProfileHeader.jsx           (avatar, ism, badge)
├── ProfileStats.jsx            (statistika kartalar)
├── ProfilePortfolio.jsx        (portfolio grid)
├── ProfileGigs.jsx             (giglar ro'yxati)
├── ProfileEditSheet.jsx        (tahrirlash sheet)
├── ProfileSettings.jsx         (sozlamalar menu)
└── hooks/
    └── useProfileData.js       (barcha API so'rovlar)
```

### Asosiy ProfileScreen (faqat composition)
```jsx
// ProfileScreen.jsx — 50 qatordan oshmasligi kerak
import { useProfileData } from './Profile/hooks/useProfileData';
import { ProfileHeader } from './Profile/ProfileHeader';
import { ProfileStats } from './Profile/ProfileStats';
import { ProfilePortfolio } from './Profile/ProfilePortfolio';
import { ProfileGigs } from './Profile/ProfileGigs';
import { ProfileEditSheet } from './Profile/ProfileEditSheet';

export default function ProfileScreen() {
  const { user, stats, portfolio, gigs, isLoading } = useProfileData();
  const [editOpen, setEditOpen] = useState(false);

  if (isLoading) return <ProfileSkeleton />;

  return (
    <PageLayout>
      <div className="flex flex-col p-4 gap-6 pb-nav overflow-y-auto scrollbar-hide">
        <ProfileHeader user={user} onEditClick={() => setEditOpen(true)} />
        <ProfileStats stats={stats} />
        <ProfilePortfolio items={portfolio} />
        <ProfileGigs gigs={gigs} />
        <ProfileEditSheet open={editOpen} onClose={() => setEditOpen(false)} />
      </div>
    </PageLayout>
  );
}
```

### useProfileData hook
```javascript
// hooks/useProfileData.js
export function useProfileData() {
  const user = useAuthStore((s) => s.user);
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['analytics', 'me'],
    queryFn: () => analyticsApi.getMe().then(r => r.data.data),
    staleTime: 30 * 1000,
  });
  
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio', user?.id],
    queryFn: () => portfolioApi.getMyPortfolio().then(r => r.data.data),
    staleTime: 60 * 1000,
    enabled: !!user?.id,
  });
  
  const { data: gigs } = useQuery({
    queryKey: ['gigs', 'my'],
    queryFn: () => gigsApi.getAll({ freelancerId: user?.id }).then(r => r.data.data),
    enabled: !!user?.id && user?.isFreelancer,
  });

  return {
    user,
    stats,
    portfolio: portfolio?.items || [],
    gigs: gigs?.gigs || [],
    isLoading: statsLoading || portfolioLoading,
  };
}
```

---

## [A-03] Backend Service Layer — MUHIM 🟡

**Maqsad:** Controller to'g'ridan-to'g'ri Prisma'ga murojaat qilmasin.

**Holat hozir:** `task.controller.js → prisma → DB` (service layer yo'q emas, task.service.js bor lekin ba'zi modullar yo'q)

**Qadamlar — Bid module uchun misol:**

```javascript
// modules/bid/bid.repository.js (YANGI FAYL)
const prisma = require('../../config/prisma');

class BidRepository {
  async findByTaskAndFreelancer(taskId, freelancerId) {
    return prisma.bid.findUnique({
      where: { taskId_freelancerId: { taskId, freelancerId } }
    });
  }
  
  async findByTask(taskId, options = {}) {
    return prisma.bid.findMany({
      where: { taskId },
      include: {
        freelancer: {
          select: { id: true, fullname: true, avatarUrl: true, ratingSum: true, ratingCount: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      ...options
    });
  }
  
  async create(data) {
    return prisma.bid.create({ data });
  }
  
  async update(id, data) {
    return prisma.bid.update({ where: { id }, data });
  }
}

module.exports = new BidRepository();
```

```javascript
// modules/bid/bid.service.js — faqat business logika
const bidRepository = require('./bid.repository');
const taskRepository = require('../task/task.repository');
const { AppError } = require('../../middleware/errorHandler');

async function createBid(freelancerId, taskId, data) {
  // 1. Validatsiya
  const task = await taskRepository.findById(taskId);
  if (!task) throw new AppError('Vazifa topilmadi', 404);
  if (task.status !== 'OPEN') throw new AppError('Bu vazifa uchun taklif berish mumkin emas', 400);
  if (task.clientId === freelancerId) throw new AppError('O\'z vazifangizga taklif bera olmaysiz', 400);
  
  // 2. Duplikat tekshirish
  const existing = await bidRepository.findByTaskAndFreelancer(taskId, freelancerId);
  if (existing) throw new AppError('Siz allaqachon taklif bergansiz', 409);
  
  // 3. Business logika
  const bid = await bidRepository.create({
    taskId,
    freelancerId,
    message: data.message,
    proposedPrice: data.proposedPrice,
  });
  
  return bid;
}

module.exports = { createBid };
```

---

## [A-04] ESLint Xatolarni To'g'rilash — MUHIM 🟡

**Holat hozir:** `eslint-report.json` 286KB — son-sanoqsiz xatolar.

**Qadamlar:**

```bash
cd edumarket-frontend

# Birinchi avtomatik tuzatiladigan xatolarni to'g'rilash:
npx eslint src/ --fix

# Qolgan xatolar ro'yxatini ko'rish:
npx eslint src/ --format=compact > eslint-remaining.txt
```

**Eng ko'p uchraydigan muammolar va yechimlar:**

```javascript
// 1. Unused imports (eslint-plugin-unused-imports)
// ESKI: import { useState, useEffect } from 'react'; (useEffect ishlatilmagan)
// YANGI: import { useState } from 'react';

// 2. react-hooks/exhaustive-deps
// ESKI: useEffect(() => { fetchData(); }, []); // fetchData dependency'da yo'q
// YANGI: useEffect(() => { fetchData(); }, [fetchData]);

// 3. no-unused-vars
// Ishlatilmagan o'zgaruvchilarni o'chiring yoki _ bilan belgilang
const _ = unusedVar; // linting uchun underscore prefix

// 4. Missing key prop
// ESKI: items.map(item => <Item item={item} />)
// YANGI: items.map(item => <Item key={item.id} item={item} />)
```

---

---

# 📦 BOSQICH 5: TO'LOV TIZIMI (3-4 hafta)
> **Nima uchun beshinchi?** Eng katta enterprise to'sig'i. Lekin arxitektura tayyor bo'lgandan keyin qilish osonroq.

---

## [P-01] Click API Integratsiyasi — KRITIK 🔴

**Maqsad:** Manual skrinshot o'rniga real to'lov tizimi.

**Qadamlar:**

### 1. Click API o'rnatish
```bash
cd edumarket-backend
npm install axios  # allaqachon bor bo'lishi mumkin
```

### 2. Click Service
```javascript
// src/modules/payment/click.service.js (YANGI FAYL)
const crypto = require('crypto');
const { AppError } = require('../../middleware/errorHandler');

const CLICK_BASE_URL = 'https://api.click.uz/v2/merchant';
const MERCHANT_ID = process.env.CLICK_MERCHANT_ID;
const SERVICE_ID = process.env.CLICK_SERVICE_ID;
const SECRET_KEY = process.env.CLICK_SECRET_KEY;

/**
 * Click to'lov linkini yaratish
 */
function generatePaymentUrl({ orderId, amount, description, returnUrl }) {
  const signTime = Math.floor(Date.now() / 1000);
  
  // Click URL format
  const url = new URL('https://my.click.uz/services/pay');
  url.searchParams.set('service_id', SERVICE_ID);
  url.searchParams.set('merchant_id', MERCHANT_ID);
  url.searchParams.set('amount', amount);
  url.searchParams.set('transaction_param', orderId);
  url.searchParams.set('return_url', returnUrl);
  
  return url.toString();
}

/**
 * Click webhook'ni tekshirish (prepare/complete)
 */
function verifyWebhook(data) {
  const { click_trans_id, service_id, amount, action, sign_time, sign_string } = data;
  
  // Sign string yaratish
  const expectedSign = crypto
    .createHash('md5')
    .update(`${click_trans_id}${service_id}${SECRET_KEY}${data.merchant_trans_id}${amount}${action}${sign_time}`)
    .digest('hex');
  
  return expectedSign === sign_string;
}

module.exports = { generatePaymentUrl, verifyWebhook };
```

### 3. Payment Router
```javascript
// src/modules/payment/payment.router.js (YANGI FAYL)
const router = require('express').Router();
const { asyncHandler } = require('../../middleware/errorHandler');
const paymentController = require('./payment.controller');
const { requireAuth } = require('../../middleware/auth');

// To'lov yaratish (foydalanuvchi uchun)
router.post('/create', requireAuth, asyncHandler(paymentController.createPayment));

// Click webhook (Click serveridan)
router.post('/click/prepare', asyncHandler(paymentController.clickPrepare));
router.post('/click/complete', asyncHandler(paymentController.clickComplete));

// To'lov tarixi
router.get('/history', requireAuth, asyncHandler(paymentController.getHistory));

module.exports = router;
```

### 4. Payment Controller
```javascript
// src/modules/payment/payment.controller.js (YANGI FAYL)
const { generatePaymentUrl, verifyWebhook } = require('./click.service');
const paymentService = require('./payment.service');

async function createPayment(req, res) {
  const { type, packageType } = req.body; // type: 'VIP', packageType: '30_DAY'
  const userId = req.user.userId;
  
  const payment = await paymentService.initPayment(userId, { type, packageType });
  
  const paymentUrl = generatePaymentUrl({
    orderId: payment.id,
    amount: payment.amount,
    description: `EduMarket ${packageType} VIP`,
    returnUrl: `${process.env.FRONTEND_URL}/vip?status=success`,
  });
  
  res.json({
    success: true,
    data: { paymentUrl, paymentId: payment.id, amount: payment.amount }
  });
}

async function clickPrepare(req, res) {
  // Click Prepare request
  if (!verifyWebhook(req.body)) {
    return res.json({ error: -1, error_note: 'Invalid sign' });
  }
  
  try {
    await paymentService.processClickPrepare(req.body);
    res.json({
      click_trans_id: req.body.click_trans_id,
      merchant_trans_id: req.body.merchant_trans_id,
      merchant_prepare_id: req.body.merchant_trans_id,
      error: 0,
      error_note: 'Success',
    });
  } catch (err) {
    res.json({ error: -9, error_note: err.message });
  }
}

async function clickComplete(req, res) {
  // Click Complete request
  if (!verifyWebhook(req.body)) {
    return res.json({ error: -1, error_note: 'Invalid sign' });
  }
  
  try {
    await paymentService.processClickComplete(req.body);
    res.json({
      click_trans_id: req.body.click_trans_id,
      merchant_trans_id: req.body.merchant_trans_id,
      error: 0,
      error_note: 'Success',
    });
  } catch (err) {
    res.json({ error: -9, error_note: err.message });
  }
}

module.exports = { createPayment, clickPrepare, clickComplete };
```

### 5. .env ga qo'shish
```env
# Click API credentials (Click developer portaldan oling)
CLICK_MERCHANT_ID=your_merchant_id
CLICK_SERVICE_ID=your_service_id
CLICK_SECRET_KEY=your_secret_key
```

### 6. app.js ga qo'shish
```javascript
const paymentRouter = require('./modules/payment/payment.router');
app.use('/api/v1/payments', paymentRouter);
```

---

## [P-02] Prisma Schema — Payment Model Yangilash 🟡

```prisma
// schema.prisma ga qo'shish
model Payment {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  type        String   // "VIP" | "ESCROW"
  amount      Int
  currency    String   @default("UZS")
  status      String   @default("PENDING") // PENDING|PAID|FAILED|REFUNDED
  
  // Click spesifik
  clickTransId    String? @map("click_trans_id")
  clickMerchantId String? @map("click_merchant_id")
  
  // Biznes logika
  metadata    Json?    // { packageType: "30_DAY" }
  
  completedAt DateTime? @map("completed_at")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
  @@index([clickTransId])
  @@map("payments")
}
```

```bash
npx prisma migrate dev --name add_payment_model
```

---

---

# 📦 BOSQICH 6: MONITORING VA OBSERVABILITY (2-3 hafta)
> **Nima uchun oltinchi?** To'lov tizimi tayyor bo'lgandan keyin monitoring muhim — pul bog'liq xatolarni darhol bilish kerak.

---

## [M-01] Sentry'ni To'liq Sozlash — MUHIM 🟡

**Holat hozir:** Sentry o'rnatilgan lekin minimal sozlangan.

**Qadamlar:**

### 1. Frontend — To'liq Sentry konfiguratsiyasi
```javascript
// edumarket-frontend/src/main.jsx — yangilang
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  
  // Performance monitoring
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  
  // Session replay (muhim xatolar uchun)
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.05,
  
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,  // GDPR uchun
      blockAllMedia: false,
    }),
  ],
  
  // Foydalanuvchi ma'lumotlari (GDPR — shaxsiy ma'lumot o'z-o'zidan to'ldirilmasin)
  beforeSend(event) {
    // Token, parol kabilarni filtrlash
    if (event.request?.headers?.Authorization) {
      event.request.headers.Authorization = '[Filtered]';
    }
    return event;
  },
});
```

### 2. Backend — Sentry Node
```bash
cd edumarket-backend
npm install @sentry/node @sentry/profiling-node
```

```javascript
// server.js boshiga qo'shing (birinchi import):
const Sentry = require('@sentry/node');
const { nodeProfilingIntegration } = require('@sentry/profiling-node');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: 0.1,
  integrations: [nodeProfilingIntegration()],
});
```

```javascript
// app.js — error handler oldida qo'shing:
const Sentry = require('@sentry/node');

// ... boshqa middleware ...

// Sentry error handler (error handler DAN OLDIN)
Sentry.setupExpressErrorHandler(app);

// Keyin o'zimizning error handler:
app.use(errorHandler);
```

### 3. Sentry Alert Qoidalari (Sentry dashboard'da):
```
Alert 1: Error rate > 5/min → Email va Telegram
Alert 2: P95 response time > 2s → Email
Alert 3: To'lov xatosi (payment-related errors) → Darhol Telegram
Alert 4: Admin login muvaffaqiyatsiz (5+) → Telegram
```

---

## [M-02] Uptime Monitoring — TEZKOR 🟢

**Maqsad:** /health endpoint'ni monitoring qilish.

**Qadamlar:**
1. [UptimeRobot](https://uptimerobot.com) yoki [Better Uptime](https://betteruptime.com) ga kiring (Bepul plan bor)
2. Monitor qo'shing: `https://your-backend.com/health` → 5 daqiqa interval
3. Alert: Email va Telegram bot orqali
4. `/ping` endpoint ham monitoring'ga qo'shing (DB yuklama yo'q)

---

## [M-03] Grafana + Prometheus (Opsional — 8+ ball uchun) 🟢

```javascript
// edumarket-backend — prometheus metrics
npm install prom-client

// src/config/metrics.js (YANGI)
const client = require('prom-client');

const registry = new client.Registry();
client.collectDefaultMetrics({ registry });

// Custom metrics
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  registers: [registry],
});

const activeConnections = new client.Gauge({
  name: 'websocket_connections_active',
  help: 'Active WebSocket connections',
  registers: [registry],
});

// app.js ga qo'shing:
app.get('/metrics', async (req, res) => {
  // Faqat internal network'dan (production da nginx bilan himoya)
  const clientIp = req.ip;
  if (process.env.NODE_ENV === 'production' && !clientIp.includes('127.0.0.1')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.set('Content-Type', registry.contentType);
  res.end(await registry.metrics());
});
```

---

---

# 📦 BOSQICH 7: UI/UX TO'G'RILASHLAR (1-2 hafta)
> **Nima uchun yettinchi?** Funksional muammolar hal bo'lgandan keyin UI polish qilish.

---

## [U-01] Loading State Granular Qilish — MUHIM 🟡

**Holat hozir:**
```javascript
// ClientHomeScreen.jsx — BAD
const isLoading = isLeaderboardLoading || !myTasks || !conversations;
if (isLoading) return <ClientHomeSkeleton />;  // Hammasi bitta skeleton
```

**Yangi yondashuv:**
```jsx
// YAXSHI — har bir section o'z skeletoniga ega
export default function ClientHomeScreen() {
  const { data: myTasks } = useMyTasks('CLIENT');
  const { data: leaderboardData, isLoading: isLeaderboardLoading } = useQuery({...});
  const { data: conversations } = useQuery({...});

  return (
    <div className="...">
      <HomeTopBar greeting="Xush kelibsiz 👋" />
      
      {/* Quick Actions — har doim ko'rinadi, loading yo'q */}
      <QuickActionsGrid />
      
      {/* Task Status — myTasks yuklanguncha skeleton */}
      {!myTasks ? (
        <TaskStatusSkeleton />
      ) : (
        <TaskStatusWidget tasks={myTasks} />
      )}
      
      {/* Leaderboard — alohida skeleton */}
      {isLeaderboardLoading ? (
        <LeaderboardSkeleton />
      ) : (
        <TopFreelancers data={leaderboardData} />
      )}
      
      {/* Chat — conversations yuklanguncha skeleton */}
      {!conversations ? (
        <ChatSkeleton />
      ) : conversations.length > 0 ? (
        <RecentChat chat={conversations[0]} />
      ) : null}
    </div>
  );
}
```

---

## [U-02] Network Error va Offline State — MUHIM 🟡

**Maqsad:** Internet yo'q bo'lganda foydalanuvchi xabar ko'rsin.

```javascript
// hooks/useNetworkStatus.js (YANGI FAYL)
import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}
```

```jsx
// components/ui/NetworkBanner.jsx (YANGI FAYL)
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export function NetworkBanner() {
  const isOnline = useNetworkStatus();
  
  if (isOnline) return null;
  
  return (
    <div className="fixed top-0 inset-x-0 z-50 bg-edu-urgent text-white
                    py-2 px-4 flex items-center justify-center gap-2
                    text-xs font-bold">
      <WifiOff size={14} />
      Internet aloqasi yo'q
    </div>
  );
}

// App.jsx da ishlatish:
// <NetworkBanner />
```

---

## [U-03] Touch Target Kattalashtirish — MUHIM 🟡

```jsx
// Barcha kichik tugma va icon buttonlarda:

// ESKI (kichik):
<button onClick={handleClose} className="w-8 h-8">
  <X size={16} />
</button>

// YANGI (WCAG muvofiq):
<button 
  onClick={handleClose} 
  className="w-11 h-11 flex items-center justify-center
             rounded-full hover:bg-edu-surface-2 
             active:scale-90 transition-transform"
  aria-label="Yopish"
>
  <X size={18} />
</button>
```

---

## [U-04] Error Boundary Granular Qilish — MUHIM 🟡

**Holat hozir:** Bitta `ErrorBoundary` butun ilovani qayta yuklaydi.

```jsx
// components/layout/SectionErrorBoundary.jsx (YANGI FAYL)
import { Component } from 'react';

class SectionErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, info) {
    // Sentry'ga yuborish
    import('@sentry/react').then(Sentry => {
      Sentry.captureException(error, { extra: info });
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-edu-urgent/5 border border-edu-urgent/20 
                        rounded-2xl p-4 text-center">
          <p className="text-sm font-bold text-edu-urgent">Bu bo'lim yuklanmadi</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="mt-2 text-xs font-bold text-edu-primary 
                       active:scale-95 transition-transform"
          >
            Qayta urinish
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Ishlatish:
// <SectionErrorBoundary>
//   <TopFreelancers />
// </SectionErrorBoundary>
```

---

## [U-05] Accessibility — Icon Buttons 🟢

```bash
# Barcha icon-only tugmalarni toping:
grep -rn "onClick" edumarket-frontend/src/ --include="*.jsx" |
  grep -v "aria-label" |
  grep "size={" | head -20
```

```jsx
// Topilgan har bir icon buttonga aria-label qo'shing:

// ESKI:
<button onClick={handleBell}><Bell size={20} /></button>

// YANGI:
<button onClick={handleBell} aria-label="Bildirishnomalar">
  <Bell size={20} />
</button>
```

---

---

# 📦 BOSQICH 8: HUJJATLAR (1-2 hafta)
> **Nima uchun oxirgi?** Hujjatlar eng tez eskiradi, shuning uchun barcha o'zgarishlar bo'lgandan keyin yoziladi.

---

## [D-01] OpenAPI Swagger Hujjati — MUHIM 🟡

```bash
cd edumarket-backend
npm install swagger-ui-express swagger-jsdoc
```

```javascript
// src/config/swagger.js (YANGI FAYL)
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EduMarket API',
      version: '1.0.0',
      description: 'EduMarket Telegram Mini App API hujjati',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development' },
      { url: 'https://your-backend.com', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.router.js', './src/modules/**/*.schema.js'],
};

module.exports = swaggerJsdoc(options);
```

```javascript
// app.js ga qo'shing:
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// Faqat development va staging'da
if (!env.isProd) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

```javascript
// Misol: auth.router.js'ga JSDoc qo'shing
/**
 * @swagger
 * /api/v1/auth/telegram:
 *   post:
 *     summary: Telegram orqali kirish
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [initData]
 *             properties:
 *               initData:
 *                 type: string
 *                 description: Telegram Mini App initData string
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli kirish
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string }
 *                     user: { $ref: '#/components/schemas/User' }
 *       401:
 *         description: Yaroqsiz initData
 */
```

**Tekshiruv:**
- `http://localhost:3000/api-docs` — Swagger UI ko'rinishi kerak
- Barcha API endpoint'lar hujjatlangan bo'lishi kerak

---

## [D-02] Architecture Decision Records (ADR) 🟢

```markdown
# docs/adr/ papkasini yarating, har bir katta qaror uchun:

# docs/adr/001-telegram-mini-app.md
# ADR 001: Telegram Mini App Platform

**Holat:** Qabul qilingan
**Sana:** 2026-XX-XX

## Muammo
EduMarket qaysi platformada bo'lishi kerak?

## Tanlov
Telegram Mini App (TMA) tanlandi.

## Sabab
1. O'zbekistonda Telegram foydalanuvchi bazasi katta (80%+)
2. App store approval jarayoni yo'q
3. Telegram initData orqali autentifikatsiya built-in
4. Push notification built-in (Telegram bot)

## Salbiy tomonlar
- Faqat Telegram foydalanuvchilari
- Web app UX imkoniyatlari cheklangan
- Telegram API o'zgarishi ta'sir qilishi mumkin
```

---

## [D-03] Runbook (Operatsion Qo'llanma) — MUHIM 🟡

```markdown
# docs/RUNBOOK.md

# EduMarket Operatsion Qo'llanma

## Tezkor muammolar

### Backend ishlamay qoldi
1. Sentry'da xatoni toping
2. `pm2 logs edumarket-backend` — log tekshiring
3. `pm2 restart edumarket-backend` — restart
4. Agar ishlamasa: `pm2 delete edumarket-backend && pm2 start ecosystem.config.js`

### Database'ga ulanib bo'lmaydi
1. `psql -U postgres -d edumarket -c "SELECT 1"` — test
2. Connection pool dolg'amining maksimumiga etib qolmaganini tekshiring
3. `SELECT count(*) FROM pg_stat_activity` — faol ulanishlar

### Redis ishlamay qoldi
1. `redis-cli ping` — PONG qaytishi kerak
2. `sudo systemctl restart redis`
3. Redis yo'q bo'lsa ham tizim ishlashini tekshiring (MemoryStore fallback bor)

### To'lov kelmadi (Click webhook)
1. Click dashboard'dan webhook log'larini tekshiring
2. `/api/v1/payments/history` dan status tekshiring
3. Manual update kerak bo'lsa admin panel'dan
```

---

---

# 🎯 TEKSHIRUV RO'YXATI (Katta Checklist)

## Bosqich 1 — Xavfsizlik ✅/❌
```
[ ] S-01: admin@123 parol o'chirilgan, bcrypt hash ishlatilmoqda
[ ] S-01: ADMIN_USERNAME va ADMIN_PASSWORD_HASH .env'da
[ ] S-02: Logout endpoint mavjud va Redis blacklist ishlayapti
[ ] S-03: AdminBroadcast DOMPurify bilan tozalanmoqda
[ ] S-04: Admin login uchun alohida rate limiter (5/15min)
[ ] S-05: DELETE /api/v1/users/me endpoint ishlayapti
[ ] S-05: Deleted user fullname "Deleted User" bo'lyapti
```

## Bosqich 2 — Testing ✅/❌
```
[ ] T-01: jest.config.js yaratilgan
[ ] T-01: npm test ishlayapti
[ ] T-02: auth.service.test.js yozilgan va o'tyapti
[ ] T-02: task.stateMachine.test.js yozilgan va o'tyapti
[ ] T-02: task.service.test.js yozilgan va o'tyapti (bid accept)
[ ] T-03: auth.router.test.js yozilgan (integration)
[ ] T-04: authStore.test.js yozilgan
[ ] T-04: useTasks.test.js yozilgan
[ ] Coverage: kamida 60% backend, 50% frontend
```

## Bosqich 3 — CI/CD ✅/❌
```
[ ] C-01: main.yml yangilangan (postgres service bilan)
[ ] C-01: Test job'lar ishlamoqda
[ ] C-01: Security audit job bor
[ ] C-01: Production deploy manual approve talab qiladi
[ ] C-02: Husky o'rnatilgan
[ ] C-02: Pre-commit hook ishlayapti
[ ] C-02: git commit qilganda lint xato ko'rsatadi
```

## Bosqich 4 — Arxitektura ✅/❌
```
[ ] A-01: index.css va tailwind.config.js radius tokenlari bir xil
[ ] A-01: grep bilan hardcoded ranglar topilmaydi
[ ] A-02: ProfileScreen.jsx 5 ta kichik komponentga ajratilgan
[ ] A-02: useProfileData.js hook yaratilgan
[ ] A-03: bid.repository.js yaratilgan
[ ] A-03: bid.service.js repository'dan foydalanmoqda
[ ] A-04: eslint --fix bajarilgan
[ ] A-04: Qolgan xatolar 50% kamaygan
```

## Bosqich 5 — To'lov ✅/❌
```
[ ] P-01: click.service.js yaratilgan
[ ] P-01: payment.router.js yaratilgan
[ ] P-01: /api/v1/payments/create ishlayapti
[ ] P-01: Click webhook endpoint'lar bor
[ ] P-02: Payment Prisma modeli yaratilgan
[ ] P-02: Migration bajarilgan
[ ] P-02: .env da Click credentials bor
[ ] Click test to'lov muvaffaqiyatli bo'ldi
```

## Bosqich 6 — Monitoring ✅/❌
```
[ ] M-01: Sentry tracesSampleRate sozlangan
[ ] M-01: Sentry replay integratsiya bor
[ ] M-01: Backend Sentry.init() ishlayapti
[ ] M-01: Sentry'da alert qoidalari sozlangan
[ ] M-02: UptimeRobot /health monitoring'da
[ ] M-02: Downtime uchun email/Telegram alert bor
```

## Bosqich 7 — UI/UX ✅/❌
```
[ ] U-01: ClientHomeScreen granular loading state
[ ] U-01: Har bir section o'z skeleton'iga ega
[ ] U-02: NetworkBanner komponenti yaratilgan
[ ] U-02: App.jsx da NetworkBanner qo'shilgan
[ ] U-03: Barcha icon tugmalar 44px touch target
[ ] U-04: SectionErrorBoundary yaratilgan
[ ] U-04: Asosiy sectionlar SectionErrorBoundary ichida
[ ] U-05: Icon-only tugmalar aria-label'ga ega
```

## Bosqich 8 — Hujjatlar ✅/❌
```
[ ] D-01: swagger.js yaratilgan
[ ] D-01: /api-docs ishlayapti (development'da)
[ ] D-01: auth endpoint hujjatlangan
[ ] D-01: task endpoint hujjatlangan
[ ] D-02: docs/adr/ papkasi va 3+ ADR fayl
[ ] D-03: docs/RUNBOOK.md yaratilgan
[ ] D-03: Asosiy muammo va yechimlar yozilgan
```

---

## 📊 BOSQICHLAR OXIRIDA KUTILAYOTGAN BALL

| Bosqich | Bajarilgandan keyin ball |
|:--------|:------------------------|
| Boshlang'ich | 3.6/10 |
| + Bosqich 1 (Xavfsizlik) | 5.0/10 |
| + Bosqich 2 (Testing) | 6.0/10 |
| + Bosqich 3 (CI/CD) | 6.5/10 |
| + Bosqich 4 (Arxitektura) | 7.0/10 |
| + Bosqich 5 (To'lov) | 7.8/10 |
| + Bosqich 6 (Monitoring) | 8.2/10 |
| + Bosqich 7 (UI/UX) | 8.5/10 |
| + Bosqich 8 (Hujjatlar) | **8.8/10** |

---

## ⚠️ MUHIM ESLATMALAR

1. **Tartibni buzmang** — Xavfsizlik birinchi. Testing ikkinchi. Boshqa tartibda qilsangiz, o'zingizni xatarga qo'yasiz.

2. **Har bosqichni commit qiling** — Har bir vazifa tugagandan keyin `git commit -m "feat: [VAZIFA-ID] nomi"` qiling.

3. **Testlarni hech qachon o'chirmang** — CI/CD pipeline'da test ishlamasa, deploy bo'lmasin.

4. **To'lov tizimida ehtiyotkor bo'ling** — Click webhook'larni production'da sinashdan oldin Click sandbox'da sinab ko'ring.

5. **Monitoring birinchi, keyin deploy** — Yangi funksiya qo'shayotganda monitoring tayyor bo'lsin.

---

*EduMarket Enterprise Roadmap v1.0 | 2026-06-09*  
*Har bir bosqich to'liq bajarilgandan keyingina keyingisiga o'ting.*
