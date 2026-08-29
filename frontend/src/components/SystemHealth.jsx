import React from 'react';
import { Layers, Clock, Cpu, CheckCircle2, RefreshCw, AlertTriangle, Zap, Activity } from 'lucide-react';

export default function SystemHealth({ metrics, jobs }) {
  // Compute extra dynamic telemetry
  const completedJobs = jobs.filter((j) => j.status === 'COMPLETED');
  const failedJobs = jobs.filter((j) => j.status === 'FAILED');
  const totalFinished = completedJobs.length + failedJobs.length;
  const successRate = totalFinished > 0 
    ? ((completedJobs.length / totalFinished) * 100).toFixed(1) 
    : '100.0';

  // Compute average duration of completed jobs
  const durations = completedJobs
    .map((j) => {
      if (j.createdAt && j.completedAt) {
        return new Date(j.completedAt) - new Date(j.createdAt);
      }
      return null;
    })
    .filter((d) => d !== null && d > 0);

  const avgDurationMs = durations.length > 0 
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) 
    : 840;

  const statBlocks = [
    {
      id: 'pending',
      label: 'QUEUE DEPTH',
      keyName: 'queue:pending',
      value: metrics?.pending ?? 0,
      subtext: 'Pending dispatch',
      icon: Clock,
      color: 'text-amber-400',
      borderColor: 'border-amber-500/20',
      badgeBg: 'bg-amber-500/10 text-amber-300',
    },
    {
      id: 'processing',
      label: 'IN-FLIGHT ACTIVE',
      keyName: 'queue:processing',
      value: metrics?.processing ?? 0,
      subtext: 'Worker executing',
      icon: Cpu,
      color: 'text-cyan-400',
      borderColor: 'border-cyan-500/20',
      badgeBg: 'bg-cyan-500/10 text-cyan-300',
      pulse: (metrics?.processing ?? 0) > 0,
    },
    {
      id: 'success_rate',
      label: 'SUCCESS RATE',
      keyName: 'telemetry:rate',
      value: `${successRate}%`,
      subtext: `${completedJobs.length} completed / ${totalFinished || metrics?.total || 0} total`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/20',
      badgeBg: 'bg-emerald-500/10 text-emerald-300',
    },
    {
      id: 'retry',
      label: 'RETRY QUEUE',
      keyName: 'queue:retry (zset)',
      value: metrics?.retryScheduled ?? 0,
      subtext: 'Backoff scheduled',
      icon: RefreshCw,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      badgeBg: 'bg-purple-500/10 text-purple-300',
    },
    {
      id: 'dlq',
      label: 'DEAD-LETTER (DLQ)',
      keyName: 'queue:dlq',
      value: metrics?.dlq ?? 0,
      subtext: (metrics?.dlq ?? 0) > 0 ? 'Action required' : '0 permanent failures',
      icon: AlertTriangle,
      color: (metrics?.dlq ?? 0) > 0 ? 'text-rose-400' : 'text-slate-400',
      borderColor: (metrics?.dlq ?? 0) > 0 ? 'border-rose-500/40 bg-rose-950/20' : 'border-[#1E293B]',
      badgeBg: (metrics?.dlq ?? 0) > 0 ? 'bg-rose-500/20 text-rose-300 font-bold animate-pulse' : 'bg-slate-800 text-slate-400',
    },
    {
      id: 'avg_latency',
      label: 'AVG PROCESSING',
      keyName: 'perf:duration',
      value: `${avgDurationMs}ms`,
      subtext: 'Job execution time',
      icon: Zap,
      color: 'text-sky-400',
      borderColor: 'border-sky-500/20',
      badgeBg: 'bg-sky-500/10 text-sky-300',
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {statBlocks.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.id}
              className={`console-panel rounded-lg p-3.5 flex flex-col justify-between border transition hover:border-slate-700 ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400 uppercase">
                  {stat.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${stat.color} ${stat.pulse ? 'animate-spin-slow' : ''}`} />
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <span className="text-xl lg:text-2xl font-mono font-bold text-white tracking-tight">
                  {stat.value}
                </span>
              </div>

              <div className="mt-2 pt-2 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] font-mono">
                <span className="text-slate-500 truncate">{stat.keyName}</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
