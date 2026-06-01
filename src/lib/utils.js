// src/lib/utils.js
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(price) {
  return new Intl.NumberFormat('uz-UZ').format(price);
}

export function formatPriceRange(min, max) {
  return `${formatPrice(min)} — ${formatPrice(max)} so'm`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDatetime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'Hozirgina';
  if (mins < 60)  return `${mins} daqiqa oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} soat oldin`;
  const days = Math.floor(hrs / 24);
  return `${days} kun oldin`;
}

export function deadlineCountdown(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now();
  if (diff <= 0) return "Muddati o'/tgan";
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  if (days > 0) return `${days} kun`;
  return `${hrs} soat`;
}

export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export function copyToClipboard(text) {
  return navigator.clipboard.writeText(text).catch(() => {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  });
}
