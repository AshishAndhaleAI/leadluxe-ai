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
// Seed the knowledge graph with real market data so dashboards always have content
import { seedKnowledgeGraph } from './lib/core/seed-data';
seedKnowledgeGraph();

// Autonomous intelligence — loaded after app renders
// Wrapped in try-catch to prevent initialization errors from crashing the app
import { autonomousIntelligence } from './lib/core/AutonomousIntelligence';

try {
  // Initialize the autonomous system on app boot
  autonomousIntelligence.initialize();
  
  // Run an immediate cycle in the background (errors are caught internally)
  autonomousIntelligence.runCycle().then(() => {
    console.log('[LeadLuxeAI] Initial intelligence cycle complete');
  }).catch(() => {
    // Silently handle — app should work without AI backend
  });
} catch (e) {
  console.warn('[LeadLuxeAI] Intelligence initialization deferred:', e);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
