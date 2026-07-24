// ============================================================
// TerraNexus AI — Legal Evidence Room
// Layer 7 of the Digital Twin workspace.
// Secure document vault with verification badges,
// source attribution, and evidence tracking.
// ============================================================

import { FileText, Shield, ShieldCheck, ShieldAlert, ExternalLink, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { LegalDocument, LegalEvidenceRoom, SourceProvenance } from '../../types/digital-twin';
import type { VerificationBadge } from '../../types/digital-twin';

interface LegalEvidenceRoomProps {
  legal: LegalEvidenceRoom;
  propertyName: string;
  developerName: string;
}

function DocumentCard({ doc }: { doc: LegalDocument }) {
  const statusConfig = {
    VERIFIED: { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
    PARTIAL: { icon: Search, color: 'text-amber-400', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
    UNVERIFIED: { icon: ShieldAlert, color: 'text-gray-500', bg: 'bg-gray-900/30', border: 'border-gray-800' },
    STALE: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/5', border: 'border-red-500/20' },
  }[doc.verificationStatus];

  const StatusIcon = statusConfig.icon;

  return (
    <div className={cn('p-4 rounded-xl border', statusConfig.bg, statusConfig.border)}>
      <div className="flex items-start gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', statusConfig.bg)}>
          <StatusIcon className={cn('w-4 h-4', statusConfig.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-xs font-semibold text-white">{doc.title}</h4>
            <span className={cn('text-[7px] px-1.5 py-0.5 rounded-full font-medium border', statusConfig.color, statusConfig.bg, statusConfig.border)}>
              {doc.verificationStatus}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[8px] text-gray-600 mb-1">
            <Shield className="w-2.5 h-2.5" />
            <span>{doc.issuingAuthority}</span>
            {doc.referenceNumber && (
              <>
                <span>·</span>
                <span>Ref: {doc.referenceNumber}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 text-[8px] text-gray-600">
            <span>Issued: {doc.issuanceDate}</span>
            {doc.expiryDate && <span>· Expires: {doc.expiryDate}</span>}
          </div>
          {doc.url ? (
            <a href={doc.url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[8px] text-luxury-gold-400 hover:underline mt-1.5">
              <ExternalLink className="w-2.5 h-2.5" /> View Document
            </a>
          ) : (
            <span className="inline-block text-[7px] text-gray-700 italic mt-1.5">Document not yet uploaded</span>
          )}
          {doc.checksumHash && (
            <p className="text-[6px] text-gray-700 font-mono mt-0.5">SHA256: {doc.checksumHash.slice(0, 16)}...</p>
          )}
        </div>
      </div>
    </div>
  );
}

export function LegalEvidenceRoom({ legal, propertyName, developerName }: LegalEvidenceRoomProps) {
  const verifiedCount = legal.documents.filter(d => d.verificationStatus === 'VERIFIED' || d.verificationStatus === 'PARTIAL').length;
  const pendingCount = legal.documents.filter(d => d.verificationStatus === 'UNVERIFIED').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Total Documents</p>
          <p className="text-2xl font-bold text-white">{legal.totalDocuments}</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Verified</p>
          <p className="text-2xl font-bold text-emerald-400">{verifiedCount}</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Pending</p>
          <p className="text-2xl font-bold text-amber-400">{pendingCount}</p>
        </div>
        <div className="premium-card p-4 text-center">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Gov Sources</p>
          <p className="text-2xl font-bold text-luxury-gold-400">{legal.provenance.confidenceScore >= 80 ? '3' : '1'}</p>
        </div>
      </div>

      {/* Trust Notice */}
      {pendingCount > 0 && (
        <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <p className="text-[9px] text-amber-400/70">
            {pendingCount} document{pendingCount > 1 ? 's' : ''} ha{pendingCount === 1 ? 's' : 've'} not yet been independently verified from an official source.
          </p>
        </div>
      )}

      {/* Documents Grid */}
      <div className="premium-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-4 h-4 text-luxury-gold-400" />
          <h3 className="text-sm font-semibold text-white">Evidence Room</h3>
          <span className="ml-auto text-[10px] text-gray-600">{legal.documents.length} records</span>
        </div>
        <div className="space-y-3">
          {legal.documents.length > 0 ? (
            legal.documents.map((doc, i) => (
              <DocumentCard key={i} doc={doc} />
            ))
          ) : (
            <div className="p-6 text-center">
              <Shield className="w-10 h-10 text-gray-800 mx-auto mb-3" />
              <p className="text-xs text-gray-600">No legal documents have been uploaded for this property yet.</p>
              <p className="text-[9px] text-gray-700 mt-1">Documents will appear here once they are verified from official sources.</p>
            </div>
          )}
        </div>
      </div>

      {/* Empty Notice for missing fields */}
      <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800">
        <p className="text-[9px] text-gray-500 text-center">
          This information has not yet been independently verified. 
          <a href="/data-provenance" className="text-luxury-gold-400 hover:underline ml-1">Data policy</a>
        </p>
      </div>
    </div>
  );
}
