const TZ = 'Asia/Jerusalem';
export function parseDateKey(dateKey:number){const s=String(dateKey).padStart(8,'0');return `${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`;}
export function formatMatchDate(dateISO:string|undefined,dateKey:number,language:'ar'|'en'){
  const iso=dateISO || parseDateKey(dateKey);
  const d=new Date(`${iso.slice(0,10)}T12:00:00Z`);
  return { weekday:d.toLocaleDateString(language==='ar'?'ar-PS':'en-US',{weekday:'long',timeZone:TZ}), date:d.toLocaleDateString(language==='ar'?'ar-PS':'en-US',{day:'numeric',month:'long',year:'numeric',timeZone:TZ}) };
}
export function formatMatchTime(time:string|undefined){return time || '—';}
export const PALESTINE_TIMEZONE=TZ;
