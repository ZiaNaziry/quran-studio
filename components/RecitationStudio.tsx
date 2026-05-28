'use client';

import { useState, useRef, useEffect } from 'react';
import { Surah, Verse, Background, GradientBackground, PhotoBackground, BgTab, VideoFormat } from '../lib/types';
import { reciters, getAudioUrl } from '../lib/reciters';
import { gradients, photos, photoCategories, PhotoCategory, videoFormats, getGradientCSS } from '../lib/backgrounds';
import { Language, t } from '../lib/i18n';

interface Props {
  surah: Surah;
  verses: Verse[];
  onBack: () => void;
  lang: Language;
}

export default function RecitationStudio({ surah, verses, onBack, lang }: Props) {
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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadType, setDownloadType] = useState('');
  const [formatIdx, setFormatIdx] = useState(1);
  const [arabicSize, setArabicSize] = useState(48);
  const [translationSize, setTranslationSize] = useState(22);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const playingRef = useRef(false);
  const idxRef = useRef(0);

  const currentVerse = verses[currentIndex];
  const reciter = reciters[reciterIdx];
  const format = videoFormats[formatIdx];

  useEffect(() => { playingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { idxRef.current = currentIndex; }, [currentIndex]);

  // Create audio element once
  useEffect(() => {
    const a = new Audio();
    audioRef.current = a;
    return () => { a.pause(); a.removeAttribute('src'); a.load(); };
  }, []);

  // Simple play function
  function playFrom(index: number) {
    const audio = audioRef.current;
    if (!audio || index >= verses.length) {
      setIsPlaying(false);
      playingRef.current = false;
      return;
    }

    const verse = verses[index];
    setCurrentIndex(index);
    idxRef.current = index;

    const url = getAudioUrl(reciter, surah.number, verse.numberInSurah, verse.number);
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.src = url;

    audio.onended = function() {
      const nextIdx = idxRef.current + 1;
      if (nextIdx < verses.length && playingRef.current) {
        playFrom(nextIdx);
      } else {
        setIsPlaying(false);
        playingRef.current = false;
      }
    };

    audio.onerror = function() {
      const nextIdx = idxRef.current + 1;
      if (nextIdx < verses.length && playingRef.current) {
        setTimeout(function() { playFrom(nextIdx); }, 500);
      } else {
        setIsPlaying(false);
        playingRef.current = false;
      }
    };

    audio.play().catch(function() {
      setIsPlaying(false);
      playingRef.current = false;
    });
  }

  function handlePlay() {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      playingRef.current = false;
    } else {
      setIsPlaying(true);
      playingRef.current = true;
      playFrom(currentIndex);
    }
  }

  function handleNext() {
    if (currentIndex < verses.length - 1) {
      audioRef.current?.pause();
      const next = currentIndex + 1;
      setCurrentIndex(next);
      idxRef.current = next;
      if (isPlaying) playFrom(next);
    }
  }

  function handlePrev() {
    if (currentIndex > 0) {
      audioRef.current?.pause();
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      idxRef.current = prev;
      if (isPlaying) playFrom(prev);
    }
  }

  function handleVerseClick(i: number) {
    audioRef.current?.pause();
    setCurrentIndex(i);
    idxRef.current = i;
    if (isPlaying) playFrom(i);
  }

  function handleReciterChange(i: number) {
    audioRef.current?.pause();
    setReciterIdx(i);
    setIsPlaying(false);
    playingRef.current = false;
  }

  const filteredPhotos = photos.filter(function(p) {
    const matchCat = photoCategory === 'all' || p.category === photoCategory;
    const matchSearch = !photoSearch || p.name.toLowerCase().includes(photoSearch.toLowerCase()) || p.category.toLowerCase().includes(photoSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(ev) {
      const dataUrl = ev.target?.result as string;
      setImportedImage(dataUrl);
      setSelectedBg({ id: 'imported', name: 'Imported', type: 'photo', category: 'import', url: dataUrl, thumb: dataUrl } as PhotoBackground);
    };
    reader.readAsDataURL(file);
  }

  // Canvas text wrapping
  function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number): number {
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
  }

  // Draw verse on canvas — NO border lines, smaller text
  function drawVerseOnCanvas(ctx: CanvasRenderingContext2D, verse: Verse, w: number, h: number, bgImg?: HTMLImageElement | null) {
    // Background
    if (bgImg) {
      const imgR = bgImg.naturalWidth / bgImg.naturalHeight;
      const canR = w / h;
      let sx = 0, sy = 0, sw = bgImg.naturalWidth, sh = bgImg.naturalHeight;
      if (imgR > canR) { sw = bgImg.naturalHeight * canR; sx = (bgImg.naturalWidth - sw) / 2; }
      else { sh = bgImg.naturalWidth / canR; sy = (bgImg.naturalHeight - sh) / 2; }
      ctx.drawImage(bgImg, sx, sy, sw, sh, 0, 0, w, h);
    } else if (selectedBg.type === 'gradient') {
      const g = selectedBg as GradientBackground;
      const grad = ctx.createLinearGradient(0, 0, w, h);
      g.colors.forEach(function(c, i) { grad.addColorStop(i / Math.max(g.colors.length - 1, 1), c); });
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, w, h);
    }

    // Dark overlay
    ctx.fillStyle = 'rgba(0,0,0,' + (overlayOpacity / 100) + ')';
    ctx.fillRect(0, 0, w, h);

    // NO border/strokeRect — clean edges

    const scale = Math.min(w, h) / 1080;

    // Surah name — small
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 ' + Math.round(16 * scale) + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText(surah.englishName + ' - ' + t('studio.verse', lang) + ' ' + verse.numberInSurah, w / 2, h * 0.08);

    // Arabic text — smaller default
    ctx.fillStyle = '#ffffff';
    const aSize = Math.round(arabicSize * scale);
    ctx.font = '600 ' + aSize + 'px serif';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    const nextY = wrapText(ctx, verse.text, w / 2, h * 0.32, w * 0.8, aSize * 1.6);

    // Translation — smaller
    if (showTranslation && verse.translation) {
      ctx.direction = 'ltr';
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      const tSize = Math.round(translationSize * scale);
      ctx.font = '400 italic ' + tSize + 'px system-ui, sans-serif';
      wrapText(ctx, verse.translation, w / 2, nextY + 20 * scale, w * 0.75, tSize * 1.5);
    }
  }

  function loadBgImageAsync(): Promise<HTMLImageElement | null> {
    if (selectedBg.type !== 'photo') return Promise.resolve(null);
    const pb = selectedBg as PhotoBackground;
    return new Promise(function(resolve) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = function() { resolve(img); };
      img.onerror = function() { resolve(null); };
      img.src = pb.url;
    });
  }

  // Download as PNG
  async function downloadImage() {
    setIsDownloading(true);
    setDownloadType('image');
    setDownloadProgress(10);

    try {
      const bgImg = await loadBgImageAsync();
      setDownloadProgress(40);

      const canvas = document.createElement('canvas');
      canvas.width = format.width;
      canvas.height = format.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { alert('Canvas not supported'); setIsDownloading(false); return; }

      drawVerseOnCanvas(ctx, currentVerse, format.width, format.height, bgImg);
      setDownloadProgress(80);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = surah.englishName.replace(/\s+/g, '-') + '-v' + currentVerse.numberInSurah + '.png';
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadProgress(100);
    } catch {
      alert('Failed to create image');
    }
    setTimeout(function() { setIsDownloading(false); setDownloadType(''); }, 500);
  }

  // Download as video WITH AUDIO using AudioContext
  async function downloadVideo() {
    setIsDownloading(true);
    setDownloadType('video');
    setDownloadProgress(0);

    try {
      const bgImg = await loadBgImageAsync();
      const canvas = document.createElement('canvas');
      canvas.width = format.width;
      canvas.height = format.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) { alert('Canvas not supported'); setIsDownloading(false); return; }

      drawVerseOnCanvas(ctx, verses[0], format.width, format.height, bgImg);

      // Create AudioContext for capturing audio
      const audioCtx = new AudioContext();
      const audioDest = audioCtx.createMediaStreamDestination();

      // Combine canvas video + audio into one stream
      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream();
      // Add video track from canvas
      canvasStream.getVideoTracks().forEach(function(track) { combinedStream.addTrack(track); });
      // Add audio track from AudioContext destination
      audioDest.stream.getAudioTracks().forEach(function(track) { combinedStream.addTrack(track); });

      // Find supported mime type
      let mimeType = 'video/webm';
      let ext = 'webm';
      if (typeof MediaRecorder !== 'undefined') {
        if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) { mimeType = 'video/webm;codecs=vp8,opus'; }
        else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')) { mimeType = 'video/webm;codecs=vp9,opus'; }
        else if (MediaRecorder.isTypeSupported('video/mp4')) { mimeType = 'video/mp4'; ext = 'mp4'; }
      }

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = function(e) { if (e.data.size > 0) chunks.push(e.data); };
      recorder.start(100);

      // Record each verse with audio piped through AudioContext
      for (let i = 0; i < verses.length; i++) {
        setDownloadProgress(Math.round((i / verses.length) * 85));
        const verse = verses[i];

        // Continuously draw frame
        let keepDrawing = true;
        const drawLoop = () => {
          if (!keepDrawing) return;
          drawVerseOnCanvas(ctx, verse, format.width, format.height, bgImg);
          requestAnimationFrame(drawLoop);
        };
        requestAnimationFrame(drawLoop);

        // Fetch audio as ArrayBuffer, decode, play through AudioContext
        const audioUrl = getAudioUrl(reciter, surah.number, verse.numberInSurah, verse.number);
        await new Promise<void>(function(resolve) {
          const timeout = setTimeout(function() { resolve(); }, 60000);

          fetch(audioUrl)
            .then(function(res) { return res.arrayBuffer(); })
            .then(function(arrayBuf) { return audioCtx.decodeAudioData(arrayBuf); })
            .then(function(audioBuffer) {
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioDest);
              // Also play so we can hear it (optional, but useful for feedback)
              source.connect(audioCtx.destination);
              source.onended = function() {
                clearTimeout(timeout);
                resolve();
              };
              source.start(0);
            })
            .catch(function() {
              // If fetch/decode fails, wait 2 seconds of silence then continue
              clearTimeout(timeout);
              setTimeout(function() { resolve(); }, 2000);
            });
        });

        keepDrawing = false;
        // Small gap between verses
        await new Promise(function(r) { setTimeout(r, 400); });
      }

      setDownloadProgress(90);
      recorder.stop();
      await new Promise<void>(function(resolve) { recorder.onstop = function() { resolve(); }; });
      audioCtx.close();

      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = surah.englishName.replace(/\s+/g, '-') + '-recitation.' + ext;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setDownloadProgress(100);
    } catch {
      alert('Video recording failed. Try Chrome desktop for best results.');
    }
    setTimeout(function() { setIsDownloading(false); setDownloadType(''); }, 500);
  }

  function getPreviewStyle(): React.CSSProperties {
    if (selectedBg.type === 'gradient') {
      return { background: getGradientCSS(selectedBg as GradientBackground) };
    }
    const pb = selectedBg as PhotoBackground;
    return { backgroundImage: 'url(' + pb.url + ')', backgroundSize: 'cover', backgroundPosition: 'center' };
  }

  const dir = lang === 'ar' || lang === 'fa' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen animate-fade-in" style={{ background: 'var(--bg-primary)' }} dir={dir}>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileImport} />

      {/* Download overlay */}
      {isDownloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
          <div className="text-center p-8 rounded-2xl max-w-sm w-full mx-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
            <div className="w-16 h-16 border-4 rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
            <p className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {downloadType === 'image' ? t('studio.creatingImage', lang) : t('studio.recordingVideo', lang)}
            </p>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {downloadType === 'video' ? t('studio.recordingNote', lang) : t('studio.generating', lang)}
            </p>
            <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: downloadProgress + '%', background: 'var(--accent)' }} />
            </div>
            <p className="text-sm mt-2 font-medium" style={{ color: 'var(--accent)' }}>{downloadProgress}%</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={function() { audioRef.current?.pause(); setIsPlaying(false); onBack(); }} className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:scale-110" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-primary)' }}><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div>
              <h1 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{surah.englishName}</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{verses.length} {verses.length > 1 ? t('verses.verseP', lang) : t('verses.verse', lang)}</p>
            </div>
          </div>
          <button onClick={function() { setShowSettings(!showSettings); }} className="w-9 h-9 rounded-lg flex items-center justify-center lg:hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row" style={{ height: 'calc(100vh - 56px)' }}>
        {/* Sidebar */}
        <div className={'overflow-y-auto transition-all border-r ' + (showSettings ? 'fixed inset-0 z-40 lg:relative lg:inset-auto' : 'hidden lg:block')} style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', minWidth: '300px', maxWidth: showSettings ? '100%' : '340px' }} dir="ltr">
          {showSettings && (
            <div className="flex justify-end p-3 lg:hidden">
              <button onClick={function() { setShowSettings(false); }} className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          )}
          <div className="p-4 space-y-5">
            {/* Format */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>{t('studio.format', lang)}</label>
              <div className="grid grid-cols-4 gap-2">
                {videoFormats.map(function(f, i) {
                  return (
                    <button key={f.id} onClick={function() { setFormatIdx(i); }} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all text-xs font-bold" style={{ background: i === formatIdx ? 'var(--accent-light)' : 'var(--bg-card)', color: i === formatIdx ? 'var(--accent)' : 'var(--text-secondary)', border: i === formatIdx ? '1.5px solid var(--accent)' : '1.5px solid var(--border)' }}>
                      <div className="border-2 rounded-sm" style={{ width: f.id === 'landscape' ? 28 : f.id === 'portrait' ? 16 : f.id === 'square' ? 22 : 20, height: f.id === 'landscape' ? 16 : f.id === 'portrait' ? 28 : f.id === 'square' ? 22 : 25, borderColor: i === formatIdx ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arabic Size */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t('studio.arabicSize', lang)}</label>
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{arabicSize}px</span>
              </div>
              <input type="range" min="24" max="80" value={arabicSize} onChange={function(e) { setArabicSize(Number(e.target.value)); }} className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>

            {/* Translation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t('studio.translation', lang)}</span>
                <button onClick={function() { setShowTranslation(!showTranslation); }} className="w-11 h-6 rounded-full transition-all relative" style={{ background: showTranslation ? 'var(--accent)' : 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <div className="rounded-full bg-white absolute top-0.5 transition-all" style={{ width: 18, height: 18, left: showTranslation ? '22px' : '3px' }} />
                </button>
              </div>
              {showTranslation && (
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Size: {translationSize}px</span>
                  <input type="range" min="14" max="40" value={translationSize} onChange={function(e) { setTranslationSize(Number(e.target.value)); }} className="w-40" style={{ accentColor: 'var(--accent)' }} />
                </div>
              )}
            </div>

            {/* Overlay */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{t('studio.darkOverlay', lang)}</label>
                <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>{overlayOpacity}%</span>
              </div>
              <input type="range" min="0" max="90" value={overlayOpacity} onChange={function(e) { setOverlayOpacity(Number(e.target.value)); }} className="w-full" style={{ accentColor: 'var(--accent)' }} />
            </div>

            {/* Reciter */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>{t('studio.reciter', lang)}</label>
              <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar">
                {reciters.map(function(r, i) {
                  return (
                    <button key={r.id} onClick={function() { handleReciterChange(i); }} className="w-full text-left p-2.5 rounded-xl transition-all text-sm" style={{ background: i === reciterIdx ? 'var(--accent-light)' : 'transparent', color: i === reciterIdx ? 'var(--accent)' : 'var(--text-primary)' }}>
                      <div className="font-medium text-sm">{r.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{r.arabicName}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Background */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-3 block" style={{ color: 'var(--text-secondary)' }}>{t('studio.background', lang)}</label>
              <div className="flex rounded-xl overflow-hidden mb-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {(['gradients', 'photos', 'import'] as BgTab[]).map(function(tab) {
                  const label = tab === 'gradients' ? t('studio.gradients', lang) : tab === 'photos' ? t('studio.photos', lang) : t('studio.import', lang);
                  return (
                    <button key={tab} onClick={function() { setBgTab(tab); }} className="flex-1 py-2 text-xs font-semibold capitalize transition-all" style={{ background: bgTab === tab ? 'var(--accent)' : 'transparent', color: bgTab === tab ? 'white' : 'var(--text-secondary)' }}>
                      {label}
                    </button>
                  );
                })}
              </div>

              {bgTab === 'gradients' && (
                <div className="grid grid-cols-6 gap-2">
                  {gradients.map(function(g) {
                    return (
                      <button key={g.id} onClick={function() { setSelectedBg(g); }} className="aspect-square rounded-lg transition-all hover:scale-110" style={{ background: getGradientCSS(g), outline: selectedBg.id === g.id ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px' }} title={g.name} />
                    );
                  })}
                </div>
              )}

              {bgTab === 'photos' && (
                <div>
                  <input type="text" placeholder={t('studio.searchBg', lang)} value={photoSearch} onChange={function(e) { setPhotoSearch(e.target.value); }} className="w-full px-3 py-2 rounded-lg text-sm mb-3 outline-none" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <div className="flex gap-1 mb-3 flex-wrap">
                    {photoCategories.map(function(cat) {
                      return (
                        <button key={cat} onClick={function() { setPhotoCategory(cat); }} className="px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all" style={{ background: photoCategory === cat ? 'var(--accent)' : 'var(--bg-card)', color: photoCategory === cat ? 'white' : 'var(--text-secondary)', border: '1px solid ' + (photoCategory === cat ? 'var(--accent)' : 'var(--border)') }}>
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto custom-scrollbar">
                    {filteredPhotos.map(function(p) {
                      return (
                        <button key={p.id} onClick={function() { setSelectedBg(p); }} className="aspect-video rounded-lg overflow-hidden transition-all hover:scale-105" style={{ outline: selectedBg.id === p.id ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px' }}>
                          <img src={p.thumb} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      );
                    })}
                    {filteredPhotos.length === 0 && (
                      <p className="col-span-3 text-center py-4 text-sm" style={{ color: 'var(--text-secondary)' }}>{t('studio.noPhotos', lang)}</p>
                    )}
                  </div>
                </div>
              )}

              {bgTab === 'import' && (
                <div>
                  <button onClick={function() { fileInputRef.current?.click(); }} className="w-full py-8 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:scale-[1.02]" style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
                    <span className="text-sm font-medium">{t('studio.uploadImage', lang)}</span>
                    <span className="text-xs">{t('studio.fileTypes', lang)}</span>
                  </button>
                  {importedImage && (
                    <button onClick={function() { setSelectedBg({ id: 'imported', name: 'Imported', type: 'photo', category: 'import', url: importedImage, thumb: importedImage } as PhotoBackground); }} className="mt-2 w-full rounded-xl overflow-hidden" style={{ outline: selectedBg.id === 'imported' ? '2px solid var(--accent)' : '2px solid transparent', outlineOffset: '2px', height: 60 }}>
                      <img src={importedImage} alt="Imported" className="w-full h-full object-cover" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Download buttons */}
            <div className="space-y-2 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={downloadImage} disabled={isDownloading} className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                {t('studio.downloadImage', lang)} ({format.label})
              </button>
              <button onClick={downloadVideo} disabled={isDownloading} className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                {t('studio.downloadVideo', lang)} ({format.label})
              </button>
            </div>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview — NO border div */}
          <div className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: format.ratio, maxHeight: '100%', maxWidth: '100%', width: format.id === 'portrait' ? 320 : format.id === 'square' ? 400 : format.id === 'social' ? 360 : 560 }}>
              <div className="w-full h-full flex flex-col items-center justify-center p-6 sm:p-10 relative" style={getPreviewStyle()}>
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,' + (overlayOpacity / 100) + ')' }} />
                <div className="relative z-10 text-center w-full">
                  <p className="text-white/40 text-[10px] font-medium mb-4 tracking-widest uppercase">{surah.englishName} - {t('studio.verse', lang)} {currentVerse?.numberInSurah}</p>
                  <p className="text-white leading-relaxed mb-4" style={{ fontFamily: 'serif', direction: 'rtl', fontSize: Math.max(14, arabicSize * 0.3) }}>
                    {currentVerse?.text}
                  </p>
                  {showTranslation && currentVerse?.translation && (
                    <p className="text-white/60 leading-relaxed max-w-md mx-auto italic" style={{ fontSize: Math.max(10, translationSize * 0.3) }}>
                      {currentVerse.translation}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Verse list */}
          <div className="border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex overflow-x-auto gap-1 p-2 sm:p-3 custom-scrollbar" dir="ltr">
              {verses.map(function(v, i) {
                return (
                  <button key={v.numberInSurah} onClick={function() { handleVerseClick(i); }} className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-sm font-bold transition-all hover:scale-110" style={{ background: i === currentIndex ? 'var(--accent)' : 'var(--bg-card)', color: i === currentIndex ? 'white' : 'var(--text-secondary)', boxShadow: i === currentIndex ? '0 4px 20px var(--accent-light)' : 'none' }}>
                    {v.numberInSurah}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Controls */}
          <div className="border-t p-3 sm:p-4" style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
            <div className="flex items-center justify-center gap-4">
              <button onClick={handlePrev} disabled={currentIndex === 0} className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
              </button>
              <button onClick={handlePlay} className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 text-white" style={{ background: 'var(--accent)', boxShadow: '0 4px 30px var(--accent-light)' }}>
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                )}
              </button>
              <button onClick={handleNext} disabled={currentIndex === verses.length - 1} className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30" style={{ background: 'var(--bg-card)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-primary)' }}><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
              </button>
            </div>
            {/* Mobile download */}
            <div className="flex gap-2 mt-3 lg:hidden">
              <button onClick={downloadImage} disabled={isDownloading} className="flex-1 py-2.5 rounded-xl font-medium text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--accent)' }}>{t('studio.image', lang)}</button>
              <button onClick={downloadVideo} disabled={isDownloading} className="flex-1 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>{t('studio.video', lang)}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
