# EduMarket Design System & UI/UX Bible
> **Versiya:** 1.0 | **Sana:** 2026-06-09  
> **Maqsad:** Har qanday yangi element, sahifa yoki komponent qo'shishda bu hujjatdan aniq ko'rsatma topilsin.  
> **Qoida:** Bu hujjatda yozilganlar MAJBURIY. Istisno faqat Product Owner ruxsati bilan.

---

## 1. FALSAFA VA PRINSIPLAR

### Dizayn Falsafasi
EduMarket dizayni **uchta asosiy tamoyilga** qurilgan:

1. **Premium Simplicity** — Har bir element o'z o'rnida. Ortiqcha narsa yo'q. Yetishmayotgan ham yo'q.
2. **Native Feel** — iOS/Android nativega o'xshash his. Foydalanuvchi ilovada emas, tizimda ekanini his qilsin.
3. **Trust First** — Moliyaviy platformada ishonch birinchi. Har bir vizual qaror "bu platforma ishonchli" degan hissiyotni mustahkamlashi kerak.

### Dizaynchi uchun 5 ta "YO'Q"
1. ❌ **YO'Q** — Hardcoded ranglar. Hech qachon `#007AFF` yozmang. Har doim `var(--edu-primary)` yoki Tailwind token.
2. ❌ **YO'Q** — `font-black` (900) ni haddan oshirish. Bir sahifada max 2-3 element `font-black`.
3. ❌ **YO'Q** — 44px'dan kichik touch target. Hech qachon.
4. ❌ **YO'Q** — Pixel-perfect bezaklarsiz qoldirish. Har bir interaktiv element hover/active statega ega bo'lishi shart.
5. ❌ **YO'Q** — Loading state va Empty state'siz screen. Hech qachon.

---

## 2. RANG PALITASI (Color Palette)

### 2.1 Token Tizimi

**Qoida:** Hech qachon rang qiymatini to'g'ridan-to'g'ri yozmang. Faqat tokenlar ishlatiladi.

```css
/* === ASOSIY RANG TOKENLAR === */

/* Fon (Background) */
--edu-bg: #F2F2F7;          /* Asosiy fon — iOS grouped background */
--edu-surface: #FFFFFF;     /* Karta va panel foni */
--edu-surface-2: #F9F9F9;   /* Ikkinchi darajali panel foni */

/* Matn (Text) */
--edu-text: #000000;        /* Asosiy matn */
--edu-muted: #8E8E93;       /* Ikkinchi darajali matn, placeholders */

/* Chegara (Border) */
--edu-border: rgba(60, 60, 67, 0.12);  /* Yengil chegara */

/* Brend Ranglar */
--edu-primary: #10B981;     /* Asosiy brand rangi — Emerald Green */
--edu-primary-d: #059669;   /* Primary'ning to'q varianti (hover) */
--edu-accent: #6366F1;      /* Ikkinchi rang — Indigo */
--edu-urgent: #FF3B30;      /* Xatar va urgent holat */
--edu-vip: #AF8B3B;         /* VIP badge — Muted Gold */
```

### 2.2 Rol bo'yicha Rang O'zgarishi

```css
/* FREELANCER modida: Indigo asosiy rang */
.workspace-freelancer {
  --edu-primary: #6366F1;
  --edu-primary-d: #4F46E5;
  --edu-accent: #10B981;
}

/* CLIENT modida: Green asosiy rang */
.workspace-client {
  --edu-primary: #10B981;
  --edu-primary-d: #059669;
  --edu-accent: #6366F1;
}
```

### 2.3 Dark Mode Ranglar

```css
.dark {
  --edu-bg: #000000;           /* Qora — iOS true black */
  --edu-surface: #1C1C1E;     /* Dark card surface */
  --edu-surface-2: #2C2C2E;   /* Dark secondary surface */
  --edu-border: rgba(84, 84, 88, 0.48);
  --edu-muted: #98989D;
  --edu-text: #FFFFFF;
  
  /* Brand ranglar dark modeda ham bir xil */
  --edu-primary: #10B981;
  --edu-accent: #818CF8;      /* Indigo'ning yoritilgan varianti */
}
```

### 2.4 Status Ranglari

```css
--status-open: #34C759;       /* Ochiq — iOS Green */
--status-assigned: #5856D6;  /* Tayinlangan — iOS Indigo */
--status-progress: #007AFF;  /* Jarayonda — iOS Blue */
--status-review: #FF9500;    /* Ko'rib chiqilmoqda — iOS Orange */
--status-completed: #34C759; /* Yakunlangan — Green */
--status-canceled: #8E8E93;  /* Bekor — Gray */
--status-disputed: #FF3B30;  /* Munozarali — Red */
```

### 2.5 Rang Qo'llash Qoidalari

| Rang | Qachon ishlatiladi | Qachon ishlatilmaydi |
|:-----|:------------------|:--------------------|
| `edu-primary` | CTA tugmalar, aktiv holatlar, asosiy link | Dekorativ elementlar, background |
| `edu-accent` | Ikkinchi darajali tugmalar, badge'lar | Asosiy CTA sifatida |
| `edu-urgent` | Xato holatlari, deadline warning | Oddiy ma'lumot uchun |
| `edu-muted` | Subtitle, placeholder, label | Asosiy kontent matn |
| `edu-vip` | Faqat VIP elementlar | Boshqa maqsadlar uchun |

---

## 3. TIPOGRAFIYA (Typography)

### 3.1 Font Family

```css
/* Display: Sarlavhalar, katta matnlar */
--font-display: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif;

/* Body: Asosiy matn, paragraflar */
--font-body: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif;
```

### 3.2 Font Size Jadvali (Tailwind Tokens)

| Token | px | line-height | Qachon ishlatiladi |
|:------|:---|:-----------|:-----------------|
| `text-2xs` | 10px | 14px | Eng kichik label, badge |
| `text-xs` | 12px | 16px | Caption, metadata |
| `text-sm` | 13px | 18px | Secondary text, subtitle |
| `text-base` | 14px | 20px | Asosiy body text |
| `text-md` | 15px | 22px | Muhim body text |
| `text-lg` | 16px | 24px | Sarlavha, section title |
| `text-xl` | 18px | 26px | Katta sarlavha |
| `text-2xl` | 20px | 28px | Sahifa sarlavhasi |
| `text-3xl` | 24px | 32px | Hero sarlavha |
| `text-4xl` | 28px | 36px | Splash sarlavha |

### 3.3 Font Weight Qoidalari

```
400 (normal)   → Asosiy body text, uzun paragraflar
500 (medium)   → Muhim body text, subtitle
600 (semibold) → Section label, nav items
700 (bold)     → Sarlavhalar, tugma matni
800 (extrabold)→ Hero sarlavhalar
900 (black)    → FAQAT: raqamlar (narx, statistika), primary CTA
```

**QOIDA:** Bir sahifada maksimum 3 xil font weight ishlatilsin.

### 3.4 Letter Spacing

```css
/* iOS display sarlavhalar uchun — yengil siqilish */
letter-spacing: -0.022em;  /* Tailwind: tracking-ios-display */

/* iOS body matn uchun */
letter-spacing: -0.011em;  /* Tailwind: tracking-ios-text */

/* Uppercase label uchun — keng oraliq */
letter-spacing: 0.08em;    /* Tailwind: tracking-widest */
letter-spacing: 0.15em;    /* Section sarlavhalar uchun */
```

---

## 4. SPACING (Bo'shliq tizimi)

### 4.1 Base Unit

**1 unit = 4px** (Tailwind default)

### 4.2 Spacing Qoidalari

```
Komponent ichida (padding):
├── Kichik karta: p-3 (12px) yoki p-3.5 (14px)
├── O'rta karta: p-4 (16px)
├── Katta karta / section: p-5 (20px) yoki p-6 (24px)
└── Hero block: p-8 (32px) va undan ko'p

Komponentlar orasida (gap/margin):
├── Inline elementlar orasida: gap-1.5 (6px) - gap-2 (8px)
├── List itemlar orasida: gap-2.5 (10px) - gap-3 (12px)
├── Kartalar orasida: gap-3 (12px) - gap-4 (16px)
├── Section'lar orasida: mb-6 (24px) - mb-8 (32px)
├── Sahifa section'lari orasida: mb-10 (40px) - mb-12 (48px)
└── Bottom navigation uchun: pb-24 (96px)
```

### 4.3 Maxsus Spacing Tokenlar

```css
--nav-height: 64px;      /* Bottom navigation balandligi */
--header-height: 56px;   /* Top header balandligi */
```

---

## 5. BORDER RADIUS (Burchak radiuslari)

### 5.1 Token Tizimi

```
MUHIM: index.css va tailwind.config.js mos kelishi SHART.
Quyida YAGONA MANBA sifatida qabul qiling:
```

| Token | Qiymat | Tailwind | Qachon ishlatiladi |
|:------|:-------|:---------|:-----------------|
| `radius-sm` | 8px | `rounded-lg` | Chip, badge, kichik element |
| `radius-md` | 12px | `rounded-xl` | Input, tugma |
| `radius-lg` | 16px | `rounded-2xl` | Karta (card) |
| `radius-xl` | 20px | `rounded-[20px]` | Katta karta, modal |
| `radius-2xl` | 24px | `rounded-3xl` | Bottom sheet, hero karta |
| `radius-full` | 9999px | `rounded-full` | Avatar, pill badge |

### 5.2 Qo'llash Qoidalari

```
Tugmalar (Button):
├── Kichik tugma: rounded-xl (12px)
├── O'rta tugma: rounded-xl yoki rounded-2xl (12-16px)
├── Katta CTA: rounded-2xl (16px)
└── Pill/Tag tugma: rounded-full

Kartalar (Card):
├── Ro'yxat elementi: rounded-2xl (16px)
├── Katta karta: rounded-3xl (24px)
├── Modal/Sheet: rounded-t-3xl (yuqori burchaklar)

Icon Container:
├── Kichik (32px): rounded-xl (12px)
├── O'rta (40-48px): rounded-[14px] yoki rounded-2xl
└── Katta (56px+): rounded-3xl

Avatar:
├── Har doim: rounded-full
```

---

## 6. SOYALAR (Shadows)

### 6.1 Shadow Token Tizimi

```css
/* Minimal — list items, subtle elements */
--shadow-premium-sm: 0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.02);

/* O'rta — asosiy kartalar */
--shadow-premium-md: 0 12px 34px -10px rgba(0,0,0,0.08), 0 4px 14px -2px rgba(0,0,0,0.03);

/* Katta — hero karta, modal */
--shadow-premium-lg: 0 24px 48px -12px rgba(0,0,0,0.12), 0 8px 16px -4px rgba(0,0,0,0.04);

/* Tugma soyasi — brand rang soyasi */
--shadow-premium-btn: 0 10px 20px -5px color-mix(in srgb, var(--edu-primary) 40%, transparent);
```

### 6.2 Tailwind Shadow Tokens

```javascript
// tailwind.config.js
boxShadow: {
  'ios':    '0 4px 14px 0 rgba(0,0,0,0.04), 0 2px 5px 0 rgba(0,0,0,0.02)',
  'ios-lg': '0 10px 30px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)',
  'card':   '0 1px 3px rgba(0,0,0,0.02), 0 4px 12px rgba(0,0,0,0.03)',
  'nav':    '0 -0.5px 0 rgba(0,0,0,0.1), 0 -4px 20px rgba(0,0,0,0.02)',
  'sheet':  '0 -10px 40px -10px rgba(0,0,0,0.12)',
  'btn':    '0 8px 20px -4px rgba(0,122,255,0.3)',
  'vip':    '0 8px 20px -4px rgba(175,139,59,0.3)',
}
```

### 6.3 Qo'llash Qoidalari

```
shadow-ios      → Ro'yxat kartalari, kichik komponentlar
shadow-ios-lg   → Muhim kartalar, aktiv elementlar
shadow-card     → Default karta holati
shadow-nav      → Bottom navigation bar (tepaga qarab)
shadow-sheet    → Bottom sheet (tepaga qarab)
shadow-btn      → Asosiy CTA tugmalar
shadow-vip      → VIP elementlar
```

---

## 7. ANIMATSIYALAR VA TRANSITTION

### 7.1 Timing Functions

```css
/* Spring animatsiyasi — iOS native feel */
--spring-duration: 0.4s;
--spring-easing: cubic-bezier(0.17, 0.67, 0.12, 1);

/* Tez va qisqa — press effect */
transition: 0.12s ease;

/* O'rta — karta hover */
transition: 0.3s cubic-bezier(0.16, 1, 0.3, 1);

/* Sekin — sheet/modal */
transition: 0.5s cubic-bezier(0.32, 0.72, 0, 1);
```

### 7.2 Animatsiya Turlari (Tailwind)

| Nom | Qachon ishlatiladi |
|:----|:------------------|
| `animate-fade-up` | Sahifa ochilishida kontentlar |
| `animate-fade-in` | Modal, tooltip paydo bo'lishida |
| `animate-slide-up` | Bottom sheet ochilishida |
| `animate-shimmer` | Loading skeleton |
| `animate-pulse-dot` | Unread indicator, status dot |

### 7.3 Press/Hover Effektlar

```css
/* Tugma press effekti — MAJBURIY har bir tugmada */
.press-scale:active {
  transform: scale(0.96);
  opacity: 0.85;
  /* transition: 0.12s ease */
}

/* Karta hover effekti */
.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-premium-lg);
}

/* Active spring (kuchliroq) */
.active-spring:active {
  transform: scale(0.95);
  opacity: 0.85;
}
```

**QOIDA:** Har qanday kliklaniladigan element (tugma, karta, link) press effektga ega bo'lishi SHART.

---

## 8. GLASSMORPHISM VA PREMIUM UTILITIES

### 8.1 iOS Glass Effect

```css
/* Shisha effekti — navbar, floating card */
.ios-glass {
  background: color-mix(in srgb, var(--edu-surface) 75%, transparent);
  backdrop-filter: saturate(180%) blur(24px);
  -webkit-backdrop-filter: saturate(180%) blur(24px);
  border: 1px solid color-mix(in srgb, var(--edu-text) 5%, transparent);
}

/* Dark modeda */
.dark .ios-glass {
  background: color-mix(in srgb, var(--edu-surface) 60%, transparent);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

### 8.2 Aurora Background

```css
/* Hero section, home screen foni */
.bg-mesh-aurora {
  background-color: var(--edu-bg);
  background-image: 
    radial-gradient(at 0% 0%, rgba(29, 158, 117, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(83, 74, 183, 0.15) 0px, transparent 50%);
  background-attachment: fixed;
}
```

### 8.3 Premium Card

```css
/* Asosiy karta stilyati */
.premium-card {
  background: var(--edu-surface);
  box-shadow: var(--shadow-premium-md);
  border-radius: var(--radius-lg); /* 16px */
  border: 0.5px solid color-mix(in srgb, var(--edu-text) 8%, transparent);
  transition: all var(--spring-duration) var(--spring-easing);
  position: relative;
  overflow: hidden;
}

/* Shisha ko'rinish qatlamchasi */
.premium-card::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  border: 1px solid color-mix(in srgb, #FFFFFF 10%, transparent);
  opacity: 0.5;
}
```

---

## 9. KOMPONENT DIZAYN QOIDALARI

### 9.1 Tugmalar (Buttons)

```
Birlamchi CTA (Primary):
├── Background: edu-primary (gradient tavsiya qilinadi)
├── Matn: oq, font-black, text-base/md
├── Padding: px-6 py-3.5 (24px x 14px)
├── Radius: rounded-2xl (16px)
├── Shadow: shadow-btn yoki brand rang soyasi
├── Press: scale(0.96), opacity 0.85
└── Min height: 52px (WCAG)

Ikkinchi darajali (Secondary):
├── Background: edu-surface
├── Border: 1px solid edu-border
├── Matn: edu-text, font-bold
├── Press: scale(0.97), opacity 0.9
└── Min height: 48px

Xavfli (Destructive):
├── Background: edu-urgent/10 yoki transparent
├── Matn: edu-urgent, font-bold
├── Border: edu-urgent/30
└── Tasdiq so'rashi SHART

Pill tugma (Tag):
├── Background: token/10 rangi
├── Matn: token rangi
├── Radius: rounded-full
├── Padding: px-4 py-1.5
└── Min height: 32px
```

### 9.2 Kartalar (Cards)

```
Ro'yxat elementi (List Card):
├── Background: edu-surface
├── Radius: rounded-2xl (16px)
├── Shadow: shadow-ios
├── Border: 0.5px solid edu-border
├── Padding: p-4 (16px)
├── Press effect: MAJBURIY
└── Min height: 64px

Katta karta (Hero Card):
├── Background: gradient yoki solid
├── Radius: rounded-3xl (24px)
├── Shadow: shadow-ios-lg
├── Padding: p-5 yoki p-6
└── Min height: 120px

Statistika kartasi:
├── Radius: rounded-2xl
├── Padding: p-4
├── Balandlik: h-28 (112px) — konsistentlik uchun
└── Icon container: 36x36px, rounded-2xl
```

### 9.3 Inputlar (Form Inputs)

```
Text Input:
├── Background: edu-surface
├── Border: 1px solid edu-border (aktiv: edu-primary)
├── Radius: rounded-xl (12px)
├── Padding: px-4 py-3.5
├── Font: text-md (15px)
├── Min height: 52px (WCAG 44px+ shart)
├── Placeholder: edu-muted rangi
└── Error state: edu-urgent border + error message

Textarea:
├── Xuddi Text Input'ga o'xshash
└── Min height: 120px

Select:
├── Native select yoki Radix UI Select
└── Vizual jihatdan Text Input'ga o'xshash
```

### 9.4 Badge va Chip

```
Status Badge:
├── Font: text-2xs (10px), font-black, uppercase
├── Letter spacing: tracking-wider
├── Padding: px-2.5 py-1
├── Radius: rounded-full
├── Background: status-{holat}/10
├── Matn: status-{holat} rangi
└── Min touch target: 32px (avatar'da)

Skill Chip:
├── Padding: px-3 py-1.5
├── Radius: rounded-full
├── Font: text-xs, font-bold
├── Min height: 32px
└── Min width: 44px (tap friendly)
```

### 9.5 Avatar

```
Kichik (sm): 32x32px, rounded-full
O'rta (md): 40x40px, rounded-full
Katta (lg): 48x48px, rounded-full
X-katta (xl): 64x64px yoki 80x80px, rounded-full

Fallback: Boshlang'ich harf, brand gradient background
```

---

## 10. NAVIGATSIYA QOIDALARI

### 10.1 Bottom Navigation

```
├── Balandlik: 64px + safe-area-inset-bottom
├── Background: ios-glass (backdrop-filter)
├── Border top: 0.5px solid edu-border
├── Shadow: shadow-nav
├── Icon: 24x24px, lucide-react
├── Label: text-2xs (10px), font-bold, uppercase
├── Aktiv: edu-primary rangi
├── Passiv: edu-muted rangi
└── Tap area: min 44x44px
```

### 10.2 Top Header

```
├── Balandlik: 56px
├── Background: ios-glass
├── Matn: text-lg/xl, font-black
├── Back button: 44x44px tap area
└── Action button: 44x44px tap area
```

---

## 11. LOADING VA EMPTY STATES

### 11.1 Skeleton Loading

```
QOIDA: Har qanday async ma'lumot uchun skeleton MAJBURIY.

Skeleton Qoidalari:
├── Rang: #ede9df → #f8f5ef → #ede9df (shimmer)
├── Radius: xuddi asl elementga o'xshash
├── Animatsiya: shimmer 1.6s infinite
├── Granular: Har bir komponent o'z skeletoniga ega
└── YO'Q: Butun sahifa spinner (faqat birinchi yuklashda)
```

### 11.2 Empty States

```
QOIDA: Har qanday ro'yxat bo'sh bo'lishi mumkin — dizayni tayyorlanishi shart.

Minimal Empty State:
├── Emoji yoki icon (24x24 yoki 32x32)
├── Sarlavha: text-md, font-bold
├── Tavsif: text-sm, edu-muted
├── CTA tugma (agar amal mumkin bo'lsa)
└── Padding: p-8 yoki p-10

Misol:
"Hali topshiriqlar yo'q"
"Birinchi topshirig'ingizni yarating →"
```

### 11.3 Error States

```
Network Error:
├── Wifi off icon
├── "Internet aloqasi yo'q" matn
├── "Qayta urinish" tugma
└── Retry logikasi MAJBURIY

404:
├── Sahifa topilmadigan holat
├── Asosiy sahifaga qaytish tugma

API Error:
├── Toast notification (react-hot-toast)
├── Xato xabari foydalanuvchi tushunadigan tilda
└── Texnik xato kodi ko'rsatilmaydi
```

---

## 12. ACCESSIBILITY (A11y) MINIMAL TALABLAR

### 12.1 Kontrast Talablari (WCAG AA)

```
Asosiy matn (#000000 ga qora fon): 21:1 ✅
Asosiy matn (#000000 oq fonga): 21:1 ✅
edu-muted (#8E8E93 oq fonga): 2.85:1 ❌ WCAG AA uchun 4.5:1 kerak
Tavsiya: edu-muted o'rniga #6B6B71 ishlatish (4.6:1 ✅)
```

### 12.2 Touch Target

```
SHART: Barcha interaktiv elementlar minimum 44x44px bo'lishi kerak.

Agar vizual kichik bo'lsa, padding yoki ::before ::after bilan kattalashtirish:

button {
  position: relative;
}
button::after {
  content: '';
  position: absolute;
  inset: -8px;  /* Touch area kengaytirish */
}
```

### 12.3 ARIA va Semantic HTML

```
✅ Tugma uchun: <button> yoki role="button"
✅ Link uchun: <a> yoki role="link"
✅ Icon tugmalar uchun: aria-label="..."
✅ Modallar uchun: role="dialog", aria-modal="true"
✅ Rasmlar uchun: alt=""  (dekorativ) yoki alt="tavsif"
✅ Loading uchun: aria-busy="true"

Misol:
<button aria-label="Topshiriq saqlash" onClick={save}>
  <Save size={20} />
</button>
```

---

## 13. SAHIFALAR UChUN DIZAYN SHABLON

### 13.1 Yangi Sahifa Yaratishda Tekshiruv Ro'yxati

```
[ ] Header mavjudmi? (Back tugma agar nested)
[ ] Loading state (skeleton) bormi?
[ ] Empty state bormi?
[ ] Error state bormi?
[ ] Bottom navigation uchun pb-24 bormi?
[ ] Barcha interaktiv elementlar 44px+ touch targetmi?
[ ] Barcha ranglar tokendan olinganmi? (hardcoded yo'qmi?)
[ ] Dark mode ishlayaptimi?
[ ] Font weight ierarxiyasi to'g'rimi?
[ ] Press/hover effektlar bormi?
[ ] Screen reader uchun ARIA labellar bormi?
```

### 13.2 Sahifa Tuzilishi

```jsx
// STANDART SAHIFA TUZILISHI
<PageLayout> {/* Safe area va scroll handling */}
  <Header title="Sarlavha" onBack={...} />
  
  <div className="flex flex-col p-4 gap-6 pb-nav overflow-y-auto scrollbar-hide">
    
    {/* Loading State */}
    {isLoading && <SkeletonComponent />}
    
    {/* Error State */}
    {error && <ErrorState onRetry={refetch} />}
    
    {/* Content */}
    {!isLoading && !error && (
      <>
        {/* Hero/Summary Section */}
        <Section className="mb-6">...</Section>
        
        {/* Main Content */}
        <Section>...</Section>
        
        {/* Empty State (agar ro'yxat bo'sh) */}
        {items.length === 0 && <EmptyState />}
      </>
    )}
    
  </div>
</PageLayout>
```

---

## 14. AI UCHUN KO'RSATMA TIZIMI

### 14.1 AI'ga Task Berishda Majburiy Ko'rsatmalar

**Har qanday UI task berayotganda quyidagi qoidalarni eslatib qo'ying:**

```
Eslatma: EduMarket dizayn tizimiga muvofiq ishlang:

RANGLAR:
- Hech qachon hardcoded hex rang yozmang
- Doim Tailwind tokenlar: text-edu-primary, bg-edu-surface, border-edu-border
- Yoki CSS variables: var(--edu-primary), var(--edu-surface)

RADIUS:
- Kichik element: rounded-xl (12px)
- Karta: rounded-2xl (16px)
- Katta karta: rounded-3xl (24px)
- Pill: rounded-full

SPACING:
- Karta padding: p-4 (standart)
- Section gap: gap-4 yoki gap-6
- Sahifa padding: p-4
- Bottom nav uchun: pb-24

TIPOGRAFIYA:
- Asosiy matn: text-base text-edu-text
- Subtitle: text-sm text-edu-muted
- Sarlavha: text-lg font-bold yoki text-xl font-black
- Label/badge: text-2xs font-black uppercase tracking-widest

INTERAKTIVLIK:
- Har bir kliklaniladigan element: press-scale yoki active-spring klassi
- Kartalar: isPressable prop
- Tugmalar: active:scale-95 transition-transform

LOADING:
- Skeleton majburiy
- isLoading holati har doim ko'rsatilsin

DARK MODE:
- dark: prefix bilan dark mode variant yozing
```

### 14.2 Yangi Komponent Yaratish Template

```jsx
// === [KOMPONENT NOMI] ===
// Maqsad: [qisqacha tavsif]
// Props: [asosiy proplar]

export function ComponentName({ title, onPress, isLoading }) {
  
  // Loading state
  if (isLoading) return <SkeletonVersion />;
  
  return (
    <div 
      className={cn(
        // Layout
        "flex flex-col",
        // Visual
        "bg-edu-surface",
        "rounded-2xl",        // 16px radius
        "border border-edu-border/20",
        "shadow-ios",
        // Spacing
        "p-4",
        // Interaktivlik
        "press-scale cursor-pointer",
        // Transition
        "transition-all duration-300"
      )}
      onClick={onPress}
      role="button"
      aria-label={title}
    >
      {/* Icon Container */}
      <div className="w-10 h-10 rounded-xl bg-edu-primary/10 text-edu-primary
                      flex items-center justify-center mb-3">
        <Icon size={20} />
      </div>
      
      {/* Content */}
      <h3 className="text-md font-bold text-edu-text tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-edu-muted mt-1">
        {subtitle}
      </p>
    </div>
  );
}
```

---

## 15. DO'S AND DON'TS — YAKUNIY QOIDALAR

### ✅ DO (Qiling)

1. **Token tizimidan foydalaning** — har doim CSS variable yoki Tailwind token
2. **44px minimum touch target** — hech qachon kichik qoldirmang
3. **Dark mode variant yozing** — `dark:` prefix bilan
4. **Loading skeleton qo'shing** — har bir async komponentga
5. **Empty state dizayn qiling** — har bir ro'yxat uchun
6. **Press effekt qo'shing** — har bir kliklaniladigan elementga
7. **ARIA label yozing** — icon-only tugmalar uchun
8. **Font weight ierarxiyasiga rioya qiling** — maksimum 3 level
9. **Spacing tokenlari ishlatilsin** — hardcoded pixel yo'q
10. **Consistent radius** — belgilangan tokenlardan tanlang

### ❌ DON'T (Qilmang)

1. **Hardcoded rang** — `#007AFF` emas, `var(--edu-primary)` yozing
2. **font-black spam** — har narsaga font-black bermang
3. **42px touch target** — 44px MINIMUM
4. **Spinner faqat** — skeleton ishlatilmagan holat
5. **Dark mode unutish** — faqat light modeda ishlash
6. **Random spacing** — `mt-[13px]` kabi arbitrary qiymatlar
7. **Undefined empty state** — ro'yxat bo'sh bo'lsa nima ko'rsatiladi?
8. **Semantic HTML e'tiborsizlik** — `<div onClick>` o'rniga `<button>`
9. **Global error boundary** — granular error handling qiling
10. **Framer Motion + Tailwind transition ikkalasi** — birini tanlang

---

*EduMarket Design System v1.0 | 2026-06-09*  
*Bu hujjat dizayn qarorlari uchun YAGONA manbaa hisoblanadi.*
