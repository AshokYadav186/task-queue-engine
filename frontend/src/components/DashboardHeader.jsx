import React from 'react';
import { Layers, Activity, RefreshCw, Plus, Trash2, Cpu, Database, Server } from 'lucide-react';

export default function DashboardHeader({
  metrics,
  autoRefresh,
  setAutoRefresh,
  onRefresh,
  onOpenDispatch,
  onClearCompleted,
  isClearing,
  lastUpdated,
}) {
  return (
    <header className="border-b border-[#1E293B] bg-[#0E1524]/90 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Project Title */}
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="h-9 w-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-sm shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <h1 className="text-sm font-bold text-white tracking-tight truncate">
                  Distributed Task Queue Engine
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                  CLUSTER OPS v1.4
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 truncate hidden md:block">
                Atomic Polling (BLMOVE/RPOPLPUSH) &bull; Exponential Backoff (2^k &times; 1s) &bull; DLQ Safety
              </p>
            </div>
          </div>

          {/* Quick System Status Pills */}
          <div className="hidden xl:flex items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-400">Redis:</span>
              <span className="text-emerald-400 font-medium">Connected</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[11px]">6379</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B]">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="text-slate-400">Workers:</span>
              <span className="text-cyan-400 font-medium">3 Active</span>
            </div>

            <div className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#111827] border border-[#1E293B]">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Sync:</span>
              <span className="text-slate-200">{lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              title={autoRefresh ? 'Click to pause auto-polling' : 'Click to enable live polling (2.5s)'}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium transition border ${
                autoRefresh
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30 hover:bg-emerald-900/40'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`}></span>
              <span className="hidden sm:inline">{autoRefresh ? 'LIVE (2.5s)' : 'PAUSED'}</span>
            </button>

            {/* Manual Sync */}
            <button
              onClick={onRefresh}
              title="Refresh All Metrics & Jobs"
              className="p-1.5 rounded-lg bg-[#111827] hover:bg-[#1E293B] border border-[#1E293B] text-slate-300 hover:text-white transition"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Clear Completed */}
            <button
              onClick={onClearCompleted}
              disabled={isClearing}
              title="Purge Completed Jobs from Archive"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-rose-300 transition text-xs font-medium disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Purge Completed</span>
            </button>

            {/* Primary Dispatch Action */}
            <button
              onClick={onOpenDispatch}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs shadow-sm transition border border-cyan-400/30"
            >
              <Plus className="w-4 h-4" />
              <span>Dispatch Task</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
