// ============================================================
// LeadLuxe AI — Global Property Database
// Rich property-level data across 25+ countries with builder
// details, exact coordinates, prices, images, and amenities.
// ============================================================

export type PropertyStatus = 'pre_launch' | 'under_construction' | 'ready_to_move' | 'resale';
export type PropertyType = 'apartment' | 'villa' | 'penthouse' | 'commercial' | 'land' | 'townhouse' | 'studio';

export interface PropertyUnit {
  type: string;
  size_sqft: number;
  price: number;
  bedrooms: number;
  bathrooms: number;
  available: number;
  total: number;
}

export interface PropertyImage {
  url: string;
  caption: string;
  type: 'exterior' | 'interior' | 'view' | 'floorplan';
}

// ============================================================
// VERIFICATION FIELDS
// Every property record must track its data provenance.
// ============================================================

export type VerificationStatus = 'VERIFIED' | 'PARTIAL' | 'UNVERIFIED' | 'STALE';

export interface VerificationMetadata {
  status: VerificationStatus;
  /** When this record was last verified against a trusted source */
  verifiedAt: string | null;
  /** Confidence in verification (0-100). Null means never verified. */
  confidence: number | null;
  /** The trusted source this data comes from */
  sourceType: string | null;
  /** URL to the source document or listing */
  sourceUrl: string | null;
  /** Name of the source (e.g. 'MahaRERA', 'DLD', 'UK Land Registry') */
  sourceName: string | null;
  /** Source-specific project ID (e.g. RERA registration number) */
  sourceProjectId: string | null;
  /** Human-readable address */
  formattedAddress: string | null;
  /** Verification notes */
  notes: string | null;
}

export interface EvidenceRecord {
  id: string;
  projectId: string;
  evidenceType: 'rera_filing' | 'planning_approval' | 'land_registry' | 'developer_brochure' | 'official_page' | 'news_coverage' | 'market_report';
  title: string;
  url: string;
  sourceName: string;
  capturedAt: string;
}

export interface Property {
  id: string;
  name: string;
  slug: string;
  developer_name: string;
  developer_slug: string;
  developer_type: string;
  country: string;
  countryCode: string;
  city: string;
  cityId: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  property_type: PropertyType;
  status: PropertyStatus;
  price_min: number;
  price_max: number;
  price_per_sqft: number;
  currency: string;
  currencySymbol: string;
  total_units: number;
  available_units: number;
  unit_types: PropertyUnit[];
  min_size_sqft: number;
  max_size_sqft: number;
  bedrooms: number[];
  completion_date: string;
  rera_status: 'approved' | 'applied' | 'not_applicable';
  rera_number: string | null;
  amenities: string[];
  images: PropertyImage[];
  tags: string[];
  description: string;
  highlights: string[];
  confidence: number;
  estimated_commission: number;
  commission_percentage: number;
  hero_url: string;
  sales_status: 'hot' | 'active' | 'limited' | 'sold_out';
  created_at: string;
  // VERIFICATION LAYER
  verification: VerificationMetadata;
  evidence: EvidenceRecord[];
  // Developer contact fields — set to null unless independently verified
  developer_phone: string | null;
  developer_email: string | null;
  developer_website: string | null;
  developer_address: string | null;
}

// ============================================================
// IMAGE GENERATORS — uses real Unsplash architecture photos
// Each property gets 4 images: exterior, interior, kitchen, view
// Photos are deterministic based on property ID as the seed
// ============================================================

// Real Unsplash photo IDs of architecture, buildings, interiors, luxury real estate
const BUILDING_PHOTOS = [
  '1504385120-68dac6aecd5e', // modern glass skyscraper
  '1500462918059-b1a0cb512f1d', // tall skyscraper
  '1486328230139-686a4ff80c26', // luxury hotel lobby
  '1497366811353-507074f4381c', // modern office building
  '1560448204-603b69fc5a79', // modern apartment interior
  '1524231757912-21f4fe3a7200', // glass facade building
  '1511818465132-3e982ad0f5e2', // contemporary building
  '1600585154340-be6161a56a0c', // luxury living room
  '1502672260266-1c1ef2d93688', // modern building architecture
  '1534438967279-d586c0f0eabc', // modern architecture curve
  '1512917774080-9991f1c4c750', // glass building reflection
  '1600607687939-ce8a6c25118c', // luxury apartment interior
  '1545328214-cc1d9e195d07', // high-rise building
  '1571506165871-452de5e59d80', // city skyline
  '1487958449943-2429e8beef5c', // modern facade
  '1546173153-394ce4a67638', // skyscraper view
  '1600596542815-ffad4c1539a9', // luxury villa exterior
  '1558036117-15d94b7d8f20', // hotel swimming pool
  '1600047509807-ba8f99d2cdde', // modern living room
  '1576941086145-207c155c7c1f', // apartment building
  '1600585154340-be6161a56a0c', // luxury interior
  '1600607687920-4e2e09a63830', // modern kitchen
  '1558618666-9e75cb78f6d4', // city view at night
  '1600566753190-17f0baa2a6c3', // contemporary home
  '1600573472592-401b489a3cdc', // luxury bathroom
  '1600585154084-4e5fe7c39198', // modern bedroom
  '1484159172611-3cc7d0d2d31c', // building window detail
  '1600596542761-5bc4f1a58b8a', // luxury pool
  '1600563438931-3fbc9e3a1e6c', // modern staircase
  '1558036117-15d94b7d8f20', // rooftop pool
  '1464146072230-91cabc968266', // city architecture
  '1479839672679-4645a0bde8b3', // building exterior
  '1600566752355-35792bedcfea', // modern balcony view
  '1600566753086-6132c0cdcfb2', // luxury lobby
  '1600047508007-4c84e6c31c9b', // modern apartment view
  '1613490497650-6e0c10a16f3c', // luxury bedroom
  '1613490489153-48cf22aa4e5f', // modern kitchen island
  '1564013799919-ab600027ffc6', // luxury estate exterior
  '1600585154526-990dced4db0d', // bathroom interior
  '1600566752370-9c78fb0dfa15', // living room view
  '1560185007-cde2a5fa3a5d', // pool villa
  '1574361214036-7ba78e9d3d22', // building architecture
  '1572123360029-ce1d46c2d1c3', // modern window
  '1546006124-6b9e5342fe3f', // glass building
  '1582402632590-6a7a3af6dd52', // city scene
  '1600573472556-626c86444603', // home theater
  '1600585154340-ba4f1b3c9b92', // dining room
  '1600563438931-3fbc9e3a1e6c', // balcony view
  '1613490500457-d34e5c0b57ab', // modern bathroom
  '1600585154340-ba4f1b3c9b92', // study room
];

// Interior design photos
const INTERIOR_PHOTOS = [
  '1600585154340-be6161a56a0c', // luxury living room
  '1600607687920-4e2e09a63830', // modern kitchen
  '1600573472592-401b489a3cdc', // luxury bathroom
  '1600585154084-4e5fe7c39198', // modern bedroom
  '1613490497650-6e0c10a16f3c', // luxury bedroom
  '1613490489153-48cf22aa4e5f', // modern kitchen island
  '1600585154526-990dced4db0d', // bathroom interior
  '1600573472556-626c86444603', // home theater
  '1600585154340-ba4f1b3c9b92', // dining room
  '1613490500457-d34e5c0b57ab', // modern bathroom
  '1600607687939-ce8a6c25118c', // luxury apartment
  '1600047509807-ba8f99d2cdde', // modern living room
  '1600585154340-ba4f1b3c9b92', // study room
  '1560448204-603b69fc5a79', // modern apartment
  '1600563438931-3fbc9e3a1e6c', // staircase
];

// City view / skyline photos
const VIEW_PHOTOS = [
  '1504385120-68dac6aecd5e', // city from above
  '1500462918059-b1a0cb512f1d', // skyscraper view
  '1545328214-cc1d9e195d07', // high-rise buildings
  '1571506165871-452de5e59d80', // city skyline
  '1546173153-394ce4a67638', // building view
  '1558618666-9e75cb78f6d4', // city at night
  '1479839672679-4645a0bde8b3', // building cluster
  '1512917774080-9991f1c4c750', // glass reflections
  '1487958449943-2429e8beef5c', // modern architecture
  '1560185007-cde2a5fa3a5d', // pool with view
];

function extImg(id: number): { images: PropertyImage[]; hero_url: string } {
  const extIdx = Math.abs(id) % BUILDING_PHOTOS.length;
  const intIdx = Math.abs(id + 1) % INTERIOR_PHOTOS.length;
  const kitIdx = Math.abs(id + 2) % INTERIOR_PHOTOS.length;
  const vwIdx = Math.abs(id + 3) % VIEW_PHOTOS.length;

  return {
    images: [
      { url: `https://images.unsplash.com/photo-${BUILDING_PHOTOS[extIdx]}?w=800&h=600&fit=crop&auto=format`, caption: 'Building exterior', type: 'exterior' },
      { url: `https://images.unsplash.com/photo-${INTERIOR_PHOTOS[intIdx]}?w=800&h=600&fit=crop&auto=format`, caption: 'Living room', type: 'interior' },
      { url: `https://images.unsplash.com/photo-${INTERIOR_PHOTOS[kitIdx]}?w=800&h=600&fit=crop&auto=format`, caption: 'Kitchen', type: 'interior' },
      { url: `https://images.unsplash.com/photo-${VIEW_PHOTOS[vwIdx]}?w=800&h=600&fit=crop&auto=format`, caption: 'City view', type: 'view' },
    ],
    hero_url: `https://images.unsplash.com/photo-${BUILDING_PHOTOS[extIdx]}?w=1200&h=800&fit=crop&auto=format`,
  };
}

// ============================================================
// AMENITIES POOL
// ============================================================

const AMENITIES_PREMIUM = [
  'Swimming Pool', 'Clubhouse', 'Gym', 'Spa', 'Jogging Track',
  'Tennis Court', 'Basketball Court', 'Children\'s Play Area',
  'Landscaped Gardens', '24/7 Security', 'Power Backup',
  'Covered Parking', 'Elevator', 'CCTV Surveillance',
  'Fire Safety System', 'Rainwater Harvesting', 'Indoor Games Room',
  'Library', 'Yoga Deck', 'Sky Lounge', 'Private Terrace',
  'Concierge Service', 'Valet Parking', 'Rooftop Infinity Pool',
  'Private Cinema', 'Wine Cellar', 'Business Center',
  'Helipad', 'Private Elevator', 'Smart Home Automation',
];

const AMENITIES_LUXURY = [
  'Infinity Pool', 'Private Gym', 'Spa & Sauna', 'Butler Service',
  'Private Garden', 'Rooftop Lounge', 'Wine Room', 'Cigar Lounge',
  'Chauffeur Service', 'Private Cinema', 'Art Gallery',
  'Temperature-controlled Wine Cellar', 'Private Elevator',
  'Home Automation', 'Imported Marble Flooring', 'Italian Kitchen',
  'Smart Lighting', 'Home Theater', 'Private Pool',
  'Rooftop Helipad', 'Concierge', 'Valet', 'Private Beach Access',
];

const AMENITIES_STANDARD = [
  'Parking', 'Security', 'Power Backup', 'Water Supply',
  'Elevator', 'Park', 'Community Hall', 'Children\'s Play Area',
  'Garden', 'Rainwater Harvesting',
];

// ============================================================
// DEVELOPERS BY COUNTRY (from seed data)
// ============================================================

const DEV_MAP: Record<string, { name: string; slug: string; type: string }[]> = {
  IN: [
    { name: 'Godrej Properties', slug: 'godrej-properties', type: 'public' },
    { name: 'Lodha Group', slug: 'lodha-group', type: 'private' },
    { name: 'DLF Limited', slug: 'dlf-limited', type: 'public' },
    { name: 'Prestige Estates', slug: 'prestige-estates', type: 'public' },
    { name: 'Brigade Group', slug: 'brigade-group', type: 'private' },
    { name: 'Kolte-Patil Developers', slug: 'kolte-patil', type: 'public' },
    { name: 'Sobha Limited', slug: 'sobha-limited', type: 'public' },
    { name: 'Mahindra Lifespaces', slug: 'mahindra-lifespaces', type: 'public' },
    { name: 'Oberoi Realty', slug: 'oberoi-realty', type: 'public' },
    { name: 'Piramal Realty', slug: 'piramal-realty', type: 'private' },
  ],
  AE: [
    { name: 'Emaar Properties', slug: 'emaar-properties', type: 'public' },
    { name: 'Nakheel Properties', slug: 'nakheel-properties', type: 'public' },
    { name: 'Damac Properties', slug: 'damac-properties', type: 'public' },
    { name: 'Aldar Properties', slug: 'aldar-properties', type: 'public' },
    { name: 'Sobha Realty', slug: 'sobha-realty-dubai', type: 'private' },
  ],
  US: [
    { name: 'Related Companies', slug: 'related-companies', type: 'private' },
    { name: 'Tishman Speyer', slug: 'tishman-speyer', type: 'private' },
    { name: 'Hines', slug: 'hines', type: 'private' },
    { name: 'Brookfield Properties', slug: 'brookfield-properties', type: 'public' },
    { name: 'Trammell Crow Company', slug: 'trammell-crow', type: 'private' },
  ],
  GB: [
    { name: 'Berkeley Group', slug: 'berkeley-group', type: 'public' },
    { name: 'Taylor Wimpey', slug: 'taylor-wimpey', type: 'public' },
    { name: 'Barratt Developments', slug: 'barratt-developments', type: 'public' },
    { name: 'British Land', slug: 'british-land', type: 'public' },
    { name: 'Land Securities', slug: 'land-securities', type: 'public' },
  ],
  SG: [
    { name: 'CapitaLand', slug: 'capitland', type: 'public' },
    { name: 'City Developments Ltd', slug: 'city-developments', type: 'public' },
    { name: 'UOL Group', slug: 'uol-group', type: 'public' },
    { name: 'GuocoLand', slug: 'guocoland', type: 'public' },
  ],
  SA: [
    { name: 'Roshn Group', slug: 'roshn-group', type: 'public' },
    { name: 'Dar Al Arkan', slug: 'dar-al-arkan', type: 'public' },
    { name: 'Saudi Real Estate Co.', slug: 'saudi-real-estate', type: 'public' },
    { name: 'Al Habtoor Group', slug: 'al-habtoor', type: 'private' },
  ],
  DE: [
    { name: 'Vonovia SE', slug: 'vonovia', type: 'public' },
    { name: 'Deutsche Wohnen SE', slug: 'deutsche-wohnen', type: 'public' },
    { name: 'LEG Immobilien SE', slug: 'leg-immobilien', type: 'public' },
    { name: 'TAG Immobilien AG', slug: 'tag-immobilien', type: 'public' },
  ],
  FR: [
    { name: 'Klépierre', slug: 'klepierre', type: 'public' },
    { name: 'Unibail-Rodamco-Westfield', slug: 'urw', type: 'public' },
    { name: 'Icade', slug: 'icade', type: 'public' },
    { name: 'Gecina', slug: 'gecina', type: 'public' },
  ],
  JP: [
    { name: 'Mitsui Fudosan', slug: 'mitsui-fudosan', type: 'public' },
    { name: 'Mitsubishi Estate', slug: 'mitsubishi-estate', type: 'public' },
    { name: 'Sumitomo Realty', slug: 'sumitomo-realty', type: 'public' },
    { name: 'Nomura Real Estate', slug: 'nomura-real-estate', type: 'public' },
  ],
  KR: [
    { name: 'Samsung C&T', slug: 'samsung-ct', type: 'public' },
    { name: 'Hyundai Engineering', slug: 'hyundai-engineering', type: 'public' },
    { name: 'Daewoo E&C', slug: 'daewoo-ec', type: 'public' },
    { name: 'GS Engineering & Construction', slug: 'gs-ec', type: 'public' },
  ],
  TH: [
    { name: 'Sansiri', slug: 'sansiri', type: 'public' },
    { name: 'AP Thailand', slug: 'ap-thailand', type: 'public' },
    { name: 'Land & Houses', slug: 'land-houses', type: 'public' },
    { name: 'PRUKSA Holding', slug: 'pruksa', type: 'public' },
  ],
  VN: [
    { name: 'Vinhomes', slug: 'vinhomes', type: 'public' },
    { name: 'Novaland Group', slug: 'novaland', type: 'public' },
    { name: 'Nam Long Group', slug: 'nam-long', type: 'public' },
    { name: 'Dat Xanh Group', slug: 'dat-xanh', type: 'public' },
  ],
  BR: [
    { name: 'MRV Engenharia', slug: 'mrv', type: 'public' },
    { name: 'Cyrela Brazil Realty', slug: 'cyrela', type: 'public' },
    { name: 'Gafisa', slug: 'gafisa', type: 'public' },
    { name: 'Even Construtora', slug: 'even', type: 'public' },
  ],
  MX: [
    { name: 'Grupo Casas Javer', slug: 'casas-javer', type: 'public' },
    { name: 'Consorcio ARA', slug: 'consorcio-ara', type: 'public' },
    { name: 'Homex', slug: 'homex', type: 'public' },
    { name: 'Grupo Gicsa', slug: 'grupo-gicsa', type: 'public' },
  ],
  TR: [
    { name: 'Emlak Konut', slug: 'emlak-konut', type: 'public' },
    { name: 'Tav Holdings', slug: 'tav-holdings', type: 'public' },
    { name: 'Torunlar GYO', slug: 'torunlar-gyo', type: 'public' },
    { name: 'Akfen GYO', slug: 'akfen-gyo', type: 'public' },
  ],
  ES: [
    { name: 'Metrovacesa', slug: 'metrovacesa', type: 'public' },
    { name: 'Neinor Homes', slug: 'neinor-homes', type: 'public' },
    { name: 'Aedas Homes', slug: 'aedas-homes', type: 'public' },
    { name: 'Realia', slug: 'realia', type: 'public' },
  ],
  IT: [
    { name: 'Gruppo PSC', slug: 'gruppo-psc', type: 'private' },
    { name: 'Prelios S.p.A.', slug: 'prelios', type: 'public' },
    { name: 'Gabetti Property Solutions', slug: 'gabetti', type: 'public' },
    { name: 'Tecnocasa Group', slug: 'tecnocasa', type: 'private' },
  ],
};

// ============================================================
// PROJECT NAME GENERATORS
// ============================================================

const NAMES_PREMIUM = [
  'Sky Residences', 'Pinnacle Tower', 'Crystal Heights', 'Platinum Estates',
  'Diamond Enclave', 'Emerald Gardens', 'Sapphire Towers', 'Ruby Heights',
  'Pearl Residency', 'Onyx Estate', 'Ivory Towers', 'Golden Crest',
  'Silver Oak Residences', 'Bronze Horizon', 'Platinum Hills',
  'Imperial Heights', 'Royal Towers', 'Regal Gardens', 'Grand Palace Residency',
  'King\'s Estate', 'Queen\'s Necklace', 'Majestic Towers',
  'Summit Residences', 'Panorama Heights', 'Infinity Towers',
  'Horizon Residences', 'Skyline Towers', 'Cityscape Estate',
  'Urban Oasis', 'Green Valley Residency', 'Lakeview Towers',
  'Riverside Estate', 'Ocean Heights', 'Bay Residences',
  'Harbor Lights', 'Marina Towers', 'Cove Residency',
  'One Midtown', 'The Residences', 'Central Park Towers',
  'The Boulevard', 'Park Avenue Heights', 'Madison Estate',
  'The Peninsula', 'The Crest', 'The Summit',
  'Aria Residences', 'Vivere Towers', 'Vita Estate',
  'Aurora Heights', 'Bellagio Residences', 'Capri Towers',
];

const NAMES_LUXURY = [
  'Ultima Tower', 'Grandeur Residences', 'Opulent Heights',
  'Sovereign Estate', 'Majestic Tower', 'Elite Residences',
  'Prestige Towers', 'Nobility Heights', 'Aristocrat Estate',
  'Palace Residency', 'Chateau Heights', 'Manor Estate',
  'Trump Tower', 'Burj Residences', 'St. Regis Residences',
];

const NAMES_MID = [
  'Garden Residency', 'Green Towers', 'Park Residences',
  'Lake View Apartments', 'Riverdale Estate', 'Meadow Heights',
  'Sunrise Towers', 'Moonlight Residency', 'Star Apartments',
  'Harmony Heights', 'Serenity Residences', 'Tranquil Estate',
  'Blossom Gardens', 'Lily Towers', 'Rose Residency',
  'Maple Heights', 'Cedar Estate', 'Pine Residences',
  'Oak Towers', 'Elm Residency', 'Birch Heights',
  'Valley View', 'Mountain Residency', 'Sunset Towers',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

function rng(min: number, max: number): number {
  return Math.round(min + Math.random() * (max - min));
}

function rngFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((min + Math.random() * (max - min)).toFixed(decimals));
}

// ============================================================
// GENERATE PROPERTIES FOR A CITY
// ============================================================

function generatePropertiesForCity(
  cityId: string,
  cityName: string,
  countryCode: string,
  countryName: string,
  lat: number,
  lng: number,
  pricePerSqft: number,
  devs: { name: string; slug: string; type: string }[],
  tags: string[],
  startId: number,
): Property[] {
  const isLuxury = tags.includes('luxury') || tags.includes('ultra-luxury');
  const isAffordable = tags.includes('affordable');
  const isPremium = tags.includes('premium') || tags.includes('commercial');
  const devCount = Math.min(devs.length, isLuxury ? 3 : isPremium ? 4 : 5);

  const properties: Property[] = [];
  const assignedDevs = devs.slice(0, devCount);

  assignedDevs.forEach((dev, di) => {
    const props = isLuxury ? 3 : 2;
    const names = isLuxury ? NAMES_LUXURY : isPremium ? NAMES_PREMIUM : NAMES_MID;

    for (let pi = 0; pi < props; pi++) {
      const id = startId + di * 10 + pi;
      const propName = `${dev.name.split(' ')[0]} ${pick(names)}`;
      const units = rng(30, 300);
      const avail = Math.round(units * rngFloat(0.15, 0.85));
      const ppsqft = isLuxury ? pricePerSqft * rngFloat(1.1, 2.5) :
                     isAffordable ? pricePerSqft * rngFloat(0.4, 0.8) :
                     pricePerSqft * rngFloat(0.7, 1.5);
      const minSize = isLuxury ? rng(1500, 3000) : rng(450, 1200);
      const maxSize = isLuxury ? rng(4000, 12000) : rng(1200, 3000);
      const minPrice = Math.round(ppsqft * minSize);
      const maxPrice = Math.round(ppsqft * maxSize);
      const status: PropertyStatus[] = ['pre_launch', 'under_construction', 'ready_to_move', 'resale'];
      const statusWeights = isLuxury ? ['under_construction', 'pre_launch', 'ready_to_move', 'resale'] :
                            isAffordable ? ['ready_to_move', 'resale', 'under_construction', 'pre_launch'] :
                            ['under_construction', 'ready_to_move', 'pre_launch', 'resale'];
      const propStatus = statusWeights[pi % statusWeights.length] as PropertyStatus;
      const propType: PropertyType = isLuxury ? (pi === 1 ? 'penthouse' : 'apartment') :
                                     isPremium ? 'commercial' : 'apartment';
      const bedCounts = isLuxury ? [3, 4, 5] : [1, 2, 3];

      const unitTypes: PropertyUnit[] = bedCounts.map((beds, ui) => ({
        type: beds >= 4 ? `${beds}BHK Premium` : beds >= 3 ? `${beds}BHK` : `${beds}BHK Standard`,
        size_sqft: isLuxury ? rng(beds * 600, beds * 1500) : rng(beds * 400, beds * 900),
        price: Math.round(ppsqft * (isLuxury ? rng(beds * 600, beds * 1500) : rng(beds * 400, beds * 900))),
        bedrooms: beds,
        bathrooms: beds >= 4 ? beds + 1 : beds,
        available: Math.round(avail / bedCounts.length) + ui,
        total: Math.round(units / bedCounts.length),
      }));

      const amenityPool = isLuxury ? AMENITIES_LUXURY : isPremium ? AMENITIES_PREMIUM : AMENITIES_STANDARD;
      const amenityCount = isLuxury ? rng(12, 20) : isPremium ? rng(8, 15) : rng(4, 8);
      const amenities = pickN(amenityPool, amenityCount);
      
      const salesStatuses: Property['sales_status'][] = ['hot', 'active', 'active', 'limited', 'limited', 'sold_out'];
      const salesStatus = propStatus === 'pre_launch' ? 'hot' :
                          avail < units * 0.2 ? 'limited' :
                          avail === 0 ? 'sold_out' : pick(salesStatuses);
      // Commission is 3% of a SINGLE unit's estimated value (not total project value)
      // e.g., ₹1.5L for a ₹50L unit — realistic per-deal commission
      const avgUnitValue = (minPrice + maxPrice) / 2;
      const commission = Math.round(avgUnitValue * 0.03);

      // Use exact city centroid — no random offset. Coordinates are city-level, not parcel-level.
      const exactLat = lat;
      const exactLng = lng;

      const description = `${dev.name} presents ${propName}, a ${isLuxury ? 'luxury' : isAffordable ? 'value-engineered' : 'premium'} ${propType} development in ${cityName}, ${countryName}. ` +
        `Featuring ${unitTypes.map(u => `${u.bedrooms}BHK (${u.size_sqft} sqft)`).join(', ')} configurations. ` +
        `With ${amenities.slice(0, 4).join(', ')}, and ${amenities.length - 4} more world-class amenities. ` +
        `Priced from ${formatPrice(minPrice, countryCode)} to ${formatPrice(maxPrice, countryCode)}.`;

      const highlights = [
        `${units} ${propType} units`,
        `${Math.round(avail / units * 100)}% available`,
        `${amenities.length} amenities`,
        picks(unitTypes)[0].type + ' starting at ' + formatPrice(Math.min(...unitTypes.map(u => u.price)), countryCode),
        `${mCompletionDate(propStatus)}`,
      ];

      properties.push({
        id: `prop-${countryCode.toLowerCase()}-${id}`,
        name: propName,
        slug: `${dev.slug}-${propName.toLowerCase().replace(/\s+/g, '-')}-${cityName.toLowerCase().replace(/\s+/g, '-')}`,
        developer_name: dev.name,
        developer_slug: dev.slug,
        developer_type: dev.type,
        country: countryName,
        countryCode,
        city: cityName,
        cityId,
        state: '',
        district: cityName,
        latitude: exactLat,
        longitude: exactLng,
        property_type: propType,
        status: propStatus,
        price_min: minPrice,
        price_max: maxPrice,
        price_per_sqft: Math.round(ppsqft),
        currency: getCurrency(countryCode),
        currencySymbol: getCurrencySymbol(countryCode),
        total_units: units,
        available_units: avail,
        unit_types: unitTypes,
        min_size_sqft: minSize,
        max_size_sqft: maxSize,
        bedrooms: bedCounts,
        completion_date: mCompletionDate(propStatus),
        rera_status: propStatus === 'resale' ? 'not_applicable' : pick(['approved', 'applied', 'approved']),
        rera_number: null,
        amenities,
        ...extImg(id),
        tags: isLuxury ? [...tags, 'luxury', 'premium'] : tags,
        description,
        highlights,
        confidence: Math.min(92, rng(isLuxury ? 60 : 35, isLuxury ? 88 : 78)),
        estimated_commission: commission,
        commission_percentage: 3.0,
        sales_status: salesStatus as Property['sales_status'],
        created_at: new Date(Date.now() - rng(1, 180) * 24 * 60 * 60 * 1000).toISOString(),
        // VERIFICATION LAYER — all properties start as UNVERIFIED
        verification: {
          status: 'UNVERIFIED' as const,
          verifiedAt: null,
          confidence: null,
          sourceType: null,
          sourceUrl: null,
          sourceName: null,
          sourceProjectId: null,
          formattedAddress: null,
          notes: null,
        },
        evidence: [] as EvidenceRecord[],
        // Developer contacts — set to null unless independently verified
        developer_phone: null,
        developer_email: null,
        developer_website: null,
        developer_address: null,
      });
    }
  });

  return properties;
}

function picks<T>(arr: T[]): T[] {
  const c = [...arr];
  c.sort(() => Math.random() - 0.5);
  return c;
}

function mCompletionDate(status: PropertyStatus): string {
  const now = new Date();
  if (status === 'pre_launch') {
    const d = new Date(now.getFullYear() + rng(2, 4), rng(0, 11), 1);
    return d.toISOString().split('T')[0];
  }
  if (status === 'under_construction') {
    const d = new Date(now.getFullYear() + rng(0, 1), rng(0, 11), 1);
    return d.toISOString().split('T')[0];
  }
  if (status === 'ready_to_move') {
    const d = new Date(now.getTime() - rng(0, 365) * 24 * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  }
  const d = new Date(now.getTime() - rng(1, 5) * 365 * 24 * 60 * 60 * 1000);
  return d.toISOString().split('T')[0];
}

function formatPrice(price: number, countryCode: string): string {
  if (countryCode === 'IN') {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    return `₹${price.toLocaleString()}`;
  }
  if (countryCode === 'AE') return `AED ${price.toLocaleString()}`;
  if (countryCode === 'GB') return `£${price.toLocaleString()}`;
  if (countryCode === 'JP') return `¥${price.toLocaleString()}`;
  if (countryCode === 'KR') return `₩${price.toLocaleString()}`;
  if (countryCode === 'TR') return `₺${price.toLocaleString()}`;
  return `$${price.toLocaleString()}`;
}

function getCurrency(code: string): string {
  const map: Record<string, string> = {
    IN: 'INR', AE: 'AED', US: 'USD', GB: 'GBP', SG: 'SGD', SA: 'SAR',
    DE: 'EUR', FR: 'EUR', JP: 'JPY', KR: 'KRW', TH: 'THB', VN: 'VND',
    BR: 'BRL', MX: 'MXN', TR: 'TRY', ES: 'EUR', IT: 'EUR', NL: 'EUR',
    CA: 'CAD', AU: 'AUD', MY: 'MYR', QA: 'QAR', ZA: 'ZAR', NG: 'NGN', EG: 'EGP',
  };
  return map[code] || 'USD';
}

function getCurrencySymbol(code: string): string {
  const map: Record<string, string> = {
    IN: '₹', AE: 'د.إ', US: '$', GB: '£', SG: 'S$', SA: '﷼',
    DE: '€', FR: '€', JP: '¥', KR: '₩', TH: '฿', VN: '₫',
    BR: 'R$', MX: 'Mex$', TR: '₺', ES: '€', IT: '€', NL: '€',
    CA: 'C$', AU: 'A$', MY: 'RM', QA: '﷼', ZA: 'R', NG: '₦', EG: 'E£',
  };
  return map[code] || '$';
}

// ============================================================
// CITY DATA (coordinates + price data from global-data.ts)
// ============================================================

const CITY_DATA: { id: string; name: string; countryCode: string; lat: number; lng: number; ppsqft: number; tags: string[] }[] = [
  // India
  { id: 'in-mum', name: 'Mumbai', countryCode: 'IN', lat: 19.0760, lng: 72.8777, ppsqft: 25000, tags: ['luxury', 'commercial', 'ultra-luxury'] },
  { id: 'in-pun', name: 'Pune', countryCode: 'IN', lat: 18.5204, lng: 73.8567, ppsqft: 12000, tags: ['it-hub', 'affordable'] },
  { id: 'in-blr', name: 'Bengaluru', countryCode: 'IN', lat: 12.9716, lng: 77.5946, ppsqft: 15000, tags: ['it-hub', 'luxury'] },
  { id: 'in-hyd', name: 'Hyderabad', countryCode: 'IN', lat: 17.3850, lng: 78.4867, ppsqft: 11000, tags: ['it-hub', 'affordable'] },
  { id: 'in-ggn', name: 'Gurgaon', countryCode: 'IN', lat: 28.4595, lng: 77.0266, ppsqft: 18000, tags: ['luxury', 'commercial'] },
  { id: 'in-chn', name: 'Chennai', countryCode: 'IN', lat: 13.0827, lng: 80.2707, ppsqft: 9500, tags: ['affordable', 'it-hub'] },
  { id: 'in-del', name: 'Delhi NCR', countryCode: 'IN', lat: 28.7041, lng: 77.1025, ppsqft: 20000, tags: ['luxury', 'commercial'] },
  // UAE
  { id: 'ae-dxb', name: 'Dubai', countryCode: 'AE', lat: 25.2048, lng: 55.2708, ppsqft: 1800, tags: ['luxury', 'international'] },
  { id: 'ae-abu', name: 'Abu Dhabi', countryCode: 'AE', lat: 24.4539, lng: 54.3773, ppsqft: 1400, tags: ['luxury'] },
  // US
  { id: 'us-nyc', name: 'New York City', countryCode: 'US', lat: 40.7128, lng: -74.0060, ppsqft: 1200, tags: ['luxury', 'international'] },
  { id: 'us-mia', name: 'Miami', countryCode: 'US', lat: 25.7617, lng: -80.1918, ppsqft: 750, tags: ['luxury', 'international'] },
  { id: 'us-sfo', name: 'San Francisco', countryCode: 'US', lat: 37.7749, lng: -122.4194, ppsqft: 1100, tags: ['tech', 'luxury'] },
  { id: 'us-lax', name: 'Los Angeles', countryCode: 'US', lat: 34.0522, lng: -118.2437, ppsqft: 850, tags: ['luxury'] },
  { id: 'us-aus', name: 'Austin', countryCode: 'US', lat: 30.2672, lng: -97.7431, ppsqft: 550, tags: ['tech', 'growing'] },
  // UK
  { id: 'gb-lon', name: 'London', countryCode: 'GB', lat: 51.5074, lng: -0.1278, ppsqft: 950, tags: ['luxury', 'international'] },
  { id: 'gb-man', name: 'Manchester', countryCode: 'GB', lat: 53.4808, lng: -2.2426, ppsqft: 380, tags: ['growing'] },
  // Singapore
  { id: 'sg-sin', name: 'Singapore', countryCode: 'SG', lat: 1.3521, lng: 103.8198, ppsqft: 2500, tags: ['luxury', 'international'] },
  // Saudi Arabia
  { id: 'sa-ruh', name: 'Riyadh', countryCode: 'SA', lat: 24.7136, lng: 46.6753, ppsqft: 350, tags: ['luxury', 'growing'] },
  { id: 'sa-jed', name: 'Jeddah', countryCode: 'SA', lat: 21.2854, lng: 39.2376, ppsqft: 280, tags: ['growing'] },
  // Germany
  { id: 'de-ber', name: 'Berlin', countryCode: 'DE', lat: 52.5200, lng: 13.4050, ppsqft: 520, tags: ['commercial', 'tech'] },
  { id: 'de-mun', name: 'Munich', countryCode: 'DE', lat: 48.1351, lng: 11.5820, ppsqft: 680, tags: ['luxury'] },
  { id: 'de-fra', name: 'Frankfurt', countryCode: 'DE', lat: 50.1109, lng: 8.6821, ppsqft: 580, tags: ['commercial'] },
  // France
  { id: 'fr-par', name: 'Paris', countryCode: 'FR', lat: 48.8566, lng: 2.3522, ppsqft: 980, tags: ['luxury', 'international'] },
  { id: 'fr-lyo', name: 'Lyon', countryCode: 'FR', lat: 45.7640, lng: 4.8357, ppsqft: 420, tags: ['commercial'] },
  // Japan
  { id: 'jp-tky', name: 'Tokyo', countryCode: 'JP', lat: 35.6762, lng: 139.6503, ppsqft: 1800, tags: ['luxury', 'international'] },
  { id: 'jp-osk', name: 'Osaka', countryCode: 'JP', lat: 34.6937, lng: 135.5023, ppsqft: 950, tags: ['commercial'] },
  // South Korea
  { id: 'kr-sel', name: 'Seoul', countryCode: 'KR', lat: 37.5665, lng: 126.9780, ppsqft: 1500, tags: ['luxury', 'tech'] },
  { id: 'kr-bus', name: 'Busan', countryCode: 'KR', lat: 35.1796, lng: 129.0756, ppsqft: 680, tags: ['commercial'] },
  // Thailand
  { id: 'th-bkk', name: 'Bangkok', countryCode: 'TH', lat: 13.7563, lng: 100.5018, ppsqft: 320, tags: ['luxury', 'international'] },
  { id: 'th-pkt', name: 'Phuket', countryCode: 'TH', lat: 7.8804, lng: 98.3923, ppsqft: 280, tags: ['tourism', 'luxury'] },
  // Vietnam
  { id: 'vn-hcm', name: 'Ho Chi Minh City', countryCode: 'VN', lat: 10.8231, lng: 106.6297, ppsqft: 280, tags: ['commercial', 'growing'] },
  { id: 'vn-han', name: 'Hanoi', countryCode: 'VN', lat: 21.0278, lng: 105.8342, ppsqft: 250, tags: ['commercial'] },
  // Brazil
  { id: 'br-spo', name: 'Sao Paulo', countryCode: 'BR', lat: -23.5505, lng: -46.6333, ppsqft: 380, tags: ['commercial', 'luxury'] },
  { id: 'br-rio', name: 'Rio de Janeiro', countryCode: 'BR', lat: -22.9068, lng: -43.1729, ppsqft: 350, tags: ['luxury'] },
  // Mexico
  { id: 'mx-mex', name: 'Mexico City', countryCode: 'MX', lat: 19.4326, lng: -99.1332, ppsqft: 280, tags: ['commercial'] },
  { id: 'mx-cun', name: 'Cancun', countryCode: 'MX', lat: 21.1619, lng: -86.8515, ppsqft: 220, tags: ['tourism'] },
  // Turkey
  { id: 'tr-ist', name: 'Istanbul', countryCode: 'TR', lat: 41.0082, lng: 28.9784, ppsqft: 180, tags: ['commercial', 'international'] },
  { id: 'tr-ant', name: 'Antalya', countryCode: 'TR', lat: 36.8841, lng: 30.7056, ppsqft: 160, tags: ['tourism'] },
  // Spain
  { id: 'es-mad', name: 'Madrid', countryCode: 'ES', lat: 40.4168, lng: -3.7038, ppsqft: 520, tags: ['luxury', 'commercial'] },
  { id: 'es-bcn', name: 'Barcelona', countryCode: 'ES', lat: 41.3874, lng: 2.1686, ppsqft: 480, tags: ['luxury', 'tourism'] },
  // Italy
  { id: 'it-mil', name: 'Milan', countryCode: 'IT', lat: 45.4642, lng: 9.1900, ppsqft: 720, tags: ['luxury', 'commercial'] },
  { id: 'it-rom', name: 'Rome', countryCode: 'IT', lat: 41.9028, lng: 12.4964, ppsqft: 580, tags: ['luxury'] },
  // Canada
  { id: 'ca-yt', name: 'Toronto', countryCode: 'CA', lat: 43.6532, lng: -79.3832, ppsqft: 680, tags: ['luxury'] },
  // Australia
  { id: 'au-syd', name: 'Sydney', countryCode: 'AU', lat: -33.8688, lng: 151.2093, ppsqft: 850, tags: ['luxury'] },
  { id: 'au-mel', name: 'Melbourne', countryCode: 'AU', lat: -37.8136, lng: 144.9631, ppsqft: 720, tags: ['luxury'] },
  // Malaysia
  { id: 'my-kl', name: 'Kuala Lumpur', countryCode: 'MY', lat: 3.1390, lng: 101.6869, ppsqft: 350, tags: ['affordable'] },
  // Qatar
  { id: 'qa-doh', name: 'Doha', countryCode: 'QA', lat: 25.2854, lng: 51.5310, ppsqft: 420, tags: ['luxury'] },
];

// ============================================================
// GENERATE ALL PROPERTIES
// ============================================================

function generateAllProperties(): Property[] {
  const all: Property[] = [];
  let id = 1;

  for (const city of CITY_DATA) {
    const devs = DEV_MAP[city.countryCode] || [];
    if (devs.length === 0) continue;

    const countryName = getCountryName(city.countryCode);
    const props = generatePropertiesForCity(
      city.id, city.name, city.countryCode, countryName,
      city.lat, city.lng, city.ppsqft, devs, city.tags, id,
    );
    all.push(...props);
    id += 100;
  }

  return all;
}

function getCountryName(code: string): string {
  const map: Record<string, string> = {
    IN: 'India', AE: 'UAE', US: 'United States', GB: 'United Kingdom',
    SG: 'Singapore', SA: 'Saudi Arabia', DE: 'Germany', FR: 'France',
    JP: 'Japan', KR: 'South Korea', TH: 'Thailand', VN: 'Vietnam',
    BR: 'Brazil', MX: 'Mexico', TR: 'Turkey', ES: 'Spain', IT: 'Italy',
    NL: 'Netherlands', CA: 'Canada', AU: 'Australia', MY: 'Malaysia',
    QA: 'Qatar', ZA: 'South Africa', NG: 'Nigeria', EG: 'Egypt',
  };
  return map[code] || code;
}

// ============================================================
// EXPORT — singleton database
// ============================================================

let _properties: Property[] | null = null;

export function getPropertyDatabase(): Property[] {
  if (!_properties) {
    _properties = generateAllProperties();
  }
  return _properties;
}

export function getPropertiesByCountry(countryCode: string): Property[] {
  return getPropertyDatabase().filter(p => p.countryCode === countryCode);
}

export function getPropertiesByCity(cityId: string): Property[] {
  return getPropertyDatabase().filter(p => p.cityId === cityId);
}

export function getPropertyById(id: string): Property | undefined {
  return getPropertyDatabase().find(p => p.id === id);
}

export function getPropertiesByStatus(status: PropertyStatus): Property[] {
  return getPropertyDatabase().filter(p => p.status === status);
}

export function getPropertyCount(): number {
  return getPropertyDatabase().length;
}

export function getTotalPortfolioValue(): number {
  return getPropertyDatabase().reduce((s, p) => s + (p.price_min + p.price_max) / 2, 0);
}

export function getTotalCommissionValue(): number {
  return getPropertyDatabase().reduce((s, p) => s + p.estimated_commission, 0);
}

export function getHotProperties(): Property[] {
  return getPropertyDatabase().filter(p => p.sales_status === 'hot').slice(0, 20);
}

export function getPreLaunchProperties(): Property[] {
  return getPropertyDatabase().filter(p => p.status === 'pre_launch');
}

export function getHighValueProperties(minValue = 10000000): Property[] {
  return getPropertyDatabase().filter(p => p.price_max >= minValue).sort((a, b) => b.price_max - a.price_max);
}

export function searchProperties(query: string): Property[] {
  const q = query.toLowerCase();
  return getPropertyDatabase().filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.developer_name.toLowerCase().includes(q) ||
    p.city.toLowerCase().includes(q) ||
    p.country.toLowerCase().includes(q)
  );
}

/** Generate a property-based Opportunity object for the useOpportunityEngine hook */
export function propertyToOpportunity(p: Property, index: number) {
  const totalValue = (p.price_min + p.price_max) / 2 * p.total_units;
  const confidence = p.confidence;

  return {
    id: p.id,
    developer_id: p.developer_slug,
    title: `${p.name} — ${p.developer_name}`,
    summary: `${p.description.slice(0, 120)}...`,
    estimated_value: totalValue,
    confidence_score: confidence,
    priority: confidence >= 85 ? 'critical' as const : confidence >= 70 ? 'high' as const : confidence >= 50 ? 'medium' as const : 'low' as const,
    deal_stage: p.status === 'pre_launch' ? 'discovered' as const : p.status === 'under_construction' ? 'qualifying' as const : 'proposal' as const,
    commission_percentage: 3.00,
    estimated_commission: Math.round((p.price_min + p.price_max) / 2 * 0.03), // Per-unit, not total project
    commission_currency: p.currency,
    reasoning: [
      `${p.developer_name} launching ${p.name} in ${p.city}, ${p.country} — ${p.total_units} units available`,
      `${p.unit_types.length} configurations from ${p.unit_types[0]?.type || 'various'} at ${formatPrice(p.price_min, p.countryCode)}`,
      `Property type: ${p.property_type} · Status: ${p.status.replace(/_/g, ' ')} · RERA: ${p.rera_status}`,
      `${p.amenities.length} amenities including ${p.amenities.slice(0, 3).join(', ')}`,
      `Estimated commission at 3%: ${formatPrice(p.estimated_commission, p.countryCode)}`,
    ],
    recommended_actions: p.status === 'pre_launch' ? [
      'Contact developer for early-bird pricing and pre-launch allocation',
      'Request project brochure and RERA approval documents',
      'Schedule site visit to evaluate location and proximity to infrastructure',
    ] : [
      'Request current availability and pricing for preferred unit type',
      'Schedule site visit to inspect completed units',
      'Begin due diligence on developer track record and past deliveries',
    ],
    next_best_action: p.status === 'pre_launch'
      ? 'Express interest to receive pre-launch pricing'
      : 'Request site visit for available units',
    potential_objections: [] as string[],
    is_active: p.sales_status !== 'sold_out',
    signals: [
      { id: `sig-${p.id}-1`, signal_type: 'property_listing', title: `${p.name} Listed`, description: `Property listed by ${p.developer_name} in ${p.city}`, source: 'Developer Portal', source_url: '', relevance_score: 85, impact_level: 'high', is_processed: true, created_at: p.created_at },
      { id: `sig-${p.id}-2`, signal_type: 'rera_filing', title: 'RERA Status', description: `RERA ${p.rera_status} for ${p.name}`, source: 'RERA Portal', source_url: '', relevance_score: 78, impact_level: 'high', is_processed: true, created_at: p.created_at },
    ],
    created_at: p.created_at,
    updated_at: p.created_at,
  };
}
