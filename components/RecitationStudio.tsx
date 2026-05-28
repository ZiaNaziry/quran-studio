'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Surah, Verse, Reciter } from '../lib/types';
import { reciters } from '../lib/reciters';

interface RecitationStudioProps {
  surah: Surah;
  verses: Verse[];
  onBack: () => void;
}

const backgrounds = [
  { id: 'ocean', name: 'Ocean Night', from: '#0c1445', to: '#0a0a0a' },
  { id: 'emerald', name: 'Emerald Dark', from: '#022c22', to: '#0a0a0a' },
  { id: 'purple', name: 'Twilight', from: '#2e1065', to: '#0a0a0a' },
  { id: 'warm', name: 'Warm Night', from: '#451a03', to: '#0a0a0a' },
  { id: 'midnight', name: 'Midnight', from: '#111827', to: '#000000' },
  { id: 'rose', name: 'Rose Dawn', from: '#4c0519', to: '#0a0a0a' },
];

function getAudioUrl(surahNum: number, verseNum: number, subfolder: string): string {
  const s = String(surahNum).padStart(3, '0');
  const v = String(verseNum).padStart(3, '0');
  return 'https://everyayah.com/data/' + subfolder + '/' + s + v + '.mp3';
}

export default function RecitationStudio({ surah, verses, onBack }: RecitationStudioProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciter, setReciter] = useState<Reciter>(reciters[0]);
  const [showTranslation, setShowTranslation] = useState(true);
  const [arabicSize, setArabicSize] = useState(36);
  const [bgIndex, setBgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentVerse = verses[currentIndex];
  const bg = backgrounds[bgIndex];

  const clearProgress = useCallback(() => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
  }, []);

  const startProgressTracking = useCallback(() => {
    clearProgress();
    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        setProgress(audioRef.current.currentTime);
        setDuration(audioRef.current.duration || 0);
      }
    }, 100);
  }, [clearProgress]);

  const playVerse = useCallback((index: number) => {
    if (index < 0 || index >= verses.length) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }
    clearProgress();

    const verse = verses[index];
    const url = getAudioUrl(surah.number, verse.numberInSurah, reciter.subfolder);
    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentIndex(index);
    setProgress(0);
    setDuration(0);

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      clearProgress();
      if (index < verses.length - 1) {
        playVerse(index + 1);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
    });

    audio.addEventListener('error', () => {
      clearProgress();
      if (index < verses.length - 1) {
        playVerse(index + 1);
      } else {
        setIsPlaying(false);
      }
    });

    audio.play().then(() => {
      setIsPlaying(true);
      startProgressTracking();
    }).catch(() => {
      setIsPlaying(false);
    });
  }, [verses, surah.number, reciter.subfolder, clearProgress, startProgressTracking]);

  const togglePlay = useCallback(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      clearProgress();
      setIsPlaying(false);
    } else if (!isPlaying && audioRef.current && audioRef.current.src) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        startProgressTracking();
      });
    } else {
      playVerse(currentIndex);
    }
  }, [isPlaying, currentIndex, playVerse, clearProgress, startProgressTracking]);

  const goToVerse = useCallback((index: number) => {
    if (isPlaying) {
      playVerse(index);
    } else {
      setCurrentIndex(index);
      setProgress(0);
    }
  }, [isPlaying, playVerse]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      clearProgress();
    };
  }, [clearProgress]);

  // When reciter changes, stop playback
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    clearProgress();
    setIsPlaying(false);
    setProgress(0);
  }, [reciter, clearProgress]);

  const formatTime = (t: number) => {
    if (!t || isNaN(t)) return '0:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return m + ':' + String(s).padStart(2, '0');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col lg:flex-row">
      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
          <button
            onClick={() => { if (audioRef.current) audioRef.current.pause(); clearProgress(); onBack(); }}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="text-center">
            <h2 className="text-white font-semibold">{surah.englishName}</h2>
            <p className="text-zinc-500 text-xs">{verses.length} verses selected</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm">Settings</span>
          </button>
        </div>

        {/* Display Area */}
        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div
            className="w-full max-w-3xl aspect-video rounded-2xl flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden transition-all duration-700"
            style={{
              background: 'linear-gradient(135deg, ' + bg.from + ' 0%, ' + bg.to + ' 100%)',
            }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5">
              <div className="absolute top-4 left-4 w-32 h-32 border border-white/20 rounded-full" />
              <div className="absolute bottom-4 right-4 w-48 h-48 border border-white/10 rounded-full" />
            </div>

            {/* Verse counter */}
            <div className="absolute top-4 right-4 text-zinc-400 text-sm">
              {currentIndex + 1} / {verses.length}
            </div>

            {/* Arabic text */}
            <p
              className="font-arabic text-white text-center leading-[1.8] mb-6 animate-fade-in max-w-full"
              dir="rtl"
              key={'ar-' + currentIndex}
              style={{ fontSize: arabicSize + 'px' }}
            >
              {currentVerse.text}
            </p>

            {/* Translation */}
            {showTranslation && (
              <p
                className="text-zinc-300/80 text-center text-sm md:text-base max-w-xl leading-relaxed animate-fade-in"
                key={'en-' + currentIndex}
              >
                {currentVerse.numberInSurah}. {currentVerse.translation}
              </p>
            )}
          </div>
        </div>

        {/* Player Controls */}
        <div className="px-4 pb-6">
          <div className="max-w-xl mx-auto">
            {/* Progress bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-zinc-500 text-xs w-10 text-right">{formatTime(progress)}</span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={progress}
                onChange={e => {
                  const val = parseFloat(e.target.value);
                  if (audioRef.current) {
                    audioRef.current.currentTime = val;
                    setProgress(val);
                  }
                }}
                className="flex-1"
              />
              <span className="text-zinc-500 text-xs w-10">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button
                onClick={() => goToVerse(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="text-zinc-400 hover:text-white disabled:text-zinc-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-emerald-500/25"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => goToVerse(currentIndex + 1)}
                disabled={currentIndex === verses.length - 1}
                className="text-zinc-400 hover:text-white disabled:text-zinc-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Verse List */}
        <div className="border-t border-zinc-800/50 px-4 py-4 max-h-48 overflow-y-auto">
          <div className="max-w-3xl mx-auto space-y-1">
            {verses.map((v, i) => (
              <button
                key={v.numberInSurah}
                onClick={() => goToVerse(i)}
                className={'w-full text-left px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-3 ' +
                  (i === currentIndex
                    ? 'bg-emerald-500/15 text-emerald-400 verse-playing'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300')}
              >
                <span className="w-6 text-right text-xs opacity-60">{v.numberInSurah}</span>
                <span className="font-arabic text-base truncate flex-1" dir="rtl">{v.text}</span>
                {i === currentIndex && isPlaying && (
                  <div className="flex gap-0.5 items-end h-4">
                    <div className="w-0.5 bg-emerald-400 animate-pulse" style={{height: '40%'}} />
                    <div className="w-0.5 bg-emerald-400 animate-pulse" style={{height: '70%', animationDelay: '0.15s'}} />
                    <div className="w-0.5 bg-emerald-400 animate-pulse" style={{height: '50%', animationDelay: '0.3s'}} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className={'fixed lg:static inset-0 z-30 lg:z-auto transition-transform duration-300 ' +
        (sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0')}>
        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div className="absolute inset-0 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <div className="absolute right-0 top-0 bottom-0 w-80 lg:w-72 lg:relative bg-[#111] border-l border-zinc-800/50 overflow-y-auto">
          <div className="p-5 space-y-6">
            {/* Close on mobile */}
            <div className="flex items-center justify-between lg:hidden">
              <h3 className="text-white font-semibold">Settings</h3>
              <button onClick={() => setSidebarOpen(false)} className="text-zinc-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="hidden lg:block">
              <h3 className="text-white font-semibold">Settings</h3>
            </div>

            {/* Reciter */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Reciter</label>
              <select
                value={reciter.id}
                onChange={e => {
                  const found = reciters.find(r => r.id === e.target.value);
                  if (found) setReciter(found);
                }}
                className="w-full bg-[#1a1a1a] border border-zinc-800 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500/50"
              >
                {reciters.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Arabic Size */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                Arabic Size - {arabicSize}px
              </label>
              <input
                type="range"
                min={20}
                max={64}
                value={arabicSize}
                onChange={e => setArabicSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Translation Toggle */}
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Translation</label>
              <button
                onClick={() => setShowTranslation(!showTranslation)}
                className={'w-11 h-6 rounded-full transition-colors relative ' +
                  (showTranslation ? 'bg-emerald-600' : 'bg-zinc-700')}
              >
                <div className={'w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ' +
                  (showTranslation ? 'translate-x-[22px]' : 'translate-x-0.5')} />
              </button>
            </div>

            {/* Background */}
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider mb-3 block">Background</label>
              <div className="grid grid-cols-3 gap-2">
                {backgrounds.map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => setBgIndex(i)}
                    className={'h-12 rounded-lg border-2 transition-all ' +
                      (i === bgIndex ? 'border-emerald-500 scale-105' : 'border-transparent hover:border-zinc-600')}
                    style={{
                      background: 'linear-gradient(135deg, ' + b.from + ' 0%, ' + b.to + ' 100%)',
                    }}
                    title={b.name}
                  />
                ))}
              </div>
            </div>

            {/* Surah Info */}
            <div className="pt-4 border-t border-zinc-800/50">
              <p className="text-zinc-500 text-xs uppercase tracking-wider mb-2">Playing</p>
              <p className="text-white font-semibold">{surah.englishName}</p>
              <p className="text-zinc-400 font-arabic text-lg">{surah.name}</p>
              <p className="text-zinc-500 text-sm mt-1">
                Verse {currentIndex + 1} of {verses.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
