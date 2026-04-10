// ─────────────────────────────────────────────────────────────
//  Resolve a backend photo `file_path` into a full URL the
//  browser can fetch. The Go backend stores files under its
//  configured UPLOAD_DIR and (when a static handler is added)
//  serves them at `/uploads/...`. The path returned by the
//  upload endpoint is treated as backend-origin-relative.
// ─────────────────────────────────────────────────────────────

function backendOrigin(): string {
  const raw = import.meta.env.VITE_API_URL;
  if (!raw) return ''; // dev: Vite proxy handles it
  // Allow either bare host ("api.example.com") or full URL.
  if (/^https?:\/\//i.test(raw)) return raw.replace(/\/$/, '');
  return `https://${raw.replace(/\/$/, '')}`;
}

export function resolvePhotoUrl(filePath: string | null | undefined): string {
  if (!filePath) return '';
  // Already absolute → use as-is.
  if (/^https?:\/\//i.test(filePath)) return filePath;
  const origin = backendOrigin();
  const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${origin}${path}`;
}
