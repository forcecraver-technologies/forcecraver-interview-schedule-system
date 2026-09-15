'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import CompanyCard, { ScheduledCompany } from '@/components/CompanyCard';
import { Building2, Search, ArrowLeft, CalendarClock, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<ScheduledCompany[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanies() {
      try {
        setLoading(true);
        const res = await fetch('/api/companies');
        if (res.ok) {
          const data = await res.json();
          setCompanies(data.companies || []);
        }
      } catch (err) {
        console.error('Error loading companies:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              Client Employer Directory
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Companies with Scheduled Interviews
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Browse verified hiring organizations currently with active scheduled candidate interviews.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs self-start"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Live Schedules
          </Link>
        </div>

        {/* Search Companies Bar */}
        <div className="relative max-w-md">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Companies..."
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
          />
        </div>

        {/* Companies Listing Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl border border-slate-200 p-6 h-56 animate-pulse"
              />
            ))}
          </div>
        ) : filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.companyName} company={company} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto shadow-sm">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900">No Companies Found</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              {searchQuery
                ? `No companies match "${searchQuery}".`
                : 'There are currently no companies with scheduled interviews.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Search
              </button>
            ) : (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors"
              >
                Schedule New Interview
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
