// ============================================================
// TerraNexus AI — Deal Passport
// Persistent deal record with source URLs, verification,
// activity tracking, audit trail, and commission entitlement.
// Stores to localStorage. Can be upgraded to Supabase.
// ============================================================

export type InvestorType = 'individual' | 'family_office' | 'fund' | 'developer' | 'broker';
export type FundingSource = 'cash' | 'mortgage' | 'fund_capital' | 'structured_financing';
export type InvestmentPurpose = 'rental_yield' | 'capital_appreciation' | 'portfolio_diversification' | 'residency_visa' | 'development_partnership';
export type DealStage = 'discovered' | 'onboarding_complete' | 'introduction_made' | 'buyer_qualified' | 'site_visit_scheduled' | 'site_visit_completed' | 'offer_submitted' | 'negotiation_active' | 'deal_closed' | 'commission_due' | 'commission_paid';

export interface DealPassport {
  id: string;
  propertyId: string;
  propertyName: string;
  developerName: string;
  developerWebsite: string | null;
  city: string;
  country: string;
  countryCode: string;
  priceMin: number;
  priceMax: number;
  estimatedCommission: number;
  currency: string;
  currencySymbol: string;

  // Investor Profile (Phase 10)
  investorType: InvestorType | null;
  budgetRange: { min: number; max: number } | null;
  investmentTimeline: number | null; // in days
  fundingSource: FundingSource | null;
  citizenship: string | null;
  investmentPurpose: InvestmentPurpose | null;

  // Digital Introduction Agreement (Phase 9)
  introductionAgreement: {
    acceptedAt: string | null;
    ipAddress: string | null;
    deviceFingerprint: string | null;
    agreementVersion: string | null;
  };

  // Buyer Qualification (Phase 10)
  buyerQualification: {
    aiCloseScore: number | null;
    financingReadiness: number | null;
    ticketSize: number | null;
    crossBorderEligible: boolean | null;
    negotiationReadiness: number | null;
    institutionalMatchProbability: number | null;
  };

  // Activity timeline (Phase 12)
  activityTimeline: DealTimelineEntry[];

  // Commission tracking
  commission: {
    percentage: number;
    estimatedValue: number;
    currency: string;
    status: 'pending' | 'due' | 'paid' | 'disputed';
    paidAt: string | null;
    payoutAmount: number | null;
  };

  // Audit trail
  auditLog: AuditEntry[];

  // Metadata
  createdAt: string;
  updatedAt: string;
  stage: DealStage;
  isActive: boolean;
}

export interface DealTimelineEntry {
  date: string;
  type: 'site_visit' | 'offer' | 'negotiation' | 'document' | 'note' | 'milestone';
  title: string;
  description: string;
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  details: string;
  userId: string;
}

// ============================================================
// DEAL PASSPORT STORAGE
// ============================================================

const STORAGE_KEY = 'terranexus-deal-passports';

function getStoredPassports(): DealPassport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function savePassports(passports: DealPassport[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(passports));
}

export function getDealPassports(): DealPassport[] {
  return getStoredPassports();
}

export function getDealPassport(id: string): DealPassport | undefined {
  return getStoredPassports().find(p => p.id === id);
}

export function getActiveDealPassports(): DealPassport[] {
  return getStoredPassports().filter(p => p.isActive);
}

export function getDealPassportsByProperty(propertyId: string): DealPassport[] {
  return getStoredPassports().filter(p => p.propertyId === propertyId);
}

export function createDealPassport(params: {
  propertyId: string;
  propertyName: string;
  developerName: string;
  developerWebsite: string | null;
  city: string;
  country: string;
  countryCode: string;
  priceMin: number;
  priceMax: number;
  estimatedCommission: number;
  currency: string;
  currencySymbol: string;
  userId: string;
}): DealPassport {
  const passport: DealPassport = {
    id: `passport-${params.propertyId}-${Date.now()}`,
    ...params,
    investorType: null,
    budgetRange: null,
    investmentTimeline: null,
    fundingSource: null,
    citizenship: null,
    investmentPurpose: null,
    introductionAgreement: {
      acceptedAt: null,
      ipAddress: null,
      deviceFingerprint: null,
      agreementVersion: null,
    },
    buyerQualification: {
      aiCloseScore: null,
      financingReadiness: null,
      ticketSize: null,
      crossBorderEligible: null,
      negotiationReadiness: null,
      institutionalMatchProbability: null,
    },
    activityTimeline: [],
    commission: {
      percentage: 3.0,
      estimatedValue: params.estimatedCommission,
      currency: params.currency,
      status: 'pending',
      paidAt: null,
      payoutAmount: null,
    },
    auditLog: [{
      timestamp: new Date().toISOString(),
      action: 'passport_created',
      details: `Deal Passport created for ${params.propertyName}`,
      userId: params.userId,
    }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stage: 'discovered',
    isActive: true,
  };

  const passports = getStoredPassports();
  passports.unshift(passport);
  savePassports(passports);
  return passport;
}

export function updateDealPassport(
  id: string,
  updates: Partial<DealPassport>,
  auditAction?: string,
  auditDetails?: string,
  userId?: string,
): DealPassport | undefined {
  const passports = getStoredPassports();
  const index = passports.findIndex(p => p.id === id);
  if (index === -1) return undefined;

  passports[index] = {
    ...passports[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  if (auditAction && userId) {
    passports[index].auditLog.push({
      timestamp: new Date().toISOString(),
      action: auditAction,
      details: auditDetails || '',
      userId,
    });
  }

  savePassports(passports);
  return passports[index];
}

export function addTimelineEntry(
  id: string,
  entry: Omit<DealTimelineEntry, 'date'>,
): DealPassport | undefined {
  return updateDealPassport(id, {
    activityTimeline: [
      ...(getStoredPassports().find(p => p.id === id)?.activityTimeline || []),
      { ...entry, date: new Date().toISOString() },
    ],
  });
}

export function acceptIntroductionAgreement(
  id: string,
  userId: string,
  ipAddress?: string,
): DealPassport | undefined {
  return updateDealPassport(
    id,
    {
      introductionAgreement: {
        acceptedAt: new Date().toISOString(),
        ipAddress: ipAddress || null,
        deviceFingerprint: navigator.userAgent || null,
        agreementVersion: '1.0',
      },
      stage: 'introduction_made',
    },
    'introduction_agreement_accepted',
    `Digital Introduction Agreement accepted for passport ${id}`,
    userId,
  );
}

export function updateBuyerQualification(
  id: string,
  qualification: Partial<DealPassport['buyerQualification']>,
  userId: string,
): DealPassport | undefined {
  const existing = getStoredPassports().find(p => p.id === id);
  if (!existing) return undefined;

  return updateDealPassport(
    id,
    {
      buyerQualification: { ...existing.buyerQualification, ...qualification },
      stage: 'buyer_qualified',
    },
    'buyer_qualification_updated',
    `Buyer qualification scores updated for passport ${id}`,
    userId,
  );
}

// ============================================================
// AI CLOSE SCORE CALCULATOR (Phase 10)
// ============================================================

export function calculateCloseScore(params: {
  budgetRange: { min: number; max: number } | null;
  timeline: number | null;
  fundingSource: FundingSource | null;
  investorType: InvestorType | null;
  propertyPriceMin: number;
  propertyPriceMax: number;
}): {
  closeScore: number;
  financingReadiness: number;
  ticketSize: number;
  crossBorderEligible: boolean;
  negotiationReadiness: number;
  institutionalMatchProbability: number;
} {
  let closeScore = 50; // Start neutral
  const factors: string[] = [];

  // Budget match
  if (params.budgetRange) {
    const avgBudget = (params.budgetRange.min + params.budgetRange.max) / 2;
    const avgPrice = (params.propertyPriceMin + params.propertyPriceMax) / 2;
    const ratio = avgBudget / avgPrice;
    if (ratio >= 1.2) { closeScore += 20; factors.push('Budget 20%+ above asking'); }
    else if (ratio >= 1.0) { closeScore += 15; factors.push('Budget covers price range'); }
    else if (ratio >= 0.8) { closeScore += 5; factors.push('Budget within 80% of price'); }
    else { closeScore -= 10; factors.push('Budget below price range'); }
  }

  // Timeline urgency
  if (params.timeline) {
    if (params.timeline <= 30) { closeScore += 15; factors.push('Urgent (30 days)'); }
    else if (params.timeline <= 90) { closeScore += 10; factors.push('Near-term (90 days)'); }
    else if (params.timeline <= 180) { closeScore += 5; factors.push('Medium-term (6 months)'); }
    else { closeScore -= 5; factors.push('Long horizon (12+ months)'); }
  }

  // Funding source strength
  if (params.fundingSource) {
    if (params.fundingSource === 'cash') { closeScore += 20; factors.push('Cash buyer'); }
    else if (params.fundingSource === 'fund_capital') { closeScore += 15; factors.push('Fund capital'); }
    else if (params.fundingSource === 'mortgage') { closeScore += 5; factors.push('Mortgage financing'); }
    else { closeScore += 10; factors.push('Structured financing'); }
  }

  // Investor type
  if (params.investorType) {
    if (params.investorType === 'family_office' || params.investorType === 'fund') {
      closeScore += 10;
      factors.push('Institutional buyer');
    }
  }

  const financingReadiness = Math.min(100, Math.max(0, 
    (params.fundingSource === 'cash' ? 95 : 
     params.fundingSource === 'fund_capital' ? 85 :
     params.fundingSource === 'mortgage' ? 60 : 70) + 
    (params.timeline && params.timeline <= 90 ? 10 : 0)
  ));

  const ticketSize = Math.round((params.propertyPriceMin + params.propertyPriceMax) / 2);

  const crossBorderEligible = params.investorType === 'individual' || 
    params.investorType === 'family_office' || 
    params.investorType === 'fund';

  const negotiationReadiness = Math.min(100, Math.max(0,
    closeScore + (params.timeline && params.timeline <= 90 ? 10 : 0)
  ));

  const institutionalMatchProbability = params.investorType === 'fund' ? 85 :
    params.investorType === 'family_office' ? 75 :
    params.investorType === 'developer' ? 60 : 40;

  return {
    closeScore: Math.min(100, Math.max(0, closeScore)),
    financingReadiness,
    ticketSize,
    crossBorderEligible,
    negotiationReadiness,
    institutionalMatchProbability,
  };
}

// ============================================================
// COMMISSION PIPELINE
// ============================================================

export function getCommissionPipeline(): {
  pending: DealPassport[];
  due: DealPassport[];
  paid: DealPassport[];
  totalPending: number;
  totalDue: number;
  totalPaid: number;
} {
  const passports = getStoredPassports();
  return {
    pending: passports.filter(p => p.commission.status === 'pending'),
    due: passports.filter(p => p.commission.status === 'due'),
    paid: passports.filter(p => p.commission.status === 'paid'),
    totalPending: passports.filter(p => p.commission.status === 'pending')
      .reduce((s, p) => s + p.commission.estimatedValue, 0),
    totalDue: passports.filter(p => p.commission.status === 'due')
      .reduce((s, p) => s + p.commission.estimatedValue, 0),
    totalPaid: passports.filter(p => p.commission.status === 'paid')
      .reduce((s, p) => s + (p.commission.payoutAmount || 0), 0),
  };
}
