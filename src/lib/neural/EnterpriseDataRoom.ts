// ============================================================
// Phase 9: Enterprise Data Room
// Secure institutional workspace with deal pipeline, documents,
// NDAs, access control, and investment memo generation
// ============================================================

export type DealType = 'acquisition' | 'joint_venture' | 'development' | 'funding' | 'exit' | 'partnership';
export type DealStatus = 'draft' | 'active' | 'underwriting' | 'negotiation' | 'closed' | 'archived';
export type DocumentType = 'investment_memo' | 'financial_model' | 'market_report' | 'legal_document' | 'nda' | 'title_document' | 'appraisal' | 'environmental_report' | 'permits' | 'correspondence';
export type AccessLevel = 'owner' | 'editor' | 'viewer' | 'restricted';

export interface DataRoomDeal {
  id: string;
  dealName: string;
  dealType: DealType;
  propertyName?: string;
  city?: string;
  country?: string;
  dealValue: number;
  currency: string;
  status: DealStatus;
  ndaSigned: boolean;
  accessLevel: AccessLevel;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DataRoomDocument {
  id: string;
  dealId: string;
  documentName: string;
  documentType: DocumentType;
  isWatermarked: boolean;
  watermarkText?: string;
  version: number;
  fileUrl?: string;
  notes?: string;
  createdBy: string;
  createdAt: string;
}

export interface DataRoomNDA {
  id: string;
  dealId: string;
  counterpartyName: string;
  counterpartyEmail?: string;
  counterpartyEntity?: string;
  ndaVersion: string;
  signedByUser: boolean;
  signedByCounterparty: boolean;
  signedAt?: string;
  expiresAt?: string;
  documentUrl?: string;
}

// =====================
// GENERATE INVESTMENT MEMO
// =====================
export function generateInvestmentMemo(deal: DataRoomDeal): string {
  const now = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  
  return `CONFIDENTIAL — INVESTMENT MEMORANDUM

TerraNexus AI Enterprise Data Room
Generated: ${now}

DEAL: ${deal.dealName}
TYPE: ${deal.dealType.replace('_', ' ').toUpperCase()}
STATUS: ${deal.status}
ACCESS LEVEL: ${deal.accessLevel}

═══════════════════════════════════════
1. EXECUTIVE SUMMARY
═══════════════════════════════════════

This memorandum outlines the ${deal.dealType.replace('_', ' ')} opportunity ${deal.propertyName ? `for ${deal.propertyName}` : ''} in ${deal.city || 'TBD'}, ${deal.country || 'TBD'}. The estimated deal value is ${formatCurrency(deal.dealValue)}.

═══════════════════════════════════════
2. LOCATION ANALYSIS
═══════════════════════════════════════

${deal.city ? `${deal.city} is a key real estate market in ${deal.country}.` : 'Location to be confirmed during due diligence.'}

═══════════════════════════════════════
3. FINANCIAL ANALYSIS
═══════════════════════════════════════

Deal Value: ${formatCurrency(deal.dealValue)}
Commission (3%): ${formatCurrency(deal.dealValue * 0.03)}

═══════════════════════════════════════
4. LEGAL & COMPLIANCE
═══════════════════════════════════════

NDA Status: ${deal.ndaSigned ? '✓ Signed' : '○ Pending'}

═══════════════════════════════════════
5. AI RECOMMENDATION
═══════════════════════════════════════

This opportunity is evaluated based on market fundamentals, comparable transactions, and AI-driven predictive analytics. Full underwriting model available in the data room.

═══════════════════════════════════════
DISCLAIMER
═══════════════════════════════════════

This memorandum is confidential and intended solely for authorized parties. TerraNexus AI provides analysis and recommendations only — no investment decisions are made by AI. All transactions require human approval.

TerraNexus AI · Enterprise Data Room`;
}

// =====================
// GENERATE NDA TEMPLATE
// =====================
export function generateNDATemplate(partyA: string, partyB: string, dealName: string): string {
  return `NON-DISCLOSURE AGREEMENT

This NDA is entered into between:
${partyA} ("Disclosing Party")
AND
${partyB} ("Receiving Party")

Regarding: ${dealName}

1. CONFIDENTIAL INFORMATION
All information shared in the TerraNexus AI Data Room regarding ${dealName} is confidential.

2. OBLIGATIONS
The Receiving Party shall not disclose, distribute, or use Confidential Information for any purpose other than evaluating the opportunity.

3. TERM
This agreement remains in effect for 2 years from the date of signing.

4. GOVERNING LAW
This agreement is governed by the laws specified in the jurisdiction of the property.

Signed: _______________  Date: _______________
Signed: _______________  Date: _______________

TerraNexus AI · Enterprise Data Room`;
}

function formatCurrency(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}
