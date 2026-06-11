# EduMarket AI Task Instructions
> **Maqsad:** EduMarket loyihasida ishlayotgan har qanday AI uchun majburiy ko'rsatmalar.
> Bu fayl AI'ga task berishda context sifatida qo'shiladi.

---

## LOYIHA HAQIDA

**EduMarket** — Telegram Mini App formatidagi O'zbekistondagi talabalar uchun akademik xizmatlar marketplace'i.

**Stack:**
- Frontend: React 19 + Vite + TailwindCSS v4 + Zustand + React Query
- Backend: Node.js + Express + Prisma + PostgreSQL + Redis + Socket.IO
- Platformer: Telegram Mini App

**Muhim fayllar:**
- Design System: `docs/DESIGN_SYSTEM_BIBLE.md`
- Enterprise Audit: `docs/ENTERPRISE_AUDIT_2026.md`
- UX & User Flow: `docs/UX_USERFLOW_BIBLE.md`
- **Task Lifecycle (YURAGI):** `docs/TASK_LIFECYCLE_UX_BIBLE.md` ← BIRINCHI O'QI
- CSS Tokens: `edumarket-frontend/src/index.css`
- Tailwind Config: `edumarket-frontend/tailwind.config.js`

---

## RANG QOIDALARI (AI MAJBURIY)

```
HECH QACHON hardcoded rang ishlatma:
❌ #007AFF, #5856D6, #10B981, #6366F1 — YOZMANG

DOIM token ishlatilsin:
✅ CSS: var(--edu-primary), var(--edu-surface), var(--edu-text)
✅ Tailwind: text-edu-primary, bg-edu-surface, border-edu-border

RANG TOKENLAR:
- edu-primary: Asosiy brand rangi (Emerald Green)
- edu-accent: Ikkinchi rang (Indigo)
- edu-bg: Sahifa foni
- edu-surface: Karta foni
- edu-text: Asosiy matn
- edu-muted: Ikkinchi darajali matn
- edu-border: Chegara rangi
- edu-urgent: Xato/warning
- edu-vip: VIP elements

STATUS RANGLAR:
- status-open, status-assigned, status-progress
- status-review, status-completed, status-canceled, status-disputed
```

---

## BORDER RADIUS QOIDALARI (AI MAJBURIY)

```
QIYMATLAR JADVALI:
Kichik chip/badge:   rounded-lg (8px)  → rounded-xl (12px)
Input/tugma:         rounded-xl (12px)
Karta (standart):    rounded-2xl (16px)
Katta karta:         rounded-3xl (24px)
Avatar/pill:         rounded-full

MISOL:
✅ className="rounded-2xl"           ← karta
✅ className="rounded-xl"            ← tugma
✅ className="rounded-full"          ← badge, avatar

❌ className="rounded-[20px]"        ← faqat maxsus holatda
❌ className="rounded-[18px]"        ← tokendan foydalaning
```

---

## TYPOGRAPHY QOIDALARI (AI MAJBURIY)

```
FONT WEIGHT IERARXIYA:
font-normal (400)  → Body text, paragraf
font-medium (500)  → Muhim body text
font-semibold (600)→ Section label, nav
font-bold (700)    → Sarlavha, tugma
font-extrabold(800)→ Hero sarlavha
font-black (900)   → FAQAT: narx raqamlari, primary CTA

QOIDA: Bir sahifada max 3 font weight!

FONT SIZE:
text-2xs (10px) → badge, tiny label
text-xs (12px)  → caption, meta
text-sm (13px)  → subtitle, secondary
text-base (14px)→ body text
text-md (15px)  → important body
text-lg (16px)  → section title
text-xl (18px)  → katta sarlavha
text-2xl (20px) → sahifa sarlavhasi

UPPERCASE LABEL PATTERN:
<h3 className="text-xs font-black text-edu-muted uppercase tracking-widest">
  SECTION SARLAVHASI
</h3>
```

---

## SPACING QOIDALARI (AI MAJBURIY)

```
KARTA PADDING:
p-3.5 (14px) → kichik karta
p-4   (16px) → standart karta
p-5   (20px) → katta karta
p-6   (24px) → hero karta

SECTION ORALIQ:
gap-3 (12px)  → list items orasida
gap-4 (16px)  → kartalar orasida
mb-6  (24px)  → section orasida
mb-8  (32px)  → katta section orasida
mb-10 (40px)  → muhim ajratish

SAHIFA PADDING:
p-4 → standart
pb-24 → bottom navigation uchun JOY (MAJBURIY)
```

---

## KOMPONENT PATTERN (AI MAJBURIY SHABLON)

### Karta Komponenti
```jsx
// STANDART KARTA
<Card
  isPressable          // ← kliklaniladigan bo'lsa majburiy
  onClick={handleClick}
  className="bg-edu-surface border border-edu-border/20 
             rounded-2xl shadow-ios"
  radius="2xl"
>
  <CardContent className="p-4">
    {/* Icon */}
    <div className="w-10 h-10 rounded-xl bg-edu-primary/10 
                    text-edu-primary flex items-center justify-center">
      <Icon size={20} />
    </div>
    {/* Matn */}
    <h3 className="text-md font-bold text-edu-text mt-3">Sarlavha</h3>
    <p className="text-sm text-edu-muted mt-1">Tavsif</p>
  </CardContent>
</Card>
```

### Section Sarlavhasi Pattern
```jsx
// STANDART SECTION HEADER
<div className="flex justify-between items-center mb-4 px-1">
  <h3 className="text-xs font-black text-edu-muted uppercase tracking-widest">
    SECTION NOMI
  </h3>
  <button 
    onClick={handleSeeAll}
    className="text-xs font-black text-edu-primary flex items-center gap-1"
  >
    Hammasi <ChevronRight size={14} strokeWidth={3} />
  </button>
</div>
```

### Tugma Pattern
```jsx
// ASOSIY CTA (Primary)
<button
  onClick={handleAction}
  className="w-full bg-edu-primary text-white font-black text-base
             py-3.5 rounded-2xl shadow-btn
             active:scale-95 transition-transform"
>
  Tugma matni
</button>

// IKKINCHI DARAJALI (Secondary)
<button
  className="w-full bg-edu-surface text-edu-text font-bold text-base
             py-3.5 rounded-2xl border border-edu-border
             active:scale-95 transition-transform"
>
  Ikkinchi tugma
</button>

// XAVFLI (Destructive)
<button
  className="text-edu-urgent font-bold text-sm
             active:opacity-70 transition-opacity"
>
  O'chirish
</button>
```

### Loading Skeleton Pattern
```jsx
// MAJBURIY: Har bir async komponent uchun skeleton
function ComponentSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} 
             className="h-20 bg-edu-surface rounded-2xl 
                        border border-edu-border/20 
                        animate-pulse" 
        />
      ))}
    </div>
  );
}
```

### Empty State Pattern
```jsx
// MAJBURIY: Ro'yxat bo'sh bo'lsa
function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="bg-edu-surface/50 rounded-2xl p-8 
                    text-center border border-dashed border-edu-border">
      <div className="text-4xl mb-3">📭</div>
      <h4 className="text-sm font-bold text-edu-text mb-1">{title}</h4>
      <p className="text-xs text-edu-muted mb-4">{description}</p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="text-xs font-bold text-white bg-edu-primary
                     px-4 py-2 rounded-xl active:scale-95 transition-transform"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
```

---

## DARK MODE QOIDALARI (AI MAJBURIY)

```
QOIDA: Har bir rang uchun dark: variant yozing!

STANDART PATTERN:
bg-edu-surface dark:bg-[#1C1C1E]          → karta foni
text-edu-text dark:text-white              → matn
border-edu-border dark:border-white/10     → chegara
text-edu-muted dark:text-gray-400          → ikkinchi darajali matn

FOYDALANING:
Tailwind tokenlar dark mode'ni avtomatik qo'llab-quvvatlaydi
✅ bg-edu-surface     → light: #FFF, dark: #1C1C1E (avtomatik)
✅ text-edu-muted     → light: #8E8E93, dark: #98989D (avtomatik)

Faqat custom holatlar uchun dark: variant:
✅ dark:bg-[#1C1C1E]  → custom dark surface
✅ dark:border-white/10 → custom dark border
```

---

## INTERAKTIVLIK QOIDALARI (AI MAJBURIY)

```
PRESS EFFEKT — MAJBURIY:
Har qanday kliklaniladigan elementga quyidagilardan biri:

1. Tailwind: active:scale-95 transition-transform
2. CSS class: press-scale (index.css'da belgilangan)
3. CSS class: active-spring (kuchliroq press)

HOVER EFFEKT (desktop/tablet):
hover:bg-edu-surface-2 hover:border-edu-border
hover:shadow-ios-lg

TRANSITION:
transition-all duration-300   → default
transition-transform           → faqat transform uchun
transition: var(--spring-duration) var(--spring-easing)  → spring
```

---

## ACCESSIBILITY QOIDALARI (AI MAJBURIY)

```
TOUCH TARGET:
Barcha interaktiv: min-w-[44px] min-h-[44px]

ARIA LABELS:
Icon-only buttons: aria-label="..."
<button aria-label="Yopish" onClick={close}>
  <X size={20} />
</button>

SEMANTIC HTML:
✅ <button> — tugmalar uchun
✅ <a> — linklar uchun
✅ <h1>, <h2>, <h3> — sarlavhalar uchun
✅ <nav> — navigatsiya uchun

❌ <div onClick> — button o'rniga
❌ Heading ierarxiyasini buzmaslik
```

---

## SHART BO'LGAN PATTERNS

```
1. Har bir screen: pb-24 (bottom nav uchun joy)
2. Har bir ro'yxat: loading + empty + error state
3. Har bir karta: press effekt
4. Har bir form: validation + error messages
5. Har bir icon-only button: aria-label
6. Dark mode: test qiling
```

---

## MISOL: TO'G'RI VS NOTO'G'RI

```jsx
// ❌ NOTO'G'RI
<div 
  style={{backgroundColor: '#10B981', borderRadius: '20px'}}
  onClick={handleClick}
>
  <span style={{fontSize: '15px', fontWeight: 900}}>Tugma</span>
</div>

// ✅ TO'G'RI
<button
  onClick={handleClick}
  className="bg-edu-primary text-white font-black text-md
             px-6 py-3.5 rounded-2xl shadow-btn
             active:scale-95 transition-transform"
>
  Tugma
</button>
```

```jsx
// ❌ NOTO'G'RI — loading yo'q, empty yo'q
function TaskList() {
  const { data } = useQuery({...});
  return data?.map(task => <TaskCard key={task.id} task={task} />);
}

// ✅ TO'G'RI — barcha holatlar
function TaskList() {
  const { data, isLoading, error, refetch } = useQuery({...});
  
  if (isLoading) return <TaskListSkeleton />;
  if (error) return <ErrorState onRetry={refetch} />;
  if (!data?.length) return <EmptyState title="Topshiriqlar yo'q" />;
  
  return (
    <div className="space-y-3">
      {data.map(task => <TaskCard key={task.id} task={task} />)}
    </div>
  );
}
```

---

*EduMarket AI Task Instructions v1.0 | 2026-06-09*
*Bu faylni har doim context sifatida AI'ga bering!*
