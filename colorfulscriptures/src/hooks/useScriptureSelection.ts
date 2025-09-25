import { useState, useEffect } from 'react';

type ScriptureMetadata = {
  [volumeTitle: string]: string[];
};

export function useScriptureSelection(metadata: ScriptureMetadata) {
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedVerse, setSelectedVerse] = useState<string>('');
  const [bookList, setBookList] = useState<string[]>([]);
  const [availableChapters, setAvailableChapters] = useState<string[]>([]);
  const [verseCountsByChapter, setVerseCountsByChapter] = useState<
    Record<string, number>
  >({});
  const [availableVerses, setAvailableVerses] = useState<string[]>([]);
  const [isReferenceLoading, setIsReferenceLoading] = useState<boolean>(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  // Update book list when volume changes
  useEffect(() => {
    if (selectedVolume && metadata[selectedVolume]) {
      setBookList(metadata[selectedVolume]);
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedVerse('');
      setAvailableChapters([]);
      setAvailableVerses([]);
      setVerseCountsByChapter({});
      setReferenceError(null);
    } else {
      setBookList([]);
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedVerse('');
      setAvailableChapters([]);
      setAvailableVerses([]);
      setVerseCountsByChapter({});
      setReferenceError(null);
    }
  }, [selectedVolume, metadata]);

  const handleVolumeChange = (volume: string) => {
    setSelectedVolume(volume);
  };

  const handleBookChange = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter('');
    setSelectedVerse('');
    setAvailableChapters([]);
    setAvailableVerses([]);
    setVerseCountsByChapter({});
    setReferenceError(null);
  };

  const handleChapterChange = (chapter: string) => {
    setSelectedChapter(chapter);
    if (chapter) {
      const verseCount = verseCountsByChapter[chapter];
      if (verseCount) {
        const verses = Array.from({ length: verseCount }, (_, index) =>
          String(index + 1)
        );
        setAvailableVerses(verses);
        if (verses.length === 1 && verses[0]) {
          setSelectedVerse(verses[0]);
        } else if (!verses.includes(selectedVerse)) {
          setSelectedVerse('');
        }
      } else {
        setAvailableVerses([]);
        setSelectedVerse('');
      }
    } else {
      setAvailableVerses([]);
      setSelectedVerse('');
    }
  };

  const handleVerseChange = (verse: string) => {
    setSelectedVerse(verse);
  };

  useEffect(() => {
    if (!selectedBook) {
      setAvailableChapters([]);
      setVerseCountsByChapter({});
      setIsReferenceLoading(false);
      return;
    }

    let isCancelled = false;

    async function fetchBookMetadata() {
      setIsReferenceLoading(true);
      setReferenceError(null);

      try {
        const response = await fetch(
          `/api/scripture-metadata?book=${encodeURIComponent(selectedBook)}`
        );

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || 'Failed to load reference metadata.');
        }

        const data = await response.json();
        const chapters: string[] = Array.isArray(data?.chapters)
          ? data.chapters.map((chapterNumber: number) => String(chapterNumber))
          : [];
        const versesByChapter: Record<string, number> = data?.versesByChapter
          ? Object.fromEntries(
              Object.entries<number>(data.versesByChapter).map(
                ([chapterNumber, verseCount]) => [
                  String(chapterNumber),
                  verseCount,
                ]
              )
            )
          : {};

        if (isCancelled) return;

        setAvailableChapters(chapters);
        setVerseCountsByChapter(versesByChapter);

        if (chapters.length === 1 && chapters[0]) {
          setSelectedChapter(chapters[0]);
          setSelectedVerse('');
        } else {
          setSelectedChapter('');
          setSelectedVerse('');
        }
      } catch (error) {
        if (isCancelled) return;
        console.error('Failed to load scripture metadata', error);
        setReferenceError(
          error instanceof Error
            ? error.message
            : 'Failed to load reference metadata.'
        );
        setAvailableChapters([]);
        setVerseCountsByChapter({});
        setAvailableVerses([]);
        setSelectedChapter('');
        setSelectedVerse('');
      } finally {
        if (!isCancelled) {
          setIsReferenceLoading(false);
        }
      }
    }

    fetchBookMetadata();

    return () => {
      isCancelled = true;
    };
  }, [selectedBook]);

  const clearError = () => {
    // This will be handled by the analysis hook
  };

  useEffect(() => {
    if (!selectedChapter) {
      setAvailableVerses([]);
      return;
    }

    const verseCount = verseCountsByChapter[selectedChapter];
    if (!verseCount) {
      setAvailableVerses([]);
      return;
    }

    const verses = Array.from({ length: verseCount }, (_, index) =>
      String(index + 1)
    );
    setAvailableVerses(verses);
    if (verses.length === 1 && verses[0]) {
      setSelectedVerse(verses[0]);
    } else if (selectedVerse && !verses.includes(selectedVerse)) {
      setSelectedVerse('');
    }
  }, [selectedChapter, verseCountsByChapter, selectedVerse]);

  return {
    selectedVolume,
    selectedBook,
    selectedChapter,
    selectedVerse,
    bookList,
    availableChapters,
    availableVerses,
    isReferenceLoading,
    referenceError,
    handleVolumeChange,
    handleBookChange,
    handleChapterChange,
    handleVerseChange,
    clearError,
  };
}
