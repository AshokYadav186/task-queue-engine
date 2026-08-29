import React from 'react';
import { X, Copy, Check, Terminal, Layers, Clock, Cpu } from 'lucide-react';

export default function TaskDetailsModal({ job, onClose }) {
  const [copied, setCopied] = React.useState(false);

  if (!job) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(job, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="console-panel rounded-lg border border-[#1E293B] w-full max-w-2xl bg-[#0F172A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Task Telemetry Inspector &bull; <span className="text-cyan-300">{job.id}</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto font-mono text-xs">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
            <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293D]">
              <span className="text-slate-500 block">TYPE</span>
              <span className="text-slate-200 font-bold">{job.type}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293D]">
              <span className="text-slate-500 block">STATUS</span>
              <span className="text-cyan-300 font-bold">{job.status}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293D]">
              <span className="text-slate-500 block">ATTEMPTS</span>
              <span className="text-slate-200 font-bold">{job.attempts}/{job.maxRetries}</span>
            </div>
            <div className="p-2.5 rounded bg-[#0B0F19] border border-[#1E293D]">
              <span className="text-slate-500 block">PRIORITY</span>
              <span className="text-slate-200 font-bold">{job.priority}</span>
            </div>
          </div>

          {/* Raw JSON Payload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 font-semibold text-[11px]">Full Redis Hash State:</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 rounded bg-[#0B0F19] border border-[#1E293D] text-slate-200 text-[11px] overflow-x-auto max-h-60">
              {JSON.stringify(job, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#1E293B] bg-[#0B0F19] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
