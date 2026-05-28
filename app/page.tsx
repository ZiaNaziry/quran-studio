'use client';

import { useState, useEffect, useCallback } from 'react';
import SurahBrowser from '../components/SurahBrowser';
import VerseSelector from '../components/VerseSelector';
import RecitationStudio from '../components/RecitationStudio';
import FeedbackPage from '../components/FeedbackPage';
import { Surah, Verse, View, Theme } from '../lib/types';

const themeOptions: { id: Theme; label: string }[] = [
  { id: 'dark', label: 'Dark' },
  { id: 'light', label: 'Light' },
  { id: 'emerald', label: 'Emerald' },
];

export default function Home() {
  const [view, setView] = useState<View>('home');
  const [theme, setTheme] = useState<Theme>('dark');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [allVerses, setAllVerses] = useState<Verse[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('qsd-theme') as Theme | null;
    if (saved && ['dark', 'light', 'emerald'].includes(saved)) setTheme(saved);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('qsd-theme', theme);
  }, [theme]);

  const handleSurahSelect = useCallback(async (surah: Surah) => {
    setSelectedSurah(surah);
    setLoading(true);
    try {
      const res = await fetch('https://api.alquran.cloud/v1/surah/' + surah.number + '/editions/quran-uthmani,en.asad');
      const data = await res.json();
      const arabic = data.data[0].ayahs;
      const english = data.data[1].ayahs;
      const verses: Verse[] = arabic.map((a: any, i: number) => ({
        number: a.number,
        numberInSurah: a.numberInSurah,
        text: a.text,
        translation: english[i]?.text || '',
        surahNumber: surah.number,
      }));
      setAllVerses(verses);
      setView('verses');
    } catch {
      alert('Failed to load surah. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleVersesSelected = useCallback((verses: Verse[]) => {
    setSelectedVerses(verses);
    setView('studio');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'var(--glass)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => { setView('home'); setSelectedSurah(null); }} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <span className="text-lg font-bold hidden sm:block" style={{ color: 'var(--text-primary)' }}>Quran SM Download</span>
          </button>
          <div className="flex items-center gap-2">
            {view !== 'home' && view !== 'feedback' && (
              <button onClick={() => setView('feedback')} className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:scale-105" style={{ color: 'var(--text-secondary)' }}>
                Feedback
              </button>
            )}
            <div className="relative">
              <button onClick={() => setThemeOpen(!themeOpen)} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
              </button>
              {themeOpen && (
                <div className="absolute right-0 mt-2 py-2 w-36 rounded-xl shadow-2xl border animate-scale-in" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                  {themeOptions.map(t => (
                    <button key={t.id} onClick={() => { setTheme(t.id); setThemeOpen(false); }} className="w-full px-4 py-2 text-left text-sm font-medium transition-colors flex items-center gap-2" style={{ color: theme === t.id ? 'var(--accent)' : 'var(--text-primary)', background: theme === t.id ? 'var(--accent-light)' : 'transparent' }}>
                      <span className="w-3 h-3 rounded-full" style={{ background: t.id === 'dark' ? '#6366f1' : t.id === 'light' ? '#4f46e5' : '#10b981' }} />
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            <p className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>Loading Surah...</p>
          </div>
        </div>
      )}

      {/* Views */}
      {view === 'home' && (
        <div className="animate-fade-in">
          {/* Hero */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at 50% 0%, var(--accent), transparent 70%)' }} />
            <div className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-slide-down" style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                Beautiful Quran Videos for Social Media
              </div>
              <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 leading-tight animate-fade-in-up" style={{ color: 'var(--text-primary)' }}>
                Quran SM<br /><span style={{ color: 'var(--accent)' }}>Download</span>
              </h1>
              <p className="text-xl sm:text-2xl mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ color: 'var(--text-secondary)', animationDelay: '0.15s', opacity: 0 }}>
                Create stunning Quran recitation videos with beautiful backgrounds. Download and share on any social media platform.
              </p>
              <button onClick={() => setView('browse')} className="px-10 py-4 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 animate-fade-in-up animate-pulse-glow" style={{ background: 'var(--accent)', animationDelay: '0.3s', opacity: 0 }}>
                Start Creating
              </button>
            </div>
          </div>
          {/* Features */}
          <div className="max-w-5xl mx-auto px-4 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: '10 Reciters', desc: 'World-renowned Quran reciters including Alafasy, Sudais, and more', icon: 'M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8' },
                { title: 'Stunning Backgrounds', desc: '10 beautiful gradient backgrounds crafted for social media', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
                { title: 'Social Media Ready', desc: 'Download as video or image in portrait or landscape format', icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' },
                { title: 'All 114 Surahs', desc: 'Access the complete Holy Quran with translations', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
              ].map((f, i) => (
                <div key={i} className="p-6 rounded-2xl border transition-all hover:translate-y-[-4px] hover:shadow-xl animate-fade-in-up" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', animationDelay: (0.1 + i * 0.1) + 's', opacity: 0 }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: 'var(--accent-light)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent)' }}><path d={f.icon}/></svg>
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{f.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Footer */}
          <footer className="border-t py-8 text-center" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Built by Ahmad Zia Naziry</p>
          </footer>
        </div>
      )}

      {view === 'browse' && <SurahBrowser onSelect={handleSurahSelect} onBack={() => setView('home')} />}
      {view === 'verses' && selectedSurah && <VerseSelector surah={selectedSurah} verses={allVerses} onSelect={handleVersesSelected} onBack={() => setView('browse')} />}
      {view === 'studio' && selectedSurah && <RecitationStudio surah={selectedSurah} verses={selectedVerses} onBack={() => setView('verses')} />}
      {view === 'feedback' && <FeedbackPage onBack={() => setView('home')} />}
    </div>
  );
}
