// ============================================================
// LeadLuxe AI — Enterprise Type Definitions
// ============================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'manager' | 'agent';
  avatar_url?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  location?: string;
  property_type?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  budget_range_min?: number;
  budget_range_max?: number;
  total_units?: number;
  amenities?: string[];
  images?: string[];
  created_at: string;
  updated_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'site_visit' | 'negotiation' | 'booked' | 'lost';
export type LeadSource = 'website' | 'whatsapp' | 'referral' | 'social_media' | 'email' | 'phone' | 'other';

export interface Lead {
  id: string;
  user_id: string;
  project_id?: string;
  name: string;
  phone: string;
  email?: string;
  budget?: number;
  preferred_location?: string;
  property_type?: string;
  visit_timeline?: string;
  source: LeadSource;
  status: LeadStatus;
  notes?: string;
  score: number;
  score_factors?: Record<string, any>;
  assigned_to?: string;
  last_contacted_at?: string;
  campaign_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  lead_id: string;
  source: 'website' | 'whatsapp' | 'email' | 'phone';
  status: 'active' | 'resolved' | 'archived';
  subject?: string;
  created_at: string;
  updated_at: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'lead' | 'agent' | 'admin' | 'ai_bot' | 'system';
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface SiteVisit {
  id: string;
  lead_id: string;
  project_id?: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled' | 'no_show';
  notes?: string;
  assigned_agent?: string;
  created_at: string;
  updated_at: string;
  lead?: Lead;
}

export interface LeadScore {
  id: string;
  lead_id: string;
  score: number;
  budget_score: number;
  urgency_score: number;
  engagement_score: number;
  source_score: number;
  factors?: Record<string, any>;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

// New: Lead Journey Events for the animated timeline
export interface LeadEvent {
  id: string;
  lead_id: string;
  event_type: LeadEventType;
  event_label: string;
  event_description?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export type LeadEventType =
  | 'ad_click'
  | 'website_visit'
  | 'chat_started'
  | 'budget_qualified'
  | 'brochure_sent'
  | 'site_visit_booked'
  | 'agent_assigned'
  | 'negotiation_started'
  | 'booking_confirmed'
  | 'deal_closed'
  | 'whatsapp_sent'
  | 'email_sent'
  | 'call_made'
  | 'note_added'
  | 'status_changed';

export const LEAD_EVENT_LABELS: Record<LeadEventType, string> = {
  ad_click: 'Ad Click',
  website_visit: 'Website Visit',
  chat_started: 'AI Chat Started',
  budget_qualified: 'Budget Qualified',
  brochure_sent: 'Brochure Sent',
  site_visit_booked: 'Site Visit Booked',
  agent_assigned: 'Sales Agent Assigned',
  negotiation_started: 'Negotiation Started',
  booking_confirmed: 'Booking Confirmed',
  deal_closed: 'Deal Closed',
  whatsapp_sent: 'WhatsApp Sent',
  email_sent: 'Email Sent',
  call_made: 'Call Made',
  note_added: 'Note Added',
  status_changed: 'Status Changed',
};

// New: Marketing Campaigns
export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  type: 'social_media' | 'google_ads' | 'email' | 'whatsapp' | 'referral' | 'direct';
  status: 'active' | 'paused' | 'completed' | 'draft';
  budget?: number;
  spent?: number;
  leads_generated?: number;
  conversions?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// New: WhatsApp Messages Queue
export interface WhatsAppMessage {
  id: string;
  lead_id: string;
  template_name: string;
  parameters?: Record<string, string>;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sent_at?: string;
  delivered_at?: string;
  read_at?: string;
  error_message?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  event_type: string;
  event_data?: Record<string, any>;
  page?: string;
  session_id?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  lead_id: string;
  project_id?: string;
  booking_date: string;
  amount?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  payment_status: 'pending' | 'partial' | 'completed' | 'refunded';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'lead';
  related_entity_type?: string;
  related_entity_id?: string;
  is_read: boolean;
  created_at: string;
}

// Real-time dashboard metrics fetched from Supabase
export interface DashboardMetrics {
  totalLeads: number;
  hotLeads: number;
  siteVisits: number;
  bookings: number;
  conversionRate: number;
  projectedRevenue: number;
  pipelineValue: number;
  qualifiedLeads: number;
  responseTimeHours: number;
  leadsByStatus: { status: LeadStatus; count: number }[];
  leadsBySource: { source: LeadSource; count: number }[];
  monthlyTrend: { month: string; leads: number; bookings: number }[];
  campaignPerformance: { campaign: string; leads: number; conversions: number }[];
}

// Constants
export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  site_visit: 'Site Visit',
  negotiation: 'Negotiation',
  booked: 'Booked',
  lost: 'Lost',
};

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  contacted: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  qualified: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  site_visit: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  negotiation: 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  booked: 'bg-luxury-gold-500/15 text-luxury-gold-400 border-luxury-gold-500/25',
  lost: 'bg-red-500/15 text-red-400 border-red-500/25',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  website: 'Website',
  whatsapp: 'WhatsApp',
  referral: 'Referral',
  social_media: 'Social Media',
  email: 'Email',
  phone: 'Phone',
  other: 'Other',
};

export const PIPELINE_STAGES: LeadStatus[] = [
  'new', 'contacted', 'qualified', 'site_visit', 'negotiation', 'booked', 'lost',
];
