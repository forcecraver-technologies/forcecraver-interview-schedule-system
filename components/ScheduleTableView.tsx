'use client';

import React, { useState } from 'react';
import {
  Building2,
  Briefcase,
  User,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  ChevronRight,
  MapPin,
  Check,
  Copy,
} from 'lucide-react';
import { InterviewItem } from '@/components/ScheduleCard';
import {
  formatInterviewDate,
  getStatusBadgeInfo,
  getRelativeTimeText,
  isInterviewCooledDown,
  getDisplayRefCode,
  copyToClipboard,
  cleanMeetingUrl,
} from '@/lib/formatters';

interface ScheduleTableViewProps {
  interviews: InterviewItem[];
  onSelectInterview: (interview: InterviewItem) => void;
}

export default function ScheduleTableView({
  interviews,
  onSelectInterview,
}: ScheduleTableViewProps) {
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  const handleCopyLink = async (e: React.MouseEvent, link: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(link);
    if (success) {
      setCopiedLinkId(id);
      setTimeout(() => setCopiedLinkId(null), 2000);
    }
  };

  const openJdBaseUrl = process.env.NEXT_PUBLIC_OPEN_JD_URL || 'https://jdportal.forcecraver.com';

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'GOOGLE_MEET':
        return 'Google Meet';
      case 'ZOOM':
        return 'Zoom';
      case 'TEAMS':
        return 'MS Teams';
      case 'IN_PERSON':
        return 'In-Person';
      case 'PHONE':
        return 'Phone Call';
      case 'NOT_KNOWN':
        return 'Not Known';
      default:
        return mode;
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold text-[11px] tracking-wider uppercase">
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[130px]">Ref &amp; Status</th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[200px]">Client Company &amp; JD Title</th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[180px]">Candidate</th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[170px]">Recruiters</th>
              <th className="py-3 px-3.5 whitespace-nowrap min-w-[160px]">Schedule &amp; Platform</th>
              <th className="py-3 px-3.5 whitespace-nowrap text-right pr-4 min-w-[170px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {interviews.map((interview) => {
              const statusInfo = getStatusBadgeInfo(interview.status);
              const relativeTime = getRelativeTimeText(interview.interviewDate, interview.startTime);
              const isCooledDown = isInterviewCooledDown(interview.interviewDate);
              const isLinkCopied = copiedLinkId === interview.id;

              const targetJobId = interview.job?.id || interview.jobId;
              const jdUrl = targetJobId
                ? `${openJdBaseUrl}/jobs/${targetJobId}`
                : `${openJdBaseUrl}?search=${encodeURIComponent(interview.companyName)}`;

              const candidateInitial = interview.candidate?.name?.charAt(0)?.toUpperCase() || 'C';

              return (
                <tr
                  key={`table-row-${interview.id}`}
                  onClick={() => onSelectInterview(interview)}
                  className={`group transition-colors cursor-pointer ${
                    isCooledDown
                      ? 'bg-slate-50/40 hover:bg-slate-100/60 opacity-90'
                      : 'hover:bg-blue-50/40'
                  }`}
                >
                  {/* 1. Ref, Relative Time & Status */}
                  <td className="py-3.5 px-3.5 align-top">
                    <div className="flex flex-col gap-1.5 min-w-[120px]">
                      <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 self-start">
                        {getDisplayRefCode(interview)}
                      </span>

                      <span
                        suppressHydrationWarning
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border self-start whitespace-nowrap ${
                          isCooledDown
                            ? 'bg-slate-100 text-slate-500 border-slate-200'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}
                      >
                        {isCooledDown ? 'Cooled Down' : relativeTime}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border self-start whitespace-nowrap ${statusInfo.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </div>
                  </td>

                  {/* 2. Client Company & JD Title */}
                  <td className="py-3.5 px-3.5 align-top">
                    <div className="flex flex-col gap-1 min-w-[190px] max-w-[280px]">
                      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 truncate">
                        <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="truncate font-bold text-slate-900 group-hover:text-blue-600 transition-colors" title={interview.companyName}>
                          {interview.companyName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {isCooledDown ? '• Cooldown' : '• Active'}
                        </span>
                      </div>

                      <h4
                        className="text-xs font-bold text-slate-800 leading-snug break-words group-hover:text-blue-600 transition-colors"
                        title={interview.jobTitle}
                      >
                        {interview.jobTitle}
                      </h4>
                    </div>
                  </td>

                  {/* 3. Candidate Info */}
                  <td className="py-3.5 px-3.5 align-top">
                    <div className="flex flex-col gap-1 min-w-[160px] max-w-[220px]">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[11px] shrink-0">
                          {candidateInitial}
                        </div>
                        <span className="font-bold text-slate-900 truncate">
                          {interview.candidate?.name || 'Candidate'}
                        </span>
                      </div>

                      {(interview.candidate?.experience || interview.candidate?.location) && (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pl-8 flex-wrap">
                          {interview.candidate?.experience && (
                            <span className="font-medium text-slate-600">
                              {interview.candidate.experience}
                            </span>
                          )}
                          {interview.candidate?.experience && interview.candidate?.location && (
                            <span>•</span>
                          )}
                          {interview.candidate?.location && (
                            <span className="inline-flex items-center gap-0.5 text-slate-500">
                              <MapPin className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate max-w-[100px]">{interview.candidate.location}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 4. Recruiter Tags */}
                  <td className="py-3.5 px-3.5 align-top">
                    <div className="flex flex-col gap-1 min-w-[160px] max-w-[220px]">
                      {(interview.recruiterCompany || interview.job?.contactPerson) && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100/90 text-slate-700 text-[10px] border border-slate-200 self-start">
                          <span className="text-slate-400 font-semibold uppercase text-[9px]">Handled by:</span>
                          <span className="font-bold text-slate-800 truncate max-w-[120px]">
                            {interview.recruiterCompany || interview.job?.contactPerson}
                          </span>
                        </div>
                      )}

                      {interview.recruiterCandidate && (
                        <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[10px] border border-indigo-100 self-start">
                          <span className="text-indigo-400 font-semibold uppercase text-[9px]">Candidate Recruiter:</span>
                          <span className="font-bold text-indigo-900 truncate max-w-[120px]">
                            {interview.recruiterCandidate}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 5. Schedule & Platform */}
                  <td className="py-3.5 px-3.5 align-top">
                    <div className="flex flex-col gap-1 min-w-[150px]">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800 text-xs whitespace-nowrap">
                        <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span suppressHydrationWarning>{formatInterviewDate(interview.interviewDate)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-slate-600 font-mono whitespace-nowrap">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span suppressHydrationWarning>{interview.startTime} - {interview.endTime}</span>
                      </div>

                      <div className="flex items-center gap-1 pt-0.5">
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 whitespace-nowrap">
                          <Video className="w-2.5 h-2.5 text-indigo-500" />
                          <span>{getModeLabel(interview.mode)}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 6. Actions */}
                  <td
                    className="py-3.5 px-3.5 text-right pr-4 align-middle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Copy Link Button */}
                      {interview.meetingLink && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyLink(e, interview.meetingLink!, interview.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                            isLinkCopied
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                          title="Copy meeting link"
                        >
                          {isLinkCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-slate-500" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      )}

                      {/* Open JD Button */}
                      <a
                        href={jdUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-semibold transition-all whitespace-nowrap"
                        title="Open job description"
                      >
                        <Briefcase className="w-3 h-3 text-blue-600" />
                        <span>Open JD</span>
                        <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                      </a>

                      {/* View Details Modal Button */}
                      <button
                        type="button"
                        onClick={() => onSelectInterview(interview)}
                        className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
