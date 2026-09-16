import { getAll, putItem, deleteItem } from './localDb';
import type { StoreName } from './localDb';
import { copyPngToClipboard, type ClipboardCopyResult } from './clipboardImage';
export type LocalCapture = { id:string; blob:Blob; createdAt:number; name:string; width?:number; height?:number };
export type { ClipboardCopyResult };
export { copyPngToClipboard };
const STORE:StoreName='screenshots';
function fromDataUrl(dataUrl:string){const [head,body]=dataUrl.split(',');const mime=head.match(/data:([^;]+)/)?.[1]||'image/png';const bytes=atob(body);const arr=new Uint8Array(bytes.length);for(let i=0;i<bytes.length;i++)arr[i]=bytes.charCodeAt(i);return new Blob([arr],{type:mime})}
export async function importScreenshot(file:File){if(!file.type.startsWith('image/'))throw new Error('invalid-image');if(file.size>8*1024*1024)throw new Error('image-too-large');const item:LocalCapture={id:crypto.randomUUID(),blob:file.slice(),createdAt:Date.now(),name:file.name||'TAAMEN capture'};await putItem(STORE,item);return item}
export async function saveCapture(data:string|Blob,name='TAAMEN capture',meta?:{width?:number;height?:number}){
  const blob=typeof data==='string'?fromDataUrl(data):data;
  if(!(blob instanceof Blob) || blob.size===0)throw new Error('capture-empty');
  if(blob.size>8*1024*1024)throw new Error('capture-too-large');
  const item:LocalCapture={id:crypto.randomUUID(),blob,createdAt:Date.now(),name,width:meta?.width,height:meta?.height};
  await putItem(STORE,item);
  return item;
}

export async function listCaptures(){return getAll<LocalCapture>(STORE)}
export async function removeCapture(id:string){await deleteItem(STORE,id)}
export async function clearCaptures(){const all=await listCaptures();await Promise.all(all.map(x=>removeCapture(x.id)))}
export function objectUrl(item:LocalCapture){
  if(!(item.blob instanceof Blob)) throw new Error('capture-missing-blob');
  return URL.createObjectURL(item.blob);
}
export async function shareCapture(item:LocalCapture){const file=new File([item.blob],`${item.name.replace(/\.[^.]+$/,'')}.png`,{type:item.blob.type||'image/png'});if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({title:'TAAMEN',text:'TAAMEN capture',files:[file]});return true}return false}
export function downloadCapture(item:LocalCapture){const url=objectUrl(item);const a=document.createElement('a');a.href=url;a.download=`${item.name.replace(/\.[^.]+$/,'')}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
