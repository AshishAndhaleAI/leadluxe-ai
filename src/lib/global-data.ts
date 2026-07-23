// ============================================================
// LeadLuxe AI — Global Real Estate Data Architecture
// Hierarchical: Country → State/Province → City → District
// ============================================================

export interface Country {
  id: string;
  code: string;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  languages: string[];
  timezones: string[];
  active: boolean;
  opportunityCount: number;
  signalCount: number;
  totalDealValue: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  confidence: number;
}

export interface State {
  id: string;
  countryCode: string;
  name: string;
  code: string;
  capital?: string;
  population?: number;
  activeProjects: number;
  totalValue: number;
  growthRate: number;
}

export interface City {
  id: string;
  stateCode: string;
  countryCode: string;
  name: string;
  latitude: number;
  longitude: number;
  population?: number;
  pricePerSqft: number;
  priceTrend: number;
  activeProjects: number;
  upcomingLaunches: number;
  absorptionRate: number;
  averageRoi: number;
  foreignDemand: number;
  investorInterest: number;
  confidence: number;
  tags: string[];
}

export interface District {
  id: string;
  cityId: string;
  name: string;
  latitude: number;
  longitude: number;
  pricePerSqft: number;
  priceTrend: number;
  activeProjects: number;
  upcomingLaunches: number;
  avgPriceRange: [number, number];
  developerCount: number;
  amenities: string[];
  confidence: number;
}

export interface InvestmentProfile {
  country: string;
  state: string;
  city: string;
  budgetRangeMin: number;
  budgetRangeMax: number;
  propertyType: PropertyType;
  investmentGoal: InvestmentGoal;
  riskLevel: 'low' | 'medium' | 'high';
  holdingPeriod: number;
  rentalGoal: boolean;
  luxuryPreference: boolean;
}

export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'commercial' | 'land' | 'plot' | 'townhouse';
export type InvestmentGoal = 'rental' | 'appreciation' | 'commercial' | 'luxury' | 'land_banking' | 'international';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartment',
  villa: 'Villa',
  penthouse: 'Penthouse',
  commercial: 'Commercial',
  land: 'Land',
  plot: 'Plot',
  townhouse: 'Townhouse',
};

export const INVESTMENT_GOAL_LABELS: Record<InvestmentGoal, string> = {
  rental: 'Rental Income',
  appreciation: 'Capital Appreciation',
  commercial: 'Commercial Investment',
  luxury: 'Luxury Living',
  land_banking: 'Land Banking',
  international: 'International Investment',
};

// =====================
// GLOBAL COUNTRY DATA
// =====================
export const COUNTRIES: Country[] = [
  { id: 'in', code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', currencySymbol: '₹', languages: ['Hindi', 'English', 'Regional'], timezones: ['Asia/Kolkata'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 92 },
  { id: 'ae', code: 'AE', name: 'UAE', flag: '🇦🇪', currency: 'AED', currencySymbol: 'د.إ', languages: ['Arabic', 'English'], timezones: ['Asia/Dubai'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 88 },
  { id: 'us', code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', currencySymbol: '$', languages: ['English'], timezones: ['America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'stable', confidence: 85 },
  { id: 'gb', code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', languages: ['English'], timezones: ['Europe/London'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'stable', confidence: 82 },
  { id: 'sg', code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', currencySymbol: 'S$', languages: ['English', 'Chinese', 'Malay', 'Tamil'], timezones: ['Asia/Singapore'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 86 },
  { id: 'sa', code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', currencySymbol: '﷼', languages: ['Arabic'], timezones: ['Asia/Riyadh'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 79 },
  { id: 'ca', code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', currencySymbol: 'C$', languages: ['English', 'French'], timezones: ['America/Toronto', 'America/Vancouver'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'stable', confidence: 78 },
  { id: 'au', code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', currencySymbol: 'A$', languages: ['English'], timezones: ['Australia/Sydney', 'Australia/Melbourne'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 81 },
  { id: 'my', code: 'MY', name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', currencySymbol: 'RM', languages: ['Malay', 'English', 'Chinese'], timezones: ['Asia/Kuala_Lumpur'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 73 },
  { id: 'qa', code: 'QA', name: 'Qatar', flag: '🇶🇦', currency: 'QAR', currencySymbol: '﷼', languages: ['Arabic', 'English'], timezones: ['Asia/Qatar'], active: true, opportunityCount: 0, signalCount: 0, totalDealValue: 0, marketTrend: 'rising', confidence: 75 },
];

// =====================
// CITY DATA BY COUNTRY
// =====================
export const CITIES: Record<string, City[]> = {
  IN: [
    { id: 'in-mum', stateCode: 'MH', countryCode: 'IN', name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, pricePerSqft: 25000, priceTrend: 8.5, activeProjects: 142, upcomingLaunches: 38, absorptionRate: 72, averageRoi: 12.4, foreignDemand: 65, investorInterest: 88, confidence: 91, tags: ['luxury', 'commercial', 'ultra-luxury'] },
    { id: 'in-pun', stateCode: 'MH', countryCode: 'IN', name: 'Pune', latitude: 18.5204, longitude: 73.8567, pricePerSqft: 12000, priceTrend: 12.3, activeProjects: 98, upcomingLaunches: 31, absorptionRate: 78, averageRoi: 15.8, foreignDemand: 42, investorInterest: 82, confidence: 89, tags: ['it-hub', 'affordable', 'luxury'] },
    { id: 'in-blr', stateCode: 'KA', countryCode: 'IN', name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, pricePerSqft: 15000, priceTrend: 10.8, activeProjects: 156, upcomingLaunches: 45, absorptionRate: 75, averageRoi: 14.2, foreignDemand: 58, investorInterest: 85, confidence: 90, tags: ['it-hub', 'commercial', 'luxury'] },
    { id: 'in-hyd', stateCode: 'TG', countryCode: 'IN', name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, pricePerSqft: 11000, priceTrend: 14.5, activeProjects: 112, upcomingLaunches: 36, absorptionRate: 81, averageRoi: 17.2, foreignDemand: 48, investorInterest: 80, confidence: 88, tags: ['it-hub', 'affordable', 'commercial'] },
    { id: 'in-del', stateCode: 'DL', countryCode: 'IN', name: 'Delhi NCR', latitude: 28.7041, longitude: 77.1025, pricePerSqft: 20000, priceTrend: 6.2, activeProjects: 89, upcomingLaunches: 22, absorptionRate: 68, averageRoi: 10.5, foreignDemand: 55, investorInterest: 75, confidence: 83, tags: ['luxury', 'commercial'] },
    { id: 'in-chn', stateCode: 'TN', countryCode: 'IN', name: 'Chennai', latitude: 13.0827, longitude: 80.2707, pricePerSqft: 9500, priceTrend: 9.1, activeProjects: 76, upcomingLaunches: 24, absorptionRate: 74, averageRoi: 13.6, foreignDemand: 35, investorInterest: 72, confidence: 85, tags: ['affordable', 'it-hub'] },
    { id: 'in-ahm', stateCode: 'GJ', countryCode: 'IN', name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, pricePerSqft: 7500, priceTrend: 11.2, activeProjects: 65, upcomingLaunches: 20, absorptionRate: 76, averageRoi: 14.8, foreignDemand: 22, investorInterest: 68, confidence: 84, tags: ['affordable', 'commercial'] },
    { id: 'in-nd', stateCode: 'UP', countryCode: 'IN', name: 'Noida', latitude: 28.5355, longitude: 77.3910, pricePerSqft: 8500, priceTrend: 7.8, activeProjects: 54, upcomingLaunches: 16, absorptionRate: 70, averageRoi: 11.2, foreignDemand: 28, investorInterest: 65, confidence: 80, tags: ['commercial', 'affordable'] },
    { id: 'in-ggn', stateCode: 'HR', countryCode: 'IN', name: 'Gurgaon', latitude: 28.4595, longitude: 77.0266, pricePerSqft: 18000, priceTrend: 5.5, activeProjects: 72, upcomingLaunches: 18, absorptionRate: 65, averageRoi: 9.8, foreignDemand: 52, investorInterest: 78, confidence: 82, tags: ['luxury', 'commercial', 'it-hub'] },
    { id: 'in-kol', stateCode: 'WB', countryCode: 'IN', name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, pricePerSqft: 6500, priceTrend: 8.2, activeProjects: 48, upcomingLaunches: 14, absorptionRate: 72, averageRoi: 12.0, foreignDemand: 18, investorInterest: 55, confidence: 76, tags: ['affordable'] },
    { id: 'in-jai', stateCode: 'RJ', countryCode: 'IN', name: 'Jaipur', latitude: 26.9124, longitude: 75.7873, pricePerSqft: 5500, priceTrend: 10.5, activeProjects: 35, upcomingLaunches: 12, absorptionRate: 74, averageRoi: 14.2, foreignDemand: 15, investorInterest: 52, confidence: 78, tags: ['affordable', 'tourism'] },
    { id: 'in-tha', stateCode: 'MH', countryCode: 'IN', name: 'Thane', latitude: 19.2183, longitude: 72.9781, pricePerSqft: 8500, priceTrend: 9.8, activeProjects: 62, upcomingLaunches: 28, absorptionRate: 76, averageRoi: 13.5, foreignDemand: 12, investorInterest: 58, confidence: 81, tags: ['affordable', 'residential'] },
  ],
  AE: [
    { id: 'ae-dxb', stateCode: 'DU', countryCode: 'AE', name: 'Dubai', latitude: 25.2048, longitude: 55.2708, pricePerSqft: 1800, priceTrend: 15.2, activeProjects: 185, upcomingLaunches: 62, absorptionRate: 82, averageRoi: 18.5, foreignDemand: 92, investorInterest: 95, confidence: 94, tags: ['luxury', 'international', 'ultra-luxury'] },
    { id: 'ae-abu', stateCode: 'AZ', countryCode: 'AE', name: 'Abu Dhabi', latitude: 24.4539, longitude: 54.3773, pricePerSqft: 1400, priceTrend: 10.8, activeProjects: 98, upcomingLaunches: 34, absorptionRate: 78, averageRoi: 14.2, foreignDemand: 78, investorInterest: 85, confidence: 88, tags: ['luxury', 'commercial'] },
    { id: 'ae-shj', stateCode: 'SH', countryCode: 'AE', name: 'Sharjah', latitude: 25.3463, longitude: 55.4209, pricePerSqft: 900, priceTrend: 8.5, activeProjects: 52, upcomingLaunches: 18, absorptionRate: 74, averageRoi: 11.8, foreignDemand: 62, investorInterest: 72, confidence: 80, tags: ['affordable', 'family'] },
    { id: 'ae-rak', stateCode: 'RK', countryCode: 'AE', name: 'Ras Al Khaimah', latitude: 25.7895, longitude: 55.9432, pricePerSqft: 700, priceTrend: 12.5, activeProjects: 38, upcomingLaunches: 15, absorptionRate: 76, averageRoi: 16.2, foreignDemand: 48, investorInterest: 68, confidence: 78, tags: ['emerging', 'tourism'] },
  ],
  US: [
    { id: 'us-nyc', stateCode: 'NY', countryCode: 'US', name: 'New York City', latitude: 40.7128, longitude: -74.0060, pricePerSqft: 1200, priceTrend: 3.5, activeProjects: 234, upcomingLaunches: 72, absorptionRate: 68, averageRoi: 8.2, foreignDemand: 85, investorInterest: 90, confidence: 88, tags: ['luxury', 'commercial', 'international'] },
    { id: 'us-sfo', stateCode: 'CA', countryCode: 'US', name: 'San Francisco', latitude: 37.7749, longitude: -122.4194, pricePerSqft: 1100, priceTrend: 2.8, activeProjects: 98, upcomingLaunches: 28, absorptionRate: 62, averageRoi: 7.5, foreignDemand: 72, investorInterest: 82, confidence: 84, tags: ['tech', 'luxury'] },
    { id: 'us-lax', stateCode: 'CA', countryCode: 'US', name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437, pricePerSqft: 850, priceTrend: 4.2, activeProjects: 156, upcomingLaunches: 45, absorptionRate: 65, averageRoi: 9.2, foreignDemand: 78, investorInterest: 85, confidence: 86, tags: ['luxury', 'international'] },
    { id: 'us-mia', stateCode: 'FL', countryCode: 'US', name: 'Miami', latitude: 25.7617, longitude: -80.1918, pricePerSqft: 750, priceTrend: 8.5, activeProjects: 112, upcomingLaunches: 38, absorptionRate: 72, averageRoi: 12.8, foreignDemand: 88, investorInterest: 88, confidence: 87, tags: ['luxury', 'international'] },
    { id: 'us-chi', stateCode: 'IL', countryCode: 'US', name: 'Chicago', latitude: 41.8781, longitude: -87.6298, pricePerSqft: 450, priceTrend: 2.2, activeProjects: 78, upcomingLaunches: 22, absorptionRate: 60, averageRoi: 6.8, foreignDemand: 45, investorInterest: 65, confidence: 76, tags: ['commercial', 'affordable'] },
    { id: 'us-aus', stateCode: 'TX', countryCode: 'US', name: 'Austin', latitude: 30.2672, longitude: -97.7431, pricePerSqft: 550, priceTrend: 12.5, activeProjects: 68, upcomingLaunches: 32, absorptionRate: 78, averageRoi: 15.5, foreignDemand: 32, investorInterest: 72, confidence: 82, tags: ['tech', 'growing'] },
  ],
  GB: [
    { id: 'gb-lon', stateCode: 'ENG', countryCode: 'GB', name: 'London', latitude: 51.5074, longitude: -0.1278, pricePerSqft: 950, priceTrend: 1.8, activeProjects: 178, upcomingLaunches: 52, absorptionRate: 64, averageRoi: 6.5, foreignDemand: 90, investorInterest: 92, confidence: 86, tags: ['luxury', 'international', 'commercial'] },
    { id: 'gb-man', stateCode: 'ENG', countryCode: 'GB', name: 'Manchester', latitude: 53.4808, longitude: -2.2426, pricePerSqft: 380, priceTrend: 6.5, activeProjects: 62, upcomingLaunches: 24, absorptionRate: 72, averageRoi: 10.2, foreignDemand: 48, investorInterest: 68, confidence: 80, tags: ['growing', 'affordable'] },
    { id: 'gb-bir', stateCode: 'ENG', countryCode: 'GB', name: 'Birmingham', latitude: 52.4862, longitude: -1.8904, pricePerSqft: 320, priceTrend: 5.8, activeProjects: 48, upcomingLaunches: 18, absorptionRate: 70, averageRoi: 9.5, foreignDemand: 35, investorInterest: 58, confidence: 76, tags: ['affordable', 'growing'] },
  ],
  SG: [
    { id: 'sg-sin', stateCode: 'SG', countryCode: 'SG', name: 'Singapore', latitude: 1.3521, longitude: 103.8198, pricePerSqft: 2500, priceTrend: 5.2, activeProjects: 72, upcomingLaunches: 28, absorptionRate: 70, averageRoi: 8.5, foreignDemand: 82, investorInterest: 88, confidence: 86, tags: ['luxury', 'international', 'commercial'] },
  ],
  SA: [
    { id: 'sa-ruh', stateCode: 'RU', countryCode: 'SA', name: 'Riyadh', latitude: 24.7136, longitude: 46.6753, pricePerSqft: 350, priceTrend: 18.5, activeProjects: 142, upcomingLaunches: 58, absorptionRate: 84, averageRoi: 22.5, foreignDemand: 65, investorInterest: 88, confidence: 85, tags: ['commercial', 'growing', 'luxury'] },
    { id: 'sa-jed', stateCode: 'ME', countryCode: 'SA', name: 'Jeddah', latitude: 21.2854, longitude: 39.2376, pricePerSqft: 280, priceTrend: 14.2, activeProjects: 85, upcomingLaunches: 38, absorptionRate: 80, averageRoi: 18.8, foreignDemand: 52, investorInterest: 76, confidence: 82, tags: ['commercial', 'growing'] },
    { id: 'sa-dmm', stateCode: 'EA', countryCode: 'SA', name: 'Dammam', latitude: 26.4207, longitude: 50.0888, pricePerSqft: 220, priceTrend: 12.8, activeProjects: 52, upcomingLaunches: 22, absorptionRate: 78, averageRoi: 16.2, foreignDemand: 38, investorInterest: 68, confidence: 78, tags: ['commercial', 'emerging'] },
  ],
  CA: [
    { id: 'ca-yt', stateCode: 'ON', countryCode: 'CA', name: 'Toronto', latitude: 43.6532, longitude: -79.3832, pricePerSqft: 680, priceTrend: 4.8, activeProjects: 112, upcomingLaunches: 38, absorptionRate: 68, averageRoi: 8.8, foreignDemand: 72, investorInterest: 80, confidence: 84, tags: ['luxury', 'international'] },
    { id: 'ca-van', stateCode: 'BC', countryCode: 'CA', name: 'Vancouver', latitude: 49.2827, longitude: -123.1207, pricePerSqft: 950, priceTrend: 3.2, activeProjects: 68, upcomingLaunches: 22, absorptionRate: 62, averageRoi: 6.5, foreignDemand: 85, investorInterest: 82, confidence: 82, tags: ['luxury', 'international'] },
    { id: 'ca-mtl', stateCode: 'QC', countryCode: 'CA', name: 'Montreal', latitude: 45.5017, longitude: -73.5673, pricePerSqft: 420, priceTrend: 6.8, activeProjects: 48, upcomingLaunches: 18, absorptionRate: 72, averageRoi: 10.5, foreignDemand: 38, investorInterest: 62, confidence: 78, tags: ['affordable', 'growing'] },
  ],
  AU: [
    { id: 'au-syd', stateCode: 'NSW', countryCode: 'AU', name: 'Sydney', latitude: -33.8688, longitude: 151.2093, pricePerSqft: 850, priceTrend: 5.5, activeProjects: 98, upcomingLaunches: 32, absorptionRate: 68, averageRoi: 8.2, foreignDemand: 75, investorInterest: 85, confidence: 85, tags: ['luxury', 'international'] },
    { id: 'au-mel', stateCode: 'VIC', countryCode: 'AU', name: 'Melbourne', latitude: -37.8136, longitude: 144.9631, pricePerSqft: 720, priceTrend: 6.2, activeProjects: 85, upcomingLaunches: 28, absorptionRate: 72, averageRoi: 9.5, foreignDemand: 68, investorInterest: 80, confidence: 84, tags: ['luxury', 'international', 'growing'] },
    { id: 'au-bne', stateCode: 'QLD', countryCode: 'AU', name: 'Brisbane', latitude: -27.4698, longitude: 153.0251, pricePerSqft: 520, priceTrend: 8.8, activeProjects: 55, upcomingLaunches: 22, absorptionRate: 76, averageRoi: 12.2, foreignDemand: 42, investorInterest: 68, confidence: 80, tags: ['growing', 'affordable'] },
  ],
  MY: [
    { id: 'my-kl', stateCode: 'KL', countryCode: 'MY', name: 'Kuala Lumpur', latitude: 3.1390, longitude: 101.6869, pricePerSqft: 350, priceTrend: 7.2, activeProjects: 85, upcomingLaunches: 32, absorptionRate: 72, averageRoi: 11.5, foreignDemand: 58, investorInterest: 72, confidence: 78, tags: ['affordable', 'commercial', 'international'] },
    { id: 'my-pg', stateCode: 'PN', countryCode: 'MY', name: 'Penang', latitude: 5.4164, longitude: 100.3327, pricePerSqft: 280, priceTrend: 8.5, activeProjects: 42, upcomingLaunches: 18, absorptionRate: 74, averageRoi: 13.2, foreignDemand: 48, investorInterest: 65, confidence: 76, tags: ['tourism', 'international'] },
  ],
  QA: [
    { id: 'qa-doh', stateCode: 'DA', countryCode: 'QA', name: 'Doha', latitude: 25.2854, longitude: 51.5310, pricePerSqft: 420, priceTrend: 11.5, activeProjects: 62, upcomingLaunches: 28, absorptionRate: 78, averageRoi: 15.5, foreignDemand: 72, investorInterest: 82, confidence: 82, tags: ['luxury', 'commercial', 'emerging'] },
  ],
};

// =====================
// DISTRICT DATA BY CITY
// =====================
export const DISTRICTS: Record<string, District[]> = {
  'in-mum': [
    { id: 'mum-bdr', cityId: 'in-mum', name: 'Bandra', latitude: 19.0596, longitude: 72.8295, pricePerSqft: 45000, priceTrend: 12.5, activeProjects: 18, upcomingLaunches: 6, avgPriceRange: [30000000, 150000000], developerCount: 25, amenities: ['schools', 'hospitals', 'malls', 'metro'], confidence: 94 },
    { id: 'mum-wor', cityId: 'in-mum', name: 'Worli', latitude: 19.0186, longitude: 72.8167, pricePerSqft: 55000, priceTrend: 15.2, activeProjects: 22, upcomingLaunches: 8, avgPriceRange: [50000000, 250000000], developerCount: 32, amenities: ['sea-face', 'schools', 'hospitals', 'clubs'], confidence: 96 },
    { id: 'mum-and', cityId: 'in-mum', name: 'Andheri', latitude: 19.1364, longitude: 72.8298, pricePerSqft: 18000, priceTrend: 9.5, activeProjects: 28, upcomingLaunches: 12, avgPriceRange: [8000000, 50000000], developerCount: 45, amenities: ['airport', 'schools', 'hospitals', 'malls', 'metro'], confidence: 88 },
    { id: 'mum-pow', cityId: 'in-mum', name: 'Powai', latitude: 19.1175, longitude: 72.9064, pricePerSqft: 22000, priceTrend: 10.8, activeProjects: 15, upcomingLaunches: 5, avgPriceRange: [12000000, 80000000], developerCount: 20, amenities: ['lake', 'schools', 'hospitals', 'it-parks'], confidence: 90 },
    { id: 'mum-nmp', cityId: 'in-mum', name: 'Navi Mumbai', latitude: 19.0330, longitude: 73.0297, pricePerSqft: 14000, priceTrend: 11.2, activeProjects: 35, upcomingLaunches: 16, avgPriceRange: [6000000, 35000000], developerCount: 40, amenities: ['schools', 'hospitals', 'parks', 'metro'], confidence: 87 },
  ],
  'in-pun': [
    { id: 'pun-ban', cityId: 'in-pun', name: 'Baner', latitude: 18.5626, longitude: 73.7765, pricePerSqft: 14000, priceTrend: 14.2, activeProjects: 22, upcomingLaunches: 10, avgPriceRange: [8000000, 60000000], developerCount: 28, amenities: ['schools', 'hospitals', 'malls', 'it-parks'], confidence: 92 },
    { id: 'pun-kha', cityId: 'in-pun', name: 'Kharadi', latitude: 18.5494, longitude: 73.9379, pricePerSqft: 12000, priceTrend: 16.5, activeProjects: 25, upcomingLaunches: 12, avgPriceRange: [6000000, 45000000], developerCount: 30, amenities: ['schools', 'it-parks', 'hospitals'], confidence: 91 },
    { id: 'pun-hin', cityId: 'in-pun', name: 'Hinjewadi', latitude: 18.5913, longitude: 73.6826, pricePerSqft: 11000, priceTrend: 15.8, activeProjects: 28, upcomingLaunches: 14, avgPriceRange: [5000000, 40000000], developerCount: 35, amenities: ['it-parks', 'schools', 'hospitals'], confidence: 90 },
    { id: 'pun-wak', cityId: 'in-pun', name: 'Wakad', latitude: 18.5908, longitude: 73.7720, pricePerSqft: 13000, priceTrend: 13.8, activeProjects: 20, upcomingLaunches: 8, avgPriceRange: [7000000, 50000000], developerCount: 25, amenities: ['schools', 'hospitals', 'malls'], confidence: 89 },
    { id: 'pun-bhw', cityId: 'in-pun', name: 'Bhawani Peth', latitude: 18.5154, longitude: 73.8557, pricePerSqft: 8000, priceTrend: 8.5, activeProjects: 12, upcomingLaunches: 4, avgPriceRange: [3000000, 20000000], developerCount: 15, amenities: ['schools', 'hospitals', 'markets'], confidence: 78 },
  ],
  'ae-dxb': [
    { id: 'dxb-dma', cityId: 'ae-dxb', name: 'Dubai Marina', latitude: 25.0813, longitude: 55.1426, pricePerSqft: 2200, priceTrend: 18.5, activeProjects: 32, upcomingLaunches: 15, avgPriceRange: [1500000, 15000000], developerCount: 45, amenities: ['beach', 'marina', 'malls', 'schools'], confidence: 96 },
    { id: 'dxb-dtc', cityId: 'ae-dxb', name: 'Downtown Dubai', latitude: 25.1962, longitude: 55.2744, pricePerSqft: 2800, priceTrend: 16.2, activeProjects: 28, upcomingLaunches: 12, avgPriceRange: [2000000, 25000000], developerCount: 38, amenities: ['burj', 'malls', 'parks', 'metro'], confidence: 95 },
    { id: 'dxb-pjm', cityId: 'ae-dxb', name: 'Palm Jumeirah', latitude: 25.1124, longitude: 55.1390, pricePerSqft: 3500, priceTrend: 14.8, activeProjects: 18, upcomingLaunches: 8, avgPriceRange: [5000000, 50000000], developerCount: 22, amenities: ['beach', 'resorts', 'schools'], confidence: 93 },
    { id: 'dxb-dhl', cityId: 'ae-dxb', name: 'Dubai Hills', latitude: 25.0668, longitude: 55.2426, pricePerSqft: 1800, priceTrend: 12.5, activeProjects: 22, upcomingLaunches: 10, avgPriceRange: [1200000, 12000000], developerCount: 28, amenities: ['golf', 'parks', 'schools'], confidence: 90 },
    { id: 'dxb-bch', cityId: 'ae-dxb', name: 'Business Bay', latitude: 25.1854, longitude: 55.2708, pricePerSqft: 1600, priceTrend: 10.8, activeProjects: 25, upcomingLaunches: 14, avgPriceRange: [800000, 8000000], developerCount: 35, amenities: ['canal', 'malls', 'metro'], confidence: 88 },
  ],
};

// =====================
// HELPER FUNCTIONS
// =====================
export function getCountry(code: string): Country | undefined {
  return COUNTRIES.find(c => c.code === code);
}

export function getCitiesByCountry(countryCode: string): City[] {
  return CITIES[countryCode] || [];
}

export function getDistrictsByCity(cityId: string): District[] {
  return DISTRICTS[cityId] || [];
}

export function getCity(cityId: string): City | undefined {
  for (const cities of Object.values(CITIES)) {
    const city = cities.find(c => c.id === cityId);
    if (city) return city;
  }
  return undefined;
}

export function findCitiesByCountry(countryName: string): City[] {
  const country = COUNTRIES.find(c => c.name.toLowerCase().includes(countryName.toLowerCase()));
  return country ? getCitiesByCountry(country.code) : [];
}

export function getTopOpportunityCities(limit = 10): City[] {
  const allCities = Object.values(CITIES).flat();
  return allCities.sort((a, b) => b.confidence - a.confidence).slice(0, limit);
}

export function getHotCities(): City[] {
  return Object.values(CITIES).flat().filter(c => c.investorInterest >= 80);
}

export function formatGlobalCurrency(amount: number, currencyCode = 'INR'): string {
  const symbols: Record<string, string> = {
    INR: '₹', USD: '$', AED: 'د.إ', GBP: '£', SGD: 'S$', SAR: '﷼', CAD: 'C$', AUD: 'A$', MYR: 'RM', QAR: '﷼',
  };
  const symbol = symbols[currencyCode] || '₹';
  
  if (amount >= 10000000) return `${symbol}${(amount / 10000000).toFixed(2)}Cr`;
  if (amount >= 100000) return `${symbol}${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `${symbol}${(amount / 1000).toFixed(1)}K`;
  return `${symbol}${amount.toLocaleString()}`;
}
