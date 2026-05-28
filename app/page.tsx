'use client';

import React, { useState } from 'react';
import { Surah, Verse, ViewType } from '../lib/types';
import SurahBrowser from '../components/SurahBrowser';
import VerseSelector from '../components/VerseSelector';
import RecitationStudio from '../components/RecitationStudio';

export default function Home() {
  const [view, setView] = useState<ViewType>('browse');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedVerses, setSelectedVerses] = useState<Verse[]>([]);

  const handleSelectSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setView('select');
  };

  const handleOpenStudio = (verses: Verse[]) => {
    setSelectedVerses(verses);
    setView('studio');
  };

  const handleBackToBrowse = () => {
    setView('browse');
    setSelectedSurah(null);
    setSelectedVerses([]);
  };

  const handleBackToVerses = () => {
    setView('select');
    setSelectedVerses([]);
  };

  if (view === 'studio' && selectedSurah && selectedVerses.length > 0) {
    return (
      <RecitationStudio
        surah={selectedSurah}
        verses={selectedVerses}
        onBack={handleBackToVerses}
      />
    );
  }

  if (view === 'select' && selectedSurah) {
    return (
      <VerseSelector
        surah={selectedSurah}
        onBack={handleBackToBrowse}
        onOpenStudio={handleOpenStudio}
      />
    );
  }

  return <SurahBrowser onSelectSurah={handleSelectSurah} />;
}
