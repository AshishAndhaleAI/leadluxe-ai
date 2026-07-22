import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Initialize autonomous intelligence platform
import { autonomousIntelligence } from './lib/core/AutonomousIntelligence';

// Start the autonomous system on app boot
// This initializes all 10 agents, starts the scheduler, and begins
// collecting signals from real public data sources (Google News, RERA portals).
// In development, it runs on a 10-minute cycle. In production, this would
// run on a dedicated server worker for continuous operation.
autonomousIntelligence.initialize();

// For development/demo: run an immediate cycle to populate the knowledge graph
// with initial signals from public sources
autonomousIntelligence.runCycle().then(() => {
  console.log('[LeadLuxeAI] Initial intelligence cycle complete');
  console.log('[LeadLuxeAI] System status:', autonomousIntelligence.getStatus());
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
