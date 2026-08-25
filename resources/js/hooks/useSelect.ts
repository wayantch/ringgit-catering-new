import { useEffect, useRef, useState } from 'react';

export interface UseSelectOptions {
    onOpen?: () => void;
    onClose?: () => void;
}

export function useSelect(options: UseSelectOptions = {}) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFlipped, setIsFlipped] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const open = () => {
        setIsOpen(true);
        options.onOpen?.();
        setHighlightedIndex(-1);
        setSearchQuery('');

        // Focus search input on next frame
        setTimeout(() => {
            searchRef.current?.focus();
        }, 50);
    };

    const close = () => {
        setIsOpen(false);
        options.onClose?.();
        setHighlightedIndex(-1);
        setSearchQuery('');
    };

    const toggle = () => {
        if (isOpen) {
            close();
        } else {
            open();
        }
    };

    // Handle click outside
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as Node;

            if (
                !triggerRef.current?.contains(target) &&
                !dropdownRef.current?.contains(target)
            ) {
                close();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'Escape':
                    close();
                    triggerRef.current?.focus();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    setHighlightedIndex((prev) => prev + 1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setHighlightedIndex((prev) => (prev <= 0 ? -1 : prev - 1));
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    // Check if dropdown needs to flip (near bottom of viewport)
    useEffect(() => {
        if (!isOpen || !triggerRef.current || !dropdownRef.current) {
            return;
        }

        const trigger = triggerRef.current.getBoundingClientRect();
        const dropdownHeight = 300; // approximate height
        const spaceBelow = window.innerHeight - trigger.bottom;

        // If less than 320px space below, flip to above
        setIsFlipped(spaceBelow < 320 && trigger.top > dropdownHeight);
    }, [isOpen]);

    return {
        isOpen,
        open,
        close,
        toggle,
        highlightedIndex,
        setHighlightedIndex,
        searchQuery,
        setSearchQuery,
        isFlipped,
        triggerRef,
        dropdownRef,
        searchRef,
    };
}
