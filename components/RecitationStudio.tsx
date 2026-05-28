'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Surah, Verse, Background, GradientBackground, PhotoBackground, BgTab, VideoFormat } from '../lib/types';
import { reciters, getAudioUrl } from '../lib/reciters';
import { gradients, photos, photoCategories, PhotoCategory, videoFormats, getGradientCSS } from '../lib/backgrounds';

interface Props {
  surah: Surah;
  verses: Verse[];
  onBack: () => void;
}

export default function RecitationStudio({ surah, verses, onBack }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reciterIdx, setReciterIdx] = useState(0);
  const [selectedBg, setSelectedBg] = useState<Background>(gradients[0]);
  const [bgTab, setBgTab] = useState<BgTab>('gradients');
  const [photoCategory, setPhotoCategory] = useState<PhotoCategory>('all');
  const [photoSearch, setPhotoSearch] = useState('');
  const [importedImage, setImportedImage] = useState<string | null>(null);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [genType, setGenType] = useState<'image' | 'video' | null>(null);
  const [formatIdx, setFormatIdx] = useState(1);
  const [arabicSize, setArabicSize] = useState(72);
  const [translationSize, setTranslationSize] = useState(32);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [photoCache, setPhotoCache] = useState<Record<string, HTMLImageElement>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);

  const currentVerse = verses[currentIndex];
  const reciter = reciters[reciterIdx];
  const format = videoFormats[formatIdx];

  // Keep refs in sync
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  // Initialize persistent audio element ONCE
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // Preload photo backgrounds
  useEffect(() => {
    if (selectedBg.type === 'photo') {
      const bg = selectedBg as PhotoBackground;
      if (!photoCache[bg.id]) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => setPhotoCache(prev => ({ ...prev, [bg.id]: img }));
        img.src = bg.url;
      }
    }
  }, [selectedBg]);

  // Audio playback — reuses same Audio element to avoid autoplay blocks
  const playVerse = useCallback((index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const verse = verses[index];
    if (!verse) { setIsPlaying(false); return; }

    setCurrentIndex(index);
    const url = getAudioUrl(reciter, surah.number, verse.numberInSurah, verse.number);

    // Remove old listeners
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.src = url;

    audio.onended = () => {
      const ci = currentIndexRef.current;
      if (ci < verses.length - 1 && isPlayingRef.current) {
        playVerse(ci + 1);
      } else {
        setIsPlaying(false);
        setCurrentIndex(0);
      }
    };
    audio.onerror = () => {
      const ci = currentIndexRef.current;
      if (ci < verses.length - 1 && isPlayingRef.current) {
        // Skip broken audio, try next verse
        setTimeout(() => playVerse(ci + 1), 300);
      } else {
        setIsPlaying(false);
      }
    };

    audio.play().catch(() => {
      // Autoplay blocked — stop
      setIsPlaying(false);
    });
  }, [reciter, surah, verses]);

  // Start/resume playback when isPlaying changes
  useEffect(() => {
    if (isPlaying) {
      playVerse(currentIndexRef.current);
    }
  }, [isPlaying, reciterIdx]);

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
    if (currentIndex < verses.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      if (isPlaying) playVerse(next);
    }
  };

  const goPrev = () => {
    audioRef.current?.pause();
    if (currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      if (isPlaying) playVerse(prev);
    }
  };

  // Filter photos
  const filteredPhotos = photos.filter(p => {
    const matchCat = photoCategory === 'all' || p.category === photoCategory;
    const matchSearch = !photoSearch || p.name.toLowerCase().includes(photoSearch.toLowerCase()) || p.category.toLowerCase().includes(photoSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // Handle file import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImportedImage(dataUrl);
      setSelectedBg({ id: 'imported', name: 'Imported', type: 'photo', category: 'import', url: dataUrl, thumb: dataUrl } as PhotoBackground);
      const img = new Image();
      img.onload = () => setPhotoCache(prev => ({ ...prev, imported: img }));
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Canvas text wrapping
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

  // Draw a frame on canvas — NO watermark/logo
  const drawFrame = useCallback((ctx: CanvasRenderingContext2D, verse: Verse, w: number, h: number, bgImage?: HTMLImageElement | null) => {
    // Background
    if (bgImage) {
      const imgRatio = bgImage.naturalWidth / bgImage.naturalHeight;
      const canvasRatio = w / h;
      let sx = 0, sy = 0, sw = bgImage.naturalWidth, sh = bgImage.naturalHeight;
      if (imgRatio > canvasRatio) {
        sw = bgImage.naturalHeight * canvasRatio;
        sx = (bgImage.naturalWidth - sw) / 2;
      } else {
        sh = bgImage.naturalWidth / canvasRatio;
        sy = (bgImage.naturalHeight - sh) / 2;
      }
      ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, w, h);
    } else if (selectedBg.type === 'gradient') {
      const g = selectedBg as GradientBackground;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      g.colors.forEach((c, i) => grad.addColorStop(i / Math.max(g.colors.length - 1, 1), c));
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, w, h);
    }

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,' + (overlayOpacity / 100) + ')';
    ctx.fillRect(0, 0, w, h);

    // Decorative border
    const borderPad = Math.min(w, h) * 0.04;
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(borderPad, borderPad, w - borderPad * 2, h - borderPad * 2);

    const scale = Math.min(w, h) / 1080;

    // Surah name top
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.font = '600 ' + Math.round(22 * scale) + 'px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText(surah.englishName + ' - Verse ' + verse.numberInSurah, w / 2, h * 0.1);

    // Arabic text
    ctx.fillStyle = '#ffffff';
    const aSize = Math.round(arabicSize * scale);
    ctx.font = '700 ' + aSize + 'px Amiri, serif';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    const arabicY = wrapText(ctx, verse.text, w / 2, h * 0.35, w * 0.78, aSize * 1.7);

    // Translation
    if (showTranslation && verse.translation) {
      ctx.direction = 'ltr';
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      const tSize = Math.round(translationSize * scale);
      ctx.font = '400 italic ' + tSize + 'px Inter, system-ui, sans-serif';
      wrapText(ctx, verse.translation, w / 2, arabicY + 30 * scale, w * 0.72, tSize * 1.55);
    }
    // NO watermark — clean output
  }, [selectedBg, overlayOpacity, surah, arabicSize, translationSize, showTranslation]);

  // Get background image for canvas
  const getBgImage = (): HTMLImageElement | null => {
    if (selectedBg.type === 'photo') {
      return photoCache[(selectedBg as PhotoBackground).id] || null;
    }
    return null;
  };

  // Load bg image with promise
  const loadBgImage = async (): Promise<HTMLImageElement | null> => {
    if (selectedBg.type !== 'photo') return null;
    const cached = getBgImage();
    if (cached) return cached;
    const pb = selectedBg as PhotoBackground;
    return new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { setPhotoCache(prev => ({ ...prev, [pb.id]: img })); resolve(img); };
      img.onerror = () => resolve(null);
      img.src = pb.url;
    });
  };

  // Download Image — PNG
  const downloadImage = useCallback(async () => {
    setGenType('image');
    setIsGenerating(true);
    setGenProgress(10);
    try {
      const bgImg = await loadBgImage();
      setGenProgress(50);
      const canvas = document.createElement('canvas');
      canvas.width = format.width;
      canvas.height = format.height;
      const ctx = canvas.getContext('2d')!;
      drawFrame(ctx, currentVerse, format.width, format.height, bgImg);
      setGenProgress(90);

      canvas.toBlob((blob) => {
        if (!blob) { alert('Failed to create image'); setIsGenerating(false); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = surah.englishName.replace(/\s+/g, '-') + '-verse-' + currentVerse.numberInSurah + '-' + format.label.replace(':', 'x') + '.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setGenProgress(100);
        setTimeout(() => { setIsGenerating(false); setGenType(null); }, 500);
      }, 'image/png');
    } catch {
      alert('Failed to generate image.');
      setIsGenerating(false);
      setGenType(null);
    }
  }, [currentVerse, selectedBg, format, drawFrame, photoCache]);

  // Download Video — records each verse with continuous frame drawing
  const downloadVideo = useCallback(async () => {
    setGenType('video');
    setIsGenerating(true);
    setGenProgress(0);

    try {
      const bgImg = await loadBgImage();
      const canvas = document.createElement('canvas');
      canvas.width = format.width;
      canvas.height = format.height;
      const ctx = canvas.getContext('2d')!;

      // Draw first frame
      drawFrame(ctx, verses[0], format.width, format.height, bgImg);

      const stream = canvas.captureStream(30);

      // Try MP4 first (Safari), then WebM
      let mimeType = 'video/webm;codecs=vp9';
      let fileExt = 'webm';
      if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4';
        fileExt = 'mp4';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mimeType = 'video/webm;codecs=vp9';
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8')) {
        mimeType = 'video/webm;codecs=vp8';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      }

      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 5000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);

      // For each verse, draw frame continuously while audio plays
      for (let i = 0; i < verses.length; i++) {
        setGenProgress(Math.round((i / verses.length) * 90));
        const verse = verses[i];

        // Start continuous redrawing to keep stream fed
        let drawing = true;
        const drawLoop = () => {
          if (!drawing) return;
          drawFrame(ctx, verse, format.width, format.height, bgImg);
          requestAnimationFrame(drawLoop);
        };
        requestAnimationFrame(drawLoop);

        // Load and play audio
        const url = getAudioUrl(reciter, surah.number, verse.numberInSurah, verse.number);
        try {
          await new Promise<void>((resolve) => {
            const audio = new Audio(url);
            audio.onended = () => resolve();
            audio.onerror = () => resolve();
            const timeout = setTimeout(() => { audio.pause(); resolve(); }, 20000);
            audio.play().catch(() => { clearTimeout(timeout); resolve(); });
          });
        } catch {
          await new Promise(r => setTimeout(r, 2000));
        }

        drawing = false;
        // Small gap between verses
        await new Promise(r => setTimeout(r, 400));
      }

      setGenProgress(95);
      recorder.stop();
      await new Promise<void>(resolve => { recorder.onstop = () => resolve(); });

      const finalMime = fileExt === 'mp4' ? 'video/mp4' : 'video/webm';
      const blob = new Blob(chunks, { type: finalMime });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = surah.englishName.replace(/\s+/g, '-') + '-recitation-' + format.label.replace(':', 'x') + '.' + fileExt;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(dlUrl);
      setGenProgress(100);
    } catch {
      alert('Video generation failed. Try using Chrome on desktop for best results.');
    } finally {
      setTimeout(() => { setIsGenerating(false); setGenType(null); }, 500);
    }
  }, [verses, selectedBg, reciter, surah, format, drawFrame, photoCache]);

  // Preview background CSS
  const getPreviewBgCSS = (): React.CSSProperties => {
    if (selectedBg.type === 'gradient') {
      return { background: getGradientCSS(selectedBg as GradientBackground) };
    }
    const pb = selectedBg as PhotoBackground;
    return { backgroundImage: 'url(' + pb.url + ')', backgroundSize: 'cover', backgroundPosition: 'center' };
  };

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-primary)' }}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileImport} />

      {/* Generation overlay */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="text-center p-8 rounded-2xl max-w-sm w-full mx-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {genType === 'image' ? 'Creating Image...' : 'Recording Video...'}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {genType === 'video' ? 'Recording each verse with audio. Please wait.' : 'Processing...'}
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
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Settings Sidebar */}
        <div className={
          'overflow-y-auto transition-all border-r ' +
          (showSettings ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : 'hidden lg:block')
        } style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', minWidth: '300px', maxWidth: showSettings ? '100%' : '340px' }}>
          {showSettings && (
            <div className="flex justify-end p-3 lg:hidden">
              <button onClick={() => setShowSettings(false)} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}
          <div className="p-4 space-y-5">
            {/* Video Format */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>Format</label>
              <div className="grid grid-cols-4 gap-2">
                {videoFormats.map((f, i) => (
                  <button key={f.id} onClick={() => setFormatIdx(i)} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all text-xs font-bold" style={{ background: i === formatIdx ? 'var(--accent-light)' : 'var(--bg-card)', color: i === formatIdx ? 'var(--accent)' : 'var(--text-secondary)', border: i === formatIdx ? '1.5px solid var(--accent)' : '1.5px solid var(--border)' }}>
                    <div className="border-2 rounded-sm" style={{ width: f.id === 'landscape' ? 28 : f.id === 'portrait' ? 16 : f.id === 'square' ? 22 : 20, height: f.id === 'landscape' ? 16 : f.id === 'portrait' ? 28 : f.id === 'square' ? 22 : 25, borderColor: i === formatIdx ? 'var(--accent)' : 'var(--text-secondary)' }} />
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Arabic Size */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Arabic Size</label>
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{arabicSize}px</span>
              </div>
              <input type="range" min="40" max="120" value={arabicSize} onChange={e => setArabicSize(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>

            {/* Translation toggle + size */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Translation</span>
                <button onClick={() => setShowTranslation(!showTranslation)} className="w-11 h-6 rounded-full transition-all relative" style={{ background: showTranslation ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="rounded-full bg-white absolute top-0.5 transition-all" style={{ width: 18, height: 18, left: showTranslation ? '22px' : '3px' }} />
                </button>
              </div>
              {showTranslation && (
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Size: {translationSize}px</span>
                  <input type="range" min="18" max="60" value={translationSize} onChange={e => setTranslationSize(Number(e.target.value))} className="w-40" style={{ accentColor: 'var(--accent)' }} />
                </div>
              )}
            </div>

            {/* Overlay */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Dark Overlay</label>
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{overlayOpacity}%</span>
              </div>
              <input type="range" min="0" max="90" value={overlayOpacity} onChange={e => setOverlayOpacity(Number(e.target.value))} className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>

            {/* Reciter */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>Reciter</label>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {reciters.map((r, i) => (
                  <button key={r.id} onClick={() => { setReciterIdx(i); if (isPlaying) { audioRef.current?.pause(); setIsPlaying(false); } }} className="w-full text-left p-2.5 rounded-xl transition-all text-sm" style={{ background: i === reciterIdx ? 'var(--accent-light)' : 'transparent', color: i === reciterIdx ? 'var(--accent)' : 'var(--text-primary)' }}>
                    <div className="font-medium text-sm">{r.name}</div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.arabicName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>Background</label>
              <div className="flex rounded-xl overflow-hidden mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {(['gradients', 'photos', 'import'] as BgTab[]).map(tab => (
                  <button key={tab} onClick={() => setBgTab(tab)} className="flex-1 py-2 text-xs font-semibold capitalize transition-all" style={{ background: bgTab === tab ? 'var(--accent)' : 'transparent', color: bgTab === tab ? 'white' : 'var(--text-secondary)' }}>
                    {tab}
                  </button>
                ))}
              </div>

              {bgTab === 'gradients' && (
                <div className="grid grid-cols-6 gap-2">
                  {gradients.map(g => (
                    <button key={g.id} onClick={() => setSelectedBg(g)} className="aspect-square rounded-lg transition-all hover:scale-110" style={{ background: getGradientCSS(g), outline: selectedBg.id === g.id ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px' }} title={g.name} />
                  ))}
                </div>
              )}

              {bgTab === 'photos' && (
                <div>
                  {/* Search */}
                  <input type="text" placeholder="Search backgrounds..." value={photoSearch} onChange={e => setPhotoSearch(e.target.value)} className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  {/* Category filter */}
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {photoCategories.map(cat => (
                      <button key={cat} onClick={() => setPhotoCategory(cat)} className="px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all" style={{ background: photoCategory === cat ? 'var(--accent)' : 'var(--bg-card)', color: photoCategory === cat ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (photoCategory === cat ? 'var(--accent)' : 'var(--border)') }}>
                        {cat}
                      </button>
                    ))}
                  </div>
                  {/* Photo grid */}
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredPhotos.map(p => (
                      <button key={p.id} onClick={() => setSelectedBg(p)} className="aspect-video rounded-lg overflow-hidden transition-all hover:scale-105" style={{ outline: selectedBg.id === p.id ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px' }}>
                        <img src={p.thumb} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                    {filteredPhotos.length === 0 && (
                      <p className="col-span-3 text-center py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>No photos found. Try a different search.</p>
                    )}
                  </div>
                </div>
              )}

              {bgTab === 'import' && (
                <div>
                  <button onClick={() => fileInputRef.current?.click()} className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:scale-[1.02]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    <span className="text-sm font-medium">Upload Your Image</span>
                    <span className="text-xs">JPG, PNG, WebP</span>
                  </button>
                  {importedImage && (
                    <button onClick={() => setSelectedBg({ id: 'imported', name: 'Imported', type: 'photo', category: 'import', url: importedImage, thumb: importedImage } as PhotoBackground)} className="mt-2 w-full rounded-xl overflow-hidden" style={{ outline: selectedBg.id === 'imported' ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px', height: 60 }}>
                      <img src={importedImage} alt="Imported" className="w-full h-full object-cover" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Download buttons */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={downloadImage} disabled={isGenerating} className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Download Image ({format.label})
              </button>
              <button onClick={downloadVideo} disabled={isGenerating} className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                Download Video ({format.label})
              </button>
            </div>
          </div>
        </div>

        {/* Main preview area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview — NO watermark */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: format.ratio, maxHeight: '100%', maxWidth: '100%', width: format.id === 'portrait' ? 320 : format.id === 'square' ? 400 : format.id === 'social' ? 360 : 560 }}>
              <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 relative" style={getPreviewBgCSS()}>
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,' + (overlayOpacity / 100) + ')' }} />
                <div className="absolute inset-3 sm:inset-5 border border-white/10 rounded-xl" />
                <div className="relative z-10 text-center w-full">
                  <p className="text-white/50 text-xs font-medium mb-4 tracking-widest uppercase">{surah.englishName} - Verse {currentVerse?.numberInSurah}</p>
                  <p className="text-white leading-relaxed mb-4" style={{ fontFamily: 'Amiri, serif', direction: 'rtl', fontSize: Math.max(16, arabicSize * 0.35) }}>
                    {currentVerse?.text}
                  </p>
                  {showTranslation && currentVerse?.translation && (
                    <p className="text-white/70 leading-relaxed max-w-md mx-auto italic" style={{ fontSize: Math.max(11, translationSize * 0.35) }}>
                      {currentVerse.translation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verse list */}
          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex overflow-x-auto gap-1 p-2 sm:p-3 custom-scrollbar">
              {verses.map((v, i) => (
                <button key={v.numberInSurah} onClick={() => { const idx = i; setCurrentIndex(idx); if (isPlaying) { audioRef.current?.pause(); playVerse(idx); } }} className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-110" style={{ background: i === currentIndex ? 'var(--accent)' : 'var(--bg-card)', color: i === currentIndex ? 'white' : 'var(--text-secondary)', boxShadow: i === currentIndex ? '0 4px 20px var(--accent-light)' : 'none' }}>
                  {v.numberInSurah}
                </button>
              ))}
            </div>
          </div>

          {/* Playback controls */}
          <div className="border-t p-3 sm:p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-center gap-4">
              <button onClick={goPrev} disabled={currentIndex === 0} className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
              </button>
              <button onClick={togglePlay} className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 text-white" style={{ background: 'var(--accent)', boxShadow: '0 4px 30px var(--accent-light)' }}>
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>
              <button onClick={goNext} disabled={currentIndex === verses.length - 1} className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>
            {/* Mobile download buttons */}
            <div className="flex gap-2 mt-3 lg:hidden">
              <button onClick={downloadImage} disabled={isGenerating} className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                Image
              </button>
              <button onClick={downloadVideo} disabled={isGenerating} className="flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
