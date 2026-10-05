'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Building2,
  User,
  Phone,
  Link2,
  Copy,
  Check,
  CalendarCheck,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { InterviewItem } from '@/components/ScheduleCard';
import {
  copyToClipboard,
  cleanMeetingUrl,
  getInterviewSlotBadge,
  getStageLabel,
  getFirstName,
} from '@/lib/formatters';

interface TodayInterviewsCardProps {
  interviews: InterviewItem[];
  loading?: boolean;
  stats?: {
    todayCount: number;
    thisWeekCount: number;
    activeCompaniesCount: number;
    completedCount: number;
  };
  onSelectInterview: (interview: InterviewItem) => void;
  onViewAllToday?: () => void;
}

export default function TodayInterviewsCard({
  interviews,
  loading = false,
  stats,
  onSelectInterview,
  onViewAllToday,
}: TodayInterviewsCardProps) {
  const [copiedPhoneId, setCopiedPhoneId] = useState<string | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const todayFormatted = mounted
    ? new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Kolkata',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date())
    : '';

  const handleCopyPhone = async (e: React.MouseEvent, phone: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(phone);
    if (success) {
      setCopiedPhoneId(id);
      setTimeout(() => setCopiedPhoneId(null), 2000);
    }
  };

  const handleCopyLink = async (e: React.MouseEvent, link: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    }
  };

  return (
    <div className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-blue-100 shadow-md shadow-blue-900/5 hover:border-blue-200 transition-all overflow-hidden flex flex-col">
      {/* Header Bar */}
      <div className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold tracking-tight">Today&apos;s Interviews</h3>
            <span className="px-2 py-0.2 rounded-full bg-white/20 text-white text-[10px] font-bold">
              {loading ? '...' : `${interviews.length} ${interviews.length === 1 ? 'Slot' : 'Slots'}`}
            </span>
            {mounted && todayFormatted && (
              <>
                <span className="hidden md:inline-block text-white/50 text-[10px]">•</span>
                <span
                  suppressHydrationWarning
                  className="text-[11px] text-blue-100/90 font-medium flex items-center gap-1"
                >
                  <Calendar className="w-3 h-3 inline" />
                  <span>{todayFormatted}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {onViewAllToday && (
          <button
            type="button"
            onClick={onViewAllToday}
            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-all flex items-center gap-1 cursor-pointer"
          >
            <span>Timeline</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Grid Cards Content */}
      <div className="p-3 sm:p-4 space-y-3">
        {loading ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-500 font-medium">Loading slots...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-xl bg-slate-50/80 border border-dashed border-slate-200">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">No interviews scheduled for today</h4>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
              {stats?.thisWeekCount
                ? `${stats.thisWeekCount} interviews scheduled this week across ${stats.activeCompaniesCount} clients.`
                : 'Search candidate pipelines or browse upcoming schedules below.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-3.5">
            {interviews.map((item) => {
              const phone = item.candidate?.phone?.trim();
              const isPhoneCopied = copiedPhoneId === item.id;
              const isLinkCopied = copiedLinkId === item.id;
              const slotBadge = getInterviewSlotBadge(item);
              const stageLabel = getStageLabel(item.roundNumber, item.roundName, item.status);
              const timeDisplay = item.endTime
                ? `${item.startTime} – ${item.endTime}`
                : item.startTime;
              const rawRecruiter = item.recruiterCandidate || item.recruiterCompany || item.job?.contactPerson;
              const recruiterName = getFirstName(rawRecruiter);

              return (
                <div
                  key={`today-grid-${item.id}`}
                  onClick={() => onSelectInterview(item)}
                  className="group relative bg-white hover:bg-slate-50/50 rounded-2xl border border-slate-200/90 hover:border-blue-400 shadow-2xs hover:shadow-md transition-all p-3 sm:p-3.5 flex flex-col justify-between gap-2 cursor-pointer select-none"
                >
                  {/* Row 1: Client Name (Top-Left) & Status Badge (Top-Right) */}
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 tracking-tight truncate min-w-0 flex-1">
                      <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 shrink-0" />
                      <span className="truncate group-hover:text-blue-600 transition-colors" title={item.companyName}>
                        {item.companyName}
                      </span>
                    </div>

                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${slotBadge.pillClass} shrink-0 whitespace-nowrap`}
                    >
                      {slotBadge.dotClass && (
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${slotBadge.dotClass}`} />
                      )}
                      <span>{slotBadge.label}</span>
                    </div>
                  </div>

                  {/* Row 2: JD Title (under Client Name, wraps naturally) + Stage Badge */}
                  <div className="flex items-start justify-between gap-2.5 min-w-0">
                    <h4
                      className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug break-words min-w-0 flex-1 group-hover:text-blue-600 transition-colors"
                      title={item.jobTitle}
                    >
                      {item.jobTitle || 'Open Position'}
                    </h4>

                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#EEF4FF] text-blue-700 border border-blue-100/90 shrink-0 self-start whitespace-nowrap">
                      {stageLabel}
                    </span>
                  </div>

                  {/* Row 3: Time & Recruiter Details */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-0.5 min-w-0">
                    {/* Time */}
                    <div className="flex items-center gap-1.5 font-bold text-slate-800 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span suppressHydrationWarning>{timeDisplay}</span>
                    </div>

                    {/* Recruiter */}
                    {recruiterName && (
                      <div
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md border border-slate-200/70 shrink-0 max-w-[55%] truncate"
                        title={`Recruiter: ${recruiterName}`}
                      >
                        <span className="text-slate-400 font-normal text-[10px] shrink-0">Recruiter:</span>
                        <span className="font-bold text-slate-800 truncate">{recruiterName}</span>
                      </div>
                    )}
                  </div>

                  {/* Row 4: Candidate Name & Phone Bar */}
                  <div
                    className="bg-[#F4F7FB] group-hover:bg-[#EDF2F9] rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2 border border-slate-100 transition-colors min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Candidate Name */}
                    <div className="flex items-center gap-1.5 truncate min-w-0 flex-1">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span
                        className="font-bold text-xs text-slate-800 truncate"
                        title={item.candidate?.name}
                      >
                        {item.candidate?.name || 'Candidate'}
                      </span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Phone className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                      {phone ? (
                        <div className="flex items-center gap-0.5">
                          <a
                            href={`tel:${phone}`}
                            className="font-semibold text-xs text-slate-800 font-sans sm:font-mono hover:text-blue-600 transition-colors"
                            title="Call candidate"
                          >
                            {phone}
                          </a>
                          <button
                            type="button"
                            onClick={(e) => handleCopyPhone(e, phone, item.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors cursor-pointer"
                            title={isPhoneCopied ? 'Phone copied!' : 'Copy phone'}
                          >
                            {isPhoneCopied ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Row 5: Meeting Link Bar */}
                  <div
                    className="bg-[#EFF6FF] group-hover:bg-blue-50 rounded-xl px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between gap-2 border border-blue-100/80 transition-colors min-w-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Meeting link */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <Link2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      {item.meetingLink ? (
                        <a
                          href={item.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-xs text-slate-700 hover:text-blue-600 hover:underline truncate transition-colors block"
                          title="Open meeting link"
                        >
                          {cleanMeetingUrl(item.meetingLink)}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No link provided</span>
                      )}
                    </div>

                    {/* Copy Link Button */}
                    {item.meetingLink && (
                      <button
                        type="button"
                        onClick={(e) => handleCopyLink(e, item.meetingLink!, item.id)}
                        className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors cursor-pointer shrink-0"
                        title={isLinkCopied ? 'Link copied!' : 'Copy meeting link'}
                      >
                        {isLinkCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info strip */}
        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-500 font-medium">
          <div className="flex items-center gap-1 text-slate-600">
            <Radio className="w-2.5 h-2.5 text-blue-600 animate-pulse" />
            <span>Today&apos;s Slots: <strong>{interviews.length}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>This Week: <strong className="text-slate-700">{stats?.thisWeekCount || 0}</strong></span>
            <span>•</span>
            <span>Active Clients: <strong className="text-slate-700">{stats?.activeCompaniesCount || 0}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}

