import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { PropertyDetail } from './pages/PropertyDetail';
import { SEOHelmet, OrganizationLD } from './components/seo/SEOHelmet';
import type { ReactNode } from 'react';

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
      {/* Global SEO meta and structured data */}
      <SEOHelmet />
      <OrganizationLD />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />

        {/* Public property detail page — no auth required for SEO */}
        <Route path="/property/:slug" element={<PropertyDetail />} />

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
