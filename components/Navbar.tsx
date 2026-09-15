'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  CalendarClock,
  CalendarDays,
  ShieldCheck,
  Building2,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  activeTab?: 'list' | 'calendar';
  onTabChange?: (tab: 'list' | 'calendar') => void;
}

export default function Navbar({
  activeTab = 'list',
  onTabChange,
}: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openJdUrl = process.env.NEXT_PUBLIC_OPEN_JD_URL || 'https://jdportal.forcecraver.com';

  const isAdminPage = pathname.startsWith('/admin');
  const isCompaniesPage = pathname.startsWith('/companies');
  const isHomePage = pathname === '/';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/logo.png"
                alt="Forcecraver Logo"
                width={130}
                height={36}
                className="h-8 sm:h-9 w-auto object-contain group-hover:opacity-90 transition-opacity"
                priority
              />
              <div className="hidden sm:block">
                <span className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  Interview <span className="text-blue-600 font-semibold">Portal</span>
                </span>
                <span className="block text-[10px] text-slate-500 font-medium tracking-wide uppercase">
                  Client Schedules & Timelines
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {!isAdminPage && (
              <>
                <Link
                  href="/"
                  onClick={() => onTabChange?.('list')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isHomePage && activeTab === 'list'
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarClock
                    className={`w-4 h-4 ${
                      isHomePage && activeTab === 'list' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  Live Schedules
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    if (!isHomePage) {
                      window.location.href = '/?view=calendar';
                    } else {
                      onTabChange?.('calendar');
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isHomePage && activeTab === 'calendar'
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <CalendarDays
                    className={`w-4 h-4 ${
                      isHomePage && activeTab === 'calendar' ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  Calendar View
                </button>

                <Link
                  href="/companies"
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isCompaniesPage
                      ? 'text-blue-600 bg-blue-50/80 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Building2
                    className={`w-4 h-4 ${
                      isCompaniesPage ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  Companies
                </Link>
              </>
            )}

            {isAdminPage && (
              <Link
                href="/"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
              >
                <CalendarClock className="w-4 h-4 text-slate-400" />
                Public Schedule
              </Link>
            )}
          </nav>

          {/* Desktop Right CTA: Link to Open JD Portal & Admin */}
          <div className="hidden md:flex items-center gap-2.5">
            <a
              href={openJdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Open JD Portal"
            >
              <span>Open JD Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>

            {!isAdminPage ? (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </Link>
            ) : (
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-slate-100 rounded-xl border border-slate-200 transition-all"
              >
                <span>Exit Admin</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          {!isAdminPage && (
            <>
              <Link
                href="/"
                onClick={() => {
                  onTabChange?.('list');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-base font-medium ${
                  isHomePage && activeTab === 'list' ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700'
                }`}
              >
                <CalendarClock className="w-5 h-5 text-slate-500" />
                Live Schedules
              </Link>

              <button
                type="button"
                onClick={() => {
                  if (!isHomePage) {
                    window.location.href = '/?view=calendar';
                  } else {
                    onTabChange?.('calendar');
                  }
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-base font-medium ${
                  isHomePage && activeTab === 'calendar'
                    ? 'text-blue-600 bg-blue-50 font-semibold'
                    : 'text-slate-700'
                }`}
              >
                <CalendarDays className="w-5 h-5 text-slate-500" />
                Calendar View
              </button>

              <Link
                href="/companies"
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-base font-medium ${
                  isCompaniesPage ? 'text-blue-600 bg-blue-50 font-semibold' : 'text-slate-700'
                }`}
              >
                <Building2 className="w-5 h-5 text-slate-500" />
                <span>Companies</span>
              </Link>
            </>
          )}

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <a
              href={openJdUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:text-blue-600"
            >
              <span>Go to Open JD Portal</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <Link
              href={isAdminPage ? '/' : '/admin'}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              {isAdminPage ? 'View Public Schedules' : 'Admin Portal'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
