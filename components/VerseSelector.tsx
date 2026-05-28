'use client';

import { useState } from 'react';
import { Surah, Verse } from '../lib/types';
import { Language, t, isRtl } from '../lib/i18n';

interface Props {
  surah: Surah;
  verses: Verse[];
  onSelect: (verses: Verse[]) => void;
  onBack: () => void;
  lang: Language;
}

export default function VerseSelector({ surah, verses, onSelect, onBack, lang }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleVerse = (n: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n); else next.add(n);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === verses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(verses.map(v => v.numberInSurah)));
    }
  };

  const handleContinue = () => {
    const chosen = verses.filter(v => selected.has(v.numberInSurah)).sort((a, b) => a.numberInSurah - b.numberInSurah);
    onSelect(chosen);
  };

  const dir = isRtl(lang) ? 'rtl' : 'ltr';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in" dir={dir}>
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{surah.englishName}</h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{surah.englishNameTranslation} - {surah.numberOfAyahs} {t('browse.verses', lang)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 mt-4 p-4 rounded-xl border" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
        <button onClick={selectAll} className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
          {selected.size === verses.length ? t('verses.deselectAll', lang) : t('verses.selectAll', lang)}
        </button>
        <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{selected.size} {t('verses.of', lang)} {verses.length} {t('verses.selected', lang)}</span>
      </div>

      <div className="space-y-2 mb-24">
        {verses.map((v, i) => {
          const isSelected = selected.has(v.numberInSurah);
          return (
            <button
              key={v.numberInSurah}
              onClick={() => toggleVerse(v.numberInSurah)}
              className="w-full text-left p-4 rounded-xl border transition-all hover:translate-y-[-1px] animate-fade-in-up"
              style={{
                background: isSelected ? 'var(--accent-light)' : 'var(--bg-card)',
                borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                animationDelay: Math.min(i * 0.02, 0.5) + 's',
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold mt-1" style={{ background: isSelected ? 'var(--accent)' : 'var(--bg-card-hover, var(--bg-card))', color: isSelected ? 'white' : 'var(--text-secondary)' }}>
                  {v.numberInSurah}
                </div>
                <div className="flex-1">
                  <p className="text-right text-xl leading-loose mb-2" style={{ fontFamily: 'Amiri, serif', color: 'var(--text-primary)' }}>{v.text}</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.translation}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selected.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 border-t animate-slide-down" style={{ background: 'var(--glass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderColor: 'var(--border)' } as any}>
          <div className="max-w-4xl mx-auto">
            <button onClick={handleContinue} className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-95" style={{ background: 'var(--accent)' }}>
              {t('verses.openStudio', lang)} {selected.size} {selected.size > 1 ? t('verses.verseP', lang) : t('verses.verse', lang)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
