# EduMarket — UI/UX Redesign Roadmap 2026
> **Versiya:** 1.0 | **Sana:** 2026-06-13
> **Maqsad:** Mavjud dizaynni to'liq "premium, clean, native-feel" darajaga olib chiqish — Light va Dark mode uchun.
> **Ushbu hujjat:** Har bir token, spacing, komponent, animatsiya va rangni qamrab oladi.

---

## UMUMIY BAHOLASH: HOZIRGI HOLAT

Loyihani batafsil o'rgandim. Kuchli tomonlar bor — `ios-glass`, `squircle`, `premium-card` kabi classlar yaxshi yozilgan. Lekin quyidagi muammolar sistemani "premium" ko'rinishidan uzoqlashtirmoqda:

### Asosiy muammolar (priority bo'yicha)

**1. Rang tizimi — Kontrastning pastligi (Light mode)**
`--edu-bg: #EBEBF0` va `--edu-surface: #FFFFFF` orasidagi farq juda kichik. Ko'z uchun card va background bitta yuzadek ko'rinadi. Dark mode yaxshiroq, lekin light modeda hamma narsa "yassi" ko'rinadi.

**2. Typography ierarxiyasi buzilgan**
`text-[22px]`, `text-[24px]`, `text-[17px]` kabi arbitrary qiymatlar skala o'rniga random qo'llanilgan. Bir sahifada 6-8 xil font-size, 4-5 xil font-weight — vizual tartibsizlik.

**3. Spacing — Inconsistency**
`p-3.5`, `p-5`, `p-6`, `py-3.5`, `px-6` — bitta komponent ichida ham standart yo'q. `gap-4` va `gap-6` aralashib ketgan, hech bir grid tizimi yo'q.

**4. Border-radius — Token bloat**
`rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-[20px]`, `rounded-[22px]`, `rounded-[24px]`, `rounded-[28px]` — 8 dan ortiq radius qiymati. Hech qaysi qoidasiz.

**5. Shadow — Overuse**
`shadow-ios`, `shadow-ios-lg`, `shadow-premium-sm`, `shadow-premium-md`, `shadow-premium-lg`, `shadow-btn`, `shadow-card` — 7 ta shadow token, lekin ko'pchilik bir xil ko'rinadi. Dark modeda shadow umuman ishlamaydi (qora fonda qora shadow).

**6. Card border — Juda ingichka yoki yo'q**
Ko'pchilik kartalar `border border-edu-border` bilan qilingan. `--edu-border: rgba(0,0,0,0.15)` — light modeda ko'rinmaydi deyarli. Dark modeda `rgba(84,84,88,0.48)` — yaxshi.

**7. Motion — Framer Motion o'rnatilgan, ammo ishlatilmayapti sistemali**
Ba'zi joyda Framer, ba'zida Tailwind `transition`, ba'zida CSS animation — uchta tizim parallel ishlamoqda.

---

## BOSQICH 1 — YANGI DIZAYN TIZIMI (DESIGN TOKENS)

### 1.1 Rang Palitasi — To'liq Qayta Ko'rib Chiqish

**Falsafa:** EduMarket — talabalar uchun ishonchli, professional va yosh ko'rinadigan platforma. Rang falsafasi: **Emerald Green asosiy, Slate neytral, Purple accent** — bu kombinatsiya "academic + modern fintech" his beradi.

#### Light Mode Ranglar

```css
:root {
  /* === BACKGROUNDS === */
  --edu-bg:         #F0F2F5;   /* Sahifa foni — Facebook-style slate, card bilan kontrast yaratadi */
  --edu-surface:    #FFFFFF;   /* Karta, modal, panel foni */
  --edu-surface-2:  #F7F8FA;   /* Ikkinchi darajali panel, input foni */
  --edu-surface-3:  #EEF0F3;   /* Hover state, subtle accent */

  /* === TEXT === */
  --edu-text:       #0D1117;   /* GitHub-style near-black — to'q, aniq, kontrast */
  --edu-text-2:     #3D4350;   /* Subheading, muhim body */
  --edu-muted:      #6B7385;   /* Placeholder, label, meta — WCAG AA: 4.6:1 */
  --edu-muted-2:    #9DA3AE;   /* Disabled, timestamp */

  /* === BORDERS === */
  --edu-border:     rgba(13, 17, 23, 0.10);   /* Asosiy chegara */
  --edu-border-2:   rgba(13, 17, 23, 0.06);   /* Subtle divider */
  --edu-border-focus: rgba(16, 185, 129, 0.5); /* Focus ring */

  /* === BRAND === */
  --edu-primary:    #10B981;   /* Emerald 500 */
  --edu-primary-h:  #059669;   /* Emerald 600 — hover */
  --edu-primary-l:  #D1FAE5;   /* Emerald 100 — tint background */
  --edu-primary-xl: #ECFDF5;   /* Emerald 50 — ultra-light tint */

  --edu-accent:     #7C3AED;   /* Violet 600 — freelancer mode, accent elements */
  --edu-accent-h:   #6D28D9;   /* Violet 700 */
  --edu-accent-l:   #EDE9FE;   /* Violet 100 */

  /* === SEMANTIC === */
  --edu-urgent:     #EF4444;   /* Red 500 */
  --edu-urgent-l:   #FEE2E2;   /* Red 100 */
  --edu-warn:       #F59E0B;   /* Amber 500 */
  --edu-warn-l:     #FEF3C7;   /* Amber 100 */
  --edu-success:    #10B981;   /* Same as primary */
  --edu-info:       #3B82F6;   /* Blue 500 */
  --edu-info-l:     #DBEAFE;   /* Blue 100 */

  /* === VIP === */
  --edu-vip:        #D97706;   /* Amber 600 */
  --edu-vip-l:      #FEF3C7;

  /* === STATUS DOTS === */
  --status-open:        #10B981;
  --status-assigned:    #7C3AED;
  --status-progress:    #3B82F6;
  --status-review:      #F59E0B;
  --status-completed:   #10B981;
  --status-canceled:    #9DA3AE;
  --status-disputed:    #EF4444;

  /* === WORKSPACE OVERRIDES === */
  --edu-ws-color:   #10B981;   /* Default: CLIENT mode = green */
}

.workspace-freelancer {
  --edu-ws-color:   #7C3AED;   /* Freelancer mode = violet */
  --edu-primary:    #7C3AED;
  --edu-primary-h:  #6D28D9;
  --edu-primary-l:  #EDE9FE;
  --edu-primary-xl: #F5F3FF;
  --edu-border-focus: rgba(124, 58, 237, 0.5);
}
```

#### Dark Mode Ranglar

```css
.dark {
  /* === BACKGROUNDS === */
  --edu-bg:         #0A0A0F;   /* Near-true-black — modern dark app feel */
  --edu-surface:    #13141A;   /* Card surface — barely lighter than bg */
  --edu-surface-2:  #1C1D26;   /* Secondary panel */
  --edu-surface-3:  #242535;   /* Hover state */

  /* === TEXT === */
  --edu-text:       #F0F2F8;   /* Yumshoq oq — sof oqdan farqli, ko'zga yoqimli */
  --edu-text-2:     #C5CAD8;
  --edu-muted:      #7A8093;
  --edu-muted-2:    #52566A;

  /* === BORDERS === */
  --edu-border:     rgba(255, 255, 255, 0.09);
  --edu-border-2:   rgba(255, 255, 255, 0.04);
  --edu-border-focus: rgba(16, 185, 129, 0.6);

  /* === BRAND === */
  --edu-primary:    #34D399;   /* Emerald 400 — dark modeda biroz ochroq */
  --edu-primary-h:  #10B981;   /* Emerald 500 */
  --edu-primary-l:  rgba(52, 211, 153, 0.12);
  --edu-primary-xl: rgba(52, 211, 153, 0.06);

  --edu-accent:     #A78BFA;   /* Violet 400 — dark modeda yumshoq */
  --edu-accent-h:   #8B5CF6;
  --edu-accent-l:   rgba(167, 139, 250, 0.12);

  /* === SEMANTIC === */
  --edu-urgent:     #F87171;   /* Red 400 */
  --edu-urgent-l:   rgba(248, 113, 113, 0.12);
  --edu-warn:       #FCD34D;
  --edu-warn-l:     rgba(252, 211, 77, 0.12);
  --edu-success:    #34D399;
  --edu-info:       #60A5FA;
  --edu-info-l:     rgba(96, 165, 250, 0.12);

  --edu-vip:        #FCD34D;
  --edu-vip-l:      rgba(252, 211, 77, 0.12);
}

.dark.workspace-freelancer {
  --edu-primary:    #A78BFA;
  --edu-primary-h:  #8B5CF6;
  --edu-primary-l:  rgba(167, 139, 250, 0.12);
  --edu-primary-xl: rgba(167, 139, 250, 0.06);
}
```

**Nima o'zgardi va nima uchun:**
- `#EBEBF0` → `#F0F2F5`: background biroz ko'kroq, card bilan kontrast oshdi (+15%)
- `#000000` text → `#0D1117`: "GitHub near-black" — monitorlarda keskinlik kamaytiradi
- `#8E8E93` muted → `#6B7385`: WCAG AA muvofiq (4.6:1 vs oldingi 2.85:1)
- Dark bg `#000000` → `#0A0A0F`: sof qora ekranda "halo effect" berib bezovta qiladi
- Accent `#6366F1 (Indigo)` → `#7C3AED (Violet)`: Violet/Purple "academic" his beradi, Indigo esa "tech startup"

---

### 1.2 Typography — To'liq Tizim

**Asosiy tanlov:** Inter (Google Fonts) yoki tizim shriftlari zanjiri

```css
:root {
  /* Font families */
  --font-display: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body:    'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono:    'JetBrains Mono', 'Fira Code', Consolas, monospace;

  /* === TYPE SCALE (8 daraja, hamma qiymat 4px ko'paytmasi) === */
  --text-2xs:   10px;   /* line-height: 14px */
  --text-xs:    12px;   /* line-height: 16px */
  --text-sm:    13px;   /* line-height: 18px */
  --text-base:  14px;   /* line-height: 20px */
  --text-md:    15px;   /* line-height: 22px */
  --text-lg:    16px;   /* line-height: 24px */
  --text-xl:    18px;   /* line-height: 28px */
  --text-2xl:   22px;   /* line-height: 30px */
  --text-3xl:   26px;   /* line-height: 34px */
  --text-4xl:   32px;   /* line-height: 40px */

  /* === FONT WEIGHTS (faqat 4 ta) === */
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;

  /* === LETTER SPACING === */
  --tracking-tight:   -0.02em;   /* Katta sarlavhalar */
  --tracking-normal:  -0.01em;   /* Body text */
  --tracking-label:    0.06em;   /* UPPERCASE label */
  --tracking-wide:     0.10em;   /* Badge, chip */
}
```

**Tailwind typography map (tailwind.config.js o'zgartirish):**

```js
fontSize: {
  '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.02em' }],
  'xs':  ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
  'sm':  ['13px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
  'base':['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
  'md':  ['15px', { lineHeight: '22px', letterSpacing: '-0.01em' }],
  'lg':  ['16px', { lineHeight: '24px', letterSpacing: '-0.015em' }],
  'xl':  ['18px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
  '2xl': ['22px', { lineHeight: '30px', letterSpacing: '-0.025em' }],
  '3xl': ['26px', { lineHeight: '34px', letterSpacing: '-0.03em' }],
  '4xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.035em' }],
}
```

**Typography qoidalari — bu qoidalar barcha komponentlarda saqlanishi SHART:**

```
ELEMENT          SIZE      WEIGHT      SPACING       CASE
──────────────────────────────────────────────────────────
Page title       3xl       bold        -0.03em       Title Case
Section title    xl        semibold    -0.02em       Title Case
Card title       lg        semibold    -0.015em      Title Case
Body main        md        regular     -0.01em       Sentence
Body sub         sm        regular     -0.01em       Sentence
Label uppercase  2xs       semibold    +0.06em       ALL CAPS
Badge/chip       2xs       bold        +0.04em       ALL CAPS
Timestamp/meta   xs        regular     0             —
Price (large)    2xl       bold        -0.025em      —
Price (inline)   md        semibold    -0.01em       —
Button (primary) sm        semibold    +0.01em       Sentence
Tab label        xs        semibold    +0.02em       Sentence
Nav label        2xs       bold        +0.04em       Sentence
```

**Bir sahifada maksimum: 3 ta weight, 4 ta size daraja.**

---

### 1.3 Spacing — 4px Grid Tizimi

**Qoida:** Barcha spacing `4px` ko'paytmasi. Arbitrar qiymatlar (`p-3.5`, `p-5`) FAQAT quyidagi jadvaldagi qiymatlarga keltiriladi.

```
TOKEN    PX      ISHLATISH
─────────────────────────────────────────────────────────
space-0  0px
space-1  4px     Icon-dan text orasida, inline elements
space-2  8px     Badge, chip ichida; kichik gap
space-3  12px    Form field orasida; small card padding
space-4  16px    Karta standart padding; list item gap
space-5  20px    Katta karta padding; section ichida gap
space-6  24px    Section orasida; modal padding
space-8  32px    Katta section orasida
space-10 40px    Screen section break
space-12 48px    Hero area padding
space-16 64px    Nav height
```

**Tailwind mapping:**
```js
spacing: {
  0: '0px',     // space-0
  1: '4px',     // space-1
  2: '8px',     // space-2
  3: '12px',    // space-3
  4: '16px',    // space-4 — ASOSIY CARD PADDING
  5: '20px',    // space-5
  6: '24px',    // space-6 — SECTION GAP
  8: '32px',    // space-8
  10: '40px',   // space-10
  12: '48px',   // space-12
  16: '64px',   // nav-height
  24: '96px',   // pb-nav (bottom nav joy)
}
```

**Spacing qoidalari:**

```
KONTEKST                     QIYMAT
─────────────────────────────────────────
Karta ichida (padding)       p-4 (16px)
Katta karta ichida            p-5 (20px)
Screen gorizo padding        px-4 (16px)
Komponentlar orasida gap     gap-3 (12px) — ro'yxat
                             gap-4 (16px) — grid kartalar
Section orasida              mb-6 (24px) — oddiy
                             mb-8 (32px) — katta
Inline elementlar orasida    gap-2 (8px)
Nav uchun joy                pb-24 (96px) — MAJBURIY

Form fieldlar orasida        space-y-4 (16px)
Form label-input orasida     mb-2 (8px)
Section sarlavha-kontent     mb-3 (12px)
```

---

### 1.4 Border Radius — 5 ta Token (Faqat)

**Eski tizim:** `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-[20px]`, `rounded-[22px]`, `rounded-[24px]`, `rounded-[28px]` — 8+ variant.

**Yangi tizim — 5 ta token, hamma joyda shu:**

```css
:root {
  --r-sm:   8px;    /* Chip, badge, tag, kichik tugmalar */
  --r-md:   12px;   /* Input, select, kichik karta */
  --r-lg:   16px;   /* Standart karta — ENG KO'P ISHLATILADIGAN */
  --r-xl:   20px;   /* Katta karta, modal, sheet */
  --r-full: 9999px; /* Pill, avatar, yumaloq element */
}
```

**Tailwind mapping:**
```js
borderRadius: {
  'sm':   '8px',     // rounded-sm
  'md':   '12px',    // rounded-md
  'lg':   '16px',    // rounded-lg   ← ASOSIY KARTA
  'xl':   '20px',    // rounded-xl
  'full': '9999px',  // rounded-full
}
```

**Qachon qaysi radius:**

```
ELEMENT                      RADIUS
─────────────────────────────────────────────────────
Avatar                       rounded-full
Badge / Status chip          rounded-full
Pill tugma                   rounded-full
Tag / Skill chip             rounded-full
──────────────────────────────────────────────────────
Kichik tugma (sm)            rounded-sm  (8px)
Form input                   rounded-md  (12px)
Bottom sheet header          rounded-md  (12px)
Select dropdown              rounded-md  (12px)
──────────────────────────────────────────────────────
Standart karta               rounded-lg  (16px)  ← DEFAULT
List item karta              rounded-lg  (16px)
──────────────────────────────────────────────────────
Katta tugma (primary CTA)    rounded-xl  (20px)
Hero karta                   rounded-xl  (20px)
Modal                        rounded-xl  (20px)
Bottom sheet                 rounded-xl + rounded-b-none
──────────────────────────────────────────────────────
```

**Eslatma:** `rounded-[22px]`, `rounded-[24px]`, `rounded-[28px]` — BULARDAN FOYDALANMANG. Agar 20px yetarli bo'lmasa, komponentni qayta ko'rib chiqing.

---

### 1.5 Shadow — 4 ta Token (Faqat)

**Eski tizim:** 7 ta shadow token, Dark modeda ishlamaydi.

**Yangi tizim:** 4 ta, light/dark adaptive:

```css
:root {
  /* Light mode shadows */
  --shadow-sm:   0 1px 2px rgba(0,0,0,0.04), 0 1px 4px rgba(0,0,0,0.03);
  --shadow-md:   0 4px 8px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.04);
  --shadow-lg:   0 8px 24px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04);
  --shadow-btn:  0 4px 12px color-mix(in srgb, var(--edu-primary) 30%, transparent);

  /* Dark mode — border-based, shadow yo'q */
  /* Dark modeda shadow ishlamaydi, border ishlatiladi */
}

.dark {
  --shadow-sm:   0 0 0 1px rgba(255,255,255,0.06);
  --shadow-md:   0 0 0 1px rgba(255,255,255,0.08);
  --shadow-lg:   0 0 0 1px rgba(255,255,255,0.10);
  --shadow-btn:  0 4px 16px color-mix(in srgb, var(--edu-primary) 25%, transparent);
}
```

**Tailwind mapping:**
```js
boxShadow: {
  'sm':    'var(--shadow-sm)',
  'md':    'var(--shadow-md)',
  'lg':    'var(--shadow-lg)',
  'btn':   'var(--shadow-btn)',
  'none':  'none',
}
```

**Shadow qoidalari:**

```
ELEMENT                      LIGHT MODE     DARK MODE
─────────────────────────────────────────────────────────
List karta, default          shadow-sm      border only
Aktiv / hover karta          shadow-md      border (brighter)
Hero karta, bottom sheet     shadow-lg      border + bg change
Primary CTA tugma            shadow-btn     shadow-btn
Nav (yuqoriga qarab)         shadow-lg      border-t only
```

**Dark mode card strategiyasi:**
Dark modeda shadow o'rniga `border: 1px solid rgba(255,255,255,0.08)` + `background: var(--edu-surface)` ishlatiladi. Hover'da border `rgba(255,255,255,0.14)`ga ko'tariladi.

---

### 1.6 Motion — Bitta Tizim

**Eski holat:** Framer Motion + Tailwind transition + CSS animation — 3 paralel tizim.

**Yangi qoida:** Framer Motion faqat page transition va complex animation uchun. Hover/press — Tailwind. Simple reveal — CSS animation.

```css
:root {
  /* Duration */
  --dur-fast:   120ms;   /* Press feedback */
  --dur-normal: 220ms;   /* Hover, tab switch */
  --dur-slow:   360ms;   /* Modal, sheet open */
  --dur-enter:  480ms;   /* Page transition */

  /* Easing */
  --ease-out:     cubic-bezier(0.16, 1, 0.3, 1);      /* Spring-out */
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);       /* Smooth */
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bouncy pop */
  --ease-press:   cubic-bezier(0.4, 0, 1, 1);         /* Snap press */
}
```

**Animatsiya qoidalari:**

```
TRIGGER          DURATION      EASING           TRANSFORM
─────────────────────────────────────────────────────────────
Button press     120ms         ease-press       scale(0.96)
Card press       120ms         ease-press       scale(0.98)
Hover (karta)    220ms         ease-in-out      translateY(-2px)
Tab switch       220ms         ease-in-out      opacity 0→1
Modal open       360ms         ease-out         translateY(24px)→0
Sheet open       480ms         ease-out         translateY(100%)→0
Page enter       480ms         ease-out         opacity + translateX(12px)
Toast appear     320ms         ease-spring      scale(0.8)→1
Skeleton         1800ms        linear           shimmer
```

**Framer Motion faqat shu hollarda:**
- Page-level transition (`AnimatePresence`)
- Stagger list items (ro'yxat card'larining sequential kirishi)
- Complex drag (chat swipe-to-react)

---

## BOSQICH 2 — KOMPONENT TIZIMI (ATOM DAN ORGANISM)

### 2.1 Button — To'liq Qayta Yozish

**Hozirgi muammo:** `Button.jsx`da 7 ta variant, lekin visual farq kam. `shadow-btn` faqat "blue" uchun yozilgan (`rgba(0,122,255,0.3)`) — primary color bilan mos emas.

**Yangi Button tizimi:**

```jsx
// 4 ta variant, 3 ta size
// variant: 'primary' | 'secondary' | 'ghost' | 'danger'
// size: 'sm' | 'md' | 'lg'

/* === SIZING === */
.btn-sm  { height: 36px; padding: 0 14px; font-size: 13px; border-radius: var(--r-sm); }
.btn-md  { height: 44px; padding: 0 20px; font-size: 14px; border-radius: var(--r-md); }
.btn-lg  { height: 52px; padding: 0 28px; font-size: 15px; border-radius: var(--r-xl); }

/* === PRIMARY === */
.btn-primary {
  background: var(--edu-primary);
  color: #fff;
  font-weight: 600;
  box-shadow: var(--shadow-btn);
  border: none;
  transition: background var(--dur-normal) var(--ease-in-out),
              transform var(--dur-fast) var(--ease-press),
              box-shadow var(--dur-normal) var(--ease-in-out);
}
.btn-primary:hover    { background: var(--edu-primary-h); }
.btn-primary:active   { transform: scale(0.97); box-shadow: none; }
.btn-primary:disabled { opacity: 0.45; pointer-events: none; }

/* === SECONDARY === */
.btn-secondary {
  background: var(--edu-surface-2);
  color: var(--edu-text);
  font-weight: 500;
  border: 1px solid var(--edu-border);
  transition: background var(--dur-normal) var(--ease-in-out),
              border-color var(--dur-normal) var(--ease-in-out),
              transform var(--dur-fast) var(--ease-press);
}
.btn-secondary:hover  { background: var(--edu-surface-3); border-color: var(--edu-border-focus); }
.btn-secondary:active { transform: scale(0.97); }

/* === GHOST === */
.btn-ghost {
  background: transparent;
  color: var(--edu-primary);
  font-weight: 500;
  border: none;
}
.btn-ghost:hover  { background: var(--edu-primary-xl); }
.btn-ghost:active { transform: scale(0.97); }

/* === DANGER === */
.btn-danger {
  background: var(--edu-urgent);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}
.btn-danger:hover  { background: #DC2626; }
.btn-danger:active { transform: scale(0.97); }
```

**Touch target:** Barcha button'lar minimum `44px` balandlik yoki `min-h-[44px]` + padding with `::after` overlay.

---

### 2.2 Card — Unified Card System

**Hozirgi muammo:** `Card.jsx`da `radius` prop bor, ammo `sm`, `md`, `lg`, `xl` o'rniga `none`, `sm`, `md`, `lg`, `xl` va value mapping noto'g'ri.

**Yangi Card tizimi — 2 ta variant:**

```css
/* === BASE CARD === */
.card-base {
  background: var(--edu-surface);
  border: 1px solid var(--edu-border);
  border-radius: var(--r-lg);     /* 16px — DEFAULT */
  transition: border-color var(--dur-normal) var(--ease-in-out),
              box-shadow var(--dur-normal) var(--ease-in-out),
              transform var(--dur-fast) var(--ease-press);
}

/* Light mode */
.card-base          { box-shadow: var(--shadow-sm); }
.card-base:hover    { border-color: rgba(13,17,23,0.16); box-shadow: var(--shadow-md); }

/* Dark mode */
.dark .card-base        { box-shadow: none; border-color: rgba(255,255,255,0.08); }
.dark .card-base:hover  { border-color: rgba(255,255,255,0.14); background: var(--edu-surface-2); }

/* Pressable */
.card-pressable:active { transform: scale(0.985); }

/* === ELEVATED CARD (hero, featured) === */
.card-elevated {
  background: var(--edu-surface);
  border: 1px solid var(--edu-border);
  border-radius: var(--r-xl);     /* 20px */
  box-shadow: var(--shadow-lg);
}
.dark .card-elevated { box-shadow: none; border-color: rgba(255,255,255,0.12); }
```

**Card Padding qoidalari:**

```
CARD TURI         PADDING    BORDER RADIUS
─────────────────────────────────────────────
List item         p-4        rounded-lg  (16px)
Stat card         p-4        rounded-lg  (16px)
Standard card     p-4        rounded-lg  (16px)
Profile card      p-5        rounded-xl  (20px)
Hero card         p-6        rounded-xl  (20px)
Bottom sheet      p-6        rounded-xl top only
Modal content     p-6        rounded-xl  (20px)
```

---

### 2.3 Form Elements

**Input — yangi dizayn:**

```css
.input-base {
  width: 100%;
  height: 48px;
  padding: 0 16px;
  background: var(--edu-surface-2);
  border: 1.5px solid var(--edu-border);
  border-radius: var(--r-md);     /* 12px */
  font-size: 14px;
  font-weight: 400;
  color: var(--edu-text);
  transition: border-color var(--dur-normal) var(--ease-in-out),
              background var(--dur-normal) var(--ease-in-out),
              box-shadow var(--dur-normal) var(--ease-in-out);
}
.input-base::placeholder { color: var(--edu-muted-2); }
.input-base:focus {
  outline: none;
  border-color: var(--edu-primary);
  background: var(--edu-surface);
  box-shadow: 0 0 0 3px var(--edu-primary-l);
}
.input-base.error {
  border-color: var(--edu-urgent);
  box-shadow: 0 0 0 3px var(--edu-urgent-l);
}

/* Dark mode */
.dark .input-base            { background: var(--edu-surface-2); border-color: rgba(255,255,255,0.1); }
.dark .input-base:focus      { background: var(--edu-surface); box-shadow: 0 0 0 3px var(--edu-primary-l); }
```

**Textarea — xuddi Input, faqat:**
```css
.textarea-base {
  min-height: 120px;
  padding: 14px 16px;
  resize: none;
  /* qolgan Input kabi */
}
```

---

### 2.4 Badge / Status Chip — Yangi

```css
/* Base badge */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  height: 22px;
  padding: 0 8px;
  border-radius: var(--r-full);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Status dot */
.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Status variants */
.badge-open       { background: rgba(16,185,129,0.12); color: #059669; }
.badge-assigned   { background: rgba(124,58,237,0.12); color: #6D28D9; }
.badge-progress   { background: rgba(59,130,246,0.12); color: #2563EB; }
.badge-review     { background: rgba(245,158,11,0.12); color: #D97706; }
.badge-completed  { background: rgba(16,185,129,0.12); color: #059669; }
.badge-canceled   { background: rgba(107,114,128,0.12); color: #6B7280; }
.badge-disputed   { background: rgba(239,68,68,0.12);  color: #DC2626; }

/* Dark mode — tintlar biroz ochroq */
.dark .badge-open       { background: rgba(52,211,153,0.15); color: #34D399; }
.dark .badge-assigned   { background: rgba(167,139,250,0.15); color: #A78BFA; }
/* ...va hokazo */
```

---

### 2.5 Avatar

```css
.avatar {
  border-radius: var(--r-full);
  overflow: hidden;
  flex-shrink: 0;
  position: relative;
  background: var(--edu-surface-3);
}

/* Ring — Light */
.avatar { box-shadow: 0 0 0 2px var(--edu-bg), 0 0 0 3px var(--edu-border); }

/* Ring — Dark */
.dark .avatar { box-shadow: 0 0 0 2px var(--edu-surface), 0 0 0 3px rgba(255,255,255,0.12); }

/* Sizes */
.avatar-xs  { width: 24px;  height: 24px; font-size: 10px; }
.avatar-sm  { width: 32px;  height: 32px; font-size: 12px; }
.avatar-md  { width: 40px;  height: 40px; font-size: 14px; }
.avatar-lg  { width: 48px;  height: 48px; font-size: 16px; }
.avatar-xl  { width: 64px;  height: 64px; font-size: 20px; }
.avatar-2xl { width: 80px;  height: 80px; font-size: 24px; }
```

---

### 2.6 Bottom Navigation — Qayta Dizayn

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 768px;
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom);

  /* Light */
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(200%) blur(20px);
  -webkit-backdrop-filter: saturate(200%) blur(20px);
  border-top: 1px solid var(--edu-border);

  /* Dark */
  /* override: */
}
.dark .bottom-nav {
  background: rgba(13, 14, 26, 0.85);
  border-top: 1px solid rgba(255,255,255,0.08);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  padding: 10px 0;
  color: var(--edu-muted);
  transition: color var(--dur-normal) var(--ease-in-out);
  min-width: 44px;    /* WCAG touch target */
  min-height: 44px;
}
.nav-item.active {
  color: var(--edu-primary);
}
.nav-item .nav-icon { transition: transform var(--dur-normal) var(--ease-spring); }
.nav-item.active .nav-icon { transform: translateY(-1px); }
.nav-label { font-size: 10px; font-weight: 600; letter-spacing: 0.03em; }

/* Center FAB (Create button) */
.nav-fab {
  width: 52px;
  height: 52px;
  border-radius: var(--r-full);
  background: var(--edu-primary);
  color: #fff;
  box-shadow: var(--shadow-btn);
  margin-top: -14px;
  transition: transform var(--dur-fast) var(--ease-press), box-shadow var(--dur-normal);
}
.nav-fab:active { transform: scale(0.92); box-shadow: none; }
```

---

### 2.7 Header

```css
.page-header {
  position: sticky;
  top: 0;
  z-index: 40;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;

  /* Light */
  background: rgba(255,255,255,0.80);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 1px solid var(--edu-border-2);

  /* Dark */
}
.dark .page-header {
  background: rgba(10, 10, 15, 0.80);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.header-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--edu-text);
  flex: 1;
  truncate;
}

.header-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--r-sm);     /* 8px */
  display: flex; align-items: center; justify-content: center;
  color: var(--edu-muted);
  background: transparent;
  transition: background var(--dur-normal), color var(--dur-normal), transform var(--dur-fast) var(--ease-press);
}
.header-icon-btn:hover  { background: var(--edu-surface-3); color: var(--edu-text); }
.header-icon-btn:active { transform: scale(0.92); }
```

---

### 2.8 Empty State va Skeleton

**Empty State:**
```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 48px 32px;
  gap: 16px;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: var(--r-lg);
  background: var(--edu-surface-2);
  border: 1px solid var(--edu-border);
  display: flex; align-items: center; justify-content: center;
  font-size: 32px;
}
.empty-title  { font-size: 17px; font-weight: 600; color: var(--edu-text); }
.empty-desc   { font-size: 14px; color: var(--edu-muted); max-width: 240px; line-height: 1.5; }
```

**Skeleton shimmer:**
```css
@keyframes shimmer-lm {
  0%   { background-position: -300px 0; }
  100% { background-position: 300px 0; }
}
@keyframes shimmer-dm {
  0%   { background-position: -300px 0; }
  100% { background-position: 300px 0; }
}

.skeleton {
  border-radius: var(--r-sm);
  animation: shimmer-lm 1.6s ease-in-out infinite;
  background: linear-gradient(90deg,
    #E8EAED 25%, #F5F6F8 50%, #E8EAED 75%
  );
  background-size: 600px 100%;
}
.dark .skeleton {
  background: linear-gradient(90deg,
    #1C1D26 25%, #242535 50%, #1C1D26 75%
  );
  background-size: 600px 100%;
  animation-name: shimmer-dm;
}
```

---

## BOSQICH 3 — SCREEN REVIZYONLARI

### 3.1 TaskCard — Qayta Dizayn

**Hozirgi muammo:** Karta ichida 6-7 xil font-size, 4 xil color. Framer Motion drag + Tailwind transition parallel. Karta juda "og'ir" (too much info).

**Yangi TaskCard spec:**

```
┌─────────────────────────────────────────────────────────┐
│  [CategoryBadge]           [UrgentBadge]   [SaveBtn]   │  ← 22px balandlik, space-y ikki element
├─────────────────────────────────────────────────────────┤
│                                                         │  ← 12px yuqori padding
│  Kurs ishi bajarilishi kerak, matematika                │  ← text-lg (16px) weight-semibold
│  fakulteti 2-kurs uchun                                 │  ← 2 satr, line-clamp-2
│                                                         │  ← 8px gap
│  12,000 — 50,000 UZS                                    │  ← text-xl (18px) weight-bold, primary color
├─────────────────────────────────────────────────────────┤  ← border-t border-edu-border-2, 12px margin
│  [Avatar 32px] Jasur M.        ⏰ 2 kun  👥 3 taklif   │  ← text-xs (12px) weight-medium
│                                                         │  ← 12px pastki padding
└─────────────────────────────────────────────────────────┘

PADDING:    p-4 (16px) barcha tomondan
RADIUS:     rounded-lg (16px)
SHADOW:     shadow-sm (light) / border-only (dark)
DIVIDER:    1px border, edu-border-2 opacity
```

**Nima olib tashlandi:**
- `dnaScore` badge (qo'shimcha noise)
- Framer Motion drag (UX muammosi yaratmoqda, oddiy Tailwind active:scale yetarli)
- `task.client?.isVip` VIP crown (karta ichida kerak emas)

---

### 3.2 Home Screen — Layout Revizyon

**Hozirgi muammo:** `HomeTopBar` + greeting + `QuickActionsGrid` + `MyTasksStatusWidget` + `ActiveChatWidget` + `TopFreelancersWidget` + `PopularCategories` — juda ko'p section, hech birida clear hierarchy yo'q.

**Yangi Home Screen layout:**

```
SCREEN (scroll)
│
├── [HomeTopBar]              ← 56px, sticky
│     Avatar | Name | Notification bell
│
├── STATS BAR                 ← Horizontal scroll, height 80px
│     [Ochiq: 2] [Jarayonda: 1] [Daromad: 450k]
│
├── QUICK ACTIONS             ← 2-column grid, height 100px each
│     [+ Topshiriq]  [Xizmatlar]
│
├── RECENT ACTIVITY           ← Single card, 1 item
│     Header: "So'nggi faoliyat"
│     [ChatCard yoki TaskCard]
│
├── POPULAR CATEGORIES        ← Horizontal scroll chips, 36px height
│     [📝 Konspekt] [🖥️ Slayd] [🌐 Tarjima] ...
│
└── TOP FREELANCERS           ← Vertical list, 3 ta
      Header: "Top mutaxassislar"  →  "Hammasi"
      [FreelancerRow × 3]
```

---

### 3.3 TaskDetail Screen — Layout

**Hozirgi muammo:** `renderActionButtons()` — 300+ qator bir funksiyada. Screen scroll + fixed bottom — ba'zan bottom button content yopib turadi.

**Yangi layout spec:**

```
SCREEN (flex column, no scroll outside)
│
├── [Header 56px sticky]
│
├── [CONTENT AREA — flex-1, overflow-y-auto]
│   │
│   ├── STATUS SECTION (rounded-lg card)
│   │     StatusBadge + Timeline + DeadlineCountdown
│   │
│   ├── TITLE SECTION (no card, raw text)
│   │     h1 (text-2xl, weight-bold)
│   │     Price range (text-xl, primary color)
│   │     CategoryMetadata chips
│   │
│   ├── DESCRIPTION SECTION (rounded-lg card)
│   │     Collapsed (line-clamp-5) → "Ko'proq" link
│   │
│   ├── MEMBERS (2 ta rounded-lg card, inline gap-3)
│   │     Client card | Freelancer card
│   │
│   ├── DELIVERY CARD (agar bor bo'lsa)
│   │
│   └── [pb-32] ← bottom action uchun joy
│
└── [BOTTOM ACTION BAR — fixed, 64px+safe]
      Glass background
      [Asosiy tugma] yoki ikki tugma row
```

---

### 3.4 ChatScreen — Layout

**Hozirgi muammo:** `fixed inset-0` + ichida `flex-col` — header overlap qiladi ba'zan. Input overlap qiladi ba'zan.

**Yangi layout:**

```css
.chat-screen {
  display: grid;
  grid-template-rows: 56px 1fr auto;
  height: 100dvh;           /* dynamic viewport — iOS keyboard uchun muhim */
  max-width: 768px;
  margin: 0 auto;
  position: fixed;
  inset: 0;
  inset-inline: auto;
}

/* Row 1: Header */
.chat-header { /* 56px */ }

/* Row 2: Messages */
.chat-messages {
  overflow-y: auto;
  overscroll-behavior: contain;     /* iOS bounce qoldiriladi, lekin parent scroll yo'q */
  -webkit-overflow-scrolling: touch;
  padding: 16px;
}

/* Row 3: Input */
.chat-input-area {
  background: var(--edu-surface);
  border-top: 1px solid var(--edu-border);
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
}
```

---

## BOSQICH 4 — LIGHT / DARK MODE IMPLEMENTATION

### 4.1 index.css — To'liq Yangi Versiya (asosiy o'zgarishlar)

```css
/* === Barcha mavjud :root, .dark, .workspace-* bloklar YANGI TOKENLAR bilan almashtiriladi === */

/* Asosiy o'zgarishlar */
body {
  background-color: var(--edu-bg);
  color: var(--edu-text);
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* Qo'shimcha: font feature settings */
  font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
}

/* Scrollbar — ikki mode uchun */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--edu-border); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: var(--edu-muted-2); }

/* Selection */
::selection { background: var(--edu-primary-l); color: var(--edu-text); }
.dark ::selection { background: rgba(52,211,153,0.2); }
```

### 4.2 Dark Mode Card Ko'rinishi — Qoidalar

```
ELEMENT              LIGHT MODE                    DARK MODE
────────────────────────────────────────────────────────────────────
Sahifa foni          #F0F2F5                       #0A0A0F
Karta foni           #FFFFFF + shadow-sm           #13141A + border
Karta hover          #FFFFFF + shadow-md           #1C1D26 + brighter border
Primary tint         #ECFDF5 (Emerald 50)          rgba(52,211,153,0.08)
Input foni           #F7F8FA                       #1C1D26
Input border         rgba(0,0,0,0.10)              rgba(255,255,255,0.10)
Input focus border   #10B981                       #34D399
Divider              rgba(0,0,0,0.06)              rgba(255,255,255,0.06)
Text primary         #0D1117                       #F0F2F8
Text secondary       #3D4350                       #C5CAD8
Text muted           #6B7385                       #7A8093
```

---

## BOSQICH 5 — SCREEN-BY-SCREEN CHECKLIST

Har bir screen uchun quyidagi jadval to'ldirilishi kerak:

### Screen Audit Jadvali

| Screen | Asosiy muammo | Priority | Taxminiy vaqt |
|:-------|:-------------|:---------|:-------------|
| `SplashScreen` | Aurora background OK, lekin loading indicator arbitrary | Low | 1 soat |
| `OnboardingContainer` | Step indicator `bg-blue-600` — hardcoded | Medium | 2 soat |
| `ClientHomeScreen` | 6 ta section, hierarchy yo'q, overloaded | HIGH | 4 soat |
| `FreelancerHomeScreen` | Xuddi ClientHome, overloaded | HIGH | 4 soat |
| `TaskFeedScreen` | Search UI yaxshi, lekin filter chip'lar inconsistent | Medium | 2 soat |
| `TaskDetailScreen` | `renderActionButtons` monster function, layout overlap | HIGH | 6 soat |
| `BidsScreen` | `BidCard.jsx` — 200+ line, rounded-[28px] hardcoded | Medium | 3 soat |
| `ChatListScreen` | Motion yaxshi, lekin background mesh yo'q dark modeda | Low | 1 soat |
| `ChatScreen` | Grid layout o'rniga fixed+flex, iOS keyboard bug | HIGH | 4 soat |
| `ProfileScreen` | God component parted, lekin still heavy | Medium | 3 soat |
| `CreateTaskScreen` | Stepper yaxshi, lekin step content overflowing | Medium | 2 soat |
| `GigsScreen` | Layout yaxshi, banner hardcoded gradient | Low | 1 soat |
| `VipScreen` | Manual payment flow, card hardcoded | Low | 1 soat |
| `AdminDashboard` | Butunlay boshqa design tizimi (slate/indigo) | Medium | 3 soat |
| `LeaderboardScreen` | `bg-gradient-to-br from-[#FFD700]` hardcoded | Medium | 2 soat |

**Jami taxminiy vaqt:** 39 soat (~1 hafta full-time)

---

## BOSQICH 6 — IMPLEMENTATION ROADMAP (Ketma-ketlik)

### Hafta 1 — Foundation (Token tizimi)

**Kun 1-2: Design Tokens o'rnatish**
```
1. index.css — barcha :root tokenlarni yangilash
2. tailwind.config.js — colors, spacing, borderRadius, boxShadow
3. `src/lib/constants.js` — STATUS_CONFIG ranglarini CSS token-ga ko'chirish
```

**Kun 3: Button + Badge qayta yozish**
```
1. Button.jsx — 7 variant → 4 variant, yangi token
2. Badge.jsx — yangi CSS classes
3. Spinner.jsx — primary color token
```

**Kun 4-5: Card + Input tizimi**
```
1. Card.jsx — radius prop soddalashtirish
2. TextInput.jsx — yangi border/focus tizimi
3. TextArea.jsx — xuddi TextInput
4. SelectInput.jsx — xuddi TextInput
```

### Hafta 2 — Layout Components

**Kun 6-7: Navigation**
```
1. BottomNav.jsx — yangi CSS, FAB animation
2. Header.jsx — glass effect tokenize
3. PageLayout.jsx — grid layout tizimi
```

**Kun 8-9: High Priority Screens**
```
1. TaskCard.jsx — Framer drag olib tashlash, simplify
2. TaskDetailScreen — renderActionButtons bo'lish
3. ChatScreen — grid layout fix
```

**Kun 10: Home Screens**
```
1. ClientHomeScreen — section hierarchy
2. FreelancerHomeScreen — xuddi Client
```

### Hafta 3 — Polish + Dark Mode

**Kun 11-12: Dark Mode Audit**
```
1. Har bir komponentni dark modeda test qilish
2. Hardcoded ranglarni topib CSS token bilan almashtirish
3. Shadow → border konversiya (dark mode)
```

**Kun 13-14: Animation Polish**
```
1. Framer Motion faqat page transition va list stagger uchun
2. Hover/press — Tailwind transition
3. Skeleton shimmer light/dark versiya
```

**Kun 15: Final Audit**
```
1. Lighthouse accessibility audit
2. Touch target check (min 44px)
3. Kontrast check (WCAG AA)
4. Performance check (bundle size)
```

---

## BOSQICH 7 — MUAYYAN O'ZGARISHLAR (File by file)

### 7.1 tailwind.config.js — To'liq Yangi Versiya

```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // MUHIM: extend o'rniga to'liq override — inconsistency oldini oladi
    fontSize: {
      '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.04em' }],
      'xs':  ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
      'sm':  ['13px', { lineHeight: '18px', letterSpacing: '-0.01em' }],
      'base':['14px', { lineHeight: '20px', letterSpacing: '-0.01em' }],
      'md':  ['15px', { lineHeight: '22px', letterSpacing: '-0.01em' }],
      'lg':  ['16px', { lineHeight: '24px', letterSpacing: '-0.015em' }],
      'xl':  ['18px', { lineHeight: '28px', letterSpacing: '-0.02em' }],
      '2xl': ['22px', { lineHeight: '30px', letterSpacing: '-0.025em' }],
      '3xl': ['26px', { lineHeight: '34px', letterSpacing: '-0.03em' }],
      '4xl': ['32px', { lineHeight: '40px', letterSpacing: '-0.035em' }],
    },
    borderRadius: {
      'none': '0px',
      'sm':   '8px',
      'md':   '12px',
      'lg':   '16px',
      'xl':   '20px',
      'full': '9999px',
      DEFAULT: '16px',
    },
    extend: {
      colors: {
        'edu-bg':        'var(--edu-bg)',
        'edu-surface':   'var(--edu-surface)',
        'edu-surface-2': 'var(--edu-surface-2)',
        'edu-surface-3': 'var(--edu-surface-3)',
        'edu-border':    'var(--edu-border)',
        'edu-border-2':  'var(--edu-border-2)',
        'edu-text':      'var(--edu-text)',
        'edu-text-2':    'var(--edu-text-2)',
        'edu-muted':     'var(--edu-muted)',
        'edu-muted-2':   'var(--edu-muted-2)',
        'edu-primary':   'var(--edu-primary)',
        'edu-primary-h': 'var(--edu-primary-h)',
        'edu-primary-l': 'var(--edu-primary-l)',
        'edu-primary-xl':'var(--edu-primary-xl)',
        'edu-accent':    'var(--edu-accent)',
        'edu-accent-l':  'var(--edu-accent-l)',
        'edu-urgent':    'var(--edu-urgent)',
        'edu-urgent-l':  'var(--edu-urgent-l)',
        'edu-warn':      'var(--edu-warn)',
        'edu-warn-l':    'var(--edu-warn-l)',
        'edu-vip':       'var(--edu-vip)',
        'edu-vip-l':     'var(--edu-vip-l)',
        'edu-info':      'var(--edu-info)',
        'edu-info-l':    'var(--edu-info-l)',
        // Status
        'status-open':       'var(--status-open)',
        'status-assigned':   'var(--status-assigned)',
        'status-progress':   'var(--status-progress)',
        'status-review':     'var(--status-review)',
        'status-completed':  'var(--status-completed)',
        'status-canceled':   'var(--status-canceled)',
        'status-disputed':   'var(--status-disputed)',
      },
      boxShadow: {
        'sm':   'var(--shadow-sm)',
        'md':   'var(--shadow-md)',
        'lg':   'var(--shadow-lg)',
        'btn':  'var(--shadow-btn)',
      },
      spacing: {
        'safe-b':  'env(safe-area-inset-bottom)',
        'nav':     '64px',
        'pb-nav':  'calc(64px + env(safe-area-inset-bottom) + 8px)',
      },
      animation: {
        'shimmer':      'shimmer 1.6s linear infinite',
        'fade-in':      'fadeIn 220ms var(--ease-out) both',
        'slide-up':     'slideUp 360ms var(--ease-out) both',
        'scale-in':     'scaleIn 220ms var(--ease-spring) both',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0'  },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.9)'  },
          '100%': { opacity: '1', transform: 'scale(1)'    },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1'   },
        },
      },
    },
  },
  plugins: [],
};
```

---

### 7.2 Olib Tashlanishi Kerak Bo'lgan Narsalar

**Arbitrary Tailwind classlar — bular tokenga o'tkaziladi:**
```
rounded-[20px]    →  rounded-xl
rounded-[22px]    →  rounded-xl
rounded-[24px]    →  rounded-xl
rounded-[28px]    →  rounded-xl
text-[22px]       →  text-2xl
text-[24px]       →  text-3xl
text-[17px]       →  text-lg
bg-[#FFD700]      →  bg-edu-vip
from-[#FFD700]    →  from-edu-vip (CSS variable orqali)
text-[#007AFF]    →  text-edu-info
```

**Olib tashlanadigan CSS utilities (`index.css`):**
```
.ios-glass        →  Tokenize (background, backdrop-filter)
.squircle         →  Faqat rounded-lg bilan almashtirish
.premium-card     →  card-base + card-elevated bilan almashtirish
.active-spring    →  Tailwind: active:scale-[0.97] transition-transform duration-[120ms]
.press-scale      →  Tailwind: active:scale-95 duration-[120ms]
.bg-mesh-aurora   →  Saqlash (lekin dark mode uchun optimizatsiya)
.gradient-text-*  →  Saqlash (ishlatish)
```

**Framer Motion olib tashlanadigan joylar:**
```
TaskCard.jsx      →  drag="x" — olib tashlash (UX bug + performance)
BottomNav.jsx     →  motion yo'q, oddiy Tailwind
ChatListScreen.jsx →  AnimatePresence saqlash (yaxshi UX)
HomeScreen.jsx    →  motion/AnimatePresence saqlash
```

---

## BOSQICH 8 — ACCESSIBILITY (A11y) MAJBURIY

### Touch Target

Barcha interaktiv element minimum `44×44px`:

```css
/* Kichik icon button uchun */
.icon-btn {
  width: 36px;
  height: 36px;
  /* Actual tap area */
  position: relative;
}
.icon-btn::after {
  content: '';
  position: absolute;
  inset: -4px;    /* 36 + 4*2 = 44px effective touch area */
}
```

### Kontrast Tekshiruvi

```
TEXT                    BG                  RATIO    WCAG
─────────────────────────────────────────────────────────
#0D1117 (text)          #F0F2F5 (bg)        15.4:1   AAA ✅
#6B7385 (muted)         #FFFFFF (surface)    4.6:1   AA  ✅
#10B981 (primary)       #FFFFFF (surface)    2.4:1   FAIL ❌  → primary rangni matn uchun ISHLATMA
#10B981 icon/border     #F0F2F5 (bg)        —        OK (non-text) ✅
#059669 (primary-h)     #FFFFFF             3.0:1    FAIL — faqat katta matnda (18px+) ishlat
```

**Muhim:** `text-edu-primary` — faqat link, icon, border. Hech qachon oddiy body text sifatida.

### ARIA

```jsx
// Har bir icon-only button
<button aria-label="Yopish">
  <X size={18} />
</button>

// Har bir async loading state
<div aria-busy={isLoading} aria-live="polite">
  {isLoading ? <Skeleton /> : content}
</div>

// Status badge
<span role="status" aria-label={`Holat: ${statusLabel}`}>
  <StatusBadge status={task.status} />
</span>
```

---

## BOSQICH 9 — PERFORMANCE

### Bundle Optimizatsiya

1. **Framer Motion tree-shaking:**
```js
// Faqat kerakli narsalarni import qiling
import { motion, AnimatePresence } from 'framer-motion';
// emas: import * as motion from 'framer-motion'
```

2. **Lucide React — individual import:**
```js
// Yaxshi
import { Search } from 'lucide-react';
// Yomon
import * as Icons from 'lucide-react';
```

3. **react-pdf lazy load:** Faqat EduViewer ochilganda yuklansin:
```js
const PdfPreview = lazy(() => import('./PdfPreview'));
```

4. **i18n bundle split:** Har bir til alohida chunk:
```js
import(/* webpackChunkName: "uz" */ '../locales/uz.json')
```

---

## BOSQICH 10 — 5 TA HAQIQIY INNOVATSION IDEA

*(To'lov tizimidan tashqari, bozorda hech kimda yo'q)*

---

### IDEA 1 — "Smart Brief" — AI-Powered Task Creation

**Muammo:** Hozir foydalanuvchi 5 ta step'dan o'tadi va ko'p narsa yozishi kerak. Ko'pchilik talabalar vazifasini noaniq yozadi — freelancer tushunmaydi, revision ko'payadi.

**Yechim:** Bitta input maydoni — foydalanuvchi oddiy gapda yozadi:
```
"Iqtisodiyot fanidan kurs ishi kerak, 20 bet, GOST format, 
 bir haftada, 150 ming so'm atrofida"
```
Backend'da GPT-3.5-turbo (yoki Mistral 7B) orqali bu matn parse qilinadi va `title`, `description`, `priceMin`, `priceMax`, `deadline`, `category`, `metadata` avtomatik to'ldiriladi. Foydalanuvchi faqat confirm bosadi.

**Texnik implement:**
```
Client → POST /ai/parse-brief { text: "..." }
Backend → Mistral API → structured JSON
Client → Form avtomatik to'ldiriladi
User → Tekshirib tasdiqlaydi
```

**Nima uchun unique:** Ko'pchilik platformalar AI faqat tavsiya uchun ishlatadi. Bu erda AI form filling assistant — friction 90% kamaytiradi.

---

### IDEA 2 — "Reputation DNA" — Algoritmik Ishonch Pasporti

**Muammo:** Hozirgi reyting tizimi oddiy `ratingSum/ratingCount`. Yangi freelancer ham, eski ham 4.8 ko'rsatishi mumkin — ishonch darajasini aniqlash qiyin.

**Yechim:** Multi-dimensional reputation score:

```js
const DNA_SCORE = {
  completionRate:    weight 0.30,   // Topshiriqlarni yakunlash %
  responseSpeed:     weight 0.20,   // O'rtacha javob berish vaqti
  revisionRate:      weight 0.15,   // Revision so'rovlar %
  deadlineAccuracy:  weight 0.20,   // Muddatga rioya qilish %
  repeatClients:     weight 0.15,   // Qayta buyurtma bergan mijozlar %
}

// Vizual: DNA helix animatsiya
// Profil sahifasida: 5 uchburchakli "radar chart"
// Har bir freelancer o'zining DNA pattern'iga ega
```

**UI:** Profil sahifasida `ReputationPassportCard` o'rniga radar chart (recharts bilan) — `D3.js` ishlatib interactive.

**Nima uchun unique:** Oddiy yulduz emas, balki "qaysi sohada qanchalik ishonchli" ko'rsatadi. Klient to'g'ri odamni tanlashi osonlashadi.

---

### IDEA 3 — "Study Buddy" — Co-working Mode

**Muammo:** Platforma hozir faqat freelancer-client model. Lekin talabalar ba'zan birgalikda ishlashni xohlashadi — guruhda loyiha bajarish, xarajatni bo'lish.

**Yechim:** Task yaratishda yangi mode — "Ko'p ijrochi":

```
TASK → "Ko'p ijrochi" toggle ON
│
├── Max ijrochi soni: [2] [3] [4]
├── To'lov taqsimlash: [Teng] [Muayyan %]
│     Freelancer 1: 60%
│     Freelancer 2: 40%
│
└── Har bir freelancer o'z bid beradi
    Client GURUHI qabul qiladi
    Chat: uch tomon (client + 2 freelancer)
    Delivery: birgalikda
```

**Database o'zgarish:**
```prisma
model TaskCollaborator {
  id           String  @id
  taskId       String
  freelancerId String
  sharePercent Int     // 0-100
  status       String  // INVITED | ACCEPTED | DECLINED
}
```

**Nima uchun unique:** Fiverr, Upwork, Kwork'da bunday yo'q. Talabalar o'rtasidagi hamkorlikni rasmiylashtirib, har ikki tomon uchun himoya ta'minlaydi.

---

### IDEA 4 — "LiveReview" — Real-time Delivery Preview with Annotations

**Muammo:** Hozir delivery preview — statik fayl ko'rish. Client ko'radi, so'ng "revision" yozadi — freelancer nima o'zgartirish kerakligini tushunmaydi.

**Yechim:** PDF/DOCX preview'da annotation tool:

```
DeliveryPreviewCard → [📝 Izoh qo'shish] tugma
│
├── PDF sahifada marker bilan belgilash
├── Matn comment qoldirish
│     "Bu qismni kengaytiring"
│     "Bu formula noto'g'ri"
│
└── Freelancer chat'da annotation ko'radi
    Aniq nima o'zgartirish kerakligini biladi
```

**Texnik:**
```
react-pdf + custom canvas overlay
Annotation → JSON formatda saqlanadi
{
  page: 3,
  x: 145, y: 280,
  comment: "Bu joyni kengaytiring",
  type: "highlight" | "arrow" | "text"
}
→ Chat'da annotation preview ko'rinadi
```

**Nima uchun unique:** Ko'pchilik platformalarda delivery = fayl yuklash, comment = oddiy matn. Bu annotation'lar revision cycle'ni 3-4 marta qisqartiradi.

---

### IDEA 5 — "EduTokens" — Gamified Loyalty Currency

**Muammo:** Hozirgi gamifikatsiya: streak, XP, badge. Lekin bular hech narsaga konvertatsiya qilinmaydi — foydalanuvchi motivatsiyasi tez so'nadi.

**Yechim:** `EduTokens` — platforma ichki valyutasi:

```
TOKEN TOPISH:
├── Har bajarilgan vazifa: +50 token
├── 5 yulduzli review olish: +20 token
├── Do'st taklif qilish: +30 token (ularning birinchi buyurtmasidan)
├── 7 kunlik streak: +10 token/kun
├── Muddatiga vaqtida topshirish: +15 token
└── Dispute yutish: +25 token

TOKEN SARFLASH:
├── VIP obuna: 500 token = 7 kun VIP (naqd o'rniga)
├── Task "Boost": 100 token = 24 soat top'da
├── "Priority Review": 50 token = adminlar birinchi tekshiradi
├── "Anonymous Bid": 75 token = mijoz sizning narxingizni ko'rmaydi (reyting asosida tanlash)
└── Platform fee kamaytirish: 200 token = keyingi 3 topshiriqda 5% fee yo'q
```

**Muhim:** Token sotib bo'lmaydi (faqat topish), sotib bo'lmaydi (pul emas). Bu gamifikatsiya uchun.

**UI:** Wallet icon NavBar'da, token balance doim ko'rinib turadi. `TokenHistory` screen — xuddi bank statement kabi.

**Nima uchun unique:** Ko'pchilik platformalar cashback beradi (pul). Bu esa "engagement currency" — foydalanuvchi platformada qolishi uchun yanada ko'proq sabab beradi, lekin real pul yo'q (moliyaviy xavfsiz).

---

## XULOSA — BIRINCHI QO'L QADAMLAR

Agar ertadan boshlamoqchi bo'lsangiz, tartibi:

```
1. [1 soat]  tailwind.config.js yangilash (radius, fontSize)
2. [2 soat]  index.css — barcha :root token yangilash
3. [1 soat]  Card.jsx + Button.jsx — token connect
4. [30 min]  Dark mode manual test (browser devtools)
5. [30 min]  TaskCard.jsx — Framer drag olib tashlash
6. [1 soat]  ChatScreen.jsx — grid layout fix
```

Bu 6 soat ichida eng ko'zga ko'rinadigan muammolar hal bo'ladi. Keyin yuqoridagi full roadmap bo'yicha davom etish mumkin.

---

*EduMarket UI/UX Redesign Roadmap v1.0 | 2026-06-13*
*Har qanday token o'zgarishi design system bible bilan sync bo'lishi SHART.*
