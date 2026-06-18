'use client';

import { useState, useRef, useEffect } from 'react';
import { Surah, Verse, Background, GradientBackground, PhotoBackground, BgTab, VideoFormat } from '../lib/types';
import { reciters, getAudioUrl } from '../lib/reciters';
import { gradients, photos, photoCategories, PhotoCategory, videoFormats, getGradientCSS } from '../lib/backgrounds';
import { Language, t } from '../lib/i18n';
import { Muxer, ArrayBufferTarget } from 'mp4-muxer';

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

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadType, setDownloadType] = useState('');
  const [isDesktop, setIsDesktop] = useState(false);
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
  useEffect(() => {
    const check = function() { setIsDesktop(window.innerWidth >= 1024); };
    check();
    window.addEventListener('resize', check);
    return function() { window.removeEventListener('resize', check); };
  }, []);

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
  // Measure how many lines text will take (without drawing)
  function measureTextLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): number {
    const words = text.split(' ');
    let line = '';
    let lines = 1;
    for (let i = 0; i < words.length; i++) {
      const test = line ? line + ' ' + words[i] : words[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        line = words[i];
        lines++;
      } else {
        line = test;
      }
    }
    return lines;
  }

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

  // Draw verse on canvas — centered vertically
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

    const scale = Math.min(w, h) / 1080;

    // --- Calculate total content height to center everything ---
    const labelSize = Math.round(16 * scale);
    const aSize = Math.round(arabicSize * scale);
    const aLineH = aSize * 1.6;
    const tSize = Math.round(translationSize * scale);
    const tLineH = tSize * 1.5;
    const gap = 30 * scale;

    // Measure Arabic lines
    ctx.font = '600 ' + aSize + 'px serif';
    const arabicLines = measureTextLines(ctx, verse.text, w * 0.8);

    // Measure translation lines
    let translationLines = 0;
    if (showTranslation && verse.translation) {
      ctx.font = '400 italic ' + tSize + 'px system-ui, sans-serif';
      translationLines = measureTextLines(ctx, verse.translation, w * 0.75);
    }

    // Total height of all content blocks
    let totalHeight = labelSize; // surah label line
    totalHeight += gap; // space after label
    totalHeight += arabicLines * aLineH; // all arabic lines
    if (translationLines > 0) {
      totalHeight += gap; // space before translation
      totalHeight += translationLines * tLineH; // all translation lines
    }

    // Y cursor starts so the entire block is vertically centered
    // Using textBaseline 'top' so fillText draws DOWN from the Y coordinate
    ctx.textBaseline = 'top';
    let cursorY = (h - totalHeight) / 2;

    // Surah name — small label at top of centered block
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.font = '500 ' + labelSize + 'px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.direction = 'ltr';
    ctx.fillText(surah.englishName + ' - ' + t('studio.verse', lang) + ' ' + verse.numberInSurah, w / 2, cursorY);
    cursorY += labelSize + gap;

    // Arabic text
    ctx.fillStyle = '#ffffff';
    ctx.font = '600 ' + aSize + 'px serif';
    ctx.direction = 'rtl';
    ctx.textAlign = 'center';
    cursorY = wrapText(ctx, verse.text, w / 2, cursorY, w * 0.8, aLineH);

    // Translation
    if (showTranslation && verse.translation) {
      cursorY += gap * 0.5;
      ctx.direction = 'ltr';
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.font = '400 italic ' + tSize + 'px system-ui, sans-serif';
      wrapText(ctx, verse.translation, w / 2, cursorY, w * 0.75, tLineH);
    }

    // Reset baseline
    ctx.textBaseline = 'alphabetic';
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

  // Check if WebCodecs API is available and H.264 encoding works
  // ===== Video download: WebCodecs (primary) + MediaRecorder (fallback) =====

  // Helper: trigger file download
  const triggerBlobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = filename;
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 3000);
  };

  // Test WebCodecs by actually encoding a frame + audio chunk
  const probeWebCodecs = async (): Promise<{
    videoCodec: string; audioCodec: string; audioMux: 'aac' | 'opus';
    hw: 'prefer-hardware' | 'prefer-software' | 'no-preference';
  } | null> => {
    try {
      const VE = (globalThis as any).VideoEncoder;
      const AE = (globalThis as any).AudioEncoder;
      const VF = (globalThis as any).VideoFrame;
      const AD = (globalThis as any).AudioData;
      if (!VE || !AE || !VF || !AD) return null;

      // --- Test video encoder ---
      const vProfiles = [
        'avc1.42001e', 'avc1.42E01E', 'avc1.42001f',
        'avc1.4d001e', 'avc1.4d001f', 'avc1.640028',
      ];
      const hwModes: ('prefer-hardware' | 'prefer-software' | 'no-preference')[] = [
        'no-preference', 'prefer-hardware', 'prefer-software',
      ];
      let workingVC = '';
      let workingHW: 'prefer-hardware' | 'prefer-software' | 'no-preference' = 'no-preference';

      outer: for (const hw of hwModes) {
        for (const codec of vProfiles) {
          try {
            const sup = await VE.isConfigSupported({
              codec, width: format.width, height: format.height,
              bitrate: 4_000_000, framerate: 30,
              hardwareAcceleration: hw,
            });
            if (!sup || !sup.supported) continue;

            let gotOut = false;
            let gotErr = false;
            const te = new VE({
              output: () => { gotOut = true; },
              error: () => { gotErr = true; },
            });
            te.configure({
              codec, width: format.width, height: format.height,
              bitrate: 4_000_000, framerate: 30,
              hardwareAcceleration: hw,
            });
            if (te.state !== 'configured') { try { te.close(); } catch {} continue; }

            const tc = document.createElement('canvas');
            tc.width = format.width; tc.height = format.height;
            const tcx = tc.getContext('2d');
            if (tcx) tcx.fillRect(0, 0, 2, 2);
            const tf = new VF(tc, { timestamp: 0 });
            te.encode(tf, { keyFrame: true });
            tf.close();
            await te.flush();
            te.close();

            if (gotOut && !gotErr) { workingVC = codec; workingHW = hw; break outer; }
          } catch {}
        }
      }
      if (!workingVC) return null;

      // --- Test audio encoder ---
      let workingAC = '';
      let aMux: 'aac' | 'opus' = 'aac';
      for (const [enc, mux] of [['mp4a.40.2', 'aac'], ['opus', 'opus']] as const) {
        try {
          const sup = await AE.isConfigSupported({
            codec: enc, numberOfChannels: 2, sampleRate: 44100, bitrate: 128_000,
          });
          if (!sup || !sup.supported) continue;

          let gotOut = false;
          let gotErr = false;
          const te = new AE({
            output: () => { gotOut = true; },
            error: () => { gotErr = true; },
          });
          te.configure({ codec: enc, numberOfChannels: 2, sampleRate: 44100, bitrate: 128_000 });
          if (te.state !== 'configured') { try { te.close(); } catch {} continue; }

          const pcm = new Float32Array(1024 * 2);
          const ad = new AD({
            format: 'f32-planar' as const, sampleRate: 44100,
            numberOfFrames: 1024, numberOfChannels: 2,
            timestamp: 0, data: pcm,
          });
          te.encode(ad); ad.close();
          await te.flush(); te.close();
          if (gotOut && !gotErr) { workingAC = enc; aMux = mux as 'aac' | 'opus'; break; }
        } catch {}
      }
      if (!workingAC) return null;

      return { videoCodec: workingVC, audioCodec: workingAC, audioMux: aMux, hw: workingHW };
    } catch { return null; }
  };

  // Pre-fetch and decode all verse audio
  const prefetchAudio = async (
    onProgress: (p: number) => void,
  ): Promise<{ buffers: (AudioBuffer | null)[]; ctx: AudioContext }> => {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new AC({ sampleRate: 44100 });
    await ctx.resume();
    const buffers: (AudioBuffer | null)[] = [];
    for (let i = 0; i < verses.length; i++) {
      const v = verses[i];
      const url = getAudioUrl(reciter, surah.number, v.numberInSurah, v.number);
      try {
        const r = await fetch(url);
        const ab = await r.arrayBuffer();
        buffers.push(await ctx.decodeAudioData(ab));
      } catch { buffers.push(null); }
      onProgress(i / verses.length);
    }
    return { buffers, ctx };
  };

  // PATH A: WebCodecs offline encode — perfect MP4 with correct duration
  const webCodecsEncode = async (
    codecInfo: { videoCodec: string; audioCodec: string; audioMux: 'aac' | 'opus'; hw: string },
    audioBuffers: (AudioBuffer | null)[],
    bgImg: HTMLImageElement | null,
  ): Promise<Blob | null> => {
    try {
      const VE = (globalThis as any).VideoEncoder;
      const AE = (globalThis as any).AudioEncoder;
      const VF = (globalThis as any).VideoFrame;
      const AD = (globalThis as any).AudioData;

      const canvas = document.createElement('canvas');
      canvas.width = format.width; canvas.height = format.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      const muxTarget = new ArrayBufferTarget();
      const muxer = new Muxer({
        target: muxTarget,
        video: { codec: 'avc', width: format.width, height: format.height },
        audio: { codec: codecInfo.audioMux, numberOfChannels: 2, sampleRate: 44100 },
        fastStart: 'in-memory',
        firstTimestampBehavior: 'offset',
      });

      let encErr: string | null = null;

      const vEnc = new VE({
        output: (chunk: any, meta: any) => {
          try { muxer.addVideoChunk(chunk, meta); }
          catch (e: any) { if (!encErr) encErr = e.message; }
        },
        error: (e: any) => { if (!encErr) encErr = e.message; },
      });
      vEnc.configure({
        codec: codecInfo.videoCodec, width: format.width, height: format.height,
        bitrate: 4_000_000, framerate: 30,
        hardwareAcceleration: codecInfo.hw,
      });
      if (vEnc.state !== 'configured') { try { vEnc.close(); } catch {} return null; }

      const aEnc = new AE({
        output: (chunk: any, meta: any) => {
          try { muxer.addAudioChunk(chunk, meta); }
          catch (e: any) { if (!encErr) encErr = e.message; }
        },
        error: (e: any) => { if (!encErr) encErr = e.message; },
      });
      aEnc.configure({
        codec: codecInfo.audioCodec, numberOfChannels: 2, sampleRate: 44100, bitrate: 128_000,
      });
      if (aEnc.state !== 'configured') {
        try { vEnc.close(); } catch {}
        try { aEnc.close(); } catch {}
        return null;
      }

      const fps = 30;
      const fDur = Math.round(1_000_000 / fps);
      let vTs = 0;
      let aTs = 0;
      let nFrames = 0;

      for (let i = 0; i < verses.length; i++) {
        if (encErr) throw new Error(encErr);
        drawVerseOnCanvas(ctx, verses[i], format.width, format.height, bgImg);

        const ab = audioBuffers[i];
        const dur = ab ? ab.duration : 3;
        const nf = Math.ceil(dur * fps);

        // Video frames
        for (let f = 0; f < nf; f++) {
          while (vEnc.encodeQueueSize > 10) await new Promise(r => setTimeout(r, 1));
          const fr = new VF(canvas, { timestamp: vTs });
          vEnc.encode(fr, { keyFrame: nFrames % 60 === 0 });
          fr.close();
          vTs += fDur; nFrames++;
        }

        // Audio samples
        if (ab) {
          const nCh = Math.min(ab.numberOfChannels, 2);
          const L = ab.getChannelData(0);
          const R = nCh > 1 ? ab.getChannelData(1) : L;
          for (let o = 0; o < ab.length; o += 4096) {
            while (aEnc.encodeQueueSize > 10) await new Promise(r => setTimeout(r, 1));
            const cs = Math.min(4096, ab.length - o);
            const pl = new Float32Array(cs * 2);
            pl.set(L.subarray(o, o + cs), 0);
            pl.set(R.subarray(o, o + cs), cs);
            const ad = new AD({
              format: 'f32-planar' as const, sampleRate: 44100,
              numberOfFrames: cs, numberOfChannels: 2,
              timestamp: aTs, data: pl,
            });
            aEnc.encode(ad); ad.close();
            aTs += Math.round((cs / 44100) * 1_000_000);
          }
        } else {
          const ss = 3 * 44100;
          const sd = new Float32Array(ss * 2);
          const ad = new AD({
            format: 'f32-planar' as const, sampleRate: 44100,
            numberOfFrames: ss, numberOfChannels: 2,
            timestamp: aTs, data: sd,
          });
          aEnc.encode(ad); ad.close();
          aTs += 3_000_000;
        }

        // 300ms gap
        if (i < verses.length - 1) {
          const gf = Math.ceil(0.3 * fps);
          for (let f = 0; f < gf; f++) {
            while (vEnc.encodeQueueSize > 10) await new Promise(r => setTimeout(r, 1));
            const fr = new VF(canvas, { timestamp: vTs });
            vEnc.encode(fr, { keyFrame: false });
            fr.close();
            vTs += fDur; nFrames++;
          }
          const gs = Math.ceil(0.3 * 44100);
          const gd = new Float32Array(gs * 2);
          const ga = new AD({
            format: 'f32-planar' as const, sampleRate: 44100,
            numberOfFrames: gs, numberOfChannels: 2,
            timestamp: aTs, data: gd,
          });
          aEnc.encode(ga); ga.close();
          aTs += Math.round(0.3 * 1_000_000);
        }

        setDownloadProgress(Math.round(25 + (i / verses.length) * 65));
      }

      await vEnc.flush(); await aEnc.flush();
      vEnc.close(); aEnc.close();
      if (encErr) throw new Error(encErr);

      muxer.finalize();
      const buf = muxTarget.buffer;
      if (!buf || buf.byteLength < 1000) return null;
      return new Blob([buf], { type: 'video/mp4' });
    } catch { return null; }
  };

  // PATH B: MediaRecorder real-time fallback — plays fine, duration metadata may vary
  const mediaRecorderFallback = async (
    audioBuffers: (AudioBuffer | null)[],
    bgImg: HTMLImageElement | null,
  ): Promise<Blob | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = format.width; canvas.height = format.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      drawVerseOnCanvas(ctx, verses[0], format.width, format.height, bgImg);

      const vStream = canvas.captureStream(30);
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      const aCtx: AudioContext = new AC();
      await aCtx.resume();
      const dest = aCtx.createMediaStreamDestination();
      for (const t of dest.stream.getAudioTracks()) vStream.addTrack(t);

      const mimes = [
        'video/mp4;codecs=avc1.42001e,mp4a.40.2',
        'video/mp4;codecs=avc1',
        'video/mp4',
        'video/webm;codecs=vp8,opus',
        'video/webm',
      ];
      let mime = '';
      for (const m of mimes) {
        if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) { mime = m; break; }
      }
      if (!mime) { await aCtx.close(); return null; }

      const chunks: Blob[] = [];
      const rec = new MediaRecorder(vStream, { mimeType: mime, videoBitsPerSecond: 4_000_000 });
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      rec.start(1000); // emit data every 1s to reduce internal buffer
      setDownloadProgress(30);

      for (let i = 0; i < verses.length; i++) {
        drawVerseOnCanvas(ctx, verses[i], format.width, format.height, bgImg);
        const ab = audioBuffers[i];
        if (ab) {
          const src = aCtx.createBufferSource();
          src.buffer = ab;
          src.connect(dest);
          await new Promise<void>(resolve => { src.onended = () => resolve(); src.start(); });
        } else {
          await new Promise(r => setTimeout(r, 3000));
        }
        if (i < verses.length - 1) await new Promise(r => setTimeout(r, 300));
        setDownloadProgress(Math.round(30 + (i / verses.length) * 60));
      }

      // Pad 15 seconds of silence after last verse — TikTok trims ~14s from fMP4
      // Generate real silence audio so audio track extends to match video
      const silenceBuf = aCtx.createBuffer(1, aCtx.sampleRate * 15, aCtx.sampleRate);
      const silSrc = aCtx.createBufferSource();
      silSrc.buffer = silenceBuf;
      silSrc.connect(dest);
      await new Promise<void>(resolve => { silSrc.onended = () => resolve(); silSrc.start(); });

      setDownloadProgress(93);
      // Flush any buffered data before stopping
      if (typeof rec.requestData === 'function') {
        try { rec.requestData(); } catch {}
      }
      await new Promise(r => setTimeout(r, 200)); // let flush complete
      const blob: Blob = await new Promise(resolve => {
        rec.onstop = () => resolve(new Blob(chunks, { type: mime }));
        rec.stop();
      });
      await aCtx.close();
      return blob;
    } catch { return null; }
  };

  // Remux fragmented MP4 → clean MP4 (copy video, re-encode audio to AAC)
  const remuxToFlatMp4 = async (blob: Blob): Promise<Blob> => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const ffmpeg = new FFmpeg();
    await ffmpeg.load({
      coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
      wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm',
    });
    const inputData = new Uint8Array(await blob.arrayBuffer());
    await ffmpeg.writeFile('input.mp4', inputData);
    // Copy video stream as-is, re-encode audio to AAC for maximum compatibility
    await ffmpeg.exec([
      '-fflags', '+genpts',
      '-i', 'input.mp4',
      '-c:v', 'copy',
      '-c:a', 'aac', '-b:a', '128k',
      '-map_metadata', '-1',
      '-movflags', '+faststart',
      '-avoid_negative_ts', 'make_zero',
      'output.mp4'
    ]);
    const outputData = await ffmpeg.readFile('output.mp4');
    ffmpeg.terminate();
    const bytes = outputData instanceof Uint8Array ? outputData : new TextEncoder().encode(outputData as string);
    return new Blob([bytes.buffer as ArrayBuffer], { type: 'video/mp4' });
  };

  // Main download orchestrator
  async function downloadVideo() {
    setIsDownloading(true);
    setDownloadType('video');
    setDownloadProgress(0);

    try {
      // Step 1: Probe WebCodecs
      setDownloadProgress(1);
      const codecInfo = await probeWebCodecs();
      setDownloadProgress(3);

      // Step 2: Pre-fetch audio
      const bgImg = await loadBgImageAsync();
      const { buffers: audioBuffers, ctx: tempCtx } = await prefetchAudio(
        (p) => setDownloadProgress(Math.round(3 + p * 20)),
      );
      await tempCtx.close();
      setDownloadProgress(24);

      // Step 3: Try WebCodecs path first
      let blob: Blob | null = null;
      let usedMediaRecorder = false;
      if (codecInfo) {
        blob = await webCodecsEncode(codecInfo, audioBuffers, bgImg);
      }

      // Step 4: Fall back to MediaRecorder if WebCodecs failed
      if (!blob) {
        usedMediaRecorder = true;
        setDownloadProgress(28);
        blob = await mediaRecorderFallback(audioBuffers, bgImg);
      }

      if (!blob || blob.size < 1000) {
        alert('Could not create video. Please try using Chrome browser for best results.');
        setIsDownloading(false); setDownloadType(''); return;
      }

      // Step 5: Remux MediaRecorder fMP4 → flat MP4 (fixes TikTok/social media)
      if (usedMediaRecorder && blob.type.includes('mp4')) {
        setDownloadProgress(94);
        try {
          blob = await remuxToFlatMp4(blob);
        } catch {
          // ffmpeg remux failed — use raw blob (works on most platforms)
        }
      }

      setDownloadProgress(98);
      const ext = blob.type.includes('webm') ? '.webm' : '.mp4';
      triggerBlobDownload(blob, surah.englishName.replace(/\s+/g, '-') + '-recitation' + ext);
      setDownloadProgress(100);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      alert('Video creation failed:\n\n' + msg);
    }
    setTimeout(() => { setIsDownloading(false); setDownloadType(''); }, 500);
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

        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-56px)]">
        {/* Sidebar — visible always, scrolls below preview on mobile, side panel on desktop */}
        <div className="order-2 lg:order-1 overflow-y-auto border-t lg:border-t-0 lg:border-r flex-shrink-0" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border)', width: '320px', maxWidth: '100%' }} dir="ltr">
          <div className="p-3 space-y-3">
            {/* Format */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>{t('studio.format', lang)}</label>
              <div className="grid grid-cols-4 gap-1.5">
                {videoFormats.map(function(f, i) {
                  return (
                    <button key={f.id} onClick={function() { setFormatIdx(i); }} className="flex flex-col items-center gap-1 p-2 rounded-xl transition-all text-xs font-bold" style={{ background: i === formatIdx ? 'var(--accent-light)' : 'var(--bg-card)', color: i === formatIdx ? 'var(--accent)' : 'var(--text-secondary)', border: i === formatIdx ? '1.5px solid var(--accent)' : '1.5px solid var(--border)' }}>
                      <div className="flex items-center justify-center" style={{ width: 28, height: 28 }}>
                        <div className="border-2 rounded-sm" style={{ width: f.id === 'landscape' ? 26 : f.id === 'portrait' ? 16 : f.id === 'square' ? 22 : 20, height: f.id === 'landscape' ? 16 : f.id === 'portrait' ? 26 : f.id === 'square' ? 22 : 25, borderColor: i === formatIdx ? 'var(--accent)' : 'var(--text-secondary)' }} />
                      </div>
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
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>{t('studio.reciter', lang)}</label>
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
              <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: 'var(--text-secondary)' }}>{t('studio.background', lang)}</label>
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

            {/* Download instructions */}
            <details className="pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
              <summary className="cursor-pointer text-xs font-semibold flex items-center gap-1.5 select-none" style={{ color: 'var(--accent)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
                {t('studio.downloadTip.title', lang)}
              </summary>
              <ol className="mt-2 space-y-1 text-xs pl-4" style={{ color: 'var(--text-secondary)', listStyleType: 'decimal' }}>
                <li>{t('studio.downloadTip.step1', lang)}</li>
                <li>{t('studio.downloadTip.step2', lang)}</li>
                <li>{t('studio.downloadTip.step3', lang)}</li>
                <li>{t('studio.downloadTip.step4', lang)}</li>
              </ol>
            </details>

            {/* Download buttons */}
            <div className="space-y-2 pt-2">
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
        <div className="order-1 lg:order-2 flex-1 flex flex-col overflow-hidden">
          {/* Preview — compact on mobile so controls are visible */}
          <div className="flex items-center justify-center p-3 sm:p-6 overflow-y-auto max-h-[45vh] lg:max-h-[70vh]" style={{ background: 'var(--bg-primary)' }}>
            <div className="rounded-2xl overflow-hidden shadow-2xl" style={{ aspectRatio: format.ratio, maxHeight: '100%', maxWidth: '100%', width: isDesktop ? (format.id === 'portrait' ? 320 : format.id === 'square' ? 400 : format.id === 'social' ? 360 : 560) : (format.id === 'portrait' ? 200 : format.id === 'square' ? 240 : format.id === 'social' ? 220 : 320) }}>
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

          </div>
        </div>
      </div>
    </div>
  );
}
