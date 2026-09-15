'use client';

import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Clock, Building2, Video, ArrowRight } from 'lucide-react';
import { InterviewItem } from './ScheduleCard';
import { getStatusBadgeInfo } from '@/lib/formatters';

interface CalendarViewProps {
  interviews: InterviewItem[];
  onSelectInterview: (interview: InterviewItem) => void;
}

export default function CalendarView({ interviews, onSelectInterview }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getInterviewsForDate = (day: Date) => {
    return interviews.filter((item) => {
      const d = parseISO(item.interviewDate);
      return isSameDay(d, day);
    });
  };

  const selectedDayInterviews = getInterviewsForDate(selectedDate);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-12">
      {/* Calendar Header Navigation */}
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-slate-900">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCurrentMonth(new Date());
              setSelectedDate(new Date());
            }}
            className="px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            aria-label="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Weekday Titles */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50 text-center text-xs font-semibold text-slate-500 py-2.5">
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
        <span>Sun</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {days.map((day) => {
          const dayInterviews = getInterviewsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isTodayDate = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[90px] sm:min-h-[105px] p-2 sm:p-2.5 cursor-pointer transition-all flex flex-col justify-between ${
                !isCurrentMonth ? 'bg-slate-50/40 text-slate-300' : 'bg-white'
              } ${
                isSelected
                  ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    isTodayDate
                      ? 'bg-blue-600 text-white shadow-sm'
                      : isSelected
                      ? 'bg-slate-900 text-white'
                      : isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-300'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {dayInterviews.length > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {dayInterviews.length}
                  </span>
                )}
              </div>

              {/* Mini tags of interviews */}
              <div className="space-y-1 mt-1">
                {dayInterviews.slice(0, 2).map((item) => (
                  <div
                    key={item.id}
                    className="text-[10px] truncate px-1.5 py-0.5 rounded bg-blue-50/90 text-blue-800 font-medium border border-blue-100"
                    title={`${item.companyName}: ${item.candidate.name}`}
                  >
                    {item.startTime} {item.companyName}
                  </div>
                ))}
                {dayInterviews.length > 2 && (
                  <span className="text-[10px] text-slate-400 font-medium pl-1">
                    +{dayInterviews.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Day Agenda View */}
      <div className="p-6 bg-slate-50/80 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>Interviews for {format(selectedDate, 'EEEE, MMMM d, yyyy')}</span>
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {selectedDayInterviews.length} slot{selectedDayInterviews.length === 1 ? '' : 's'} scheduled
          </span>
        </div>

        {selectedDayInterviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            No interviews scheduled for this date.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {selectedDayInterviews.map((item) => {
              const status = getStatusBadgeInfo(item.status);
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectInterview(item)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        {item.companyName}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${status.bg}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      {item.jobTitle}
                    </h4>
                    <p className="text-xs text-slate-600">
                      Candidate: <span className="font-semibold">{item.candidate.name}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-medium text-slate-700">
                      {item.startTime} - {item.endTime}
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
