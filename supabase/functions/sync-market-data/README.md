# Global Market Data Sync — Supabase Edge Function

Periodically syncs real estate market data from public sources into Supabase.

## Data Sources

- **World Bank** — Housing price indices, urban population data
- **IMF** — Global housing watch data, capital flow statistics
- **OECD** — Housing prices, rental indices, construction indicators
- **UN Habitat** — Urban indicators, city-level data
- **FRED (US)** — Housing starts, building permits, home price index
- **ECB (EU)** — Residential property prices, mortgage rates
- **RBI (India)** — Housing price index, home loan data
- **ONS (UK)** — UK house price index, rental data
- **ABS (Australia)** — Residential property price indices
- **Statistics Canada** — New housing price index, building permits
- **Singapore URA** — Private residential property price index
- **Dubai Land Department** — Real estate market reports
- **Japan MLIT** — Land price survey, housing starts

## Tables Created

See `supabase/migrations/global_data_pipeline.sql`

## Deployment

```bash
supabase functions deploy sync-market-data
supabase functions deploy sync-city-data
supabase functions deploy sync-price-indices
```
