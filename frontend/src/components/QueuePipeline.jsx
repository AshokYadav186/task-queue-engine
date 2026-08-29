import React from 'react';
import { ArrowRight, CornerDownRight, Server, Database, Cpu, CheckCircle2, RotateCcw, AlertOctagon, Terminal } from 'lucide-react';

export default function QueuePipeline({ metrics }) {
  const pending = metrics?.pending ?? 0;
  const processing = metrics?.processing ?? 0;
  const completed = metrics?.completed ?? 0;
  const retry = metrics?.retryScheduled ?? 0;
  const dlq = metrics?.dlq ?? 0;

  return (
    <div className="console-panel rounded-lg p-4 border border-[#1E293B]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Distributed Execution Pipeline Architecture
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
          Redis Atomic BLMOVE / RPOPLPUSH Flow
        </span>
      </div>

      {/* Pipeline Diagram */}
      <div className="space-y-4">
        {/* Main Linear Highway */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 items-stretch">
          {/* Node 1: Producer */}
          <div className="p-3 rounded-md bg-[#0D1321] border border-[#1F293D] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
                <Server className="w-3.5 h-3.5 text-indigo-400" />
                1. Producer API
              </span>
              <span className="text-[10px] text-slate-500">POST /api/jobs</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Generates UUID &amp; writes Redis Hash (<code className="text-slate-300 font-mono">job:id</code>)
            </p>
            <div className="mt-2 text-[10px] font-mono text-indigo-400/80">
              LPUSH / RPUSH based on Priority
            </div>
          </div>

          {/* Node 2: Pending Queue */}
          <div className={`p-3 rounded-md bg-[#0D1321] border flex flex-col justify-between ${
            pending > 0 ? 'border-amber-500/40 bg-amber-950/10' : 'border-[#1F293D]'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                <Database className="w-3.5 h-3.5 text-amber-400" />
                2. Pending Queue
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {pending}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              FIFO task queue stored in Redis List: <code className="text-amber-300/90 font-mono">queue:pending</code>
            </p>
            <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>Atomic RPOPLPUSH</span>
            </div>
          </div>

          {/* Node 3: Worker Consumer */}
          <div className={`p-3 rounded-md bg-[#0D1321] border flex flex-col justify-between ${
            processing > 0 ? 'border-cyan-500/40 bg-cyan-950/10' : 'border-[#1F293D]'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                3. Active Worker
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${processing > 0 ? 'animate-pulse' : ''}`}>
                {processing} In-Flight
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Isolated in <code className="text-cyan-300 font-mono">queue:processing</code> during handler run
            </p>
            <div className="mt-2 text-[10px] font-mono text-cyan-400/90">
              Dispatches Email, Image, Report
            </div>
          </div>

          {/* Node 4: Terminal Success */}
          <div className="p-3 rounded-md bg-[#0D1321] border border-emerald-500/30 bg-emerald-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] font-mono mb-1">
              <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                4. Completed
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {completed}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Task removed from processing list; results persisted in Redis Hash
            </p>
            <div className="mt-2 text-[10px] font-mono text-emerald-400/90">
              Status = COMPLETED
            </div>
          </div>
        </div>

        {/* Branch / Failure Recovery Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-[#1E293B]/70">
          {/* Branch A: Exponential Backoff Retry */}
          <div className="p-3 rounded-md bg-[#131024] border border-purple-500/30 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-mono font-bold text-purple-300">
                  Branch A: Exponential Backoff (<code className="text-[11px] text-purple-200">queue:retry</code>)
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Failed tasks (&lt; 3 attempts) scheduled in Redis Sorted Set: <code className="text-purple-300 font-mono">Score = Timestamp + (2^k &times; 1000ms)</code>. 
                Background scheduler requeues due jobs atomically to <code className="text-amber-300 font-mono">queue:pending</code>.
              </p>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
              {retry} Waiting
            </span>
          </div>

          {/* Branch B: Dead Letter Queue */}
          <div className={`p-3 rounded-md border flex items-start justify-between gap-3 ${
            dlq > 0
              ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
              : 'bg-[#150F14] border-rose-500/20 text-slate-400'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-mono font-bold text-rose-300">
                  Branch B: Dead-Letter Isolation (<code className="text-[11px] text-rose-200">queue:dlq</code>)
                </span>
              </div>
              <p className="text-[11px]">
                Tasks exceeding max retry limit (3/3 attempts) are permanently moved to DLQ. Prevents head-of-line blocking while enabling inspection &amp; re-queueing.
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border shrink-0 ${
              dlq > 0
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              {dlq} Quarantined
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
