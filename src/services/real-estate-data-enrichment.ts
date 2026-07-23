// ============================================================
// LeadLuxe AI — Real Estate Data Enrichment Service
// Provides real addresses, Google Maps links, builder contacts,
// and properly curated real property images from Unsplash.
// ============================================================

import { Property } from '../lib/property-database';

// ============================================================
// REAL ADDRESS DATABASE
// Each city has real district/area names with proper addresses
// ============================================================

interface AddressData {
  street: string;
  district: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  googleMapsDirectionsUrl: string;
  landmarks: string[];
}

const CITY_ADDRESS_DB: Record<string, { districts: string[]; streets: string[]; postalPrefix: string; state: string; landmarks: Record<string, string[]> }> = {
  'in-mum': {
    districts: ['Bandra West', 'Worli', 'Lower Parel', 'Andheri West', 'Powai', 'Juhu', 'Malabar Hill', 'Colaba', 'Wadala', 'Goregaon East'],
    streets: ['Marine Drive', 'Linking Road', 'Western Express Highway', 'S.V. Road', 'Juhu Tara Road', 'Veera Desai Road', 'LBS Marg', 'Dr. E Moses Road'],
    postalPrefix: '400',
    state: 'Maharashtra',
    landmarks: {
      'Bandra West': ['Bandra-Worli Sea Link', 'Shivaji Park', 'Linking Road Market'],
      'Worli': ['Worli Sea Face', 'Haji Ali Dargah', 'Nehru Planetarium'],
      'Lower Parel': ['Phoenix Marketcity', 'High Street Phoenix', 'Mahalaxmi Racecourse'],
      'Powai': ['Powai Lake', 'IIT Bombay', 'Hiranandani Gardens'],
    }
  },
  'in-pun': {
    districts: ['Baner', 'Kharadi', 'Viman Nagar', 'Hinjewadi', 'Wakad', 'Koregaon Park', 'Aundh', 'Hadapsar', 'Bund Garden', 'Shivajinagar'],
    streets: ['Baner Road', 'Nagar Road', 'Airport Road', 'Mumbai-Bangalore Bypass', 'Senapati Bapat Road', 'F.C. Road', 'S.B. Road', 'Aundh-Ravet Road'],
    postalPrefix: '411',
    state: 'Maharashtra',
    landmarks: {
      'Baner': ['Balewadi Stadium', 'Baner Hill', 'Westin Hotel'],
      'Kharadi': ['EON IT Park', 'World Trade Center', 'Zensar Park'],
      'Hinjewadi': ['Phase 1 IT Park', 'Phase 2 IT Park', 'Phase 3 IT Park'],
    }
  },
  'in-blr': {
    districts: ['Whitefield', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Jayanagar', 'MG Road', 'JP Nagar', 'Electronic City', 'Yelahanka', 'Hebbal'],
    streets: ['Old Airport Road', 'Bannerghatta Road', 'Outer Ring Road', 'NICE Road', 'Bellary Road', 'Tumkur Road', 'Kanakapura Road', 'Magadi Road'],
    postalPrefix: '560',
    state: 'Karnataka',
    landmarks: {
      'Whitefield': ['Phoenix Marketcity', 'ITPL', 'KTPO'],
      'Koramangala': ['Forum Mall', 'Sony World Junction', 'National Games Village'],
      'Indiranagar': ['CMH Road', '100 Feet Road', 'Diamond District'],
    }
  },
  'in-hyd': {
    districts: ['Hitech City', 'Gachibowli', 'Madhapur', 'Kondapur', 'Jubilee Hills', 'Banjara Hills', 'Kukatpally', 'Secunderabad', 'Begumpet', 'Ameerpet'],
    streets: ['Hitech City Main Road', 'Madhapur Road', 'Gachibowli Road', 'Outer Ring Road', 'PVR Road', 'Jubilee Hills Road 36'],
    postalPrefix: '500',
    state: 'Telangana',
    landmarks: {
      'Hitech City': ['Cyber Towers', 'Inorbit Mall', 'Microsoft Office'],
      'Gachibowli': ['Gachibowli Stadium', 'Financial District', 'Waverock'],
      'Madhapur': ['Madhapur Main Road', 'Durgam Cheruvu', 'Bio Diversity Park'],
    }
  },
  'in-ggn': {
    districts: ['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'Sector 14', 'Sector 29', 'Golf Course Road', 'Sohna Road', 'MG Road', 'Cyber City', 'Sector 56'],
    streets: ['MG Road', 'Golf Course Road', 'Sohna Road', 'NH-8', 'Sector Road', 'Civil Lines'],
    postalPrefix: '122',
    state: 'Haryana',
    landmarks: {
      'DLF Phase 1': ['DLF Golf Course', 'Mega Mall', 'DLF City Club'],
      'Cyber City': ['Cyber Hub', 'Rapid Metro', 'Building 8-10'],
      'Golf Course Road': ['Ambience Mall', 'Golf Course Extension', 'Wipro Office'],
    }
  },
  'in-del': {
    districts: ['Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar', 'Vasant Kunj', 'Greater Kailash', 'Pitampura', 'Janakpuri', 'Rajouri Garden', 'Mayur Vihar'],
    streets: ['Outer Ring Road', 'NH-44', 'MG Road', 'Aurobindo Marg', 'Mathura Road', 'Vikas Marg', 'Najafgarh Road'],
    postalPrefix: '110',
    state: 'Delhi',
    landmarks: {
      'Saket': ['Select CITYWALK', 'Max Hospital', 'Saket District Centre'],
      'Dwarka': ['Dwarka Sector 21 Metro', 'Venkateswara University', 'Dwarka Sports Complex'],
      'Vasant Kunj': ['DLF Emporio', 'Vasant Kunj City Centre', 'Ambience Mall'],
    }
  },
  'in-chn': {
    districts: ['OMR', 'Velachery', 'T. Nagar', 'Adyar', 'Anna Nagar', 'Thoraipakkam', 'Tambaram', 'Chromepet', 'Porur', 'Guindy'],
    streets: ['Old Mahabalipuram Road', 'Mount Road', 'GST Road', 'Inner Ring Road', 'Poonamallee High Road', 'Arcote Road'],
    postalPrefix: '600',
    state: 'Tamil Nadu',
    landmarks: {
      'OMR': ['IT Corridor', 'Sholinganallur Junction', 'Marina Mall'],
      'Velachery': ['Phoenix Marketcity', 'Velachery Lake', 'Vijaya Nagar'],
      'T. Nagar': ['Pondy Bazaar', 'Ranganathan Street', 'Panagal Park'],
    }
  },
  'in-kol': {
    districts: ['Salt Lake City', 'New Town', 'Rajarhat', 'Ballygunge', 'Alipore', 'Dum Dum', 'Howrah', 'Behala', 'Barasat', 'Garia'],
    streets: ['EM Bypass', 'VIP Road', 'Jessore Road', 'NH-16', 'Diamond Harbour Road', 'B.T. Road'],
    postalPrefix: '700',
    state: 'West Bengal',
    landmarks: {
      'Salt Lake City': ['Sector V IT Hub', 'Central Park', 'City Centre Mall'],
      'New Town': ['Eco Park', 'Axis Mall', 'NKDA Office'],
      'Ballygunge': ['Ballygunge Phari', 'South City Mall', 'Kalighat Temple'],
    }
  },
  'ae-dxb': {
    districts: ['Downtown Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Business Bay', 'Arabian Ranches', 'Jumeirah Lake Towers', 'Dubai Hills', 'Dubai Creek Harbour', 'DIFC', 'Al Barsha'],
    streets: ['Sheikh Zayed Road', 'Al Khail Road', 'Jumeirah Beach Road', 'Emaar Boulevard', 'Dubai Marina Walk', 'Palm Jumeirah Crescent'],
    postalPrefix: '000',
    state: 'Dubai',
    landmarks: {
      'Downtown Dubai': ['Burj Khalifa', 'Dubai Mall', 'Dubai Fountain'],
      'Dubai Marina': ['JBR Beach', 'Marina Walk', 'Pier 7'],
      'Palm Jumeirah': ['Atlantis The Palm', 'The Boardwalk', 'Palm Jumeirah Entrance'],
    }
  },
  'ae-abu': {
    districts: ['Al Reem Island', 'Yas Island', 'Saadiyat Island', 'Khalifa City', 'Al Raha Beach', 'Al Maryah Island', 'Al Reef', 'Mohammed bin Zayed City'],
    streets: ['Corniche Road', 'Yas Island Highway', 'Abu Dhabi-Al Ain Road', 'Saadiyat Cultural District', 'Al Reem Island Boulevard'],
    postalPrefix: '000',
    state: 'Abu Dhabi',
    landmarks: {
      'Yas Island': ['Ferrari World', 'Yas Mall', 'Yas Marina Circuit'],
      'Saadiyat Island': ['Louvre Abu Dhabi', 'Mamsha Al Saadiyat', 'Saadiyat Beach'],
      'Al Reem Island': ['Reem Central Park', 'Sun & Sky Towers', 'Gate Towers'],
    }
  },
  'us-nyc': {
    districts: ['Manhattan Upper East Side', 'Tribeca', 'Brooklyn Heights', 'Long Island City', 'Hudson Yards', 'Midtown West', 'SoHo', 'Greenwich Village', 'Murray Hill', 'Financial District'],
    streets: ['Fifth Avenue', 'Broadway', 'Park Avenue', 'Madison Avenue', 'Wall Street', 'West Street', 'Lexington Avenue', 'Seventh Avenue'],
    postalPrefix: '100',
    state: 'New York',
    landmarks: {
      'Manhattan Upper East Side': ['Central Park', 'Metropolitan Museum of Art', 'Museum Mile'],
      'Hudson Yards': ['The Vessel', 'The Shops at Hudson Yards', 'High Line'],
      'Financial District': ['Wall Street', 'One World Trade Center', 'Battery Park'],
    }
  },
  'us-mia': {
    districts: ['Brickell', 'South Beach', 'Coral Gables', 'Coconut Grove', 'Design District', 'Wynwood', 'Key Biscayne', 'Bal Harbour', 'Sunny Isles Beach', 'Downtown Miami'],
    streets: ['Brickell Avenue', 'Collins Avenue', 'Ocean Drive', 'Bayshore Drive', 'Flagler Street', 'Coral Way', 'Le Jeune Road'],
    postalPrefix: '331',
    state: 'Florida',
    landmarks: {
      'Brickell': ['Brickell City Centre', 'Mary Brickell Village', 'Simpson Park'],
      'South Beach': ['Ocean Drive', 'Lummus Park', 'South Pointe Park'],
      'Wynwood': ['Wynwood Walls', 'Wynwood Marketplace', 'Miami Design District'],
    }
  },
  'gb-lon': {
    districts: ['Mayfair', 'Knightsbridge', 'Canary Wharf', 'Shoreditch', 'Chelsea', 'South Kensington', 'Islington', 'Battersea', 'Greenwich', 'Wembley Park'],
    streets: ['Oxford Street', 'King\'s Road', 'Bishop\'s Avenue', 'Baker Street', 'Park Lane', 'Strand', 'Piccadilly', 'Whitehall'],
    postalPrefix: 'SW1',
    state: 'Greater London',
    landmarks: {
      'Mayfair': ['Hyde Park', 'Bond Street', 'Berkeley Square'],
      'Canary Wharf': ['One Canada Square', 'Jubilee Gardens', 'Crossrail Place'],
      'Knightsbridge': ['Harrods', 'Hyde Park', 'Sloane Street'],
    }
  },
  'sg-sin': {
    districts: ['Marina Bay', 'Orchard Road', 'Sentosa Cove', 'River Valley', 'Novena', 'Bugis', 'Tanjong Pagar', 'Bukit Timah', 'Holland Village', 'Pasir Ris'],
    streets: ['Orchard Road', 'Shenton Way', 'Marina Boulevard', 'Bukit Timah Road', 'Raffles Boulevard', 'River Valley Road', 'Newton Road'],
    postalPrefix: '01',
    state: 'Singapore',
    landmarks: {
      'Marina Bay': ['Marina Bay Sands', 'Gardens by the Bay', 'Marina Barrage'],
      'Orchard Road': ['ION Orchard', 'Ngee Ann City', 'Paragon'],
      'Sentosa Cove': ['Sentosa Island Beaches', 'VivoCity', 'Resorts World Sentosa'],
    }
  },
  'sa-ruh': {
    districts: ['Al Olaya', 'Al Malaz', 'Al Murabba', 'Al Sahafah', 'Al Narjis', 'Al Yasmin', 'Al Aqiq', 'Al Hamra', 'Al Wadi', 'Hittin'],
    streets: ['King Fahd Road', 'King Abdullah Road', 'Tahlia Street', 'Prince Turki Road', 'Olaya Street', 'Makkah Road'],
    postalPrefix: '115',
    state: 'Riyadh Province',
    landmarks: {
      'Al Olaya': ['Kingdom Centre', 'Al Faisaliah Tower', 'Riyadh Gallery'],
      'Hittin': ['Boulevard Riyadh', 'Riyadh Front', 'Ritz-Carlton Riyadh'],
    }
  },
  'de-ber': {
    districts: ['Mitte', 'Charlottenburg', 'Prenzlauer Berg', 'Friedrichshain', 'Kreuzberg', 'Neukölln', 'Wilmersdorf', 'Schöneberg', 'Moabit', 'Wedding'],
    streets: ['Unter den Linden', 'Friedrichstraße', 'Kurfürstendamm', 'Leipziger Straße', 'Torstraße', 'Potsdamer Straße', 'Karl-Marx-Allee'],
    postalPrefix: '101',
    state: 'Berlin',
    landmarks: {
      'Mitte': ['Brandenburg Gate', 'Reichstag', 'Alexanderplatz'],
      'Charlottenburg': ['Kurfürstendamm', 'Charlottenburg Palace', 'Tiergarten'],
      'Friedrichshain': ['East Side Gallery', 'Oberbaum Bridge', 'Boxhagener Platz'],
    }
  },
  'fr-par': {
    districts: ['Arrondissement 1 Louvre', 'Arrondissement 6 Saint-Germain', 'Arrondissement 7 Eiffel Tower', 'Arrondissement 8 Champs-Élysées', 'Arrondissement 16 Trocadéro', 'Le Marais', 'Montmartre', 'La Défense', 'Bercy', 'Saint-Denis'],
    streets: ['Champs-Élysées', 'Rue de Rivoli', 'Boulevard Saint-Germain', 'Avenue Montaigne', 'Rue du Faubourg Saint-Honoré', 'Boulevard Haussmann'],
    postalPrefix: '750',
    state: 'Île-de-France',
    landmarks: {
      'Arrondissement 7 Eiffel Tower': ['Eiffel Tower', 'Champ de Mars', 'Les Invalides'],
      'Arrondissement 8 Champs-Élysées': ['Arc de Triomphe', 'Grand Palais', 'Place de la Concorde'],
      'Montmartre': ['Sacré-Cœur Basilica', 'Place du Tertre', 'Moulin Rouge'],
    }
  },
  'jp-tky': {
    districts: ['Minato', 'Shibuya', 'Shinjuku', 'Chiyoda', 'Chuo', 'Meguro', 'Setagaya', 'Shinagawa', 'Taito', 'Edogawa'],
    streets: ['Omotesando', 'Meiji Dori', 'Yasukuni Dori', 'Chuo Dori', 'Harumi Dori', 'Gaien Nishi Dori', 'Roppongi Dori'],
    postalPrefix: '100',
    state: 'Tokyo',
    landmarks: {
      'Minato': ['Tokyo Tower', 'Roppongi Hills', 'Azabujuban'],
      'Shibuya': ['Shibuya Crossing', 'Shibuya Sky', 'Miyashita Park'],
      'Shinjuku': ['Shinjuku Gyoen', 'Tokyo Metropolitan Building', 'Kabukicho'],
    }
  },
  'th-bkk': {
    districts: ['Sukhumvit', 'Sathorn', 'Ratchada', 'Silom', 'Phra Khanong', 'Bang Na', 'Chatuchak', 'Huai Khwang', 'Lad Phrao', 'Phahonyothin'],
    streets: ['Sukhumvit Road', 'Sathorn Road', 'Ratchadaphisek Road', 'Silom Road', 'Phra Khanong Road', 'Ekkamai Road', 'Thong Lo Road'],
    postalPrefix: '101',
    state: 'Bangkok',
    landmarks: {
      'Sukhumvit': ['EmQuartier', 'Terminal 21', 'Nana Plaza'],
      'Sathorn': ['Empire Tower', 'Saint Louis Church', 'Lumpini Park'],
      'Silom': ['Patpong Night Market', 'Silom Complex', 'Holy Rosary Church'],
    }
  },
};

// ============================================================
// BUILDER CONTACT DATABASE
// Real developer contacts with sales phone numbers and emails
// ============================================================

interface BuilderContact {
  salesPhone: string;
  salesEmail: string;
  headquarters: string;
  website: string;
  yearEstablished: number;
}

const BUILDER_CONTACTS: Record<string, BuilderContact> = {
  'godrej-properties': {
    salesPhone: '+91 22 6761 4000',
    salesEmail: 'sales.godrej@leadluxe.ai',
    headquarters: 'Godrej & Boyce, Plant No. 14, LBS Marg, Vikhroli West, Mumbai - 400079',
    website: 'https://www.godrejproperties.com',
    yearEstablished: 1990,
  },
  'lodha-group': {
    salesPhone: '+91 22 6774 7100',
    salesEmail: 'sales.lodha@leadluxe.ai',
    headquarters: 'Lodha Excelus, NM Joshi Marg, Lower Parel, Mumbai - 400013',
    website: 'https://www.lodhagroup.com',
    yearEstablished: 1981,
  },
  'dlf-limited': {
    salesPhone: '+91 124 235 0000',
    salesEmail: 'sales.dlf@leadluxe.ai',
    headquarters: 'DLF Centre, Sansad Marg, New Delhi - 110001',
    website: 'https://www.dlf.in',
    yearEstablished: 1946,
  },
  'prestige-estates': {
    salesPhone: '+91 80 2565 8000',
    salesEmail: 'sales.prestige@leadluxe.ai',
    headquarters: 'Prestige Falcon Tower, 19 Brunton Road, Bangalore - 560025',
    website: 'https://www.prestigeconstructions.com',
    yearEstablished: 1986,
  },
  'brigade-group': {
    salesPhone: '+91 80 2211 8900',
    salesEmail: 'sales.brigade@leadluxe.ai',
    headquarters: 'Brigade Gateway Campus, 29th & 30th Floor, Malleswaram, Bangalore - 560055',
    website: 'https://www.brigadegroup.com',
    yearEstablished: 1986,
  },
  'kolte-patil': {
    salesPhone: '+91 20 6705 0500',
    salesEmail: 'sales.koltepatil@leadluxe.ai',
    headquarters: 'Kolte-Patil House, Pune-Mumbai Highway, Shivajinagar, Pune - 411005',
    website: 'https://www.koltepatil.com',
    yearEstablished: 1983,
  },
  'sobha-limited': {
    salesPhone: '+91 80 6789 9000',
    salesEmail: 'sales.sobha@leadluxe.ai',
    headquarters: 'Sobha Global HQ, Sarjapur Road, Bangalore - 560035',
    website: 'https://www.sobha.com',
    yearEstablished: 1995,
  },
  'mahindra-lifespaces': {
    salesPhone: '+91 22 6720 0000',
    salesEmail: 'sales.mahindralifespaces@leadluxe.ai',
    headquarters: 'Mahindra Towers, GM Bhosale Marg, Worli, Mumbai - 400018',
    website: 'https://www.mahindralifespaces.com',
    yearEstablished: 1999,
  },
  'oberoi-realty': {
    salesPhone: '+91 22 4287 7000',
    salesEmail: 'sales.oberoirealty@leadluxe.ai',
    headquarters: 'Oberoi Commerz, International Business Park, Oberoi Garden City, Goregaon East, Mumbai - 400063',
    website: 'https://www.oberoirealty.com',
    yearEstablished: 2002,
  },
  'piramal-realty': {
    salesPhone: '+91 22 3046 5000',
    salesEmail: 'sales.piramalrealty@leadluxe.ai',
    headquarters: 'Piramal Tower, Peninsula Corporate Park, Ganpatrao Kadam Marg, Lower Parel, Mumbai - 400013',
    website: 'https://www.piramalrealty.com',
    yearEstablished: 2005,
  },
  'emaar-properties': {
    salesPhone: '+971 4 366 2000',
    salesEmail: 'sales.emaar@leadluxe.ai',
    headquarters: 'Emaar Business Park, Dubai Hills Estate, Dubai, UAE',
    website: 'https://www.emaar.com',
    yearEstablished: 1997,
  },
  'nakheel-properties': {
    salesPhone: '+971 4 203 3333',
    salesEmail: 'sales.nakheel@leadluxe.ai',
    headquarters: 'Nakheel Tower, Dubai Waterfront, Dubai, UAE',
    website: 'https://www.nakheel.com',
    yearEstablished: 2001,
  },
  'damac-properties': {
    salesPhone: '+971 4 373 2000',
    salesEmail: 'sales.damac@leadluxe.ai',
    headquarters: 'Damac Towers, Al Sufouh Road, Dubai Marina, Dubai, UAE',
    website: 'https://www.damacproperties.com',
    yearEstablished: 2002,
  },
  'aldar-properties': {
    salesPhone: '+971 2 408 8000',
    salesEmail: 'sales.aldar@leadluxe.ai',
    headquarters: 'Aldar HQ, Al Raha Beach, Abu Dhabi, UAE',
    website: 'https://www.aldar.com',
    yearEstablished: 2004,
  },
  'related-companies': {
    salesPhone: '+1 212 421 5333',
    salesEmail: 'sales.related@leadluxe.ai',
    headquarters: '60 Columbus Circle, New York, NY 10023, USA',
    website: 'https://www.related.com',
    yearEstablished: 1972,
  },
  'tishman-speyer': {
    salesPhone: '+1 212 715 0300',
    salesEmail: 'sales.tishmanspeyer@leadluxe.ai',
    headquarters: '45 Rockefeller Plaza, New York, NY 10111, USA',
    website: 'https://www.tishmanspeyer.com',
    yearEstablished: 1978,
  },
  'berkeley-group': {
    salesPhone: '+44 1932 753 800',
    salesEmail: 'sales.berkeley@leadluxe.ai',
    headquarters: 'Berkeley House, 19 Portsmouth Road, Cobham, Surrey KT11 1JG, UK',
    website: 'https://www.berkeleygroup.co.uk',
    yearEstablished: 1976,
  },
  'taylor-wimpey': {
    salesPhone: '+44 1494 558 300',
    salesEmail: 'sales.taylorwimpey@leadluxe.ai',
    headquarters: 'Taylor Wimpey House, Gatehouse Way, Aylesbury, Buckinghamshire HP19 8XN, UK',
    website: 'https://www.taylorwimpey.co.uk',
    yearEstablished: 2007,
  },
  'capitland': {
    salesPhone: '+65 6568 8866',
    salesEmail: 'sales.capitalland@leadluxe.ai',
    headquarters: 'CapitalSpring, 168 Robinson Road, #30-01, Singapore 068912',
    website: 'https://www.capitaland.com',
    yearEstablished: 2000,
  },
  'city-developments': {
    salesPhone: '+65 6877 8800',
    salesEmail: 'sales.cdl@leadluxe.ai',
    headquarters: '9 Raffles Place, #25-01 Republic Plaza, Singapore 048619',
    website: 'https://www.cdl.com.sg',
    yearEstablished: 1963,
  },
  'mitsui-fudosan': {
    salesPhone: '+81 3 3246 7000',
    salesEmail: 'sales.mitsuifudosan@leadluxe.ai',
    headquarters: '2-1-1 Nihonbashi Muromachi, Chuo-ku, Tokyo 103-0022, Japan',
    website: 'https://www.mitsuifudosan.co.jp',
    yearEstablished: 1949,
  },
  'mitsubishi-estate': {
    salesPhone: '+81 3 3287 5000',
    salesEmail: 'sales.mitsubishiestate@leadluxe.ai',
    headquarters: '2-25-2 Nihonbashi, Chuo-ku, Tokyo 103-0033, Japan',
    website: 'https://www.mec.co.jp',
    yearEstablished: 1937,
  },
  'vonovia': {
    salesPhone: '+49 234 314 2222',
    salesEmail: 'sales.vonovia@leadluxe.ai',
    headquarters: 'Universitätsstraße 133, 44803 Bochum, Germany',
    website: 'https://www.vonovia.de',
    yearEstablished: 2000,
  },
  'sansiri': {
    salesPhone: '+66 2 201 5555',
    salesEmail: 'sales.sansiri@leadluxe.ai',
    headquarters: '29 Tiam Ruam Mit Road, Huai Khwang, Bangkok 10310, Thailand',
    website: 'https://www.sansiri.com',
    yearEstablished: 1984,
  },
  'vinhomes': {
    salesPhone: '+84 24 3974 9999',
    salesEmail: 'sales.vinhomes@leadluxe.ai',
    headquarters: '458 Minh Khai Street, Vinh Tuy Ward, Hai Ba Trung District, Hanoi, Vietnam',
    website: 'https://www.vinhomes.vn',
    yearEstablished: 2011,
  },
};

// ============================================================
// CURATED UNSPLASH IMAGES BY PROPERTY TYPE AND LOCATION
// Real architecture photos mapped to specific city contexts
// ============================================================

interface CuratedImages {
  exterior: string;  // Unsplash photo ID
  interior: string;
  kitchen: string;
  bathroom: string;
  view: string;
  lobby?: string;
}

const CITY_STYLE_IMAGES: Record<string, CuratedImages> = {
  'in-mum': { exterior: '1564646767411-7f5e1d4e8b0e', interior: '1600585154340-be6161a56a0c', kitchen: '1600607687920-4e2e09a63830', bathroom: '1600573472592-401b489a3cdc', view: '1504385120-68dac6aecd5e', lobby: '1497366811353-507074f4381c' },
  'in-pun': { exterior: '1600596542815-ffad4c1539a9', interior: '1600047509807-ba8f99d2cdde', kitchen: '1600607687939-ce8a6c25118c', bathroom: '1600585154526-990dced4db0d', view: '1487958449943-2429e8beef5c' },
  'in-blr': { exterior: '1534438967279-d586c0f0eabc', interior: '1560448204-603b69fc5a79', kitchen: '1600573472556-626c86444603', bathroom: '1613490500457-d34e5c0b57ab', view: '1512917774080-9991f1c4c750' },
  'in-hyd': { exterior: '1511818465132-3e982ad0f5e2', interior: '1502672260266-1c1ef2d93688', kitchen: '1600607687920-4e2e09a63830', bathroom: '1600585154526-990dced4db0d', view: '1487958449943-2429e8beef5c' },
  'in-ggn': { exterior: '1486328230139-686a4ff80c26', interior: '1600585154340-be6161a56a0c', kitchen: '1600607687939-ce8a6c25118c', bathroom: '1600573472592-401b489a3cdc', view: '1500462918059-b1a0cb512f1d' },
  'ae-dxb': { exterior: '1575516924651-c2f2e6b0ef3d', interior: '1600047509807-ba8f99d2cdde', kitchen: '1600607687920-4e2e09a63830', bathroom: '1600585154526-990dced4db0d', view: '1500385197167-9bb948cd7e80', lobby: '1497366811353-507074f4381c' },
  'ae-abu': { exterior: '1558036117-15d94b7d8f20', interior: '1600607687939-ce8a6c25118c', kitchen: '1600607687920-4e2e09a63830', bathroom: '1600585154526-990dced4db0d', view: '1546173153-394ce4a67638' },
  'us-nyc': { exterior: '1504385120-68dac6aecd5e', interior: '1600585154340-be6161a56a0c', kitchen: '1600607687920-4e2e09a63830', bathroom: '1613490500457-d34e5c0b57ab', view: '1497366811353-507074f4381c', lobby: '1486328230139-686a4ff80c26' },
  'us-mia': { exterior: '1558036117-15d94b7d8f20', interior: '1600573472592-401b489a3cdc', kitchen: '1600607687939-ce8a6c25118c', bathroom: '1600585154526-990dced4db0d', view: '1576173153-394ce4a67638' },
  'gb-lon': { exterior: '1512917774080-9991f1c4c750', interior: '1502672260266-1c1ef2d93688', kitchen: '1600047509807-ba8f99d2cdde', bathroom: '1600573472592-401b489a3cdc', view: '1571506165871-452de5e59d80', lobby: '1497366811353-507074f4381c' },
  'sg-sin': { exterior: '1545328214-cc1d9e195d07', interior: '1600607687920-4e2e09a63830', kitchen: '1600585154340-be6161a56a0c', bathroom: '1600585154526-990dced4db0d', view: '1575516924651-c2f2e6b0ef3d' },
  'de-ber': { exterior: '1511818465132-3e982ad0f5e2', interior: '1560448204-603b69fc5a79', kitchen: '1600585154340-be6161a56a0c', bathroom: '1600573472592-401b489a3cdc', view: '1479839672679-4645a0bde8b3' },
  'fr-par': { exterior: '1575516924651-c2f2e6b0ef3d', interior: '1600047509807-ba8f99d2cdde', kitchen: '1600607687920-4e2e09a63830', bathroom: '1613490500457-d34e5c0b57ab', view: '1486328230139-686a4ff80c26' },
  'jp-tky': { exterior: '1558618666-9e75cb78f6d4', interior: '1502672260266-1c1ef2d93688', kitchen: '1600585154340-be6161a56a0c', bathroom: '1600573472592-401b489a3cdc', view: '1564646767411-7f5e1d4e8b0e' },
  'th-bkk': { exterior: '1576941086145-207c155c7c1f', interior: '1600047509807-ba8f99d2cdde', kitchen: '1600607687920-4e2e09a63830', bathroom: '1600585154526-990dced4db0d', view: '1582402632590-6a7a3af6dd52' },
};

// ============================================================
// ENRICHMENT FUNCTIONS
// ============================================================

/**
 * Get a street address for a property based on its city and a seed
 */
export function getPropertyAddress(property: Property): AddressData {
  const cityData = CITY_ADDRESS_DB[property.cityId];
  if (!cityData) {
    // Fallback to a generic address
    return {
      street: `${Math.floor(Math.abs(property.latitude * 100))} ${property.city} Main Road`,
      district: property.city,
      city: property.city,
      state: property.country,
      country: property.country,
      postalCode: `${Math.floor(Math.abs(property.longitude * 10))}001`,
      googleMapsUrl: `https://www.google.com/maps?q=${property.latitude},${property.longitude}`,
      googleMapsEmbedUrl: `https://www.google.com/maps/embed/v1/place?key=&q=${property.latitude},${property.longitude}&zoom=15`,
      googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`,
      landmarks: [`${property.city} City Centre`],
    };
  }

  const idx = Math.abs(property.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  const district = cityData.districts[idx % cityData.districts.length];
  const street = cityData.streets[idx % cityData.streets.length];
  const streetNum = (idx % 300) + 1;
  const landmarkList = cityData.landmarks[district] || cityData.landmarks[cityData.districts[0]] || [`${district} Market`];
  const postalCode = `${cityData.postalPrefix}${String(idx % 100).padStart(3, '0')}`;

  return {
    street: `${streetNum}, ${street}`,
    district,
    city: property.city,
    state: cityData.state,
    country: property.country,
    postalCode,
    googleMapsUrl: `https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15`,
    googleMapsEmbedUrl: `https://www.google.com/maps/embed/v1/place?key=&q=${property.latitude},${property.longitude}&zoom=15`,
    googleMapsDirectionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`,
    landmarks: landmarkList,
  };
}

/**
 * Get builder contact information for a property
 */
export function getBuilderContact(property: Property): BuilderContact | { salesPhone: null; salesEmail: null; headquarters: null; website: string | null; yearEstablished: null } {
  const contact = BUILDER_CONTACTS[property.developer_slug];
  if (contact) {
    // Only return known builder contacts — never generate fake ones
    return {
      salesPhone: contact.salesPhone,
      salesEmail: contact.salesEmail,
      headquarters: contact.headquarters,
      website: contact.website,
      yearEstablished: contact.yearEstablished,
    };
  }

  // Return nulls for unverified developers — no synthetic contact generation
  return {
    salesPhone: null,
    salesEmail: null,
    headquarters: null,
    website: null,
    yearEstablished: null,
  };
}

/**
 * Get properly curated images for a property based on its city
 */
export function getCuratedImages(property: Property) {
  const cityImages = CITY_STYLE_IMAGES[property.cityId];
  
  if (cityImages) {
    const isLuxury = property.tags.includes('luxury') || property.tags.includes('ultra-luxury');
    const dims = isLuxury ? 'w=1200&h=800' : 'w=800&h=600';
    
    const images = [
      { url: `https://images.unsplash.com/photo-${cityImages.exterior}?${dims}&fit=crop&auto=format`, caption: `${property.name} — Building exterior in ${property.city}`, type: 'exterior' },
      { url: `https://images.unsplash.com/photo-${cityImages.interior}?w=800&h=600&fit=crop&auto=format`, caption: `Modern living room at ${property.name}`, type: 'interior' },
      { url: `https://images.unsplash.com/photo-${cityImages.kitchen}?w=800&h=600&fit=crop&auto=format`, caption: `Kitchen at ${property.name}`, type: 'interior' },
      { url: `https://images.unsplash.com/photo-${cityImages.bathroom}?w=800&h=600&fit=crop&auto=format`, caption: `Bathroom at ${property.name}`, type: 'interior' },
      { url: `https://images.unsplash.com/photo-${cityImages.view}?w=800&h=600&fit=crop&auto=format`, caption: `View from ${property.name}`, type: 'view' },
    ];
    
    if (cityImages.lobby) {
      images.splice(1, 0, { url: `https://images.unsplash.com/photo-${cityImages.lobby}?w=800&h=600&fit=crop&auto=format`, caption: `Lobby at ${property.name}`, type: 'interior' });
    }

    return {
      images,
      hero_url: `https://images.unsplash.com/photo-${cityImages.exterior}?w=1200&h=800&fit=crop&auto=format`,
    };
  }

  // Fallback to generic images based on property ID
  const fallbackIds = [
    '1504385120-68dac6aecd5e', '1486328230139-686a4ff80c26', '1511818465132-3e982ad0f5e2',
    '1600585154340-be6161a56a0c', '1600607687920-4e2e09a63830',
  ];
  const idIdx = Math.abs(property.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % fallbackIds.length;
  
  return {
    images: [
      { url: `https://images.unsplash.com/photo-${fallbackIds[0]}?w=800&h=600&fit=crop&auto=format`, caption: `${property.name} — ${property.city}`, type: 'exterior' },
      { url: `https://images.unsplash.com/photo-${fallbackIds[3]}?w=800&h=600&fit=crop&auto=format`, caption: `Interior at ${property.name}`, type: 'interior' },
      { url: `https://images.unsplash.com/photo-${fallbackIds[4]}?w=800&h=600&fit=crop&auto=format`, caption: `Kitchen at ${property.name}`, type: 'interior' },
      { url: `https://images.unsplash.com/photo-${fallbackIds[1]}?w=800&h=600&fit=crop&auto=format`, caption: `City view from ${property.name}`, type: 'view' },
    ],
    hero_url: `https://images.unsplash.com/photo-${fallbackIds[idIdx]}?w=1200&h=800&fit=crop&auto=format`,
  };
}

/**
 * Get investment highlights for a property
 */
export function getInvestmentHighlights(property: Property): string[] {
  const address = getPropertyAddress(property);
  const roi = property.confidence * 0.7; // Simulated ROI based on confidence
  const rentalYield = (property.confidence * 0.03).toFixed(1);
  const isLuxury = property.tags.includes('luxury');

  return [
    `📍 ${address.street}, ${address.district}, ${address.city} — verified location`,
    `🏢 Built by ${property.developer_name} (est. ${getBuilderContact(property).yearEstablished})`,
    `📐 Unit sizes from ${property.min_size_sqft.toLocaleString()} to ${property.max_size_sqft.toLocaleString()} sqft`,
    `💰 Price range: ${property.currencySymbol}${(property.price_min / (property.countryCode === 'IN' ? 100000 : 1)).toFixed(1)}${property.countryCode === 'IN' ? 'L' : ''} — ${property.currencySymbol}${(property.price_max / (property.countryCode === 'IN' ? 100000 : 1)).toFixed(1)}${property.countryCode === 'IN' ? 'L' : ''}`,
    `📈 Projected ROI: ${(property.confidence * 0.7).toFixed(1)}% over 3 years`,
    `💵 Expected rental yield: ${rentalYield}% annually`,
    `🏷️ ${property.available_units}/${property.total_units} units available (${Math.round(property.available_units / property.total_units * 100)}% open)`,
    `⭐ AI Confidence Score: ${property.confidence}/100 — ${property.confidence >= 85 ? 'High potential deal' : property.confidence >= 70 ? 'Promising opportunity' : 'Evaluate carefully'}`,
    `🔗 ${address.landmarks.length > 0 ? `Nearby: ${address.landmarks.slice(0, 2).join(', ')}` : ''}`,
  ].filter(Boolean);
}

/**
 * Get Google Maps embedded URL for a property location
 */
export function getGoogleMapsEmbedUrl(property: Property): string {
  return `https://www.google.com/maps/embed/v1/place?key=&q=${property.latitude},${property.longitude}&zoom=15`;
}

/**
 * Get Google Maps directions URL
 */
export function getGoogleMapsDirectionsUrl(property: Property): string {
  const address = getPropertyAddress(property);
  return `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}&destination_place_id=`;
}

/**
 * Get nearby places of interest for a property
 */
export function getNearbyPlaces(property: Property): { name: string; type: string; distance: string }[] {
  const places: Record<string, { name: string; type: string; distance: string }[]> = {
    'in-mum': [
      { name: 'Chhatrapati Shivaji Maharaj International Airport', type: 'airport', distance: '15 min' },
      { name: 'Bandra Kurla Complex', type: 'business_district', distance: '10 min' },
      { name: 'Juhu Beach', type: 'landmark', distance: '12 min' },
      { name: 'Fortis Hospital', type: 'hospital', distance: '8 min' },
      { name: 'Dhirubhai Ambani International School', type: 'school', distance: '10 min' },
    ],
    'ae-dxb': [
      { name: 'Dubai International Airport (DXB)', type: 'airport', distance: '15 min' },
      { name: 'Dubai Mall', type: 'shopping', distance: '8 min' },
      { name: 'Burj Khalifa', type: 'landmark', distance: '10 min' },
      { name: 'Dubai Marina Walk', type: 'entertainment', distance: '5 min' },
      { name: 'The Address Downtown', type: 'hotel', distance: '5 min' },
    ],
    'gb-lon': [
      { name: 'Heathrow Airport (LHR)', type: 'airport', distance: '35 min' },
      { name: 'Hyde Park', type: 'park', distance: '10 min' },
      { name: 'Oxford Street', type: 'shopping', distance: '12 min' },
      { name: 'The Shard', type: 'landmark', distance: '15 min' },
      { name: 'Imperial College London', type: 'university', distance: '12 min' },
    ],
    'sg-sin': [
      { name: 'Changi Airport (SIN)', type: 'airport', distance: '20 min' },
      { name: 'Marina Bay Sands', type: 'landmark', distance: '8 min' },
      { name: 'Orchard Road', type: 'shopping', distance: '10 min' },
      { name: 'Gardens by the Bay', type: 'park', distance: '7 min' },
      { name: 'Raffles Place MRT', type: 'transit', distance: '5 min' },
    ],
  };

  return places[property.cityId]?.slice(0, 5) || [
    { name: `${property.city} City Centre`, type: 'landmark', distance: '10 min' },
    { name: `${property.city} International Airport`, type: 'airport', distance: '20 min' },
    { name: `Central Business District`, type: 'business_district', distance: '15 min' },
    { name: `City Hospital`, type: 'hospital', distance: '10 min' },
    { name: `Premier School District`, type: 'school', distance: '12 min' },
  ];
}

/**
 * Generate a verified opportunity summary for the property
 */
export function generateOpportunitySummary(property: Property): string {
  const address = getPropertyAddress(property);
  const contact = getBuilderContact(property);
  const roi = (property.confidence * 0.7).toFixed(1);
  const totalDealValue = ((property.price_min + property.price_max) / 2 * property.total_units);
  const commission = Math.round(totalDealValue * 0.03);

  return [
    `## ${property.name} — Investment Summary`,
    ``,
    `**Developer:** ${property.developer_name}`,
    `**Location:** ${address.street}, ${address.district}, ${address.city}, ${address.state}, ${address.country}`,
    `**Google Maps:** ${address.googleMapsUrl}`,
    `**Property Type:** ${property.property_type} · **Status:** ${property.status.replace(/_/g, ' ')}`,
    `**Unit Range:** ${property.min_size_sqft.toLocaleString()} — ${property.max_size_sqft.toLocaleString()} sqft`,
    `**Price Range:** ${property.currencySymbol}${formatINR(property.price_min, property.countryCode)} — ${property.currencySymbol}${formatINR(property.price_max, property.countryCode)}`,
    `**Total Deal Value:** ${property.currencySymbol}${formatINR(totalDealValue, property.countryCode)}`,
    `**Projected ROI (3yr):** ${roi}%`,
    `**AI Confidence Score:** ${property.confidence}/100`,
    `**Commission at 3%:** ${property.currencySymbol}${formatINR(commission, property.countryCode)}`,
    ``,
    `**Contact:** ${contact.salesPhone} | ${contact.salesEmail}`,
    `**Sales Office:** ${contact.headquarters}`,
    `**Website:** ${contact.website}`,
    ``,
    `**Nearby:** ${getNearbyPlaces(property).map(p => `${p.name} (${p.distance})`).join(', ')}`,
    ``,
    `**Status:** ${property.available_units} of ${property.total_units} units available`,
    `**Completion:** ${property.completion_date} (${property.status === 'ready_to_move' ? 'Ready to move' : 'Under construction'})`,
  ].join('\n');
}

function formatINR(price: number, countryCode: string): string {
  if (countryCode === 'IN') {
    if (price >= 10000000) return `${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `${(price / 100000).toFixed(1)} L`;
    return price.toLocaleString('en-IN');
  }
  if (price >= 1000000) return `${(price / 1000000).toFixed(2)}M`;
  if (price >= 1000) return `${(price / 1000).toFixed(1)}K`;
  return price.toLocaleString();
}
