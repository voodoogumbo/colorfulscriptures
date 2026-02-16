import { useState, useEffect } from 'react';

import type { ColorSchemeItem } from '@/types/scripture';

const COLOR_SCHEME_STORAGE_KEY = 'colorfulScriptures.colorScheme';

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

export function useColorScheme() {
  const [colorScheme, setColorScheme] =
    useState<ColorSchemeItem[]>(defaultColorScheme);
  const [hasLoadedColorScheme, setHasLoadedColorScheme] = useState(false);

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

  return {
    colorScheme,
    setColorScheme,
    hasLoadedColorScheme,
  };
}
