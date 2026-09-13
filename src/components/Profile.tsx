import { useRef, useState, useEffect } from 'react';
import { Camera, ImagePlus, Trash2, Share2 } from 'lucide-react';
import type { LocalProfile } from '../services/profileRepository';
import { saveProfile } from '../services/profileRepository';
import { imageFileToDataUrl } from '../services/imageProcessing';
import { shareProfile } from '../services/profileShareService';
import type { Session } from '../services/apiClient';

export default function Profile({language,profile,onProfile,session=null}:{language:'ar'|'en';profile:LocalProfile;onProfile:(p:LocalProfile)=>void;session?:Session|null}){
 const ar=language==='ar'; const [p,setP]=useState(profile); const [status,setStatus]=useState(''); const [busy,setBusy]=useState(false); const [hasChanges,setHasChanges]=useState(false); const avatarRef=useRef<HTMLInputElement>(null); const bannerRef=useRef<HTMLInputElement>(null);
 
 useEffect(()=>{setP(profile)},[profile]);
 
 useEffect(()=>{
   const changed=p.firstName!==profile.firstName||p.lastName!==profile.lastName||p.email!==profile.email||p.phone!==profile.phone||p.avatarData!==profile.avatarData||p.bannerData!==profile.bannerData;
   setHasChanges(changed);
 },[p,profile]);
 
 const update=(key:keyof LocalProfile,value:string|boolean|number|undefined)=>setP(x=>({...x,[key]:value}));
 const save=async()=>{if(!p.firstName.trim())return;const next=await saveProfile({...p,firstName:p.firstName.trim(),lastName:p.lastName.trim()});setP(next);onProfile(next);setHasChanges(false);setStatus(ar?'تم حفظ الملف محليًا.':'Profile saved locally.');setTimeout(()=>setStatus(''),2500)};
 const image=async(file:File|undefined,key:'avatarData'|'bannerData',maxWidth:number,maxHeight:number)=>{if(!file)return;setBusy(true);try{const data=await imageFileToDataUrl(file,{maxWidth,maxHeight,quality:.82});update(key,data)}catch{setStatus(ar?'تعذر قراءة الصورة.':'Could not process the image.')}finally{setBusy(false)}};
 const share=async()=>{try{await shareProfile(p);setStatus(ar?'تم تجهيز رابط الملف العام.':'Public profile share is ready.')}catch{setStatus(ar?'تعذرت المشاركة.':'Sharing failed.')}};
 return <section className="page-content profile-page">
  <div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / PROFILE</p><h1>{ar?'الملف الشخصي':'Profile'}</h1><p className="subtitle">{ar?'هويتك الشخصية المحلية في TAAMEN.':'Your local identity inside TAAMEN.'}</p></div><div className="setting-actions"><button className="dark-action" onClick={share}><Share2 size={15}/>{ar?'مشاركة عامة':'Public share'}</button><button className="primary-action" onClick={save} disabled={!hasChanges}>{ar?'حفظ الملف':'Save profile'}</button></div></div>
  {status&&<div className="success-banner">{status}</div>}
  <section className="panel profile-hero-card">
   <div className="profile-banner" style={p.bannerData?{backgroundImage:`url(${p.bannerData})`}:undefined}><button type="button" className="banner-action" onClick={()=>bannerRef.current?.click()}><ImagePlus size={15}/>{ar?'تغيير الغلاف':'Change cover'}</button><input ref={bannerRef} hidden type="file" accept="image/*" onChange={e=>image(e.target.files?.[0],'bannerData',2000,760)}/></div>
   <div className="profile-hero-body"><button type="button" className="profile-avatar-button" onClick={()=>avatarRef.current?.click()} aria-label={ar?'تغيير الصورة':'Change photo'}>{p.avatarData?<img src={p.avatarData} alt={ar?'الصورة الشخصية':'Profile avatar'}/>:<span>{p.firstName.slice(0,1).toUpperCase()||'?'}</span>}<i><Camera size={14}/></i></button><input ref={avatarRef} hidden type="file" accept="image/*" onChange={e=>image(e.target.files?.[0],'avatarData',900,900)}/><div className="profile-hero-copy">{session&&<span className="status-chip featured-identity-chip">{ar?(session.member.arabicName||session.member.displayName):session.member.displayName}</span>}<span className="status-chip">{p.emailVerified?(ar?'البريد مؤكد':'Email verified'):(ar?'ملف محلي':'Local profile')}</span><h2>{p.firstName} {p.lastName}</h2><p>{ar?'بياناتك الشخصية محفوظة محليًا ويمكنك مشاركة نسخة عامة آمنة.':'Your personal data stays local; you can share a safe public profile.'}</p></div></div>
  </section>
  <section className="panel profile-edit-panel"><div className="panel-heading"><div><p className="eyebrow">{ar?'معلومات الملف':'PROFILE INFORMATION'}</p><h2>{ar?'تحرير الملف':'Edit profile'}</h2></div></div><div className="form-grid"><label>{ar?'الاسم الأول':'First name'} *<input value={p.firstName} onChange={e=>update('firstName',e.target.value)} /></label><label>{ar?'اسم العائلة':'Family / last name'} <span className="optional">{ar?'اختياري':'Optional'}</span><input value={p.lastName} onChange={e=>update('lastName',e.target.value)} /></label><label>{ar?'الهاتف':'Phone'} <span className="optional">{ar?'اختياري':'Optional'}</span><input value={p.phone} onChange={e=>update('phone',e.target.value)} placeholder={ar?'غير مضاف':'Not added'} /></label><label>{ar?'البريد الإلكتروني':'Email'} <span className="optional">{ar?'اختياري':'Optional'}</span><input value={p.email} type="email" onChange={e=>update('email',e.target.value)} placeholder={ar?'غير مضاف':'Not added'} /></label></div><div className="profile-tools"><button className="text-button" onClick={()=>update('avatarData','')} disabled={!p.avatarData}><Trash2 size={14}/>{ar?'إزالة الصورة':'Remove photo'}</button><button className="text-button" onClick={()=>update('bannerData','')} disabled={!p.bannerData}><Trash2 size={14}/>{ar?'إزالة الغلاف':'Remove cover'}</button>{busy&&<span className="settings-note">{ar?'جاري معالجة الصورة…':'Processing image…'}</span>}</div></section>
 </section>;
}
