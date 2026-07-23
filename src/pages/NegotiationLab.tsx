import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Handshake, TrendingDown, TrendingUp, DollarSign, Percent, Target, Shield, Zap, ArrowRight, Calculator, BarChart3 } from 'lucide-react';
import { simulateNegotiation } from '../lib/neural';
import { cn } from '../lib/utils';
import { getPropertyDatabase } from '../lib/property-database';
import { formatIndianCurrency, formatCommission } from '../lib/format';
import type { NegotiationInput, NegotiationResult } from '../lib/neural';

export function NegotiationLab() {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [askingPrice, setAskingPrice] = useState(5000000);
  const [inventoryMonths, setInventoryMonths] = useState(12);
  const [quarterEnd, setQuarterEnd] = useState(false);
  const [bulkUnits, setBulkUnits] = useState(1);
  const [brokerCompetition, setBrokerCompetition] = useState(50);
  const [daysOnMarket, setDaysOnMarket] = useState(90);

  const properties = useMemo(() => getPropertyDatabase(), []);

  const selectedPropertyData = useMemo(() => {
    if (!selectedProperty) return null;
    return properties.find(p => p.id === selectedProperty);
  }, [selectedProperty, properties]);

  const input: NegotiationInput = useMemo(() => ({
    propertyName: selectedPropertyData?.name || 'Custom Property',
    askingPrice,
    city: selectedPropertyData?.city || 'Mumbai',
    country: selectedPropertyData?.country || 'India',
    propertyType: selectedPropertyData?.property_type || 'apartment',
    inventoryMonths,
    quarterEnd,
    bulkUnits,
    brokerCompetition,
    developerReputation: selectedPropertyData?.confidence || 75,
    projectStage: 'launched',
    similarPropertiesPrice: askingPrice * 0.95,
    daysOnMarket,
    paymentTerms: 'standard',
  }), [selectedPropertyData, askingPrice, inventoryMonths, quarterEnd, bulkUnits, brokerCompetition, daysOnMarket]);

  const result: NegotiationResult | null = useMemo(() => {
    try { return simulateNegotiation(input); }
    catch { return null; }
  }, [input]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-luxury-gold-500/20 flex items-center justify-center">
            <Handshake className="w-5 h-5 text-luxury-gold-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">AI Negotiation Lab</h2>
            <p className="text-sm text-gray-500">Simulate developer counteroffers and optimize your deal strategy</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="premium-card p-4 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Calculator className="w-3.5 h-3.5 text-luxury-gold-400" />
            Deal Parameters
          </h3>

          {/* Property selector */}
          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Property</label>
            <select
              value={selectedProperty}
              onChange={e => {
                setSelectedProperty(e.target.value);
                const prop = properties.find(p => p.id === e.target.value);
                if (prop) {
                  setAskingPrice(prop.price_min);
                  setDaysOnMarket(Math.floor(Math.random() * 200) + 30);
                }
              }}
              className="w-full px-3 py-2 bg-black/30 border border-luxury-border rounded-lg text-xs text-white outline-none focus:border-luxury-gold-500/50"
            >
              <option value="">Custom Property</option>
              {properties.slice(0, 50).map(p => (
                <option key={p.id} value={p.id}>{p.name} — ₹{(p.price_min / 100000).toFixed(1)}L</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Asking Price (₹)</label>
            <input type="number" value={askingPrice} onChange={e => setAskingPrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-black/30 border border-luxury-border rounded-lg text-xs text-white outline-none focus:border-luxury-gold-500/50" />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Inventory Months</label>
            <input type="range" min={3} max={36} value={inventoryMonths} onChange={e => setInventoryMonths(Number(e.target.value))}
              className="w-full accent-luxury-gold-500" />
            <div className="flex justify-between text-[8px] text-gray-600">
              <span>Tight (3mo)</span>
              <span className="text-white">{inventoryMonths} months</span>
              <span>Glut (36mo)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={quarterEnd} onChange={e => setQuarterEnd(e.target.checked)}
                className="accent-luxury-gold-500" />
              <span className="text-[10px] text-gray-400">Quarter End</span>
            </label>
            <label className="text-[10px] text-gray-500">Broker Competition: {brokerCompetition}%</label>
            <input type="range" min={0} max={100} value={brokerCompetition} onChange={e => setBrokerCompetition(Number(e.target.value))}
              className="w-20 accent-luxury-gold-500" />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Bulk Units: {bulkUnits}</label>
            <input type="range" min={1} max={20} value={bulkUnits} onChange={e => setBulkUnits(Number(e.target.value))}
              className="w-full accent-luxury-gold-500" />
          </div>

          <div>
            <label className="text-[10px] text-gray-500 mb-1 block">Days on Market: {daysOnMarket}</label>
            <input type="range" min={1} max={365} value={daysOnMarket} onChange={e => setDaysOnMarket(Number(e.target.value))}
              className="w-full accent-luxury-gold-500" />
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Recommended Offer', value: formatIndianCurrency(result.recommendedOffer), icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Max Walk Away', value: formatIndianCurrency(result.maxWalkAwayPrice), icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10' },
                  { label: 'Discount Range', value: `${result.expectedDiscountMin}-${result.expectedDiscountMax}%`, icon: Percent, color: 'text-luxury-gold-400', bg: 'bg-luxury-gold-500/10' },
                  { label: 'Commission Impact', value: formatCommission(result.commissionImpact), icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="premium-card p-3 text-center"
                  >
                    <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center mx-auto mb-1', stat.bg)}>
                      <stat.icon className={cn('w-3.5 h-3.5', stat.color)} />
                    </div>
                    <p className={cn('text-sm font-bold', stat.color)}>{stat.value}</p>
                    <p className="text-[9px] text-gray-500">{stat.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* Pressure Scores */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Inventory Pressure', value: result.inventoryPressureScore, color: result.inventoryPressureScore > 65 ? 'text-red-400' : 'text-amber-400' },
                  { label: 'Q-End Discount Prob', value: `${result.quarterEndDiscountProb}%`, color: 'text-luxury-gold-400' },
                  { label: 'Bulk Purchase Leverage', value: `${result.bulkPurchaseLeverage}%`, color: result.bulkPurchaseLeverage > 60 ? 'text-emerald-400' : 'text-gray-400' },
                  { label: 'Discount Probability', value: `${result.discountProbability}%`, color: result.discountProbability > 60 ? 'text-emerald-400' : 'text-amber-400' },
                ].map(stat => (
                  <div key={stat.label} className="premium-card p-3 flex items-center justify-between">
                    <span className="text-[10px] text-gray-500">{stat.label}</span>
                    <span className={cn('text-xs font-bold', stat.color)}>{stat.value}</span>
                  </div>
                ))}
              </div>

              {/* Counteroffer Simulation */}
              <div className="premium-card p-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BarChart3 className="w-3.5 h-3.5 text-luxury-gold-400" />
                  Developer Counteroffer Simulation
                </h3>
                <div className="space-y-2">
                  {result.developerCounterofferSimulation.map((round, i) => (
                    <div key={round.round} className={cn(
                      'p-3 rounded-lg border',
                      round.likelyOutcome === 'buyer_favored' ? 'border-emerald-500/20 bg-emerald-500/5' :
                      round.likelyOutcome === 'developer_favored' ? 'border-red-500/20 bg-red-500/5' :
                      'border-amber-500/20 bg-amber-500/5'
                    )}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-white">Round {round.round}</span>
                        <span className={cn(
                          'text-[9px] px-1.5 py-0.5 rounded font-medium',
                          round.likelyOutcome === 'buyer_favored' ? 'text-emerald-400 bg-emerald-500/10' :
                          round.likelyOutcome === 'developer_favored' ? 'text-red-400 bg-red-500/10' :
                          'text-amber-400 bg-amber-500/10'
                        )}>
                          {round.likelyOutcome.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px]">
                        <div><span className="text-gray-500">Developer: </span><span className="text-white font-medium">{formatIndianCurrency(round.developerPrice)}</span></div>
                        <div><span className="text-gray-500">Buyer: </span><span className="text-emerald-400 font-medium">{formatIndianCurrency(round.buyerPrice)}</span></div>
                        <div><span className="text-gray-500">Gap: </span><span className={cn('font-medium', round.gap > 100000 ? 'text-red-400' : 'text-emerald-400')}>{formatIndianCurrency(round.gap)}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Plan Options */}
              <div className="premium-card p-4">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Calculator className="w-3.5 h-3.5 text-luxury-gold-400" />
                  Payment Plan Options
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {result.paymentPlanOptions.map((plan, i) => (
                    <div key={plan.name} className="p-3 rounded-lg border border-luxury-border bg-black/30">
                      <p className="text-xs font-medium text-white mb-2">{plan.name}</p>
                      <div className="space-y-1 text-[9px] text-gray-400">
                        <p>Down: <span className="text-luxury-gold-400">{formatIndianCurrency(plan.downPayment)}</span></p>
                        {plan.installmentMonths > 0 && <p>{plan.installmentMonths} installments of <span className="text-white">{formatIndianCurrency(plan.monthlyPayment)}</span></p>}
                        <p>Total: <span className="text-white">{formatIndianCurrency(plan.totalCost)}</span></p>
                        <p>Discount: <span className={cn('font-medium', plan.discount > 0 ? 'text-emerald-400' : 'text-gray-500')}>{plan.discount}%</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategy */}
              <div className="premium-card p-4 bg-luxury-gold-500/5 border border-luxury-gold-500/10">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-luxury-gold-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-semibold text-white mb-1">AI Negotiation Strategy</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">{result.negotiationStrategy}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="premium-card p-8 text-center">
              <Handshake className="w-10 h-10 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Adjust parameters to see negotiation results</p>
              <p className="text-xs text-gray-600 mt-1">The AI will simulate developer counteroffers and recommend optimal strategies</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
