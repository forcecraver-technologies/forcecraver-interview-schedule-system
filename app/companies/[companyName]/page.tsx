'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { InterviewItem } from '@/components/ScheduleCard';
import ScheduleTableView from '@/components/ScheduleTableView';
import InterviewDetailModal from '@/components/InterviewDetailModal';
import { Building2, ArrowLeft, CalendarClock, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CompanyDetailsPage() {
  const params = useParams();
  const rawCompanyName = (params?.companyName as string) || '';
  const decodedName = decodeURIComponent(rawCompanyName);

  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);

  useEffect(() => {
    async function loadInterviews() {
      if (!decodedName) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/interviews?company=${encodeURIComponent(decodedName)}&limit=100`);
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews || []);
        }
      } catch (err) {
        console.error('Failed to load company interviews:', err);
      } finally {
        setLoading(false);
      }
    }
    loadInterviews();
  }, [decodedName]);

  const handledBy = interviews[0]?.recruiterCompany || interviews[0]?.job?.contactPerson;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-2xl shadow-md shadow-blue-500/20">
              <Building2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Client Employer
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {decodedName}
              </h1>
              <div className="flex items-center flex-wrap gap-3 pt-1">
                {handledBy && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Handled By:</span>
                    <span className="font-bold text-blue-700">{handledBy}</span>
                  </span>
                )}
                <p className="text-sm text-slate-500 font-medium flex items-center gap-1.5">
                  <CalendarClock className="w-4 h-4 text-blue-600" />
                  <span className="text-slate-900 font-bold">{interviews.length}</span> Scheduled{' '}
                  {interviews.length === 1 ? 'Interview Slot' : 'Interview Slots'}
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/companies"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-600 bg-slate-50 hover:bg-blue-50/50 px-4 py-2.5 rounded-xl border border-slate-200 transition-colors self-start md:self-center"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Companies
          </Link>
        </div>

        {/* Interviews Listing */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <span>Scheduled Candidate Interviews at {decodedName}</span>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
              {interviews.length}
            </span>
          </h2>

          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">Loading scheduled interviews...</p>
            </div>
          ) : interviews.length > 0 ? (
            <ScheduleTableView
              interviews={interviews}
              onSelectInterview={(item) => setSelectedInterview(item)}
            />
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
              <CalendarClock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Scheduled Interviews</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                There are currently no scheduled candidate interviews for {decodedName}.
              </p>
              <Link
                href="/companies"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
              >
                Browse All Companies
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <InterviewDetailModal
        interview={selectedInterview}
        onClose={() => setSelectedInterview(null)}
      />
    </div>
  );
}
