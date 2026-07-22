import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize autonomous intelligence platform
// The RSS proxy server (npm run server) runs on port 3001 by default.
// Connectors resolve the proxy URL from:
//   1. window.__LEADLUXE_PROXY_URL
//   2. import.meta.env.VITE_PROXY_URL (set via .env or Vite)
//   3. Fallback: http://localhost:3001
import { autonomousIntelligence } from './lib/core/AutonomousIntelligence';

// Start the autonomous system on app boot
// This initializes all 10 agents, starts the scheduler, and begins
// collecting signals from real public data sources (Google News, RERA portals)
// via the RSS proxy server.
// In development, it runs on a 10-minute cycle. In production, this would
// run on a dedicated server worker for continuous operation.
autonomousIntelligence.initialize();

// For development: run an immediate cycle to populate the knowledge graph
// with initial signals from public sources via the proxy server.
// The proxy must be running (npm run server) for connectors to work.
autonomousIntelligence.runCycle().then(() => {
  console.log('[LeadLuxeAI] Initial intelligence cycle complete');
  const status = autonomousIntelligence.getStatus();
  console.log('[LeadLuxeAI] System status:', status);
  if (!status.connectors?.[0]?.lastSuccess) {
    console.log('[LeadLuxeAI] Tip: Start the RSS proxy with: npm run server');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
