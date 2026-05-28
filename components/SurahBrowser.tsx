'use client';

import React, { useState, useEffect } from 'react';
import { Surah } from '../lib/types';

interface SurahBrowserProps {
  onSelectSurah: (surah: Surah) => void;
}

export default function SurahBrowser({ onSelectSurah }: SurahBrowserProps) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setSurahs(data.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = surahs.filter(s => {
    const q = search.toLowerCase();
    return (
      s.englishName.toLowerCase().includes(q) ||
      s.name.includes(search) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      String(s.number).includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="text-center pt-16 pb-10 px-4 animate-fade-in">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Quran Studio</h1>
        </div>
        <p className="text-zinc-400 text-lg max-w-md mx-auto">
          Select a Surah to begin your recitation journey
        </p>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto px-4 mb-8 animate-fade-in-up">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#1a1a1a] border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Surah Grid */}
      {!loading && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((surah, i) => (
              <button
                key={surah.number}
                onClick={() => onSelectSurah(surah)}
                className="group flex items-center gap-4 p-4 bg-[#1a1a1a] hover:bg-[#222] border border-zinc-800/50 hover:border-emerald-500/30 rounded-xl transition-all duration-300"
                style={{ animationDelay: (i % 12) * 30 + 'ms' }}
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-semibold text-sm flex-shrink-0 transition-colors">
                  {surah.number}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-white font-medium truncate">{surah.englishName}</span>
                    <span className="text-zinc-400 font-arabic text-lg flex-shrink-0">{surah.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-zinc-500 text-xs">{surah.numberOfAyahs} verses</span>
                    <span className="text-zinc-700 text-xs">|</span>
                    <span className="text-zinc-500 text-xs">{surah.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'}</span>
                  </div>
                </div>
                <svg className="w-4 h-4 text-zinc-600 group-hover:text-emerald-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-20 text-zinc-500">
              No surahs found matching your search.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
