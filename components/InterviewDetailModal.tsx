'use client';

import React, { useState } from 'react';
import {
  X,
  Building2,
  Briefcase,
  User,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MapPin,
  Star,
  CheckCircle2,
  Mail,
  Phone,
  CalendarPlus,
  Copy,
  Check,
  IndianRupee,
  FileText,
  Globe,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Layers,
  MessageSquare,
  Award,
} from 'lucide-react';
import {
  formatInterviewDate,
  getStatusBadgeInfo,
  getDisplayRefCode,
  copyToClipboard,
  cleanMeetingUrl,
} from '@/lib/formatters';
import { InterviewItem } from './ScheduleCard';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';
import RoundQuestionsSection from '@/components/RoundQuestionsSection';

interface InterviewDetailModalProps {
  interview: InterviewItem | null;
  onClose: () => void;
}

export default function InterviewDetailModal({ interview, onClose }: InterviewDetailModalProps) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  if (!interview) return null;

  const statusInfo = getStatusBadgeInfo(interview.status);
  const displayRef = getDisplayRefCode(interview);

  const openJdBaseUrl = process.env.NEXT_PUBLIC_OPEN_JD_URL || 'https://jdportal.forcecraver.com';
  const targetJobId = interview.job?.id || interview.jobId;
  const jdUrl = targetJobId
    ? `${openJdBaseUrl}/jobs/${targetJobId}`
    : `${openJdBaseUrl}?search=${encodeURIComponent(interview.companyName)}`;

  const copyRefCode = async () => {
    const success = await copyToClipboard(displayRef || interview.referenceCode);
    if (success) {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCopyPhone = async (phone: string) => {
    const success = await copyToClipboard(phone);
    if (success) {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleCopyEmail = async (email: string) => {
    const success = await copyToClipboard(email);
    if (success) {
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    try {
      const d = new Date(interview.interviewDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      const title = encodeURIComponent(
        `Interview: ${interview.candidate?.name || 'Candidate'} - ${interview.companyName} (${interview.jobTitle})`
      );
      const details = encodeURIComponent(
        `Meeting Link: ${interview.meetingLink || 'To be shared'}\nReference: ${interview.referenceCode}\nPlatform: ${interview.mode}`
      );
      const location = encodeURIComponent(interview.meetingLink || interview.locationAddress || 'Online Video');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  const candidateInitial = interview.candidate?.name?.charAt(0)?.toUpperCase() || 'C';
  const cleanLink = interview.meetingLink ? cleanMeetingUrl(interview.meetingLink) : '';

  const getPlatformLabel = (mode: string) => {
    switch (mode) {
      case 'GOOGLE_MEET':
        return 'Google Meet';
      case 'ZOOM':
        return 'Zoom';
      case 'TEAMS':
        return 'MS Teams';
      case 'IN_PERSON':
        return 'In-Person (Office)';
      case 'PHONE':
        return 'Phone Call';
      case 'NOT_KNOWN':
        return 'Not Known';
      default:
        return mode;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-5 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <button
              type="button"
              onClick={copyRefCode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-bold hover:bg-slate-200 transition-colors border border-slate-200/60 cursor-pointer"
              title="Click to copy Reference Code"
            >
              <span>Ref: {displayRef}</span>
              {copiedRef ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>

            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 md:p-7 space-y-6">
          {/* 1. Client Company & Job Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-600">
                <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-extrabold text-blue-700 tracking-tight">
                  {interview.companyName} (Client)
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 leading-tight">
                {interview.jobTitle}
              </h2>

              {/* Meta tags for JD if available */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
                {interview.job?.shiftTiming && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{interview.job.shiftTiming}</span>
                  </span>
                )}
                {interview.job?.salaryBudget && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                    <IndianRupee className="w-3 h-3 text-emerald-600" />
                    <span>Budget: {interview.job.salaryBudget}</span>
                  </span>
                )}
                {interview.job?.location && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{interview.job.location}</span>
                  </span>
                )}
                {interview.job?.uan && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    <span>UAN: {interview.job.uan}</span>
                  </span>
                )}
              </div>
            </div>

            <a
              href={jdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs shrink-0 self-start group/openjd cursor-pointer"
              title="Open full job description in Open JD Portal"
            >
              <Briefcase className="w-4 h-4 text-blue-600" />
              <span>Open JD in Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover/openjd:translate-x-0.5 group-hover/openjd:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* 2. Time, Platform & Meeting Schedule Card */}
          <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/40 to-slate-50 p-4 sm:p-5 rounded-2xl border border-blue-100/90 shadow-2xs space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-950">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span suppressHydrationWarning>{formatInterviewDate(interview.interviewDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-900 font-mono">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span suppressHydrationWarning>
                  {interview.startTime} - {interview.endTime} ({interview.timezone})
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-white text-slate-800 border border-slate-200 shadow-2xs">
                  <Video className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Platform: {getPlatformLabel(interview.mode)}</span>
                </span>

                {interview.roundName && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Round: {interview.roundName}</span>
                  </span>
                )}
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                {statusInfo.label}
              </span>
            </div>

            {/* Meeting Link & Calendar Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                {interview.meetingLink ? (
                  <>
                    <a
                      href={cleanLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Meeting</span>
                      <ExternalLink className="w-3 h-3 text-blue-200" />
                    </a>

                    <CopyMeetLinkButton
                      meetingLink={interview.meetingLink}
                      variant="primary"
                      size="md"
                      label="Copy Meet Link"
                      copiedLabel="Meet Link Copied!"
                    />
                  </>
                ) : (
                  <span className="text-xs text-slate-500 italic bg-white/70 px-3 py-1.5 rounded-lg border border-slate-200">
                    Meeting link will be shared by client / recruiter.
                  </span>
                )}
              </div>

              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all shadow-2xs"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add to Google Calendar</span>
              </a>
            </div>
          </div>

          {/* 3. Recruiter Alignment */}
          {((interview.recruiterCompany || interview.job?.contactPerson) ||
            interview.recruiterCandidate ||
            interview.candidate?.sourcedBy) && (
            <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-4 sm:p-5 space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                <span>Recruiter Alignment</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white/90 p-3 rounded-xl border border-indigo-100/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wide">
                    Recruiter (Company / Handled By)
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                    {interview.recruiterCompany || interview.job?.contactPerson || 'Assigned via Client'}
                  </span>
                </div>
                <div className="bg-white/90 p-3 rounded-xl border border-indigo-100/80 shadow-2xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wide">
                    Recruiter (Candidate / Forcecraver)
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block truncate">
                    {interview.recruiterCandidate || interview.candidate?.sourcedBy || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. Complete Candidate Profile & Information */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 md:p-6 space-y-4 bg-white shadow-2xs">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-600" />
                <span>Candidate Information</span>
              </h4>
              {interview.candidate?.screeningStatus && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                  Screening: {interview.candidate.screeningStatus}
                </span>
              )}
            </div>

            {/* Candidate Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-xs shrink-0">
                  {candidateInitial}
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                    {interview.candidate?.name || 'Candidate'}
                  </h3>
                  {(interview.candidate?.currentRole || interview.candidate?.currentCompany) && (
                    <p className="text-xs text-slate-600 font-medium">
                      {interview.candidate.currentRole}
                      {interview.candidate.currentRole && interview.candidate.currentCompany && ' at '}
                      <span className="font-semibold text-slate-800">
                        {interview.candidate.currentCompany}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {interview.candidate?.experience && (
                <span className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 self-start sm:self-auto">
                  {interview.candidate.experience} experience
                </span>
              )}
            </div>

            {/* Candidate Details Grid (Phone, Email, Location, CTC, Notice Period) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {/* Phone */}
              {interview.candidate?.phone && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${interview.candidate.phone}`}
                      className="font-semibold hover:text-blue-600 truncate"
                    >
                      {interview.candidate.phone}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyPhone(interview.candidate.phone!)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    title="Copy Phone"
                  >
                    {copiedPhone ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {/* Email */}
              {interview.candidate?.email && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-700 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${interview.candidate.email}`}
                      className="font-semibold hover:text-blue-600 truncate"
                      title={interview.candidate.email}
                    >
                      {interview.candidate.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyEmail(interview.candidate.email!)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                    title="Copy Email"
                  >
                    {copiedEmail ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              )}

              {/* Location */}
              {interview.candidate?.location && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    <span className="text-slate-400 font-medium">Location: </span>
                    <span className="font-semibold text-slate-800">{interview.candidate.location}</span>
                  </span>
                </div>
              )}

              {/* Current CTC */}
              {interview.candidate?.currentCtc && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    <span className="text-slate-400 font-medium">Current CTC: </span>
                    <span className="font-semibold text-slate-800">{interview.candidate.currentCtc}</span>
                  </span>
                </div>
              )}

              {/* Expected CTC */}
              {interview.candidate?.expectedCtc && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700">
                  <IndianRupee className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">
                    <span className="text-slate-400 font-medium">Expected CTC: </span>
                    <span className="font-semibold text-emerald-700">{interview.candidate.expectedCtc}</span>
                  </span>
                </div>
              )}

              {/* Notice Period */}
              {interview.candidate?.noticePeriod && (
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 flex items-center gap-2 text-xs text-slate-700">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">
                    <span className="text-slate-400 font-medium">Notice: </span>
                    <span className="font-semibold text-slate-800">{interview.candidate.noticePeriod}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Candidate External Links (Resume, LinkedIn, Portfolio) */}
            {(interview.candidate?.resumeUrl ||
              interview.candidate?.linkedinUrl ||
              interview.candidate?.portfolioUrl) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {interview.candidate.resumeUrl && (
                  <a
                    href={interview.candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold transition-all shadow-2xs"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Resume</span>
                    <ExternalLink className="w-3 h-3 text-blue-500" />
                  </a>
                )}

                {interview.candidate.linkedinUrl && (
                  <a
                    href={interview.candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
                  >
                    <svg className="w-3.5 h-3.5 fill-blue-600 shrink-0" viewBox="0 0 24 24">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2Z" />
                    </svg>
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}

                {interview.candidate.portfolioUrl && (
                  <a
                    href={interview.candidate.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition-all"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                )}
              </div>
            )}

            {/* Candidate Skills */}
            {interview.candidate?.skills && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-1.5 uppercase tracking-wide">
                  Candidate Key Skills:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {interview.candidate.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((skill) => (
                      <span
                        key={skill}
                        className="text-[11px] px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium border border-slate-200/80"
                      >
                        {skill}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Candidate Notes / Remarks */}
            {interview.candidate?.notes && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <span className="font-bold text-slate-800 block mb-0.5">Candidate Notes:</span>
                <p className="whitespace-pre-wrap">{interview.candidate.notes}</p>
              </div>
            )}

            {/* Screening Response / Notes */}
            {(interview.candidate?.screeningNotes || interview.candidate?.screeningResponse) && (
              <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                <span className="font-bold block text-[11px] uppercase tracking-wide text-indigo-800">
                  Screening Summary:
                </span>
                {interview.candidate.screeningResponse && (
                  <p className="italic">"{interview.candidate.screeningResponse}"</p>
                )}
                {interview.candidate.screeningNotes && (
                  <p className="text-indigo-950 font-medium">{interview.candidate.screeningNotes}</p>
                )}
              </div>
            )}
          </div>

          {/* 5. Client Panel & In-Person Location Info */}
          {(interview.interviewerName || interview.locationAddress || interview.interviewerEmail) && (
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2 bg-slate-50/40">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-600" />
                <span>Client Panel & Location</span>
              </h4>
              {interview.interviewerName && (
                <p className="text-xs text-slate-800 font-medium">
                  Interviewer Panel: <span className="font-bold text-slate-900">{interview.interviewerName}</span>
                  {interview.interviewerRole && (
                    <span className="text-slate-600"> ({interview.interviewerRole})</span>
                  )}
                </p>
              )}
              {interview.interviewerEmail && (
                <p className="text-xs text-slate-600">
                  Panel Email: <span className="font-semibold text-slate-800">{interview.interviewerEmail}</span>
                </p>
              )}
              {interview.locationAddress && (
                <p className="text-xs text-slate-700 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="font-medium">{interview.locationAddress}</span>
                </p>
              )}
            </div>
          )}

          {/* 6. Round Questions Section (L1 to L5) */}
          <RoundQuestionsSection interview={interview} />

          {/* 7. Client Feedback & Evaluation */}
          {(interview.feedback || interview.rating) && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Client Evaluation & Result</span>
                </h4>
                {interview.rating && (
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (interview.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {interview.feedback && (
                <p className="text-xs text-slate-700 italic">"{interview.feedback}"</p>
              )}
            </div>
          )}

          {/* 8. Admin Instructions / Notes */}
          {interview.adminNotes && (
            <div className="p-4 rounded-2xl bg-slate-50 text-xs text-slate-700 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Recruiter Instructions & Notes:</span>
              <p className="whitespace-pre-wrap">{interview.adminNotes}</p>
            </div>
          )}

          {/* 9. Cancellation Info */}
          {(interview.status === 'CANCELLED' || interview.cancellationReason) && (
            <div className="p-4 rounded-2xl bg-rose-50 text-xs text-rose-800 border border-rose-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Interview Cancelled</span>
                {interview.cancellationReason && <p>{interview.cancellationReason}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3.5 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">
            {displayRef} • Forcecraver
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 bg-slate-200/80 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
