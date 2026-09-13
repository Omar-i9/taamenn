import type { LocalProfile } from './profileRepository';

export type PublicProfileShare={v:2;type:'profile';displayName:string;avatarData?:string;bannerData?:string;publicRole?:string};
export function makePublicProfilePayload(p:LocalProfile,publicRole?:string):PublicProfileShare{return {v:2,type:'profile',displayName:[p.firstName,p.lastName].filter(Boolean).join(' ').trim().slice(0,120),avatarData:p.avatarData&&p.avatarData.length<=300_000?p.avatarData:undefined,bannerData:p.bannerData&&p.bannerData.length<=500_000?p.bannerData:undefined,publicRole:publicRole||undefined}}
export function decodeProfileShare(token:string):PublicProfileShare|null{try{const x=JSON.parse(decode(token));if(!x||x.v!==2||x.type!=='profile'||typeof x.displayName!=='string'||x.displayName.length>120)return null;return x as PublicProfileShare}catch{return null}}
function encode(raw:string){const bytes=new TextEncoder().encode(raw);let bin='';bytes.forEach(b=>bin+=String.fromCharCode(b));return btoa(bin).replaceAll('+','-').replaceAll('/','_').replaceAll('=','')}
function decode(payload:string){const pad=payload+'='.repeat((4-payload.length%4)%4);const bin=atob(pad.replaceAll('-','+').replaceAll('_','/'));return new TextDecoder().decode(Uint8Array.from(bin,c=>c.charCodeAt(0)))}
export function profileShareUrl(p:LocalProfile,publicRole?:string){return `${location.origin}/share/profile/${encode(JSON.stringify(makePublicProfilePayload(p,publicRole)))}`}
export async function shareProfile(p:LocalProfile,publicRole?:string){const url=profileShareUrl(p,publicRole);if(navigator.share){await navigator.share({title:p.firstName?`${p.firstName} · TAAMEN`:'TAAMEN Profile',text:'TAAMEN public profile',url});return 'shared'}await navigator.clipboard?.writeText(url);return 'copied'}
