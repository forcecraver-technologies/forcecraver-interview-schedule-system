'use client';

import React from 'react';
import { Calendar, Clock, Building2, CheckCircle2, TrendingUp, Users } from 'lucide-react';

interface StatsOverviewProps {
  todayCount: number;
  thisWeekCount: number;
  activeCompaniesCount: number;
  completedCount: number;
}

export default function StatsOverview({
  todayCount,
  thisWeekCount,
  activeCompaniesCount,
  completedCount,
}: StatsOverviewProps) {
  const cards = [
    {
      title: "Today's Interviews",
      value: todayCount,
      subtitle: 'Scheduled client rounds',
      icon: Clock,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      borderColor: 'border-blue-100',
    },
    {
      title: 'This Week',
      value: thisWeekCount,
      subtitle: 'Upcoming slots pipeline',
      icon: Calendar,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      borderColor: 'border-indigo-100',
    },
    {
      title: 'Client Companies',
      value: activeCompaniesCount,
      subtitle: 'Active interviewing clients',
      icon: Building2,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      borderColor: 'border-purple-100',
    },
    {
      title: 'Completed & Selected',
      value: completedCount,
      subtitle: 'Rounds finalized',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className={`p-4 sm:p-5 rounded-2xl bg-white border ${card.borderColor} shadow-sm hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs sm:text-sm font-medium text-slate-500">{card.title}</span>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {card.value}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1">{card.subtitle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
