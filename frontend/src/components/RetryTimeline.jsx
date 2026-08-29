import React from 'react';
import { RefreshCw, Clock, AlertCircle, ArrowDown } from 'lucide-react';

export default function RetryTimeline({ jobs }) {
  const retryJobs = jobs.filter((j) => j.status === 'RETRY_SCHEDULED');

  return (
    <div className="console-panel rounded-lg p-4 border border-[#1E293B]">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Exponential Backoff Schedule Monitor
          </h3>
        </div>
        <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
          t = 2^attempt &times; 1000ms
        </span>
      </div>

      {retryJobs.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-xs font-mono text-slate-400">
            0 tasks currently in backoff delay queue (<code className="text-purple-400">queue:retry</code>).
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Dispatch a task with &ldquo;Simulate Failure&rdquo; to observe the exponential retry schedule in real-time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {retryJobs.map((job) => {
            const nextAttempt = (job.attempts || 0) + 1;
            const delaySec = Math.pow(2, job.attempts || 0);

            return (
              <div
                key={job.id}
                className="p-3 rounded-md bg-[#131024] border border-purple-500/30 text-xs font-mono space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-300">{job.id}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-900 text-purple-400 border border-purple-800">
                      {job.type}
                    </span>
                  </div>
                  <span className="text-purple-300 font-semibold">
                    Attempt {job.attempts}/{job.maxRetries} Failed
                  </span>
                </div>

                {/* Backoff progression steps */}
                <div className="grid grid-cols-3 gap-2 text-[10px] pt-1">
                  <div className={`p-1.5 rounded border ${job.attempts >= 1 ? 'bg-purple-950/60 border-purple-500/40 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <span className="block font-bold">Attempt #1</span>
                    <span>1s backoff</span>
                  </div>
                  <div className={`p-1.5 rounded border ${job.attempts >= 2 ? 'bg-purple-950/60 border-purple-500/40 text-purple-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <span className="block font-bold">Attempt #2</span>
                    <span>2s backoff</span>
                  </div>
                  <div className={`p-1.5 rounded border ${job.attempts >= 3 ? 'bg-rose-950/60 border-rose-500/40 text-rose-200' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                    <span className="block font-bold">Attempt #3</span>
                    <span>4s &rarr; DLQ</span>
                  </div>
                </div>

                <div className="text-[11px] text-rose-300/90 pt-1 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Last Error:</strong> {job.lastError || 'Execution failed'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
