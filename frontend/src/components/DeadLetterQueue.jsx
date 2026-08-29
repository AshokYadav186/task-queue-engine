import React, { useState } from 'react';
import { AlertOctagon, RotateCcw, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function DeadLetterQueue({ jobs, onRefresh, apiBaseUrl, onInspectJob }) {
  const [retryingJobId, setRetryingJobId] = useState(null);

  const dlqJobs = jobs.filter((job) => job.status === 'FAILED');

  const handleRetryDLQ = async (jobId) => {
    setRetryingJobId(jobId);
    try {
      const res = await fetch(`${apiBaseUrl}/api/jobs/dlq/retry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok && onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('DLQ Retry Error:', err);
    } finally {
      setRetryingJobId(null);
    }
  };

  if (dlqJobs.length === 0) {
    return (
      <div className="console-panel rounded-lg p-4 border border-[#1E293B] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Dead-Letter Queue (DLQ) &bull; 0 Failed Tasks
            </h4>
            <p className="text-[11px] text-slate-400">
              All worker pipelines operating within healthy retry thresholds. No manual intervention required.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
          HEALTHY
        </span>
      </div>
    );
  }

  return (
    <div className="console-panel rounded-lg p-4 border border-rose-500/40 bg-rose-950/10">
      <div className="flex items-center justify-between pb-3 border-b border-rose-500/30 mb-3">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <h3 className="text-xs font-mono font-bold text-rose-200 uppercase tracking-wider">
            Dead-Letter Queue (DLQ) &bull; Quarantine Operations
          </h3>
        </div>
        <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          {dlqJobs.length} Tasks Quarantined
        </span>
      </div>

      <div className="space-y-2.5">
        {dlqJobs.map((job) => (
          <div
            key={job.id}
            className="p-3 rounded-md bg-[#0D1321] border border-rose-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-rose-300">{job.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-rose-400 border border-rose-900">
                  {job.type}
                </span>
                <span className="text-[10px] text-slate-500">
                  Max retries exceeded ({job.attempts}/{job.maxRetries})
                </span>
              </div>
              <p className="text-[11px] text-rose-200/90 truncate">
                <strong>Failure Reason:</strong> {job.lastError || 'Exceeded retry threshold'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onInspectJob(job)}
                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>

              <button
                onClick={() => handleRetryDLQ(job.id)}
                disabled={retryingJobId === job.id}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs flex items-center gap-1.5 border border-rose-400/30 transition shadow-sm disabled:opacity-50"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${retryingJobId === job.id ? 'animate-spin' : ''}`} />
                <span>{retryingJobId === job.id ? 'Requeuing...' : 'Requeue Task'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
