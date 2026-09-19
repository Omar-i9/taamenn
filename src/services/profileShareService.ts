import type { LocalProfile } from './profileRepository';

const SAFE_IMAGE = /^data:image\/(png|jpe?g|gif|webp);base64,/i;
/** Stay under common 16KB request-URI limits (Cloudflare / proxies). Encoding is not encryption. */
export const MAX_PROFILE_SHARE_TOKEN = 8000;

export type PublicProfileShare={v:2;type:'profile';displayName:string;avatarData?:string;bannerData?:string;publicRole?:string};
export type ProfileShareMethod='shared'|'copied'|'url'|'cancelled';

function safeImage(value:unknown,max:number):string|undefined{
  if(typeof value!=='string'||value.length>max||!SAFE_IMAGE.test(value))return undefined;
  return value;
}

function looksPrivate(value:string){
  return value.includes('@') || /^\+?\d{8,}$/.test(value.replace(/\s+/g,''));
}

export function makePublicProfilePayload(p:LocalProfile,publicRole?:string,options:{includeAvatar?:boolean;includeBanner?:boolean}={}):PublicProfileShare{
  const includeAvatar=options.includeAvatar!==false;
  const includeBanner=options.includeBanner!==false;
  return {
    v:2,
    type:'profile',
    displayName:[p.firstName,p.lastName].filter(Boolean).join(' ').trim().slice(0,120),
    avatarData:includeAvatar?safeImage(p.avatarData,300_000):undefined,
    bannerData:includeBanner?safeImage(p.bannerData,500_000):undefined,
    publicRole:publicRole||undefined,
  };
}

export function decodeProfileShare(token:string):PublicProfileShare|null{
  try{
    if(!token||token.length>MAX_PROFILE_SHARE_TOKEN*2)return null;
    const x=JSON.parse(decode(token));
    if(!x||x.v!==2||x.type!=='profile'||typeof x.displayName!=='string')return null;
    const displayName=x.displayName.trim();
    if(!displayName||displayName.length>120||looksPrivate(displayName))return null;
    if(typeof x.email==='string'||typeof x.phone==='string'||typeof x.memberCode==='string'){
      /* Private fields in a crafted token are ignored, never rendered. */
    }
    return {
      v:2,
      type:'profile',
      displayName,
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

export function encodeProfileShare(payload:PublicProfileShare){
  return encode(JSON.stringify(payload));
}

export function profileShareUrl(p:LocalProfile,publicRole?:string,origin=typeof location!=='undefined'?location.origin:''){
  const attempts:PublicProfileShare[]=[
    makePublicProfilePayload(p,publicRole),
    makePublicProfilePayload(p,publicRole,{includeBanner:false}),
    makePublicProfilePayload(p,publicRole,{includeAvatar:false,includeBanner:false}),
  ];
  let token=encodeProfileShare(attempts[0]);
  for(const payload of attempts){
    token=encodeProfileShare(payload);
    if(token.length<=MAX_PROFILE_SHARE_TOKEN)break;
  }
  if(token.length>MAX_PROFILE_SHARE_TOKEN){
    token=encodeProfileShare(makePublicProfilePayload(p,publicRole,{includeAvatar:false,includeBanner:false}));
  }
  return `${origin}/share/profile/${token}`;
}

export async function shareProfile(p:LocalProfile,publicRole?:string):Promise<{method:ProfileShareMethod;url:string}>{
  const url=profileShareUrl(p,publicRole);
  try{
    if(navigator.share){
      await navigator.share({title:p.firstName?`${p.firstName} · TAAMEN`:'TAAMEN Profile',text:'TAAMEN public profile',url});
      return {method:'shared',url};
    }
  }catch(error){
    if(error instanceof DOMException && error.name==='AbortError')return {method:'cancelled',url};
  }
  try{
    if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(url);
      return {method:'copied',url};
    }
  }catch{
    /* the URL is still returned for on-screen copy */
  }
  return {method:'url',url};
}
