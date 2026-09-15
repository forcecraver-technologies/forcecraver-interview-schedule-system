'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Loader2, Calendar, Clock, Video, Building2, ExternalLink, RotateCcw } from 'lucide-react';
import { formatInterviewDate } from '@/lib/formatters';
import { InterviewItem } from './ScheduleCard';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';

interface TrackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInterview?: (interview: InterviewItem) => void;
}

export default function TrackModal({ isOpen, onClose, onSelectInterview }: TrackModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewItem | null>(null);

  // Helper to completely clear search inputs & previous results
  const resetState = () => {
    setQuery('');
    setLoading(false);
    setError(null);
    setResult(null);
  };

  // Close handler that cleanly wipes state
  const handleClose = () => {
    resetState();
    onClose();
  };

  // Whenever modal opens or closes, reset previous results
  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  // Handle ESC key press to close cleanly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/interviews/track/${encodeURIComponent(query.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No interview appointment found matching your query.');
      } else {
        setResult(data.interview);
      }
    } catch {
      setError('Failed to look up interview. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 flex flex-col max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Search Candidate</h3>
            <p className="text-xs text-slate-500">
              Search by Candidate Name, Email, Phone Number, or Reference Code
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Candidate Name, Email, Phone, or Reference Code..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-slate-900 bg-slate-50/50"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={resetState}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/60 transition-colors"
                title="Clear input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Candidate'}
            </button>
            {(result || error) && (
              <button
                type="button"
                onClick={resetState}
                className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors flex items-center gap-1.5"
                title="Reset search"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              type="button"
              onClick={resetState}
              className="text-rose-500 hover:text-rose-700 text-[11px] font-semibold underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="mt-5 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {result.referenceCode}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700">
                {result.status}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold">
                <Building2 className="w-3.5 h-3.5" />
                <span>{result.companyName}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">{result.jobTitle}</h4>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/60 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-700 font-medium">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-600" />
                  {formatInterviewDate(result.interviewDate)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                  {result.startTime} - {result.endTime}
                </span>
              </div>
              <p className="text-slate-600 pt-1 border-t border-slate-100">
                Candidate: <span className="font-semibold text-slate-800">{result.candidate.name}</span>
              </p>
              <p className="text-slate-500">Platform: {result.mode === 'NOT_KNOWN' ? 'Not Known' : result.mode.replace('_', ' ')}</p>
            </div>

            {result.meetingLink && (
              <CopyMeetLinkButton
                meetingLink={result.meetingLink}
                variant="primary"
                size="md"
                label="Copy Meet Link"
                copiedLabel="Meet Link Copied!"
                className="w-full"
              />
            )}

            {onSelectInterview && (
              <button
                type="button"
                onClick={() => {
                  onSelectInterview(result);
                  handleClose();
                }}
                className="w-full text-center text-xs font-semibold text-blue-600 hover:underline pt-1"
              >
                View Full Appointment Details →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
