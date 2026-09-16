'use client';

import React from 'react';
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
} from 'lucide-react';
import { formatInterviewDate, getStatusBadgeInfo, isRealCandidateEmail } from '@/lib/formatters';
import { InterviewItem } from './ScheduleCard';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';
import RoundQuestionsSection from '@/components/RoundQuestionsSection';

interface InterviewDetailModalProps {
  interview: InterviewItem | null;
  onClose: () => void;
}

export default function InterviewDetailModal({ interview, onClose }: InterviewDetailModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!interview) return null;

  const statusInfo = getStatusBadgeInfo(interview.status);

  const copyRefCode = () => {
    navigator.clipboard.writeText(interview.referenceCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    try {
      const d = new Date(interview.interviewDate);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      const title = encodeURIComponent(`Interview: ${interview.candidate.name} - ${interview.companyName} (${interview.jobTitle})`);
      const details = encodeURIComponent(
        `Meeting Link: ${interview.meetingLink || 'To be shared'}\nReference: ${interview.referenceCode}\nPlatform: ${interview.mode}`
      );
      const location = encodeURIComponent(interview.meetingLink || interview.locationAddress || 'Online Video');

      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={copyRefCode}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono font-medium hover:bg-slate-200 transition-colors"
              title="Click to copy Reference Code"
            >
              <span>{interview.referenceCode}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
            </button>

            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
              {statusInfo.label}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Company & Role Header */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
              <Building2 className="w-4 h-4" />
              <span>{interview.companyName} (Client)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {interview.jobTitle}
            </h2>
            <p className="text-xs text-slate-500">
              Assigned Candidate Interview Slot • Forcecraver Recruitment Pipeline
            </p>
          </div>

          {/* Time & Round Schedule Card */}
          <div className="bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 sm:p-5 rounded-2xl border border-blue-100/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-bold text-blue-900">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{formatInterviewDate(interview.interviewDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>{interview.startTime} - {interview.endTime} ({interview.timezone})</span>
              </div>
            </div>

            <div className="pt-2 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-md bg-white text-slate-700 border border-slate-200 shadow-2xs">
                Platform: {interview.mode === 'NOT_KNOWN' ? 'Not Known' : interview.mode.replace('_', ' ')}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                {statusInfo.label}
              </span>
            </div>

            {/* Copy Meet Link & Add to Calendar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {interview.meetingLink && (
                <CopyMeetLinkButton
                  meetingLink={interview.meetingLink}
                  variant="primary"
                  size="md"
                  label="Copy Meet Link"
                  copiedLabel="Meet Link Copied!"
                />
              )}

              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 transition-all"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-blue-600" />
                <span>Add to Google Calendar</span>
              </a>
            </div>
          </div>

          {/* Recruiter Details (Company & Candidate) */}
          {((interview.recruiterCompany || interview.job?.contactPerson) || interview.recruiterCandidate) && (
            <div className="border border-indigo-100 bg-indigo-50/40 rounded-2xl p-4 sm:p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-600" />
                Recruiter Alignment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Recruiter (Company / Handled By)
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                    {interview.recruiterCompany || interview.job?.contactPerson || 'Assigned via Client'}
                  </span>
                </div>
                <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Recruiter (Candidate / Forcecraver)
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">
                    {interview.recruiterCandidate || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Candidate Profile Details */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Candidate Information
            </h4>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  {interview.candidate.name}
                </h3>
                {interview.candidate.currentRole && (
                  <p className="text-xs text-slate-600 mt-0.5">
                    {interview.candidate.currentRole}
                  </p>
                )}
              </div>
              {interview.candidate.experience && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                  {interview.candidate.experience} experience
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              {interview.candidate.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{interview.candidate.phone}</span>
                </div>
              )}
              {interview.candidate.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{interview.candidate.location}</span>
                </div>
              )}
            </div>

            {interview.candidate.skills && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Skills:</span>
                <div className="flex flex-wrap gap-1">
                  {interview.candidate.skills.split(',').map((skill) => (
                    <span
                      key={skill.trim()}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interviewer Panel Info */}
          {(interview.interviewerName || interview.locationAddress) && (
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Client Panel & Location
              </h4>
              {interview.interviewerName && (
                <p className="text-xs text-slate-800 font-medium">
                  Interviewer: <span className="font-semibold">{interview.interviewerName}</span>
                  {interview.interviewerRole && ` (${interview.interviewerRole})`}
                </p>
              )}
              {interview.interviewerEmail && (
                <p className="text-xs text-slate-500">Contact: {interview.interviewerEmail}</p>
              )}
              {interview.locationAddress && (
                <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{interview.locationAddress}</span>
                </p>
              )}
            </div>
          )}

          {/* Round Questions Section (L1 to L5) */}
          <RoundQuestionsSection interview={interview} />

          {/* Client Feedback & Evaluation (if completed/selected) */}
          {(interview.feedback || interview.rating) && (
            <div className="border border-emerald-200 bg-emerald-50/50 rounded-2xl p-4 sm:p-5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Client Evaluation & Result
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
              <p className="text-xs text-slate-700 italic">"{interview.feedback}"</p>
            </div>
          )}

          {/* Admin Instructions / Notes */}
          {interview.adminNotes && (
            <div className="p-3.5 rounded-xl bg-slate-50 text-xs text-slate-600 border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-0.5">Recruiter Instructions:</span>
              <p>{interview.adminNotes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
