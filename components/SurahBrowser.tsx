'use client';

import { useState, useEffect } from 'react';
import { Surah } from '../lib/types';
import { Language, t, isRtl } from '../lib/i18n';

interface Props {
  onSelect: (surah: Surah) => void;
  onBack: () => void;
  lang: Language;
}

export default function SurahBrowser({ onSelect, onBack, lang }: Props) {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.alquran.cloud/v1/surah')
      .then(r => r.json())
      .then(data => {
        setSurahs(data.data.map((s: any) => ({
          number: s.number,
          name: s.name,
          englishName: s.englishName,
          englishNameTranslation: s.englishNameTranslation,
          numberOfAyahs: s.numberOfAyahs,
          revelationType: s.revelationType,
        })));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = surahs.filter(s =>
    s.englishName.toLowerCase().includes(search.toLowerCase()) ||
    s.name.includes(search) ||
    s.englishNameTranslation.toLowerCase().includes(search.toLowerCase()) ||
    String(s.number) === search
  );

  const dir = isRtl(lang) ? 'rtl' : 'ltr';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in" dir={dir}>
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('browse.title', lang)}</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>{t('browse.subtitle', lang)}</p>
        </div>
      </div>

      <div className="relative mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input
          type="text"
          placeholder={t('browse.search', lang)}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base outline-none transition-all focus:ring-2"
          dir="ltr"
          style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl animate-pulse" style={{ background: 'var(--bg-card)' }} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((s, i) => (
            <button
              key={s.number}
              onClick={() => onSelect(s)}
              className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:translate-y-[-2px] hover:shadow-lg animate-fade-in-up"
              style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animationDelay: Math.min(i * 0.02, 0.5) + 's' }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                {s.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{s.englishName}</span>
                  <span className="text-lg flex-shrink-0" style={{ fontFamily: 'Amiri, serif', color: 'var(--text-primary)' }}>{s.name}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>{s.englishNameTranslation}</span>
                  <span>-</span>
                  <span>{s.numberOfAyahs} {t('browse.verses', lang)}</span>
                  <span>-</span>
                  <span>{s.revelationType}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-20">
          <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>{t('browse.noResults', lang)} &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
