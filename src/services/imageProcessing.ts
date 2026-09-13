export async function imageFileToDataUrl(file: File, options:{maxWidth?:number;maxHeight?:number;quality?:number}={}) {
  const maxWidth = options.maxWidth ?? 1600;
  const maxHeight = options.maxHeight ?? 1200;
  const quality = options.quality ?? .84;
  if (!file.type.startsWith('image/')) throw new Error('Unsupported image');
  const source = await new Promise<HTMLImageElement>((resolve,reject)=>{
    const url=URL.createObjectURL(file); const img=new Image();
    img.onload=()=>{URL.revokeObjectURL(url);resolve(img)};
    img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Image decode failed'))};
    img.src=url;
  });
  const ratio=Math.min(1,maxWidth/source.naturalWidth,maxHeight/source.naturalHeight);
  const canvas=document.createElement('canvas');
  canvas.width=Math.max(1,Math.round(source.naturalWidth*ratio));
  canvas.height=Math.max(1,Math.round(source.naturalHeight*ratio));
  const ctx=canvas.getContext('2d'); if(!ctx) throw new Error('Canvas unavailable');
  ctx.drawImage(source,0,0,canvas.width,canvas.height);
  return canvas.toDataURL('image/webp',quality);
}
