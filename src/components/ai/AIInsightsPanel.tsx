import React, { useState, useEffect } from 'react';
import { AIAnalysisRecord, AISeverity } from '../../types';
import { aiService } from '../../services/aiService';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface AIInsightsPanelProps {
  batchId: string;
  productName: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ batchId, productName }) => {
  const [records, setRecords] = useState<AIAnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRunningDiag, setIsRunningDiag] = useState(false);

  useEffect(() => {
    loadAIAnalysis();
    const unsubscribe = aiService.subscribe(() => {
      loadAIAnalysis();
    });
    return () => {
      unsubscribe();
    };
  }, [batchId]);

  const loadAIAnalysis = async () => {
    setLoading(true);
    try {
      const data = await aiService.getAIAnalysisForBatch(batchId);
      setRecords(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDiagnosis = async () => {
    setIsRunningDiag(true);
    try {
      await aiService.runAIDiagnosis(batchId);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunningDiag(false);
    }
  };

  const getSeverityBadge = (severity: AISeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-100 text-rose-900 border-rose-300';
      case 'HIGH':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'LOW':
      default:
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
  };

  return (
    <div
      id="ai-insights-panel"
      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4 text-purple-700" />
            </span>
            <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">
              AI-Ready Intelligence & Anomaly Guard
            </span>
            <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold">
              Demo AI Result
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            Intelligent Risk & Condition Analysis
          </h3>
          <p className="text-xs text-slate-500">
            Real-time inference on solar micro-climate thermal curves, residue spectrometry & supply-chain DAG integrity.
          </p>
        </div>

        <button
          id="run-ai-diagnosis-btn"
          onClick={handleRunDiagnosis}
          disabled={isRunningDiag}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs sm:text-sm font-bold transition-all shadow-xs disabled:opacity-75"
        >
          <RefreshCw className={`w-4 h-4 ${isRunningDiag ? 'animate-spin' : ''}`} />
          <span>{isRunningDiag ? 'Running Edge Inference...' : 'Run AI Batch Diagnosis'}</span>
        </button>
      </div>

      {/* Notice Banner */}
      <div className="p-3 bg-purple-50/70 border border-purple-100 rounded-2xl text-xs text-purple-950 flex items-center gap-2.5">
        <Info className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          <strong>Simulated Edge-AI Pipeline:</strong> Inference results demonstrate automated contamination detection, thermal excursion forecasting, and dynamic shelf-life calculation for hackathon evaluation.
        </span>
      </div>

      {/* AI Cards List */}
      {loading ? (
        <div className="py-8 text-center text-xs text-slate-400">Loading AI intelligence models...</div>
      ) : records.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-400">No anomaly records detected for this batch.</div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => (
            <div
              key={rec.id}
              id={`ai-card-${rec.id}`}
              className={`p-5 rounded-2xl border transition-all ${
                rec.severity === 'CRITICAL'
                  ? 'bg-rose-50/60 border-rose-300'
                  : rec.severity === 'MEDIUM'
                  ? 'bg-amber-50/50 border-amber-300'
                  : 'bg-slate-50/80 border-slate-200/90 hover:bg-white hover:shadow-xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{rec.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border uppercase ${getSeverityBadge(rec.severity)}`}>
                    {rec.severity} Severity
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-500">Confidence:</span>
                  <span className="font-bold text-purple-700">
                    {(rec.confidence * 100).toFixed(1)}%
                  </span>
                  <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-purple-600 h-1.5 rounded-full"
                      style={{ width: `${rec.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Primary Result Headline */}
              <div className="p-3 bg-white rounded-xl border border-slate-200/80 mb-3 flex items-start gap-2.5">
                {rec.severity === 'CRITICAL' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                ) : rec.severity === 'MEDIUM' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {rec.result}
                  </span>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {rec.explanation}
                  </p>
                </div>
              </div>

              {/* Action Recommendation */}
              <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-900 flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    <strong>Recommended Action:</strong> {rec.recommendedAction}
                  </span>
                </div>
              </div>

              {/* Metadata Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                <div className="flex items-center gap-3">
                  <span>Model: <strong className="text-slate-700">{rec.modelVersion}</strong></span>
                  {rec.affectedStage && <span>Stage: <strong className="text-slate-700">{rec.affectedStage}</strong></span>}
                </div>
                <span>Inference: {new Date(rec.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
