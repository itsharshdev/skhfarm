import React, { useState, useMemo, useRef, useEffect } from 'react';
import { LineageNode, LineageLink, Batch, StakeholderRole } from '../../types';
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
  Tractor,
  Factory,
  ShoppingBag,
  Truck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { DEMO_LINEAGE_NODES, DEMO_LINEAGE_LINKS } from '../../data/mockData';

interface LineageDAGGraphProps {
  batch: Batch;
  selectedNodeId?: string | null;
  customNodes?: LineageNode[];
  customLinks?: LineageLink[];
  onSelectNode: (nodeId: string, batchId?: string) => void;
  onSelectBatch?: (batchId: string) => void;
}

interface LayoutNode extends LineageNode {
  rank: number;
  column: number;
  row: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutLink extends LineageLink {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  midX: number;
  midY: number;
  pathD: string;
  isHighlighted: boolean;
}

function getNodeRoleIcon(type: string, id: string) {
  if (id.includes('farm') || type === 'RAW_MATERIAL') return Tractor;
  if (id.includes('solar') || type === 'STORAGE') return Sun;
  if (id.includes('milling') || id.includes('maida') || type === 'INTERMEDIATE') return Building;
  if (id.includes('transit') || id.includes('reefer') || type === 'TRANSIT') return Truck;
  if (id.includes('biscuit') || id.includes('manufacture') || type === 'MANUFACTURED') return Factory;
  if (id.includes('retail') || type === 'FINAL_PRODUCT') return ShoppingBag;
  return GitFork;
}

function getNodeRoleColor(type: string, id: string) {
  if (id.includes('farm') || type === 'RAW_MATERIAL') {
    return {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      border: 'border-emerald-500/60',
      accent: 'text-emerald-400',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
    };
  }
  if (id.includes('solar') || type === 'STORAGE') {
    return {
      badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
      border: 'border-teal-500/60',
      accent: 'text-teal-400',
      glow: 'shadow-[0_0_15px_rgba(20,184,166,0.25)]',
    };
  }
  if (id.includes('milling') || id.includes('maida') || type === 'INTERMEDIATE') {
    return {
      badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      border: 'border-amber-500/60',
      accent: 'text-amber-400',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    };
  }
  if (id.includes('transit') || id.includes('reefer') || type === 'TRANSIT') {
    return {
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      border: 'border-blue-500/60',
      accent: 'text-blue-400',
      glow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]',
    };
  }
  if (id.includes('biscuit') || id.includes('manufacture') || type === 'MANUFACTURED') {
    return {
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      border: 'border-purple-500/60',
      accent: 'text-purple-400',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]',
    };
  }
  return {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    border: 'border-orange-500/60',
    accent: 'text-orange-400',
    glow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]',
  };
}

export const LineageDAGGraph: React.FC<LineageDAGGraphProps> = ({
  batch,
  selectedNodeId,
  customNodes,
  customLinks,
  onSelectNode,
  onSelectBatch,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UPSTREAM' | 'DOWNSTREAM' | 'SOLAR_CHAIN'>('ALL');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  // 1. Resolve raw nodes & links for current batch
  const { rawNodes, rawLinks } = useMemo(() => {
    if (customNodes && customNodes.length > 0 && customLinks) {
      return { rawNodes: customNodes, rawLinks: customLinks };
    }

    if (batch.batchId === 'BIS-2026-092') {
      return {
        rawNodes: DEMO_LINEAGE_NODES,
        rawLinks: DEMO_LINEAGE_LINKS,
      };
    }

    // Dynamic fallback generation for single-ingredient or dynamic batches
    const dynamicNodes: LineageNode[] = [
      {
        id: `node-${batch.batchId}-farm`,
        batchId: batch.batchId,
        title: batch.productName ? `${batch.productName} Farm Lot` : 'Origin Farm Harvest',
        type: 'RAW_MATERIAL',
        stage: 'Stage 1 · Farm Origin & Harvest',
        actor: batch.originFarmerName || 'Ramesh Patil',
        organization: batch.origin || 'Kopargaon Farmers FPO',
        location: batch.origin || 'Kopargaon, Maharashtra',
        timestamp: batch.harvestDate || batch.createdAt.split('T')[0],
        score: batch.scoreBreakdown?.qualityScore ? Math.min(100, batch.scoreBreakdown.qualityScore + 75) : 98,
        status: batch.contaminationFlag?.flagged ? 'Contamination Detected' : 'Verified Field Harvest',
        quantity: `${batch.quantity} ${batch.unit}`,
        parents: [],
        children: batch.currentStorage ? [`node-${batch.batchId}-storage`] : [`node-${batch.batchId}-final`],
        riskFlag: batch.contaminationFlag?.flagged ? 'CRITICAL_CONTAMINATION' : undefined,
        notes: 'Direct farm harvest recorded with field quality grade and verified origin coordinates.',
        evidenceCount: batch.evidences?.length || 1,
        feedbackScore: 95,
      },
    ];

    if (batch.currentStorage) {
      dynamicNodes.push({
        id: `node-${batch.batchId}-storage`,
        batchId: batch.batchId,
        title: batch.currentStorage.storageUnitName || 'Solar Smart Cold Storage #04',
        type: 'STORAGE',
        stage: 'Stage 2 · Solar Vault Micro-Climate',
        actor: batch.currentOwner || 'Storage Operator',
        organization: batch.currentStorage.location || batch.currentLocation,
        location: batch.currentLocation,
        timestamp: batch.currentStorage.recordedAt?.split('T')[0] || batch.createdAt.split('T')[0],
        score: batch.scoreBreakdown?.totalScore || 96,
        status: batch.currentStorage.conditionStatus === 'SAFE' ? '18.2°C Solar Regulated' : 'Condition Monitored',
        quantity: `${batch.quantity} ${batch.unit} Vaulted`,
        parents: [`node-${batch.batchId}-farm`],
        children: [`node-${batch.batchId}-final`],
        storageTelemetry: {
          temperature: batch.currentStorage.temperature ?? 18.2,
          humidity: batch.currentStorage.humidity ?? 54,
          powerStatus: batch.currentStorage.powerStatus ?? 'SOLAR',
          solarStatus: batch.currentStorage.solarStatus ?? 'OPTIMAL',
          solarWatts: 4150,
          batteryPercentage: 94,
          safeRange: '15.0°C – 23.0°C',
          isSafe: batch.currentStorage.conditionStatus === 'SAFE',
        },
        notes: 'SKH030 Solar Micro-Climate vault operating on 100% clean solar generation.',
        evidenceCount: 1,
        feedbackScore: 96,
      });
    }

    dynamicNodes.push({
      id: `node-${batch.batchId}-final`,
      batchId: batch.batchId,
      title: batch.productName,
      type: batch.status === 'RETAILED' ? 'FINAL_PRODUCT' : 'MANUFACTURED',
      stage: batch.status === 'RETAILED' ? 'Stage 3 · Retail Shelf' : 'Stage 3 · Finished Product Lot',
      actor: batch.currentOwner || 'Store Custodian',
      organization: batch.currentLocation,
      location: batch.currentLocation,
      timestamp: batch.updatedAt?.split('T')[0] || batch.createdAt.split('T')[0],
      score: batch.scoreBreakdown?.totalScore || 94,
      status: batch.status,
      quantity: `${batch.quantity} ${batch.unit}`,
      current: true,
      parents: batch.currentStorage ? [`node-${batch.batchId}-storage`] : [`node-${batch.batchId}-farm`],
      children: [],
      riskFlag: batch.contaminationFlag?.flagged ? 'RECALL_FLAGGED' : undefined,
      evidenceCount: 1,
      feedbackScore: 92,
    });

    const dynamicLinks: LineageLink[] = [];
    if (batch.currentStorage) {
      dynamicLinks.push(
        {
          source: `node-${batch.batchId}-farm`,
          target: `node-${batch.batchId}-storage`,
          label: 'Pre-Cooled Solar Intake',
          type: 'SOLAR_INTAKE',
          animated: true,
        },
        {
          source: `node-${batch.batchId}-storage`,
          target: `node-${batch.batchId}-final`,
          label: 'Distribution & Packaging Handoff',
          type: 'DISTRIBUTION_PACK',
          animated: true,
        }
      );
    } else {
      dynamicLinks.push({
        source: `node-${batch.batchId}-farm`,
        target: `node-${batch.batchId}-final`,
        label: 'Direct Trace Handoff',
        type: 'DISTRIBUTION_PACK',
        animated: true,
      });
    }

    return { rawNodes: dynamicNodes, rawLinks: dynamicLinks };
  }, [batch, customNodes, customLinks]);

  // 2. Active Focus & Ancestry / Descendant Traversal
  const activeFocusId = hoveredNodeId || selectedNodeId || rawNodes.find((n) => n.current)?.id || rawNodes[0]?.id;

  const { activeNodeIds, activeLinkKeys } = useMemo(() => {
    if (!activeFocusId || filterMode === 'ALL') {
      const allNodeSet = new Set(rawNodes.map((n) => n.id));
      const allLinkSet = new Set(rawLinks.map((l) => `${l.source}->${l.target}`));
      return { activeNodeIds: allNodeSet, activeLinkKeys: allLinkSet };
    }

    const nodeSet = new Set<string>([activeFocusId]);
    const linkSet = new Set<string>();

    if (filterMode === 'UPSTREAM' || filterMode === 'ALL') {
      // Find all upstream ancestors
      const queue = [activeFocusId];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const node = rawNodes.find((n) => n.id === curr);
        if (node?.parents) {
          node.parents.forEach((parentId) => {
            linkSet.add(`${parentId}->${curr}`);
            if (!nodeSet.has(parentId)) {
              nodeSet.add(parentId);
              queue.push(parentId);
            }
          });
        }
      }
    }

    if (filterMode === 'DOWNSTREAM' || filterMode === 'ALL') {
      // Find all downstream descendants
      const queue = [activeFocusId];
      while (queue.length > 0) {
        const curr = queue.shift()!;
        const node = rawNodes.find((n) => n.id === curr);
        if (node?.children) {
          node.children.forEach((childId) => {
            linkSet.add(`${curr}->${childId}`);
            if (!nodeSet.has(childId)) {
              nodeSet.add(childId);
              queue.push(childId);
            }
          });
        }
      }
    }

    if (filterMode === 'SOLAR_CHAIN') {
      rawNodes.forEach((n) => {
        if (n.type === 'STORAGE' || n.type === 'TRANSIT' || n.storageTelemetry) {
          nodeSet.add(n.id);
        }
      });
      rawLinks.forEach((l) => {
        if (nodeSet.has(l.source) && nodeSet.has(l.target)) {
          linkSet.add(`${l.source}->${l.target}`);
        }
      });
    }

    return { activeNodeIds: nodeSet, activeLinkKeys: linkSet };
  }, [rawNodes, rawLinks, activeFocusId, filterMode]);

  // 3. Dynamic DAG Layout Engine: Compute (x, y) coordinates for each node & cubic bezier edges
  const { layoutNodes, layoutLinks, canvasWidth, canvasHeight, stageHeaders } = useMemo(() => {
    const NODE_WIDTH = 230;
    const NODE_HEIGHT = 160;
    const COL_GAP = 90;
    const ROW_GAP = 30;
    const PADDING_LEFT = 40;
    const PADDING_TOP = 60;

    // Assign rank / column index to each node via topological pass
    const rankMap = new Map<string, number>();

    // Seed root nodes with rank 0
    rawNodes.forEach((n) => {
      if (!n.parents || n.parents.length === 0) {
        rankMap.set(n.id, 0);
      }
    });

    // Multi-pass relaxation to ensure parents appear before children
    for (let pass = 0; pass < 8; pass++) {
      rawNodes.forEach((n) => {
        if (n.parents && n.parents.length > 0) {
          const maxParentRank = Math.max(
            ...n.parents.map((pId) => rankMap.get(pId) ?? 0)
          );
          rankMap.set(n.id, Math.max(rankMap.get(n.id) ?? 0, maxParentRank + 1));
        }
      });
    }

    // Explicit adjustments for clean presentation of Biscuit Demo DAG
    if (batch.batchId === 'BIS-2026-092') {
      rankMap.set('node-wheat-farm', 0);
      rankMap.set('node-sugar-farm', 0);
      rankMap.set('node-solar-cool', 1);
      rankMap.set('node-seed-split', 1);
      rankMap.set('node-maida', 2);
      rankMap.set('node-reefer-transit', 2);
      rankMap.set('node-biscuits', 3);
      rankMap.set('node-retail', 4);
    }

    // Group nodes by column
    const columns: LineageNode[][] = [];
    rawNodes.forEach((node) => {
      const r = rankMap.get(node.id) ?? 0;
      while (columns.length <= r) {
        columns.push([]);
      }
      columns[r].push(node);
    });

    // Compute max column height to center shorter columns nicely
    const maxRows = Math.max(...columns.map((col) => col.length), 1);
    const totalHeight = Math.max(480, maxRows * (NODE_HEIGHT + ROW_GAP) + PADDING_TOP + 40);
    const totalWidth = Math.max(1050, columns.length * (NODE_WIDTH + COL_GAP) + PADDING_LEFT * 2);

    // Compute exact (x, y) coordinates for each node
    const computedNodes: LayoutNode[] = [];
    const nodeLookup = new Map<string, LayoutNode>();

    columns.forEach((colNodes, colIdx) => {
      const colX = PADDING_LEFT + colIdx * (NODE_WIDTH + COL_GAP);
      const colHeight = colNodes.length * NODE_HEIGHT + (colNodes.length - 1) * ROW_GAP;
      const startY = PADDING_TOP + (totalHeight - PADDING_TOP - colHeight) / 2;

      colNodes.forEach((node, rowIdx) => {
        const nodeY = startY + rowIdx * (NODE_HEIGHT + ROW_GAP);
        const lNode: LayoutNode = {
          ...node,
          rank: colIdx,
          column: colIdx,
          row: rowIdx,
          x: colX,
          y: nodeY,
          width: NODE_WIDTH,
          height: NODE_HEIGHT,
        };
        computedNodes.push(lNode);
        nodeLookup.set(node.id, lNode);
      });
    });

    // Compute Cubic Bezier Edge Paths linking (startX, startY) -> (endX, endY)
    const computedLinks: LayoutLink[] = [];

    rawLinks.forEach((link) => {
      const sourceNode = nodeLookup.get(link.source);
      const targetNode = nodeLookup.get(link.target);

      if (sourceNode && targetNode) {
        // Output port on right edge of parent node
        const startX = sourceNode.x + sourceNode.width;
        const startY = sourceNode.y + sourceNode.height / 2;

        // Input port on left edge of child node
        const endX = targetNode.x;
        const endY = targetNode.y + targetNode.height / 2;

        // Calculate smooth cubic bezier curve
        const dx = Math.max(40, (endX - startX) * 0.5);
        const pathD = `M ${startX} ${startY} C ${startX + dx} ${startY}, ${endX - dx} ${endY}, ${endX} ${endY}`;

        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const isHighlighted =
          activeLinkKeys.has(`${link.source}->${link.target}`) ||
          (activeNodeIds.has(link.source) && activeNodeIds.has(link.target));

        computedLinks.push({
          ...link,
          startX,
          startY,
          endX,
          endY,
          midX,
          midY,
          pathD,
          isHighlighted,
        });
      }
    });

    // Column Stage Headers
    const columnTitles = [
      '1. Origin / Raw Harvests',
      '2. Solar Vault / Storage',
      '3. Processing & Reefer Transit',
      '4. Formulation & Bakery',
      '5. Retail & Consumer Point',
    ];

    const headers = columns.map((col, idx) => ({
      title: columnTitles[idx] || `Stage ${idx + 1}`,
      x: PADDING_LEFT + idx * (NODE_WIDTH + COL_GAP),
      count: col.length,
    }));

    return {
      layoutNodes: computedNodes,
      layoutLinks: computedLinks,
      canvasWidth: totalWidth,
      canvasHeight: totalHeight,
      stageHeaders: headers,
    };
  }, [rawNodes, rawLinks, batch, activeNodeIds, activeLinkKeys]);

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(1.4, Math.max(0.65, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setFilterMode('ALL');
    setHoveredNodeId(null);
  };

  return (
    <div
      id="lineage-dag-graph-container"
      ref={containerRef}
      className={`bg-slate-900 rounded-3xl border border-slate-800 text-white overflow-hidden shadow-sm transition-all relative ${
        isFullscreen ? 'fixed inset-4 z-50 overflow-auto bg-slate-950 p-6' : 'p-4 sm:p-6'
      }`}
    >
      {/* Top Header & Traversal Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-2xs">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base md:text-lg font-['Space_Grotesk',sans-serif]">
                Connected Lineage DAG (Multi-Parent Provenance)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30 uppercase">
                Directional Verified Graph
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Every parent-child ingredient relationship is represented by a visible directional edge. Hover or click to inspect provenance.
            </p>
          </div>
        </div>

        {/* Interactive Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Path Filter Modes */}
          <div className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700 text-xs">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                filterMode === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Paths
            </button>
            <button
              onClick={() => setFilterMode('UPSTREAM')}
              title="Trace backward to origin farms"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
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
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
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
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                filterMode === 'SOLAR_CHAIN'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Solar Chain</span>
            </button>
          </div>

          {/* Zoom Controls */}
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
              title="Fit to Graph & Reset View"
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

      {/* Traversal State Feedback Notice */}
      {filterMode !== 'ALL' && (
        <div className="mt-3 p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-200 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              {filterMode === 'UPSTREAM' && 'Tracing upstream origin path: highlighting raw farm harvests and pre-cooling stages.'}
              {filterMode === 'DOWNSTREAM' && 'Tracing downstream distribution path: highlighting manufacturing lot and retail distribution.'}
              {filterMode === 'SOLAR_CHAIN' && 'Filtering active solar cold-chain hubs & refrigerated transit nodes with temperature data.'}
            </span>
          </div>
          <button
            onClick={() => setFilterMode('ALL')}
            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline ml-2 shrink-0"
          >
            Show All Paths
          </button>
        </div>
      )}

      {/* Main Interactive Scrollable Graph Canvas */}
      <div className="mt-4 overflow-x-auto overflow-y-hidden pb-4 select-none">
        <div
          className="relative transition-transform duration-200 origin-top-left"
          style={{
            width: `${canvasWidth}px`,
            height: `${canvasHeight}px`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Top Stage Column Headers */}
          {stageHeaders.map((hdr, i) => (
            <div
              key={i}
              className="absolute top-2 flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
              style={{ left: `${hdr.x}px`, width: '230px' }}
            >
              <span>{hdr.title}</span>
              <span className="font-mono text-[9px] text-slate-500 bg-slate-800/80 px-1.5 py-0.2 rounded">
                {hdr.count}
              </span>
            </div>
          ))}

          {/* SVG Connector Layer for Directional Bezier Edges */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          >
            <defs>
              {/* Directional Arrowhead Markers */}
              <marker
                id="dag-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#10b981" />
              </marker>

              <marker
                id="dag-arrow-dim"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#475569" />
              </marker>

              <marker
                id="dag-arrow-active"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill="#34d399" />
              </marker>

              {/* Edge Gradient */}
              <linearGradient id="edgeGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#14b8a6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>

              {/* Edge Glow Filter */}
              <filter id="edgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor="#10b981" floodOpacity="0.6" />
              </filter>
            </defs>

            {/* Render Each Connecting Edge */}
            {layoutLinks.map((link, idx) => {
              const isActive = link.isHighlighted;

              return (
                <g key={idx}>
                  {/* Background broader click/hit area */}
                  <path
                    d={link.pathD}
                    fill="none"
                    stroke={isActive ? 'url(#edgeGradientActive)' : '#334155'}
                    strokeWidth={isActive ? 3.5 : 2}
                    strokeDasharray={link.animated || isActive ? '6 4' : 'none'}
                    markerEnd={isActive ? 'url(#dag-arrow-active)' : 'url(#dag-arrow-dim)'}
                    filter={isActive ? 'url(#edgeGlow)' : undefined}
                    opacity={isActive ? 1 : 0.4}
                    className={link.animated || isActive ? 'animate-[dash_15s_linear_infinite]' : ''}
                  />

                  {/* Output and Input Connector Node Bullets */}
                  <circle
                    cx={link.startX}
                    cy={link.startY}
                    r={isActive ? 4 : 3}
                    fill={isActive ? '#10b981' : '#64748b'}
                  />
                  <circle
                    cx={link.endX}
                    cy={link.endY}
                    r={isActive ? 4 : 3}
                    fill={isActive ? '#38bdf8' : '#64748b'}
                  />
                </g>
              );
            })}
          </svg>

          {/* HTML Interactive Node Cards Layer */}
          <div className="absolute inset-0 z-20">
            {layoutNodes.map((node) => {
              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isCurrent = node.current;
              const isHighlighted = activeNodeIds.has(node.id);
              const RoleIcon = getNodeRoleIcon(node.type, node.id);
              const colors = getNodeRoleColor(node.type, node.id);

              return (
                <div
                  key={node.id}
                  onClick={() => onSelectNode(node.id, node.batchId)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className={`absolute cursor-pointer rounded-2xl border transition-all p-3.5 flex flex-col justify-between select-none ${
                    isSelected
                      ? `bg-slate-800 ${colors.border} ring-2 ring-emerald-400/60 ${colors.glow} scale-105 z-30`
                      : isHovered
                      ? `bg-slate-800 ${colors.border} ${colors.glow} scale-102 z-20`
                      : isCurrent
                      ? `bg-slate-900/95 ${colors.border} shadow-md`
                      : isHighlighted
                      ? 'bg-slate-900/90 border-slate-700 hover:bg-slate-800'
                      : 'bg-slate-950/60 border-slate-800/40 opacity-40 hover:opacity-90'
                  }`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: `${node.width}px`,
                    height: `${node.height}px`,
                  }}
                >
                  {/* Card Top Row: Role Badge & Quality Score */}
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border flex items-center gap-1 ${colors.badge}`}
                    >
                      <RoleIcon className="w-3 h-3" />
                      <span className="truncate max-w-[100px]">{node.stage.split('·')[0]}</span>
                    </span>

                    <span
                      className={`font-mono text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        node.score >= 90
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : node.score >= 75
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {node.score}/100
                    </span>
                  </div>

                  {/* Title & Batch ID */}
                  <div>
                    <h4 className="font-bold text-xs md:text-sm text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {node.title}
                    </h4>
                    <span className="font-mono text-[10px] text-emerald-400/90 font-semibold block truncate mt-0.5">
                      {node.batchId}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                      {node.actor}
                    </span>
                  </div>

                  {/* Storage Telemetry or Status Bar */}
                  {node.storageTelemetry ? (
                    <div className="p-1.5 rounded-lg bg-teal-950/80 border border-teal-500/30 text-teal-200 text-[9px] flex items-center justify-between font-mono">
                      <span className="flex items-center gap-1 font-bold">
                        <Thermometer className="w-3 h-3 text-teal-400" />
                        {node.storageTelemetry.temperature}°C
                      </span>
                      <span className="text-teal-300">
                        {node.storageTelemetry.powerStatus} ({node.storageTelemetry.batteryPercentage}%)
                      </span>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[9px] text-slate-400">
                      <span className="text-emerald-400 font-bold truncate">{node.status}</span>
                      <span className="font-mono text-slate-500">{node.timestamp}</span>
                    </div>
                  )}

                  {/* Current Target Focus Tag */}
                  {isCurrent && (
                    <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[8px] font-extrabold rounded-full shadow-md uppercase tracking-wider">
                      Current
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & Multi-Parent Information Strip */}
        <div className="mt-6 p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-300">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
              Connected Stages:
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              1. Farm Harvest (Wheat / Sugar)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
              2. Solar Vault (SKH030 Pre-Cool)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              3. Milling & Transit (SKH029 Reefer)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
              4. Bakery Merge Formulation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              5. Retail Store Shelf
            </span>
          </div>

          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cryptographic Parent-Child Integrity</span>
          </div>
        </div>
      </div>
    </div>
  );
};
