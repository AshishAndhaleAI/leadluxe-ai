// ============================================================
// Massive Realistic Demo Data Generator
// 100 developers, 500 projects, 1000+ opportunities
// ============================================================

import type { Developer, Project, Signal, Opportunity, ActivityLog, RevenueForecast } from '../types';
import type { CommissionRecord } from '../types';
import { calculateCommission } from '../types';

// =====================
// CITY DATABASE
// =====================
const CITIES = [
  { city: 'Mumbai', state: 'Maharashtra', areas: ['Bandra', 'Worli', 'Lower Parel', 'Powai', 'Andheri', 'Goregaon', 'Thane', 'Navi Mumbai'] },
  { city: 'Pune', state: 'Maharashtra', areas: ['Baner', 'Kharadi', 'Wakad', 'Hinjewadi', 'Balewadi', 'Hadapsar', 'Koregaon Park', 'Viman Nagar'] },
  { city: 'Bengaluru', state: 'Karnataka', areas: ['Whitefield', 'Indiranagar', 'Koramangala', 'Sarjapur', 'Electronic City', 'Hebbal', 'Yelahanka'] },
  { city: 'Hyderabad', state: 'Telangana', areas: ['Gachibowli', 'Hitech City', 'Kondapur', 'Madhapur', 'Kukatpally', 'Sainikpuri', 'Banjara Hills'] },
  { city: 'Delhi NCR', state: 'Delhi', areas: ['Gurgaon', 'Noida', 'Dwarka', 'Saket', 'Rohini', 'Greater Noida', 'Ghaziabad', 'Faridabad'] },
  { city: 'Chennai', state: 'Tamil Nadu', areas: ['OMR', 'Porur', 'Velachery', 'Thoraipakkam', 'Sholinganallur', 'Anna Nagar', 'Adyar'] },
  { city: 'Kolkata', state: 'West Bengal', areas: ['Salt Lake', 'New Town', 'Rajarhat', 'Ballygunge', 'Alipore', 'Dum Dum', 'Barasat'] },
  { city: 'Ahmedabad', state: 'Gujarat', areas: ['SG Highway', 'Bopal', 'Prahlad Nagar', 'Gota', 'Satellite', 'Vastrapur', 'Chandkheda'] },
  { city: 'Jaipur', state: 'Rajasthan', areas: ['Vaishali Nagar', 'Mansarovar', 'Malviya Nagar', 'Jagatpura', 'Tonk Road', 'Ajmer Road'] },
  { city: 'Lucknow', state: 'Uttar Pradesh', areas: ['Gomti Nagar', 'Indira Nagar', 'Hazratganj', 'Aliganj', 'Mahanagar', 'Rajajipuram'] },
  { city: 'Chandigarh', state: 'Punjab', areas: ['Sector 17', 'Mohali', 'Panchkula', 'Zirakpur', 'Sector 35', 'SAS Nagar'] },
  { city: 'Indore', state: 'Madhya Pradesh', areas: ['Vijay Nagar', 'Scheme 54', 'Bhawarkua', 'Rajendra Nagar', 'Palasia', 'AB Road'] },
];

// =====================
// BUILDER NAME GENERATOR
// =====================
const BUILDER_FIRST_NAMES = ['VTP', 'Godrej', 'Oberoi', 'Lodha', 'Prestige', 'Kolte', 'Kumar', 'Patil', 'Shah', 'Mehta',
  'Singh', 'Kapoor', 'Malhotra', 'Sethi', 'Agarwal', 'Joshi', 'Deshmukh', 'Kulkarni', 'Rathod', 'Chauhan',
  'Bajaj', 'Birla', 'Goenka', 'Rajput', 'Thakur', 'Menon', 'Iyer', 'Nair', 'Reddy', 'Rao', 'Naidu',
  'Varma', 'Chopra', 'Bhatia', 'Sachdev', 'Tandon', 'Dhawan', 'Khanna', 'Kapadia', 'Mistry', 'Wadia',
  'Advani', 'Bhansali', 'Chablani', 'Doshi', 'Gandhi', 'Handa', 'Jain', 'Khandelwal', 'Lakhani', 'Mangal',
  'Advani', 'Bhargava', 'Chaturvedi', 'Dubey', 'Gupta', 'Hegde', 'Jayaram', 'Kesari', 'Lokhande', 'Mahajan'];

const BUILDER_SUFFIXES = ['Group', 'Developers', 'Constructions', 'Builders', 'Reality', 'Infrastructure', 'Estates', 'Homes',
  'Ventures', 'Corporation', 'Properties', 'Landmarks', 'Towers', 'Heights', 'Parks', 'Valley', 'Enclave', 'Gardens'];

const PROJECT_PREFIXES = ['Luxuria', 'Woodlands', 'Aurora', 'Elite', 'Premier', 'Crystal', 'Diamond', 'Emerald', 'Sapphire',
  'Ruby', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Imperial', 'Royal', 'Regal', 'Majestic', 'Grand', 'Supreme',
  'Celestial', 'Cosmos', 'Nebula', 'Orbit', 'Galaxy', 'Solar', 'Lunar', 'Stellar', 'Nova', 'Phoenix',
  'Aria', 'Serene', 'Bliss', 'Harmony', 'Tranquil', 'Zen', 'Oasis', 'Paradise', 'Elysium', 'Utopia',
  'Opulent', 'Lavish', 'Sumptuous', 'Exquisite', 'Splendid', 'Magnificent', 'Panorama', 'Panoramic', 'Skyline', 'Skyview',
  'Greenwood', 'Oakwood', 'Maple', 'Cedar', 'Pine', 'Birch', 'Willow', 'Aspen', 'Elm', 'Ivy'];

const PROJECT_SUFFIXES = ['Heights', 'Towers', 'Residency', 'Gardens', 'Enclave', 'Valley', 'Park', 'Villas', 'Mansion',
  'Palace', 'Court', 'Plaza', 'Square', 'Commons', 'Place', 'View', 'Ridge', 'Crest', 'Meadows', 'Estates'];

const SIGNAL_TEMPLATES = [
  { type: 'rera_filing' as const, titles: ['RERA Filing Submitted', 'RERA Registration Approved', 'RERA Update Filed', 'Project Registered with RERA'], sources: ['Maharera', 'RERA Karnataka', 'Gujarat RERA', 'UP RERA', 'Haryana RERA', 'MahaRERA Online'] },
  { type: 'government_approval' as const, titles: ['Environmental Clearance Granted', 'Municipal Approval Received', 'Building Plan Approved', 'Development Permission Granted', 'NOC Received from Authorities'], sources: ['MoEF', 'Municipal Corporation', 'Town Planning Dept', 'Pollution Control Board', 'Fire Department'] },
  { type: 'land_acquisition' as const, titles: ['Land Parcel Acquired', 'Joint Development Agreement Signed', 'Land Bank Expanded', 'New Land Acquisition Completed'], sources: ['Property Registration', 'Land Registry', 'Revenue Dept', 'Company Announcement'] },
  { type: 'builder_hiring' as const, titles: ['Senior Project Manager Hired', 'Sales Team Expanded', 'Marketing Head Appointed', 'Design Team Strengthened', 'Construction Team Expanded'], sources: ['Naukri.com', 'LinkedIn', 'Company Careers', 'TimesJobs', 'Indeed'] },
  { type: 'funding_raised' as const, titles: ['Private Equity Investment Secured', 'Funds Raised via NCD', 'Bank Funding Sanctioned', 'Joint Venture Funding Closed', 'Strategic Investment Received'], sources: ['Economic Times', 'Business Standard', 'Mint', 'Financial Express', 'Bloomberg Quint'] },
  { type: 'project_launch' as const, titles: ['New Project Launched', 'Phase II Launch Announced', 'Pre-Launch Offers Started', 'New Tower Launched', 'Luxury Project Unveiled'], sources: ['Company Website', 'Times Property', 'Housing.com', 'MagicBricks', '99acres'] },
  { type: 'partnership' as const, titles: ['Strategic Partnership Formed', 'Architect Collaboration Announced', 'Technology Partnership Signed', 'Interior Design Partner Onboarded'], sources: ['Business Standard', 'Company Blog', 'PR Newswire', 'Project NewsWire'] },
  { type: 'expansion' as const, titles: ['New City Entry Announced', 'Market Expansion Plan Revealed', 'Office in New Location', 'Regional Office Opened', 'Expansion into Tier 2 Cities'], sources: ['Economic Times', 'Times of India', 'Hindu Business Line', 'Company Announcement'] },
  { type: 'market_trend' as const, titles: ['Area Property Prices Up', 'Micro-Market Growth Report', 'Demand Surge in Area', 'Price Appreciation Trend', 'Inventory Absorption Up'], sources: ['SquareYards Report', 'Knight Frank', 'JLL India', 'CBRE Report', 'Cushman & Wakefield'] },
  { type: 'news_coverage' as const, titles: ['Builder Featured in Magazine', 'Project Review Published', 'Developer Profile Article', 'Industry Award Coverage', 'Success Story Published'], sources: ['Times Property', 'Hindustan Times', 'Indian Express', 'Pune Mirror', 'Bangalore Mirror'] },
  { type: 'permit_issued' as const, titles: ['Occupancy Certificate Received', 'Completion Certificate Issued', 'Commencement Certificate Granted', 'Fire NOC Received'], sources: ['PMC', 'Municipal Corp', 'Development Authority', 'Fire Department'] },
  { type: 'construction_start' as const, titles: ['Construction Commenced', 'Foundation Stone Laid', 'Site Preparation Started', 'Phase II Construction Begins'], sources: ['Project Site', 'Company Update', 'Contractor Update'] },
  { type: 'price_change' as const, titles: ['Price Revision Announced', 'Launch Offer Prices Released', 'Festival Discount Announced', 'Premium on Selected Units'], sources: ['Official Website', 'Booking Portal', 'Brochure'] },
  { type: 'management_change' as const, titles: ['CEO Appointed', 'Board Member Added', 'Key Leadership Change', 'New Business Head Appointed'], sources: ['LinkedIn', 'Economic Times', 'Company Announcement', 'Board Announcement'] },
  { type: 'legal_update' as const, titles: ['Legal Notice Resolved', 'Court Case Settled', 'Compliance Update Filed', 'Regulatory Approval Received'], sources: ['Legal Notice', 'Court Order', 'Regulatory Body'] },
  { type: 'award_recognition' as const, titles: ['Best Developer Award Won', 'Project of the Year Received', 'Industry Recognition Awarded', 'Quality Award Received'], sources: ['CREDAI', 'NAREDCO', 'Property Awards', 'Industry Forum'] },
];

// =====================
// GENERATION HELPERS
// =====================
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  return new Date(start + Math.random() * (end - start)).toISOString();
}

function recentDate(maxDaysAgo: number): string {
  return new Date(Date.now() - Math.random() * maxDaysAgo * 24 * 60 * 60 * 1000).toISOString();
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// =====================
// DEVELOPER GENERATOR
// =====================
function generateDeveloper(id: string, index: number): Developer {
  const city = CITIES[index % CITIES.length];
  const firstName = BUILDER_FIRST_NAMES[index % BUILDER_FIRST_NAMES.length];
  const suffix = BUILDER_SUFFIXES[randomInt(0, BUILDER_SUFFIXES.length - 1)];
  const name = `${firstName} ${suffix}`;
  const segment = randomItem(['budget', 'mid_range', 'premium', 'luxury', 'ultra_luxury'] as const);
  const builderType = randomItem(['public', 'private', 'partnership', 'individual'] as const);
  const totalProjects = randomInt(3, segment === 'luxury' ? 20 : segment === 'ultra_luxury' ? 15 : 50);
  const activeProjects = randomInt(1, Math.max(2, Math.round(totalProjects * 0.3)));
  const growthRate = randomFloat(-5, segment === 'luxury' ? 25 : 35);
  const hiringTrend = randomItem(['increasing', 'stable', 'decreasing'] as const);

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const expansionPlans: string[] = [];

  if (segment === 'luxury' || segment === 'ultra_luxury') {
    strengths.push('Premium brand positioning', 'Superior construction quality', 'Elite customer base');
    weaknesses.push('Limited addressable market', 'Higher customer acquisition cost');
  } else if (segment === 'premium') {
    strengths.push('Strong value proposition', 'Good construction quality', 'Growing market share');
    weaknesses.push('Intense competition', 'Margins under pressure');
  } else {
    strengths.push('Affordable pricing', 'Volume-driven model', 'Broad market reach');
    weaknesses.push('Lower margins', 'Price-sensitive customers');
  }

  if (builderType === 'public') {
    strengths.push('Financial transparency', 'Strong governance');
    weaknesses.push('Quarterly pressure', 'Slow decision making');
    expansionPlans.push(`Expanding to ${randomItem(CITIES).city}`, `New ${randomItem(['luxury', 'commercial', 'affordable'])} segment`);
  }

  const cityCount = randomInt(1, 4);
  for (let i = 0; i < cityCount; i++) {
    if (CITIES[i]) expansionPlans.push(`Entry into ${CITIES[i].city} market`);
  }

  return {
    id,
    name,
    slug: slugify(name),
    description: `${name} is a ${builderType === 'public' ? 'publicly listed' : 'private'} real estate developer based in ${city.city}, ${city.state}. With ${totalProjects}+ projects and ${activeProjects} active developments, they have established a strong presence in the ${segment.replace('_', ' ')} segment. Their portfolio spans ${randomInt(2, 5)} cities with ${randomInt(500, 50000)} units delivered.`,
    city: city.city,
    state: city.state,
    headquarters: `${randomItem(city.areas)}, ${city.city}`,
    founded_year: randomInt(1985, 2020),
    builder_type: builderType,
    pricing_segment: segment,
    annual_revenue: randomInt(50000000, segment === 'luxury' ? 500000000 : 2000000000),
    growth_rate: growthRate,
    market_share: randomFloat(0.5, segment === 'ultra_luxury' ? 3 : 8),
    total_projects: totalProjects,
    active_projects: activeProjects,
    total_units_delivered: randomInt(500, 50000),
    hiring_trend: hiringTrend,
    hiring_count: hiringTrend === 'increasing' ? randomInt(10, 150) : randomInt(0, 20),
    funding_info: builderType === 'public' ? `Listed on BSE/NSE — Market Cap ₹${randomInt(1000, 50000)} Cr` : randomItem(['', 'Private equity backed', 'Family-owned business', 'Joint venture partner']),
    strengths,
    weaknesses,
    expansion_plans: expansionPlans,
    is_tracked: true,
    metadata: {},
    created_at: randomDate(2023, 2026),
    updated_at: recentDate(60),
  };
}

// =====================
// PROJECT GENERATOR
// =====================
function generateProject(id: string, developer: Developer, index: number): Project {
  const prefix = PROJECT_PREFIXES[index % PROJECT_PREFIXES.length];
  const suffix = PROJECT_SUFFIXES[randomInt(0, PROJECT_SUFFIXES.length - 1)];
  const projectType = randomItem(['luxury_residential', 'premium_residential', 'mid_range_residential', 'mixed_use', 'township', 'villa', 'penthouse'] as const);
  const status = randomItem(['announced', 'pre_launch', 'launched', 'ongoing_construction', 'ready_to_move', 'completed'] as const);
  const reraStatus = randomItem(['applied', 'approved', 'not_applied'] as const);
  const cityData = CITIES.find(c => c.city === developer.city) || randomItem(CITIES);
  const area = randomItem(cityData.areas);
  const totalUnits = randomInt(50, projectType === 'township' ? 5000 : projectType === 'villa' ? 150 : 1000);
  const minPrice = segmentBasePrice(developer.pricing_segment || 'mid_range');

  return {
    id,
    developer_id: developer.id,
    name: `${prefix} ${suffix}`,
    slug: `${slugify(developer.name)}-${slugify(prefix)}`,
    description: `A ${projectType.replace(/_/g, ' ')} project by ${developer.name} located in ${area}, ${developer.city}. Featuring ${totalUnits} units with world-class amenities and modern architecture.`,
    project_type: projectType,
    status,
    location: area,
    city: developer.city,
    state: developer.state,
    total_units: totalUnits,
    total_towers: randomInt(1, Math.ceil(totalUnits / 50)),
    floor_count: randomInt(5, projectType === 'villa' ? 3 : 45),
    unit_types: randomItems(['1BHK', '2BHK', '3BHK', '4BHK', 'Penthouse', 'Studio'], randomInt(2, 4)),
    area_range_min: randomInt(350, 1000),
    area_range_max: randomInt(1200, 5000),
    price_range_min: minPrice,
    price_range_max: Math.round(minPrice * randomFloat(1.5, 3)),
    amenities: randomItems(['Swimming Pool', 'Gymnasium', 'Clubhouse', 'Children Park', 'Jogging Track', 'Tennis Court', 'Basketball Court', 'Spa', 'Sauna', 'Landscaped Gardens', 'Mini Theatre', 'Party Hall', 'Indoor Games', 'Yoga Studio', 'Library', 'Cafeteria', 'Convenience Store', 'ATM', 'Security System', 'Power Backup', 'Rainwater Harvesting', 'Solar Panels', 'EV Charging', 'Wifi Enabled'], randomInt(6, 15)),
    rera_number: reraStatus !== 'not_applied' ? `RERA-${developer.city?.slice(0, 3).toUpperCase()}-${randomInt(1000, 9999)}-${new Date().getFullYear()}` : undefined,
    rera_status: reraStatus,
    launch_date: status !== 'announced' ? recentDate(365) : undefined,
    occupancy_date: status === 'completed' || status === 'ready_to_move' ? recentDate(90) : undefined,
    architect: randomItem(['HAFELE',  'Arcop', 'Peddle', 'Morphogenesis', 'Edifice', 'RSP Architects', 'CRN Architects']),
    metadata: {},
    created_at: recentDate(365),
    updated_at: recentDate(30),
  };
}

function segmentBasePrice(segment: string): number {
  const prices: Record<string, number> = {
    ultra_luxury: 50000000,
    luxury: 25000000,
    premium: 10000000,
    mid_range: 5000000,
    budget: 2000000,
  };
  return prices[segment] || 5000000;
}

// =====================
// SIGNAL GENERATOR
// =====================
function generateSignal(id: string, developer: Developer, project?: Project, daysAgo?: number): Signal {
  const template = randomItem(SIGNAL_TEMPLATES);
  const impactLevel = randomItem(['critical', 'high', 'medium', 'low'] as const);
  const days = daysAgo ?? randomInt(1, 180);

  return {
    id,
    developer_id: developer.id,
    project_id: project?.id,
    signal_type: template.type,
    title: `${randomItem(template.titles)} — ${developer.name}`,
    description: `${developer.name} has received a new ${template.type.replace(/_/g, ' ')} update. This indicates ${template.type === 'funding_raised' ? 'financial strength and capability for new investments' : template.type === 'government_approval' ? 'regulatory progress and project viability' : template.type === 'builder_hiring' ? 'expansion and growth in operations' : template.type === 'rera_filing' ? 'regulatory compliance and project transparency' : 'active market participation and growth signals'}.`,
    source: randomItem(template.sources),
    source_type: randomItem(['google_news', 'builder_website', 'government_portal', 'job_portal', 'newsletter'] as const),
    raw_data: {},
    normalized_data: {},
    relevance_score: impactLevel === 'critical' ? randomInt(90, 100) : impactLevel === 'high' ? randomInt(75, 92) : impactLevel === 'medium' ? randomInt(50, 78) : randomInt(20, 55),
    impact_level: impactLevel,
    is_processed: true,
    processed_at: recentDate(Math.min(days, 30)),
    created_at: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
  };
}

// =====================
// OPPORTUNITY GENERATOR
// =====================
function generateOpportunity(id: string, developer: Developer, project: Project | undefined, signals: Signal[], index: number): Opportunity {
  const segment = developer.pricing_segment || 'mid_range';
  const baseValue = segmentBasePrice(segment);
  const multiplier = randomFloat(0.8, 3.0);
  const estimatedValue = Math.round(baseValue * multiplier);

  const scoringFactors = {
    developerStrength: randomInt(40, 95),
    projectReadiness: project ? randomInt(40, 95) : randomInt(20, 60),
    signalStrength: Math.min(signals.length * randomInt(5, 12) + 20, 95),
    marketTiming: randomInt(30, 90),
    financialCapability: randomInt(40, 95),
    relationshipProximity: Math.min(signals.length * randomInt(3, 8) + 20, 90),
  };

  const confidenceScore = Math.round(
    scoringFactors.developerStrength * 0.20 +
    scoringFactors.projectReadiness * 0.20 +
    scoringFactors.signalStrength * 0.25 +
    scoringFactors.marketTiming * 0.15 +
    scoringFactors.financialCapability * 0.10 +
    scoringFactors.relationshipProximity * 0.10
  );

  const clampedScore = Math.min(Math.max(confidenceScore, 5), 99);
  const priority = clampedScore >= 85 ? 'critical' as const : clampedScore >= 70 ? 'high' as const : clampedScore >= 50 ? 'medium' as const : 'low' as const;
  const stage: 'closing' | 'negotiation' | 'proposal' | 'qualifying' | 'discovered' = 
  clampedScore >= 90 ? 'closing' :
  clampedScore >= 80 ? 'negotiation' :
  clampedScore >= 70 ? 'proposal' :
  clampedScore >= 55 ? 'qualifying' :
  'discovered';

  const input = { developer, project, signals };
  const reasoning = generateReasoning(input, clampedScore);

  return {
    id,
    developer_id: developer.id,
    project_id: project?.id,
    title: project ? `${project.name} — ${developer.name}` : `${developer.name} — New Opportunity`,
    summary: `${developer.name} (${developer.city}) — ₹${(estimatedValue / 10000000).toFixed(1)}Cr estimated value. ${signals.length} signals analyzed. Confidence: ${clampedScore}%.`,
    estimated_value: estimatedValue,
    confidence_score: clampedScore,
    priority,
    deal_stage: stage,
    commission_percentage: 3.00,
    estimated_commission: estimatedValue * 0.03,
    commission_currency: 'INR',
    reasoning: reasoning.slice(0, 5),
    recommended_actions: generateActions(clampedScore, developer).slice(0, 4),
    next_best_action: clampedScore >= 80 ? `Contact ${developer.name} immediately` : `Monitor ${developer.name}'s activities`,
    best_contact_day: clampedScore >= 80 ? 'Tuesday' : 'Wednesday',
    best_contact_channel: clampedScore >= 80 ? 'Phone' : 'Email',
    best_followup_timing: clampedScore >= 80 ? 'Within 24 hours' : 'Within 1 week',
    closing_probability: clampedScore / 100,
    potential_objections: ['May have existing partnerships', 'Board approval may be required', 'Competing platforms'],
    suggested_pitch: `Hello ${developer.name} team, we can help you close more deals with zero upfront cost. Only 3% success fee on closed bookings.`,
    ai_analysis: { scoringFactors, signals_analyzed: signals.length, recommendation_engine_version: '3.0' },
    is_active: true,
    signals,
    created_at: recentDate(120),
    updated_at: recentDate(14),
  };
}

function generateReasoning(input: { developer: Developer; project?: Project; signals: Signal[] }, score: number): string[] {
  const reasons: string[] = [];
  const { developer, project, signals } = input;

  reasons.push(`${developer.name} is a ${developer.pricing_segment?.replace('_', ' ')} developer in ${developer.city} with ${developer.active_projects} active projects`);
  if (developer.builder_type === 'public') reasons.push('Publicly listed company with financial transparency');
  if (developer.growth_rate && developer.growth_rate > 15) reasons.push(`Strong ${developer.growth_rate}% YoY growth trajectory`);
  if (developer.hiring_trend === 'increasing') reasons.push(`Actively hiring (${developer.hiring_count} positions) — scaling operations`);
  if (project?.status === 'pre_launch') reasons.push('Project in pre-launch — ideal engagement timing');
  if (project?.rera_status === 'approved') reasons.push('RERA approved — regulatory compliance confirmed');

  const highImpact = signals.filter(s => s.impact_level === 'critical' || s.impact_level === 'high');
  highImpact.slice(0, 2).forEach(s => reasons.push(s.title));

  if (score >= 85) reasons.push('🔥 High confidence — prioritize immediate engagement');
  else if (score >= 70) reasons.push('⚡ Strong opportunity — engage this week');

  return reasons;
}

function generateActions(score: number, dev: Developer): string[] {
  const actions: string[] = [];
  if (score >= 85) {
    actions.push('📞 Initiate contact within 24 hours');
    actions.push('📄 Prepare custom proposal with commission breakdown');
    actions.push('🏗️ Schedule executive meeting for partnership discussion');
    if (dev.expansion_plans?.length) actions.push(`📍 Focus on ${dev.expansion_plans[0]} market entry`);
  } else if (score >= 70) {
    actions.push('📱 Send introduction email within 3 days');
    actions.push('📊 Share relevant case studies');
    actions.push('📅 Schedule exploratory call');
  } else if (score >= 50) {
    actions.push('📧 Add to monthly monitoring list');
    actions.push('🔍 Research developer background');
  } else {
    actions.push('👀 Monitor for additional signals');
  }
  return actions;
}

// =====================
// COMMISSION RECORDS
// =====================
function generateCommission(id: string, opportunity: Opportunity, developer: Developer): CommissionRecord {
  const statuses = ['estimated', 'estimated', 'estimated', 'confirmed', 'paid'] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)] as string;
  const dealValue = opportunity.estimated_value;
  const commissionAmount = dealValue * 0.03;

  return {
    id,
    opportunity_id: opportunity.id,
    developer_id: developer.id,
    deal_value: dealValue,
    commission_percentage: 3.00,
    commission_amount: commissionAmount,
    currency: 'INR',
    status: status as any,
    invoice_number: status === 'paid' || status === 'confirmed' ? `INV-${new Date().getFullYear()}-${randomInt(1000, 9999)}` : undefined,
    invoice_date: status === 'paid' || status === 'confirmed' ? recentDate(90) : undefined,
    payment_date: status === 'paid' ? recentDate(60) : undefined,
    paid_amount: status === 'paid' ? commissionAmount : status === 'confirmed' ? 0 : undefined,
    due_date: status !== 'paid' ? new Date(Date.now() + randomInt(30, 90) * 24 * 60 * 60 * 1000).toISOString() : undefined,
    metadata: {},
    created_at: recentDate(180),
    updated_at: recentDate(14),
  };
}

// =====================
// ACTIVITY LOGS
// =====================
function generateActivityLog(id: string, entityType: string, entityId: string, action: string): ActivityLog {
  return {
    id,
    entity_type: entityType as any,
    entity_id: entityId,
    action,
    description: `${action} — ${entityType} record updated`,
    changes: {},
    actor: 'AI Opportunity Engine',
    metadata: {},
    created_at: recentDate(7),
  };
}

// =====================
// FORECAST GENERATION
// =====================
function generateForecasts(opportunities: Opportunity[]): RevenueForecast[] {
  const months = ['Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'];
  const activeOpps = opportunities.filter(o => o.is_active);

  return months.map((month, monthIdx) => {
    const monthOpps = activeOpps.filter((_, i) => i % 6 === monthIdx || (i + monthIdx) % 6 === monthIdx);
    const expected = monthOpps.reduce((s, o) => s + (o.estimated_commission * 0.6), 0);
    const probable = monthOpps.reduce((s, o) => s + (o.estimated_commission * 0.8), 0);
    const optimistic = monthOpps.reduce((s, o) => s + o.estimated_commission, 0);
    return {
      month,
      expectedCommission: Math.round(expected),
      probableCommission: Math.round(probable),
      optimisticCommission: Math.round(optimistic),
      deals: monthOpps.slice(0, 5).map(o => ({
        name: o.title,
        value: o.estimated_value,
        probability: o.confidence_score / 100,
      })),
    };
  });
}

// =====================
// MAIN GENERATOR
// =====================
export interface Dataset {
  developers: Developer[];
  projects: Project[];
  signals: Signal[];
  opportunities: Opportunity[];
  commissions: CommissionRecord[];
  activityLogs: ActivityLog[];
  forecasts: RevenueForecast[];
}

export function generateDataset(): Dataset {
  const developers: Developer[] = [];
  const projects: Project[] = [];
  const signals: Signal[] = [];
  const opportunities: Opportunity[] = [];
  const commissions: CommissionRecord[] = [];
  const activityLogs: ActivityLog[] = [];

  // Generate 100 developers
  for (let i = 0; i < 100; i++) {
    const devId = `dev-${String(i + 1).padStart(3, '0')}`;
    const dev = generateDeveloper(devId, i);
    developers.push(dev);
  }

  // Generate 500 projects (~5 per developer)
  let projectIndex = 0;
  for (const dev of developers) {
    const projectCount = randomInt(2, 8);
    for (let j = 0; j < projectCount && projectIndex < 500; j++) {
      const projId = `proj-${String(projectIndex + 1).padStart(4, '0')}`;
      const project = generateProject(projId, dev, projectIndex);
      projects.push(project);
      projectIndex++;
    }
  }

  // Generate signals: 3-12 per developer
  let signalIndex = 0;
  for (const dev of developers) {
    const devProjects = projects.filter(p => p.developer_id === dev.id);
    const signalCount = randomInt(3, 12);
    for (let j = 0; j < signalCount; j++) {
      const sigId = `sig-${String(signalIndex + 1).padStart(5, '0')}`;
      const project = Math.random() > 0.5 ? randomItem(devProjects) : undefined;
      const signal = generateSignal(sigId, dev, project, randomInt(1, 180));
      signals.push(signal);
      signalIndex++;
    }
  }

  // Generate opportunities: 5-15 per developer
  let oppIndex = 0;
  for (const dev of developers) {
    const devProjects = projects.filter(p => p.developer_id === dev.id);
    const devSignals = signals.filter(s => s.developer_id === dev.id);
    const oppCount = randomInt(5, 15);
    for (let j = 0; j < oppCount; j++) {
      const oppId = `opp-${String(oppIndex + 1).padStart(5, '0')}`;
      const project = devProjects.length > 0 ? randomItem(devProjects) : undefined;
      const oppSignals = randomItems(devSignals, randomInt(1, Math.min(8, devSignals.length)));
      const opportunity = generateOpportunity(oppId, dev, project, oppSignals, oppIndex);
      opportunities.push(opportunity);
      oppIndex++;
    }
  }

  // Generate commission records for opportunities
  let commIndex = 0;
  for (const opp of opportunities) {
    const dev = developers.find(d => d.id === opp.developer_id);
    if (dev && Math.random() > 0.3) { // 70% of opportunities get commissions
      const commId = `comm-${String(commIndex + 1).padStart(5, '0')}`;
      const comm = generateCommission(commId, opp, dev);
      commissions.push(comm);
      commIndex++;
    }
  }

  // Generate activity logs
  for (let i = 0; i < 50; i++) {
    const entity = randomItem(['developer', 'project', 'signal', 'opportunity', 'commission'] as const);
    const actions = ['Created', 'Updated', 'Analyzed', 'Processed', 'Scored', 'Flagged'];
    activityLogs.push(generateActivityLog(
      `act-${String(i + 1).padStart(5, '0')}`,
      entity,
      `entity-${i}`,
      randomItem(actions)
    ));
  }

  // Generate forecasts
  const forecasts = generateForecasts(opportunities);

  return { developers, projects, signals, opportunities, commissions, activityLogs, forecasts };
}
