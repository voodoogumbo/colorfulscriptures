'use client';

import React, { FormEvent, ChangeEvent, useRef } from 'react';

interface ScriptureSelectorProps {
  metadata: Record<string, string[]>;
  selectedVolume: string;
  selectedBook: string;
  selectedChapter: string;
  selectedVerse: string;
  availableChapters: string[];
  availableVerses: string[];
  isLoading: boolean;
  error: string | null;
  isReferenceLoading: boolean;
  referenceError: string | null;
  openReferenceDropdown: 'volume' | 'book' | null;
  onVolumeChange: (volume: string) => void;
  onBookChange: (book: string) => void;
  onChapterChange: (chapter: string) => void;
  onVerseChange: (verse: string) => void;
  onOpenReferenceDropdownChange: (dropdown: 'volume' | 'book' | null) => void;
  onAnalyze: (event: FormEvent<HTMLFormElement>) => void;
}

export default function ScriptureSelector({
  metadata,
  selectedVolume,
  selectedBook,
  selectedChapter,
  selectedVerse,
  availableChapters,
  availableVerses,
  isLoading,
  error,
  isReferenceLoading,
  referenceError,
  openReferenceDropdown,
  onVolumeChange,
  onBookChange,
  onChapterChange,
  onVerseChange,
  onOpenReferenceDropdownChange,
  onAnalyze,
}: ScriptureSelectorProps) {
  const referenceDropdownRef = useRef<HTMLFormElement>(null);

  const volumeList = Object.keys(metadata);
  const bookList = selectedVolume ? metadata[selectedVolume] || [] : [];

  const handleVolumeSelect = (volume: string) => {
    onVolumeChange(volume);
    onOpenReferenceDropdownChange(null);
  };

  const handleBookSelect = (book: string) => {
    onBookChange(book);
    onOpenReferenceDropdownChange(null);
  };

  return (
    <section className='rounded-3xl border border-slate-800 bg-slate-950/85 p-6 text-slate-100 shadow-2xl shadow-indigo-950/40 backdrop-blur-sm sm:p-8'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between'>
        <div>
          <h2 className='text-xl font-semibold text-slate-100'>
            Analyze a Verse
          </h2>
          <p className='mt-1 text-sm text-slate-400'>
            Choose a verse and AI will help find colors that fit.
          </p>
        </div>
      </div>
      <form
        onSubmit={onAnalyze}
        className='mt-6 space-y-5'
        ref={referenceDropdownRef}
      >
        <div className='grid gap-5 sm:grid-cols-2'>
          <div className='sm:col-span-1 space-y-2'>
            <label
              htmlFor='volumeSelectButton'
              className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400'
            >
              <span>Volume</span>
              {selectedVolume && (
                <span className='text-slate-500'>Selected</span>
              )}
            </label>
            <div className='relative'>
              <button
                id='volumeSelectButton'
                type='button'
                onClick={() =>
                  onOpenReferenceDropdownChange(
                    openReferenceDropdown === 'volume' ? null : 'volume'
                  )
                }
                disabled={isLoading}
                className='flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-100 shadow-sm transition hover:border-indigo-400 hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50'
                aria-haspopup='listbox'
                aria-expanded={openReferenceDropdown === 'volume'}
              >
                <span className='truncate text-left'>
                  {selectedVolume || 'Select volume'}
                </span>
                <svg
                  className='h-4 w-4 flex-shrink-0 text-slate-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              {openReferenceDropdown === 'volume' && (
                <div
                  className='absolute left-0 z-50 mt-3 w-full origin-top-left rounded-2xl border border-slate-700 bg-slate-900 p-2 text-slate-100 shadow-2xl ring-1 ring-indigo-500/30'
                  role='listbox'
                  onMouseDown={e => e.preventDefault()}
                >
                  <div className='max-h-60 space-y-1 overflow-auto'>
                    {volumeList.map(volTitle => (
                      <button
                        key={volTitle}
                        type='button'
                        onClick={() => handleVolumeSelect(volTitle)}
                        className='flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-indigo-500/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'
                        role='option'
                        aria-selected={selectedVolume === volTitle}
                      >
                        {volTitle}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className='sm:col-span-1 space-y-2'>
            <label
              htmlFor='bookSelectButton'
              className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400'
            >
              <span>Book</span>
              {selectedBook && <span className='text-slate-500'>Selected</span>}
            </label>
            <div className='relative'>
              <button
                id='bookSelectButton'
                type='button'
                onClick={() =>
                  onOpenReferenceDropdownChange(
                    openReferenceDropdown === 'book' ? null : 'book'
                  )
                }
                disabled={isLoading || !selectedVolume || bookList.length === 0}
                className='flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm font-medium text-slate-100 shadow-sm transition hover:border-indigo-400 hover:text-indigo-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50'
                aria-haspopup='listbox'
                aria-expanded={openReferenceDropdown === 'book'}
              >
                <span className='truncate text-left'>
                  {selectedBook || 'Select book'}
                </span>
                <svg
                  className='h-4 w-4 flex-shrink-0 text-slate-400'
                  xmlns='http://www.w3.org/2000/svg'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              {openReferenceDropdown === 'book' && (
                <div
                  className='absolute left-0 z-50 mt-3 w-full origin-top-left rounded-2xl border border-slate-700 bg-slate-900 p-2 text-slate-100 shadow-2xl ring-1 ring-indigo-500/30'
                  role='listbox'
                  onMouseDown={e => e.preventDefault()}
                >
                  <div className='max-h-60 space-y-1 overflow-auto'>
                    {bookList.map(bookTitle => (
                      <button
                        key={bookTitle}
                        type='button'
                        onClick={() => handleBookSelect(bookTitle)}
                        className='flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-200 transition hover:bg-indigo-500/30 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400'
                        role='option'
                        aria-selected={selectedBook === bookTitle}
                      >
                        {bookTitle}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className='grid gap-5 sm:grid-cols-2'>
          <div className='space-y-2'>
            <label
              htmlFor='chapterSelect'
              className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400'
            >
              <span>Chapter</span>
              {selectedChapter && (
                <span className='text-slate-500'>Chosen</span>
              )}
            </label>
            <div className='relative'>
              <select
                id='chapterSelect'
                name='chapterSelect'
                value={selectedChapter}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onChapterChange(event.target.value)
                }
                className='w-full appearance-none rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 pr-10 text-sm text-slate-100 shadow-sm transition focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50'
                disabled={
                  isLoading ||
                  isReferenceLoading ||
                  !selectedBook ||
                  availableChapters.length === 0
                }
                required
              >
                <option value='' disabled>
                  {isReferenceLoading
                    ? 'Loading chapters...'
                    : 'Select chapter'}
                </option>
                {availableChapters.map(chapter => (
                  <option key={chapter} value={chapter}>
                    {chapter}
                  </option>
                ))}
              </select>
              <svg
                className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
          </div>
          <div className='space-y-2'>
            <label
              htmlFor='verseSelect'
              className='flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400'
            >
              <span>Verse</span>
              {selectedVerse && <span className='text-slate-500'>Chosen</span>}
            </label>
            <div className='relative'>
              <select
                id='verseSelect'
                name='verseSelect'
                value={selectedVerse}
                onChange={(event: ChangeEvent<HTMLSelectElement>) =>
                  onVerseChange(event.target.value)
                }
                className='w-full appearance-none rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-3 pr-10 text-sm text-slate-100 shadow-sm transition focus:border-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:opacity-50'
                disabled={
                  isLoading ||
                  isReferenceLoading ||
                  !selectedBook ||
                  !selectedChapter ||
                  availableVerses.length === 0
                }
                required
              >
                <option value='' disabled>
                  {selectedChapter ? 'Select verse' : 'Select chapter first'}
                </option>
                {availableVerses.map(verse => (
                  <option key={verse} value={verse}>
                    {verse}
                  </option>
                ))}
              </select>
              <svg
                className='pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path
                  fillRule='evenodd'
                  d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
          </div>
        </div>

        <div className='flex justify-center pt-2'>
          <button
            type='submit'
            disabled={
              isLoading ||
              !selectedVolume ||
              !selectedBook ||
              !selectedChapter ||
              !selectedVerse ||
              isReferenceLoading
            }
            className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:from-indigo-400 hover:via-violet-400 hover:to-fuchsia-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:cursor-not-allowed disabled:from-slate-600 disabled:via-slate-600 disabled:to-slate-600'
          >
            {isLoading ? 'Analyzing...' : 'Color Scripture'}
            {!isLoading && (
              <svg
                className='h-4 w-4'
                viewBox='0 0 20 20'
                fill='currentColor'
                aria-hidden='true'
              >
                <path d='M12.293 3.293a1 1 0 011.414 0l4.999 5a1 1 0 010 1.414l-5 5A1 1 0 0111 14.999V11H3a1 1 0 01-1-1V9a1 1 0 011-1h8V4.999a1 1 0 011.293-.706z' />
              </svg>
            )}
          </button>
        </div>
      </form>

      {referenceError && (
        <p className='mt-4 rounded-2xl border border-amber-400/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-200'>
          {referenceError}
        </p>
      )}

      {error && (
        <p className='mt-4 rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-200'>
          Error: {error}. Please check your selection or try again.
        </p>
      )}
    </section>
  );
}
