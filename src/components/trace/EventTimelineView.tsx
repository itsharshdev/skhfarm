import React, { useState } from 'react';
import { SupplyChainEvent, Batch, EvidenceRecord } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { dataIntegrityService } from '../../services/dataIntegrityService';
import {
  User,
  MapPin,
  Clock,
  Camera,
  MessageSquare,
  Thermometer,
  Sun,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ExternalLink,
  X,
  RefreshCw,
} from 'lucide-react';

interface EventTimelineViewProps {
  batch: Batch;
  selectedEventId?: string | null;
  onSelectEvent?: (eventId: string) => void;
}

export const EventTimelineView: React.FC<EventTimelineViewProps> = ({
  batch,
  selectedEventId,
  onSelectEvent,
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord | null>(null);

  // Helper to find evidence linked to event
  const getEventEvidence = (evidenceIds?: string[]): EvidenceRecord[] => {
    if (!evidenceIds || evidenceIds.length === 0) return [];
    return batch.evidences.filter((ev) => evidenceIds.includes(ev.evidenceId));
  };

  return (
    <div id="chronological-event-timeline" className="space-y-6 animate-fadeIn">
      {/* Timeline Header Info */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>
            <strong>Chronological Ledger:</strong> Every supply chain handoff is cryptographically sealed with timestamp, geolocation, and verified evidence.
          </span>
        </div>
        <span className="font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shrink-0">
          {batch.events.length} Sealed Handoffs
        </span>
      </div>

      {/* Vertical Timeline Path */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 ml-3 sm:ml-4 space-y-7">
        {batch.events.map((evt, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === batch.events.length - 1;
          const isSelected = selectedEventId === evt.eventId;
          const eventEvidences = getEventEvidence(evt.evidenceIds);

          return (
            <div
              key={evt.eventId}
              onClick={() => onSelectEvent && onSelectEvent(evt.eventId)}
              className="relative group cursor-pointer"
            >
              {/* Timeline Node Bullet */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-2 w-6 h-6 rounded-full border-4 border-white shadow-xs flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-500 ring-4 ring-emerald-300 scale-125'
                    : isFirst
                    ? 'bg-emerald-600'
                    : isLast
                    ? 'bg-teal-600 ring-2 ring-teal-300'
                    : 'bg-slate-700'
                }`}
              >
                <div className="w-1.5 h-1.5 bg-white rounded-full" />
              </div>

              {/* Event Card */}
              <div
                className={`p-5 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-400/20'
                    : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:border-emerald-300 hover:shadow-sm'
                }`}
              >
                {/* Event Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/60">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-slate-200/90 text-slate-800 rounded-md font-mono text-[11px] font-bold">
                      {evt.eventType}
                    </span>
                    <StatusBadge status={evt.verificationState} size="sm" />
                    {dataIntegrityService.getIncidentState() !== 'NORMAL' && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                        <RefreshCw className="w-2.5 h-2.5" />
                        <span>Recovered Ledger Block</span>
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 self-start sm:self-auto font-mono">
                    Qty: {evt.quantity}
                  </span>
                </div>

                {/* Organization & Actor */}
                <h4 className="text-base font-bold text-slate-900 mt-2.5">
                  {evt.organization}
                </h4>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {evt.actor} ({evt.actorRole})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {evt.location}
                  </span>
                </div>

                {/* Event Notes */}
                <p className="text-xs md:text-sm text-slate-700 mt-2.5 bg-white p-3 rounded-xl border border-slate-100 leading-relaxed">
                  {evt.notes}
                </p>

                {/* Storage Telemetry Badge if present */}
                {evt.storageCondition && (
                  <div className="mt-3 p-3 rounded-xl bg-teal-50/90 border border-teal-200 text-teal-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-teal-700 shrink-0" />
                      <span className="font-semibold">
                        Solar Storage Vault #04: {evt.storageCondition.temperature}°C · {evt.storageCondition.humidity}% RH
                      </span>
                    </div>
                    <span className="text-[10px] bg-teal-200/80 text-teal-900 px-2 py-0.5 rounded font-bold uppercase self-start sm:self-auto">
                      Within Safe Limits
                    </span>
                  </div>
                )}

                {/* Camera Evidence Gallery Thumbnails */}
                {eventEvidences.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      Verified Camera Evidence ({eventEvidences.length})
                    </span>

                    <div className="flex flex-wrap items-center gap-3">
                      {eventEvidences.map((ev) => (
                        <div
                          key={ev.evidenceId}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvidence(ev);
                          }}
                          className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all w-24 h-20 bg-slate-100 shrink-0"
                        >
                          <img
                            src={ev.previewUrl}
                            alt="Handoff evidence"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                            View Proof
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Evidence Enlarge Modal */}
      {selectedEvidence && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedEvidence(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">
                  Verified Device Camera Proof
                </h4>
                <p className="text-[11px] text-slate-500 font-mono">
                  {selectedEvidence.evidenceId} · {new Date(selectedEvidence.capturedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-950 flex items-center justify-center max-h-80">
              <img
                src={selectedEvidence.previewUrl}
                alt="Enlarged evidence"
                className="max-h-72 object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="p-4 space-y-2 text-xs text-slate-600 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Captured By:</span>
                <span className="font-semibold text-slate-800">{selectedEvidence.capturedBy}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Capture Location:</span>
                <span className="font-semibold text-slate-800">{selectedEvidence.captureLocation}</span>
              </div>
              {selectedEvidence.metadata?.tamperProofHash && (
                <div className="pt-2 border-t border-slate-200 font-mono text-[10px] text-slate-500 truncate">
                  SHA-256 Seal: {selectedEvidence.metadata.tamperProofHash}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
