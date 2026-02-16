import { FormEvent, useEffect, useState } from 'react';

import type { ColorSchemeItem } from '@/types/scripture';

interface AnalysisResult {
  colorLabel: string;
  colorMeaning: string;
  justification: string;
  confidence: number;
}

interface AnalysisResultDisplay extends AnalysisResult {
  colorValue: string;
}

interface ApiData {
  scriptureText: string | null;
  analysis: AnalysisResult[];
  primaryThemeReasoning: string | null;
  error?: string;
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

export function useScriptureAnalysis(colorScheme: ColorSchemeItem[]) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PageResultState | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);
  const [previewScriptureText, setPreviewScriptureText] = useState<
    string | null
  >(null);
  const [typedScriptureText, setTypedScriptureText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [pendingReference, setPendingReference] = useState<
    PageResultState['analyzedReference'] | null
  >(null);

  const clearError = () => {
    setError(null);
  };

  const analyzeScripture = async (
    selectedVolume: string,
    selectedBook: string,
    selectedChapter: string,
    selectedVerse: string
  ) => {
    const chapterNum = parseInt(selectedChapter, 10);
    const verseNum = parseInt(selectedVerse, 10);

    if (!selectedVolume) {
      setError('Please select a volume.');
      return;
    }
    if (!selectedBook) {
      setError('Please select a book.');
      return;
    }
    if (!selectedChapter || isNaN(chapterNum) || chapterNum < 1) {
      setError('Please enter a valid chapter number.');
      return;
    }
    if (!selectedVerse || isNaN(verseNum) || verseNum < 1) {
      setError('Please enter a valid verse number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setHasAnalyzed(true);
    setPreviewScriptureText(null);
    setTypedScriptureText('');
    setPendingReference({
      book: selectedBook,
      chapter: chapterNum,
      verse: verseNum,
    });

    const schemeForApi = colorScheme.map(item => ({
      label: item.currentLabel,
      meaning: item.meaning,
    }));

    let fetchedText: string | null = null;

    try {
      const scriptureResponse = await fetch(
        `/api/scripture-text?book=${encodeURIComponent(
          selectedBook
        )}&chapter=${chapterNum}&verse=${verseNum}`
      );

      if (!scriptureResponse.ok) {
        const data = await scriptureResponse.json().catch(() => null);
        const errorMessage = data?.error || 'Unable to load verse text.';
        throw new Error(errorMessage);
      }

      const scriptureData: { scriptureText?: string } =
        await scriptureResponse.json();
      fetchedText = scriptureData.scriptureText ?? null;
      setPreviewScriptureText(fetchedText);
    } catch (previewError) {
      console.error('Error fetching scripture text:', previewError);
      const errorMessage =
        previewError instanceof Error
          ? previewError.message
          : 'Unable to load verse text.';
      setError(errorMessage);
      setIsLoading(false);
      setPendingReference(null);
      return;
    }

    const requestPayload = {
      book: selectedBook,
      chapter: chapterNum,
      verse: verseNum,
      colorScheme: schemeForApi,
      ...(fetchedText ? { scriptureText: fetchedText } : {}),
    };

    try {
      const response = await fetch('/api/analyze-scripture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      const data: ApiData = await response.json();

      if (!response.ok) {
        const errorMsg =
          data?.error || `Request failed with status ${response.status}`;
        console.error('API Error Response:', errorMsg);
        if (response.status === 404 && data?.error?.includes('not found')) {
          throw new Error(
            `Verse not found: ${selectedBook} ${chapterNum}:${verseNum}. Please check your input.`
          );
        }
        throw new Error(errorMsg);
      }

      if (!data || !Array.isArray(data.analysis)) {
        console.error("API response missing 'analysis' array:", data);
        throw new Error(
          'Received invalid analysis data structure from the server.'
        );
      }

      const analysisWithColorValue: AnalysisResultDisplay[] = data.analysis
        .map((res: AnalysisResult) => {
          const matchingSchemeItem = colorScheme.find(
            cs => cs.currentLabel === res.colorLabel
          );
          const parsedConfidence = Number(res.confidence);
          const confidence = Number.isFinite(parsedConfidence)
            ? Math.min(100, Math.max(0, parsedConfidence))
            : 0;
          return {
            ...res,
            confidence,
            colorValue: matchingSchemeItem
              ? matchingSchemeItem.currentValue
              : '#6366f1',
          };
        })
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 2);

      setResult({
        scriptureText: data.scriptureText ?? 'Scripture text not returned.',
        analysis: analysisWithColorValue,
        primaryThemeReasoning: data.primaryThemeReasoning ?? null,
        analyzedReference: {
          book: selectedBook,
          chapter: chapterNum,
          verse: verseNum,
        },
      });
      setPendingReference(null);
    } catch (err: unknown) {
      console.error('Error during fetch or processing:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during analysis.';
      setError(errorMessage);
      setResult(null);
      setPendingReference(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!previewScriptureText) {
      setTypedScriptureText('');
      setIsTyping(false);
      return;
    }

    setTypedScriptureText('');
    setIsTyping(true);

    if (typeof window === 'undefined') {
      setTypedScriptureText(previewScriptureText);
      setIsTyping(false);
      return;
    }

    let frameId: number | null = null;
    let charIndex = 0;
    const text = previewScriptureText;
    const targetDurationMs = Math.min(4000, Math.max(1500, text.length * 35));
    const stepMs = targetDurationMs / Math.max(text.length, 1);
    const now =
      typeof performance !== 'undefined' &&
      typeof performance.now === 'function'
        ? () => performance.now()
        : () => Date.now();
    let previousTime = now();
    let accumulator = 0;

    const tick = (time: number) => {
      accumulator += time - previousTime;
      previousTime = time;

      while (accumulator >= stepMs && charIndex < text.length) {
        charIndex += 1;
        setTypedScriptureText(text.slice(0, charIndex));
        accumulator -= stepMs;
      }

      if (charIndex >= text.length) {
        setTypedScriptureText(text);
        setIsTyping(false);
        return;
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [previewScriptureText]);

  const handleAnalyzeScripture = async (
    event: FormEvent<HTMLFormElement>,
    selectedVolume: string,
    selectedBook: string,
    selectedChapter: string,
    selectedVerse: string
  ) => {
    event.preventDefault();
    await analyzeScripture(
      selectedVolume,
      selectedBook,
      selectedChapter,
      selectedVerse
    );
  };

  return {
    isLoading,
    error,
    result,
    hasAnalyzed,
    previewScriptureText,
    typedScriptureText,
    isTyping,
    pendingReference,
    clearError,
    analyzeScripture,
    handleAnalyzeScripture,
  };
}
