export async function html2canvas(target: HTMLElement): Promise<HTMLCanvasElement> {
  // Lightweight in-app capture fallback: serializes the visible document into an SVG foreignObject.
  // Browsers may restrict foreignObject; callers can then use Import Screenshot as the guaranteed fallback.
  const rect=target.getBoundingClientRect();
  const clone=target.cloneNode(true) as HTMLElement;
  clone.style.margin='0'; clone.style.width=`${rect.width}px`; clone.style.background=getComputedStyle(target).backgroundColor || '#07111f';
  const serialized=new XMLSerializer().serializeToString(clone);
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${target.scrollHeight}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
  const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'}); const url=URL.createObjectURL(blob);
  try { const img=new Image(); await new Promise<void>((resolve,reject)=>{img.onload=()=>resolve();img.onerror=()=>reject(new Error('capture-unavailable'));img.src=url}); const canvas=document.createElement('canvas'); canvas.width=Math.ceil(rect.width*devicePixelRatio); canvas.height=Math.ceil(target.scrollHeight*devicePixelRatio); const ctx=canvas.getContext('2d'); if(!ctx)throw new Error('capture-unavailable'); ctx.scale(devicePixelRatio,devicePixelRatio); ctx.drawImage(img,0,0); return canvas; } finally { URL.revokeObjectURL(url); }
}
