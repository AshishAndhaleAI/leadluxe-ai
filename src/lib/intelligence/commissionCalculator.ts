// ============================================================
// LeadLuxe AI — Commission Calculator
// Calculates estimated commission from property value using
// country-specific commission rates.
// ============================================================

export interface CommissionResult {
  propertyValue: number;
  currency: string;
  commissionRate: number;
  estimatedCommission: number;
  commissionUSD: number;
  countryCode: string;
}

export interface CommissionRate {
  countryCode: string;
  rate: number; // Percentage (e.g., 3.0 = 3%)
  label: string;
}

// Country-specific commission rates
export const COMMISSION_RATES: CommissionRate[] = [
  { countryCode: 'IN', rate: 3.0,  label: 'India — 3.0%' },
  { countryCode: 'AE', rate: 2.5,  label: 'UAE — 2.5%' },
  { countryCode: 'GB', rate: 1.5,  label: 'UK — 1.5%' },
  { countryCode: 'DE', rate: 3.57, label: 'Germany — 3.57%' },
  { countryCode: 'US', rate: 2.5,  label: 'USA — 2.5%' },
  { countryCode: 'JP', rate: 3.0,  label: 'Japan — 3.0%' },
  { countryCode: 'SG', rate: 2.0,  label: 'Singapore — 2.0%' },
  { countryCode: 'SA', rate: 2.5,  label: 'Saudi Arabia — 2.5%' },
  { countryCode: 'CA', rate: 2.5,  label: 'Canada — 2.5%' },
  { countryCode: 'AU', rate: 2.5,  label: 'Australia — 2.5%' },
  { countryCode: 'MY', rate: 3.0,  label: 'Malaysia — 3.0%' },
  { countryCode: 'QA', rate: 2.0,  label: 'Qatar — 2.0%' },
  { countryCode: 'FR', rate: 3.5,  label: 'France — 3.5%' },
  { countryCode: 'ES', rate: 3.0,  label: 'Spain — 3.0%' },
  { countryCode: 'IT', rate: 3.0,  label: 'Italy — 3.0%' },
  { countryCode: 'NL', rate: 2.0,  label: 'Netherlands — 2.0%' },
  { countryCode: 'TH', rate: 2.5,  label: 'Thailand — 2.5%' },
  { countryCode: 'VN', rate: 2.5,  label: 'Vietnam — 2.5%' },
  { countryCode: 'BR', rate: 3.0,  label: 'Brazil — 3.0%' },
  { countryCode: 'MX', rate: 3.0,  label: 'Mexico — 3.0%' },
  { countryCode: 'TR', rate: 2.0,  label: 'Turkey — 2.0%' },
  { countryCode: 'KR', rate: 2.5,  label: 'South Korea — 2.5%' },
];

// Rough USD conversion rates (approximate — in production use an API)
const USD_CONVERSION: Record<string, number> = {
  INR: 0.012, AED: 0.27, USD: 1.0, GBP: 1.27,
  EUR: 1.08, SGD: 0.74, SAR: 0.27, CAD: 0.73,
  AUD: 0.65, MYR: 0.21, QAR: 0.27, JPY: 0.0067,
  KRW: 0.00075, THB: 0.028, VND: 0.000041,
  BRL: 0.18, MXN: 0.054, TRY: 0.031,
};

/**
 * Get commission rate for a country
 */
export function getCommissionRate(countryCode: string): number {
  const found = COMMISSION_RATES.find(r => r.countryCode === countryCode);
  return found?.rate ?? 3.0; // Default 3%
}

/**
 * Convert any currency to approximate USD
 */
export function toUSD(amount: number, currency: string): number {
  const rate = USD_CONVERSION[currency.toUpperCase()] || 0.01;
  return amount * rate;
}

/**
 * Calculate commission for a property
 */
export function calculateCommission(
  propertyValue: number,
  countryCode: string,
  currency: string = 'USD'
): CommissionResult {
  const commissionRate = getCommissionRate(countryCode);
  const estimatedCommission = (propertyValue * commissionRate) / 100;
  const commissionUSD = toUSD(estimatedCommission, currency);

  return {
    propertyValue,
    currency,
    commissionRate,
    estimatedCommission,
    commissionUSD: Math.round(commissionUSD * 100) / 100,
    countryCode,
  };
}

/**
 * Calculate commission for multiple properties
 */
export function calculateBatchCommissions(
  items: Array<{ value: number; countryCode: string; currency: string }>
): CommissionResult[] {
  return items.map(item => calculateCommission(item.value, item.countryCode, item.currency));
}
