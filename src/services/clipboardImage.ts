export type ClipboardCopyResult = 'copied' | 'unavailable';

/**
 * Image clipboard write is independent of IndexedDB persistence.
 * A rejected or missing clipboard API is not a capture failure.
 */
export async function copyPngToClipboard(blob: Blob | Promise<Blob>): Promise<ClipboardCopyResult> {
  if (typeof navigator === 'undefined' || typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) return 'unavailable';
  try {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    return 'copied';
  } catch {
    return 'unavailable';
  }
}
