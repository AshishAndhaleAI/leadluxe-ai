// ============================================================
// Phase 5: Investor Report Generator
// Produces professional PDF-ready investment analysis reports
// ============================================================

import type { InvestmentExplanation } from './ExplanationLayer';
import type { ScoringResult } from './InvestmentScoringEngine';

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  type: 'summary' | 'analysis' | 'data' | 'risk' | 'forecast' | 'recommendation';
}

export interface InvestmentReport {
  title: string;
  subtitle: string;
  generatedAt: string;
  executiveSummary: string;
  sections: ReportSection[];
  scoreSummary: {
    overall: number;
    confidence: number;
    factors: { name: string; score: number; weight: string }[];
  };
  riskMatrix: { risk: string; likelihood: string; impact: string }[];
  commissionProjection: string;
  dataSources: string[];
  aiRecommendation: string;
  disclaimer: string;
}

export function generateInvestmentReport(
  projectName: string,
  city: string,
  country: string,
  priceRange: string,
  dealValue: number,
  score: ScoringResult,
  explanation: InvestmentExplanation
): InvestmentReport {
  const now = new Date();
  const priceStr = priceRange || `₹${(dealValue / 10000000).toFixed(1)} Cr`;

  const sections: ReportSection[] = [
    {
      id: 'location-analysis',
      title: 'Location Analysis',
      content: `${projectName} is situated in ${city}, ${country}. ${explanation.comparableMarketContext}`,
      type: 'analysis',
    },
    {
      id: 'scoring-breakdown',
      title: 'Investment Score Breakdown',
      content: `The opportunity scores ${score.overallScore}/100 based on 8 weighted factors. Price momentum scores ${score.factors.priceMomentum}/100 (weight 20%), rental yield at ${score.factors.rentalYield}/100 (15%), inventory absorption at ${score.factors.inventoryAbsorption}/100 (10%), infrastructure pipeline at ${score.factors.infrastructurePipeline}/100 (15%), developer reputation at ${score.factors.developerReputation}/100 (10%), foreign investment flow at ${score.factors.foreignInvestmentFlow}/100 (10%), currency stability at ${score.factors.currencyStability}/100 (10%), and liquidity risk at ${score.factors.liquidityRisk}/100 (10%).`,
      type: 'data',
    },
    {
      id: 'yield-analysis',
      title: 'Yield & Return Analysis',
      content: `The estimated deal value is ${priceStr}. Based on the scoring model, the expected annual appreciation is projected at ${
        score.overallScore >= 80 ? '8-12%' :
        score.overallScore >= 65 ? '5-8%' :
        score.overallScore >= 50 ? '3-5%' : '2-4%'
      } over a ${explanation.suggestedHoldingPeriod.toLowerCase()} holding period.`,
      type: 'analysis',
    },
    {
      id: 'appreciation-forecast',
      title: 'Appreciation Forecast',
      content: `The ${score.factors.priceMomentum >= 70 ? 'strong' : 'moderate'} price momentum score (${score.factors.priceMomentum}/100) suggests ${
        score.factors.priceMomentum >= 80 ? 'above-market' :
        score.factors.priceMomentum >= 60 ? 'market-aligned' : 'below-market'
      } appreciation potential. Infrastructure catalysts add ${
        score.factors.infrastructurePipeline >= 70 ? 'significant' : 'moderate'
      } upside.`,
      type: 'forecast',
    },
    {
      id: 'risk-matrix',
      title: 'Risk Assessment Matrix',
      content: score.downsideRisks.map((r, i) =>
        `${i + 1}. ${r} — ${r.includes('currency') ? 'Medium likelihood, High impact' : r.includes('inventory') ? 'Medium likelihood, Medium impact' : 'Low likelihood, Medium impact'}`
      ).join('\n'),
      type: 'risk',
    },
    {
      id: 'commission-projection',
      title: 'Commission Analysis',
      content: explanation.expectedCommissionOutcome,
      type: 'data',
    },
    {
      id: 'ai-recommendation',
      title: 'AI Recommendation',
      content: explanation.aiConfidenceStatement + '\n\nRecommended next steps:\n' + explanation.nextSteps.map(s => `• ${s}`).join('\n'),
      type: 'recommendation',
    },
  ];

  const riskMatrix = score.downsideRisks.slice(0, 5).map(risk => ({
    risk,
    likelihood: risk.includes('currency') || risk.includes('volatility') ? 'Medium' :
                risk.includes('inventory') || risk.includes('liquidity') ? 'Medium' : 'Low',
    impact: risk.includes('currency') || risk.includes('depreciation') ? 'High' :
            risk.includes('liquidity') ? 'High' : 'Medium',
  }));

  return {
    title: `${projectName} — Investment Analysis Report`,
    subtitle: `${city}, ${country} | ${priceStr}`,
    generatedAt: now.toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
    executiveSummary: explanation.executiveSummary,
    sections,
    scoreSummary: {
      overall: score.overallScore,
      confidence: score.confidence,
      factors: [
        { name: 'Price Momentum', score: score.factors.priceMomentum, weight: '20%' },
        { name: 'Rental Yield', score: score.factors.rentalYield, weight: '15%' },
        { name: 'Inventory Absorption', score: score.factors.inventoryAbsorption, weight: '10%' },
        { name: 'Infrastructure Pipeline', score: score.factors.infrastructurePipeline, weight: '15%' },
        { name: 'Developer Reputation', score: score.factors.developerReputation, weight: '10%' },
        { name: 'Foreign Investment Flow', score: score.factors.foreignInvestmentFlow, weight: '10%' },
        { name: 'Currency Stability', score: score.factors.currencyStability, weight: '10%' },
        { name: 'Liquidity Risk', score: score.factors.liquidityRisk, weight: '10%' },
      ],
    },
    riskMatrix,
    commissionProjection: explanation.expectedCommissionOutcome,
    dataSources: [
      'LeadLuxe AI Global Property Database',
      'Local market intelligence feeds',
      'Public infrastructure project records',
      'Developer public disclosures',
      'Central bank economic indicators',
      'Foreign investment tracking',
    ],
    aiRecommendation: explanation.nextSteps.slice(0, 3).map(s => s.replace(/^./, c => c.toUpperCase())).join('. ') + '.',
    disclaimer: 'This report is generated by LeadLuxe AI for informational purposes only. It does not constitute financial advice, investment recommendation, or solicitation. All investment decisions should be made after consulting with qualified professionals. LeadLuxe earns commission only when a deal closes — we are aligned with your success.',
  };
}

// =====================
// PRINT-FRIENDLY HTML EXPORT
// =====================
export function renderReportAsHTML(report: InvestmentReport): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${report.title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #0A0A0F; color: #E5E7EB; padding: 40px; }
    .report { max-width: 900px; margin: 0 auto; }
    .header { text-align: center; padding: 40px 0; border-bottom: 1px solid #1F2937; margin-bottom: 32px; }
    .header h1 { font-size: 28px; font-weight: 700; color: #F59E0B; margin-bottom: 8px; }
    .header p { color: #9CA3AF; font-size: 14px; }
    .exec-summary { background: linear-gradient(135deg, #1A1A2E, #0F0F1A); border: 1px solid #D4AF37/20; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .exec-summary h2 { color: #F59E0B; font-size: 16px; margin-bottom: 8px; }
    .exec-summary p { font-size: 13px; line-height: 1.7; color: #D1D5DB; }
    .section { background: #111118; border: 1px solid #1F2937; border-radius: 12px; padding: 24px; margin-bottom: 16px; }
    .section h3 { color: #F59E0B; font-size: 14px; margin-bottom: 12px; }
    .section p, .section li { font-size: 13px; line-height: 1.7; color: #D1D5DB; }
    .score-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
    .score-item { text-align: center; padding: 12px; background: #0A0A0F; border-radius: 8px; border: 1px solid #1F2937; }
    .score-item .value { font-size: 24px; font-weight: 700; color: #F59E0B; }
    .score-item .label { font-size: 11px; color: #6B7280; margin-top: 4px; }
    .risk-table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    .risk-table th, .risk-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #1F2937; font-size: 12px; }
    .risk-table th { color: #9CA3AF; font-weight: 500; text-transform: uppercase; font-size: 10px; }
    .risk-table td { color: #D1D5DB; }
    .disclaimer { text-align: center; padding: 24px; font-size: 11px; color: #4B5563; border-top: 1px solid #1F2937; margin-top: 32px; }
    .btn-print { position: fixed; top: 20px; right: 20px; padding: 10px 20px; background: #D4AF37; color: #0A0A0F; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 13px; }
    @media print { body { background: white; color: black; padding: 0; } .btn-print { display: none; } .section { border-color: #ddd; background: white; } .exec-summary { background: #f8f8f8; border-color: #ddd; } .header h1 { color: #B8860B; } .section h3 { color: #B8860B; } .score-item .value { color: #B8860B; } }
  </style>
</head>
<body>
  <button class="btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
  <div class="report">
    <div class="header">
      <h1>${report.title}</h1>
      <p>${report.subtitle} · Generated ${report.generatedAt}</p>
    </div>

    <div class="exec-summary">
      <h2>📋 Executive Summary</h2>
      <p>${report.executiveSummary}</p>
    </div>

    <div class="score-grid">
      <div class="score-item">
        <div class="value">${report.scoreSummary.overall}/100</div>
        <div class="label">Investment Score</div>
      </div>
      <div class="score-item">
        <div class="value">${report.scoreSummary.confidence}%</div>
        <div class="label">AI Confidence</div>
      </div>
      <div class="score-item">
        <div class="value">${report.scoreSummary.factors.length}</div>
        <div class="label">Factors Analyzed</div>
      </div>
      <div class="score-item">
        <div class="value">${report.riskMatrix.length}</div>
        <div class="label">Risks Identified</div>
      </div>
    </div>

    ${report.sections.map(section => `
      <div class="section">
        <h3>${section.title}</h3>
        ${section.type === 'risk' ? `
          <table class="risk-table">
            <thead><tr><th>Risk Factor</th><th>Likelihood</th><th>Impact</th></tr></thead>
            <tbody>
              ${report.riskMatrix.map(r => `
                <tr><td>${r.risk}</td><td>${r.likelihood}</td><td>${r.impact}</td></tr>
              `).join('')}
            </tbody>
          </table>
        ` : `<p>${section.content.replace(/\\n/g, '<br/>')}</p>`}
      </div>
    `).join('')}

    <div class="disclaimer">
      <p>${report.disclaimer}</p>
      <p style="margin-top: 8px;">LeadLuxe AI · ${report.generatedAt}</p>
    </div>
  </div>
</body>
</html>`;
}
