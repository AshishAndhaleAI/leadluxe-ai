// ============================================================
// LeadLuxe AI — Google Analytics 4 Event Tracking Service
// Centralized analytics with production-only guard
// ============================================================

// Declare the global gtag function (loaded from index.html script tag)
declare const gtag: (...args: any[]) => void;

// Only track in production (Vite's import.meta.env.PROD is true for production builds)
const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Safely fire a gtag event — only in production, only when gtag is loaded
 */
function track(eventName: string, params?: Record<string, any>) {
  if (!IS_PRODUCTION) return;
  try {
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, params);
    }
  } catch {
    // Silently fail — analytics should never break the app
  }
}

// ============================================================
// EVENT TRACKERS
// ============================================================

/**
 * User signed up for a new account
 */
export function trackSignUp(method: 'email' | 'google' | 'demo') {
  track('sign_up', { method });
}

/**
 * User logged in
 */
export function trackLogin(method: 'email' | 'demo') {
  track('login', { method });
}

/**
 * User selected a location during onboarding
 */
export function trackLocationSelected(country: string, city: string) {
  track('location_selected', { country, city });
}

/**
 * User viewed an opportunity / property detail
 */
export function trackOpportunityView(propertyId: string, propertyName: string, city: string, country: string, value: number) {
  track('opportunity_view', {
    property_id: propertyId,
    property_name: propertyName,
    city,
    country,
    estimated_value: value,
  });
}

/**
 * User clicked on a property card in DealRoom or map
 */
export function trackPropertyClick(propertyId: string, propertyName: string, city: string, price: number) {
  track('property_click', {
    property_id: propertyId,
    property_name: propertyName,
    city,
    price,
  });
}

/**
 * User calculated a commission amount
 */
export function trackCommissionCalculated(dealValue: number, commission: number) {
  track('commission_calculated', {
    deal_value: dealValue,
    commission_amount: commission,
    commission_percentage: 3.0,
  });
}

/**
 * User submitted a contact/enquiry form
 */
export function trackContactSubmit(propertyId: string | null, propertyName: string | null, method: 'email' | 'phone' | 'form') {
  track('contact_submit', {
    property_id: propertyId || 'general',
    property_name: propertyName || 'general_inquiry',
    contact_method: method,
  });
}
