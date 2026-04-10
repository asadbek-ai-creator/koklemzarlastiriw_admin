import { useCallback, useEffect, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface Props {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  disabled?: boolean;
  className?: string;
}

interface Preview {
  file: File;
  url: string;
}

export function PhotoUploader({
  value,
  onChange,
  maxFiles = 8,
  accept = 'image/*',
  disabled = false,
  className,
}: Props) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<Preview[]>([]);

  // Keep previews in sync with `value`. Revoke object URLs when
  // the file list changes or the component unmounts.
  useEffect(() => {
    const next: Preview[] = value.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setPreviews(next);
    return () => {
      next.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [value]);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      if (disabled) return;
      const list = Array.from(incoming).filter((f) => f.type.startsWith('image/'));
      if (list.length === 0) return;
      const merged = [...value, ...list].slice(0, maxFiles);
      onChange(merged);
    },
    [disabled, maxFiles, onChange, value],
  );

  const removeAt = (idx: number) => {
    if (disabled) return;
    const next = value.slice();
    next.splice(idx, 1);
    onChange(next);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleClickZone = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const reachedLimit = value.length >= maxFiles;

  return (
    <div className={cn('space-y-3', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClickZone}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClickZone()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/30 bg-muted/20 px-4 py-6 text-center transition-colors',
          'hover:border-muted-foreground/60 hover:bg-muted/40',
          isDragging && 'border-primary bg-primary/5',
          disabled && 'cursor-not-allowed opacity-50',
          reachedLimit && 'pointer-events-none opacity-60',
        )}
      >
        <ImagePlus className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm font-medium">
          {reachedLimit
            ? t('photoUploader.maxReached', { max: maxFiles })
            : t('photoUploader.dropOrBrowse')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('photoUploader.selected', { count: value.length, max: maxFiles })} · {t('photoUploader.formats')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            // Reset so re-selecting the same file fires `onChange`.
            e.target.value = '';
          }}
        />
      </div>

      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((preview, idx) => (
            <div
              key={preview.url}
              className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
            >
              <img
                src={preview.url}
                alt={preview.file.name}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeAt(idx);
                }}
                disabled={disabled}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground opacity-0 shadow transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
