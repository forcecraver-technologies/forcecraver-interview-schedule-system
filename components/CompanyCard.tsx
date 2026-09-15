'use client';

import React from 'react';
import Link from 'next/link';
import { Building2, ExternalLink, UserCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export interface ScheduledCompany {
  companyName: string;
  interviewCount: number;
  contactPerson?: string | null;
  latestInterviewDate?: string;
  candidateCount: number;
}

interface CompanyCardProps {
  company: ScheduledCompany;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const dateStr = company.latestInterviewDate
    ? format(new Date(company.latestInterviewDate), 'MMM dd, yyyy')
    : null;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between space-y-5 group">
      {/* Top Section: Icon, Company Name, Latest Session */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-2xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {company.companyName}
              </h3>
              {dateStr && (
                <p className="text-xs text-slate-400 mt-0.5">
                  Latest session: {dateStr}
                </p>
              )}
            </div>
          </div>

          <Link
            href={`/companies/${encodeURIComponent(company.companyName)}`}
            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Company Interviews"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Middle Section: Handled By Block */}
        <div className="bg-slate-50/90 rounded-2xl p-3.5 border border-slate-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
              HANDLED BY
            </span>
            <span className="font-bold text-slate-900 text-sm line-clamp-1">
              {company.contactPerson || (
                <span className="text-slate-400 font-normal italic">HR & Talent Team</span>
              )}
            </span>
          </div>
        </div>

        {/* Bottom Metric Row: Active Interviews Count */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            {company.interviewCount} Scheduled
          </span>

          <span className="text-slate-500 font-medium">
            {company.candidateCount} {company.candidateCount === 1 ? 'Candidate' : 'Candidates'}
          </span>
        </div>
      </div>

      {/* Action Link Button */}
      <Link
        href={`/companies/${encodeURIComponent(company.companyName)}`}
        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-slate-100 hover:bg-blue-600 text-slate-800 hover:text-white font-bold text-xs rounded-xl transition-all shadow-2xs group-hover:bg-blue-600 group-hover:text-white"
      >
        <span>View Scheduled Interviews</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
