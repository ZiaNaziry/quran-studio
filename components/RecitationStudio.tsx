'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Surah, Verse } from '../lib/types';
import { reciters, getAudioUrl } from '../lib/reciters';
import { backgrounds, getGradientCSS } from '../lib/backgrounds';

interface Props {
  surah: Surah;
  verses: Verse[];
  onBack: () => void;
}

export default function RecitationStudio({ surah, verses, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciterIdx, setReciterIdx] = useState(0);
  const [bgIdx, setBgIdx] = useState(0);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genType, setGenType] = useState<'image' | 'video' | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentVerse = verses[currentIndex];
  const reciter = reciters[reciterIdx];
  const bg = backgrounds[bgIdx];

  // Play audio for current verse
  useEffect(() => {
    if (!isPlaying || !currentVerse) return;
    const audio = new Audio();
    audioRef.current = audio;
    const url = getAudioUrl(reciter, surah.number, currentVerse.numberInSurah, currentVerse.number);
    audio.src = url;
    audio.play().catch(() => {});
    audio.onended = () => {
      if (currentIndex < verses.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsPlaying(false);
        setCurrentIndex(0);
      }
    };
    return () => { audio.pause(); audio.src = ''; };
  }, [isPlaying, currentIndex, reciterIdx]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
    }
  };

  const goNext = () => {
    audioRef.current?.pause();
    if (currentIndex < verses.length - 1) setCurrentIndex(prev => prev + 1);
  };
  const goPrev = () => {
    audioRef.current?.pause();
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  // Canvas drawing helpers
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number => {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        ctx.fillText(line, x, cy);
        line = words[i];
        cy += lineHeight;
      } else {
        line = test;
      }
    }
    if (line) { ctx.fillText(line, x, cy); cy += lineHeight; }
    return cy;
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, verse: Verse, w: number, h: number) => {
    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    bg.colors.forEach((c, i) => grad.addColorStop(i / Math.max(bg.colors.length - 1, 1), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    // Dark overlay for readability
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(0, 0, w, h);
    // Decorative border
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 40, w - 80, h - 80);
    // Surah name top
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '600 ' + Math.round(w * 0.025) + 'px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(surah.englishName + ' - Verse ' + verse.numberInSurah, w / 2, h * 0.1);
    // Arabic text
    ctx.fillStyle = '#ffffff';
    const arabicSize = Math.round(w * 0.045);
    ctx.font = '700 ' + arabicSize + 'px Amiri, serif';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    const arabicY = wrapText(ctx, verse.text, w / 2, h * 0.35, w * 0.75, arabicSize * 1.6);
    // Translation
    if (showTranslation && verse.translation) {
      ctx.direction = 'ltr';
      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      const engSize = Math.round(w * 0.022);
      ctx.font = '400 ' + engSize + 'px Inter, sans-serif';
      wrapText(ctx, verse.translation, w / 2, arabicY + 40, w * 0.7, engSize * 1.5);
    }
    // Watermark
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '400 ' + Math.round(w * 0.015) + 'px Inter, sans-serif';
    ctx.direction = 'ltr';
    ctx.textAlign = 'center';
    ctx.fillText('Quran SM Download', w / 2, h * 0.94);
  };

  // Download Image
  const downloadImage = useCallback(() => {
    setGenType('image');
    setIsGenerating(true);
    setGenProgress(0);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;
      drawFrame(ctx, currentVerse, 1080, 1920);
      setGenProgress(100);
      const link = document.createElement('a');
      link.download = surah.englishName + '-verse-' + currentVerse.numberInSurah + '.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      alert('Failed to generate image. Please try again.');
    } finally {
      setTimeout(() => { setIsGenerating(false); setGenType(null); }, 500);
    }
  }, [currentVerse, bg, showTranslation]);

  // Download Video
  const downloadVideo = useCallback(async () => {
    setGenType('video');
    setIsGenerating(true);
    setGenProgress(0);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d')!;

      const stream = canvas.captureStream(30);
      let audioCtx: AudioContext | null = null;
      let dest: MediaStreamAudioDestinationNode | null = null;

      try {
        audioCtx = new AudioContext();
        dest = audioCtx.createMediaStreamDestination();
        dest.stream.getAudioTracks().forEach(t => stream.addTrack(t));
      } catch {}

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);

      for (let i = 0; i < verses.length; i++) {
        setGenProgress(Math.round((i / verses.length) * 95));
        const verse = verses[i];
        drawFrame(ctx, verse, 1080, 1920);

        // Try to play audio and wait for it
        const url = getAudioUrl(reciter, surah.number, verse.numberInSurah, verse.number);
        try {
          if (audioCtx && dest) {
            const resp = await fetch(url);
            const buf = await resp.arrayBuffer();
            const audioBuf = await audioCtx.decodeAudioData(buf);
            const source = audioCtx.createBufferSource();
            source.buffer = audioBuf;
            source.connect(dest);
            source.start();
            await new Promise<void>(resolve => {
              source.onended = () => resolve();
              setTimeout(() => resolve(), (audioBuf.duration + 1) * 1000);
            });
          } else {
            // Fallback: play audio normally and wait
            const audio = new Audio(url);
            audio.play().catch(() => {});
            await new Promise<void>(resolve => {
              audio.onended = () => resolve();
              setTimeout(() => resolve(), 8000);
            });
          }
        } catch {
          await new Promise(r => setTimeout(r, 3000));
        }
        await new Promise(r => setTimeout(r, 300));
      }

      setGenProgress(100);
      recorder.stop();
      await new Promise<void>(resolve => { recorder.onstop = () => resolve(); });

      const blob = new Blob(chunks, { type: 'video/webm' });
      const url2 = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url2;
      a.download = surah.englishName + '-recitation.webm';
      a.click();
      URL.revokeObjectURL(url2);
      if (audioCtx) audioCtx.close();
    } catch (e) {
      alert('Video generation failed. Try using Chrome on desktop for best results.');
    } finally {
      setIsGenerating(false);
      setGenType(null);
    }
  }, [verses, bg, reciter, surah, showTranslation]);

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
      {/* Generation overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="text-center p-8 rounded-2xl max-w-sm w-full mx-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {genType === 'image' ? 'Creating Image...' : 'Generating Video...'}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {genType === 'video' ? 'Playing through all verses. This may take a while.' : 'Almost done...'}
            </p>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: genProgress + '%', background: 'var(--accent)' }} />
            </div>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--accent)' }}>{genProgress}%</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => { audioRef.current?.pause(); onBack(); }} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{surah.englishName}</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{verses.length} verse{verses.length > 1 ? 's' : ''} selected</p>
            </div>
          </div>
          <button onClick={() => setShowSettings(!showSettings)} className="w-9 h-9 rounded-lg flex items-center justify-center lg:hidden transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Settings Sidebar */}
        <div className={
          'border-r overflow-y-auto transition-all ' +
          (showSettings ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : 'hidden lg:block')
        } style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', width: showSettings ? '100%' : undefined, minWidth: '280px', maxWidth: showSettings ? undefined : '320px' }}>
          {showSettings && (
            <div className="flex justify-end p-3 lg:hidden">
              <button onClick={() => setShowSettings(false)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}
          <div className="p-4 space-y-6">
            {/* Reciter */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>Reciter</label>
              <div className="space-y-1">
                {reciters.map((r, i) => (
                  <button key={r.id} onClick={() => { setReciterIdx(i); if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } }} className="w-full text-left p-3 rounded-xl transition-all text-sm" style={{ background: i === reciterIdx ? 'var(--accent-light)' : 'transparent', color: i === reciterIdx ? 'var(--accent)' : 'var(--text-primary)' }}>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.arabicName}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Background */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>Background</label>
              <div className="grid grid-cols-5 gap-2">
                {backgrounds.map((b, i) => (
                  <button key={b.id} onClick={() => setBgIdx(i)} className="aspect-square rounded-lg transition-all hover:scale-110" style={{ background: getGradientCSS(b), outline: i === bgIdx ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px' }} title={b.name} />
                ))}
              </div>
            </div>
            {/* Translation toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Show Translation</span>
              <button onClick={() => setShowTranslation(!showTranslation)} className="w-12 h-7 rounded-full transition-all relative" style={{ background: showTranslation ? 'var(--accent)' : 'var(--bg-card)' }}>
                <div className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all" style={{ left: showTranslation ? '26px' : '4px' }} />
              </button>
            </div>
            {/* Download buttons */}
            <div className="space-y-2 pt-2">
              <button onClick={downloadImage} disabled={isGenerating} className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-white" style={{ background: 'var(--accent)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Download Image
              </button>
              <button onClick={downloadVideo} disabled={isGenerating} className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Download Video
              </button>
            </div>
          </div>
        </div>

        {/* Main preview area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-8 overflow-y-auto">
            <div className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: '9/16' }}>
              <div className="w-full h-full flex flex-col items-center justify-center p-8 sm:p-12 relative" style={{ background: getGradientCSS(bg) }}>
                {/* Overlay */}
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
                {/* Decorative border */}
                <div className="absolute inset-4 sm:inset-6 border border-white/10 rounded-xl" />
                {/* Content */}
                <div className="relative z-10 text-center w-full">
                  <p className="text-white/50 text-xs sm:text-sm font-medium mb-6 tracking-widest uppercase">{surah.englishName} - Verse {currentVerse?.numberInSurah}</p>
                  <p className="text-white text-2xl sm:text-3xl lg:text-4xl leading-relaxed mb-6" style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                    {currentVerse?.text}
                  </p>
                  {showTranslation && currentVerse?.translation && (
                    <p className="text-white/70 text-sm sm:text-base leading-relaxed max-w-md mx-auto italic">
                      {currentVerse.translation}
                    </p>
                  )}
                </div>
                {/* Watermark */}
                <p className="absolute bottom-4 text-white/25 text-xs tracking-wider">Quran SM Download</p>
              </div>
            </div>
          </div>

          {/* Verse list */}
          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex overflow-x-auto gap-1 p-2 sm:p-3">
              {verses.map((v, i) => (
                <button
                  key={v.numberInSurah}
                  onClick={() => { setCurrentIndex(i); if (isPlaying) { audioRef.current?.pause(); setIsPlaying(true); } }}
                  className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-110"
                  style={{
                    background: i === currentIndex ? 'var(--accent)' : 'var(--bg-card)',
                    color: i === currentIndex ? 'white' : 'var(--text-secondary)',
                    boxShadow: i === currentIndex ? '0 4px 20px var(--accent-light)' : 'none',
                  }}
                >
                  {v.numberInSurah}
                </button>
              ))}
            </div>
          </div>

          {/* Playback controls */}
          <div className="border-t p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-center gap-4">
              <button onClick={goPrev} disabled={currentIndex === 0} className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30" style={{ background: 'var(--bg-card)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
              </button>
              <button onClick={togglePlay} className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 text-white" style={{ background: 'var(--accent)', boxShadow: '0 4px 30px var(--accent-light)' }}>
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>
              <button onClick={goNext} disabled={currentIndex === verses.length - 1} className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30" style={{ background: 'var(--bg-card)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>
            {/* Mobile download buttons */}
            <div className="flex gap-2 mt-4 lg:hidden">
              <button onClick={downloadImage} disabled={isGenerating} className="flex-1 py-3 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2" style={{ background: 'var(--accent)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Image
              </button>
              <button onClick={downloadVideo} disabled={isGenerating} className="flex-1 py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
