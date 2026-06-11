# EduMarket — UX & User Flow Bible
> **Versiya:** 1.0 | **Sana:** 2026-06-09
> **Maqsad:** Har bir foydalanuvchi oqimini, qaror nuqtalarini va ekran o'tishlarini aniq belgilash.
> **Qoida:** Har qanday yangi screen yoki flow qo'shishda bu hujjatdan ko'rsatma olinishi MAJBURIY.

---

## MUNDARIJA

1. [UX Falsafasi va Tamoyillar](#1-ux-falsafasi-va-tamoyillar)
2. [Foydalanuvchi Rollari](#2-foydalanuvchi-rollari)
3. [Ekranlar Xaritasi (Screen Map)](#3-ekranlar-xaritasi)
4. [Auth & Onboarding Flow](#4-auth--onboarding-flow)
5. [Client Flow — Topshiriq berish](#5-client-flow--topshiriq-berish)
6. [Freelancer Flow — Topshiriq olish](#6-freelancer-flow--topshiriq-olish)
7. [Topshiriq Hayot Sikli (Task Lifecycle)](#7-topshiriq-hayot-sikli)
8. [Chat Flow](#8-chat-flow)
9. [To'lov va Escrow Flow](#9-tolov-va-escrow-flow)
10. [Review Flow](#10-review-flow)
11. [Admin Flow](#11-admin-flow)
12. [Notification Flow](#12-notification-flow)
13. [Error va Edge Case Flowlar](#13-error-va-edge-case-flowlar)
14. [UX Metrics va KPIlar](#14-ux-metrics-va-kpilar)
15. [Ekran Yaratish Checklist](#15-ekran-yaratish-checklist)

---

## 1. UX FALSAFASI VA TAMOYILLAR

### 1.1 EduMarket UX Asosiy Tamoyillari

| Tamoyil | Ta'rif | Qanday amalga oshiriladi |
|:--------|:-------|:------------------------|
| **Zero Friction** | Har bir qadam foydalanuvchini maqsadiga yaqinlashtirsin, uzoqlashtirib qo'ymasin | 3 tap qoidasi — istalgan asosiy amal 3 ta bosishda bajarilishi kerak |
| **Trust by Design** | Platforma ishonchli ko'rinishi kerak, ayniqsa pul almashilganda | Escrow badge, rating ko'rsatkichlari, verified status har joyda |
| **Native Feel** | Foydalanuvchi ilovada emas, Telegram ichida o'zini qulay his qilsin | iOS spring animatsiyalar, haptic feedback, native gesture-lar |
| **Progressive Disclosure** | Foydalanuvchiga bir vaqtda hamma ma'lumotni berma — kerakligini ko'rsat | Kengaytirilgan detallar faqat kerak bo'lganda |
| **Error Prevention** | Xatoni tuzatishdan ko'ra oldini olish afzal | Destructive amallar oldidan tasdiqlash, form validation real-time |

### 1.2 Foydalanuvchi Motivatsiyalari

**Client (Topshiriq beruvchi):**
- Tezda ishonchli ijrochi topmoqchi
- Narxni nazorat qilmoqchi
- Ish sifatiga kafolat olmoqchi

**Freelancer (Ijrochi):**
- Daromad topmoqchi
- Portfolio qurmoqchi
- Reputatsiya oshirmoqchi

### 1.3 "3 Tap" Qoidasi

```
QOIDA: Har qanday asosiy amal maksimum 3 ta bosishda bajarilishi SHART.

✅ TO'G'RI:
Home → [+] Task → Form → Submit (3 tap)

✅ TO'G'RI:
Home → Task Card → Bid (3 tap)

❌ NOTO'G'RI:
Home → Tasks → Filter → Category → Task Detail → Bid → Confirm (6 tap)
```

### 1.4 Micro-interaction Standartlari

```
PULL-TO-REFRESH:
- Barcha ro'yxat sahifalarida MAJBURIY
- Threshold: 60px
- Animatsiya: spinner + haptic (light)

SWIPE-TO-DISMISS:
- Bottom sheet'lar uchun MAJBURIY
- Swipe down → yopish

LONG PRESS:
- Task cardda: context menu (Nusxalash, Ulashish)
- Chat messageda: reaction + Copy

TAP FEEDBACK:
- Har qanday tap: scale(0.96) + opacity 0.85
- Duration: 120ms
- Haptic: light impact
```

---

## 2. FOYDALANUVCHI ROLLARI

### 2.1 Rol Matritsasi

| Rol | Telegram Auth | Imkoniyatlar | Cheklovlar |
|:----|:-------------|:-------------|:----------|
| **Yangi foydalanuvchi** | ✅ | Ilovani ko'rish, ro'yxatdan o'tish | Topshiriq bera/ola olmaydi |
| **Client** | ✅ | Topshiriq yaratish, bid qabul qilish, to'lov | Bid bera olmaydi |
| **Freelancer** | ✅ | Bid berish, topshiriq bajarish | Topshiriq yarata olmaydi |
| **VIP Freelancer** | ✅ | Yuqori qidiruv pozitsiyasi, badge, featured | Qo'shimcha narx |
| **Admin** | ✅ + Parol | Barcha amallar, dispute, ban, broadcast | Alohida admin panel |

### 2.2 Rol Tanlash Oqimi

```
Yangi foydalanuvchi kiradi
          │
          ▼
    Onboarding Screen
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
 CLIENT     FREELANCER
    │           │
    ▼           ▼
Home (Green) Home (Indigo)
```

> **UX Qaror:** Rol tanlash keyinchalik o'zgartirib bo'lmaydi (Settings → Role Switch faqat admin ruxsati bilan). Bu fraud oldini oladi.

---

## 3. EKRANLAR XARITASI

### 3.1 To'liq Ekran Hierarxiyasi

```
APP
├── ONBOARDING (faqat birinchi marta)
│   ├── Welcome Screen
│   ├── Role Selection Screen
│   ├── Profile Setup Screen
│   └── Skills/Category Screen (Freelancer)
│
├── AUTH
│   └── Telegram Auto-Login (botdan initData)
│
├── CLIENT WORKSPACE
│   ├── 🏠 Home (ClientHomeScreen)
│   │   ├── Active Tasks Summary
│   │   ├── Quick Actions
│   │   └── Leaderboard Preview
│   │
│   ├── 📋 Tasks (ClientTasksScreen)
│   │   ├── Active Tasks Tab
│   │   ├── Completed Tasks Tab
│   │   └── ➕ Create Task → CreateTaskScreen
│   │
│   ├── 💬 Chat (ChatListScreen)
│   │   └── → ChatScreen
│   │
│   ├── 🔔 Notifications (NotificationScreen)
│   │
│   └── 👤 Profile (ProfileScreen)
│       ├── Edit Profile → EditProfileSheet
│       ├── My Reviews
│       ├── Transaction History
│       └── Settings
│
├── FREELANCER WORKSPACE
│   ├── 🏠 Home (FreelancerHomeScreen)
│   │   ├── Available Tasks Feed
│   │   ├── My Stats
│   │   └── Featured Tasks
│   │
│   ├── 🔍 Browse (BrowseTasksScreen)
│   │   ├── Search Bar
│   │   ├── Filters (Category, Budget, Deadline)
│   │   └── Task Cards
│   │
│   ├── 📋 My Work (FreelancerTasksScreen)
│   │   ├── Active Bids Tab
│   │   ├── In Progress Tab
│   │   └── Completed Tab
│   │
│   ├── 💬 Chat (ChatListScreen) [shared]
│   │
│   ├── 🔔 Notifications [shared]
│   │
│   └── 👤 Profile (ProfileScreen)
│       ├── Portfolio
│       ├── Skills & Categories
│       ├── VIP Upgrade → VipUpgradeScreen
│       └── Reviews
│
├── SHARED SCREENS
│   ├── TaskDetailScreen
│   ├── BidDetailScreen
│   ├── UserProfileScreen (boshqa foydalanuvchi profili)
│   ├── DisputeScreen
│   └── ReviewSubmitScreen
│
└── ADMIN PANEL (alohida route /admin)
    ├── Dashboard
    ├── Tasks Management
    ├── Users Management
    ├── Disputes
    ├── VIP Approvals
    └── Broadcast
```

### 3.2 Navigatsiya Turlari

| Tur | Qachon ishlatiladi | Animatsiya |
|:----|:------------------|:----------|
| **Tab navigation** | Asosiy 4 tab o'rtasida | Fade |
| **Push navigation** | Detail ekranlariga o'tish | Slide left |
| **Bottom Sheet** | Form, confirm, filter | Slide up |
| **Modal** | Tasdiqlash, alert | Fade + scale |
| **Replace** | Onboarding → Home | Fade |

---

## 4. AUTH & ONBOARDING FLOW

### 4.1 To'liq Auth Flow

```
Telegram foydalanuvchisi botni ochadi
              │
              ▼
    Telegram Mini App ishga tushadi
              │
              ▼
    initData backend'ga yuboriladi
              │
      ┌───────┴────────┐
      │                │
      ▼                ▼
  HMAC valid?       HMAC invalid?
      │                │
      ▼                ▼
  JWT token        401 Error
  beriladi         "Telegram orqali
      │             kiring" xabari
      ▼
  User DB'da bormi?
      │
   ┌──┴──┐
   │     │
   ▼     ▼
 BOR   YO'Q
   │     │
   ▼     ▼
 Home  ONBOARDING
```

### 4.2 Onboarding Flow (Yangi foydalanuvchi)

```
SCREEN 1: Welcome
┌─────────────────────────────┐
│  🎓 EduMarket               │
│                             │
│  "O'zbekistondagi talabalar │
│   uchun birinchi akademik   │
│   marketplace"              │
│                             │
│  [Boshlash →]               │
└─────────────────────────────┘
       │ tap
       ▼

SCREEN 2: Role Selection
┌─────────────────────────────┐
│  Siz kim sifatida           │
│  ishlaysiz?                 │
│                             │
│  ┌──────────┐ ┌──────────┐  │
│  │ 🎯       │ │ 💼       │  │
│  │ Buyurtma │ │ Ijrochi  │  │
│  │ beruvchi │ │          │  │
│  └──────────┘ └──────────┘  │
│                             │
│  (bitta tanlash majburiy)   │
└─────────────────────────────┘
       │ tap (Client yoki Freelancer)
       ▼

SCREEN 3: Profile Setup
┌─────────────────────────────┐
│  Profilingizni to'ldiring   │
│                             │
│  [Avatar]                   │
│  Ism (Telegram'dan avtom.)  │
│  Telefon ✓                  │
│  Universitet [Tanlang ▼]    │
│  Kurs [1-4 ▼]               │
│                             │
│  [Davom etish →]            │
└─────────────────────────────┘
       │ (Freelancer uchun 4-screen bor)
       ▼

SCREEN 4 (FREELANCER ONLY): Skills
┌─────────────────────────────┐
│  Qaysi sohalarda            │
│  ishlay olasiz?             │
│                             │
│  [Matematika ×]             │
│  [Dasturlash ×]             │
│  [Fizika    ]               │
│  [Til       ]               │
│  [Dizayn    ]               │
│  + Boshqa qo'shish          │
│                             │
│  [Boshlash →]               │
└─────────────────────────────┘
       │
       ▼
     HOME
```

**UX Qarorlar:**
- Onboarding skip qilib bo'lmaydi — ma'lumot to'liq kerak
- Progress indicator (1/3, 2/3, 3/3) har doim ko'rinadi
- "Orqaga" tugmasi bor — foydalanuvchi qaytib o'zgartira oladi
- Telegram username/name avtomatik to'ldiriladi

### 4.3 Re-login Flow

```
Sessiya tugagan (token expired 7 kun)
              │
              ▼
    App ochilganda auto-refresh
              │
    Telegram initData yangi token
              │
              ▼
    Foydalanuvchi hech narsa sezmaydi
    (seamless re-auth)
```

---

## 5. CLIENT FLOW — TOPSHIRIQ BERISH

### 5.1 Topshiriq Yaratish Flow

```
ClientHome → [+ Yangi topshiriq] CTA
              │
              ▼
    CreateTaskScreen (Bottom Sheet yoki Full Screen)

STEP 1: Asosiy ma'lumot
┌─────────────────────────────┐
│  ← Topshiriq yaratish       │
│  ●──○──○──○  (1/4)          │
│                             │
│  Sarlavha *                 │
│  [                        ] │
│                             │
│  Tavsif *                   │
│  [                        ] │
│  [                        ] │
│                             │
│  Kategoriya *               │
│  [Tanlang ▼               ] │
│                             │
│  [Davom etish →]            │
└─────────────────────────────┘
       │
       ▼

STEP 2: Byudjet va Muddat
┌─────────────────────────────┐
│  ← Topshiriq yaratish       │
│  ●──●──○──○  (2/4)          │
│                             │
│  Byudjet (so'm) *           │
│  [     50,000             ] │
│  ← Taklif: 25,000-100,000   │
│                             │
│  Muddat *                   │
│  [ 📅 2026-06-15           ]│
│                             │
│  Shoshilinch? [toggle]      │
│                             │
│  [Davom etish →]            │
└─────────────────────────────┘
       │
       ▼

STEP 3: Fayl yuklash (ixtiyoriy)
┌─────────────────────────────┐
│  ← Topshiriq yaratish       │
│  ●──●──●──○  (3/4)          │
│                             │
│  Qo'shimcha materiallar     │
│                             │
│  [📎 Fayl yuklash]          │
│  yoki                       │
│  [📷 Rasm olish]            │
│                             │
│  Yuklab bo'ldi:             │
│  📄 task.pdf  ×             │
│                             │
│  [O'tkazish] [Davom etish→] │
└─────────────────────────────┘
       │
       ▼

STEP 4: Ko'rib chiqish va Tasdiqlash
┌─────────────────────────────┐
│  ← Topshiriq yaratish       │
│  ●──●──●──●  (4/4)          │
│                             │
│  📋 Integral hisoblash      │
│  💰 50,000 so'm             │
│  📅 15 iyun 2026            │
│  📁 1 ta fayl               │
│                             │
│  ⚠️ E'lon qilgandan keyin   │
│  faqat adminlargina         │
│  o'zgartira oladi           │
│                             │
│  [E'lon qilish ✓]           │
└─────────────────────────────┘
       │
       ▼
  Topshiriq OPEN holatida
  Notification: "Topshirig'ingiz muvaffaqiyatli e'lon qilindi"
```

### 5.2 Bid Qabul Qilish Flow

```
OPEN topshiriqqa bidlar keladi
              │
              ▼
    Notification: "Yangi taklif keldi"
              │
              ▼
    Task Detail → Bids Tab
              │
              ▼
┌─────────────────────────────┐
│  Takliflar (3)              │
│                             │
│  ┌─────────────────────┐    │
│  │ 👤 Ali Valiyev      │    │
│  │ ⭐ 4.8 (24 sharh)   │    │
│  │ 💰 45,000 so'm      │    │
│  │ ⏱️ 3 kun            │    │
│  │ "Men bu masalani..." │   │
│  │ [Profil] [Qabul ✓]  │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 👤 Bobur Toshmatov  │    │
│  │ ⭐ 4.2 (8 sharh)    │    │
│  │ 💰 55,000 so'm      │    │
│  │ [Profil] [Qabul ✓]  │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
       │ "Qabul ✓" tap
       ▼
    Confirmation Modal:
    "Ali Valiyev — 45,000 so'm.
     Tasdiqlaysizmi?"
    [Bekor] [Ha, qabul qilaman]
       │
       ▼
    Task → ASSIGNED holat
    Freelancer'ga notification
    Chat avtomatik ochiladi
```

---

## 6. FREELANCER FLOW — TOPSHIRIQ OLISH

### 6.1 Topshiriq Qidirish Flow

```
FreelancerHome → Tasks Feed
              │
              ▼
┌─────────────────────────────┐
│  🔍 Qidirish...             │
│  [Hammasi] [Matematika] ... │
│                             │
│  ┌─────────────────────┐    │
│  │ 📐 Integral masalasi│    │
│  │ 💰 50,000 so'm  🔴  │    │
│  │ ⏱️ 2 kun qoldi      │    │
│  │ 👤 Jasur M. (Client)│    │
│  │ 📎 1 fayl           │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ 💻 Python homework  │    │
│  │ 💰 80,000 so'm      │    │
│  │ ⏱️ 3 kun qoldi      │    │
│  └─────────────────────┘    │
└─────────────────────────────┘

Filter botton sheet:
[ ] Kategoriya
[ ] Min narx _______ so'm
[ ] Max narx _______ so'm
[ ] Muddati (bugun/ertaga/1hafta)
[ ] Faqat yangilar
[Filterni qo'llash]
```

### 6.2 Bid Berish Flow

```
Task Card → tap
              │
              ▼
    TaskDetailScreen
              │
┌─────────────────────────────┐
│  ← Topshiriq tafsiloti      │
│                             │
│  📐 Integral hisoblash      │
│  💰 Byudjet: 50,000 so'm    │
│  📅 Muddat: 15 iyun 2026    │
│  👤 Jasur Mirzayev          │
│     ⭐ 4.5 (12 topshiriq)   │
│                             │
│  📄 Tavsif                  │
│  "..."                      │
│                             │
│  📎 Fayllar (1)             │
│  [task.pdf ↓]               │
│                             │
│  👥 4 ta taklif bor         │
│                             │
│  [💼 Taklif berish]         │
└─────────────────────────────┘
       │ "Taklif berish" tap
       ▼
    BidSheet (Bottom Sheet)
┌─────────────────────────────┐
│  ▄▄▄▄▄  Taklif berish       │
│                             │
│  Narxingiz *                │
│  [   45,000        ] so'm   │
│  ← Client: 50,000 so'm      │
│                             │
│  Muddatingiz *              │
│  [📅 2026-06-14           ] │
│                             │
│  Xabaringiz *               │
│  [Men bu masalani           │
│   matematika PhD talabasi   │
│   sifatida yechib beraman]  │
│                             │
│  [Taklif yuborish →]        │
└─────────────────────────────┘
       │
       ▼
    Success Toast: "Taklifingiz yuborildi!"
    Task "Bids" tabida ko'rinadi
```

### 6.3 Ish Bajarish Flow

```
Bid accepted (Client tomonidan)
              │
              ▼
    Notification: "Taklifingiz qabul qilindi!"
              │
              ▼
    Task → IN_PROGRESS holat
              │
              ▼
    Chat avtomatik ochiladi
    Client bilan muloqot
              │
              ▼
    Natija tayyor bo'lganda:
    Task Detail → [Natija yuborish]
              │
              ▼
    SubmitResultSheet:
    [📎 Fayl yuklash]
    [Izoh yozing...]
    [Natijani yuborish →]
              │
              ▼
    Task → IN_REVIEW holat
    Client'ga notification
```

---

## 7. TOPSHIRIQ HAYOT SIKLI

### 7.1 Task State Machine (UX Ko'rinishi)

```
                    ┌─────────────────────────────────────────────┐
                    │           TASK LIFECYCLE                     │
                    └─────────────────────────────────────────────┘

  [CLIENT yaratadi]
        │
        ▼
   ┌──────────┐     Bid yo'q va muddat o'tdi      ┌──────────────┐
   │  OPEN    │ ────────────────────────────────► │  EXPIRED     │
   │ 🟢 Ochiq │                                   │  ⬛ Muddati   │
   └──────────┘                                   │  o'tgan      │
        │                                          └──────────────┘
        │ Client bid qabul qiladi
        ▼
   ┌──────────┐
   │ ASSIGNED │
   │ 🔵 Tayın.│
   └──────────┘
        │
        │ Freelancer "Boshlayman" bosadi
        ▼
   ┌───────────┐
   │IN_PROGRESS│
   │ 🔵 Jaray.│
   └───────────┘
        │                                          ┌──────────────┐
        │ Freelancer natija yuboradi               │   DISPUTED   │
        ▼                                          │ 🔴 Munozara  │
   ┌──────────┐     Client rad etadi  ────────────►│              │
   │ IN_REVIEW│                                   │ Admin hal    │
   │ 🟡 Ko'r. │                                   │ qiladi       │
   └──────────┘                                   └──────────────┘
        │                                                │
        │ Client qabul qiladi                           │
        │ YOKI 48 soat o'tadi (auto-complete)           │
        ▼                                               │
   ┌───────────┐ ◄──────────────────────────────────────┘
   │ COMPLETED │   (Admin hal qilgandan keyin)
   │ ✅ Yakunl.│
   └───────────┘
        │
        ▼
   Ikki tomon ham review yozadi (MAJBURIY)
```

### 7.2 Har bir Holat uchun UI

| Holat | Badge rangi | Client ko'radi | Freelancer ko'radi |
|:------|:-----------|:--------------|:-------------------|
| `OPEN` | 🟢 Yashil | Bidlar ro'yxati | Task feedda ko'rinadi |
| `ASSIGNED` | 🔵 Ko'k | "Kutilmoqda" | "Boshlashim kerak" |
| `IN_PROGRESS` | 🔵 Ko'k | Progress tracker | Natija yuklash knopkasi |
| `IN_REVIEW` | 🟡 To'q sariq | "Qabul/Rad" tugmalar | "Ko'rib chiqilmoqda" |
| `COMPLETED` | ✅ Yashil | Review yozing | Review yozing |
| `DISPUTED` | 🔴 Qizil | Sabab ko'rish | Admin javobini kutish |
| `CANCELED` | ⬛ Kulrang | Arxiv | Arxiv |

---

## 8. CHAT FLOW

### 8.1 Chat Ochilishi

```
Chat faqat quyidagi holatlarda ochiladi:
- Task ASSIGNED bo'lganda (avtomatik)
- Client bid qabul qilganda

Chat yopilishi:
- Task COMPLETED yoki CANCELED bo'lganda
- (Arxivga o'tadi, o'qish mumkin)
```

### 8.2 Chat Screen UX

```
┌─────────────────────────────┐
│ ← Ali Valiyev      📋 Task  │
│   🟢 Online                 │
│─────────────────────────────│
│                             │
│   [Integral topshiriqni    ]│
│   [ko'rib chiqdim...]      ]│
│                    14:32    │
│                             │
│ [Ha, 15-misolni            ]│
│ [tushuntiring              ]│
│ 14:33              ✓✓      │
│                             │
│   [📎 integral_yechim.pdf  ]│
│   [56 KB]          14:45    │
│                             │
│─────────────────────────────│
│ [📎] [📷] [Xabar yozing...] │
│                       [→]   │
└─────────────────────────────┘
```

### 8.3 Chat Xususiy Qoidalari

```
RUXSAT ETILGANLAR:
✅ Matn xabarlari
✅ Fayl yuklash (PDF, DOC, ZIP — max 50MB)
✅ Rasm yuklash (JPG, PNG — max 20MB)
✅ Emoji

RUXSAT ETILMAGANLAR:
❌ Telegram, WhatsApp, Instagram linki (NLP filter)
❌ Telefon raqam (NLP filter)
❌ To'lov so'rash (NLP filter)
❌ Platformadan tashqari ish kelishuvi

NLP FILTER ISHLAGAN HOLAT:
"Ushbu xabar platformadan tashqari aloqa urinishini
 aniqladi. Barcha muloqot EduMarket'da olib borilishi kerak."
[Qayta urinish] [Yordam]
```

---

## 9. TO'LOV VA ESCROW FLOW

### 9.1 Joriy MVP Flow (Screenshot)

```
Client topshiriq yaratadi (byudjet belgilaydi)
              │
              ▼
Freelancer ASSIGNED bo'lganda escrow "qulflanadi"
(hozircha virtual — real to'lov yo'q)
              │
              ▼
Task COMPLETED bo'lganda
              │
              ▼
Admin to'lovni qo'lda tasdiqlaydi
              │
              ▼
Freelancer to'lovni oladi (Telegram/Payme/Click)
```

### 9.2 Target Enterprise Flow (Click/Payme integratsiyasi)

```
Task ASSIGNED bo'lganda:
              │
              ▼
    Escrow Payment Screen
┌─────────────────────────────┐
│  💰 Escrow to'lov           │
│                             │
│  Topshiriq: Integral hisob  │
│  Freelancer: Ali Valiyev    │
│  Summa: 50,000 so'm         │
│                             │
│  ℹ️ Bu summa task           │
│  bajarilgunicha             │
│  xavfsiz saqlanadi          │
│                             │
│  [💳 Click bilan to'lash]   │
│  [📱 Payme bilan to'lash]   │
└─────────────────────────────┘
              │
              ▼
    Payment Gateway (Click/Payme)
              │
              ▼
    Webhook → Backend
    Escrow "LOCKED" holat
              │
              ▼
    Task bajariladi
              │
              ▼
    Auto-release: Freelancer hisobiga
```

### 9.3 VIP To'lov Flow

```
Profile → [VIP bo'lish]
              │
              ▼
┌─────────────────────────────┐
│  ⭐ VIP Freelancer          │
│                             │
│  Afzalliklar:               │
│  • Top qidiruvda chiqish    │
│  • VIP badge profilda       │
│  • 2x ko'proq bid qabul     │
│                             │
│  Narxi: 25,000 so'm / oy    │
│                             │
│  [💳 To'lash]               │
└─────────────────────────────┘
              │
              ▼
    [MVP: Screenshot yuborish]
    [Enterprise: Click/Payme]
```

---

## 10. REVIEW FLOW

### 10.1 Review Jarayoni

```
Task COMPLETED → Har ikki tomonga prompt

CLIENT uchun:
┌─────────────────────────────┐
│  ⭐ Ijrochini baholang       │
│                             │
│  Ali Valiyev                │
│                             │
│  ★ ★ ★ ★ ★  (Tap to rate)  │
│                             │
│  Izoh (ixtiyoriy):          │
│  [Juda yaxshi ish qildi...] │
│                             │
│  [Baholash →]               │
└─────────────────────────────┘

FREELANCER uchun:
┌─────────────────────────────┐
│  ⭐ Buyurtmachini baholang   │
│                             │
│  Jasur Mirzayev             │
│                             │
│  ★ ★ ★ ★ ★  (Tap to rate)  │
│                             │
│  [Baholash →]               │
└─────────────────────────────┘
```

### 10.2 Review Qoidalari (UX)

```
MAJBURIY:
- Har ikki tomon ham baholashi SHART
- Skip qilib bo'lmaydi
- 7 kun ichida baholanmasa — auto 3/5 beriladi

ANTI-FRAUD (foydalanuvchi ko'rmaydigan):
- Bir IP'dan o'zaro baho — flag + admin tekshiruvi
- 24 soat ichida juda ko'p baho — susurting + tekshirish

UI PATTERN:
- Yulduzlar + hajmli emoji reaction (😊 😐 😞)
- Review yozish ixtiyoriy lekin tavsiya qilinadi
```

---

## 11. ADMIN FLOW

### 11.1 Admin Panel Navigatsiyasi

```
/admin (alohida route — Telegram Mini App tashqarisida)
├── Dashboard
│   ├── Kunlik statistika
│   ├── Active disputes count
│   └── Pending VIP approvals
│
├── Disputes (Nizolar)
│   ├── Pending disputes ro'yxati
│   ├── Dispute detail → chat ko'rish
│   ├── [Client favori] yoki [Freelancer favori]
│   └── Qaror xabari yuborish
│
├── VIP Approvals
│   ├── Pending VIP so'rovlar
│   ├── Screenshot ko'rish
│   └── [Tasdiqlash] / [Rad etish]
│
├── Users
│   ├── Qidirish va filter
│   ├── User detail → barcha tasklari
│   ├── [Warning] / [Temporary Ban] / [Permanent Ban]
│   └── Ban sababi kiritish (majburiy)
│
└── Broadcast
    ├── Xabar yozish (plain text only, DOMPurify)
    ├── Maqsad: Barcha / Clientlar / Freelancerlar / VIP
    └── [Yuborish] (tasdiqlash bilan)
```

### 11.2 Dispute Resolution Flow

```
IN_REVIEW → Client "Rad etaman" bosadi
              │
              ▼
    Dispute Reason Screen:
    [Nima muammo?          ]
    [Fayl to'g'ri kelmadi  ]
    [Sifat yomon           ]
    [Boshqa: _____________ ]
    [Yuborish]
              │
              ▼
    Task → DISPUTED
    Admin'ga notification
              │
              ▼
    Admin: Dispute Detail
    ├── Client xabari va fayllar
    ├── Freelancer xabari va fayllar
    ├── Chat log (o'qish uchun)
    └── [Client uchun hal qilish]
        [Freelancer uchun hal qilish]
              │
              ▼
    Tanlangan tomon COMPLETED
    Ikkinchi tomon xabardor qilinadi
```

---

## 12. NOTIFICATION FLOW

### 12.1 Notification Turlari va Triggerlari

| Notification | Trigger | Kim oladi | Kanal |
|:------------|:--------|:---------|:------|
| `new_bid` | Freelancer bid berdi | Client | Bot + In-app |
| `bid_accepted` | Client bid qabul qildi | Freelancer | Bot + In-app |
| `task_started` | Task IN_PROGRESS | Client | In-app |
| `result_submitted` | Freelancer natija yubordi | Client | Bot + In-app |
| `task_completed` | Task COMPLETED | Freelancer | Bot + In-app |
| `review_request` | Task completed | Ikki tomon | Bot + In-app |
| `dispute_opened` | Dispute yaratildi | Ikki tomon + Admin | Bot + In-app |
| `deadline_warning` | 24 soat qoldi | Freelancer | Bot |
| `vip_approved` | Admin VIP tasdiq | Freelancer | Bot + In-app |
| `broadcast` | Admin broadcast | Hammaga | Bot |

### 12.2 In-App Notification UX

```
Notification Screen:
┌─────────────────────────────┐
│ ← Bildirishnomalar          │
│                             │
│  BUGUN                      │
│  ┌─────────────────────┐    │
│  │ 🔴 Yangi taklif     │    │
│  │ Ali Valiyev: "45,000│    │
│  │ so'mga bajara olaman│    │
│  │ 5 daqiqa oldin      │    │
│  └─────────────────────┘    │
│                             │
│  ┌─────────────────────┐    │
│  │ ✅ Topshiriq yakund. │    │
│  │ "Integral hisob"    │    │
│  │ bajarildi!          │    │
│  │ 2 soat oldin        │    │
│  └─────────────────────┘    │
│                             │
│  KECHA                      │
│  ┌─────────────────────┐    │
│  │ ⚠️ Muddat eslatmasi  │    │
│  │ 24 soat qoldi!      │    │
│  │ Kecha 18:00         │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

---

## 13. ERROR VA EDGE CASE FLOWLAR

### 13.1 Network Error

```
Internet yo'q holat:
              │
              ▼
┌─────────────────────────────┐
│         📡                  │
│   Internet aloqasi yo'q     │
│                             │
│  Iltimos, internet         │
│  ulanishini tekshiring      │
│                             │
│  [🔄 Qayta urinish]         │
└─────────────────────────────┘

QOIDA:
- Auto-retry 3 marta (exponential backoff)
- Manual retry tugmasi
- Cached ma'lumot (agar bor bo'lsa) ko'rsatiladi
- "Offline rejim" badge top bar'da
```

### 13.2 Session Expired

```
Token expired holat:
              │
              ▼
    Background'da auto-refresh (initData bilan)
              │
    Muvaffaqiyatli → Davom etadi (foydalanuvchi sezmaydi)
              │
    Muvaffaqiyatsiz (Telegram session o'chgan):
              ▼
    Toast: "Qayta kirish kerak"
    App restart → Telegram re-auth
```

### 13.3 Form Validation Errors

```
Real-time validation (onChange):
- Sarlavha: min 10, max 100 belgi
- Tavsif: min 30, max 2000 belgi
- Byudjet: min 5,000, max 1,000,000 so'm

Submit'da validation:
- Barcha * fieldlar to'ldirilganmi?
- Muddat bugundan keyin keladi?

Error Ko'rinishi:
┌─────────────────────────────┐
│  Sarlavha *                 │
│  [                    ]     │
│  ❌ Sarlavha kamida 10 belgi │
│     bo'lishi kerak          │
└─────────────────────────────┘

QOIDA:
- Xato matn field ostida, qizil rangda
- Field border: edu-urgent rangi
- Submit tugma: disabled (xatolar tuzatilgunicha)
```

### 13.4 Empty States

| Ekran | Empty State | CTA |
|:------|:-----------|:----|
| Client Tasks | "Hali topshiriq yo'q" | "Topshiriq yaratish +" |
| Freelancer Feed | "Hali topshiriq e'lon qilinmagan" | "Keyinroq qarang" |
| Chat List | "Hali suhbat yo'q" | "Topshiriq qabul qiling" |
| Notifications | "Hali bildirishnoma yo'q" | — |
| Bids on Task | "Hali taklif yo'q" | "Ulashing — do'stlaringiz bilsin" |

---

## 14. UX METRICS VA KPILAR

### 14.1 Kuzatish Kerak bo'lgan UX Ko'rsatkichlari

| Metrik | Maqsad | Hozirgi holat | Asbob |
|:-------|:-------|:-------------|:------|
| **Onboarding Completion Rate** | >85% | Noma'lum | Mixpanel |
| **Time to First Task (Client)** | <5 daqiqa | Noma'lum | Mixpanel |
| **Time to First Bid (Freelancer)** | <3 daqiqa | Noma'lum | Mixpanel |
| **Bid Acceptance Rate** | >40% | Noma'lum | DB Analytics |
| **Task Completion Rate** | >80% | Noma'lum | DB Analytics |
| **Review Submission Rate** | >90% | Noma'lum | DB Analytics |
| **Dispute Rate** | <5% | Noma'lum | DB Analytics |
| **Session Duration** | >4 daqiqa | Noma'lum | Mixpanel |
| **D7 Retention** | >40% | Noma'lum | Mixpanel |

### 14.2 Funnel Tahlili

```
CLIENT FUNNEL:
App Ochish → 100%
     ↓
Onboarding → 90% (10% tushib qoladi)
     ↓
Task Yaratish → 60% (40% faqat ko'radi)
     ↓
Bid Qabul Qilish → 45%
     ↓
Task Yakunlash → 38%
     ↓
Review Yozish → 35%

FREELANCER FUNNEL:
App Ochish → 100%
     ↓
Onboarding → 85%
     ↓
Task Ko'rish → 80%
     ↓
Bid Berish → 50%
     ↓
Bid Qabul → 20%
     ↓
Task Yakunlash → 17%
```

### 14.3 Mixpanel Events (Amalga oshirilishi kerak)

```javascript
// Mixpanel track call'lar (frontend)

// Onboarding
mixpanel.track('onboarding_started')
mixpanel.track('role_selected', { role: 'CLIENT' | 'FREELANCER' })
mixpanel.track('onboarding_completed', { role, skills_count })

// Task
mixpanel.track('task_create_started')
mixpanel.track('task_created', { budget, category, has_files })
mixpanel.track('bid_submitted', { task_id, amount })
mixpanel.track('bid_accepted', { task_id, freelancer_id })
mixpanel.track('task_completed', { task_id, duration_days })

// Engagement
mixpanel.track('chat_message_sent', { task_id })
mixpanel.track('review_submitted', { rating, has_comment })
mixpanel.track('vip_upgrade_started')
mixpanel.track('search_performed', { query, filters })
```

---

## 15. EKRAN YARATISH CHECKLIST

### 15.1 Har Yangi Ekran Uchun Majburiy Tekshiruv

```
UX CHECKLIST — Yangi ekran yaratishdan oldin:

[ ] 1. MAQSAD ANIQ: Foydalanuvchi bu ekranda nima maqsadga erishadi?
[ ] 2. ENTRY POINT: Foydalanuvchi bu ekranga qayerdan keladi?
[ ] 3. EXIT POINT: Bu ekrandan foydalanuvchi qayerga ketadi?
[ ] 4. SUCCESS STATE: Muvaffaqiyatli amal qilindi — nima ko'rsatiladi?
[ ] 5. ERROR STATE: Xato bo'ldi — nima ko'rsatiladi va qanday tuzatiladi?
[ ] 6. EMPTY STATE: Ma'lumot yo'q — nima ko'rsatiladi?
[ ] 7. LOADING STATE: Ma'lumot yuklanmoqda — skeleton bormi?
[ ] 8. OFFLINE STATE: Internet yo'q — nima ko'rsatiladi?
[ ] 9. 3 TAP QOIDASI: Asosiy amal 3 tapdan ko'pmi?
[ ] 10. BACK NAVIGATION: Orqaga qaytish tugmasi bormi?
[ ] 11. BOTTOM NAV SPACE: pb-24 qo'yilganmi?
[ ] 12. TOUCH TARGETS: Barcha elementlar 44px+mi?
[ ] 13. DARK MODE: Test qilinganmi?
[ ] 14. ANALYTICS: Mixpanel event qo'shilganmi?
[ ] 15. NOTIFICATION TRIGGER: Bu ekran qaysi notificationni triggerlaydi?
```

### 15.2 Flow Tasdiqlash Jarayoni

```
1. Wireframe → Product Owner (PO) tomonidan tasdiqlash
2. Design → Design System Bible ga muvofiqligi tekshiriladi
3. Dev → UX Checklist tekshiriladi
4. QA → Real qurilmada test (Telegram Mini App ichida)
5. Release → Analytics event'lar to'g'ri ishlayaptimi?
```

---

## ILOVALAR

### A. Ekran Nomlari Lug'ati

| Ekran | Fayl nomi | Yo'l |
|:------|:---------|:----|
| Client Home | `ClientHomeScreen.jsx` | `/client/home` |
| Freelancer Home | `FreelancerHomeScreen.jsx` | `/freelancer/home` |
| Task Create | `CreateTaskScreen.jsx` | `/client/tasks/create` |
| Task Detail | `TaskDetailScreen.jsx` | `/tasks/:id` |
| Chat | `ChatScreen.jsx` | `/chat/:chatId` |
| Chat List | `ChatListScreen.jsx` | `/chats` |
| Profile | `ProfileScreen.jsx` | `/profile` |
| Browse Tasks | `BrowseTasksScreen.jsx` | `/freelancer/browse` |
| Notifications | `NotificationScreen.jsx` | `/notifications` |
| VIP Upgrade | `VipUpgradeScreen.jsx` | `/profile/vip` |
| Onboarding | `OnboardingScreen.jsx` | `/onboarding` |

### B. UX Terminlar Lug'ati

| Term | Ta'rif |
|:-----|:-------|
| **Bottom Sheet** | Pastdan chiqadigan modal oyna |
| **Toast** | Vaqtinchalik bildirishnoma (3 soniyada yo'qoladi) |
| **Skeleton** | Loading paytida ko'rsatiladigan placeholder |
| **Empty State** | Ma'lumot yo'q holatidagi ekran |
| **Deep Link** | Ilovaning ichki sahifasiga to'g'ridan-to'g'ri havola |
| **Haptic** | Telefon titrashi orqali feedback |
| **CTA** | Call to Action — harakatga undovchi tugma |
| **Progressive Disclosure** | Ma'lumotni asta-sekin ko'rsatish |

---

*EduMarket UX & User Flow Bible v1.0 | 2026-06-09*
*Bu hujjat barcha UX qarorlari uchun YAGONA manbaa hisoblanadi.*
*Har qanday o'zgartirish Product Owner tasdiqlovi bilan kiritiladi.*
