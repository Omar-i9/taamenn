import type { LocalProfile } from './profileRepository';

const SAFE_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,/i;

export type PublicProfileShare={v:2;type:'profile';displayName:string;avatarData?:string;bannerData?:string;publicRole?:string};

function safeImage(value:unknown,max:number):string|undefined{
  if(typeof value!=='string'||value.length>max||!SAFE_IMAGE.test(value))return undefined;
  return value;
}

export function makePublicProfilePayload(p:LocalProfile,publicRole?:string):PublicProfileShare{
  return {
    v:2,
    type:'profile',
    displayName:[p.firstName,p.lastName].filter(Boolean).join(' ').trim().slice(0,120),
    avatarData:safeImage(p.avatarData,300_000),
    bannerData:safeImage(p.bannerData,500_000),
    publicRole:publicRole||undefined,
  };
}

export function decodeProfileShare(token:string):PublicProfileShare|null{
  try{
    const x=JSON.parse(decode(token));
    if(!x||x.v!==2||x.type!=='profile'||typeof x.displayName!=='string'||x.displayName.length>120)return null;
    return {
      v:2,
      type:'profile',
      displayName:x.displayName,
      avatarData:safeImage(x.avatarData,300_000),
      bannerData:safeImage(x.bannerData,500_000),
      publicRole:typeof x.publicRole==='string'?x.publicRole.slice(0,80):undefined,
    };
  }catch{
    return null;
  }
}

function encode(raw:string){const bytes=new TextEncoder().encode(raw);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function decode(payload:string){const pad=payload+'='.repeat((4-payload.length%4)%4);const bin=atob(pad.replaceAll('-','+').replaceAll('_','/'));return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))}
export function profileShareUrl(p:LocalProfile,publicRole?:string){return `${location.origin}/share/profile/${encode(JSON.stringify(makePublicProfilePayload(p,publicRole)))}`}
export async function shareProfile(p:LocalProfile,publicRole?:string){const url=profileShareUrl(p,publicRole);if(navigator.share){await navigator.share({title:p.firstName?`${p.firstName} · TAAMEN`:'TAAMEN Profile',text:'TAAMEN public profile',url});return 'shared'}await navigator.clipboard?.writeText(url);return 'copied'}
