# EduMarket — Task Lifecycle UX Bible
> **Versiya:** 1.0 | **Sana:** 2026-06-09
> **Maqsad:** Topshiriq yaratish tugmasi bosilgandan to review yopilguncha bo'lgan BARCHA jarayonlarni, har bir nuans va edge caseni, har bir kategoriya va fayl turi uchun alohida yondashuvlarni batafsil belgilash.
> **Qoida:** Bu loyihaning YURAGI hujjati. Har qanday task-related UI/UX qaror qilishda bu hujjat birinchi ochilishi SHART.

---

## MUNDARIJA

1. [Filosofiya — Nima uchun bu loyihaning yuragi](#1-filosofiya)
2. [Task Kategoriyalari va Xususiyatlari](#2-task-kategoriyalari)
3. [FAZA 1 — Task Yaratish (Client)](#3-faza-1-task-yaratish)
4. [FAZA 2 — Topshiriq Kashfiyoti (Freelancer)](#4-faza-2-topshiriq-kashfiyoti)
5. [FAZA 3 — Bid va Muzokaralar](#5-faza-3-bid-va-muzokaralar)
6. [FAZA 4 — Tayinlash va Boshlanish](#6-faza-4-tayinlash-va-boshlanish)
7. [FAZA 5 — Ish Jarayoni va Chat](#7-faza-5-ish-jarayoni-va-chat)
8. [FAZA 6 — Yetkazib Berish (Delivery)](#8-faza-6-yetkazib-berish)
9. [FAZA 7 — Review va Qabul](#9-faza-7-review-va-qabul)
10. [FAZA 8 — Review Yozish va Yopish](#10-faza-8-review-yozish-va-yopish)
11. [Fayl Xavfsizligi — Har Tur Uchun](#11-fayl-xavfsizligi)
12. [Kategoriya-Spesifik UX Yondashuvlari](#12-kategoriya-spesifik-ux)
13. [Dispute va Conflict Resolution](#13-dispute-va-conflict-resolution)
14. [Edge Caselar va Muammoli Holatlar](#14-edge-caselar)
15. [Micro-interaction va Animation Standartlari](#15-micro-interaction-standartlari)
16. [Notification Arxitekturasi — Task Lifecycle](#16-notification-arxitekturasi)
17. [Anti-fraud UX Patterns](#17-anti-fraud-ux-patterns)
18. [Kelajakdagi Kengaytmalar (v2.0+)](#18-kelajakdagi-kengaytmalar)

---

## 1. FILOSOFIYA

### 1.1 Nima uchun bu loyihaning yuragi?

```
EduMarket = bir narsaning ustasi:

  [Client topshiriq beradi]
           ↓
  [Freelancer uni bajaradi]
           ↓
  [Ikkalasi ham qoniqadi]

Bu 3 qadam — platforma hayotining 100%.
Qolgan hamma narsa (profil, rating, VIP) — bu jarayonni yaxshilash uchun xizmat qiladi.
```

**Muvaffaqiyat o'lchovi:** Bitta topshiriq `OPEN → COMPLETED` holatiga o'tsa — platforma o'z ishini qilgan.

### 1.2 Ideal UX Hissi

Foydalanuvchi topshiriq berayotganda o'zini quyidagiday his qilishi kerak:

```
CLIENT:
"Men vazifamni aniq aytdim, to'g'ri odam topildi,
 u ishni bajardi, men sifatini tekshirdim va to'ladim.
 Hamma narsa o'z joyida. Xavfsiz edim."

FREELANCER:
"Men topshiriq topdim, narxni kelishdik, bajardim,
 yukladim, to'lovimni oldim. Shunchaki ishlash edi."
```

**Yomon UX:** Foydalanuvchi "endi nima qilaman?" deb o'ylasa.
**Yaxshi UX:** Har qadam foydalanuvchiga keyingi qadamni avtomatik ko'rsatadi.

### 1.3 Task Lifecycle State Machine

```
                    ╔═══════════════════════════════════════════╗
                    ║        TASK LIFECYCLE STATE MACHINE        ║
                    ╚═══════════════════════════════════════════╝

[CLIENT "+" bosadi]
         │
         ▼
    ┌─────────┐
    │  DRAFT  │  ← Form to'ldirilmoqda (local state, DB'ga yozilmagan)
    │ (local) │
    └─────────┘
         │ Submit bosiladi
         ▼
    ┌─────────┐     Muddat o'tdi + bid yo'q     ┌──────────┐
    │  OPEN   │ ─────────────────────────────►  │ EXPIRED  │
    │   🟢    │                                  │    ⬛    │
    └─────────┘                                  └──────────┘
         │ Client bid qabul qiladi
         ▼
    ┌──────────┐    Client bekor qiladi          ┌──────────┐
    │ ASSIGNED │ ─────────────────────────────►  │CANCELED  │
    │    🔵    │                                  │    ⬛    │
    └──────────┘                                  └──────────┘
         │ Freelancer "Boshlayman" bosadi
         ▼
    ┌─────────────┐  Deadline o'tdi + yetkazilmadi  ┌──────────┐
    │ IN_PROGRESS │ ──────────────────────────────►  │ DISPUTED │
    │     🔵      │                                   │    🔴   │
    └─────────────┘                                   │ (auto)  │
         │ Freelancer natija yuboradi                 └──────────┘
         ▼
    ┌──────────────────┐  Client rad etadi    ┌──────────┐
    │  PREVIEW_PENDING │ ──────────────────►  │          │
    │  🟠 (xavfsiz ko'r│                      │ DISPUTED │◄──┐
    └──────────────────┘                      │    🔴    │   │
         │ Client faylni to'liq ko'rdi         └──────────┘   │
         ▼                                           │ Admin hal qiladi
    ┌──────────┐  Client "Rad etaman" bosadi         │
    │IN_REVIEW │ ────────────────────────────────────┘
    │    🟡    │
    └──────────┘
         │ Client qabul qiladi
         │ YOKI 48 soat o'tdi (auto-accept)
         ▼
    ┌───────────┐
    │ COMPLETED │
    │    ✅     │
    └───────────┘
         │
         ▼
    [Ikki tomon review yozadi — MAJBURIY, 7 kun ichida]
         │
         ▼
    [Task arxivga o'tadi]
```

> **YANGI HOLAT `PREVIEW_PENDING`:** Bu holat mavjud sxemada bor. Freelancer fayl yuborishda avval faqat watermark/preview ko'rsatiladi. Client "to'liq ko'raman" desagina `IN_REVIEW` ga o'tadi. Bu eng muhim xavfsizlik mexanizmi.

---

## 2. TASK KATEGORIYALARI

### 2.1 Kategoriya Matritsasi

| Kategoriya | Emoji | Nima yetkaziladi | Asosiy fayl turlari | Xavf darajasi | Preview turi |
|:-----------|:------|:-----------------|:--------------------|:-------------|:------------|
| `KONSPEKT` | 📝 | Lecture notes, qo'lda yoki terma | PDF, DOC, JPG | Past | PDF viewer |
| `SLAYD` | 🖥️ | PowerPoint, Google Slides | PPTX, PDF | Past | Slide preview |
| `TARJIMA` | 🌐 | Tarjima qilingan matn | PDF, DOC, TXT | Past | Matn preview |
| `KURS_ISHI` | 📚 | Term paper, kurs ishi | PDF, DOC, ZIP | Yuqori | Watermark PDF |
| `REFERAT` | 📄 | Referat, esse | PDF, DOC | O'rta | Watermark PDF |
| `LABORATORIYA` | 🔬 | Lab hisobot, ma'lumotlar | PDF, XLS, ZIP | O'rta | PDF/ZIP ko'rish |
| `BOSHQA` | 📦 | Turli xil | Har qanday | Belgilanmagan | Fayl turiga qarab |

### 2.2 Har Kategoriya Uchun Maxsus Talablar

#### KONSPEKT (Lecture Notes)
```
Mijoz ko'rsatishi kerak:
  - Fan nomi
  - Mavzu / bob
  - Sahifa soni yoki soat miqdori
  - Formati: qo'lda / terma / aralash
  - Til: O'zbek / Rus / Ingliz

Freelancer yetkazishi kerak:
  - Belgilangan sahifa/soat
  - Sarlavha + sana
  - To'liq o'qiladigan yozuv yoki formatlanmish hujjat

Qabul qilinmaydi:
  - Internetdan nusxa ko'chirilgan (plagiat)
  - Yarim tugallanmagan
  - O'qib bo'lmaydigan yozuv
```

#### KURS_ISHI va REFERAT (Academic Writing)
```
ENG YUQORI XAVF KATEGORIYASI — alohida protokol kerak

Mijoz ko'rsatishi kerak:
  - Fan / yo'nalish
  - Mavzu
  - Sahifa soni (min/max)
  - Antiplagiatura talabi (% ko'rsatilsin)
  - Manba/adabiyotlar ro'yxati (ixtiyoriy)
  - Universiteti va uslubi (GOST, APA, MLA)

Freelancer yetkazishi kerak:
  - Asosiy hujjat (DOCX/PDF)
  - Manba/adabiyotlar ro'yxati
  - Antiplagiatura hisoboti (agar so'ralsa)

MAXSUS PROTOKOL:
  - Yetkazib berishda FAQAT watermarked preview ko'rinadi
  - Client "To'lovni tasdiqlash" bosmaguncha full fayl yuklanmaydi
  - Bu kategoriyada PREVIEW_PENDING holati MAJBURIY

Platform NLP monitoring kuchaytiriladi:
  - "100% original" yoki "plagiat yo'q" da'volari tekshiriladi
  - Yolg'on da'vo = instant report + manual review
```

#### TARJIMA (Translation)
```
Mijoz ko'rsatishi kerak:
  - Manba tili + maqsad tili
  - Matn hajmi (so'z soni yoki sahifa)
  - Asosiy matn (fayl yoki to'g'ridan-to'g'ri paste)
  - Soha (yuridik, tibbiy, texnik, umumiy)
  - Deadline

Smart UX:
  - So'z sanagich: Client matn tashlaganda avtomatik so'z soni chiqadi
  - Narx hisoblagichi: so'z soni x kategoriya tarifi = tavsiya narx
```

#### LABORATORIYA (Lab Reports)
```
Dasturlash laboratoriyasi alohida subkategoriya:
  - Kod fayllari .zip shaklida
  - GitHub link qo'shimcha (ixtiyoriy, read-only)
  - Preview: kod fayllarini inline ko'rish (syntax highlight bilan)
```

---

## 3. FAZA 1 — TASK YARATISH

### 3.1 Trigger Nuqtalari

```
Task yaratish quyidagi joylardan boshlanishi mumkin:

1. ClientHome → [+ Yangi vazifa]         (asosiy CTA)
2. FreelancerProfile → [Bu mutaxassisga topshiriq]  → targetFreelancerId bilan
3. GigDetail → [Bu xizmatni olish]       → kategoria va narx to'ldirilgan
4. Deep link: t.me/EduMarketBot?startapp=create_task
5. ChatScreen (eski task tugagach): [Yangi topshiriq?]
```

### 3.2 Multi-step Form — To'liq UX Spec

#### STEP 0 — Kategoriya Tanlash (Yangi Tavsiya)
```
Tavsiya: Topshiriq yaratishga STEP 0 qo'shish.

UI:
┌──────────────────────────────────────┐
│  ← Yangi topshiriq                   │
│  ○──○──○──○──○  (0/4)                │
│                                      │
│  Qanday yordam kerak?                │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📝 Konspekt / Qaydnoma        │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  🖥️  Slayd tayyorlash          │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  🌐 Tarjima qilish             │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  📚 Kurs ishi / Referat        │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  🔬 Laboratoriya hisoboti      │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │  📦 Boshqa                     │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

UX qoidalar:
- Tap → immediate haptic + highlight
- Tanlangach 300ms bilan STEP 1 ga o'tish (animatsiya)
- Orqaga qaytishda tanlangan saqlanadi
```

#### STEP 1 — Asosiy Ma'lumot
```
┌──────────────────────────────────────┐
│  ← Topshiriq yaratish                │
│  ●──○──○──○──○  (1/5)                │
│                                      │
│  📚 Kurs ishi / Referat   [O'zgartir]│
│                                      │
│  Sarlavha *                          │
│  ┌─────────────────────────────────┐ │
│  │ "Iqtisodiyot asoslari kurs..."  │ │  ← kategoriyaga mos placeholder
│  └─────────────────────────────────┘ │
│  [Kamida 10 belgi] [0/200]           │
│                                      │
│  Batafsil tavsif *                   │
│  ┌─────────────────────────────────┐ │
│  │                                 │ │
│  └─────────────────────────────────┘ │
│  [Kamida 50 belgi] [0/2000]          │
│                                      │
│  ── Kategoriyaga mos ko'rsatmalar ─  │
│  💡 Kurs ishi uchun ko'rsating:      │
│    • Fan nomi va kafedra             │
│    • Sahifa soni (min/max)           │
│    • Antiplagiatura talabi (%)       │
│    • Muddat talablari                │
│                                      │
│  ⚠️ NLPWarning (agar trigger bo'lsa) │
│                                      │
│  [Telegram Main Button: DAVOM →]     │
└──────────────────────────────────────┘

KATEGORIYAGA MOS PLACEHOLDER matnlar:
  KONSPEKT:      "Ma'ruza mavzusi, fan nomi, nechta soat, til..."
  SLAYD:         "Mavzu, slide soni, dizayn uslubi, asosiy bo'limlar..."
  TARJIMA:       "Manba tili, maqsad tili, matn hajmi, soha..."
  KURS_ISHI:     "Fan nomi, mavzu, sahifa soni, antiplagiatura %, ..."
  REFERAT:       "Fan nomi, mavzu, sahifa soni, manba talabi..."
  LABORATORIYA:  "Fan, laboratoriya mavzusi, kerakli bo'limlar..."
  BOSHQA:        "Topshiriq haqida batafsil yozing..."
```

#### STEP 2 — Byudjet va Muddat
```
┌──────────────────────────────────────┐
│  ← Topshiriq yaratish                │
│  ●──●──○──○──○  (2/5)                │
│                                      │
│  BYUDJET ORALIG'I (UZS) *            │
│  ┌─────────────┐  ─  ┌─────────────┐ │
│  │   50,000    │     │   150,000   │ │
│  │    MIN      │     │    MAX      │ │
│  └─────────────┘     └─────────────┘ │
│                                      │
│  💡 Bozor narxi: 80,000–200,000     │  ← AI suggest
│                                      │
│  ⚡ Shoshilinch? [OFF → ON toggle]   │
│  → Yoqilsa: TOP'da ko'rinadi (+20%) │
│                                      │
│  ── Muddatga bog'liq narx hint ───   │
│  ⏰ Shoshilinch (< 24h):  +50%      │
│  ⚡ Tez (1-3 kun):         +20%     │
│  📅 Oddiy (3-7 kun):        0%      │
│  🕐 Uzoq (7+ kun):         -10%     │
│                                      │
│  TUGASH MUDDATI *                    │
│  ┌─────────────────────────────────┐ │
│  │  📅 16 iyun 2026, 23:59        │ │
│  └─────────────────────────────────┘ │
│  ← Min: hozirdan 2 soat keyin       │
│                                      │
│  [← Orqaga]                         │
│  [Telegram Main Button: DAVOM →]     │
└──────────────────────────────────────┘
```

#### STEP 3 — Fayl va Material Yuklash
```
┌──────────────────────────────────────┐
│  ← Topshiriq yaratish                │
│  ●──●──●──○──○  (3/5)                │
│                                      │
│  QO'SHIMCHA MATERIALLAR (ixtiyoriy)  │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  📎 Fayl biriktirish             ││
│  │  PDF, DOC, JPG, PNG, ZIP         ││
│  │  (har biri max 50MB, jami 5 ta)  ││
│  └──────────────────────────────────┘│
│                                      │
│  Yuklangan fayllar:                  │
│  ┌──────────────────────────────┐    │
│  │ 📄 topshiriq_namunasi.pdf    │    │
│  │ 234 KB                    ×  │    │
│  └──────────────────────────────┘    │
│                                      │
│  💡 Fayl qo'shsangiz 3x ko'proq      │
│  bid olasiz (statistikaga asoslanib) │
│                                      │
│  [← Orqaga]                         │
│  [Telegram Main Button: DAVOM →]     │
└──────────────────────────────────────┘
```

#### STEP 4 — Targetlash (Ixtiyoriy)
```
┌──────────────────────────────────────┐
│  ← Topshiriq yaratish                │
│  ●──●──●──●──○  (4/5)                │
│                                      │
│  KIM KO'RSIN? (ixtiyoriy)           │
│                                      │
│  ○ Barcha freelancerlarga            │  ← Default
│  ○ Faqat verified freelancerlarga   │
│  ○ Faqat VIP freelancerlarga        │
│  ○ Aniq bir mutaxassis (direct)     │
│                                      │
│  ── Agar "Direct hire" tanlansa ──  │
│  🎯 Ali Valiyev ga jo'natiladi       │
│  ⭐ 4.8 | 24 ta bajarilgan           │
│  Ali qabul qilmasa OPEN bo'ladi     │
│                                      │
│  [← Orqaga]                         │
│  [Telegram Main Button: DAVOM →]     │
└──────────────────────────────────────┘
```

#### STEP 5 — Ko'rib Chiqish va Tasdiqlash
```
┌──────────────────────────────────────┐
│  ← Topshiriq yaratish                │
│  ●──●──●──●──●  (5/5)                │
│                                      │
│  TOPSHIRIQ NAMUNASI                  │
│                                      │
│  ┌──────────────────────────────────┐│
│  │  📚 Kurs ishi                    ││
│  │  ─────────────────────────────  ││
│  │  Iqtisodiyot asoslari kurs...    ││
│  │  ─────────────────────────────  ││
│  │  💰 50,000 – 150,000 so'm       ││
│  │  📅 16 iyun 2026                ││
│  │  📎 1 ta fayl                   ││
│  │  👥 Barcha freelancerlarga       ││
│  └──────────────────────────────────┘│
│                                      │
│  ── Muhim eslatmalar ──             │
│  ✅ E'lon qilgandan keyin narx va   │
│     muddat o'zgartirib bo'lmaydi    │
│  ✅ Topshiriq 24 soat ichida        │
│     barchaga ko'rinadi              │
│                                      │
│  ── NLP tekshiruvi ──              │
│  ✅ Shaxsiy ma'lumot: topilmadi    │
│  ✅ Tashqi aloqa urinishi: yo'q     │
│  ✅ Kontent siyosati: mos           │
│                                      │
│  [← Orqaga]                         │
│  [Telegram Main Button: 🚀 E'LON QILISH] │
└──────────────────────────────────────┘
```

### 3.3 Submit Jarayoni

```
[E'LON QILISH] bosilgandan keyin:

Muvaffaqiyatli holat:
  1. Main Button → loading spinner (0ms)
  2. API call yuboriladi
  3. Haptic: SUCCESS
  4. Confetti animatsiya (1.5 sekund)
  5. Toast: "Topshirig'ingiz muvaffaqiyatli e'lon qilindi!"
  6. navigate('/tasks', { replace: true })

Xato holati:
  1. Haptic: ERROR (2x tez)
  2. Toast: server xabar yoki "Xatolik yuz berdi"
  3. Form ochiq qoladi, ma'lumotlar yo'qolmaydi
  4. Server validatsiya xatosi: tegishli stepga qaytish
```

### 3.4 NLP Filter — Task Yaratishda

```
REAL-TIME CHECK (typing paytida, 500ms debounce):

WARNING (blok qilmaydi):
  - Telefon raqam formatlari: +998XX, 8(XX)
  - Telegram username: @username
  - "whatsapp", "telegram'da", "insta'da"
  - "kartamga", "naqd", "cash"

BLOCK (submit bloklanadi):
  - "plagiat garantiya", "100% asl"
  - Boshqa platformalar URL lari

WARNING UI:
┌─────────────────────────────────────┐
│  ⚠️ Diqqat                          │
│  Tavsifingizda tashqi aloqa         │
│  ma'lumotlari aniqlandi.            │
│  [Men tushundim]                    │
└─────────────────────────────────────┘

BLOCK UI:
┌─────────────────────────────────────┐
│  🚫 E'lon qilib bo'lmaydi          │
│  Kontent siyosatimizga zid.         │
│  [Nima o'zgartirishim kerak?]       │
└─────────────────────────────────────┘
```

---

## 4. FAZA 2 — TOPSHIRIQ KASHFIYOTI (FREELANCER)

### 4.1 Task Feed Algoritmi

```
FEED TARTIBI (ball tizimi):
1. Freelancer kategoriyalari bilan mos — birinchi
2. isUrgent = true               — +50 ball
3. Bid soni kam (< 3)            — +30 ball
4. Yangi (< 2 soat)              — +20 ball
5. VIP freelancerga tayinlangan  — yuqorida pinned
```

### 4.2 Task Feed Karta UX

```
┌──────────────────────────────────────┐
│  ┌────────────────────────────────┐  │
│  │  📚 KURS ISHI  🔴 SHOSHILINCH  │  │  ← kategoriya + urgent badge
│  │  ─────────────────────────────  │  │
│  │  Iqtisodiyot asoslari kurs...   │  │
│  │                                 │  │
│  │  💰 50,000–150,000  📎 1 fayl   │  │
│  │  ⏰ 2 kun 14 soat qoldi         │  │
│  │  👥 3 ta taklif bor             │  │
│  │                                 │  │
│  │  👤 Jasur M. ⭐ 4.5 (12 task)  │  │
│  └────────────────────────────────┘  │
│                                      │
│  [🔖 Saqlash]   [💼 Taklif berish]  │
└──────────────────────────────────────┘

KARTA INTERAKSIYALARI:
- Tap → TaskDetail ga navigate
- Long press → context menu: [Saqlash, Nusxalash havolasi, Xabar berish]
- Swipe right → Saqlash (bookmark)
```

### 4.3 Task Detail — Freelancer Ko'rishi

```
┌──────────────────────────────────────┐
│  ←  Topshiriq tafsiloti      [🔖]   │
│──────────────────────────────────────│
│                                      │
│  📚 KURS ISHI     🔴 SHOSHILINCH    │
│                                      │
│  Iqtisodiyot asoslari kurs ishi      │
│                                      │
│  ────────────────────────────────── │
│  Batafsil tavsif:                    │
│  "Iqtisodiyot fakulteti 2-kurs       │
│   talabasi uchun kurs ishi kerak..." │
│                                      │
│  ────────────────────────────────── │
│  💰 50,000 – 150,000 so'm            │
│  📅 16 iyun 2026 (2 kun 14 soat)    │
│  📎 1 ta fayl biriktrilgan           │
│                                      │
│  ────────────────────────────────── │
│  MIJOZ HAQIDA                        │
│  👤 Jasur Mirzayev                  │
│  ⭐ 4.5 (12 ta topshiriq)           │
│  ✅ Tasdiqlangan talaba              │
│  💼 12 bergan, 10 ta muvaffaqiyatli │
│                                      │
│  ────────────────────────────────── │
│  👥 3 ta taklif bor                 │
│                                      │
│  ────────────────────────────────── │
│  📎 FAYLLAR (Client tomonidan)       │
│  ┌──────────────────────────────┐   │
│  │ 📄 topshiriq_namunasi.pdf    │   │
│  │ 234 KB  [Ko'rish] [Yuklash]  │   │
│  └──────────────────────────────┘   │
│                                      │
│  [💼 Taklif berish]  (Main Button) │
└──────────────────────────────────────┘
```

---

## 5. FAZA 3 — BID VA MUZOKARALAR

### 5.1 Bid Berish — Full UX

```
[Taklif berish] → Bottom Sheet (full height):

┌──────────────────────────────────────┐
│  ████  Taklif berish                 │
│──────────────────────────────────────│
│                                      │
│  TOPSHIRIQ: Iqtisodiyot kurs ishi    │
│  Mijoz byudjeti: 50,000–150,000      │
│                                      │
│  NARXINGIZ *                         │
│  ┌────────────────────────────────┐  │
│  │  80,000                  so'm │  │  ← mijoz byudjetining o'rtasi
│  └────────────────────────────────┘  │
│  ← Bozor narxi: 70,000–120,000      │
│                                      │
│  MUDDATINGIZ *                       │
│  ┌────────────────────────────────┐  │
│  │  📅  12 iyun 2026             │  │  ← client deadlinidan oldin
│  └────────────────────────────────┘  │
│  ← Deadline: 16 iyun 2026           │
│                                      │
│  PORTFOLIO / NAMUNA (ixtiyoriy)      │
│  [📎 Namuna yuklash yoki portfolio]  │
│                                      │
│  XABARINGIZ *                        │
│  ┌────────────────────────────────┐  │
│  │ Men bu topshiriqni bajara      │  │
│  │ olaman, chunki...              │  │
│  └────────────────────────────────┘  │
│  [Kamida 20 belgi] [0/500]           │
│                                      │
│  Reyting: ⭐ 4.8 (24 task) VIP ✅   │
│                                      │
│  [Taklif yuborish →]                │
└──────────────────────────────────────┘
```

### 5.2 Client — Bid Ko'rish va Tanlash

```
TaskDetail → "Takliflar" tab:

┌──────────────────────────────────────┐
│  ← Topshiriq  [Tafsilot] [Takliflar] │
│──────────────────────────────────────│
│                                      │
│  TAKLIFLAR (3)                       │
│  Saralash: [Eng arzon ▼]            │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ⭐ VIP  👤 Ali Valiyev        │  │  ← VIP birinchida
│  │  ⭐ 4.9 (47 muvaffaqiyat)      │  │
│  │  ✅ Verified talaba            │  │
│  │  💰 85,000 so'm               │  │
│  │  📅 12 iyun (4 kun ertaroq)   │  │
│  │  "Men iqtisodiyotdan..."       │  │
│  │  📎 1 ta namuna               │  │
│  │  [Profilni ko'rish] [✓ Qabul] │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  👤 Bobur Toshmatov            │  │
│  │  ⭐ 4.2 (8 bajarilgan)         │  │
│  │  💰 65,000 so'm               │  │
│  │  [Profilni ko'rish] [✓ Qabul] │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘

SARALASH VARIANTLARI:
  - Eng arzon narx
  - Eng tez muddat
  - Eng yuqori reyting
  - VIP birinchi (default)
```

### 5.3 Qabul Tasdiqlash Modal

```
[✓ Qabul] bosilganda:

┌──────────────────────────────────────┐
│  Tasdiqlaysizmi?                     │
│                                      │
│  👤 Ali Valiyev                      │
│  ⭐ 4.9 | VIP Freelancer            │
│                                      │
│  💰 Kelishilgan narx: 85,000 so'm   │
│  📅 Muddat: 12 iyun 2026            │
│                                      │
│  ℹ️ Tasdiqlangandan so'ng:          │
│  • Boshqa takliflar yopiladi         │
│  • Chat avtomatik ochiladi           │
│                                      │
│  [Bekor qilish]  [✅ Ha, qabul]     │
└──────────────────────────────────────┘

Qabul qilingandan keyin:
1. Task status → ASSIGNED
2. Boshqa freelancerlarga: "Boshqa mutaxassis tanlandi"
3. Tanlangan freelancerga: "🎉 Taklifingiz qabul qilindi!"
4. Chat avtomatik yaratiladi va ochiladi
```

### 5.4 Counter-Offer

```
Client bid o'rniga muzokaralash xohlasa:

[Muzokaralash] → Counter Offer Sheet:

┌──────────────────────────────────────┐
│  ████  Muzokaralash                  │
│──────────────────────────────────────│
│                                      │
│  Ali Valiyev → 85,000 so'm           │
│  Siz taklif qilayotgan:              │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  75,000               so'm    │  │
│  └────────────────────────────────┘  │
│                                      │
│  Izoh:                               │
│  ┌────────────────────────────────┐  │
│  │ Narxni biroz tushirsangiz...   │  │
│  └────────────────────────────────┘  │
│                                      │
│  [Yuborish]                         │
└──────────────────────────────────────┘

Freelancer qabul → ASSIGNED
Freelancer rad → Bid ochiq qoladi
```

---

## 6. FAZA 4 — TAYINLASH VA BOSHLANISH

### 6.1 ASSIGNED → IN_PROGRESS Transition

```
Task ASSIGNED bo'lgandan keyin FREELANCER TAMONIDAN:

┌──────────────────────────────────────┐
│  🔵 TAYINLANGAN                      │
│                                      │
│  📚 Iqtisodiyot kurs ishi           │
│  👤 Jasur Mirzayev                  │
│  💰 85,000 so'm kelishildi          │
│  📅 12 iyun 2026 (5 kun qoldi)     │
│                                      │
│  BOSHLASH UCHUN:                     │
│  1. Mijoz bilan chat orqali tasdiql. │
│  2. "Boshladim" tugmasini bosing    │
│                                      │
│  [💬 Chat ochish]                   │
│  [▶️ Ish boshlash]                  │
└──────────────────────────────────────┘

"Ish boshlash" → Confirm modal:
"Hozirdan muddat hisobi boshlanadi. Davom etasizmi?"
[Bekor] [✅ Boshlayman]

→ Task status: IN_PROGRESS
→ inProgressAt timestamp yoziladi (anti-fraud uchun)
→ Client'ga: "Freelancer ish boshladi"
```

### 6.2 Auto System Chat Xabari

```
Task ASSIGNED bo'lganda chat ochiladi va avtomatik xabar:

[SYSTEM xabar — ikkalasi ko'radi]:
┌──────────────────────────────────────┐
│  🤖 EduMarket                        │
│  ──────────────────────────────────  │
│  ✅ Muvaffaqiyatli kelishuv!         │
│                                      │
│  📋 Topshiriq: Iqtisodiyot kurs ishi │
│  💰 Narx: 85,000 so'm               │
│  📅 Muddat: 12 iyun 2026            │
│                                      │
│  Eslatmalar:                         │
│  • Platforma tashqarisida kelishmang │
│  • Muammo bo'lsa — Dispute oching   │
│  • Natijani bu yerdan yuboring      │
└──────────────────────────────────────┘
```

---

## 7. FAZA 5 — ISH JARAYONI VA CHAT

### 7.1 Chat Screen — To'liq UX

```
┌──────────────────────────────────────┐
│  ←  Ali Valiyev        📋 Topshiriq │
│  🟢 Online · 5 daqiqa avval         │
│──────────────────────────────────────│
│                                      │
│  [SYSTEM: Kelishuv tasdiqlandi]      │
│                                      │
│          14:32                       │
│  ┌──────────────────────────────┐    │
│  │ Assalomu alaykum! Qabul      │    │  ← freelancer (chap)
│  │ qildim.                      │    │
│  └──────────────────────────────┘    │
│                                      │
│                        14:35         │
│   ┌────────────────────────────┐     │
│   │ Salom! GOST formatida      │     │  ← client (o'ng)
│   │ e'tibor bering.            │     │
│   └────────────────────────────┘     │
│                              ✓✓     │
│                                      │
│          16:47                       │
│  ┌──────────────────────────────┐    │
│  │ 📎 metodichka.pdf            │    │  ← fayl xabar
│  │ 1.2 MB                       │    │
│  │ [Ko'rish ▶️]  [Yuklab olish] │    │
│  └──────────────────────────────┘    │
│                                      │
│──────────────────────────────────────│
│                                      │
│  ── TOPSHIRIQ HOLATI ──────────────  │
│  🔵 IN_PROGRESS · 3 kun 14 soat     │
│  Progress: [████████░░] 80%          │
│  [Natija yuborish]                   │
│                                      │
│──────────────────────────────────────│
│  [📎] [📷] [Xabar yozing...]   [→]  │
└──────────────────────────────────────┘
```

### 7.2 Chat Fayl Almashinuvi — Xavfsizlik

```
RUXSAT ETILGAN fayl turlari (CHAT):

  Fayl turi  │ Max hajm │ Preview
  ───────────┼──────────┼───────────
  PDF        │ 50 MB    │ Inline
  DOCX/DOC   │ 50 MB    │ Text extract
  PPTX       │ 50 MB    │ Thumbnail
  XLS/XLSX   │ 20 MB    │ Text extract
  TXT        │ 5 MB     │ Inline
  ZIP/RAR    │ 50 MB    │ Fayl ro'yxati
  JPG/PNG    │ 20 MB    │ Inline
  Video      │ 50 MB    │ Thumbnail

RUXSAT ETILMAYDI:
  ❌ .exe, .bat, .sh, .ps1
  ❌ .apk, .ipa
  ❌ Parol himoyalangan ZIP
  ❌ 50 MB dan katta fayllar

XAVFSIZLIK QATLAMLARI:
  1. MIME type tekshirish (extension !== actual type → blok)
  2. Fayl nomi sanitization
  3. Telegram CDN orqali saqlash (direct URL yo'q)
```

### 7.3 Progress Tracker

```
Freelancer progress % o'rnatishi mumkin:

┌──────────────────────────────────────┐
│  Mening progressim                   │
│  [████████░░] 80%                    │
│  [10%] [25%] [50%] [75%] [100%]     │  ← tez tanlash
│  yoki qo'lda: [  80  ] %            │
│  [Yangilash]                         │
└──────────────────────────────────────┘

Progress yangilanganda:
→ Client'ga: "Freelancer progressni yangiladi: 80%"
→ Chat system xabar: "📊 Progress: 80%"
```

### 7.4 Milestone Tracking

```
Katta topshiriqlar uchun milestonelar:

Chat header → [📋 Topshiriq] → TaskPanel:

┌──────────────────────────────────────┐
│  TOPSHIRIQ REJASI                    │
│                                      │
│  ✅ 1. Reja (Mundarija)              │
│     Bajarildi: 10 iyun               │
│                                      │
│  🔵 2. Kirish qismi (5-10 bet)      │  ← hozirgi
│     Kutilmoqda: 11 iyun             │
│                                      │
│  ○  3. Asosiy qism (15-20 bet)      │
│  ○  4. Xulosa va adabiyotlar        │
│  ○  5. Yakuniy nazorat              │
│                                      │
│  [Milestone qo'shish]               │  ← faqat freelancer
└──────────────────────────────────────┘
```

---

## 8. FAZA 6 — YETKAZIB BERISH (DELIVERY)

### 8.1 Delivery Submission Flow

```
[🚀 Natija yuborish] → DeliverySheet:

┌──────────────────────────────────────┐
│  ████  Natija Yetkazish              │
│──────────────────────────────────────│
│                                      │
│  TOPSHIRIQ: Iqtisodiyot kurs ishi    │
│  Muddat: 12 iyun (1 kun qoldi) ⚠️   │
│                                      │
│  MAJBURIY: Fayl yuklash              │
│  ┌──────────────────────────────────┐│
│  │  📎 Asosiy faylni yuklang        ││
│  │  (PDF, DOCX, ZIP)                ││
│  └──────────────────────────────────┘│
│                                      │
│  ✅ kurs_ishi_final.pdf  (2.3 MB) × │
│                                      │
│  QO'SHIMCHA FAYLLAR (ixtiyoriy)      │
│  ○ plagiat_hisobot.pdf               │
│                                      │
│  IZOH                                │
│  ┌──────────────────────────────────┐│
│  │ 32 sahifa, GOST formatida.       ││
│  │ Antiplagiatura 85% chiqdi.       ││
│  └──────────────────────────────────┘│
│                                      │
│  ── QABUL QOIDALARI ──              │
│  ℹ️ Mijoz 48 soat ichida:            │
│  • Qabul qiladi → to'lov o'tkaziladi │
│  • Rad etadi → sabab bildiradi      │
│  • Javob bermasa → avto-qabul       │
│                                      │
│  ⚠️ Natijani faqat bir marta         │
│  yuborishingiz mumkin                │
│                                      │
│  [🚀 Natijani Yetkazish]            │
└──────────────────────────────────────┘
```

### 8.2 Watermark Jarayoni va PREVIEW_PENDING

```
Submit bosilgandan keyin (backend):

1. Upload progress bar ko'rsatiladi
2. Watermark qo'shiladi:
   - PDF: har sahifaga diagonal "PREVIEW — EduMarket" (opacity 0.25)
   - DOCX: header/footer watermark
   - ZIP: ichidagi fayllar preview da ko'rinadi
3. Task: IN_PROGRESS → PREVIEW_PENDING
4. Client'ga: "📬 Natija keldi! Ko'rib chiqing."

PREVIEW_PENDING holatida freelancer ko'radi:
┌──────────────────────────────────────┐
│  🟠 PREVIEW_PENDING                  │
│                                      │
│  Natijangiz mijozga yuborildi.       │
│  Kutilayotgan vaqt: 48 soat         │
│  ⏰ 12 iyun 23:59 gacha             │
└──────────────────────────────────────┘
```

### 8.3 Client — Preview Ko'rish

```
Client notification bosib TaskDetail ochiladi:

┌──────────────────────────────────────┐
│  ← Topshiriq                         │
│                                      │
│  🟠 NATIJA KELDI!                    │
│  Siz 48 soat ichida qaror qilishingiz│
│  ⏰ 12 iyun 23:59 gacha              │
│                                      │
│  ┌────────────────────────────────┐  │
│  │  📄 kurs_ishi_final.pdf        │  │
│  │  2.3 MB                        │  │
│  │                                │  │
│  │  ⚠️ PREVIEW REJIMI             │  │
│  │  Qabul qilsangiz watermarksiz  │  │
│  │  to'liq fayl yuklanadi.        │  │
│  │                                │  │
│  │  [👁️ Preview Ko'rish]         │  │
│  └────────────────────────────────┘  │
│                                      │
│  Freelancer izohi:                   │
│  "32 sahifa, GOST, antiplagiat 85%"  │
│                                      │
│  [✅ Qabul qilaman]                  │
│  [🔄 Qayta ishlash so'rayman]        │
│  [❌ Rad etaman]                     │
└──────────────────────────────────────┘
```

### 8.4 Watermarked Preview Viewer

```
[👁️ Preview Ko'rish]:

┌──────────────────────────────────────┐
│  ← Preview                  [Yopish] │
│──────────────────────────────────────│
│  ┌────────────────────────────────┐  │
│  │                                │  │
│  │   [HUJJAT MATNI]               │  │
│  │                                │  │
│  │   ░░░ PREVIEW ░░░              │  │  ← diagonal watermark
│  │   ░ EduMarket.uz ░             │  │
│  │   ░░░ PREVIEW ░░░              │  │
│  │                                │  │
│  │   [davomi...]                  │  │
│  │                                │  │
│  └────────────────────────────────┘  │
│  Sahifa 1 / 32                       │
│                                      │
│  ℹ️ Bu preview versiya.              │
│  "Qabul qilaman" bossangiz           │
│  watermarksiz to'liq fayl            │
│  avtomatik yuklanadi.                │
│                                      │
│  [✅ Qabul qilaman]                  │
└──────────────────────────────────────┘

TEXNIK TALABLAR:
- PDF: PDF.js orqali render
- Watermark: diagonal, 45°, opacity 0.25
- Yuklab olish tugmasi: o'chirilgan (preview paytida)
- Minimum ko'rish vaqti: 10 sekund
- "To'liq ko'rdim" checkbox — scroll bottom'ga etganda aktiv
```

---

## 9. FAZA 7 — REVIEW VA QABUL

### 9.1 Qabul Qilish Flow

```
[✅ Qabul qilaman] bosilganda:

Confirm modal:
┌──────────────────────────────────────┐
│  Natijani qabul qilasizmi?           │
│                                      │
│  ✅ To'liq fayl avtomatik yuklanadi  │
│  ✅ To'lov freelancerga o'tkaziladi  │
│  ✅ Topshiriq yakunlanadi            │
│                                      │
│  [Bekor]  [✅ Ha, qabul qilaman]    │
└──────────────────────────────────────┘

Tasdiqdan keyin:
1. Task: IN_REVIEW → COMPLETED
2. Full fayl (watermarksiz) client'ga
3. Escrow release → freelancer hisobiga
4. Ikkalasiga: "🎉 Topshiriq muvaffaqiyatli yakunlandi!"
5. Review yozish taklifnomasi darhol chiqadi
```

### 9.2 Auto-Complete (48 soat)

```
Client 48 soat ichida javob bermasa:

Timeline:
T+24h: "Ko'rib chiqishni unutmadingizmi?" reminder
T+40h: "8 soat qoldi, keyin avtomatik qabul"
T+48h: AVTOMATIK QABUL

→ Task: COMPLETED
→ To'lov: freelancerga avtomatik
→ Client'ga: "Vaqt tugadi. Natija avtomatik qabul qilindi."
→ Freelancerga: "🎉 To'lovingiz keldi!"
```

### 9.3 Revision Request (Qayta Ishlash)

```
[🔄 Qayta ishlash so'rayman]:

┌──────────────────────────────────────┐
│  ████  Qayta ishlash so'rovi         │
│──────────────────────────────────────│
│                                      │
│  Nima to'g'ri kelmadi? *             │
│  ┌────────────────────────────────┐  │
│  │ Kirish qismi juda qisqa.       │  │
│  │ GOST formati to'liq emas.      │  │
│  └────────────────────────────────┘  │
│                                      │
│  [📎 Qo'shimcha material]           │
│                                      │
│  ⚠️ Qayta ishlash muddat            │
│  uzaytirmaydi.                       │
│                                      │
│  [Yuborish]                         │
└──────────────────────────────────────┘

→ Task: PREVIEW_PENDING (qayta)
→ Freelancer yangi delivery yuboradi
3 marta qayta ishlashdan keyin:
  → "Dispute ochishni tavsiya qilamiz"
```

### 9.4 Rad Etish → Dispute

```
[❌ Rad etaman]:

⚠️ BU JIDDIY QADAM:

┌──────────────────────────────────────┐
│  ████  Natijani rad etish            │
│──────────────────────────────────────│
│                                      │
│  ⚠️ Diqqat! Bu jiddiy qadam.        │
│                                      │
│  Rad etish sababi *                  │
│  ○ Topshiriq bajarilmagan           │
│  ○ Sifat past                        │
│  ○ Muddat buzilgan                   │
│  ○ Topshiriq shartlariga mos emas   │
│  ○ Boshqa sabab                      │
│                                      │
│  Batafsil izoh *  [Kamida 30 belgi] │
│                                      │
│  ⚠️ Rad etish → Dispute jarayoni    │
│  Admin 24-48 soat ko'rib chiqadi    │
│                                      │
│  [Bekor qilish]  [Rad etaman →]    │
└──────────────────────────────────────┘
```

---

## 10. FAZA 8 — REVIEW YOZISH VA YOPISH

### 10.1 Review Screen — Premium UX

```
Task COMPLETED bo'lgandan keyin IKKALASIGA:

┌──────────────────────────────────────┐
│  🎉 Topshiriq yakunlandi!            │
│──────────────────────────────────────│
│                                      │
│  Ali bilan ishlash tajribangizni     │
│  baholang                            │
│                                      │
│  UMUMIY BAHO *                       │
│  ★ ★ ★ ★ ★                         │  ← tap yoki swipe
│  [Ajoyib!]                           │  ← 5 yulduz label
│                                      │
│  Muayyan baholar:                    │
│  Sifat:    ★ ★ ★ ★ ★               │
│  Muloqot:  ★ ★ ★ ★ ☆              │
│  Muddat:   ★ ★ ★ ★ ★               │
│                                      │
│  SHARHINGIZ *                        │
│  ┌────────────────────────────────┐  │
│  │ Ali juda professional.         │  │
│  │ Muddatidan oldin bajardi.      │  │
│  │ Tavsiya qilaman!               │  │
│  └────────────────────────────────┘  │
│  [Kamida 20 belgi] [0/500]           │
│                                      │
│  💡 Review 7 kun ichida majburiy.    │
│  Keyin imkonsiz bo'ladi.             │
│                                      │
│  [O'tkazib yuborish — keyin yozaman] │  ← 7 kun ichida
│  [⭐ Review yuborish]               │
└──────────────────────────────────────┘
```

### 10.2 Yulduz Rating Interaksiyasi

```
LABEL QIYMATLARI:
  1 yulduz — Juda yomon
  2 yulduz — Yomon
  3 yulduz — O'rtacha
  4 yulduz — Yaxshi
  5 yulduz — Ajoyib!

HAPTIC:
  Har yulduz tap → LIGHT haptic
  5 ta to'ldi  → SUCCESS haptic + wave animatsiya

1-2 YULDUZ BELGILANDA:
┌────────────────────────────────────┐
│  ⚠️ Muammo bo'ldimi?              │
│  [Dispute ochish]                  │
│  [Yo'q, faqat past baho beraman]  │
└────────────────────────────────────┘
```

### 10.3 Review Anti-fraud

```
REVIEW HISOBGA OLINISH SHARTLARI:
  ✅ IN_PROGRESS davomi >= 24 soat
  ✅ Ikki xil device/IP
  ✅ Tabiiy matn (template emas)

HISOBGA OLINMAYDI:
  ❌ IN_PROGRESS < 24 soat → isCountedInRating = false
  ❌ Bir IP'dan ikki tomon → manual review
  ❌ Template matn (>50% o'xshashlik) → spam filter
```

---

## 11. FAYL XAVFSIZLIGI — HAR TUR UCHUN

### 11.1 Fayl Xavfsizlik Matritsasi

```
Fayl turi         │ Task holati    │ Kim ko'radi  │ Watermark │ Yuklash
──────────────────┼────────────────┼──────────────┼───────────┼────────
Client material   │ OPEN+          │ Hamma        │ Yo'q      │ ✅
Freelancer natija │ PREVIEW_PENDING│ Faqat client │ ✅ MAJBURIY│ ❌
Freelancer natija │ IN_REVIEW      │ Faqat client │ ✅ MAJBURIY│ ❌
Freelancer natija │ COMPLETED      │ Faqat client │ ❌ Yo'q   │ ✅
Chat fayllar      │ Har doim       │ Ikkala tomon │ Yo'q      │ ✅
Portfolio         │ Profil         │ Hamma        │ Yo'q      │ ✅
Student card      │ Verify         │ Faqat admin  │ N/A       │ ❌ (admin)
```

### 11.2 PDF Watermarking Texnikasi

```
BACKEND PROTOKOL:

PDF fayllar:
  1. Freelancer yuklaydi → Telegram CDN
  2. Backend PyMuPDF / pdf-lib orqali:
     - Har sahifaga: "PREVIEW — EduMarket.uz"
     - Font: 60pt, opacity 0.25, angle: 45°
     - Pozitsiya: sahifa markazi
  3. Watermarked versiya: alohida file_id
  4. Original: encrypted (faqat COMPLETED da berish)

DOCX fayllar:
  - python-docx orqali header + footer watermark

ZIP fayllar:
  - Extract → har faylga alohida watermark → Re-zip
  - ZIP index (fayl ro'yxati) preview sifatida

JPG/PNG:
  - Sharp / Pillow orqali overlay
  - Pasaytirilgan sifat (print uchun yaroqsiz)
```

### 11.3 Telegram File Safety

```
EduMarket Telegram CDN arxitekturasi:

QANDAY ISHLAYDI:
  1. Bot private kanalga fayl yuboradi
  2. Telegram file_id qaytariladi (permanent)
  3. Faqat bot orqali file_id → URL resolve
  4. Frontend Telegram WebApp → bot → file

XAVFSIZLIK:
  ✅ URL to'g'ridan-to'g'ri ochilmaydi (bot token kerak)
  ✅ Telegram CDN'da (bizning serverda emas)
  ✅ file_id qo'lda yasab bo'lmaydi

KELAJAK YECHIM:
  - Token-based, vaqt cheklangan URL
  - Server-side PDF rendering (screenshot himoyasi)
```

---

## 12. KATEGORIYA-SPESIFIK UX YONDASHUVLARI

### 12.1 KURS_ISHI va REFERAT — Maxsus Protokol

```
TASK YARATISHDA:
  - Sahifa soni MAJBURIY maydon
  - Antiplagiatura % MAJBURIY
  - "Akademik maqsadlar uchun" checkbox (ToS)

DELIVERY'DA:
  - Asosiy hujjat + MAJBURIY: antiplagiatura hisoboti
  - Watermark: 2 qatlam (matn + logo)

REVIEW'DA:
  - "Antiplagiatura samarali bo'ldimi?" alohida savol
```

### 12.2 TARJIMA — Maxsus Flow

```
TASK YARATISHDA:
  - So'z soni kalkulyator: matn paste → avtomatik hisob
  - Narx suggest: so'z soni × kategoriya tarifi
  - Til juftligi dropdown

DELIVERY'DA:
  - Ikki kolonne: asl + tarjima (optimal)
  - Yoki alohida: original.pdf + translation.pdf
```

### 12.3 LABORATORIYA — Dasturlash

```
TASK YARATISHDA:
  - Subkategoriya: Fizika/Kimyo/Bio/Dasturlash
  - Dasturlash: til tanlash (Python/C++/Java/JS)

DELIVERY'DA:
  - ZIP: kod + README.md
  - GitHub link (read-only, ruxsat etilgan)

PREVIEW'DA:
  - .py, .js: syntax highlighting bilan inline
  - README.md: rendered markdown
```

### 12.4 SLAYD — Maxsus Flow

```
TASK YARATISHDA:
  - Slide soni: aniq yoki taxminiy
  - Animatsiya kerakmi? toggle
  - Branding: rang, logo, shrift (fayl)

DELIVERY'DA:
  - PPTX + PDF (ikkalasini yuborish — kuchli bonus)

PREVIEW'DA:
  - Slide-by-slide viewer
  - Navigation: ← → yoki swipe
  - Zoom: pinch
```

---

## 13. DISPUTE VA CONFLICT RESOLUTION

### 13.1 Dispute Ochish

```
Dispute ochadigan holatlar:
  1. Client natijani rad etadi → auto dispute
  2. Freelancer: deadline o'tdi, client javob bermaydi
  3. Fraud shubha

DISPUTE OCHAR UI:

┌──────────────────────────────────────┐
│  ████  Muammo bildirish              │
│──────────────────────────────────────│
│                                      │
│  Muammo turi *                       │
│  ○ Topshiriq bajarilmadi            │
│  ○ Sifat past                        │
│  ○ Muloqot muammosi                  │
│  ○ To'lov muammosi                   │
│  ○ Boshqa                            │
│                                      │
│  Batafsil izoh *  [Kamida 50 belgi] │
│                                      │
│  [📎 Screenshot yoki fayl]          │
│                                      │
│  ⚠️ Noto'g'ri dispute:               │
│  reyting tushirilishi mumkin         │
│                                      │
│  [Yuborish]                         │
└──────────────────────────────────────┘
```

### 13.2 Admin Dispute Qarorlari

```
RESOLVED_FOR_CLIENT:
  → Client to'lovini qaytarish
  → Freelancer reyting -

RESOLVED_FOR_FREELANCER:
  → To'lovni freelancerga o'tkazish
  → Client warning

CLOSED:
  → Qo'lda hal, ikkalasi ma'qul emas

Ikkalasiga admin qarori notification yuboriladi.
```

---

## 14. EDGE CASELAR

### 14.1 Deadline O'tishi

```
T-24h: "Muddatingiz yaqinlashmoqda" (freelancerga)
T-2h:  "Shoshiling! 2 soat qoldi"
T+0:   Deadline o'tdi

Client variantlari:
  - "Muddat uzaytirish" (24/48/72 soat)
  - "Dispute ochish"
  - "Bekor qilish"
```

### 14.2 Freelancer Ghost (Javob Bermasin)

```
T+24h: Bot freelancerga reminder
T+48h: Client'ga "Boshqasini topish" tugmasi
       → Client bekor qilsa → narx qaytariladi
       → Freelancer: reyting -0.5
T+72h: Admin avtomatik dispute
```

### 14.3 Client Ghost (Review Bermasin)

```
T+24h: "Ko'rib chiqishni unutmadingizmi?" (PREVIEW_PENDING)
T+40h: "8 soat qoldi"
T+48h: AVTOMATIK QABUL → COMPLETED → to'lov freelancerga
```

### 14.4 Revision Loop

```
3 marta qayta ishlashdan keyin:
  → Chat system xabar: "3 ta reviziya bo'ldi.
     Kelishuv bo'lmasa, Dispute oching."
  → Admin monitoring
```

### 14.5 Partial Completion

```
Freelancer bir qismini bajara olmasa:
  → Client qabul qilsa → COMPLETED (kelishuv)
  → Client qabul qilmasa → Dispute
  → Admin narx ajratishi: 70%/30%
```

---

## 15. MICRO-INTERACTION VA ANIMATION STANDARTLARI

### 15.1 Task Yaratish Animatsiyalari

```
STEP O'TISH:
  - Yangi step: slide-in right (300ms, ease-out)
  - Orqaga: slide-in left (300ms, ease-out)
  - Progress fill: 400ms animatsiya

FORM INTERAKSIYALAR:
  - Focus: input border 2px → 3px (150ms)
  - Error state: shake animatsiya (300ms, 4 shake)
  - Valid: border yashil + checkmark
  - Char count: normal → sariq (50%) → qizil (100%)

FILE UPLOAD:
  - Drag: dashed border pulse
  - Progress: animated bar
  - Complete: karta slip-in (300ms)
  - Remove: fade + scale out (200ms)
```

### 15.2 Status O'zgarishi Animatsiyalari

```
OPEN → ASSIGNED:      pulse flash (3x) + rang o'zgarish
IN_PROGRESS → PREV:   shimmer effekt
PREV → COMPLETED:     confetti burst (0.5s)
→ DISPUTED:           red flash + shake
```

### 15.3 Haptic Feedback Jadvali

```
Task yaratish tugallandi:  SUCCESS (1x kuchli)
Step o'tish:               LIGHT (1x)
Xato:                      ERROR (2x tez)
Review 5 yulduz:           SUCCESS + MEDIUM combo
Dispute ochish:            HEAVY (1x)
File upload complete:      LIGHT (1x)
Bid qabul qilindi:         SUCCESS (1x)
```

---

## 16. NOTIFICATION ARXITEKTURASI

### 16.1 Barcha Lifecycle Notification Eventlari

```
EVENT                    → KIM          → XABAR
────────────────────────────────────────────────────────────────
Task OPEN                → Client       "✅ Topshirig'ingiz e'lon qilindi"
Yangi bid                → Client       "💼 [Ism] taklif berdi: [narx] so'm"
Bid qabul                → Freelancer   "🎉 Taklifingiz qabul qilindi!"
Bid rad (boshqa tanlandi)→ Freelancer   "Kechirasiz, boshqa mutaxassis tanlandi"
Task IN_PROGRESS         → Client       "▶️ [Freelancer] ish boshladi"
Progress yangilandi      → Client       "📊 Progress: [%]%"
PREVIEW_PENDING          → Client       "📬 Natija keldi! 48 soat vaqt bor"
48h reminder (T+24h)     → Client       "⏰ 24 soat qoldi. Ko'rib chiqing."
48h reminder (T+40h)     → Client       "⚠️ 8 soat qoldi. Avtomatik qabul!"
Task COMPLETED           → Ikkalasiga   "🎉 Topshiriq muvaffaqiyatli yakunlandi!"
Review eslatma           → Ikkalasiga   "⭐ Tajribangizni baholang (7 kun)"
Review T+3 kun           → Ikkalasiga   "⭐ Bahoni unutmadingizmi? 4 kun qoldi."
Review T+6 kun           → Ikkalasiga   "⭐ Oxirgi kun!"
Dispute ochildi          → Ikkalasiga   "🔴 Dispute ochildi. Admin ko'rib chiqadi."
Dispute yakunlandi       → Ikkalasiga   "Dispute natijasi: [qaror]"
```

### 16.2 Notification Sozlamalari

```
FOYDALANUVCHI O'CHIRISHI MUMKIN:
  ✅ Progress yangilanishi
  ✅ Yangi bid xabarlari

O'CHIRIB BO'LMAYDI (majburiy):
  ❌ Task holati o'zgarishi
  ❌ To'lov xabarlari
  ❌ Dispute xabarlari
  ❌ Review deadline
```

---

## 17. ANTI-FRAUD UX PATTERNS

### 17.1 Flash Delivery Fraud

```
MUAMMO: Bo'sh fayl → client e'tiborsiz qabul qiladi

HIMOYA:
  1. Preview mandatory (skip qilib bo'lmaydi)
  2. Minimum 10 sekund ochiq bo'lishi
  3. "To'liq ko'rdim" checkbox (scroll bottom'da aktiv)
  4. Auto-accept bloker: "Siz faylni ko'rmadingiz!"

BACKEND:
  - deliveryViewedAt timestamp
  - viewDurationSeconds ≥ 10 tekshiruvi
```

### 17.2 NLP Monitoring — Chat va Task

```
REAL-TIME (500ms debounce):

WARNING triggerlar:
  - Telefon: \+998[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}
  - Telegram: @[a-zA-Z0-9_]{5,}
  - "whatsapp", "telegram'da"
  - "naqd", "karta raqami"

BLOCK triggerlar:
  - Boshqa platforma URL lari
  - To'g'ridan to'g'ri to'lov so'rash

WARNING UI:
┌────────────────────────────────────┐
│  ⚠️ Muloqot platformada bo'lsin   │
│  [Men tushundim] [Xabarni o'zgartir]│
└────────────────────────────────────┘

BLOCK UI:
┌────────────────────────────────────┐
│  🚫 Xabar yuborilmadi             │
│  Platformadan tashqari kelishuv    │
│  qoidalarga zid.                   │
└────────────────────────────────────┘
```

---

## 18. KELAJAKDAGI KENGAYTMALAR (v2.0+)

### 18.1 AI Smart Matching

```
Hozir: Freelancer o'zi qidiradi

Kelajak (v2.0):
  "AI Match" — Task yaratganda 3-5 mos freelancer suggest:
  
┌──────────────────────────────────────┐
│  🤖 AI Tavsiya                       │
│                                      │
│  Bu topshiriq uchun:                 │
│  ★ Ali Valiyev (98% mos)             │
│  ★ Kamola Yusupova (94% mos)         │
│                                      │
│  [To'g'ridan yuboring]              │
└──────────────────────────────────────┘
```

### 18.2 Real Escrow (Click/Payme)

```
Hozir: Virtual escrow (admin qo'lda)

Kelajak (v2.0):
  1. Task ASSIGNED → client Click/Payme orqali to'laydi
  2. Pul EduMarket escrow hisobida
  3. COMPLETED → freelancerga avtomatik
  4. Dispute → admin bo'lishi
```

### 18.3 Voice/Video Delivery

```
Kelajak (v2.5):
  - Screencast (kod tushuntirish uchun)
  - Audio nota (og'zaki sharh)
  - Video call (premium, freelancer taklif qiladi)
```

### 18.4 Team Tasks (v3.0)

```
Kelajak (v3.0):
  - 1 task → ko'p freelancer (team)
  - Milestone-based to'lov
  - Task template marketplace
```

---

## XULOSA — GOLD STANDARD

```
MUKAMMAL TASK JARAYONI:

CLIENT his qilishi:
  ✅ Topshiriq berish 3 daqiqadan kam
  ✅ To'g'ri odamni tezda topdim
  ✅ Natijani ko'rib, xavfsiz qabul qildim
  ✅ Pul oldida ham, keyin ham xavfsiz edi

FREELANCER his qilishi:
  ✅ Mos topshiriqni 1 daqiqada topdim
  ✅ Narxni o'zim belgiladim
  ✅ Chat orqali muammolarni hal qildim
  ✅ Natijani yukladim va to'lovimni oldim
  ✅ Portfolio'imga yangi ish qo'shildi

PLATFORMA maqsadi:
  ✅ Har topshiriq trail qilindi
  ✅ Fraud minimallashtirildi
  ✅ Ikkalasi ham qoniqdi → qayta keladi
```

---

*EduMarket Task Lifecycle UX Bible v1.0 | 2026-06-09*
*Bu loyihaning YURAGI. Har qanday task-related qaror shu hujjatga asoslanishi SHART.*
