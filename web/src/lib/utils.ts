export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function initials(name?: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return 'SC';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
}

/** Turns 03003440200 / +92 300 3440200 into 923003440200 for wa.me links. */
export function waDigits(phone?: string) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  return digits;
}

export function waLink(phone?: string, text?: string) {
  const base = `https://wa.me/${waDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export function telLink(phone?: string) {
  return `tel:${String(phone || '').replace(/\s/g, '')}`;
}

export function formatDate(value?: string | Date) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(value?: string) {
  if (!value) return '';
  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Date.now() - then;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
  return formatDate(value).split(',')[0];
}

export function listToText(value: any) {
  if (Array.isArray(value)) return value.join('\n');
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.join('\n');
    } catch {
      /* plain text */
    }
    return value;
  }
  return '';
}
