import React, { useState } from 'react';
import { X, Send, Mail, Image, FileText, AlertCircle, Terminal, Check } from 'lucide-react';

export default function DispatchTaskModal({ isOpen, onClose, onJobSubmitted, apiBaseUrl }) {
  const [type, setType] = useState('EMAIL');
  const [priority, setPriority] = useState('NORMAL');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Form Fields
  const [emailTo, setEmailTo] = useState('eng-review@systems.internal');
  const [emailSubject, setEmailSubject] = useState('Async Job Notification #941');

  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe');
  const [imgWidth, setImgWidth] = useState(1024);

  const [reportType, setReportType] = useState('QUARTERLY_REVENUE');
  const [format, setFormat] = useState('PDF');

  if (!isOpen) return null;

  const constructPayload = () => {
    if (type === 'EMAIL') {
      return { to: emailTo, subject: emailSubject };
    }
    if (type === 'IMAGE') {
      return { imageUrl, width: parseInt(imgWidth, 10), height: parseInt(imgWidth, 10) };
    }
    if (type === 'REPORT') {
      return { reportType, format };
    }
    return {};
  };

  const payload = constructPayload();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch(`${apiBaseUrl}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          payload,
          priority,
          simulateFailure,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setFeedback({
          type: 'success',
          text: `Task queued successfully [ID: ${data.job?.id || 'job:new'}]`,
        });
        if (onJobSubmitted) onJobSubmitted();
        setTimeout(() => {
          onClose();
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({
          type: 'error',
          text: data.error || 'Failed to dispatch task.',
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Network connection error to API server.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="console-panel rounded-lg border border-[#1E293B] w-full max-w-xl bg-[#0F172A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-[#1E293B] flex items-center justify-between bg-[#0B0F19]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Task Dispatch Control Console
            </h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 font-mono text-xs">
          {/* Task Type Tabs */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-2">TASK TYPE</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'EMAIL', label: 'Email', icon: Mail },
                { id: 'IMAGE', label: 'Image Process', icon: Image },
                { id: 'REPORT', label: 'Report Gen', icon: FileText },
              ].map((item) => {
                const Icon = item.icon;
                const active = type === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id)}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded border text-xs font-bold transition ${
                      active
                        ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                        : 'bg-[#0B0F19] border-[#1E293D] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Payload Configuration */}
          {type === 'EMAIL' && (
            <div className="p-3 rounded bg-[#0B0F19] border border-[#1E293D] space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">RECIPIENT (to)</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  className="w-full bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">SUBJECT (subject)</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          )}

          {type === 'IMAGE' && (
            <div className="p-3 rounded bg-[#0B0F19] border border-[#1E293D] space-y-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">IMAGE URL (imageUrl)</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">TARGET RESOLUTION (px)</label>
                <input
                  type="number"
                  value={imgWidth}
                  onChange={(e) => setImgWidth(e.target.value)}
                  className="w-full bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  required
                />
              </div>
            </div>
          )}

          {type === 'REPORT' && (
            <div className="p-3 rounded bg-[#0B0F19] border border-[#1E293D] grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">CATEGORY (reportType)</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="TAX_AUDIT_EXPORTS">TAX_AUDIT_EXPORTS</option>
                  <option value="QUARTERLY_REVENUE">QUARTERLY_REVENUE</option>
                  <option value="USER_ANALYTICS_CSV">USER_ANALYTICS_CSV</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 block mb-1">FORMAT (format)</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="PDF">PDF</option>
                  <option value="CSV">CSV</option>
                </select>
              </div>
            </div>
          )}

          {/* Priority & Failure Simulation */}
          <div className="p-3 rounded bg-[#0B0F19] border border-[#1E293D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">PRIORITY</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-[#070A11] border border-[#1E293D] rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none"
              >
                <option value="NORMAL">NORMAL (Append)</option>
                <option value="HIGH">HIGH (Push to Head)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <input
                type="checkbox"
                id="modalSimulateFailure"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-0"
              />
              <label htmlFor="modalSimulateFailure" className="text-xs text-rose-400 flex items-center gap-1 cursor-pointer">
                <AlertCircle className="w-3.5 h-3.5" />
                Simulate Worker Failure
              </label>
            </div>
          </div>

          {/* Redis Command Preview */}
          <div>
            <span className="text-[10px] text-slate-500 block mb-1">REDIS COMMAND PREVIEW</span>
            <div className="p-2 rounded bg-[#070A11] border border-[#1E293D] text-[10px] text-slate-400 font-mono overflow-x-auto">
              <span className="text-purple-400">HSET</span> job:uuid ... <br/>
              <span className="text-cyan-400">{priority === 'HIGH' ? 'RPUSH' : 'LPUSH'}</span> queue:pending job:uuid
            </div>
          </div>

          {feedback && (
            <div
              className={`p-2.5 rounded text-xs font-mono ${
                feedback.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/40 text-rose-300'
              }`}
            >
              {feedback.text}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Dispatching...' : 'Dispatch to Queue'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
