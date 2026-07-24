# TerraNexus AI 🏗️🤖

**AI-Powered Lead Conversion Platform for Real Estate Developers**

TerraNexus AI is a premium B2B SaaS application that helps real estate builders and developers convert website and WhatsApp leads into qualified site visits and property bookings using AI automation.

## ✨ Features

- **🏗️ 3D Building Walkthrough** — Photorealistic 24-story glass tower with interactive orbit controls
- **🤖 AI Lead Scoring** — Intelligent 7-dimension scoring (budget, urgency, engagement, source, location, property type, completeness)
- **📊 Real-Time Dashboard** — Live KPI cards with animated counters, charts, and pipeline views
- **💬 AI Property Chatbot** — Automated lead capture and qualification on your website
- **📋 Lead Management** — Full CRUD with pipeline board, table view, and status tracking
- **📅 Site Visit Calendar** — Schedule and manage property visits with real Supabase persistence
- **📈 Analytics & Reports** — Pipeline value, conversion funnel, revenue projections, Indian formatting (₹2.43 Cr)
- **🔔 Real-Time Notifications** — Supabase real-time subscriptions for instant lead alerts
- **💬 WhatsApp Automation** — Meta Cloud API service layer with automated welcome and follow-up workflows
- **🎨 Premium UI** — Glassmorphism luxury theme with dark navy, black, and gold accents
- **🔐 Supabase Auth** — Secure email/password authentication with 3-tier fallback
- **📱 Mobile Responsive** — Fully responsive design that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone <repo-url> terranexus-ai
cd terranexus-ai
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Go to SQL Editor and run the schema from `supabase/schema.sql`
4. (Optional) Run `supabase/seed.sql` for 30 sample leads

### 3. Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the App

```bash
npm run dev
```

The app will start at `http://localhost:5173`

## 🏗️ Project Structure

```
terranexus-ai/
├── supabase/
│   ├── schema.sql              # Database schema (13 tables)
│   └── seed.sql                # Sample data (30 Indian real estate leads)
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── analytics/          # ConversionChart, RevenueChart
│   │   ├── calendar/           # CalendarView component
│   │   ├── chatbot/            # AI property chatbot
│   │   ├── hero/               # 3D Hero with Three.js (Hero3D.tsx)
│   │   ├── layout/             # Sidebar, Header, DashboardLayout
│   │   ├── leads/              # LeadTable, LeadForm, LeadPipeline, LeadCard, LeadJourneyTimeline
│   │   ├── notifications/      # NotificationBell
│   │   ├── setup/              # DatabaseGate, SupabaseSetup (startup validation)
│   │   └── ui/                 # KPICard, StatusBadge, LeadScoreIndicator, AnimatedCounter, SkeletonLoader
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication with 3-tier fallback
│   │   └── NotificationContext.tsx  # Real-time notifications
│   ├── hooks/
│   │   ├── useAuth.ts         # Re-export from AuthContext
│   │   ├── useLeads.ts        # Lead CRUD + real-time subscriptions
│   │   ├── useDashboard.ts    # Live dashboard metrics
│   │   └── useNotifications.ts # Re-export from NotificationContext
│   ├── lib/
│   │   ├── ai-scoring.ts      # 7-dimension AI lead scoring engine
│   │   ├── format.ts          # Indian currency formatting (₹2.43 Cr)
│   │   ├── supabase.ts        # Supabase client + real-time helpers
│   │   ├── utils.ts           # Date formatting, classnames, helpers
│   │   └── whatsapp.ts        # Meta Cloud API service layer
│   ├── pages/
│   │   ├── Landing.tsx        # Marketing with 3D hero + pricing
│   │   ├── Login.tsx          # Supabase authentication
│   │   ├── Dashboard.tsx      # Live KPI dashboard
│   │   ├── Leads.tsx          # Lead management
│   │   ├── LeadDetail.tsx     # Individual lead with timeline + conversation
│   │   ├── Calendar.tsx       # Site visit calendar
│   │   ├── Analytics.tsx      # Reports and insights
│   │   ├── Settings.tsx       # User preferences
│   │   └── NotFound.tsx       # 404 page
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions (Lead, LeadEvent, etc.)
│   ├── App.tsx                # Router with DatabaseGate wrapper
│   ├── main.tsx               # Entry point
│   └── index.css              # Tailwind imports + premium custom styles
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js         # Custom luxury theme config
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts             # Path aliases, React plugin
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles (extends Supabase Auth) |
| `projects` | Real estate projects/properties |
| `leads` | Lead information and status |
| `lead_events` | Lead journey timeline events |
| `conversations` | Chat conversation threads |
| `messages` | Individual messages within conversations |
| `site_visits` | Scheduled property visits |
| `lead_scores` | AI scoring results |
| `campaigns` | Marketing campaign tracking |
| `whatsapp_messages` | WhatsApp message queue |
| `analytics_events` | Event tracking for analytics |
| `bookings` | Property bookings/deals |
| `notifications` | Real-time user notifications |

## 🔧 Tech Stack

- **Frontend:** React 18 + TypeScript + Vite 5
- **Styling:** Tailwind CSS 3 with custom luxury theme
- **3D Graphics:** React Three Fiber + Drei + Three.js
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Routing:** React Router v6
- **Animation:** Framer Motion 11
- **Icons:** Lucide React
- **State:** React Context + Supabase real-time subscriptions

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder. Deploy to:

- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`

### Environment Variables in Production

Don't forget to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting platform's environment variables.

## 🤝 Contributing

We welcome contributions! Please check our issues page for open tasks.

## 📄 License

MIT

---

Built with ❤️ for real estate developers who want to close more deals.
