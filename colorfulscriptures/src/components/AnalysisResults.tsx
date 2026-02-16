'use client';

import React, { useMemo, useEffect, useRef } from 'react';

const highlightPalette: Record<
  string,
  { background: string; textColor: string; borderColor: string }
> = {
  red: {
    background: 'rgba(239, 68, 68, 0.2)',
    textColor: '#ffffff',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  orange: {
    background: 'rgba(249, 115, 22, 0.2)',
    textColor: '#ffffff',
    borderColor: 'rgba(249, 115, 22, 0.35)',
  },
  yellow: {
    background: 'rgba(234, 179, 8, 0.25)',
    textColor: '#422006',
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  green: {
    background: 'rgba(34, 197, 94, 0.2)',
    textColor: '#ffffff',
    borderColor: 'rgba(34, 197, 94, 0.35)',
  },
  lightblue: {
    background: 'rgba(59, 130, 246, 0.18)',
    textColor: '#ffffff',
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  blue: {
    background: 'rgba(37, 99, 235, 0.2)',
    textColor: '#ffffff',
    borderColor: 'rgba(37, 99, 235, 0.35)',
  },
  purple: {
    background: 'rgba(168, 85, 247, 0.2)',
    textColor: '#ffffff',
    borderColor: 'rgba(168, 85, 247, 0.35)',
  },
  pink: {
    background: 'rgba(236, 72, 153, 0.18)',
    textColor: '#ffffff',
    borderColor: 'rgba(236, 72, 153, 0.3)',
  },
  brown: {
    background: 'rgba(120, 63, 4, 0.25)',
    textColor: '#ffffff',
    borderColor: 'rgba(120, 63, 4, 0.4)',
  },
  white: {
    background: 'rgba(229, 231, 235, 0.8)',
    textColor: '#1e293b',
    borderColor: 'rgba(209, 213, 219, 0.9)',
  },
  gray: {
    background: 'rgba(107, 114, 128, 0.25)',
    textColor: '#ffffff',
    borderColor: 'rgba(107, 114, 128, 0.4)',
  },
  black: {
    background: 'rgba(17, 24, 39, 0.75)',
    textColor: '#ffffff',
    borderColor: 'rgba(17, 24, 39, 0.9)',
  },
};

function resolvePalette(colorValue: string) {
  return (
    highlightPalette[colorValue] ?? {
      background: 'rgba(148, 163, 184, 0.2)',
      textColor: '#ffffff',
      borderColor: 'rgba(148, 163, 184, 0.4)',
    }
  );
}

interface AnalysisResultDisplay {
  colorLabel: string;
  colorMeaning: string;
  justification: string;
  colorValue: string;
  confidence: number;
}

interface PageResultState {
  scriptureText: string | null;
  analysis: AnalysisResultDisplay[];
  primaryThemeReasoning: string | null;
  analyzedReference: {
    book: string;
    chapter: number;
    verse: number;
  };
}

interface AnalysisResultsProps {
  isLoading: boolean;
  error: string | null;
  result: PageResultState | null;
  hasAnalyzed: boolean;
  previewScriptureText: string | null;
  typedScriptureText: string;
  isTyping: boolean;
  pendingReference: PageResultState['analyzedReference'] | null;
  onRetry?: () => void;
}

export default function AnalysisResults({
  isLoading,
  error,
  result,
  hasAnalyzed,
  previewScriptureText,
  typedScriptureText,
  isTyping,
  pendingReference,
  onRetry,
}: AnalysisResultsProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const activeReference = result?.analyzedReference ?? pendingReference;
  const shouldShowTypedPreview =
    !result &&
    !!previewScriptureText &&
    (typedScriptureText.length > 0 || isTyping);

  // Scroll into view when loading starts or results arrive
  useEffect(() => {
    if (isLoading || result) {
      sectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [isLoading, result]);

  const normalizedAnalysis = useMemo<
    Array<AnalysisResultDisplay & { normalizedConfidence: number }>
  >(() => {
    if (!result?.analysis?.length) return [];

    const total = result.analysis.reduce((sum, item) => {
      const value = Number(item.confidence);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);

    if (total <= 0) {
      return result.analysis.map(item => ({
        ...item,
        normalizedConfidence: 0,
      }));
    }

    let remainder = 100;
    return result.analysis.map((item, index) => {
      const value = Number(item.confidence);
      const ratio = Number.isFinite(value) ? value / total : 0;
      let normalized = Math.round(ratio * 100);
      normalized = Math.max(0, Math.min(100, normalized));
      if (index === result.analysis.length - 1) {
        normalized = Math.max(0, Math.min(100, remainder));
      } else {
        remainder -= normalized;
        if (remainder < 0) {
          remainder = 0;
        }
      }
      return { ...item, normalizedConfidence: normalized };
    });
  }, [result]);

  const topRanked = normalizedAnalysis.slice(0, 2);
  const primaryAnalysis = topRanked[0];
  const primaryPalette = resolvePalette(primaryAnalysis?.colorValue ?? '');
  const primaryColorValue = primaryAnalysis?.colorValue ?? '#6366f1';

  return (
    <section
      ref={sectionRef}
      className='rounded-3xl border border-slate-800 bg-slate-950/85 p-6 text-slate-100 shadow-2xl shadow-indigo-950/40 backdrop-blur-sm sm:p-8'
      aria-busy={isLoading}
    >
      <h2 className='text-xl font-semibold text-slate-100'>Analysis Results</h2>
      <div className='mt-6 space-y-6' aria-live='polite' aria-atomic='false'>
        {shouldShowTypedPreview && (
          <div className='space-y-3'>
            <div className='text-sm font-medium uppercase tracking-wide text-indigo-300'>
              Scripture preview
            </div>
            <div className='rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-inner sm:p-8'>
              {activeReference && (
                <h3 className='text-base font-semibold text-slate-100'>
                  {activeReference.book} {activeReference.chapter}:
                  {activeReference.verse}
                </h3>
              )}
              <blockquote className='mt-3 text-lg leading-relaxed text-slate-100 whitespace-pre-wrap'>
                {typedScriptureText}
                {isTyping && (
                  <span
                    className='ml-1 inline-block h-5 w-[0.4rem] animate-pulse bg-slate-100 align-baseline'
                    aria-hidden='true'
                  ></span>
                )}
              </blockquote>
            </div>
            {isLoading && (
              <p
                className='flex items-center gap-2 text-sm text-indigo-300'
                role='status'
              >
                <svg
                  className='h-4 w-4 animate-spin'
                  viewBox='0 0 24 24'
                  fill='none'
                  aria-hidden='true'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  />
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </svg>
                Finding the best color match for your scripture...
              </p>
            )}
          </div>
        )}

        {isLoading && !shouldShowTypedPreview && (
          <div
            className='flex items-center gap-3 rounded-2xl border border-dashed border-indigo-500/40 bg-indigo-500/10 px-4 py-4'
            role='status'
          >
            <svg
              className='h-5 w-5 animate-spin text-indigo-300'
              viewBox='0 0 24 24'
              fill='none'
              aria-hidden='true'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              />
            </svg>
            <p className='text-sm font-medium text-indigo-200'>
              Finding the best color match for your scripture...
            </p>
          </div>
        )}

        {!isLoading && error && (
          <div
            className='rounded-2xl border border-red-500/50 bg-red-500/10 px-4 py-3'
            role='alert'
          >
            <p className='text-sm text-red-200'>
              Error: {error}. Please check your selection or try again.
            </p>
            {onRetry && (
              <button
                type='button'
                onClick={onRetry}
                className='mt-3 inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-2 text-sm font-medium text-red-200 transition hover:border-red-400/60 hover:bg-red-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400'
              >
                <svg
                  className='h-4 w-4'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311V15a.75.75 0 01-1.5 0v-3.5a.75.75 0 01.75-.75H8.55a.75.75 0 010 1.5H7.127l.17.17a4 4 0 006.703-1.79.75.75 0 011.312.724zM4.688 8.576a5.5 5.5 0 019.201-2.466l.312.311V5a.75.75 0 011.5 0v3.5a.75.75 0 01-.75.75H11.45a.75.75 0 010-1.5h1.423l-.17-.17a4 4 0 00-6.703 1.79.75.75 0 01-1.312-.724z'
                    clipRule='evenodd'
                  />
                </svg>
                Try again
              </button>
            )}
          </div>
        )}

        {!isLoading && !error && !result && !hasAnalyzed && (
          <p className='rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300'>
            Select a scripture verse above and click Color Scripture to see the
            analysis.
          </p>
        )}

        {!isLoading && !error && !result && hasAnalyzed && (
          <div className='rounded-2xl border border-amber-400/60 bg-amber-500/10 px-4 py-4'>
            <p className='text-sm text-amber-200'>
              Analysis complete, but no specific results were returned this
              time.
            </p>
            {onRetry && (
              <button
                type='button'
                onClick={onRetry}
                className='mt-3 inline-flex items-center gap-2 rounded-lg border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm font-medium text-amber-200 transition hover:border-amber-400/60 hover:bg-amber-500/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'
              >
                Try again
              </button>
            )}
          </div>
        )}

        {!isLoading && result && (
          <div className='space-y-6'>
            {result.scriptureText && (
              <div className='space-y-4'>
                <div className='text-sm font-medium uppercase tracking-wide text-indigo-300'>
                  Verse insight
                </div>
                <div
                  className='rounded-3xl border bg-slate-900/70 shadow-inner'
                  style={{
                    borderColor:
                      primaryPalette.borderColor || primaryColorValue,
                  }}
                >
                  {topRanked.length > 0 && (
                    <div className='flex flex-wrap gap-2 border-b border-slate-800/60 px-5 py-4'>
                      {topRanked.map(item => {
                        const palette = resolvePalette(item.colorValue);
                        const confidence = Math.max(
                          0,
                          Math.min(100, item.normalizedConfidence)
                        );
                        return (
                          <span
                            key={`${item.colorLabel}-${confidence}`}
                            className='flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide'
                            style={{
                              backgroundColor: palette.background,
                              color: palette.textColor,
                              borderColor: palette.borderColor,
                            }}
                            aria-label={`${item.colorLabel}, ${confidence}% confidence`}
                          >
                            <span
                              className='h-2.5 w-2.5 rounded-full border border-white/30'
                              style={{ backgroundColor: item.colorValue }}
                              aria-hidden='true'
                            ></span>
                            {item.colorLabel}
                            <span className='opacity-80'>{confidence}%</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <div className='px-5 py-6 sm:px-6 sm:py-7'>
                    <h3 className='text-base font-semibold text-slate-100'>
                      {result.analyzedReference.book}{' '}
                      {result.analyzedReference.chapter}:
                      {result.analyzedReference.verse}
                    </h3>
                    <blockquote className='mt-3 text-lg leading-relaxed text-slate-100 whitespace-pre-wrap'>
                      {result.scriptureText}
                    </blockquote>
                  </div>
                </div>
              </div>
            )}

            {result.primaryThemeReasoning && (
              <div className='rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm'>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-200'>
                  Primary theme
                </h3>
                <p className='mt-2 text-sm text-slate-200/90'>
                  {result.primaryThemeReasoning}
                </p>
              </div>
            )}

            {topRanked.length > 0 ? (
              <div className='space-y-4'>
                <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-200'>
                  Color suggestions
                </h3>
                <ul className='space-y-4'>
                  {topRanked.map((item, index) => {
                    const confidence = Math.max(
                      0,
                      Math.min(100, item.normalizedConfidence)
                    );
                    return (
                      <li
                        key={index}
                        className='flex gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20'
                      >
                        <span
                          style={{ backgroundColor: item.colorValue }}
                          className='mt-1.5 h-6 w-6 flex-shrink-0 rounded-full border border-black/10'
                          aria-hidden='true'
                        ></span>
                        <div className='space-y-1'>
                          <p className='text-sm font-semibold text-slate-100'>
                            {item.colorLabel}{' '}
                            <span className='font-medium text-slate-400'>
                              ({item.colorMeaning})
                            </span>
                          </p>
                          <p className='text-sm text-slate-200/90'>
                            <span className='font-medium text-slate-100'>
                              Confidence:
                            </span>{' '}
                            {confidence}%
                          </p>
                          <p className='text-sm text-slate-200/90'>
                            <span className='font-medium text-slate-100'>
                              Rationale:
                            </span>{' '}
                            {item.justification}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              !result.primaryThemeReasoning && (
                <p className='rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-4 text-sm text-slate-300'>
                  No specific color themes were identified for this passage.
                </p>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}
