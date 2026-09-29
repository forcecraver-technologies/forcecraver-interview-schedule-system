import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import { formatInterviewDate, getStatusBadgeInfo, isInterviewCooledDown, isRealCandidateEmail, getDisplayRefCode } from '@/lib/formatters';
import {
  Building2,
  Briefcase,
  User,
  Calendar,
  Clock,
  Video,
  ExternalLink,
  MapPin,
  CalendarPlus,
  Mail,
  Phone,
  ArrowLeft,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import CopyMeetLinkButton from '@/components/CopyMeetLinkButton';
import RoundQuestionsSection from '@/components/RoundQuestionsSection';

interface SlotPageProps {
  params: Promise<{ ref: string }>;
}

export async function generateMetadata({ params }: SlotPageProps) {
  const { ref } = await params;
  const rawRef = decodeURIComponent(ref).trim();
  const cleanRef = rawRef.replace(/^[#]/, '');

  const interview = await prisma.interview.findFirst({
    where: {
      OR: [
        { referenceCode: { equals: rawRef, mode: 'insensitive' } },
        { referenceCode: { equals: cleanRef, mode: 'insensitive' } },
        { id: { equals: rawRef } },
        { id: { startsWith: cleanRef } },
        { jobId: { equals: rawRef } },
        { jobId: { startsWith: cleanRef } },
      ],
    },
    include: { candidate: true, job: true },
  });

  if (!interview) return { title: 'Interview Slot Not Found | Forcecraver' };

  return {
    title: `Interview: ${interview.candidate.name} at ${interview.companyName} (${getDisplayRefCode(interview)})`,
    description: `Interview slot for ${interview.candidate.name} for ${interview.jobTitle} at ${interview.companyName}.`,
  };
}

export default async function CandidateSlotPage({ params }: SlotPageProps) {
  const { ref } = await params;
  const rawRef = decodeURIComponent(ref).trim();
  const cleanRef = rawRef.replace(/^[#]/, '');

  const interview = await prisma.interview.findFirst({
    where: {
      OR: [
        { referenceCode: { equals: rawRef, mode: 'insensitive' } },
        { referenceCode: { equals: cleanRef, mode: 'insensitive' } },
        { id: { equals: rawRef } },
        { id: { startsWith: cleanRef } },
        { jobId: { equals: rawRef } },
        { jobId: { startsWith: cleanRef } },
      ],
    },
    include: {
      candidate: true,
      job: true,
    },
  });

  if (!interview) {
    notFound();
  }

  const statusInfo = getStatusBadgeInfo(interview.status);
  const isCooledDown = isInterviewCooledDown(interview.interviewDate);
  const openJdBaseUrl = process.env.NEXT_PUBLIC_OPEN_JD_URL || 'http://localhost:3000';
  const targetJobId = interview.job?.id || interview.jobId;
  const jdUrl = targetJobId
    ? `${openJdBaseUrl}/jobs/${targetJobId}`
    : `${openJdBaseUrl}?search=${encodeURIComponent(interview.companyName)}`;
  const openJdUrl = openJdBaseUrl;

  // Google Calendar URL generator
  const getGoogleCalendarUrl = () => {
    try {
      const d = new Date(interview.interviewDate);
      const title = encodeURIComponent(
        `Interview: ${interview.candidate.name} - ${interview.companyName} (${interview.jobTitle})`
      );
      const details = encodeURIComponent(
        `Candidate: ${interview.candidate.name}\nCompany: ${interview.companyName}\nRole: ${interview.jobTitle}\nSlot: ${interview.startTime} - ${interview.endTime} (${interview.timezone})\nMeeting Link: ${interview.meetingLink || 'To be shared'}\nRef: ${interview.referenceCode}`
      );
      const location = encodeURIComponent(
        interview.meetingLink || interview.locationAddress || 'Online Video'
      );
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
    } catch {
      return '#';
    }
  };

  const calendarUrl = getGoogleCalendarUrl();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Image
              src="/logo.png"
              alt="Forcecraver Logo"
              width={120}
              height={32}
              className="h-7 sm:h-8 w-auto object-contain group-hover:opacity-90 transition-opacity"
              priority
            />
            <div>
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Interview <span className="text-blue-600 font-semibold">Portal</span>
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Live Schedules</span>
            </Link>

            <a
              href={openJdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              <span>Open JD Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-600">
              Interviews
            </Link>
            <span>/</span>
            <Link
              href={`/companies/${encodeURIComponent(interview.companyName)}`}
              className="hover:text-blue-600 font-medium text-slate-700"
            >
              {interview.companyName}
            </Link>
            <span>/</span>
            <span className="font-mono text-blue-600 font-bold">Ref: {getDisplayRefCode(interview)}</span>
          </div>

          <div className="flex items-center gap-2">
            {isCooledDown && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-slate-100 text-slate-500 border-slate-200">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Cooled Down (Past 6 PM)</span>
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusInfo.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`} />
              <span>{statusInfo.label}</span>
            </span>
          </div>
        </div>

        {/* Hero Card: Candidate & Position */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono font-bold">
                <span>Ref: {getDisplayRefCode(interview)}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {interview.candidate.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-600">
                <span className="flex items-center gap-1.5 font-bold text-slate-900">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {interview.companyName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {interview.jobTitle}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
              <a
                href={jdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs sm:text-sm font-bold transition-all shadow-2xs group/jd cursor-pointer"
                title="View full Job Description on Open JD Portal"
              >
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Open JD in Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover/jd:translate-x-0.5 group-hover/jd:-translate-y-0.5 transition-transform" />
              </a>

              <CopyMeetLinkButton
                meetingLink={interview.meetingLink}
                variant="primary"
                size="lg"
                label="Copy Meet Link"
                copiedLabel="Meet Link Copied!"
              />
            </div>
          </div>

          {/* Schedule Coordinates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Interview Date</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {formatInterviewDate(interview.interviewDate)}
              </div>
            </div>

            {/* Time */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Time Slot ({interview.timezone})</span>
              </div>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {interview.startTime} - {interview.endTime}
              </div>
            </div>

            {/* Status & Mode */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Video className="w-3.5 h-3.5 text-emerald-600" />
                <span>Status & Platform</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                {statusInfo.label}
              </div>
              <div className="text-[11px] text-slate-500">
                Platform: {interview.mode === 'NOT_KNOWN' ? 'Not Known' : interview.mode.replace('_', ' ')}
              </div>
            </div>
          </div>

          {/* Add to Calendar Button */}
          {calendarUrl !== '#' && (
            <div className="pt-2">
              <a
                href={calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add to Google Calendar</span>
              </a>
            </div>
          )}
        </div>

        {/* Candidate Profile Details & Client SPOC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-4 h-4 text-blue-600" />
              <span>Candidate Profile</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Full Name</span>
                <span className="font-bold text-slate-900">{interview.candidate.name}</span>
              </div>

              {interview.candidate.location && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Location</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {interview.candidate.location}
                  </span>
                </div>
              )}

              {interview.candidate.experience && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Experience</span>
                  <span className="font-semibold text-slate-800">{interview.candidate.experience}</span>
                </div>
              )}

              {interview.candidate.currentRole && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Current Role</span>
                  <span className="font-semibold text-slate-800">{interview.candidate.currentRole}</span>
                </div>
              )}

              {interview.candidate.phone && (
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500">Phone</span>
                  <span className="font-mono text-slate-700">{interview.candidate.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Client & Recruiter Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Client & Recruiter SPOC</span>
            </h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Client Organization</span>
                <span className="font-bold text-blue-600">{interview.companyName}</span>
              </div>

              {(interview.recruiterCompany || interview.job?.contactPerson) && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Company SPOC (Handled By)</span>
                  <span className="font-semibold text-slate-900">
                    {interview.recruiterCompany || interview.job?.contactPerson}
                  </span>
                </div>
              )}

              {interview.recruiterCandidate && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Candidate Recruiter</span>
                  <span className="font-semibold text-slate-900">{interview.recruiterCandidate}</span>
                </div>
              )}

              {interview.interviewerName && (
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Interviewer Panelist</span>
                  <span className="font-semibold text-slate-900">
                    {interview.interviewerName} {interview.interviewerRole && `(${interview.interviewerRole})`}
                  </span>
                </div>
              )}

              {interview.job && (
                <div className="pt-2">
                  <a
                    href={`${openJdUrl}/jobs/${interview.job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    <span>View Full Job Description on Open JD Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Round Questions Section (L1 to L5) */}
        <RoundQuestionsSection interview={interview} />

        {/* Recruiter / Admin Notes */}
        {interview.adminNotes && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>Recruiter & Evaluation Notes</span>
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100 whitespace-pre-wrap">
              {interview.adminNotes}
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            <span className="font-semibold text-slate-700">Forcecraver Interview Schedule Portal</span>
            <span> • Verified Slot #{interview.referenceCode}</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={openJdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 flex items-center gap-1 font-medium"
            >
              <span>Open JD Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()} Forcecraver.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
