import { format, parseISO, isToday, isTomorrow, isPast, isFuture, differenceInHours, differenceInMinutes } from 'date-fns';

export function formatInterviewDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'EEE, dd MMM yyyy');
}

export function formatTimeSlot(start: string, end: string): string {
  return `${start} - ${end}`;
}

export function generateReferenceCode(jobId?: string): string {
  if (jobId) {
    const clean = jobId.replace(/^[#]/, '').slice(0, 8);
    const suffix = Math.floor(100 + Math.random() * 900);
    return `JD-${clean}-${suffix}`;
  }
  const randomHex = Math.random().toString(16).substring(2, 10);
  return `#${randomHex}`;
}

export function getDisplayRefCode(interview: {
  referenceCode?: string;
  job?: { id: string } | null;
  jobId?: string | null;
  id?: string;
}): string {
  const targetId = interview.job?.id || interview.jobId || interview.id || '';
  if (targetId) {
    const cleanId = targetId.replace(/^[#]/, '');
    return `#${cleanId.slice(0, 8)}`;
  }
  if (interview.referenceCode) {
    if (interview.referenceCode.startsWith('JD-')) {
      const parts = interview.referenceCode.split('-');
      return `#${parts[1] || interview.referenceCode}`;
    }
    return interview.referenceCode;
  }
  return '';
}

export function getStatusBadgeInfo(status: string) {
  switch (status) {
    case 'SCHEDULED':
      return {
        label: 'Scheduled',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'L1':
      return {
        label: 'Round L1',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'L2':
      return {
        label: 'Round L2',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'L3':
      return {
        label: 'Round L3',
        bg: 'bg-violet-50 text-violet-700 border-violet-200',
        dot: 'bg-violet-500',
      };
    case 'L4':
      return {
        label: 'Round L4',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'L5':
      return {
        label: 'Round L5',
        bg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        dot: 'bg-cyan-500',
      };
    case 'SELECTED':
      return {
        label: 'Selected',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'RESCHEDULED':
      return {
        label: 'Rescheduled',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'REJECTED':
      return {
        label: 'Not Selected',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'CANCELLED':
      return {
        label: 'Cancelled',
        bg: 'bg-gray-100 text-gray-500 border-gray-200',
        dot: 'bg-gray-400',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-50 text-gray-700 border-gray-200',
        dot: 'bg-gray-400',
      };
  }
}

/**
 * Gets a clean UTC Date representing midnight of a calendar day in Asia/Kolkata (IST).
 * @param offsetDays Number of days from today (0 = today, 1 = tomorrow, -1 = yesterday)
 */
export function getISTCalendarDate(offsetDays: number = 0): Date {
  const now = new Date();
  const istDateStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now); // "YYYY-MM-DD" e.g. "2026-09-18"

  const [y, m, d] = istDateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + offsetDays, 0, 0, 0, 0));
}

/**
 * Returns the Monday and Sunday dates (at UTC midnight) for the current week in IST.
 */
export function getISTWeekRange(): { startOfWeekDate: Date; endOfWeekDate: Date } {
  const now = new Date();
  const dayOfWeekStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
  }).format(now);

  const daysMap: Record<string, number> = {
    Mon: 0,
    Tue: 1,
    Wed: 2,
    Thu: 3,
    Fri: 4,
    Sat: 5,
    Sun: 6,
  };
  const diffFromMon = daysMap[dayOfWeekStr] ?? 0;
  const startOfWeekDate = getISTCalendarDate(-diffFromMon);
  const endOfWeekDate = getISTCalendarDate(-diffFromMon + 6);
  return { startOfWeekDate, endOfWeekDate };
}

/**
 * Parses any incoming date string (e.g. "2026-09-18" or "2026-09-18T10:00:00Z")
 * to a clean UTC Date object representing that calendar date.
 */
export function parseDateToUTCMidnight(dateInput: string | Date): Date {
  if (dateInput instanceof Date) {
    return new Date(Date.UTC(dateInput.getUTCFullYear(), dateInput.getUTCMonth(), dateInput.getUTCDate(), 0, 0, 0, 0));
  }
  const clean = dateInput.split('T')[0];
  const parts = clean.split('-').map(Number);
  if (parts.length === 3) {
    return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
  }
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

export function isInterviewCooledDown(dateStr: string | Date): boolean {
  try {
    const cleanDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
    let y = 0, m = 0, d = 0;
    if (cleanDate && cleanDate.includes('-')) {
      const parts = cleanDate.split('-').map(Number);
      y = parts[0];
      m = parts[1] - 1;
      d = parts[2];
    } else {
      const dt = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      y = dt.getUTCFullYear();
      m = dt.getUTCMonth();
      d = dt.getUTCDate();
    }

    // Cooldown is 18:00 (6 PM) IST on that interview date (18:00 IST = 12:30 UTC)
    const cooldownUTC = new Date(Date.UTC(y, m, d, 12, 30, 0, 0));
    return Date.now() >= cooldownUTC.getTime();
  } catch {
    return false;
  }
}

export function getRelativeTimeText(dateStr: string | Date, startTime: string): string {
  try {
    const cleanDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
    let year = 0, month = 0, day = 0;
    if (cleanDate && cleanDate.includes('-')) {
      const parts = cleanDate.split('-').map(Number);
      year = parts[0];
      month = parts[1] - 1;
      day = parts[2];
    } else {
      const dt = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
      year = dt.getUTCFullYear();
      month = dt.getUTCMonth();
      day = dt.getUTCDate();
    }

    const todayIST = getISTCalendarDate(0);
    const interviewDateUTC = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
    const diffDays = Math.round((interviewDateUTC.getTime() - todayIST.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      if (isInterviewCooledDown(dateStr)) {
        return 'Concluded (6 PM Cooldown)';
      }
      return `Today at ${startTime}`;
    }

    if (diffDays === 1) {
      return `Tomorrow at ${startTime}`;
    }

    if (diffDays < 0) {
      return 'Slot Concluded';
    }

    const d = new Date(Date.UTC(year, month, day));
    return format(d, 'MMM d') + `, ${startTime}`;
  } catch {
    return startTime;
  }
}

export function isRealCandidateEmail(email?: string | null): boolean {
  if (!email || !email.trim()) return false;
  const trimmed = email.trim().toLowerCase();
  if (trimmed.endsWith('@candidate.forcecraver.com')) return false;
  return true;
}

export function getScreeningBadgeInfo(status?: string | null) {
  switch (status) {
    case 'NEW':
      return {
        label: 'New Applied',
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        dot: 'bg-sky-500',
      };
    case 'UNDER_SCREENING':
      return {
        label: 'Under Screening',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'SCREENING_PASSED':
      return {
        label: 'Screening Passed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'SHORTLISTED':
      return {
        label: 'Shortlisted',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
      };
    case 'SCREENING_REJECTED':
      return {
        label: 'Screening Rejected',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'ON_HOLD':
      return {
        label: 'On Hold',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    default:
      return {
        label: status || 'New',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getCandidateInterviewBadgeInfo(status?: string | null) {
  switch (status) {
    case 'NOT_SCHEDULED':
      return {
        label: 'Not Scheduled',
        bg: 'bg-slate-50 text-slate-600 border-slate-200',
        dot: 'bg-slate-400',
      };
    case 'SCHEDULED':
      return {
        label: 'Interview Scheduled',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'L1_SCHEDULED':
    case 'L1':
      return {
        label: 'L1 Scheduled',
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
      };
    case 'L1_CLEARED':
      return {
        label: 'L1 Cleared',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'L2_SCHEDULED':
    case 'L2':
      return {
        label: 'L2 Scheduled',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
      };
    case 'L2_CLEARED':
      return {
        label: 'L2 Cleared',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
      };
    case 'L3_SCHEDULED':
    case 'L3':
      return {
        label: 'L3 Scheduled',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'L3_CLEARED':
      return {
        label: 'L3 Cleared',
        bg: 'bg-violet-50 text-violet-700 border-violet-200',
        dot: 'bg-violet-500',
      };
    case 'CLIENT_ROUND':
      return {
        label: 'Client Round',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'COMPLETED':
      return {
        label: 'All Rounds Completed',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    case 'INTERVIEW_REJECTED':
      return {
        label: 'Interview Rejected',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    default:
      return {
        label: status || 'Not Scheduled',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

export function getFinalDecisionBadgeInfo(decision?: string | null) {
  switch (decision) {
    case 'PENDING':
      return {
        label: 'Decision Pending',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
      };
    case 'FINAL_SELECT':
      return {
        label: 'Selected (Final Hired)',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold',
        dot: 'bg-emerald-500',
      };
    case 'FINAL_REJECT':
      return {
        label: 'Final Rejected',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
      };
    case 'OFFER_RELEASED':
      return {
        label: 'Offer Released',
        bg: 'bg-cyan-50 text-cyan-700 border-cyan-200 font-semibold',
        dot: 'bg-cyan-500',
      };
    case 'OFFER_ACCEPTED':
      return {
        label: 'Offer Accepted 🎉',
        bg: 'bg-green-50 text-green-700 border-green-300 font-semibold',
        dot: 'bg-green-500',
      };
    case 'ON_HOLD':
      return {
        label: 'Decision On Hold',
        bg: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-500',
      };
    case 'BACKED_OUT':
      return {
        label: 'Candidate Backed Out',
        bg: 'bg-gray-100 text-gray-700 border-gray-300',
        dot: 'bg-gray-400',
      };
    default:
      return {
        label: decision || 'Decision Pending',
        bg: 'bg-slate-50 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
      };
  }
}

