import { format, parseISO, isToday, isTomorrow, isPast, isFuture, differenceInHours, differenceInMinutes } from 'date-fns';

export function formatInterviewDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
  return format(date, 'EEE, dd MMM yyyy');
}

export function formatTimeSlot(start: string, end: string): string {
  return `${start} - ${end}`;
}

export function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `FC-INT-${year}-${random}`;
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

export function isInterviewCooledDown(dateStr: string | Date): boolean {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const now = new Date();
    // 6:00 PM (18:00:00) on the interview date
    const cooldownDeadline = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 18, 0, 0);
    return now.getTime() >= cooldownDeadline.getTime();
  } catch {
    return false;
  }
}

export function getRelativeTimeText(dateStr: string | Date, startTime: string): string {
  try {
    const d = typeof dateStr === 'string' ? parseISO(dateStr) : dateStr;
    const year = d.getFullYear();
    const month = d.getMonth();
    const day = d.getDate();

    // Parse time e.g. "14:30" or "02:30 PM"
    let hours = 10;
    let minutes = 0;
    if (startTime.includes(':')) {
      const parts = startTime.split(':');
      hours = parseInt(parts[0], 10);
      const minPart = parts[1];
      minutes = parseInt(minPart, 10);
      if (startTime.toLowerCase().includes('pm') && hours < 12) hours += 12;
      if (startTime.toLowerCase().includes('am') && hours === 12) hours = 0;
    }

    const interviewDateTime = new Date(year, month, day, hours, minutes);
    const now = new Date();

    if (isToday(interviewDateTime)) {
      if (now.getHours() >= 18) {
        return 'Concluded (6 PM Cooldown)';
      }
      const diffMins = differenceInMinutes(interviewDateTime, now);
      if (diffMins > 0 && diffMins <= 60) {
        return `Starts in ${diffMins} mins`;
      }
      if (diffMins > 60 && diffMins < 60 * 12) {
        const diffHrs = Math.floor(diffMins / 60);
        return `Today in ~${diffHrs} hrs`;
      }
      if (diffMins <= 0 && diffMins > -60) {
        return `Happening now`;
      }
      return `Today at ${startTime}`;
    }

    if (isTomorrow(interviewDateTime)) {
      return `Tomorrow at ${startTime}`;
    }

    if (isPast(interviewDateTime)) {
      return 'Slot Concluded';
    }

    return format(interviewDateTime, 'MMM d, h:mm a');
  } catch {
    return startTime;
  }
}
