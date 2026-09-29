'use client';

import React, { useState, useMemo } from 'react';
import {
  Building2,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MapPin,
  Briefcase,
  User,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { InterviewItem } from './ScheduleCard';
import { formatInterviewDate, getStatusBadgeInfo, getDisplayRefCode } from '@/lib/formatters';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';

interface CompanyPortalViewProps {
  interviews: InterviewItem[];
  onSelectInterview: (interview: InterviewItem) => void;
  onSwitchToList?: (companyName?: string) => void;
  initialSelectedCompany?: string;
}

export default function CompanyPortalView({
  interviews,
  onSelectInterview,
  onSwitchToList,
  initialSelectedCompany = 'All',
}: CompanyPortalViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>(initialSelectedCompany);

  // Group interviews strictly by companyName (only companies that have scheduled interviews)
  const companyGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        companyName: string;
        interviews: InterviewItem[];
        handledBy?: string;
        uniqueRoles: Set<string>;
        uniqueCandidates: Set<string>;
      }
    >();

    interviews.forEach((item) => {
      const name = item.companyName || 'Unknown Company';
      if (!map.has(name)) {
        map.set(name, {
          companyName: name,
          interviews: [],
          handledBy: item.recruiterCompany || item.job?.contactPerson || undefined,
          uniqueRoles: new Set<string>(),
          uniqueCandidates: new Set<string>(),
        });
      }

      const group = map.get(name)!;
      group.interviews.push(item);
      if (item.jobTitle) group.uniqueRoles.add(item.jobTitle);
      if (item.candidate?.name) group.uniqueCandidates.add(item.candidate.name);
      if (!group.handledBy && (item.recruiterCompany || item.job?.contactPerson)) {
        group.handledBy = item.recruiterCompany || item.job?.contactPerson || undefined;
      }
    });

    return Array.from(map.values()).sort((a, b) => b.interviews.length - a.interviews.length);
  }, [interviews]);

  // Filtered company groups based on search & selected company
  const filteredCompanyGroups = useMemo(() => {
    return companyGroups.filter((group) => {
      // Company filter
      if (selectedCompanyFilter !== 'All' && group.companyName !== selectedCompanyFilter) {
        return false;
      }

      // Search query filter (matches company name, roles, candidate names, or reference codes)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesCompany = group.companyName.toLowerCase().includes(q);
        const matchesCandidate = group.interviews.some((i) =>
          i.candidate?.name?.toLowerCase().includes(q)
        );
        const matchesRole = group.interviews.some((i) =>
          i.jobTitle?.toLowerCase().includes(q)
        );
        const matchesRef = group.interviews.some((i) =>
          i.referenceCode?.toLowerCase().includes(q)
        );
        return matchesCompany || matchesCandidate || matchesRole || matchesRef;
      }

      return true;
    });
  }, [companyGroups, selectedCompanyFilter, searchQuery]);

  // Overall totals
  const totalScheduledCompanies = companyGroups.length;
  const totalActiveInterviews = interviews.length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-3">
              <Building2 className="w-3.5 h-3.5 text-blue-300" />
              <span>Company Portal</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Client Company Interview Portals
            </h2>
            <p className="text-sm text-blue-100/80 mt-1 max-w-2xl">
              All client companies with scheduled interviews. Review candidate allocations, interview rounds, and meeting coordinates per client organization.
            </p>
          </div>

          {/* Quick Counter Pills */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center min-w-[110px]">
              <div className="text-2xl font-black text-white">{totalScheduledCompanies}</div>
              <div className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">Active Companies</div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/10 backdrop-blur border border-white/10 text-center min-w-[110px]">
              <div className="text-2xl font-black text-emerald-300">{totalActiveInterviews}</div>
              <div className="text-[11px] font-medium text-blue-200 uppercase tracking-wider">Scheduled Slots</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company, candidate name, or role..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/60"
            />
          </div>

          {/* Switch to List View CTA */}
          {onSwitchToList && (
            <button
              onClick={() => onSwitchToList(selectedCompanyFilter !== 'All' ? selectedCompanyFilter : undefined)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors self-end sm:self-auto"
            >
              <span>View Timeline Cards</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>

        {/* Company Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <button
            onClick={() => setSelectedCompanyFilter('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCompanyFilter === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Companies ({totalScheduledCompanies})
          </button>
          {companyGroups.map((cg) => (
            <button
              key={cg.companyName}
              onClick={() => setSelectedCompanyFilter(cg.companyName)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                selectedCompanyFilter === cg.companyName
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3 h-3" />
              <span>{cg.companyName}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCompanyFilter === cg.companyName
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}>
                {cg.interviews.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {filteredCompanyGroups.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No company portals found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No active companies matched your filter criteria. Try clearing your search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCompanyFilter('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        /* Company Groups List */
        <div className="space-y-6">
          {filteredCompanyGroups.map((group) => {
            // Generate simple initials avatar
            const initials = group.companyName
              .split(' ')
              .map((w) => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            return (
              <div
                key={group.companyName}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* Company Header */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 via-blue-50/20 to-white border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-base flex items-center justify-center shadow-md shadow-blue-500/20">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{group.companyName}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
                          {group.interviews.length} Scheduled {group.interviews.length === 1 ? 'Interview' : 'Interviews'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        {group.handledBy && (
                          <span className="flex items-center gap-1 font-medium text-slate-600">
                            <span className="text-slate-400">Client SPOC:</span>
                            <span className="font-semibold text-blue-600">{group.handledBy}</span>
                          </span>
                        )}
                        <span>•</span>
                        <span>{group.uniqueCandidates.size} {group.uniqueCandidates.size === 1 ? 'Candidate' : 'Candidates'}</span>
                        <span>•</span>
                        <span>{group.uniqueRoles.size} Active {group.uniqueRoles.size === 1 ? 'Role' : 'Roles'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {onSwitchToList && (
                    <button
                      onClick={() => onSwitchToList(group.companyName)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors self-start sm:self-auto"
                    >
                      <span>Filter Live Schedule</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Candidate Interviews Grid */}
                <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.interviews.map((interview) => {
                    const statusInfo = getStatusBadgeInfo(interview.status);
                    const openJdBaseUrl = process.env.NEXT_PUBLIC_OPEN_JD_URL || 'http://localhost:3000';
                    const targetJobId = interview.job?.id || interview.jobId;
                    const jdUrl = targetJobId
                      ? `${openJdBaseUrl}/jobs/${targetJobId}`
                      : `${openJdBaseUrl}?search=${encodeURIComponent(interview.companyName)}`;

                    return (
                      <div
                        key={interview.id}
                        className="p-4 rounded-2xl border border-slate-200/70 bg-slate-50/40 hover:bg-white hover:border-blue-200 hover:shadow-sm transition-all flex flex-col justify-between"
                      >
                        <div>
                          {/* Top Row: Ref & Status */}
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              Ref: {getDisplayRefCode(interview)}
                            </span>
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusInfo.bg}`}
                            >
                              {statusInfo.label}
                            </span>
                          </div>

                          {/* Candidate Name & Role */}
                          <div className="mb-3">
                            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                              <User className="w-4 h-4 text-slate-400" />
                              <span>{interview.candidate.name}</span>
                            </h4>
                            <p className="text-xs font-medium text-slate-600 mt-0.5 flex items-center gap-1">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span>{interview.jobTitle}</span>
                            </p>
                            {interview.candidate.location && (
                              <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{interview.candidate.location}</span>
                                {interview.candidate.experience && (
                                  <>
                                    <span>•</span>
                                    <span>{interview.candidate.experience}</span>
                                  </>
                                )}
                              </p>
                            )}
                          </div>

                          {/* Interview Timing Slot */}
                          <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 space-y-1.5 text-xs text-slate-700 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="flex items-center gap-1.5 font-semibold text-slate-800">
                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                {formatInterviewDate(interview.interviewDate)}
                              </span>
                              <span className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                {interview.startTime} - {interview.endTime}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                              <span className="font-medium text-slate-600">Platform: {interview.mode === 'NOT_KNOWN' ? 'Not Known' : interview.mode.replace('_', ' ')}</span>
                              <span className="px-2 py-0.5 rounded bg-slate-100 font-medium text-[10px] text-slate-600">
                                {interview.timezone}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60">
                          <CopyMeetLinkButton
                            meetingLink={interview.meetingLink}
                            variant="primary"
                            size="sm"
                            label="Copy Meet Link"
                            copiedLabel="Link Copied!"
                            className="flex-1"
                          />

                          <a
                            href={jdUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-colors shrink-0"
                            title="Open full job description on Open JD Portal"
                          >
                            <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                            <span>Open JD</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => onSelectInterview(interview)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors shrink-0"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
