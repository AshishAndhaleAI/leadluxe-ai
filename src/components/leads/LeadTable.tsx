import { useState } from 'react';
import { useNavigate } from 'react-router-dom';import { Search, ArrowUpDown, Phone, Mail, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { LeadScoreIndicator } from '../ui/LeadScoreIndicator';
import { formatDate, cn } from '../../lib/utils';
import { formatIndianCurrency } from '../../lib/format';
import type { Lead, LeadStatus } from '../../types';
import { LEAD_STATUS_LABELS, LEAD_SOURCE_LABELS } from '../../types';

interface LeadTableProps {
  leads: Lead[];
  loading?: boolean;
  onStatusChange?: (id: string, status: LeadStatus) => void;
}

export function LeadTable({ leads, loading, onStatusChange }: LeadTableProps) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'budget' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLeads = leads
    .filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          lead.name.toLowerCase().includes(q) ||
          lead.phone.includes(q) ||
          lead.email?.toLowerCase().includes(q) ||
          lead.preferred_location?.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      if (sortBy === 'name') return a.name.localeCompare(b.name) * multiplier;
      if (sortBy === 'score') return (a.score - b.score) * multiplier;
      if (sortBy === 'budget') return ((a.budget || 0) - (b.budget || 0)) * multiplier;
      return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * multiplier;
    });

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
  const paginatedLeads = filteredLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-luxury-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search leads by name, phone, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-luxury-gold-500/50 focus:ring-1 focus:ring-luxury-gold-500/20 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as LeadStatus | 'all');
            setCurrentPage(1);
          }}
          className="px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-luxury-gold-500/50 transition-colors"
        >
          <option value="all">All Statuses</option>
          {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button className="flex items-center gap-2 px-3 py-2.5 bg-gray-900 border border-gray-800 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-700 transition-colors">
          <Download className="w-4 h-4" />
          Export
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 bg-gray-900/80">
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => toggleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Contact</th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => toggleSort('budget')}
              >
                <div className="flex items-center gap-1">
                  Budget
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white"
                onClick={() => toggleSort('score')}
              >
                <div className="flex items-center gap-1">
                  Score
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/50">
            {paginatedLeads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => navigate(`/lead/${lead.id}`)}
                className="group cursor-pointer transition-colors hover:bg-gray-800/40"
              >
                <td className="px-4 py-3.5">
                  <div>
                    <p className="text-sm font-medium text-white group-hover:text-luxury-gold-300 transition-colors">
                      {lead.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{LEAD_SOURCE_LABELS[lead.source]}</p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Phone className="w-3 h-3 text-gray-600" />
                      <span>{lead.phone}</span>
                    </div>
                    {lead.email && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Mail className="w-3 h-3 text-gray-600" />
                        <span className="truncate max-w-[160px]">{lead.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-white font-medium">
                    {lead.budget ? formatIndianCurrency(lead.budget) : '-'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <span className="text-sm text-gray-400 truncate max-w-[120px] block">
                    {lead.preferred_location || '-'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <StatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3.5">
                  <LeadScoreIndicator score={lead.score} size="sm" />
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpDown className="w-4 h-4 text-luxury-gold-400" />
                  </div>
                </td>
              </tr>
            ))}
            {paginatedLeads.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 text-gray-700" />
                    <p className="text-gray-500 text-sm">No leads found</p>
                    <p className="text-gray-600 text-xs">Try adjusting your search or filters</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredLeads.length)} of {filteredLeads.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  page === currentPage
                    ? 'bg-luxury-gold-500/20 text-luxury-gold-400 border border-luxury-gold-500/30'
                    : 'text-gray-400 border border-gray-800 hover:text-white hover:border-gray-700'
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
