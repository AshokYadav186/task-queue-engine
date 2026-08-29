import React from 'react';
import { Cpu, Activity, Check, Zap, Server } from 'lucide-react';

export default function WorkerStatus({ jobs, metrics }) {
  const activeProcessing = jobs.filter((j) => j.status === 'PROCESSING');

  // Simulated 3-worker cluster telemetry matching distributed spec
  const workers = [
    {
      id: 'worker-01',
      role: 'Email & Report Processor',
      currentTask: activeProcessing[0] || null,
      status: activeProcessing[0] ? 'BUSY' : 'IDLE',
      throughput: Math.max(1, Math.floor((metrics?.completed || 0) * 0.45)),
      uptime: '99.98%',
      heartbeat: '1s ago',
    },
    {
      id: 'worker-02',
      role: 'Image & High-Priority Queue',
      currentTask: activeProcessing[1] || null,
      status: activeProcessing[1] ? 'BUSY' : 'IDLE',
      throughput: Math.max(0, Math.floor((metrics?.completed || 0) * 0.35)),
      uptime: '99.99%',
      heartbeat: '2s ago',
    },
    {
      id: 'worker-03',
      role: 'General & DLQ Recovery',
      currentTask: activeProcessing[2] || null,
      status: activeProcessing[2] ? 'BUSY' : 'IDLE',
      throughput: Math.max(0, Math.floor((metrics?.completed || 0) * 0.20)),
      uptime: '100.0%',
      heartbeat: '1s ago',
    },
  ];

  return (
    <div className="console-panel rounded-lg p-4 border border-[#1E293B]">
      <div className="flex items-center justify-between pb-2.5 border-b border-[#1E293B] mb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
            Worker Fleet Telemetry (3 Nodes)
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          ● 3 Nodes Online
        </span>
      </div>

      <div className="space-y-2.5">
        {workers.map((worker) => (
          <div
            key={worker.id}
            className="p-2.5 rounded-md bg-[#0D1321] border border-[#1F293D] hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono"
          >
            {/* Worker ID and state */}
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                worker.status === 'BUSY' ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'
              }`}></span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{worker.id}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border ${
                    worker.status === 'BUSY'
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {worker.status}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 block">{worker.role}</span>
              </div>
            </div>

            {/* Current Task or Idle */}
            <div className="flex items-center gap-4 text-[11px]">
              <div>
                <span className="text-slate-500 text-[10px] block">ACTIVE ASSIGNMENT</span>
                {worker.currentTask ? (
                  <span className="text-cyan-300 font-bold truncate max-w-[140px] block">
                    {worker.currentTask.id.substring(0, 16)}...
                  </span>
                ) : (
                  <span className="text-slate-500 italic">Idle &bull; Waiting on BLMOVE</span>
                )}
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-slate-500 text-[10px] block">PROCESSED</span>
                <span className="text-slate-300 font-bold">{worker.throughput} tasks</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
