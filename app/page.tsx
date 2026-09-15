'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import StatsOverview from '@/components/StatsOverview';
import SearchBar from '@/components/SearchBar';
import ScheduleCard, { InterviewItem } from '@/components/ScheduleCard';
import InterviewDetailModal from '@/components/InterviewDetailModal';
import CalendarView from '@/components/CalendarView';
import {
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Loader2,
  CalendarClock,
  ExternalLink,
  X,
} from 'lucide-react';

export default function PublicInterviewPortal() {
  const [interviews, setInterviews] = useState<InterviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all'); // 'all' | 'today' | 'tomorrow' | 'this_week'
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');

  // Stats
  const [stats, setStats] = useState({
    todayCount: 0,
    thisWeekCount: 0,
    activeCompaniesCount: 0,
    completedCount: 0,
  });

  // Unique companies list for filter
  const [companiesList, setCompaniesList] = useState<string[]>([]);

  // Selected interview for modal
  const [selectedInterview, setSelectedInterview] = useState<InterviewItem | null>(null);

  const fetchInterviews = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedCompany !== 'All') params.set('company', selectedCompany);
      if (selectedStatus !== 'All') params.set('status', selectedStatus);
      if (selectedDateFilter !== 'all') params.set('date', selectedDateFilter);
      params.set('limit', '100');

      const res = await fetch(`/api/interviews?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setInterviews(data.interviews);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch interviews:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch companies for dropdown filter once
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await fetch('/api/jobs');
        const data = await res.json();
        if (data.success && data.companies) {
          const names = data.companies.map((c: any) => c.companyName);
          setCompaniesList(names);
        }
      } catch (err) {
        console.error('Failed to fetch companies:', err);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch interviews whenever filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInterviews();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCompany, selectedStatus, selectedDateFilter]);

  const statuses = [
    { label: 'All Statuses', value: 'All' },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'L1', value: 'L1' },
    { label: 'L2', value: 'L2' },
    { label: 'L3', value: 'L3' },
    { label: 'L4', value: 'L4' },
    { label: 'L5', value: 'L5' },
    { label: 'Selected', value: 'SELECTED' },
    { label: 'Rescheduled', value: 'RESCHEDULED' },
    { label: 'Not Selected', value: 'REJECTED' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  const dateFilterTabs = [
    { id: 'all', label: 'All Dates' },
    { id: 'today', label: "Today's Slots" },
    { id: 'tomorrow', label: 'Tomorrow' },
    { id: 'this_week', label: 'This Week' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* 1. Hero Section with Integrated Search Bar (Identical to Open JD System) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-12 pb-16 border-b border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Deterministic Candidate & Interview Slot Discovery
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Client <span className="text-blue-600">Interview</span> Schedules & Timelines
          </h1>

          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Matching top vetted candidates with active client job openings. Track interview slots, meeting coordinates, and evaluation rounds in real time.
          </p>

          {/* Integrated Search Bar on page */}
          <div className="mt-8">
            <SearchBar
              initialQuery={searchQuery}
              onSearch={(query) => setSearchQuery(query)}
            />
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Live Counters Overview */}
        <StatsOverview
          todayCount={stats.todayCount}
          thisWeekCount={stats.thisWeekCount}
          activeCompaniesCount={stats.activeCompaniesCount}
          completedCount={stats.completedCount}
        />

        {/* Active Search Banner */}
        {searchQuery && (
          <div className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs sm:text-sm text-blue-900 animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="font-bold">Search results for:</span>
              <span className="font-semibold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono">
                &ldquo;{searchQuery}&rdquo;
              </span>
              <span className="text-slate-500">({interviews.length} found)</span>
            </div>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Search</span>
            </button>
          </div>
        )}

        {/* Filter and View Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Company Dropdown */}
            <div className="w-full md:w-64">
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="All">🏢 All Client Companies</option>
                {companiesList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="w-full md:w-44">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-semibold text-slate-700 bg-white"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchInterviews(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs self-end md:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Date Filter Tabs & View Mode Switch */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {dateFilterTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedDateFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedDateFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200/60 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('list')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'list'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Timeline Cards
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'calendar'
                    ? 'bg-white text-blue-600 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Calendar View
              </button>
            </div>
          </div>
        </div>

        {/* Content Display */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading interview schedules...</p>
          </div>
        ) : activeTab === 'calendar' ? (
          <CalendarView
            interviews={interviews}
            onSelectInterview={(item) => setSelectedInterview(item)}
          />
        ) : interviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 p-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <CalendarClock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No interview schedules found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No interview slots matched your search criteria. Try adjusting your query or filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCompany('All');
                setSelectedStatus('All');
                setSelectedDateFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {interviews.map((interview) => (
              <ScheduleCard
                key={interview.id}
                interview={interview}
                onSelect={(item) => setSelectedInterview(item)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Forcecraver Interview Schedule Portal</span>
            <span>•</span>
            <span className="text-slate-500 font-medium">Client Candidate Pipelines</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={process.env.NEXT_PUBLIC_OPEN_JD_URL || 'https://jdportalforcecraver.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 flex items-center gap-1 font-medium"
            >
              <span>Open JD Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span>•</span>
            <span>© {new Date().getFullYear()} Forcecraver. All rights reserved.</span>
          </div>
        </div>
      </footer>

      {/* Detail Modal */}
      <InterviewDetailModal
        interview={selectedInterview}
        onClose={() => setSelectedInterview(null)}
      />
    </div>
  );
}
