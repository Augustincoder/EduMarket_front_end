// src/lib/constants.js

export const STATUS_CONFIG = {
  OPEN:        { label: 'Ochiq',         bg: 'var(--edu-primary-l)', text: 'var(--edu-primary-h)', dot: 'var(--status-open)' },
  ASSIGNED:    { label: 'Biriktirildi', bg: 'var(--edu-accent-l)', text: 'var(--edu-accent-h)', dot: 'var(--status-assigned)' },
  IN_PROGRESS: { label: 'Jarayonda',    bg: 'var(--edu-info-l)', text: 'var(--edu-info)', dot: 'var(--status-progress)' },
  IN_REVIEW:   { label: 'Tekshiruvda', bg: 'var(--edu-warn-l)', text: 'var(--edu-vip)', dot: 'var(--status-review)' },
  COMPLETED:   { label: 'Yakunlandi',  bg: 'var(--edu-primary-l)', text: 'var(--edu-primary-h)', dot: 'var(--status-completed)' },
  CANCELED:    { label: 'Bekor',        bg: 'var(--edu-surface-3)', text: 'var(--edu-muted)', dot: 'var(--status-canceled)' },
  DISPUTED:    { label: 'Nizo',         bg: 'var(--edu-urgent-l)', text: 'var(--edu-urgent)', dot: 'var(--status-disputed)' },
};

export const BADGE_CONFIG = {
  YANGI:      { label: 'Yangi',      color: 'var(--edu-muted)', bg: 'var(--edu-surface-3)' },
  ISHONCHLI:  { label: 'Ishonchli', color: 'var(--edu-info)', bg: 'var(--edu-info-l)' },
  PRO:        { label: 'Pro ⭐',    color: 'var(--edu-primary-h)', bg: 'var(--edu-primary-l)' },
  ELITE:      { label: 'Elite 👑',  color: 'var(--edu-vip)', bg: 'var(--edu-vip-l)' },
};

export const VIP_PACKAGES = [
  {
    key: '7_DAY',
    label: '7 Kunlik',
    price: 50000,
    priceFormatted: '50,000',
    tag: null,
  },
  {
    key: '30_DAY',
    label: '30 Kunlik',
    price: 150000,
    priceFormatted: '150,000',
    tag: 'Tavsiya ✨',
  },
];

export const VIP_BENEFITS = [
  { icon: '👑', text: "Qidiruvda 1-o'rin" },
  { icon: '📂', text: '20 tagacha portfolio' },
  { icon: '🔥', text: "Takliflarda ustuvor ko'rsatilish" },
  { icon: '💎', text: 'Maxsus VIP badge' },
  { icon: '📢', text: 'Gig (xizmat) yaratish huquqi' },
];

export const NAV_ITEMS = [
  { icon: 'Home',      label: 'Asosiy',   route: '/home'         },
  { icon: 'ClipboardList', label: 'Vazifalar', route: '/tasks'   },
  { icon: 'Plus',      label: '',          route: '/tasks/create' },
  { icon: 'Briefcase', label: 'Xizmatlar', route: '/gigs'         },
  { icon: 'User',      label: 'Profil',   route: '/profile'       },
];

export const NLP_PATTERNS = [
  { pattern: /o[''']rnimga.*imtihon/i,  severity: 'block' },
  { pattern: /o[''']rnimga.*test/i,     severity: 'block' },
  { pattern: /ielts.*kirish/i,           severity: 'block' },
  { pattern: /diplom.*sotib/i,           severity: 'block' },
  { pattern: /dissertatsiya.*yoz/i,      severity: 'block' },
  { pattern: /hiyla.*qil/i,              severity: 'block' },
  { pattern: /aldash/i,                  severity: 'block' },
  { pattern: /mening o[''']rnimga/i,     severity: 'warn'  },
  { pattern: /imtihon\s*topshir/i,       severity: 'warn'  },
];

export const ACCEPTED_MIME_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
  'text/csv',
  'application/json',
].join(',');

export const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.py', '.sh', '.cmd', '.vbs', '.js', '.php'];

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILES        = 5;

export const formatPrice = (price) =>
  new Intl.NumberFormat('uz-UZ').format(price);

export const formatPriceRange = (min, max) =>
  `${formatPrice(min)} — ${formatPrice(max)} so'm`;
