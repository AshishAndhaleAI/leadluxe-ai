// ============================================================
// LeadLuxe AI — Transparent Commission Calculator
// Full breakdown: gross commission → platform share → partner
// share → net payout → tax estimate → payment schedule
// ============================================================

export interface CommissionBreakdown {
  dealValue: number;
  grossCommission: number;
  commissionRate: number;
  platformShare: number;
  partnerShare: number;
  netPayout: number;
  taxEstimate: number;
  taxRate: number;
  netAfterTax: number;
  paymentSchedule: string;
  countryNorms: string;
  currency: string;
}

export interface CountryCommissionNorm {
  countryCode: string;
  typicalRate: number;
  minRate: number;
  maxRate: number;
  regulation: string;
  notes: string;
}

export const COUNTRY_COMMISSION_NORMS: CountryCommissionNorm[] = [
  { countryCode: 'IN', typicalRate: 2.0, minRate: 1.0, maxRate: 3.0, regulation: 'RERA compliant', notes: 'Standard 2% for primary, 1-2% for resale' },
  { countryCode: 'AE', typicalRate: 2.0, minRate: 1.0, maxRate: 3.0, regulation: 'RERA Dubai', notes: '2% standard in Dubai, 1.5% in Abu Dhabi' },
  { countryCode: 'US', typicalRate: 5.0, minRate: 4.0, maxRate: 6.0, regulation: 'State real estate commission', notes: 'Split between buyer/seller agents' },
  { countryCode: 'GB', typicalRate: 1.5, minRate: 1.0, maxRate: 3.0, regulation: 'UK property law', notes: 'Varies by region and service level' },
  { countryCode: 'SG', typicalRate: 2.0, minRate: 1.0, maxRate: 2.0, regulation: 'CEA', notes: 'Capped at 2% for residential' },
  { countryCode: 'SA', typicalRate: 2.5, minRate: 2.0, maxRate: 3.0, regulation: 'SA real estate law', notes: 'Standard 2.5% for off-plan' },
  { countryCode: 'DE', typicalRate: 3.57, minRate: 2.5, maxRate: 5.0, regulation: 'Germany brokerage', notes: 'Buyer pays 3.57% typical' },
  { countryCode: 'FR', typicalRate: 5.0, minRate: 3.0, maxRate: 6.0, regulation: 'Loi Hoguet', notes: 'Included in advertised price' },
  { countryCode: 'JP', typicalRate: 3.0, minRate: 2.0, maxRate: 3.0, regulation: 'Japanese real estate law', notes: '3% + ¥60,000 standard' },
  { countryCode: 'KR', typicalRate: 0.5, minRate: 0.3, maxRate: 0.8, regulation: 'Korean brokerage law', notes: 'Very low by global standards' },
  { countryCode: 'CA', typicalRate: 5.0, minRate: 4.0, maxRate: 6.0, regulation: 'Provincial regulations', notes: 'Split between agents' },
  { countryCode: 'AU', typicalRate: 2.5, minRate: 1.5, maxRate: 3.5, regulation: 'State laws', notes: 'Plus marketing costs' },
  { countryCode: 'BR', typicalRate: 6.0, minRate: 4.0, maxRate: 8.0, regulation: 'Brazil real estate law', notes: '6% typical, paid by seller' },
  { countryCode: 'TR', typicalRate: 3.0, minRate: 2.0, maxRate: 4.0, regulation: 'Turkish commercial law', notes: 'Negotiable per transaction' },
  { countryCode: 'ES', typicalRate: 5.0, minRate: 3.0, maxRate: 6.0, regulation: 'Spain LAU', notes: 'Plus VAT' },
  { countryCode: 'IT', typicalRate: 3.0, minRate: 2.0, maxRate: 4.0, regulation: 'Italian civil code', notes: 'Split between agencies' },
];

// =====================
// CALCULATE COMMISSION
// =====================
export function calculateCommission(
  dealValue: number,
  countryCode: string,
  userRole: 'broker' | 'partner' | 'enterprise' = 'broker',
  performanceTier: 'standard' | 'premium' | 'elite' = 'standard'
): CommissionBreakdown {
  const norm = COUNTRY_COMMISSION_NORMS.find(n => n.countryCode === countryCode);
  const baseRate = norm?.typicalRate || 2.0;

  // Adjust rate based on user role and performance
  const roleMultiplier = userRole === 'broker' ? 1.0 : userRole === 'partner' ? 0.85 : userRole === 'enterprise' ? 0.75 : 1.0;
  const tierMultiplier = performanceTier === 'standard' ? 1.0 : performanceTier === 'premium' ? 0.95 : performanceTier === 'elite' ? 0.90 : 1.0;

  const effectiveRate = baseRate * roleMultiplier * tierMultiplier;
  const grossCommission = dealValue * (effectiveRate / 100);

  // Platform share (35% for standard, 30% for premium, 25% for elite)
  const platformShareRate = performanceTier === 'standard' ? 0.35 : performanceTier === 'premium' ? 0.30 : 0.25;
  const platformShare = grossCommission * platformShareRate;
  const partnerShare = grossCommission - platformShare;

  // Tax estimate (18% Indian GST on commission, other countries vary)
  const taxRate = countryCode === 'IN' ? 0.18 : countryCode === 'AE' ? 0.05 : countryCode === 'US' ? 0.15 : countryCode === 'GB' ? 0.20 : 0.10;
  const taxEstimate = partnerShare * taxRate;
  const netAfterTax = partnerShare - taxEstimate;

  // Payment schedule
  const paymentSchedule = dealValue > 100000000 ? 'Milestone-based (booking, 30%, 60%, completion)' :
    dealValue > 10000000 ? '50% at booking, 50% at possession' : 'Full payment at deal closure';

  return {
    dealValue,
    grossCommission: Math.round(grossCommission),
    commissionRate: Math.round(effectiveRate * 100) / 100,
    platformShare: Math.round(platformShare),
    partnerShare: Math.round(partnerShare),
    netPayout: Math.round(partnerShare),
    taxEstimate: Math.round(taxEstimate),
    taxRate: Math.round(taxRate * 100),
    netAfterTax: Math.round(netAfterTax),
    paymentSchedule,
    countryNorms: `${norm?.typicalRate}% typical in ${countryCode} (${norm?.notes || 'standard rate'})`,
    currency: COUNTRY_CURRENCIES[countryCode] || 'USD',
  };
}

export const COUNTRY_CURRENCIES: Record<string, string> = {
  IN: 'INR', AE: 'AED', US: 'USD', GB: 'GBP', SG: 'SGD', SA: 'SAR',
  DE: 'EUR', FR: 'EUR', JP: 'JPY', KR: 'KRW', TH: 'THB', VN: 'VND',
  BR: 'BRL', MX: 'MXN', TR: 'TRY', ES: 'EUR', IT: 'EUR', NL: 'EUR',
  CA: 'CAD', AU: 'AUD', MY: 'MYR', QA: 'QAR', ZA: 'ZAR', NG: 'NGN', EG: 'EGP',
};

// =====================
// FORMAT COMMISSION DISPLAY
// =====================
export function formatCommissionValue(value: number, currency: string): string {
  const syms: Record<string, string> = {
    INR: '₹', AED: 'د.إ', USD: '$', GBP: '£', SGD: 'S$', SAR: '﷼',
    EUR: '€', JPY: '¥', KRW: '₩', THB: '฿', VND: '₫', BRL: 'R$',
    MXN: 'Mex$', TRY: '₺', CAD: 'C$', AUD: 'A$', MYR: 'RM', QAR: '﷼',
  };
  const sym = syms[currency] || '$';
  
  if (value >= 10000000) return `${sym}${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `${sym}${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${sym}${(value / 1000).toFixed(0)}K`;
  return `${sym}${value.toLocaleString()}`;
}
