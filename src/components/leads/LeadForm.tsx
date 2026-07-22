import { useState } from 'react';
import { X, Send, IndianRupee } from 'lucide-react';
import { calculateLeadScore, getLeadCategory } from '../../lib/ai-scoring';
import type { Lead } from '../../types';
import { LEAD_SOURCE_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface LeadFormProps {
  onSubmit: (lead: Partial<Lead>) => Promise<void>;
  onClose?: () => void;
  initialData?: Partial<Lead>;
  isModal?: boolean;
}

export function LeadForm({ onSubmit, onClose, initialData, isModal }: LeadFormProps) {
  const [formData, setFormData] = useState<Partial<Lead>>({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    budget: initialData?.budget || undefined,
    preferred_location: initialData?.preferred_location || '',
    property_type: initialData?.property_type || '',
    visit_timeline: initialData?.visit_timeline || '',
    source: initialData?.source || 'website',
    notes: initialData?.notes || '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showScore, setShowScore] = useState(false);

  // Calculate live score preview
  const { score, factors, details } = calculateLeadScore(formData);
  const category = getLeadCategory(score);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitting(true);
    try {
      await onSubmit(formData);
      if (!initialData) {
        setFormData({
          name: '', phone: '', email: '', budget: undefined,
          preferred_location: '', property_type: '', visit_timeline: '',
          source: 'website', notes: '',
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name *</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="e.g. Rajesh Patel"
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Phone Number *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="rajesh@example.com"
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Budget Range</label>
          <div className="relative">
            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="number"
              value={formData.budget || ''}
              onChange={(e) => updateField('budget', e.target.value ? Number(e.target.value) : undefined)}
              placeholder="e.g. 5000000"
              className="w-full pl-9 pr-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Preferred Location</label>
          <input
            type="text"
            value={formData.preferred_location || ''}
            onChange={(e) => updateField('preferred_location', e.target.value)}
            placeholder="e.g. South Mumbai"
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Property Type</label>
          <select
            value={formData.property_type || ''}
            onChange={(e) => updateField('property_type', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          >
            <option value="">Select type</option>
            <option value="Apartment">Apartment</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Villa">Villa</option>
            <option value="Studio">Studio</option>
            <option value="Commercial">Commercial</option>
            <option value="Plot">Plot/Land</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Visit Timeline</label>
          <select
            value={formData.visit_timeline || ''}
            onChange={(e) => updateField('visit_timeline', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          >
            <option value="">Select timeline</option>
            <option value="Immediate">Immediate / ASAP</option>
            <option value="This week">This Week</option>
            <option value="This month">This Month</option>
            <option value="Within 2 weeks">Within 2 Weeks</option>
            <option value="Next month">Next Month</option>
            <option value="3 months">Within 3 Months</option>
            <option value="Exploring">Just Exploring</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Lead Source</label>
          <select
            value={formData.source || 'website'}
            onChange={(e) => updateField('source', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
          >
            {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5">Notes</label>
        <textarea
          value={formData.notes || ''}
          onChange={(e) => updateField('notes', e.target.value)}
          rows={2}
          placeholder="Any additional notes about this lead..."
          className="w-full px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 transition-colors resize-none"
        />
      </div>

      {/* AI Score Preview */}
      <div>
        <button
          type="button"
          onClick={() => setShowScore(!showScore)}
          className="text-xs text-luxury-gold-400 hover:text-luxury-gold-300 transition-colors"
        >
          {showScore ? 'Hide' : 'Show'} AI Score Preview
        </button>
        {showScore && (
          <div className="mt-2 p-3 rounded-lg bg-gray-900 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">Lead Score: {score}/100</span>
              <span className={cn('text-xs px-2 py-0.5 rounded-full', category.color)}>
                {category.label}
              </span>
            </div>
            <div className="space-y-1">
              {details.map((detail, i) => (
                <p key={i} className="text-xs text-gray-500">• {detail}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting || !formData.name || !formData.phone}
          className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30 rounded-lg text-sm font-medium hover:bg-luxury-gold-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          {initialData ? 'Update Lead' : 'Capture Lead'}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl rounded-xl border border-gray-800 bg-gray-950 p-6 animate-slide-up">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-white mb-6">Capture New Lead</h2>
          {formContent}
        </div>
      </div>
    );
  }

  return formContent;
}
