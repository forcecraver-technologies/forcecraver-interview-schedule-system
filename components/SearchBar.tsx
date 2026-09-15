'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, Sparkles, Building2, User, Hash, Calendar, Briefcase } from 'lucide-react';

interface SearchBarProps {
  initialQuery?: string;
  onSearch: (query: string) => void;
  placeholder?: string;
}

const POPULAR_SEARCH_SUGGESTIONS = [
  { label: 'Rohit Verma', icon: User, tag: 'Candidate' },
  { label: 'Novigo', icon: Building2, tag: 'Company' },
  { label: 'AI Solutions Engineer', icon: Briefcase, tag: 'Role' },
  { label: 'FC-INT-2026-8531', icon: Hash, tag: 'Reference' },
  { label: 'Salesforce', icon: Search, tag: 'Keyword' },
];

export default function SearchBar({
  initialQuery = '',
  onSearch,
  placeholder = 'Search candidate by name, email, phone, reference code, company, or role...',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Main Search Input Form */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center bg-white rounded-2xl border-2 border-slate-200 shadow-xl shadow-blue-950/5 hover:border-blue-400 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition-all p-1.5 sm:p-2">
          <div className="pl-3 pr-2 text-slate-400">
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full text-sm sm:text-base md:text-lg text-slate-900 placeholder-slate-400 bg-transparent border-0 focus:outline-none focus:ring-0 py-2 px-2"
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 mr-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          )}

          <button
            type="submit"
            className="px-5 sm:px-7 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm sm:text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 whitespace-nowrap"
          >
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Quick Example Chips */}
      <div className="flex items-center justify-center flex-wrap gap-2 pt-1 text-xs">
        <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1 text-xs">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Quick Searches:
        </span>
        {POPULAR_SEARCH_SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          const isSelected = query.toLowerCase() === item.label.toLowerCase();

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => handleSuggestionClick(item.label)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all shadow-2xs ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs scale-105'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400 hover:bg-blue-50/60 hover:text-blue-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5 opacity-70" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
