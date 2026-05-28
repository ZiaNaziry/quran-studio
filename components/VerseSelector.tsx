'use client';

import React, { useState, useEffect } from 'react';
import { Surah, Verse } from '../lib/types';

interface VerseSelectorProps {
  surah: Surah;
  onBack: () => void;
  onOpenStudio: (verses: Verse[]) => void;
}

export default function VerseSelector({ surah, onBack, onOpenStudio }: VerseSelectorProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const url = 'https://api.alquran.cloud/v1/surah/' + surah.number + '/editions/quran-uthmani,en.sahih';
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.data && data.data.length === 2) {
          const arabicAyahs = data.data[0].ayahs;
          const englishAyahs = data.data[1].ayahs;
          const combined: Verse[] = arabicAyahs.map((a: any, i: number) => ({
            numberInSurah: a.numberInSurah,
            text: a.text,
            translation: englishAyahs[i] ? englishAyahs[i].text : '',
          }));
          setVerses(combined);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [surah.number]);

  const toggleVerse = (num: number) => {
    const next = new Set(selected);
    if (next.has(num)) {
      next.delete(num);
    } else {
      next.add(num);
    }
    setSelected(next);
  };

  const selectAll = () => {
    if (selected.size === verses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(verses.map(v => v.numberInSurah)));
    }
  };

  const handleOpenStudio = () => {
    const selectedVerses = verses
      .filter(v => selected.has(v.numberInSurah))
      .sort((a, b) => a.numberInSurah - b.numberInSurah);
    onOpenStudio(selectedVerses);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-zinc-800/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={selectAll}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
            >
              {selected.size === verses.length ? 'Deselect All' : 'Select All'}
            </button>
            <button
              onClick={handleOpenStudio}
              disabled={selected.size === 0}
              className="px-5 py-2 text-sm font-medium bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-all disabled:cursor-not-allowed"
            >
              Open Studio{selected.size > 0 ? ' (' + selected.size + ')' : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Surah Info */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4 animate-fade-in">
        <h2 className="text-2xl font-bold text-white">{surah.englishName}</h2>
        <p className="text-zinc-500 mt-1">
          {surah.numberOfAyahs} verses · {surah.revelationType === 'Meccan' ? 'Meccan' : 'Medinan'}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Verse List */}
      {!loading && (
        <div className="max-w-3xl mx-auto px-4 pb-24">
          <div className="space-y-2">
            {verses.map(verse => {
              const isSelected = selected.has(verse.numberInSurah);
              return (
                <button
                  key={verse.numberInSurah}
                  onClick={() => toggleVerse(verse.numberInSurah)}
                  className={'w-full text-right p-5 rounded-xl border transition-all duration-200 ' +
                    (isSelected
                      ? 'bg-emerald-500/10 border-emerald-500/40'
                      : 'bg-[#1a1a1a] border-zinc-800/50 hover:border-zinc-700')}
                >
                  <div className="flex items-start gap-4">
                    <div className={'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 transition-colors ' +
                      (isSelected
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-800 text-zinc-400')}>
                      {verse.numberInSurah}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-arabic text-2xl leading-loose text-white mb-3" dir="rtl">
                        {verse.text}
                      </p>
                      <p className="text-sm text-zinc-400 text-left leading-relaxed">
                        {verse.numberInSurah}. {verse.translation}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Studio Button (mobile) */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center md:hidden animate-fade-in-up z-20">
          <button
            onClick={handleOpenStudio}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-full shadow-lg shadow-emerald-500/25 transition-all"
          >
            Open Studio ({selected.size} verses)
          </button>
        </div>
      )}
    </div>
  );
}
