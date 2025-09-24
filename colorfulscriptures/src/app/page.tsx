// app/page.tsx
'use client';

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  useEffect,
  useRef,
} from 'react';

// --- Import the generated metadata ---
import scriptureMetadata from '../lib/scripture_metadata.json'; // Adjust path as needed

// --- Define the 12 Predefined Colors ---
const predefinedColors = [
  { label: 'Red', value: 'red' },
  { label: 'Orange', value: 'orange' },
  { label: 'Yellow', value: 'yellow' },
  { label: 'Green', value: 'green' },
  { label: 'Light Blue', value: 'lightblue' },
  { label: 'Blue', value: 'blue' },
  { label: 'Purple', value: 'purple' },
  { label: 'Pink', value: 'pink' },
  { label: 'Brown', value: 'brown' },
  { label: 'White', value: 'white' },
  { label: 'Gray', value: 'gray' },
  { label: 'Black', value: 'black' },
];

const COLOR_SCHEME_STORAGE_KEY = 'colorfulScriptures.colorScheme';

// --- Type Definitions ---
interface ColorSchemeItem {
  currentLabel: string;
  currentValue: string;
  meaning: string;
}
interface AnalysisResult {
  colorLabel: string;
  colorMeaning: string;
  justification: string;
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
}
type ScriptureMetadata = {
  [volumeTitle: string]: string[];
};

const defaultColorScheme: ColorSchemeItem[] = [
  {
    currentLabel: 'Purple',
    currentValue: 'purple',
    meaning: 'Prayer, Praise, Blessing, Worship',
  },
  {
    currentLabel: 'Yellow',
    currentValue: 'yellow',
    meaning: 'God, Jesus, Holy Spirit',
  },
  {
    currentLabel: 'Blue',
    currentValue: 'blue',
    meaning: 'Wisdom, Teaching, Instruction',
  },
  {
    currentLabel: 'Green',
    currentValue: 'green',
    meaning: 'Growth, New Life, Faith',
  },
  {
    currentLabel: 'Red',
    currentValue: 'red',
    meaning: 'Evil, Sin, Temptation, Death',
  },
  {
    currentLabel: 'Pink',
    currentValue: 'pink',
    meaning: 'Grace, Salvation, Love, Compassion, Repentance',
  },
  {
    currentLabel: 'Orange',
    currentValue: 'orange',
    meaning: 'Laws, History, Genealogies, Numbers',
  },
];

// --- Component ---
export default function ScriptureColoringPage() {
  // --- State ---
  const [colorScheme, setColorScheme] =
    useState<ColorSchemeItem[]>(defaultColorScheme);
  const [hasLoadedColorScheme, setHasLoadedColorScheme] = useState(false);
  const metadata: ScriptureMetadata = scriptureMetadata;
  const volumeList = Object.keys(metadata);
  const [bookList, setBookList] = useState<string[]>([]);
  const [selectedVolume, setSelectedVolume] = useState<string>('');
  const [selectedBook, setSelectedBook] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedVerse, setSelectedVerse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PageResultState | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState<boolean>(false);

  // ** UPDATED: Separate state/refs for different dropdown types **
  const [openColorDropdownIndex, setOpenColorDropdownIndex] = useState<
    number | null
  >(null);
  const [openReferenceDropdown, setOpenReferenceDropdown] = useState<
    'volume' | 'book' | null
  >(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const referenceDropdownRef = useRef<HTMLFormElement>(null); // Single ref for volume/book combined area

  // --- Effects ---

  // Update book list when volume changes
  useEffect(() => {
    if (selectedVolume && metadata[selectedVolume]) {
      setBookList(metadata[selectedVolume]);
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedVerse('');
    } else {
      setBookList([]);
      setSelectedBook('');
      setSelectedChapter('');
      setSelectedVerse('');
    }
    // Don't include metadata in dependency array since it's from a static import
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVolume]);

  // ** UPDATED: Combined Click Outside Handler **
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click is outside the currently open color dropdown
      if (
        openColorDropdownIndex !== null &&
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenColorDropdownIndex(null);
      }
      // Check if the click is outside the currently open reference dropdown (volume or book)
      // Future logic for button-specific handling:
      // const targetElement = event.target as Element;
      // const isVolumeButton = targetElement.closest('#volumeSelectButton');
      // const isBookButton = targetElement.closest('#bookSelectButton');

      if (
        openReferenceDropdown !== null &&
        referenceDropdownRef.current &&
        !referenceDropdownRef.current.contains(event.target as Node)
      ) {
        // If clicking outside the dropdown area, close it
        setOpenReferenceDropdown(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openColorDropdownIndex, openReferenceDropdown]); // Include both states

  // Restore saved color scheme preferences on first render
  useEffect(() => {
    try {
      const savedScheme = window.localStorage.getItem(COLOR_SCHEME_STORAGE_KEY);
      if (savedScheme) {
        const parsedScheme = JSON.parse(savedScheme);
        const isValidScheme =
          Array.isArray(parsedScheme) &&
          parsedScheme.every(
            (item: Partial<ColorSchemeItem>) =>
              typeof item?.currentLabel === 'string' &&
              typeof item?.currentValue === 'string' &&
              typeof item?.meaning === 'string'
          );

        if (isValidScheme) {
          setColorScheme(parsedScheme as ColorSchemeItem[]);
        }
      }
    } catch (storageError) {
      console.error('Failed to restore saved color scheme:', storageError);
    } finally {
      setHasLoadedColorScheme(true);
    }
  }, []);

  // Persist color scheme updates after the initial load
  useEffect(() => {
    if (!hasLoadedColorScheme) return;

    try {
      window.localStorage.setItem(
        COLOR_SCHEME_STORAGE_KEY,
        JSON.stringify(colorScheme)
      );
    } catch (storageError) {
      console.error('Failed to persist color scheme:', storageError);
    }
  }, [colorScheme, hasLoadedColorScheme]);

  // --- Handlers ---
  const handleColorSelectChange = (index: number, selectedValue: string) => {
    const selectedColor = predefinedColors.find(c => c.value === selectedValue);
    if (!selectedColor) return;
    setColorScheme(prevScheme =>
      prevScheme.map((item, i) =>
        i === index
          ? {
              ...item,
              currentLabel: selectedColor.label,
              currentValue: selectedColor.value,
            }
          : item
      )
    );
    setOpenColorDropdownIndex(null);
  };

  // ** NEW: Handlers for custom Volume/Book selection **
  const handleVolumeSelect = (volume: string) => {
    setSelectedVolume(volume);
    setOpenReferenceDropdown(null); // Close dropdown
    setError(null);
  };
  const handleBookSelect = (book: string) => {
    setSelectedBook(book);
    setOpenReferenceDropdown(null); // Close dropdown
    setError(null);
  };

  // handleAnalyzeScripture (no changes needed in its internal logic)
  const handleAnalyzeScripture = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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

    const schemeForApi = colorScheme.map(item => ({
      label: item.currentLabel,
      meaning: item.meaning,
    }));

    const requestPayload = {
      book: selectedBook,
      chapter: chapterNum,
      verse: verseNum,
      colorScheme: schemeForApi,
    };

    try {
      // Debug: console.log('Sending to API:', requestPayload);
      const response = await fetch('/api/analyze-scripture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });
      const data: ApiData = await response.json();
      // Debug: console.log('Received from API:', data);

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

      const analysisWithColorValue: AnalysisResultDisplay[] = data.analysis.map(
        (res: AnalysisResult) => {
          const matchingSchemeItem = colorScheme.find(
            cs => cs.currentLabel === res.colorLabel
          );
          return {
            ...res,
            colorValue: matchingSchemeItem
              ? matchingSchemeItem.currentValue
              : '#cccccc',
          };
        }
      );

      setResult({
        scriptureText: data.scriptureText ?? 'Scripture text not returned.',
        analysis: analysisWithColorValue,
        primaryThemeReasoning: data.primaryThemeReasoning ?? null,
      });
    } catch (err: unknown) {
      console.error('Error during fetch or processing:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred during analysis.';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render ---
  return (
    <div className='container mx-auto p-4 md:p-8'>
      <header className='text-center mb-8'>
        {/* ... (Header content) ... */}
        <h1 className='text-3xl font-bold mb-2 text-gray-900 dark:text-gray-100'>
          Scripture Highlighter Analysis
        </h1>
        <p className='text-gray-600 dark:text-gray-400'>
          Select a scripture, choose colors, and analyze!
        </p>
      </header>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8'>
        {/* Color Scheme Card */}
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
          <h2 className='text-xl font-semibold mb-1 text-gray-800 dark:text-gray-200'>
            Your Color Scheme
          </h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mb-4'>
            Select a color for each category.
          </p>
          <ul className='space-y-4'>
            {colorScheme.map((item, index) => (
              <li key={index} className='flex items-center gap-4'>
                {/* Custom Color Dropdown Logic */}
                <div
                  className='relative inline-block text-left'
                  ref={
                    openColorDropdownIndex === index ? colorDropdownRef : null
                  }
                >
                  <button
                    type='button'
                    onClick={() =>
                      setOpenColorDropdownIndex(
                        openColorDropdownIndex === index ? null : index
                      )
                    }
                    className='inline-flex items-center justify-center w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-1.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500'
                    aria-haspopup='listbox'
                    aria-expanded={openColorDropdownIndex === index}
                  >
                    <span
                      style={{ backgroundColor: item.currentValue }}
                      className='w-4 h-4 rounded flex-shrink-0 border border-gray-400 dark:border-gray-500 mr-2'
                      aria-hidden='true'
                    ></span>
                    {item.currentLabel}
                    <svg
                      className='-mr-1 ml-2 h-5 w-5'
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
                  {openColorDropdownIndex === index && (
                    <div
                      className='origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10'
                      role='listbox'
                    >
                      <div className='py-1 max-h-60 overflow-auto' role='none'>
                        {predefinedColors.map(colorOpt => (
                          <button
                            key={colorOpt.value}
                            type='button'
                            onClick={() =>
                              handleColorSelectChange(index, colorOpt.value)
                            }
                            className='w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                            role='option'
                            aria-selected={item.currentValue === colorOpt.value}
                          >
                            <span
                              style={{ backgroundColor: colorOpt.value }}
                              className='w-4 h-4 rounded flex-shrink-0 border border-gray-400 dark:border-gray-500 mr-3'
                              aria-hidden='true'
                            ></span>
                            {colorOpt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Meaning Text */}
                <span className='text-sm text-gray-800 dark:text-gray-200 text-left'>
                  {item.meaning}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Form & Results Column */}
        <div className='space-y-6'>
          {/* === Input Form Card - REFACTORED with Custom Dropdowns === */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200'>
              Analyze Scripture
            </h2>
            {/* Use a div for the ref for click-outside detection */}
            <form
              onSubmit={handleAnalyzeScripture}
              className='space-y-4'
              ref={referenceDropdownRef}
            >
              {/* --- Volume & Book Selectors (Same Row) --- */}
              <div className='flex flex-col sm:flex-row sm:items-end gap-4'>
                {/* Volume Custom Dropdown */}
                <div className='flex-1'>
                  <label
                    htmlFor='volumeSelectButton'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Volume
                  </label>
                  <div className='relative'>
                    {' '}
                    {/* No ref needed here, parent form has it */}
                    <button
                      id='volumeSelectButton' // ID for click outside check logic
                      type='button'
                      onClick={() =>
                        setOpenReferenceDropdown(
                          openReferenceDropdown === 'volume' ? null : 'volume'
                        )
                      }
                      disabled={isLoading}
                      className='inline-flex items-center justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50'
                      aria-haspopup='listbox'
                      aria-expanded={openReferenceDropdown === 'volume'}
                    >
                      <span className='truncate'>
                        {selectedVolume || 'Select Volume...'}
                      </span>{' '}
                      {/* Added truncate */}
                      <svg
                        className='-mr-1 ml-2 h-5 w-5 text-gray-400'
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
                    {/* Panel for Volume */}
                    {openReferenceDropdown === 'volume' && (
                      <div
                        className='origin-top-left absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20'
                        role='listbox'
                      >
                        <div
                          className='py-1 max-h-60 overflow-auto'
                          role='none'
                        >
                          {volumeList.map(volTitle => (
                            <button
                              key={volTitle}
                              type='button'
                              onClick={() => handleVolumeSelect(volTitle)}
                              className='w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
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

                {/* Book Custom Dropdown */}
                <div className='flex-1'>
                  <label
                    htmlFor='bookSelectButton'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Book
                  </label>
                  <div className='relative'>
                    {' '}
                    {/* No ref needed here, parent form has it */}
                    <button
                      id='bookSelectButton' // ID for click outside check logic
                      type='button'
                      onClick={() =>
                        setOpenReferenceDropdown(
                          openReferenceDropdown === 'book' ? null : 'book'
                        )
                      }
                      disabled={
                        isLoading || !selectedVolume || bookList.length === 0
                      }
                      className='inline-flex items-center justify-between w-full rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-3 py-2 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50'
                      aria-haspopup='listbox'
                      aria-expanded={openReferenceDropdown === 'book'}
                    >
                      <span className='truncate'>
                        {selectedBook || 'Select Book...'}
                      </span>{' '}
                      {/* Added truncate */}
                      <svg
                        className='-mr-1 ml-2 h-5 w-5 text-gray-400'
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
                    {/* Panel for Book */}
                    {openReferenceDropdown === 'book' && (
                      <div
                        className='origin-top-left absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-20'
                        role='listbox'
                      >
                        <div
                          className='py-1 max-h-60 overflow-auto'
                          role='none'
                        >
                          {bookList.map(bookTitle => (
                            <button
                              key={bookTitle}
                              type='button'
                              onClick={() => handleBookSelect(bookTitle)}
                              className='w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
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
              {/* --- End Volume & Book --- */}

              {/* Chapter and Verse Inputs */}
              <div className='grid grid-cols-2 gap-4'>
                {/* ... (Inputs remain the same) ... */}
                <div>
                  <label
                    htmlFor='chapterInput'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Chapter
                  </label>
                  <input
                    type='number'
                    id='chapterInput'
                    name='chapterInput'
                    min='1'
                    value={selectedChapter}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSelectedChapter(e.target.value);
                      setError(null);
                    }}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm disabled:opacity-50'
                    placeholder='e.g., 3'
                    required
                    disabled={isLoading || !selectedBook}
                  />
                </div>
                <div>
                  <label
                    htmlFor='verseInput'
                    className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                  >
                    Verse
                  </label>
                  <input
                    type='number'
                    id='verseInput'
                    name='verseInput'
                    min='1'
                    value={selectedVerse}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSelectedVerse(e.target.value);
                      setError(null);
                    }}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 sm:text-sm disabled:opacity-50'
                    placeholder='e.g., 7'
                    required
                    disabled={isLoading || !selectedBook || !selectedChapter}
                  />
                </div>
              </div>

              {/* Submit Button - Adjusted width */}
              <div className='flex justify-center pt-2'>
                {' '}
                {/* Centering container */}
                <button
                  type='submit'
                  disabled={
                    isLoading ||
                    !selectedVolume ||
                    !selectedBook ||
                    !selectedChapter ||
                    !selectedVerse
                  }
                  className='inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {isLoading ? 'Analyzing...' : 'Color Scriptures!'}
                </button>
              </div>

              {/* Display validation/API errors */}
              {error && (
                <p className='mt-2 text-sm text-red-600 dark:text-red-400 text-center'>
                  {error}
                </p>
              )}
            </form>
          </div>
          {/* === End Input Form Card === */}

          {/* === Results Card - UPDATED Text Contrast === */}
          <div className='bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 min-h-[200px]'>
            <h2 className='text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200'>
              Analysis Results
            </h2>
            <div className='space-y-4'>
              {/* Loading State */}
              {isLoading && (
                <div className='flex justify-center items-center py-4'>
                  {' '}
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    {' '}
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>{' '}
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>{' '}
                  </svg>{' '}
                  <p className='text-gray-500 dark:text-gray-400'>
                    Loading analysis...
                  </p>{' '}
                </div>
              )}
              {/* Error State */}
              {!isLoading && error && (
                <p className='text-red-600 dark:text-red-400'>
                  Error: {error}. Please check selection or try again.
                </p>
              )}
              {/* Initial State */}
              {!isLoading && !error && !result && !hasAnalyzed && (
                <p className='text-gray-500 dark:text-gray-400'>
                  Select a scripture verse above and click &ldquo;Color
                  Scriptures!&rdquo; to see the analysis.
                </p>
              )}
              {/* Analyzed but no results/error */}
              {!isLoading && !error && !result && hasAnalyzed && (
                <p className='text-gray-500 dark:text-gray-400'>
                  Analysis complete, but no specific results were returned or
                  the analysis failed silently.
                </p>
              )}

              {/* Successful Result State */}
              {!isLoading && result && (
                <div className='space-y-5'>
                  {/* Display Scripture Text Analyzed */}
                  {result.scriptureText && (
                    <div className='p-4 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600'>
                      <h3 className='text-lg font-medium text-gray-900 dark:text-gray-100 mb-2'>
                        Analyzed Text ({selectedBook} {selectedChapter}:
                        {selectedVerse}):
                      </h3>
                      {/* ** Increased text darkness/contrast ** */}
                      <blockquote className='italic text-gray-800 dark:text-gray-200 whitespace-pre-wrap'>
                        &ldquo;{result.scriptureText}&rdquo;
                      </blockquote>
                    </div>
                  )}
                  {/* Display Primary Theme Reasoning */}
                  {result.primaryThemeReasoning && (
                    <div>
                      <h3 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-1'>
                        Primary Theme:
                      </h3>
                      {/* ** Increased text darkness/contrast ** */}
                      <p className='text-sm text-gray-800 dark:text-gray-300'>
                        {result.primaryThemeReasoning}
                      </p>
                    </div>
                  )}
                  {/* Display Detailed Color Analysis */}
                  {result.analysis && result.analysis.length > 0 ? (
                    <div>
                      <h3 className='text-md font-semibold text-gray-800 dark:text-gray-200 mb-2'>
                        Color Suggestions:
                      </h3>
                      <ul className='space-y-3'>
                        {result.analysis.map((item, index) => (
                          <li
                            key={index}
                            className='flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-600/50'
                          >
                            <span
                              style={{ backgroundColor: item.colorValue }}
                              className='w-5 h-5 rounded flex-shrink-0 border border-gray-400 dark:border-gray-500 mt-0.5'
                              aria-hidden='true'
                            ></span>
                            <div>
                              {/* Color Label/Meaning - Already fairly dark */}
                              <p className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                                {item.colorLabel}{' '}
                                <span className='text-xs text-gray-500 dark:text-gray-400'>
                                  ({item.colorMeaning})
                                </span>
                              </p>
                              {/* Rationale Text - ** Increased darkness/contrast ** */}
                              <p className='text-sm text-gray-800 dark:text-gray-300 mt-1'>
                                <span className='font-medium text-gray-900 dark:text-gray-200'>
                                  Rationale:
                                </span>{' '}
                                {item.justification}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    !result.primaryThemeReasoning && (
                      <p className='text-gray-500 dark:text-gray-400'>
                        No specific color themes were identified for this
                        passage.
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
          {/* === End Results Card === */}
        </div>
      </div>
    </div>
  );
}
