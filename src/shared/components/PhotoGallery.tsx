import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { resolvePhotoUrl } from '@/shared/lib/photo-url';

export interface GalleryPhoto {
  id: string;
  file_path: string;
  file_name?: string;
  created_at?: string;
}

interface Props {
  photos: GalleryPhoto[];
  emptyMessage?: string;
  className?: string;
}

export function PhotoGallery({
  photos,
  emptyMessage = 'No photos yet.',
  className,
}: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  // ── Lightbox keyboard nav (esc / arrows) ─────────────────
  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIdx(null);
      if (e.key === 'ArrowRight') {
        setOpenIdx((idx) => (idx === null ? null : (idx + 1) % photos.length));
      }
      if (e.key === 'ArrowLeft') {
        setOpenIdx((idx) =>
          idx === null ? null : (idx - 1 + photos.length) % photos.length,
        );
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openIdx, photos.length]);

  if (photos.length === 0) {
    return (
      <p className={cn('text-sm text-muted-foreground', className)}>{emptyMessage}</p>
    );
  }

  const active = openIdx !== null ? photos[openIdx] : null;

  return (
    <>
      <div className={cn('grid grid-cols-3 gap-2 sm:grid-cols-4', className)}>
        {photos.map((photo, idx) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setOpenIdx(idx)}
            className="group relative aspect-square overflow-hidden rounded-md border bg-muted"
          >
            <img
              src={resolvePhotoUrl(photo.file_path)}
              alt={photo.file_name ?? 'Photo'}
              loading="lazy"
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpenIdx(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx(null);
            }}
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((idx) =>
                    idx === null ? null : (idx - 1 + photos.length) % photos.length,
                  );
                }}
                className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenIdx((idx) =>
                    idx === null ? null : (idx + 1) % photos.length,
                  );
                }}
                className="absolute right-4 bottom-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div
            className="flex max-h-full max-w-5xl flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={resolvePhotoUrl(active.file_path)}
              alt={active.file_name ?? 'Photo'}
              className="max-h-[80vh] max-w-full rounded-md object-contain shadow-lg"
            />
            {active.file_name && (
              <p className="text-center text-sm text-white/80">{active.file_name}</p>
            )}
            <p className="text-xs text-white/60">
              {(openIdx ?? 0) + 1} / {photos.length}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
