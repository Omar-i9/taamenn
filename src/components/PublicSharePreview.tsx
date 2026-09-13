import { useMemo, useState } from 'react';
import { ArrowDownToLine, Check, Shield, X, Trophy } from 'lucide-react';
import { decodeMatchShare } from '../services/shareService';
import { decodeProfileShare } from '../services/profileShareService';
import { putItem } from '../services/localDb';
import { TAAMEN_LOGO_ALT, TAAMEN_LOGO_SRC } from '../config/branding';
import type { Language } from '../i18n/translations';

export default function PublicSharePreview({language,kind,token}:{language:Language;kind:'match'|'profile';token:string}){
 const ar=language==='ar'; 
 const data:any=useMemo(()=>kind==='match'?decodeMatchShare(token):decodeProfileShare(token),[kind,token]);
 const [destination,setDestination]=useState<'match-center'|'archive'>('match-center');
 const [importing,setImporting]=useState(false);
 const [imported,setImported]=useState(false);
 
 if(!data)return <div className="access-screen"><div className="access-card"><span className="eyebrow">TAAMEN / SHARE</span><h1>{ar?'الرابط غير صالح':'Invalid share link'}</h1><p>{ar?'تعذر التحقق من بيانات المشاركة.':'The share payload could not be validated.'}</p></div></div>;
 
 if(imported)return <div className="access-screen"><div className="access-card"><span className="eyebrow">TAAMEN / SHARE</span><h1>{ar?'تمت الإضافة بنجاح':'Successfully Added'}</h1><p>{ar?'تم حفظ المباراة محليًا.':'The match has been saved locally.'}</p><button className="primary-action" onClick={()=>location.href='/'}>{ar?'العودة للرئيسية':'Return to Home'}</button></div></div>;
 
 const add=async()=>{
   if(kind!=='match')return;
   setImporting(true);
   try{
     const store=destination==='match-center'?'matches':'archive';
     const id=`IMPORTED-${Date.now()}`;
     await putItem(store,{...data,visibility:'LOCAL',id,status:destination==='archive'?'ARCHIVED':data.status});
     setImported(true);
   }catch(e){
     console.error('Import failed:',e);
     alert(ar?'فشلت الإضافة.':'Import failed.');
   }finally{
     setImporting(false);
   }
 };
 
 const hasContributions=data.playerContributions&&(data.playerContributions.team1?.length>0||data.playerContributions.team2?.length>0);
 
 return <div className="access-screen"><div className="access-card share-preview-screen"><div className="access-brand"><div className="brand-mark"><img src={TAAMEN_LOGO_SRC} alt={TAAMEN_LOGO_ALT}/></div><div><b>TAAMEN 2.0</b><small>PUBLIC SHARE</small></div></div>{kind==='profile'?<div className="shared-profile-card">{data.bannerData&&<div className="shared-profile-banner" style={{backgroundImage:`url(${data.bannerData})`}}/>}{data.avatarData&&<img className="shared-profile-avatar" src={data.avatarData} alt=""/>}<span className="eyebrow">PUBLIC PROFILE</span><h1>{data.displayName}</h1>{data.publicRole&&<span className="status-chip">{data.publicRole}</span>}<p className="settings-note">{ar?'هذه معاينة عامة آمنة؛ لا تحتوي البريد أو الهاتف أو بيانات الفريق الخاص.':'Safe public preview. Email, phone and private team data are excluded.'}</p></div>:<div className="shared-match-card"><span className="eyebrow">{String(data.type||'normal').toUpperCase()}</span><h1>{data.title||`${data.team1} × ${data.team2}`}</h1><div className="scoreline"><strong>{data.team1}</strong><b>{data.status==='UPCOMING'?'VS':`${data.score1}:${data.score2}`}</b><strong>{data.team2}</strong></div><p>{data.dateLabel} · {data.time||'—'} · {data.stadium||'—'} · {data.city||'—'}</p>{hasContributions&&<div className="contributions-note"><Trophy size={14}/><span>{ar?'يتضمن مساهمات اللاعبين':'Includes player contributions'}</span></div>}<div className="destination-choice"><label className="radio-option"><input type="radio" name="destination" value="match-center" checked={destination==='match-center'} onChange={()=>setDestination('match-center')}/><span>{ar?'مركز المباريات':'Match Center'}</span></label><label className="radio-option"><input type="radio" name="destination" value="archive" checked={destination==='archive'} onChange={()=>setDestination('archive')}/><span>{ar?'السجل':'Archive'}</span></label></div><div className="share-actions"><button className="primary-action" onClick={add} disabled={importing}><Check size={15}/>{importing?(ar?'جاري الإضافة…':'Adding…'):(ar?'إضافة المباراة':'Add Match')}</button><button className="text-button" onClick={()=>location.href='/'}>{ar?'تجاهل والعودة':'Ignore & Continue'}</button></div><p className="settings-note">{ar?'لن تُضاف المباراة إلا بعد تأكيدك.':'The match is saved only after your confirmation.'}</p></div>}</div></div>;
}
