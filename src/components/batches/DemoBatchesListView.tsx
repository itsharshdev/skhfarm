import React, { useState } from 'react';
import { Batch } from '../../types';
import { ALL_DEMO_BATCHES } from '../../data/mockData';
import { StatusBadge } from '../common/StatusBadge';
import { RecordIntegrityBadge } from '../integrity/RecordIntegrityBadge';
import { dataIntegrityService } from '../../services/dataIntegrityService';
import { Search, Filter, ArrowRight, Layers, Warehouse, QrCode } from 'lucide-react';

interface DemoBatchesListViewProps {
  onSelectBatch: (batchId: string) => void;
}

export const DemoBatchesListView: React.FC<DemoBatchesListViewProps> = ({ onSelectBatch }) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const batches = Object.values(ALL_DEMO_BATCHES);

  const categories = ['ALL', ...Array.from(new Set(batches.map((b) => b.category)))];

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.batchId.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.productName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      b.origin.toLowerCase().includes(filterQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || b.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 pb-16 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                <Layers className="w-5 h-5" />
              </span>
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                Demo Batch Registry
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">
              Coherent Traceability & Storage Scenarios
            </h1>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Inspect test batches showcasing healthy verified journeys, solar cold storage, intermediate milling, and expiry warnings.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search batches..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'ALL' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBatches.map((batch) => (
          <div
            key={batch.batchId}
            id={`demo-registry-card-${batch.batchId}`}
            onClick={() => onSelectBatch(batch.batchId)}
            className="cursor-pointer rounded-2xl bg-white border border-slate-200/90 p-5 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {batch.batchId}
                </span>
                <div className="text-right">
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {batch.scoreBreakdown.totalScore} / 100
                  </span>
                  <span className="text-[10px] text-slate-400">Score</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                  {batch.productName}
                </h3>
                <span className="text-[11px] text-slate-500 block mt-0.5">{batch.category}</span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Origin:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px]">{batch.originFarmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custodian:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[170px]">{batch.currentOwner}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Storage Condition:</span>
                  <span className="font-medium text-emerald-700">
                    {batch.currentStorage ? `${batch.currentStorage.temperature}°C (${batch.currentStorage.conditionStatus})` : 'Ambient Shelf'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700">
              <div className="flex items-center gap-1.5">
                <StatusBadge status={batch.status} size="sm" />
                <RecordIntegrityBadge status={dataIntegrityService.getBatchIntegrityStatus(batch.batchId)} size="sm" />
              </div>
              <span className="flex items-center gap-1">
                <span>Inspect Trace</span>
                <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
