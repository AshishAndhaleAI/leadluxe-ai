import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Opportunities } from './pages/Opportunities';
import { OpportunityDetail } from './pages/OpportunityDetail';
import { Signals } from './pages/Signals';
import { Competitors } from './pages/Competitors';
import { Forecasts } from './pages/Forecasts';
import { Coach } from './pages/Coach';
import { Settings } from './pages/Settings';
import { CommissionDashboard } from './pages/CommissionDashboard';
import { DealRoom } from './pages/DealRoom';
import { NotFound } from './pages/NotFound';
import { GlobalMap } from './pages/GlobalMap';
import { Match } from './pages/Match';
import { GravityEngine } from './pages/GravityEngine';
import { GravityBriefing } from './pages/GravityBriefing';
import { Portfolio } from './pages/Portfolio';
import { DealCompass } from './pages/DealCompass';
import { TwinDashboard } from './pages/TwinDashboard';
import { Enterprise } from './pages/Enterprise';
import { Pilot } from './pages/Pilot';
import { TractionDashboard } from './pages/TractionDashboard';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { BookDemo } from './pages/BookDemo';
import { DealReport } from './pages/DealReport';
import { Demo } from './pages/Demo';
import { Developers } from './pages/Developers';
import { NRIPortal } from './pages/NRIPortal';
import { AcquisitionDashboard } from './pages/AcquisitionDashboard';
import { DataProvenance } from './pages/DataProvenance';
import { AIGovernancePanel } from './components/investor/AIGovernancePanel';
import { NeuralCapitalMap } from './pages/NeuralCapitalMap';
import { TimeMachine } from './pages/TimeMachine';
import { NegotiationLab } from './pages/NegotiationLab';
import { AgentConsole } from './pages/AgentConsole';
import { PropertyDetail } from './pages/PropertyDetail';
import { PropertyExperience } from './pages/PropertyExperience';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { CountryLanding } from './pages/CountryLanding';
import { CityLanding } from './pages/CityLanding';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { SEOHelmet, OrganizationLD, WebSiteLD } from './components/seo/SEOHelmet';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

// Declare gtag for GA4 (loaded externally from the script tag in index.html)
declare const gtag: (...args: any[]) => void;

// ============================================================
// GA4 Route Tracker — fires page_view on every route change
// Solves: "Not tagged" issue in Google Analytics for SPAs
// ============================================================
function GARouteTracker() {
  const { pathname, search } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render — the initial gtag('config', ...) from
    // the <script> tag in index.html already fires a page_view.
    // Only fire page_view on subsequent SPA navigations.
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Fire a page_view event whenever the route changes
    // Uses string primitives as deps to avoid firing on every re-render
    if (typeof gtag !== 'undefined') {
      gtag('event', 'page_view', {
        page_path: pathname + search,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  }, [pathname, search]);

  return null;
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      {/* GA4 Route Tracker — fires page_view on every SPA navigation */}
      <GARouteTracker />

      {/* Global SEO meta and structured data */}
      <SEOHelmet />
      <OrganizationLD />
      <WebSiteLD />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Public Business pages — no auth required */}
        <Route path="/enterprise" element={<Enterprise />} />
        <Route path="/pilot" element={<Pilot />} />
        <Route path="/market-intelligence" element={<MarketIntelligence />} />
        <Route path="/book-demo" element={<BookDemo />} />
        <Route path="/report/:slug" element={<DealReport />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/nri" element={<NRIPortal />} />
        <Route path="/admin/acquisition" element={<ProtectedRoute><AcquisitionDashboard /></ProtectedRoute>} />

        {/* Public Info pages — no auth required */}
        <Route path="/data-provenance" element={<DataProvenance />} />

        {/* Public SEO pages — no auth required */}
        <Route path="/property/:slug" element={<PropertyDetail />} />
        <Route path="/experience/:slug" element={<PropertyExperience />} />
        <Route path="/research/:slug" element={<DigitalTwinPage />} />
        <Route path="/country/:countryCode" element={<CountryLanding />} />
        <Route path="/city/:citySlug" element={<CityLanding />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Protected — Standard Dashboard Layout (with sidebar) */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/opportunity/:id" element={<OpportunityDetail />} />
          <Route path="/signals" element={<Signals />} />
          <Route path="/competitors" element={<Competitors />} />
          <Route path="/forecasts" element={<Forecasts />} />
          <Route path="/coach" element={<Coach />} />
          <Route path="/global-map" element={<GlobalMap />} />
          <Route path="/match" element={<Match />} />
          <Route path="/gravity" element={<GravityEngine />} />
          <Route path="/briefing" element={<GravityBriefing />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/commission" element={<CommissionDashboard />} />
          <Route path="/deal-room" element={<DealRoom />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/deal-compass" element={<DealCompass />} />
          <Route path="/neural-capital" element={<NeuralCapitalMap />} />
          <Route path="/time-machine" element={<TimeMachine />} />
          <Route path="/negotiation-lab" element={<NegotiationLab />} />
          <Route path="/agent-console" element={<AgentConsole />} />
          <Route path="/twin" element={<TwinDashboard />} />
          <Route path="/traction" element={<TractionDashboard />} />
          <Route path="/governance" element={<AIGovernancePanel />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
