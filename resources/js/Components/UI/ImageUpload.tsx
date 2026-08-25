import { ImageIcon, UploadCloud, X } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import type {DragEvent} from 'react';

interface ImageUploadProps {
    label: string;
    helperText?: string;
    file: File | null;
    existingImage?: string | null;
    error?: string;
    onFileChange: (file: File | null) => void;
    onRemoveExisting?: () => void;
}

export default function ImageUpload({
    label,
    helperText,
    file,
    existingImage = null,
    error,
    onFileChange,
    onRemoveExisting,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const previewUrl = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file],
    );

    useEffect(() => {
        if (previewUrl === null) {
            return;
        }

        return () => {
            URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const displayImage = useMemo(() => {
        if (previewUrl !== null) {
            return previewUrl;
        }

        return existingImage;
    }, [existingImage, previewUrl]);

    const handleSelect = (selectedFile: File | null): void => {
        onFileChange(selectedFile);
    };

    const handleDrop = (event: DragEvent<HTMLButtonElement>): void => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];

        if (droppedFile) {
            handleSelect(droppedFile);
        }
    };

    return (
        <div>
            <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">
                    {label}
                </label>
                {helperText && (
                    <span className="text-xs text-slate-500">{helperText}</span>
                )}
            </div>

            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                className={`group relative flex w-full flex-col overflow-hidden rounded-3xl border border-dashed border-slate-200 bg-slate-50 text-left transition hover:border-primary/40 hover:bg-primary/5 ${
                    error ? 'ring-2 ring-red-200' : ''
                }`}
            >
                <div className="aspect-4/3 w-full bg-slate-100">
                    {displayImage ? (
                        <img
                            src={displayImage}
                            alt={label}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-primary shadow-sm ring-1 ring-black/5">
                                <ImageIcon className="h-8 w-8" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">
                                    Drag & drop gambar di sini
                                </p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                    JPEG, PNG, atau WEBP max 2MB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
                    <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-800">
                            {file?.name ?? 'Klik untuk upload atau ganti gambar'}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                            {displayImage ? 'Preview aktif' : 'Belum ada gambar'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {displayImage && onRemoveExisting && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onFileChange(null);
                                    onRemoveExisting();
                                }}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 transition hover:bg-red-100"
                            >
                                <X className="h-4 w-4" />
                            </span>
                        )}
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary transition group-hover:scale-105">
                            <UploadCloud className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                    const selectedFile = event.target.files?.[0] ?? null;
                    handleSelect(selectedFile);
                }}
            />

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
}
