-- ============================================================
-- LeadLuxe AI — Global Data Pipeline Tables
-- Normalized real estate market data from public sources
-- ============================================================

-- Countries reference
CREATE TABLE IF NOT EXISTS public.countries (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region TEXT,
  subregion TEXT,
  currency TEXT,
  currency_symbol TEXT,
  flag TEXT,
  latitude REAL,
  longitude REAL,
  population BIGINT,
  capital TEXT,
  languages TEXT[],
  timezones TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cities
CREATE TABLE IF NOT EXISTS public.cities (
  id TEXT PRIMARY KEY,
  country_code TEXT REFERENCES public.countries(code),
  name TEXT NOT NULL,
  state TEXT,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  population BIGINT,
  timezone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Districts / neighborhoods
CREATE TABLE IF NOT EXISTS public.districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  name TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  postal_code TEXT,
  avg_price_per_sqft REAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market metrics (refreshed daily)
CREATE TABLE IF NOT EXISTS public.market_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  metric_type TEXT NOT NULL,
  metric_value REAL NOT NULL,
  unit TEXT,
  source TEXT,
  source_url TEXT,
  confidence REAL DEFAULT 0.7,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, metric_type, recorded_at)
);

-- Price index time series
CREATE TABLE IF NOT EXISTS public.price_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  index_value REAL NOT NULL,
  month DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, month)
);

-- Rental yield data
CREATE TABLE IF NOT EXISTS public.rental_yield (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  property_type TEXT,
  gross_yield REAL,
  net_yield REAL,
  month DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, property_type, month)
);

-- Capital flow tracking
CREATE TABLE IF NOT EXISTS public.capital_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_country TEXT,
  destination_city_id TEXT REFERENCES public.cities(id),
  flow_type TEXT,
  estimated_volume REAL,
  currency TEXT DEFAULT 'USD',
  quarter TEXT,
  year INTEGER,
  source TEXT,
  confidence REAL DEFAULT 0.6,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Construction activity
CREATE TABLE IF NOT EXISTS public.construction_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  building_permits INTEGER,
  housing_starts INTEGER,
  completions INTEGER,
  month DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, month)
);

-- Foreign investment tracking
CREATE TABLE IF NOT EXISTS public.foreign_investment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  investor_country TEXT,
  investment_value REAL,
  transaction_count INTEGER,
  property_type TEXT,
  quarter TEXT,
  year INTEGER,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory levels
CREATE TABLE IF NOT EXISTS public.inventory_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id TEXT REFERENCES public.cities(id),
  total_units INTEGER,
  available_units INTEGER,
  months_of_inventory REAL,
  month DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, month)
);

-- Currency risk data
CREATE TABLE IF NOT EXISTS public.currency_risk (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  currency_pair TEXT NOT NULL,
  exchange_rate REAL,
  volatility REAL,
  month DATE NOT NULL,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(currency_pair, month)
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_yield ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capital_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.construction_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foreign_investment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_risk ENABLE ROW LEVEL SECURITY;

-- Allow read access
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated, anon;
