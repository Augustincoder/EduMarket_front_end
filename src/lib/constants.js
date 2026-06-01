// src/lib/constants.js

export const CATEGORIES = [
  { value: 'REFERAT',      label: 'Referat',       emoji: '📄' },
  { value: 'SLAYD',        label: 'Slayd',         emoji: '📊' },
  { value: 'TARJIMA',      label: 'Tarjima',       emoji: '🌐' },
  { value: 'KURS_ISHI',    label: 'Kurs ishi',     emoji: '📚' },
  { value: 'KONSPEKT',     label: 'Konspekt',      emoji: '📝' },
  { value: 'LABORATORIYA', label: 'Laboratoriya',  emoji: '🔬' },
  { value: 'BOSHQA',       label: 'Boshqa',        emoji: '📌' },
];

export const STATUS_CONFIG = {
  OPEN:        { label: 'Ochiq',         bg: '#E1F5EE', text: '#0F6E56', dot: '#1D9E75' },
  ASSIGNED:    { label: 'Biriktirildi', bg: '#EEEDFE', text: '#3C3489', dot: '#534AB7' },
  IN_PROGRESS: { label: 'Jarayonda',    bg: '#E6F1FB', text: '#0C447C', dot: '#185FA5' },
  IN_REVIEW:   { label: 'Tekshiruvda', bg: '#FAEEDA', text: '#633806', dot: '#BA7517' },
  COMPLETED:   { label: 'Yakunlandi',  bg: '#EAF3DE', text: '#27500A', dot: '#3B6D11' },
  CANCELED:    { label: 'Bekor',        bg: '#F1EFE8', text: '#5F5E5A', dot: '#888780' },
  DISPUTED:    { label: 'Nizo',         bg: '#FCEBEB', text: '#791F1F', dot: '#A32D2D' },
};

export const BADGE_CONFIG = {
  YANGI:      { label: 'Yangi',      color: '#888780', bg: '#F1EFE8' },
  ISHONCHLI:  { label: 'Ishonchli', color: '#185FA5', bg: '#E6F1FB' },
  PRO:        { label: 'Pro ⭐',    color: '#0F6E56', bg: '#E1F5EE' },
  ELITE:      { label: 'Elite 👑',  color: '#BA7517', bg: '#FAEEDA' },
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

export const BLOCKED_EXTENSIONS = ['.exe', '.bat', '.py', '.sh', '.cmd', '.vbs'];

export const MAX_FILE_SIZE_MB = 20;
export const MAX_FILES        = 5;

export const formatPrice = (price) =>
  new Intl.NumberFormat('uz-UZ').format(price);

export const formatPriceRange = (min, max) =>
  `${formatPrice(min)} — ${formatPrice(max)} so'm`;
