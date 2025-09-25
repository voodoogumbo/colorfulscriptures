// app/page.tsx
'use client';

import React, { Suspense } from 'react';

const AnalysisResults = React.lazy(
  () => import('../components/AnalysisResults')
);
const ColorSchemeEditor = React.lazy(
  () => import('../components/ColorSchemeEditor')
);
const ScriptureSelector = React.lazy(
  () => import('../components/ScriptureSelector')
);
import { useColorScheme } from '../hooks/useColorScheme';
import { useDropdownState } from '../hooks/useDropdownState';
import { useScriptureAnalysis } from '../hooks/useScriptureAnalysis';
import { useScriptureSelection } from '../hooks/useScriptureSelection';
import scriptureMetadata from '../lib/scripture_metadata.json';

// --- Type Definitions ---
type ScriptureMetadata = {
  [volumeTitle: string]: string[];
};

// --- Component ---
export default function ScriptureColoringPage() {
  const metadata: ScriptureMetadata = scriptureMetadata;

  // --- Custom Hooks ---
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
  } = useScriptureSelection(metadata);

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

  const { openReferenceDropdown, setOpenReferenceDropdown } =
    useDropdownState();

  // --- Event Handlers ---
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
    handleAnalyzeScripture(
      event,
      selectedVolume,
      selectedBook,
      selectedChapter,
      selectedVerse
    );
  };

  // --- Render ---
  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-950 text-slate-100'>
      <div
        className='pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-indigo-600/30 blur-[160px]'
        aria-hidden='true'
      ></div>
      <div
        className='pointer-events-none absolute bottom-[-14rem] right-[-12rem] h-[28rem] w-[28rem] rounded-full bg-fuchsia-500/20 blur-[140px]'
        aria-hidden='true'
      ></div>

      <a
        href='https://skellyfish.com'
        target='_blank'
        rel='noopener noreferrer'
        className='absolute right-4 top-4 hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300 shadow-sm transition hover:border-indigo-400/70 hover:text-indigo-200 sm:flex'
      >
        <span className='text-slate-400'>Brought to you by</span>
        <span className='flex items-center gap-1 text-indigo-300'>
          <svg
            className='h-4 w-4 text-indigo-300'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.4'
            strokeLinecap='round'
            strokeLinejoin='round'
            aria-hidden='true'
          >
            <path d='M7.5 9.5C7.5 6.46 9.96 4 13 4s5.5 2.46 5.5 5.5v1.2c0 .88-.72 1.6-1.6 1.6-.7 0-1.3-.46-1.5-1.12-.4 2.35-2.2 4.07-4.4 4.07s-4-1.72-4.4-4.07c-.2.66-.8 1.12-1.5 1.12-.88 0-1.6-.72-1.6-1.6V9.5Z' />
            <path d='M9 16v1c0 1.66 1.34 3 3 3s3-1.34 3-3v-1' />
            <path d='M9 20.5c.5.5 1.5.9 3 .9s2.5-.4 3-.9' />
            <path d='M8 13.5c-.2 1-.7 2-1.5 2.8' />
            <path d='M16 13.5c.2 1 .7 2 1.5 2.8' />
          </svg>
          Skellyfish Publishing
        </span>
      </a>

      <div className='relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 lg:px-8 lg:pt-20'>
        <section className='mx-auto mb-12 max-w-3xl text-center sm:mb-16'>
          <span className='inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300 shadow-sm ring-1 ring-indigo-500/20'>
            Inspired study companion
          </span>
          <h1 className='mt-4 bg-gradient-to-r from-sky-300 via-indigo-200 to-fuchsia-300 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-5xl'>
            Color every scripture with purpose
          </h1>
          <p className='mt-4 text-lg text-slate-300'>
            Build a custom highlighter palette, explore verses, and let the
            analysis reveal the story behind each shade.
          </p>
        </section>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-10'>
          <Suspense
            fallback={
              <div className='flex h-64 items-center justify-center rounded-lg bg-slate-900/50 animate-pulse'>
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
                <div className='flex h-32 items-center justify-center rounded-lg bg-slate-900/50 animate-pulse'>
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
                error={error}
                isReferenceLoading={isReferenceLoading}
                referenceError={referenceError}
                openReferenceDropdown={openReferenceDropdown}
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
                <div className='flex h-48 items-center justify-center rounded-lg bg-slate-900/50 animate-pulse'>
                  <div className='text-slate-400'>
                    Loading analysis results...
                  </div>
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
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
