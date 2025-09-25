import { useState, useEffect, useRef } from 'react';

export function useDropdownState() {
  const [openReferenceDropdown, setOpenReferenceDropdown] = useState<
    'volume' | 'book' | null
  >(null);

  const referenceDropdownRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        openReferenceDropdown !== null &&
        referenceDropdownRef.current &&
        !referenceDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenReferenceDropdown(null);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openReferenceDropdown]);

  return {
    openReferenceDropdown,
    setOpenReferenceDropdown,
    referenceDropdownRef,
  };
}
