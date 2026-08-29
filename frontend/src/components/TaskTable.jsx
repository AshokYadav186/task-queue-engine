import React, { useState } from 'react';
import {
  Clock,
  Cpu,
  CheckCircle2,
  RefreshCw,
  AlertOctagon,
  Search,
  ChevronDown,
  ChevronUp,
  Eye,
  Filter,
  Layers,
  ArrowUpDown
} from 'lucide-react';

export default function TaskTable({ jobs, onInspectJob }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [expandedJobId, setExpandedJobId] = useState(null);

  const filterTabs = [
    { id: 'ALL', label: 'All Tasks', count: jobs.length },
    { id: 'PENDING', label: 'Pending', count: jobs.filter(j => j.status === 'PENDING').length },
    { id: 'PROCESSING', label: 'Processing', count: jobs.filter(j => j.status === 'PROCESSING').length },
    { id: 'COMPLETED', label: 'Completed', count: jobs.filter(j => j.status === 'COMPLETED').length },
    { id: 'RETRY_SCHEDULED', label: 'Retry', count: jobs.filter(j => j.status === 'RETRY_SCHEDULED').length },
    { id: 'FAILED', label: 'DLQ', count: jobs.filter(j => j.status === 'FAILED').length },
  ];

  const filteredJobs = jobs.filter((job) => {
    const matchesFilter = filter === 'ALL' || job.status === filter;
    if (!matchesFilter) return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const idMatch = job.id.toLowerCase().includes(query);
    const typeMatch = job.type.toLowerCase().includes(query);
    const errorMatch = (job.lastError || '').toLowerCase().includes(query);
    const payloadMatch = JSON.stringify(job.payload || {}).toLowerCase().includes(query);

    return idMatch || typeMatch || errorMatch || payloadMatch;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Cpu className="w-3 h-3 animate-spin-slow" /> Processing
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'RETRY_SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/30">
            <RefreshCw className="w-3 h-3 animate-spin-slow" /> Retry
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/30">
            <AlertOctagon className="w-3 h-3" /> DLQ
          </span>
        );
      default:
        return <span className="font-mono text-slate-500 text-xs">{status}</span>;
    }
  };

  const getDuration = (job) => {
    if (job.status === 'COMPLETED' && job.createdAt && job.completedAt) {
      const diff = new Date(job.completedAt) - new Date(job.createdAt);
      return `${diff}ms`;
    }
    if (job.status === 'PROCESSING') {
      return 'running...';
    }
    return '—';
  };

  return (
    <div className="console-panel rounded-lg border border-[#1E293B] overflow-hidden">
      {/* Table Controls Header */}
      <div className="p-4 border-b border-[#1E293B] flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#0E1524]/60">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h2 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Queue Activity &amp; Task Telemetry
          </h2>
          <span className="text-xs font-mono text-slate-500">
            ({filteredJobs.length} of {jobs.length})
          </span>
        </div>

        {/* Filter Pills and Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#0B0F19] rounded-md p-1 border border-[#1E293D] overflow-x-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-[#1E293B] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label} <span className="text-[10px] text-slate-500">({tab.count})</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search ID, payload, error..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B0F19] border border-[#1E293D] rounded-md pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-mono">
          <thead>
            <tr className="border-b border-[#1E293B] bg-[#0A0E17] text-slate-400 text-[11px]">
              <th className="py-2.5 px-4 font-semibold">TASK ID</th>
              <th className="py-2.5 px-3 font-semibold">TYPE</th>
              <th className="py-2.5 px-3 font-semibold">PRIORITY</th>
              <th className="py-2.5 px-3 font-semibold">STATUS</th>
              <th className="py-2.5 px-3 font-semibold">ATTEMPTS</th>
              <th className="py-2.5 px-3 font-semibold">CREATED</th>
              <th className="py-2.5 px-3 font-semibold">DURATION</th>
              <th className="py-2.5 px-4 font-semibold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]/70">
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-500 italic">
                  No tasks match the active filters.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <React.Fragment key={job.id}>
                    <tr className="hover:bg-[#151D30]/60 transition">
                      {/* Task ID */}
                      <td className="py-2.5 px-4 font-bold text-cyan-300">
                        <button
                          onClick={() => onInspectJob(job)}
                          className="hover:underline flex items-center gap-1.5"
                          title="Click to view full JSON inspector"
                        >
                          {job.id}
                        </button>
                      </td>

                      {/* Type */}
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          job.type === 'EMAIL'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : job.type === 'IMAGE'
                            ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {job.type}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-2.5 px-3">
                        {job.priority === 'HIGH' ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            HIGH
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">NORMAL</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3">
                        {getStatusBadge(job.status)}
                      </td>

                      {/* Attempts */}
                      <td className="py-2.5 px-3">
                        <span className={`${job.attempts > 0 ? 'text-purple-300 font-bold' : 'text-slate-400'}`}>
                          {job.attempts}/{job.maxRetries}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {job.createdAt ? new Date(job.createdAt).toLocaleTimeString() : '—'}
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                        {getDuration(job)}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onInspectJob(job)}
                            className="p-1 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1E293D] transition"
                            title="Inspect Task Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="p-1 rounded bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white border border-[#1E293D] transition"
                            title={isExpanded ? 'Collapse' : 'Expand payload inline'}
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable Inline Row */}
                    {isExpanded && (
                      <tr className="bg-[#090D16] border-y border-[#1E293B]">
                        <td colSpan={8} className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                            {/* Payload */}
                            <div>
                              <span className="text-slate-400 font-semibold block mb-1">
                                Task Payload (Redis Hash Data):
                              </span>
                              <pre className="p-2.5 rounded bg-[#0D1321] border border-[#1E293D] text-cyan-300 overflow-x-auto text-[11px]">
                                {JSON.stringify(job.payload, null, 2)}
                              </pre>
                            </div>

                            {/* Execution Result or Error */}
                            <div>
                              <span className="text-slate-400 font-semibold block mb-1">
                                Execution Result / Error State:
                              </span>
                              <div className="p-2.5 rounded bg-[#0D1321] border border-[#1E293D] min-h-[70px]">
                                {job.result ? (
                                  <pre className="text-emerald-300 text-[11px]">
                                    {typeof job.result === 'string' ? job.result : JSON.stringify(job.result, null, 2)}
                                  </pre>
                                ) : job.lastError ? (
                                  <span className="text-rose-400">{job.lastError}</span>
                                ) : (
                                  <span className="text-slate-500 italic">No output generated yet.</span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Error Log history if present */}
                          {job.errorLog && job.errorLog.length > 0 && (
                            <div className="mt-3 pt-2 border-t border-[#1E293B]">
                              <span className="text-rose-400 font-semibold block mb-1 text-[11px]">
                                Retry &amp; Failure History:
                              </span>
                              <div className="space-y-1">
                                {job.errorLog.map((err, idx) => (
                                  <div
                                    key={idx}
                                    className="p-1.5 rounded bg-rose-950/20 border border-rose-500/20 text-rose-300 flex items-center justify-between text-[10px]"
                                  >
                                    <span><strong>Attempt #{err.attempt}:</strong> {err.error}</span>
                                    <span className="text-rose-400/70">{new Date(err.timestamp).toLocaleTimeString()}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
