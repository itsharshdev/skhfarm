import React, { useState, useMemo } from 'react';
import { LineageNode, LineageLink, Batch } from '../../types';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  GitFork,
  ArrowUpRight,
  ArrowDownRight,
  Sun,
  Layers,
  ChevronRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Thermometer,
  ShieldCheck,
  Building,
  User,
  MapPin,
  ExternalLink,
  Filter,
} from 'lucide-react';
import { DEMO_LINEAGE_NODES, DEMO_LINEAGE_LINKS } from '../../data/mockData';

interface LineageDAGGraphProps {
  batch: Batch;
  selectedNodeId?: string | null;
  onSelectNode: (nodeId: string, batchId?: string) => void;
  onSelectBatch?: (batchId: string) => void;
}

export const LineageDAGGraph: React.FC<LineageDAGGraphProps> = ({
  batch,
  selectedNodeId,
  onSelectNode,
  onSelectBatch,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UPSTREAM' | 'DOWNSTREAM' | 'SOLAR_CHAIN'>('ALL');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Generate or adapt nodes for the current active batch
  const { nodes, links } = useMemo(() => {
    if (batch.batchId === 'BIS-2026-092') {
      return {
        nodes: DEMO_LINEAGE_NODES,
        links: DEMO_LINEAGE_LINKS,
      };
    }

    // Dynamic fallback generation for other batches
    const dynamicNodes: LineageNode[] = [
      {
        id: `node-${batch.batchId}-farm`,
        batchId: batch.batchId,
        title: batch.originFarmerName || 'Origin Farm',
        type: 'RAW_MATERIAL',
        stage: 'Stage 1 · Farm Origin & Harvest',
        actor: batch.originFarmerName || 'Origin Producer',
        organization: batch.origin,
        location: batch.origin,
        timestamp: batch.harvestDate || batch.createdAt.split('T')[0],
        score: batch.scoreBreakdown.qualityScore + 75 > 100 ? 98 : batch.scoreBreakdown.qualityScore + 75,
        status: batch.contaminationFlag?.flagged ? 'Contamination Detected' : 'Verified Harvest',
        quantity: `${batch.quantity} ${batch.unit}`,
        parents: [],
        children: [`node-${batch.batchId}-storage`],
        riskFlag: batch.contaminationFlag?.flagged ? 'CRITICAL_CONTAMINATION' : undefined,
        notes: `Harvest lot logged with initial field quality grade and verified origin stamp.`,
      },
    ];

    if (batch.currentStorage || batch.storageUnit) {
      dynamicNodes.push({
        id: `node-${batch.batchId}-storage`,
        batchId: batch.batchId,
        title: batch.currentStorage?.storageUnitName || 'Solar Smart Storage',
        type: 'STORAGE',
        stage: 'Stage 2 · Solar Micro-Climate Vault',
        actor: batch.currentOwner,
        organization: batch.currentStorage?.location || batch.currentLocation,
        location: batch.currentLocation,
        timestamp: batch.currentStorage?.recordedAt?.split('T')[0] || batch.createdAt.split('T')[0],
        score: batch.scoreBreakdown.totalScore,
        status: batch.currentStorage?.conditionStatus === 'SAFE' ? 'Safe Solar Vault' : 'Condition Monitored',
        quantity: `${batch.quantity} ${batch.unit}`,
        parents: [`node-${batch.batchId}-farm`],
        children: [`node-${batch.batchId}-final`],
        storageTelemetry: {
          temperature: batch.currentStorage?.temperature ?? 18.0,
          humidity: batch.currentStorage?.humidity ?? 55,
          powerStatus: batch.currentStorage?.powerStatus ?? 'SOLAR',
          solarStatus: batch.currentStorage?.solarStatus ?? 'OPTIMAL',
          solarWatts: 3800,
          batteryPercentage: 92,
          safeRange: 'Safe Temperature Limits',
          isSafe: batch.currentStorage?.conditionStatus === 'SAFE',
        },
      });
    }

    dynamicNodes.push({
      id: `node-${batch.batchId}-final`,
      batchId: batch.batchId,
      title: batch.productName,
      type: batch.status === 'RETAILED' ? 'FINAL_PRODUCT' : 'MANUFACTURED',
      stage: 'Stage 3 · Current Product Lot',
      actor: batch.currentOwner,
      organization: batch.currentLocation,
      location: batch.currentLocation,
      timestamp: batch.createdAt.split('T')[0],
      score: batch.scoreBreakdown.totalScore,
      status: batch.status,
      quantity: `${batch.quantity} ${batch.unit}`,
      current: true,
      parents: batch.currentStorage ? [`node-${batch.batchId}-storage`] : [`node-${batch.batchId}-farm`],
      children: [],
      riskFlag: batch.contaminationFlag?.flagged ? 'RECALL_FLAGGED' : undefined,
    });

    const dynamicLinks: LineageLink[] = [];
    if (batch.currentStorage) {
      dynamicLinks.push(
        {
          source: `node-${batch.batchId}-farm`,
          target: `node-${batch.batchId}-storage`,
          label: 'Conditioned Solar Intake',
          type: 'SOLAR_INTAKE',
          animated: true,
        },
        {
          source: `node-${batch.batchId}-storage`,
          target: `node-${batch.batchId}-final`,
          label: 'Storage & Custody Transfer',
          type: 'DISTRIBUTION_PACK',
          animated: true,
        }
      );
    } else {
      dynamicLinks.push({
        source: `node-${batch.batchId}-farm`,
        target: `node-${batch.batchId}-final`,
        label: 'Direct Transfer',
        type: 'DISTRIBUTION_PACK',
        animated: true,
      });
    }

    return { nodes: dynamicNodes, links: dynamicLinks };
  }, [batch]);

  // Determine highlighted nodes based on filter mode
  const highlightedNodeIds = useMemo(() => {
    if (filterMode === 'ALL') return new Set(nodes.map((n) => n.id));

    if (filterMode === 'SOLAR_CHAIN') {
      return new Set(
        nodes
          .filter((n) => n.type === 'STORAGE' || n.type === 'TRANSIT' || n.storageTelemetry)
          .map((n) => n.id)
      );
    }

    const currentOrSelected =
      selectedNodeId || nodes.find((n) => n.current)?.id || nodes[nodes.length - 1]?.id;

    if (!currentOrSelected) return new Set(nodes.map((n) => n.id));

    const result = new Set<string>([currentOrSelected]);

    if (filterMode === 'UPSTREAM') {
      // Traverse parents recursively
      const queue = [currentOrSelected];
      while (queue.length > 0) {
        const currId = queue.shift()!;
        const nodeObj = nodes.find((n) => n.id === currId);
        if (nodeObj?.parents) {
          nodeObj.parents.forEach((parentId) => {
            if (!result.has(parentId)) {
              result.add(parentId);
              queue.push(parentId);
            }
          });
        }
      }
    } else if (filterMode === 'DOWNSTREAM') {
      // Traverse children recursively
      const queue = [currentOrSelected];
      while (queue.length > 0) {
        const currId = queue.shift()!;
        const nodeObj = nodes.find((n) => n.id === currId);
        if (nodeObj?.children) {
          nodeObj.children.forEach((childId) => {
            if (!result.has(childId)) {
              result.add(childId);
              queue.push(childId);
            }
          });
        }
      }
    }

    return result;
  }, [nodes, filterMode, selectedNodeId]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.75, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setFilterMode('ALL');
  };

  // Group nodes by stage column for responsive desktop DAG layout
  const groupedStages = useMemo(() => {
    // Collect distinct parent-to-child paths
    const stageCols: { [col: string]: LineageNode[] } = {
      'Origin (Farms)': [],
      'Storage & Pre-Cooling': [],
      'Processing & Transit': [],
      'Formulation & Bakery': [],
      'Retail Shelf & Consumer': [],
    };

    nodes.forEach((node) => {
      if (node.id === 'node-wheat-farm' || node.id === 'node-sugar-farm' || node.type === 'RAW_MATERIAL') {
        if (node.id === 'node-seed-split') {
          stageCols['Storage & Pre-Cooling'].push(node);
        } else {
          stageCols['Origin (Farms)'].push(node);
        }
      } else if (node.type === 'STORAGE' || node.id === 'node-solar-cool') {
        stageCols['Storage & Pre-Cooling'].push(node);
      } else if (node.type === 'INTERMEDIATE' || node.type === 'TRANSIT' || node.id === 'node-maida' || node.id === 'node-reefer-transit') {
        stageCols['Processing & Transit'].push(node);
      } else if (node.type === 'MANUFACTURED' || node.id === 'node-biscuits') {
        stageCols['Formulation & Bakery'].push(node);
      } else {
        stageCols['Retail Shelf & Consumer'].push(node);
      }
    });

    return stageCols;
  }, [nodes]);

  return (
    <div
      id="lineage-dag-graph-container"
      className={`bg-slate-900 rounded-3xl border border-slate-800 text-white overflow-hidden shadow-sm transition-all relative ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-slate-950 p-6' : 'p-4 sm:p-6'
      }`}
    >
      {/* Top Header & Interactive Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                Interactive Lineage DAG (Directed Acyclic Graph)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                Multi-Parent & Split Traversal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any node to inspect batch integrity, cold-chain telemetry, certificates, and multi-ingredient handoffs.
            </p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Traversal Mode Filter */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                filterMode === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Nodes
            </button>
            <button
              onClick={() => setFilterMode('UPSTREAM')}
              title="Trace ancestry to raw farms"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                filterMode === 'UPSTREAM'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Upstream</span>
            </button>
            <button
              onClick={() => setFilterMode('DOWNSTREAM')}
              title="Trace forward to finished products"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                filterMode === 'DOWNSTREAM'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Downstream</span>
            </button>
            <button
              onClick={() => setFilterMode('SOLAR_CHAIN')}
              title="Filter solar cold-chain nodes"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-colors ${
                filterMode === 'SOLAR_CHAIN'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Solar Chain</span>
            </button>
          </div>

          {/* Zoom & Screen Controls */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[10px] text-slate-300">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors ml-0.5"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors ml-0.5"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen DAG'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Traversal Banner Notice if active */}
      {filterMode !== 'ALL' && (
        <div className="mt-3 p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {filterMode === 'UPSTREAM' && 'Tracing upstream origin path: highlighting raw farm harvests and intermediate inputs.'}
              {filterMode === 'DOWNSTREAM' && 'Tracing downstream distribution path: highlighting manufacturing lot and retail shelves.'}
              {filterMode === 'SOLAR_CHAIN' && 'Filtering active cold-chain hubs & refrigerated transit nodes with temperature data.'}
            </span>
          </div>
          <button
            onClick={() => setFilterMode('ALL')}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
          >
            Show All
          </button>
        </div>
      )}

      {/* Main Interactive DAG Canvas */}
      <div
        className="mt-4 overflow-x-auto pb-4 transition-transform duration-200 origin-top-left"
        style={{ transform: `scale(${zoomLevel})` }}
      >
        {/* Desktop Multi-Column Grid Flow */}
        <div className="min-w-[900px] grid grid-cols-5 gap-4 relative pt-2">
          {(Object.entries(groupedStages) as [string, LineageNode[]][]).map(([colTitle, colNodes], colIndex) => (
            <div key={colTitle} className="space-y-3">
              {/* Column Stage Header */}
              <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 truncate">
                  {colTitle}
                </span>
                <span className="font-mono text-[10px] text-slate-500 bg-slate-800/80 px-1.5 py-0.5 rounded">
                  {colNodes.length}
                </span>
              </div>

              {/* Column Nodes */}
              <div className="space-y-3">
                {colNodes.map((node) => {
                  const isHighlighted = highlightedNodeIds.has(node.id);
                  const isSelected = selectedNodeId === node.id;
                  const isCurrent = node.current;

                  return (
                    <div
                      key={node.id}
                      onClick={() => onSelectNode(node.id, node.batchId)}
                      className={`group cursor-pointer p-3.5 rounded-2xl border transition-all relative ${
                        isSelected
                          ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg'
                          : isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/70 hover:border-emerald-400'
                          : isHighlighted
                          ? 'bg-slate-900/90 border-slate-700/90 hover:bg-slate-800 hover:border-slate-600'
                          : 'bg-slate-950/50 border-slate-800/40 opacity-40 hover:opacity-80'
                      }`}
                    >
                      {/* Node Header Row */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="text-[10px] font-bold text-slate-400 truncate">
                          {node.stage.split('·')[0]}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {node.riskFlag && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold text-[9px] border border-rose-500/40">
                              FLAGGED
                            </span>
                          )}
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              node.score >= 90
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : node.score >= 70
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {node.score}/100
                          </span>
                        </div>
                      </div>

                      {/* Node Title */}
                      <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                        {node.title}
                      </h4>

                      {/* Batch ID and Organization */}
                      <div className="mt-1 space-y-0.5 text-[11px] text-slate-400">
                        <div className="font-mono text-[10px] text-emerald-400/90 truncate font-semibold">
                          {node.batchId}
                        </div>
                        <div className="truncate text-slate-300 font-medium">
                          {node.actor}
                        </div>
                        <div className="truncate text-[10px] text-slate-500">
                          {node.organization || node.location}
                        </div>
                      </div>

                      {/* Storage / Telemetry Micro-Badge if present */}
                      {node.storageTelemetry && (
                        <div className="mt-2 p-1.5 rounded-lg bg-teal-950/70 border border-teal-500/30 text-teal-200 text-[10px] flex items-center justify-between">
                          <span className="flex items-center gap-1 font-mono font-bold">
                            <Thermometer className="w-3 h-3 text-teal-400" />
                            {node.storageTelemetry.temperature}°C
                          </span>
                          <span className="flex items-center gap-1 text-[9px] text-teal-300">
                            <Sun className="w-2.5 h-2.5 text-amber-400" />
                            {node.storageTelemetry.powerStatus} ({node.storageTelemetry.batteryPercentage}%)
                          </span>
                        </div>
                      )}

                      {/* Node Footer Status */}
                      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold truncate">
                          {node.status}
                        </span>
                        <span className="text-slate-500 font-mono text-[9px] shrink-0">
                          {node.timestamp}
                        </span>
                      </div>

                      {/* Current Node Glow Pill */}
                      {isCurrent && (
                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-extrabold rounded-full shadow-md uppercase tracking-wider">
                          Current Focus
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Transformation & Handoff Legend Card */}
        <div className="mt-6 p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Linkage Types:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Pre-Cooled Solar Intake
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-400" />
              Milling Transformation (120Q → 95Q)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              Multi-Parent Ingredient Merge (Wheat + Sugar)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Split Lineage Reserve (Seed Lot)
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>100-Point SHA-256 Verified Ledger</span>
          </div>
        </div>
      </div>
    </div>
  );
};
