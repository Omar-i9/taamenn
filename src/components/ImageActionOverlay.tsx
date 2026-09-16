import { Camera, Eye, X } from 'lucide-react';
import { uiCopy, type Language } from '../i18n/translations';
import { useOverlayPresence } from '../motion/useOverlayPresence';

export function ImageActionSheet({
  language,
  canView,
  onView,
  onEdit,
  onClose,
}: {
  language: Language;
  canView: boolean;
  onView: () => void;
  onEdit: () => void;
  onClose: () => void;
}) {
  const copy = uiCopy[language];
  const { backdropRef, panelRef, requestClose } = useOverlayPresence<HTMLButtonElement, HTMLElement>('sheet', onClose);
  return (
    <div className="overlay image-action-overlay" role="dialog" aria-modal="true" aria-labelledby="image-action-title">
      <button ref={backdropRef} className="overlay-backdrop" onClick={requestClose} aria-label={copy.closeViewer} />
      <aside ref={panelRef} className="image-action-sheet">
        <p className="eyebrow" id="image-action-title">TAAMEN / PHOTO</p>
        {canView && (
          <button type="button" className="image-action-item" onClick={onView}>
            <Eye size={16} />
            {copy.viewImage}
          </button>
        )}
        <button type="button" className="image-action-item" onClick={() => { onEdit(); requestClose(); }}>
          <Camera size={16} />
          {copy.editImage}
        </button>
        <button type="button" className="text-button" onClick={requestClose}>{copy.closeViewer}</button>
      </aside>
    </div>
  );
}

export function ImageViewer({
  src,
  alt,
  language,
  onClose,
}: {
  src: string;
  alt: string;
  language: Language;
  onClose: () => void;
}) {
  const copy = uiCopy[language];
  const { backdropRef, panelRef, requestClose } = useOverlayPresence<HTMLButtonElement, HTMLDivElement>('modal', onClose);
  return (
    <div className="overlay image-viewer-overlay" role="dialog" aria-modal="true" aria-label={alt}>
      <button ref={backdropRef} className="overlay-backdrop" onClick={requestClose} aria-label={copy.closeViewer} />
      <div ref={panelRef} className="image-viewer-frame">
        <button type="button" className="icon-button image-viewer-close" onClick={requestClose} aria-label={copy.closeViewer}>
          <X size={18} />
        </button>
        <img src={src} alt={alt} />
      </div>
    </div>
  );
}
