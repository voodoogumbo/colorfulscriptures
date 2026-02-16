import { useState, useEffect, useRef, useCallback } from 'react';

type DropdownType = 'volume' | 'book' | null;

export function useDropdownState() {
  const [openReferenceDropdown, setOpenReferenceDropdown] =
    useState<DropdownType>(null);

  const containerRef = useRef<HTMLFormElement>(null);

  const closeDropdown = useCallback(() => {
    setOpenReferenceDropdown(null);
  }, []);

  // Click-outside handler -- only active when a dropdown is open
  useEffect(() => {
    if (openReferenceDropdown === null) return;

    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpenReferenceDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openReferenceDropdown]);

  // Escape key handler -- only active when a dropdown is open
  useEffect(() => {
    if (openReferenceDropdown === null) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpenReferenceDropdown(null);

        // Return focus to the trigger button
        const triggerId =
          openReferenceDropdown === 'volume'
            ? 'volumeSelectButton'
            : 'bookSelectButton';
        const trigger = document.getElementById(triggerId);
        trigger?.focus();
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openReferenceDropdown]);

  return {
    openReferenceDropdown,
    setOpenReferenceDropdown,
    containerRef,
    closeDropdown,
  } as const;
}

export type { DropdownType };
