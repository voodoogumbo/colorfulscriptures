import { useState, useEffect, useMemo } from 'react';

type VolumeMetadata = {
  [volumeTitle: string]: string[];
};

type VersesByChapterData = {
  [bookTitle: string]: Record<string, number>;
};

export function useScriptureSelection(
  metadata: VolumeMetadata,
  allVersesByChapter: VersesByChapterData
) {
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedVerse, setSelectedVerse] = useState<string>('');
  const [bookList, setBookList] = useState<string[]>([]);

  // Derive chapters and verse counts from pre-computed static data
  const verseCountsByChapter = useMemo(() => {
    if (!selectedBook || !allVersesByChapter[selectedBook]) return {};
    return allVersesByChapter[selectedBook];
  }, [selectedBook, allVersesByChapter]);

  const availableChapters = useMemo(() => {
    return Object.keys(verseCountsByChapter).sort(
      (a, b) => Number(a) - Number(b)
    );
  }, [verseCountsByChapter]);

  const availableVerses = useMemo(() => {
    if (!selectedChapter) return [];
    const verseCount = verseCountsByChapter[selectedChapter];
    if (!verseCount) return [];
    return Array.from({ length: verseCount }, (_, i) => String(i + 1));
  }, [selectedChapter, verseCountsByChapter]);

  // Update book list when volume changes
  useEffect(() => {
    if (selectedVolume && metadata[selectedVolume]) {
      setBookList(metadata[selectedVolume]);
    } else {
      setBookList([]);
    }
    setSelectedBook('');
    setSelectedChapter('');
    setSelectedVerse('');
  }, [selectedVolume, metadata]);

  const handleVolumeChange = (volume: string) => {
    setSelectedVolume(volume);
  };

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter('');
    setSelectedVerse('');
  };

  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(chapter);
    if (chapter) {
      const verseCount = verseCountsByChapter[chapter];
      if (verseCount) {
        const verses = Array.from({ length: verseCount }, (_, i) =>
          String(i + 1)
        );
        if (verses.length === 1 && verses[0]) {
          setSelectedVerse(verses[0]);
        } else {
          setSelectedVerse(prev =>
            prev && !verses.includes(prev) ? '' : prev
          );
        }
      } else {
        setSelectedVerse('');
      }
    } else {
      setSelectedVerse('');
    }
  };

  const handleVerseChange = (verse: string) => {
    setSelectedVerse(verse);
  };

  return {
    selectedVolume,
    selectedBook,
    selectedChapter,
    selectedVerse,
    bookList,
    availableChapters,
    availableVerses,
    isReferenceLoading: false, // No longer needed - data is static
    referenceError: null, // No longer needed - no network call
    handleVolumeChange,
    handleBookChange,
    handleChapterChange,
    handleVerseChange,
    clearError: () => {},
  };
}
