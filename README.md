# LeadLuxe AI 🏗️🤖

**AI-Powered Lead Conversion Platform for Real Estate Developers**

LeadLuxe AI is a premium B2B SaaS application that helps real estate builders and developers convert website and WhatsApp leads into qualified site visits and property bookings using AI automation.

![LeadLuxe AI](public/favicon.svg)

## ✨ Features

- **🤖 AI Lead Scoring** — Intelligent scoring based on budget, urgency, engagement, and source quality
- **📊 Real-Time Dashboard** — KPI cards, charts, lead pipeline, and revenue projections  
- **💬 AI Property Chatbot** — Automated lead capture and qualification on your website
- **📋 Lead Management** — Full CRUD with pipeline board, table view, and status tracking
- **📅 Site Visit Calendar** — Schedule and manage property visits with ease
- **📈 Analytics & Reports** — Conversion funnel, revenue projections, and AI-powered insights
- **🔔 Real-Time Notifications** — Instant alerts for new leads and updates
- **📱 WhatsApp Integration** — Automated follow-up workflow (API integration ready)
- **🎨 Luxury UI** — Premium black, white, and gold theme with smooth animations
- **🔐 Supabase Auth** — Secure email/password authentication with role-based access
- **📱 Mobile Responsive** — Fully responsive design that works on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone <repo-url> leadluxe-ai
cd leadluxe-ai
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key
3. Go to SQL Editor and run the schema from `supabase/schema.sql`

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

### 5. Demo Login (No Supabase Required)

The app works out of the box with mock data for development:

- **Email:** `admin@leadluxe.ai`
- **Password:** any password works in dev mode

## 🏗️ Project Structure

```
leadluxe-ai/
├── supabase/
│   └── schema.sql              # Database schema
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── analytics/          # Chart components
│   │   ├── calendar/           # Calendar view
│   │   ├── chatbot/            # AI property chatbot
│   │   ├── layout/             # Sidebar, Header, DashboardLayout
│   │   ├── leads/              # LeadTable, LeadForm, LeadPipeline, LeadCard
│   │   ├── notifications/      # NotificationBell
│   │   └── ui/                 # KPICard, StatusBadge, LeadScoreIndicator
│   ├── context/
│   │   ├── AuthContext.tsx      # Authentication state
│   │   └── NotificationContext.tsx  # Real-time notifications
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useLeads.ts         # Lead CRUD operations
│   │   ├── useNotifications.ts
│   │   └── useRealtime.ts      # Supabase realtime subscriptions
│   ├── lib/
│   │   ├── ai-scoring.ts       # AI lead scoring algorithm
│   │   ├── supabase.ts         # Supabase client
│   │   └── utils.ts            # Utility functions
│   ├── pages/
│   │   ├── Landing.tsx         # Marketing landing page
│   │   ├── Login.tsx           # Authentication page
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── Leads.tsx           # Lead management
│   │   ├── LeadDetail.tsx      # Individual lead view
│   │   ├── Calendar.tsx        # Site visit calendar
│   │   ├── Analytics.tsx       # Reports and insights
│   │   ├── Settings.tsx        # User preferences
│   │   └── NotFound.tsx        # 404 page
│   ├── types/
│   │   └── index.ts            # TypeScript type definitions
│   ├── App.tsx                 # Router setup
│   ├── main.tsx                # Entry point
│   └── index.css               # Tailwind imports + custom styles
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User profiles (extends Supabase Auth) |
| `projects` | Real estate projects/properties |
| `leads` | Lead information and status |
| `conversations` | Chat conversation threads |
| `messages` | Individual messages within conversations |
| `site_visits` | Scheduled property visits |
| `lead_scores` | AI scoring results |
| `analytics_events` | Event tracking for analytics |
| `bookings` | Property bookings/deals |
| `notifications` | Real-time user notifications |

## 🔧 Tech Stack

- **Frontend:** React 18 + TypeScript
- **Styling:** Tailwind CSS 3
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **Routing:** React Router v6
- **Charts:** Recharts (via custom components)
- **Icons:** Lucide React
- **Build:** Vite 5

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` folder. Deploy to:

- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **GitHub Pages:** Configure in vite.config.ts

### Environment Variables in Production

Don't forget to set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting platform's environment variables.

## 🤝 Contributing

We welcome contributions! Please check our issues page for open tasks.

## 📄 License

MIT

---

Built with ❤️ for real estate developers who want to close more deals.
