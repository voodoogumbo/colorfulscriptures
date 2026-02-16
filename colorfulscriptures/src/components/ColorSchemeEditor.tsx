'use client';

import React, { useState } from 'react';

import type { ColorSchemeItem } from '@/types/scripture';

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

interface ColorSchemeEditorProps {
  colorScheme: ColorSchemeItem[];
  onColorSchemeChange: (colorScheme: ColorSchemeItem[]) => void;
}

function ColorSchemeEditor({
  colorScheme,
  onColorSchemeChange,
}: ColorSchemeEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleColorSelect = (index: number, selectedValue: string) => {
    const selectedColor = predefinedColors.find(
      color => color.value === selectedValue
    );
    if (!selectedColor) return;

    const updatedScheme = colorScheme.map((item, schemeIndex) =>
      schemeIndex === index
        ? {
            ...item,
            currentLabel: selectedColor.label,
            currentValue: selectedColor.value,
          }
        : item
    );
    onColorSchemeChange(updatedScheme);
    setExpandedIndex(null);
  };

  const toggleExpanded = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  return (
    <section className='rounded-3xl border border-slate-800 bg-slate-950/85 p-6 text-slate-100 shadow-2xl shadow-indigo-950/40 backdrop-blur-sm sm:p-8 lg:col-span-2'>
      <h2 className='text-xl font-semibold text-slate-100'>
        Your Color Scheme
      </h2>
      <p className='mt-2 text-sm text-slate-400'>
        Personalize the legend that guides every highlight.
      </p>
      <ul className='mt-6 space-y-5'>
        {colorScheme.map((item, index) => {
          const isExpanded = expandedIndex === index;
          const isLightColor = [
            'yellow',
            'lightblue',
            'white',
            'orange',
          ].includes(item.currentValue.toLowerCase());
          const buttonTextClass = isLightColor
            ? 'text-slate-900'
            : 'text-white';
          return (
            <li
              key={`${item.meaning}-${index}`}
              className='flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm shadow-indigo-500/10 transition hover:border-indigo-400/60'
            >
              <div className='text-xs font-semibold uppercase tracking-wide text-slate-300'>
                {item.meaning}
              </div>

              <button
                type='button'
                onClick={() => toggleExpanded(index)}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${
                  isExpanded
                    ? 'border-indigo-400/80 bg-indigo-500/15 text-indigo-100'
                    : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-indigo-400/60 hover:bg-indigo-500/10'
                }`}
                aria-expanded={isExpanded}
              >
                <span
                  className={`flex flex-1 items-center gap-3 rounded-lg border border-white/15 px-3 py-2 text-sm font-semibold ${buttonTextClass}`}
                  style={{ backgroundColor: item.currentValue }}
                >
                  <span className='truncate'>{item.currentLabel}</span>
                </span>
                <svg
                  className={`h-4 w-4 transform transition ${isExpanded ? 'rotate-180 text-indigo-200' : 'text-slate-400'}`}
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

              {isExpanded && (
                <div className='rounded-xl border border-slate-800 bg-slate-900/70 p-4'>
                  <div className='grid grid-cols-6 gap-3'>
                    {predefinedColors.map(colorOption => {
                      const isSelected =
                        colorOption.value === item.currentValue;
                      const usedColors = colorScheme
                        .filter((_, schemeIndex) => schemeIndex !== index)
                        .map(schemeItem => schemeItem.currentValue);
                      const isUsed = usedColors.includes(colorOption.value);

                      return (
                        <button
                          key={colorOption.value}
                          type='button'
                          onClick={() =>
                            !isUsed &&
                            handleColorSelect(index, colorOption.value)
                          }
                          disabled={isUsed}
                          className={`relative h-9 w-9 rounded-full border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 overflow-hidden ${
                            isSelected
                              ? 'border-indigo-400 shadow-inner shadow-indigo-500/30'
                              : isUsed
                                ? 'border-slate-600 opacity-60 cursor-not-allowed'
                                : 'border-slate-700 hover:border-indigo-400'
                          }`}
                          style={{ backgroundColor: colorOption.value }}
                          aria-label={
                            isUsed
                              ? `${colorOption.label} (already used)`
                              : colorOption.label
                          }
                        >
                          {isUsed && (
                            <div className='absolute inset-0 flex items-center justify-center'>
                              <div className='h-0.5 w-full rotate-45 bg-slate-900 shadow-sm'></div>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default ColorSchemeEditor;
