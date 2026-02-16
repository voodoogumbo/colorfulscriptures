'use client';

import React, { Suspense, useRef } from 'react';

const AnalysisResults = React.lazy(() => import('./AnalysisResults'));
const ColorSchemeEditor = React.lazy(() => import('./ColorSchemeEditor'));
const ScriptureSelector = React.lazy(() => import('./ScriptureSelector'));
import { useColorScheme } from '../hooks/useColorScheme';
import { useDropdownState } from '../hooks/useDropdownState';
import { useScriptureAnalysis } from '../hooks/useScriptureAnalysis';
import { useScriptureSelection } from '../hooks/useScriptureSelection';

type VolumeMetadata = {
  [volumeTitle: string]: string[];
};
type VersesByChapter = {
  [bookTitle: string]: Record<string, number>;
};

interface ScriptureAppProps {
  metadata: VolumeMetadata;
  versesByChapter: VersesByChapter;
}

export default function ScriptureApp({
  metadata,
  versesByChapter,
}: ScriptureAppProps) {
  const lastAnalysisArgsRef = useRef<{
    volume: string;
    book: string;
    chapter: string;
    verse: string;
  } | null>(null);

  const { colorScheme, setColorScheme } = useColorScheme();

  const {
    selectedVolume,
    selectedBook,
    selectedChapter,
    selectedVerse,
    availableChapters,
    availableVerses,
    isReferenceLoading,
    referenceError,
    handleVolumeChange,
    handleBookChange,
    handleChapterChange,
    handleVerseChange,
  } = useScriptureSelection(metadata, versesByChapter);

  const {
    isLoading,
    error,
    result,
    hasAnalyzed,
    previewScriptureText,
    typedScriptureText,
    isTyping,
    pendingReference,
    clearError,
    handleAnalyzeScripture,
  } = useScriptureAnalysis(colorScheme);

  const { openReferenceDropdown, setOpenReferenceDropdown, containerRef } =
    useDropdownState();

  // React Compiler auto-memoizes these handlers
  const handleVolumeChangeWithClear = (volume: string) => {
    handleVolumeChange(volume);
    clearError();
  };

  const handleBookChangeWithClear = (book: string) => {
    handleBookChange(book);
    clearError();
  };

  const handleChapterChangeWithClear = (chapter: string) => {
    handleChapterChange(chapter);
    clearError();
  };

  const handleVerseChangeWithClear = (verse: string) => {
    handleVerseChange(verse);
    clearError();
  };

  const handleAnalyze = (event: React.FormEvent<HTMLFormElement>) => {
    lastAnalysisArgsRef.current = {
      volume: selectedVolume,
      book: selectedBook,
      chapter: selectedChapter,
      verse: selectedVerse,
    };
    handleAnalyzeScripture(
      event,
      selectedVolume,
      selectedBook,
      selectedChapter,
      selectedVerse
    );
  };

  const handleRetry = () => {
    const args = lastAnalysisArgsRef.current;
    if (!args) return;
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;
    handleAnalyzeScripture(
      syntheticEvent,
      args.volume,
      args.book,
      args.chapter,
      args.verse
    );
  };

  return (
    <div className='grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10'>
      <Suspense
        fallback={
          <div className='flex h-64 items-center justify-center rounded-3xl bg-slate-900/50 animate-pulse lg:col-span-2'>
            <div className='text-slate-400'>Loading color editor...</div>
          </div>
        }
      >
        <ColorSchemeEditor
          colorScheme={colorScheme}
          onColorSchemeChange={setColorScheme}
        />
      </Suspense>

      <div className='space-y-8 lg:col-span-3'>
        <Suspense
          fallback={
            <div className='flex h-32 items-center justify-center rounded-3xl bg-slate-900/50 animate-pulse'>
              <div className='text-slate-400'>
                Loading scripture selector...
              </div>
            </div>
          }
        >
          <ScriptureSelector
            metadata={metadata}
            selectedVolume={selectedVolume}
            selectedBook={selectedBook}
            selectedChapter={selectedChapter}
            selectedVerse={selectedVerse}
            availableChapters={availableChapters}
            availableVerses={availableVerses}
            isLoading={isLoading}
            isReferenceLoading={isReferenceLoading}
            referenceError={referenceError}
            openReferenceDropdown={openReferenceDropdown}
            formRef={containerRef}
            onVolumeChange={handleVolumeChangeWithClear}
            onBookChange={handleBookChangeWithClear}
            onChapterChange={handleChapterChangeWithClear}
            onVerseChange={handleVerseChangeWithClear}
            onOpenReferenceDropdownChange={setOpenReferenceDropdown}
            onAnalyze={handleAnalyze}
          />
        </Suspense>

        <Suspense
          fallback={
            <div className='flex h-48 items-center justify-center rounded-3xl bg-slate-900/50 animate-pulse'>
              <div className='text-slate-400'>Loading analysis results...</div>
            </div>
          }
        >
          <AnalysisResults
            isLoading={isLoading}
            error={error}
            result={result}
            hasAnalyzed={hasAnalyzed}
            previewScriptureText={previewScriptureText}
            typedScriptureText={typedScriptureText}
            isTyping={isTyping}
            pendingReference={pendingReference}
            onRetry={handleRetry}
          />
        </Suspense>
      </div>
    </div>
  );
}
