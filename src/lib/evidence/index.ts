export {
  validateRecord,
  validateImageUrl,
  validateCityCountry,
  generateAttribution,
  getCountryDataSources,
  getValidationBadge,
  REAL_DATA_SOURCES,
  VALIDATION_RULES,
} from './EvidenceVault';
export type { EvidenceSource, EvidenceAttribution, ValidatedRecord, ValidationRule } from './EvidenceVault';

export {
  computeCityScore,
  rankAllMarkets,
  filterOpportunities,
  getTopOpportunities,
  getHighConfidenceOpportunities,
  getHighYieldOpportunities,
} from './UnifiedScoring';
export type { ScoringFactors, ScoredOpportunity } from './UnifiedScoring';

export {
  calculateCommission,
  COUNTRY_COMMISSION_NORMS,
  formatCommissionValue,
  COUNTRY_CURRENCIES,
} from './CommissionCalculator';
export type { CommissionBreakdown, CountryCommissionNorm } from './CommissionCalculator';

export {
  INGESTION_ADAPTERS,
  generateEdgeFunctionFile,
  EDGE_FUNCTION_TEMPLATE,
} from './DataIngestion';
export type { IngestionAdapter } from './DataIngestion';
