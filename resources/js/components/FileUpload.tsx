import React, { useCallback, useRef, useState } from 'react';
import { Upload, X, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Props {
    accept?: string;
    maxSize?: number; // in MB
    multiple?: boolean;
    onFilesSelected: (files: File[]) => void;
    className?: string;
    disabled?: boolean;
    label?: string;
}

const FileUpload: React.FC<Props> = ({
    accept,
    maxSize = 10,
    multiple = false,
    onFilesSelected,
    className,
    disabled = false,
    label = 'Click to upload or drag and drop',
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [error, setError] = useState<string | null>(null);

    const validateAndSet = useCallback((files: FileList | null) => {
        if (!files || files.length === 0) return;
        setError(null);
        const arr = Array.from(files);
        const invalid = arr.find(f => f.size > maxSize * 1024 * 1024);
        if (invalid) {
            setError(`File "${invalid.name}" exceeds maximum size of ${maxSize}MB.`);
            return;
        }
        const newFiles = multiple ? arr : [arr[0]];
        setSelectedFiles(newFiles);
        onFilesSelected(newFiles);
    }, [maxSize, multiple, onFilesSelected]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (!disabled) validateAndSet(e.dataTransfer.files);
    }, [disabled, validateAndSet]);

    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); if (!disabled) setDragOver(true); };
    const handleDragLeave = () => setDragOver(false);

    const removeFile = (i: number) => {
        const updated = selectedFiles.filter((_, idx) => idx !== i);
        setSelectedFiles(updated);
        onFilesSelected(updated);
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div
                className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
                onClick={() => !disabled && inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">{label}</p>
                {accept && <p className="text-xs text-muted-foreground mt-1">Accepted: {accept}</p>}
                {maxSize && <p className="text-xs text-muted-foreground">Max size: {maxSize}MB</p>}
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    className="hidden"
                    disabled={disabled}
                    onChange={e => validateAndSet(e.target.files)}
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {selectedFiles.length > 0 && (
                <ul className="space-y-1">
                    {selectedFiles.map((file, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                            <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">{file.name}</span>
                            <span className="text-muted-foreground shrink-0">
                                {(file.size / 1024).toFixed(1)} KB
                            </span>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 shrink-0"
                                onClick={e => { e.stopPropagation(); removeFile(i); }}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileUpload;
