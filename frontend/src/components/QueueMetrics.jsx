import React from 'react';
import { Activity, TrendingUp, BarChart3, Database } from 'lucide-react';

export default function QueueMetrics({ history = [], metrics }) {
  // Generate SVG points for queue depth sparkline
  const dataPoints = history.length > 1 ? history : [
    { pending: 0, processing: 0, timestamp: Date.now() - 10000 },
    { pending: metrics?.pending || 0, processing: metrics?.processing || 0, timestamp: Date.now() }
  ];

  const maxVal = Math.max(...dataPoints.map(d => Math.max(d.pending || 0, d.processing || 0)), 5);
  const width = 480;
  const height = 90;
  const padding = 10;

  const pointsPending = dataPoints.map((d, idx) => {
    const x = padding + (idx / (dataPoints.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.pending || 0) / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  const pointsProcessing = dataPoints.map((d, idx) => {
    const x = padding + (idx / (dataPoints.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((d.processing || 0) / maxVal) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="console-panel rounded-lg p-4 border border-[#1E293B] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Queue Depth Telemetry (Live 60s)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400"></span> Pending
          </span>
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span> In-Flight
          </span>
        </div>
      </div>

      {/* Sparkline Chart */}
      <div className="py-2">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 overflow-visible">
          {/* Subtle Grid Lines */}
          <line x1="0" y1={padding} x2={width} y2={padding} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="#1E293B" strokeDasharray="3 3" />
          <line x1="0" y1={height - padding} x2={width} y2={height - padding} stroke="#1E293B" />

          {/* Pending Line */}
          <polyline
            fill="none"
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsPending}
          />

          {/* Processing Line */}
          <polyline
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={pointsProcessing}
          />
        </svg>
      </div>

      {/* Operational telemetry stats */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1E293B] text-[10px] font-mono">
        <div className="p-1.5 rounded bg-[#0D1321] border border-[#1F293D]">
          <span className="text-slate-500 block">PEAK DEPTH</span>
          <span className="text-slate-200 font-bold">{maxVal} tasks</span>
        </div>
        <div className="p-1.5 rounded bg-[#0D1321] border border-[#1F293D]">
          <span className="text-slate-500 block">TOTAL RECORDED</span>
          <span className="text-slate-200 font-bold">{metrics?.total || 0} jobs</span>
        </div>
        <div className="p-1.5 rounded bg-[#0D1321] border border-[#1F293D]">
          <span className="text-slate-500 block">REDIS STATUS</span>
          <span className="text-emerald-400 font-bold">READY (0 lag)</span>
        </div>
      </div>
    </div>
  );
}
