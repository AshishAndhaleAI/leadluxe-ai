import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Building2, IndianRupee, Users, Percent, Trophy, Phone, TrendingUp, Zap } from 'lucide-react';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import { cn } from '../lib/utils';

const demoLeads = [
  { name: 'Rahul Mehta', budget: 12500000, location: 'Baner, Pune', status: 'Hot', score: 94 },
  { name: 'Priya Kapoor', budget: 8200000, location: 'Kharadi, Pune', status: 'Qualified', score: 81 },
  { name: 'Amit Shah', budget: 21000000, location: 'Balewadi, Pune', status: 'Negotiation', score: 96 },
  { name: 'Sneha Joshi', budget: 9500000, location: 'Wakad, Pune', status: 'Site Visit', score: 78 },
  { name: 'Vikram Patil', budget: 17500000, location: 'Hinjewadi, Pune', status: 'Booked', score: 99 },
];

const totalPipeline = demoLeads.reduce((s, l) => s + l.budget, 0); // ₹6.87 Cr
const potentialCommission = totalPipeline * 0.03; // ₹20.61 L
const realizedCommission = 17500000 * 0.03; // ₹5.25 L from Vikram Patil

interface DemoProjectProps {
  name: string;
  tagline: string;
  logo: string;
}

function DemoProjectTemplate({ name, tagline, logo }: DemoProjectProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-luxury-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>

        {/* Project Header */}
        <div className="premium-card p-8 mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
                <span className="text-2xl">{logo}</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{name}</h1>
                <p className="text-sm text-gray-400">{tagline}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full">AI-Powered Pipeline</span>
                  <span className="text-xs bg-luxury-gold-500/10 text-luxury-gold-400 px-2 py-0.5 rounded-full">3% Success Fee</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => navigate('/login')} className="btn-outline text-sm px-4 py-2">
                <TrendingUp className="w-4 h-4" /> See Live Deal Dashboard
              </button>
              <button onClick={() => navigate('/login')} className="btn-primary text-sm px-4 py-2">
                <Phone className="w-4 h-4" /> Book Builder Demo
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="premium-card p-6 mb-8 border-luxury-gold-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-luxury-gold-400" />
            <h2 className="text-base font-semibold text-white">Executive Summary for {name}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <p className="text-xs text-gray-500">Active Pipeline</p>
              <p className="text-xl font-bold text-white mt-1">{formatIndianCurrency(totalPipeline)}</p>
              <p className="text-xs text-gray-500 mt-1">5 qualified buyers</p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <p className="text-xs text-gray-500">Expected Commission</p>
              <p className="text-xl font-bold text-luxury-gold-400 mt-1">{formatCommission(potentialCommission)}</p>
              <p className="text-xs text-gray-500 mt-1">At 3% success fee</p>
            </div>
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <p className="text-xs text-emerald-400">Already Realized</p>
              <p className="text-xl font-bold text-emerald-400 mt-1">{formatCommission(realizedCommission)}</p>
              <p className="text-xs text-gray-500 mt-1">From Vikram Patil booking</p>
            </div>
            <div className="p-4 rounded-lg bg-luxury-gray/30 border border-luxury-border">
              <p className="text-xs text-gray-500">AI Response Time</p>
              <p className="text-xl font-bold text-white mt-1">2.4 min</p>
              <p className="text-xs text-emerald-400 mt-1">95% faster than manual</p>
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="premium-card p-5">
            <Users className="w-5 h-5 text-luxury-gold-400 mb-2" />
            <p className="text-2xl font-bold text-white">{demoLeads.length}</p>
            <p className="text-xs text-gray-500">Total Leads</p>
          </div>
          <div className="premium-card p-5">
            <IndianRupee className="w-5 h-5 text-luxury-gold-400 mb-2" />
            <p className="text-2xl font-bold text-white">{formatIndianCurrency(totalPipeline)}</p>
            <p className="text-xs text-gray-500">Pipeline Value</p>
          </div>
          <div className="premium-card p-5">
            <Percent className="w-5 h-5 text-luxury-gold-400 mb-2" />
            <p className="text-2xl font-bold text-luxury-gold-400">{formatCommission(potentialCommission)}</p>
            <p className="text-xs text-gray-500">Potential Commission</p>
          </div>
          <div className="premium-card p-5">
            <Trophy className="w-5 h-5 text-emerald-400 mb-2" />
            <p className="text-2xl font-bold text-emerald-400">{formatCommission(realizedCommission)}</p>
            <p className="text-xs text-gray-500">Commission Realized</p>
          </div>
        </div>

        {/* Leads Pipeline */}
        <div className="premium-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Live Deal Pipeline</h2>
            <div className="flex items-center gap-1 text-xs text-luxury-gold-400">
              <span className="text-gray-500">Total:</span> {formatIndianCurrency(totalPipeline)}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-luxury-border">
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Buyer</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Budget</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Status</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">AI Score</th>
                  <th className="text-left text-xs text-gray-500 font-medium pb-3 pr-4">Est. Commission</th>
                </tr>
              </thead>
              <tbody>
                {demoLeads.map((lead, i) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-luxury-border/50 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <p className="text-white font-medium">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.location}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-luxury-gold-400 font-semibold">{formatIndianCurrency(lead.budget)}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        lead.status === 'Hot' ? 'bg-red-500/15 text-red-400' :
                        lead.status === 'Booked' ? 'bg-emerald-500/15 text-emerald-400' :
                        lead.status === 'Negotiation' ? 'bg-orange-500/15 text-orange-400' :
                        'bg-amber-500/15 text-amber-400'
                      )}>{lead.status}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn(
                        'text-sm font-bold',
                        lead.score >= 90 ? 'text-emerald-400' : lead.score >= 75 ? 'text-amber-400' : 'text-gray-400'
                      )}>{lead.score}/100</span>
                    </td>
                    <td className="py-3">
                      <span className="text-luxury-gold-400 font-semibold">{formatCommission(lead.budget * 0.03)}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 premium-card p-6 text-center">
          <p className="text-sm text-gray-400 mb-4">
            <strong className="text-white">Zero subscription.</strong> Only 3% success fee on closed bookings. See exactly how LeadLuxe AI transforms {name}.
          </p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            <Phone className="w-4 h-4" /> Book Builder Demo — See Your Pipeline
          </button>
        </div>
      </div>
    </div>
  );
}

export function DemoBaner() { return <DemoProjectTemplate name="VTP Baner" tagline="Premium Luxury Apartments · Baner, Pune" logo="🏗️" />; }
export function DemoKharadi() { return <DemoProjectTemplate name="Godrej Kharadi" tagline="Premium Township · Kharadi, Pune" logo="🏘️" />; }
export function DemoWakad() { return <DemoProjectTemplate name="Kolte Patil Wakad" tagline="Luxury Residences · Wakad, Pune" logo="🏛️" />; }
