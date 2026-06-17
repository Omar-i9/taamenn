import { $, toast } from './ui.js';

let lastBlob = null;
let lastFile = null;
let lastUrl = null;

function showFloatingPreview(url) {
  const panel = $('#captureShareDock');
  const img = $('#capturePreview');
  if (!panel || !img) return;
  img.src = url;
  panel.classList.add('show');
}

async function captureActivePage() {
  const page = document.querySelector('.page.active') || document.querySelector('.app-shell');
  if (!page || typeof html2canvas !== 'function') {
    toast('التقاط الصورة غير متاح في هذا المتصفح', { kind: 'error', icon: 'fa-camera' });
    return null;
  }
  toast('جاري تجهيز لقطة من الصفحة...', { icon: 'fa-camera' });
  const canvas = await html2canvas(page, {
    backgroundColor: null,
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    useCORS: true,
    logging: false
  });
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.96));
}

async function makeScreenshot() {
  const blob = await captureActivePage();
  if (!blob) return null;
  if (lastUrl) URL.revokeObjectURL(lastUrl);
  lastBlob = blob;
  lastFile = new File([blob], `taamen-shot-${Date.now()}.png`, { type: 'image/png' });
  lastUrl = URL.createObjectURL(blob);
  showFloatingPreview(lastUrl);
  return lastFile;
}

async function shareLast() {
  if (!lastFile) await makeScreenshot();
  if (!lastFile) return;

  if (navigator.canShare?.({ files: [lastFile] }) && navigator.share) {
    await navigator.share({
      title: 'تأمين 2026',
      text: 'لقطة من موقع تأمين 2026',
      files: [lastFile]
    }).catch(() => {});
    return;
  }

  const a = document.createElement('a');
  a.href = lastUrl;
  a.download = lastFile.name;
  a.click();
  toast('متصفحك لا يدعم مشاركة الصور مباشرة، تم تنزيل اللقطة بدل ذلك.', { icon: 'fa-download' });
}

export function initShareCapture() {
  $('#capturePageBtn')?.addEventListener('click', makeScreenshot);
  $('#shareCaptureBtn')?.addEventListener('click', shareLast);
  $('#closeCaptureDock')?.addEventListener('click', () => $('#captureShareDock')?.classList.remove('show'));

  document.addEventListener('keydown', event => {
    if (event.key === 'PrintScreen') {
      toast('الموقع لا يستطيع قراءة لقطة النظام لأسباب خصوصية. استخدم زر الكاميرا العائم لالتقاط صفحة الموقع.', { icon: 'fa-user-shield', duration: 5200 });
    }
  });
}
