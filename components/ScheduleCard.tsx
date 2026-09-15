'use client';

import React from 'react';
import {
  Building2,
  Briefcase,
  User,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { formatInterviewDate, getStatusBadgeInfo, getRelativeTimeText, isInterviewCooledDown } from '@/lib/formatters';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';

export interface InterviewItem {
  id: string;
  referenceCode: string;
  companyName: string;
  jobTitle: string;
  recruiterCompany?: string | null;
  recruiterCandidate?: string | null;
  interviewDate: string;
  startTime: string;
  endTime: string;
  timezone: string;
  roundNumber: number;
  roundName?: string | null;
  mode: string;
  meetingLink?: string | null;
  locationAddress?: string | null;
  interviewerName?: string | null;
  interviewerRole?: string | null;
  interviewerEmail?: string | null;
  status: string;
  rating?: number | null;
  feedback?: string | null;
  adminNotes?: string | null;
  l1Questions?: string | null;
  l2Questions?: string | null;
  l3Questions?: string | null;
  l4Questions?: string | null;
  l5Questions?: string | null;
  candidate: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    experience?: string | null;
    location?: string | null;
    currentRole?: string | null;
    skills?: string | null;
    resumeUrl?: string | null;
  };
  job?: {
    id: string;
    companyName: string;
    jobTitle: string;
    contactPerson?: string | null;
    location?: string | null;
    salaryBudget?: string | null;
    experience?: string | null;
    status: string;
  } | null;
}

interface ScheduleCardProps {
  interview: InterviewItem;
  onSelect: (interview: InterviewItem) => void;
}

export default function ScheduleCard({ interview, onSelect }: ScheduleCardProps) {
  const statusInfo = getStatusBadgeInfo(interview.status);
  const relativeTime = getRelativeTimeText(interview.interviewDate, interview.startTime);
  const isCooledDown = isInterviewCooledDown(interview.interviewDate);

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
    <div
      onClick={() => onSelect(interview)}
      className={`group relative rounded-2xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
        isCooledDown
          ? 'bg-slate-50/70 border-slate-200/90 opacity-80 hover:opacity-100 hover:bg-white'
          : 'bg-white border-slate-200/80 hover:border-blue-300'
      }`}
    >
      {/* Top bar: Reference code, Relative Time, and Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {interview.referenceCode}
          </span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              isCooledDown
                ? 'bg-slate-100 text-slate-500 border-slate-200'
                : 'bg-blue-50 text-blue-700 border-blue-100'
            }`}
          >
            {isCooledDown ? 'Cooled Down' : relativeTime}
          </span>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusInfo.bg}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
          {statusInfo.label}
        </span>
      </div>

      {/* Main Content: Company & JD info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-100">
            <Building2 className="w-3.5 h-3.5" />
            {interview.companyName}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {isCooledDown ? '• Past Slot (6 PM Cooldown)' : '• Active Client'}
          </span>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {interview.jobTitle}
        </h3>

        {/* Candidate Info */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs text-slate-600">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[11px] shrink-0">
              {interview.candidate.name.charAt(0)}
            </div>
            <span className="font-semibold text-slate-800 truncate">{interview.candidate.name}</span>
            {interview.candidate.experience && (
              <span className="text-slate-400 shrink-0">({interview.candidate.experience})</span>
            )}
          </div>
          {interview.candidate.location && (
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
              <MapPin className="w-3 h-3 text-slate-400" />
              {interview.candidate.location}
            </span>
          )}
        </div>

        {/* Recruiter Tags */}
        {((interview.recruiterCompany || interview.job?.contactPerson) || interview.recruiterCandidate) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[10px]">
            {(interview.recruiterCompany || interview.job?.contactPerson) && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100/90 text-slate-600 font-medium border border-slate-200">
                <span className="text-slate-400 font-semibold uppercase text-[9px]">Handled by:</span>
                <span className="text-slate-800 font-bold">{interview.recruiterCompany || interview.job?.contactPerson}</span>
              </span>
            )}
            {interview.recruiterCandidate && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50/80 text-indigo-700 font-medium border border-indigo-100">
                <span className="text-indigo-400 font-semibold uppercase text-[9px]">Candidate Recruiter:</span>
                <span className="text-indigo-900 font-bold">{interview.recruiterCandidate}</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Date, Time & Round Details */}
      <div className="bg-slate-50/90 rounded-xl p-3 border border-slate-100 space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>{formatInterviewDate(interview.interviewDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-800">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{interview.startTime} - {interview.endTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50">
          <span className="text-[11px] text-slate-500">{interview.timezone}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
            <Video className="w-3 h-3 text-indigo-500" />
            {getModeLabel(interview.mode)}
          </span>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <CopyMeetLinkButton
          meetingLink={interview.meetingLink}
          variant="text"
          size="sm"
          label="Copy Meet Link"
          copiedLabel="Link Copied!"
        />

        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
