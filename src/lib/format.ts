// Enterprise Indian Number Formatting
// Formats: ₹2.43 Cr, ₹86.5 L, ₹15.2 K

export function formatIndianCurrency(amount: number): string {
  if (amount >= 10000000) {
    const cr = amount / 10000000;
    return `₹${cr.toFixed(cr % 1 === 0 ? 0 : 1)} Cr`;
  }
  if (amount >= 100000) {
    const l = amount / 100000;
    return `₹${l.toFixed(l % 1 === 0 ? 0 : 1)} L`;
  }
  if (amount >= 1000) {
    const k = amount / 1000;
    return `₹${k.toFixed(k % 1 === 0 ? 0 : 1)} K`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatIndianNumber(num: number): string {
  if (num >= 10000000) return `${(num / 10000000).toFixed(2)} Cr`;
  if (num >= 100000) return `${(num / 100000).toFixed(1)} L`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)} K`;
  return num.toString();
}

export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatLeadScore(score: number): string {
  return `${score}/100`;
}

export function formatConversionRate(leads: number, booked: number): string {
  if (leads === 0) return '0%';
  return formatPercentage((booked / leads) * 100);
}

export function abbreviateName(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getScoreCategory(score: number): { label: string; color: string; emoji: string } {
  if (score >= 80) return { label: 'Hot Lead', color: 'text-red-400', emoji: '🔥' };
  if (score >= 60) return { label: 'Warm Lead', color: 'text-amber-400', emoji: '⚡' };
  if (score >= 40) return { label: 'Warm-ish', color: 'text-yellow-400', emoji: '🌤️' };
  return { label: 'Cold Lead', color: 'text-gray-400', emoji: '❄️' };
}

export function getStatusEmoji(status: string): string {
  const map: Record<string, string> = {
    new: '🆕',
    contacted: '📞',
    qualified: '✅',
    site_visit: '🏗️',
    negotiation: '🤝',
    booked: '🎉',
    lost: '❌',
  };
  return map[status] || '📋';
}

export function getSourceIcon(source: string): string {
  const map: Record<string, string> = {
    website: '🌐',
    whatsapp: '💬',
    referral: '👥',
    social_media: '📱',
    email: '📧',
    phone: '📞',
    other: '📋',
  };
  return map[source] || '📋';
}
