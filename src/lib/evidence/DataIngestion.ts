// ============================================================
// TerraNexus AI — Data Ingestion Adapters
// Placeholder Edge Functions for all real public data sources.
// Each adapter documents the API endpoint, authentication,
// rate limits, and data normalization logic.
// ============================================================

export interface IngestionAdapter {
  id: string;
  name: string;
  sourceUrl: string;
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  dataTypes: string[];
  authType: 'api_key' | 'public' | 'oauth' | 'basic';
  rateLimit: string;
  status: 'active' | 'pending_implementation' | 'pending_api_key';
}

// =====================
// ADAPTER DEFINITIONS
// =====================
export const INGESTION_ADAPTERS: IngestionAdapter[] = [
  // === GLOBAL MACRO ===
  {
    id: 'worldbank',
    name: 'World Bank API',
    sourceUrl: 'https://api.worldbank.org/v2/country/all/indicator/',
    schedule: 'monthly',
    dataTypes: ['gdp', 'gni_per_capita', 'inflation', 'urban_population', 'construction_value_added'],
    authType: 'public',
    rateLimit: 'Unlimited (public API)',
    status: 'pending_implementation',
  },
  {
    id: 'fred',
    name: 'FRED Economic Data',
    sourceUrl: 'https://api.stlouisfed.org/fred/series/observations',
    schedule: 'weekly',
    dataTypes: ['interest_rates', 'mortgage_rates', 'housing_starts', 'existing_home_sales', 'building_permits'],
    authType: 'api_key',
    rateLimit: '120 req/min',
    status: 'pending_api_key',
  },
  {
    id: 'imf',
    name: 'IMF Data API',
    sourceUrl: 'https://www.imf.org/en/Data',
    schedule: 'monthly',
    dataTypes: ['fdi', 'capital_flows', 'exchange_rates', 'sovereign_credit'],
    authType: 'public',
    rateLimit: 'Varies by dataset',
    status: 'pending_implementation',
  },
  
  // === INDIA ===
  {
    id: 'rbi',
    name: 'RBI Database',
    sourceUrl: 'https://www.rbi.org.in/Scripts/Statistics.aspx',
    schedule: 'monthly',
    dataTypes: ['repo_rate', 'home_loan_rates', 'inflation', 'credit_growth'],
    authType: 'public',
    rateLimit: 'Public dataset',
    status: 'pending_implementation',
  },
  {
    id: 'rera',
    name: 'RERA Portal Scraper',
    sourceUrl: 'https://rera.gov.in/',
    schedule: 'daily',
    dataTypes: ['project_registrations', 'project_status', 'developer_compliance', 'consumer_complaints'],
    authType: 'public',
    rateLimit: 'Web scraping — implement politeness delay',
    status: 'pending_implementation',
  },
  {
    id: 'igr',
    name: 'Maharashtra IGR',
    sourceUrl: 'https://igrmaharashtra.gov.in/',
    schedule: 'daily',
    dataTypes: ['property_registrations', 'stamp_duty_rates', 'circle_rates'],
    authType: 'public',
    rateLimit: 'Web scraping',
    status: 'pending_implementation',
  },
  {
    id: 'pmrda',
    name: 'Pune PMRDA',
    sourceUrl: 'https://pmrda.gov.in/',
    schedule: 'weekly',
    dataTypes: ['project_approvals', 'development_plans', 'infrastructure_projects'],
    authType: 'public',
    rateLimit: 'Web scraping',
    status: 'pending_implementation',
  },
  
  // === UAE ===
  {
    id: 'dubai_land',
    name: 'Dubai Land Department',
    sourceUrl: 'https://dubailand.gov.ae/en/open-data/',
    schedule: 'daily',
    dataTypes: ['property_transactions', 'mortgage_data', 'off_plan_sales', 'area_prices'],
    authType: 'public',
    rateLimit: 'Open data portal',
    status: 'pending_implementation',
  },
  
  // === UK ===
  {
    id: 'uk_land_registry',
    name: 'UK Land Registry',
    sourceUrl: 'https://landregistry.gov.uk/data/',
    schedule: 'daily',
    dataTypes: ['price_paid', 'property_sales', 'average_prices', 'sales_volume'],
    authType: 'public',
    rateLimit: 'Open data — monthly CSV downloads',
    status: 'pending_implementation',
  },
  {
    id: 'ons',
    name: 'ONS UK Housing Data',
    sourceUrl: 'https://ons.gov.uk/economy/inflationpriceindices',
    schedule: 'monthly',
    dataTypes: ['house_price_index', 'rental_index', 'inflation', 'housing_affordability'],
    authType: 'public',
    rateLimit: 'Open data API',
    status: 'pending_implementation',
  },
  
  // === US ===
  {
    id: 'census',
    name: 'US Census Bureau',
    sourceUrl: 'https://census.gov/data/developers/data-sets.html',
    schedule: 'monthly',
    dataTypes: ['building_permits', 'housing_vacancy', 'population_estimates', 'homeownership_rate'],
    authType: 'api_key',
    rateLimit: '500 req/day (free tier)',
    status: 'pending_api_key',
  },
  {
    id: 'fred_housing',
    name: 'FRED Housing Series',
    sourceUrl: 'https://fred.stlouisfed.org/categories/97',
    schedule: 'weekly',
    dataTypes: ['mortgage_rate_30yr', 'housing_starts', 'existing_home_sales_median', 'case_shiller_index'],
    authType: 'api_key',
    rateLimit: '120 req/min',
    status: 'pending_api_key',
  },
  
  // === SINGAPORE ===
  {
    id: 'ura',
    name: 'URA Singapore',
    sourceUrl: 'https://ura.gov.sg/maps/api/',
    schedule: 'daily',
    dataTypes: ['private_property_transactions', 'rental_contracts', 'planning_decisions', 'development_pipeline'],
    authType: 'api_key',
    rateLimit: 'By registration',
    status: 'pending_api_key',
  },
  
  // === JAPAN ===
  {
    id: 'mlit',
    name: 'Japan MLIT',
    sourceUrl: 'https://mlit.go.jp/en/statistics.html',
    schedule: 'monthly',
    dataTypes: ['construction_starts', 'housing_starts', 'land_prices', 'building_investment'],
    authType: 'public',
    rateLimit: 'Public datasets',
    status: 'pending_implementation',
  },
  
  // === GERMANY ===
  {
    id: 'destatis',
    name: 'Destatis',
    sourceUrl: 'https://destatis.de/EN/Themes/ // Econ/Housing/',
    schedule: 'monthly',
    dataTypes: ['construction_prices', 'housing_permits', 'property_transfer_tax', 'rent_index'],
    authType: 'public',
    rateLimit: 'Open data',
    status: 'pending_implementation',
  },
];

// =====================
// SUPABASE EDGE FUNCTION TEMPLATE
// =====================
export const EDGE_FUNCTION_TEMPLATE = `// TerraNexus AI — Data Ingestion Edge Function
// Template for Supabase Edge Functions (Deno)
// Copy this into supabase/functions/{adapter_id}/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  try {
    // 1. Fetch data from external API
    // 2. Normalize to schema
    // 3. Upsert into appropriate tables
    // 4. Log ingestion in evidence_sources
    // 5. Return success/failure status
    
    return new Response(JSON.stringify({ 
      status: 'success', 
      message: 'Data ingested successfully',
      timestamp: new Date().toISOString(),
    }), { headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
`;

// =====================
// GENERATE EDGE FUNCTION FILE CONTENT
// =====================
export function generateEdgeFunctionFile(adapterId: string): { path: string; content: string } {
  const adapter = INGESTION_ADAPTERS.find(a => a.id === adapterId);
  if (!adapter) throw new Error(`Unknown adapter: ${adapterId}`);

  return {
    path: `supabase/functions/ingest-${adapterId}/index.ts`,
    content: `// TerraNexus AI — Ingestion: ${adapter.name}
// Source: ${adapter.sourceUrl}
// Schedule: ${adapter.schedule}
// Data types: ${adapter.dataTypes.join(', ')}
// Auth type: ${adapter.authType}

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const API_KEY = Deno.env.get('${adapterId.toUpperCase()}_API_KEY') || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

serve(async (req) => {
  const startTime = Date.now();
  let recordsProcessed = 0;
  let errors: string[] = [];

  try {
    console.log('[${adapter.name}] Starting ingestion...');

    // TODO: Implement actual API fetch for ${adapter.name}
    // 1. Call ${adapter.sourceUrl}
    // 2. Parse response
    // 3. Normalize to schema
    // 4. Upsert into database
    // 5. Log to evidence_sources table

    // Placeholder: log the ingestion attempt
    const { error: logError } = await supabase
      .from('evidence_sources')
      .insert({
        source_name: '${adapter.name}',
        source_url: '${adapter.sourceUrl}',
        adapter_id: '${adapterId}',
        records_processed: recordsProcessed,
        status: 'completed',
        duration_ms: Date.now() - startTime,
        errors: errors.length > 0 ? errors : null,
      });

    if (logError) console.error('[${adapter.name}] Log error:', logError);

    return new Response(JSON.stringify({
      status: 'success',
      adapter: '${adapterId}',
      recordsProcessed,
      errors: errors.length,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    console.error('[${adapter.name}] Fatal error:', error.message);

    return new Response(JSON.stringify({
      status: 'error',
      adapter: '${adapterId}',
      message: error.message,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
`,
  };
}
