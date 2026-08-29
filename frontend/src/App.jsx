import React, { useState, useEffect, useCallback, useRef } from 'react';
import DashboardHeader from './components/DashboardHeader';
import SystemHealth from './components/SystemHealth';
import QueuePipeline from './components/QueuePipeline';
import QueueMetrics from './components/QueueMetrics';
import WorkerStatus from './components/WorkerStatus';
import RetryTimeline from './components/RetryTimeline';
import DeadLetterQueue from './components/DeadLetterQueue';
import TaskTable from './components/TaskTable';
import TaskDetailsModal from './components/TaskDetailsModal';
import DispatchTaskModal from './components/DispatchTaskModal';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function App() {
  const [metrics, setMetrics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [metricHistory, setMetricHistory] = useState([]);

  // Fetch metrics endpoint
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/metrics`);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics);
        setLastUpdated(new Date());

        // Append to telemetry history (keep last 20 snapshots)
        setMetricHistory((prev) => {
          const next = [
            ...prev,
            {
              pending: data.metrics?.pending || 0,
              processing: data.metrics?.processing || 0,
              timestamp: Date.now(),
            },
          ];
          return next.slice(-20);
        });
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  }, []);

  // Fetch jobs endpoint
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/jobs`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([fetchMetrics(), fetchJobs()]);
  }, [fetchMetrics, fetchJobs]);

  // Initial mount
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Live polling loop (every 2.5 seconds)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      if (!document.hidden) {
        refreshAll();
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshAll]);

  // Purge completed jobs
  const handleClearCompleted = async () => {
    if (isClearing) return;
    setIsClearing(true);
    try {
      await fetch(`${API_BASE_URL}/api/jobs/clear`, { method: 'POST' });
      await refreshAll();
    } catch (err) {
      console.error('Error clearing completed jobs:', err);
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-200 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Operations Header */}
      <DashboardHeader
        metrics={metrics}
        autoRefresh={autoRefresh}
        setAutoRefresh={setAutoRefresh}
        onRefresh={refreshAll}
        onOpenDispatch={() => setIsDispatchOpen(true)}
        onClearCompleted={handleClearCompleted}
        isClearing={isClearing}
        lastUpdated={lastUpdated}
      />

      {/* Main Operations Canvas */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* 1. Compact System Health & Metrics Ribbon */}
        <SystemHealth metrics={metrics} jobs={jobs} />

        {/* 2. Pipeline Architecture Visualizer */}
        <QueuePipeline metrics={metrics} />

        {/* 3. Operational Telemetry Row: Sparklines & Worker Fleet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <QueueMetrics history={metricHistory} metrics={metrics} />
          </div>
          <div className="lg:col-span-6">
            <WorkerStatus jobs={jobs} metrics={metrics} />
          </div>
        </div>

        {/* 4. Retry Scheduler & Dead-Letter Queue Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <RetryTimeline jobs={jobs} />
          </div>
          <div className="lg:col-span-6">
            <DeadLetterQueue
              jobs={jobs}
              onRefresh={refreshAll}
              apiBaseUrl={API_BASE_URL}
              onInspectJob={(job) => setSelectedJob(job)}
            />
          </div>
        </div>

        {/* 5. Primary Queue Activity Table */}
        <TaskTable
          jobs={jobs}
          onInspectJob={(job) => setSelectedJob(job)}
        />
      </main>

      {/* Task Details Modal */}
      {selectedJob && (
        <TaskDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}

      {/* Task Dispatch Modal */}
      <DispatchTaskModal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        onJobSubmitted={refreshAll}
        apiBaseUrl={API_BASE_URL}
      />

      {/* Footer */}
      <footer className="border-t border-[#1E293B] py-4 bg-[#090D16] text-center text-xs font-mono text-slate-500">
        Distributed Task Queue &bull; Redis Atomic Queueing &bull; Exponential Backoff Retry Engine
      </footer>
    </div>
  );
}
