import { ChevronDown, Search, X } from 'lucide-react';
import {
    useMemo,
    useEffect,
    useRef
    
    
} from 'react';
import type {ReactNode, ElementType} from 'react';
import { useSelect } from '@/hooks/useSelect';
import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SelectOptionBase {
    value: string;
    label: string;
    icon?: ElementType;
    disabled?: boolean;
    description?: string;
}

export interface SelectOptionGroup {
    group: string;
    items: SelectOptionBase[];
}

export type SelectOptions = SelectOptionBase[] | SelectOptionGroup[];

export interface SelectProps {
    // Value
    value: string;
    onChange: (value: string) => void;

    // Options
    options: SelectOptions;

    // UI
    placeholder?: string;
    label?: string;
    error?: string;
    hint?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;

    // Size
    size?: 'sm' | 'md' | 'lg';

    // Accessibility
    id?: string;
    name?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean;
}

// ─── Helper: flatten options ──────────────────────────────────────────────────

function flattenOptions(options: SelectOptions): SelectOptionBase[] {
    return options.flatMap((opt) => {
        if ('group' in opt) {
            return opt.items;
        }

        return opt;
    });
}

// ─── Helper: is option group ──────────────────────────────────────────────────

function isOptionGroup(
    opt: SelectOptionBase | SelectOptionGroup,
): opt is SelectOptionGroup {
    return 'group' in opt;
}

// ─── Helper: get size classes ─────────────────────────────────────────────────

function getSizeClasses(size: 'sm' | 'md' | 'lg' = 'md') {
    const sizeMap = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-3.5 py-2.5 text-sm',
        lg: 'px-4 py-3 text-base',
    };

    const iconSizeMap = {
        sm: 'h-3.5 w-3.5',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    return { trigger: sizeMap[size], icon: iconSizeMap[size] };
}

// ─── Main Select Component ────────────────────────────────────────────────────

export default function Select({
    value,
    onChange,
    options,
    placeholder = 'Pilih...',
    label,
    error,
    hint,
    disabled = false,
    required = false,
    className = '',
    size = 'md',
    id,
    name,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
}: SelectProps) {
    const {
        isOpen,
        toggle,
        close,
        highlightedIndex,
        setHighlightedIndex,
        searchQuery,
        setSearchQuery,
        isFlipped,
        triggerRef,
        dropdownRef,
        searchRef,
    } = useSelect();

    // Flatten and filter
    const flatOptions = useMemo(() => {
        return flattenOptions(options).filter((opt) => {
            if (opt.disabled) {
return true;
}

            const searchTerm = searchQuery.toLowerCase();

            return (
                opt.label.toLowerCase().includes(searchTerm) ||
                opt.description?.toLowerCase().includes(searchTerm)
            );
        });
    }, [options, searchQuery]);

    // Get current selected option
    const selectedOption = useMemo(() => {
        return flattenOptions(options).find(
            (opt) => opt.value === value,
        );
    }, [options, value]);

    // Show search if more than 7 options
    const showSearch = flattenOptions(options).length > 7;

    // Scroll highlighted option into view
    useEffect(() => {
        if (highlightedIndex >= 0 && isOpen) {
            const highlighted = dropdownRef.current?.querySelector(
                `[data-index="${highlightedIndex}"]`,
            );
            highlighted?.scrollIntoView({ block: 'nearest' });
        }
    }, [highlightedIndex, isOpen]);

    // Reset highlighted when search changes
    useEffect(() => {
        setHighlightedIndex(-1);
    }, [searchQuery, setHighlightedIndex]);

    const sizeClasses = getSizeClasses(size);
    const descriptionId = ariaDescribedBy || `${id}-description`;
    const errorId = `${id}-error`;

    return (
        <div className={cn('relative w-full', className)}>
            {label && (
                <label className="mb-2 block text-sm font-medium text-slate-700">
                    {label}
                    {required && <span className="ml-1 text-red-400">*</span>}
                </label>
            )}

            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                onClick={() => !disabled && toggle()}
                disabled={disabled}
                id={id}
                name={name}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-invalid={ariaInvalid || !!error}
                aria-describedby={hint ? descriptionId : undefined}
                className={cn(
                    'relative flex w-full items-center justify-between rounded-xl border outline-none transition-all duration-150',
                    sizeClasses.trigger,
                    error
                        ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                        : 'border-slate-200 bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/15',
                    disabled &&
                        'cursor-not-allowed opacity-50 bg-slate-50 hover:opacity-50',
                    isOpen && !error && 'border-primary/40 ring-2 ring-primary/15',
                )}
            >
                <div className="flex min-w-0 items-center gap-2">
                    {selectedOption?.icon && (
                        <selectedOption.icon
                            className={cn('shrink-0', sizeClasses.icon)}
                        />
                    )}
                    <span
                        className={cn(
                            'truncate',
                            selectedOption
                                ? 'text-text font-medium'
                                : 'text-slate-400',
                        )}
                    >
                        {selectedOption?.label || placeholder}
                    </span>
                </div>

                <ChevronDown
                    className={cn(
                        'ml-2 shrink-0 transition-transform duration-200',
                        sizeClasses.icon,
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className={cn(
                        'absolute left-0 right-0 z-50 mt-1 w-full rounded-2xl border border-black/5 bg-white shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] ring-1 ring-black/6 animate-in fade-in zoom-in-95 duration-150 ease-out',
                        isFlipped && 'bottom-full mb-1 mt-0',
                    )}
                    role="listbox"
                >
                    <div className="max-h-65 w-full overflow-y-auto select-dropdown-scroll">
                        {/* Search Input */}
                        {showSearch && (
                            <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-3 py-2.5">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                                    <input
                                        ref={searchRef}
                                        type="text"
                                        placeholder="Cari..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs outline-none transition-all focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Options */}
                        {flatOptions.length === 0 ? (
                            <div className="px-4 py-6 text-center">
                                <p className="text-sm text-slate-400">
                                    Tidak ditemukan
                                </p>
                            </div>
                        ) : (
                            <div className="py-1">
                                {options.map((opt, groupIndex) => {
                                    if (isOptionGroup(opt)) {
                                        return (
                                            <div key={opt.group}>
                                                {/* Group Label */}
                                                <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                                                    {opt.group}
                                                </div>

                                                {/* Group Items */}
                                                {opt.items.map(
                                                    (item, itemIndex) => {
                                                        const optionIndex =
                                                            flatOptions.indexOf(
                                                                item,
                                                            );
                                                        const isHighlighted =
                                                            optionIndex ===
                                                            highlightedIndex;
                                                        const isSelected =
                                                            item.value ===
                                                            value;

                                                        return (
                                                            <button
                                                                key={`${opt.group}-${item.value}`}
                                                                type="button"
                                                                role="option"
                                                                aria-selected={isSelected}
                                                                aria-disabled={
                                                                    item.disabled
                                                                }
                                                                data-index={
                                                                    optionIndex
                                                                }
                                                                onMouseEnter={() =>
                                                                    !item.disabled &&
                                                                    setHighlightedIndex(
                                                                        optionIndex,
                                                                    )
                                                                }
                                                                onClick={() => {
                                                                    if (
                                                                        !item.disabled
                                                                    ) {
                                                                        onChange(
                                                                            item.value,
                                                                        );
                                                                        close();
                                                                    }
                                                                }}
                                                                disabled={
                                                                    item.disabled
                                                                }
                                                                className={cn(
                                                                    'w-full px-4 py-2 text-left text-sm transition-colors duration-100',
                                                                    isSelected &&
                                                                        'rounded-lg bg-primary text-white font-medium',
                                                                    isHighlighted &&
                                                                        !isSelected &&
                                                                        'bg-secondary/60',
                                                                    item.disabled &&
                                                                        'text-slate-300 cursor-not-allowed opacity-50',
                                                                )}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    {item.icon && (
                                                                        <item.icon className="h-4 w-4 shrink-0" />
                                                                    )}
                                                                    <div className="min-w-0 flex-1">
                                                                        <p className="truncate">
                                                                            {
                                                                                item.label
                                                                            }
                                                                        </p>
                                                                        {item.description && (
                                                                            <p className="truncate text-xs opacity-75">
                                                                                {
                                                                                    item.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    },
                                                )}
                                            </div>
                                        );
                                    }

                                    // Flat option (not in group)
                                    const optionIndex =
                                        flatOptions.indexOf(opt);
                                    const isHighlighted =
                                        optionIndex === highlightedIndex;
                                    const isSelected =
                                        opt.value === value;

                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="option"
                                            aria-selected={isSelected}
                                            aria-disabled={opt.disabled}
                                            data-index={optionIndex}
                                            onMouseEnter={() =>
                                                !opt.disabled &&
                                                setHighlightedIndex(optionIndex)
                                            }
                                            onClick={() => {
                                                if (!opt.disabled) {
                                                    onChange(opt.value);
                                                    close();
                                                }
                                            }}
                                            disabled={opt.disabled}
                                            className={cn(
                                                'w-full px-4 py-2 text-left text-sm transition-colors duration-100',
                                                isSelected &&
                                                    'rounded-lg bg-primary text-white font-medium',
                                                isHighlighted &&
                                                    !isSelected &&
                                                    'bg-secondary/60',
                                                opt.disabled &&
                                                    'text-slate-300 cursor-not-allowed opacity-50',
                                            )}
                                        >
                                            <div className="flex items-center gap-2">
                                                {opt.icon && (
                                                    <opt.icon className="h-4 w-4 shrink-0" />
                                                )}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate">
                                                        {opt.label}
                                                    </p>
                                                    {opt.description && (
                                                        <p className="truncate text-xs opacity-75">
                                                            {opt.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <p
                    id={errorId}
                    className="mt-1.5 text-xs text-red-500 flex items-center gap-1"
                >
                    <X className="h-3 w-3" />
                    {error}
                </p>
            )}

            {/* Hint Message */}
            {hint && !error && (
                <p id={descriptionId} className="mt-1.5 text-xs text-slate-400">
                    {hint}
                </p>
            )}
        </div>
    );
}
