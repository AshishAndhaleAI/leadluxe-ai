// ============================================================
// LeadLuxe AI — Digital Twin Types
// Institutional-grade property research data structures
// ============================================================

// =====================
// VERIFICATION STATUS
// =====================
export type VerificationBadge = 'VERIFIED' | 'PARTIAL' | 'UNVERIFIED' | 'STALE';

export interface SourceProvenance {
  sourceName: string;
  sourceUrl: string;
  fetchedAt: string;
  verificationStatus: VerificationBadge;
  confidenceScore: number;
}

// =====================
// ARCHITECTURE
// =====================
export interface ArchitectureProfile {
  architect: string;
  architectWebsite?: string;
  architecturalStyle: string;
  designPhilosophy: string;
  facadeMaterials: string[];
  glazingSpecification?: string;
  balconySystem?: string;
  shadingStrategy?: string;
  landscapeArchitect?: string;
  interiorDesigner?: string;
  structuralEngineer?: string;
  mepConsultant?: string;
  sustainabilityRating?: {
    system: string;
    level: string;
    certificationBody: string;
  };
  seismicDesignCategory?: string;
  windLoadDesign?: string;
  buildingHeight: number;
  totalFloors: number;
  typicalFloorHeight: number;
  provenance: SourceProvenance;
}

// =====================
// UNIT STACK
// =====================
export interface UnitStack {
  id: string;
  floorRange: string;
  orientation: 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
  viewType: string;
  sqft: number;
  balconySqft: number;
  ceilingHeight: number;
  bedrooms: number;
  bathrooms: number;
  available: boolean;
  lastTransactionPrice?: number;
  rentalEstimate?: number;
  yieldEstimate?: number;
  provenance: SourceProvenance;
}

export interface UnitStackAnalysis {
  totalUnits: number;
  towerCount: number;
  units: UnitStack[];
  unitMix: { type: string; count: number; percentage: number }[];
  sunPathSummary: string;
  provenance: SourceProvenance;
}

// =====================
// CONSTRUCTION MILESTONE
// =====================
export interface ConstructionMilestone {
  id: string;
  milestone: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  plannedDate: string;
  actualDate?: string;
  delayDays?: number;
  description: string;
  verificationStatus: VerificationBadge;
  evidence: { title: string; url: string }[];
  provenance: SourceProvenance;
}

export interface ConstructionIntelligence {
  milestones: ConstructionMilestone[];
  overallProgress: number;
  scheduleConfidence: number;
  contractorName?: string;
  contractorRiskScore?: number;
  satelliteComparison: string[];
  provenance: SourceProvenance;
}

// =====================
// LEGAL DOCUMENT
// =====================
export interface LegalDocument {
  id: string;
  documentType: string;
  title: string;
  referenceNumber?: string;
  issuingAuthority: string;
  issuanceDate: string;
  expiryDate?: string;
  url: string;
  verificationStatus: VerificationBadge;
  checksumHash?: string;
  provenance: SourceProvenance;
}

export interface LegalEvidenceRoom {
  documents: LegalDocument[];
  totalDocuments: number;
  verifiedDocuments: number;
  pendingDocuments: number;
  provenance: SourceProvenance;
}

// =====================
// INVESTMENT RESEARCH
// =====================
export interface ComparableTransaction {
  projectName: string;
  developerName: string;
  distance: string;
  pricePerSqft: number;
  occupancy: number;
  rentalYield: number;
  developerReputation: number;
}

export interface InvestmentResearch {
  priceHistory: { date: string; value: number }[];
  rentalTrend: { date: string; value: number }[];
  absorptionRate: number;
  inventoryMonths: number;
  mortgageRateImpact: string;
  currencyAdjustedReturn: number;
  irrScenarios: { scenario: string; irr: number; probability: number }[];
  cashOnCashReturn: number;
  downsideStressTest: { scenario: string; impact: string }[];
  comparables: ComparableTransaction[];
  aiInvestmentMemo: {
    recommendation: 'Buy' | 'Hold' | 'Avoid';
    target12Month: number;
    target36Month: number;
    keyCatalysts: string[];
    keyRisks: string[];
    exitStrategy: string;
  };
  provenance: SourceProvenance;
}

// =====================
// LOCATION INTELLIGENCE
// =====================
export interface LocationIntelligence {
  address: string;
  district: string;
  city: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  parcelNumber?: string;
  zoningClassification?: string;
  distanceMatrix: {
    airport: string;
    cbd: string;
    metro: string;
    internationalSchool: string;
    hospital: string;
    beachWaterfront?: string;
    businessDistrict: string;
  };
  provenance: SourceProvenance;
}

// =====================
// DIGITAL TWIN — FULL
// =====================
export interface PropertyDigitalTwin {
  propertyId: string;
  propertyName: string;
  
  // Layer 1 - Hero / Overview
  heroCinematic: {
    towerHeight: number;
    floors: number;
    completionPercent: number;
    architect: string;
    structuralEngineer: string;
    facadeType: string;
    sustainabilityRating: string;
    heroImages: string[];
  };
  
  // Layer 2 - Location
  location: LocationIntelligence;
  
  // Layer 3 - Architecture
  architecture: ArchitectureProfile;
  
  // Layer 4 - Units
  unitAnalysis: UnitStackAnalysis;
  
  // Layer 5 - Construction
  construction: ConstructionIntelligence;
  
  // Layer 6 - Investment
  investment: InvestmentResearch;
  
  // Layer 7 - Legal
  legal: LegalEvidenceRoom;
  
  // Trust
  trustSummary: {
    verifiedDataPercent: number;
    lastVerified: string;
    evidenceCount: number;
    governmentSources: number;
    mapAccuracy: number;
  };
}
