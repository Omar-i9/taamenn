import { useEffect, useRef, useState } from 'react';
import { Accessibility, Bell, Database, Globe2, Mail, Moon, RotateCcw, Smartphone, Trash2, Download, Upload, HardDrive, Wifi, BadgeCheck, LogOut, X, AlertTriangle, BookOpen, CheckCircle2, XCircle, LifeBuoy } from 'lucide-react';
import type { LocalProfile } from '../services/profileRepository';
import { saveProfile } from '../services/profileRepository';
import { clearNotifications } from '../services/notificationService';
import { getItem, putItem, exportTaamenBackup, importTaamenBackup } from '../services/localDb';
import { installService } from '../infrastructure/pwa/installService';
import { CaptureWallet } from '../components/CaptureWallet';
import FeaturedMember from '../components/FeaturedMember';
import HowToGuide from '../components/HowToGuide';
import PrivateCirclePanel from '../components/PrivateCirclePanel';
import OwnerPanel from '../components/OwnerPanel';
import type { Session } from '../services/apiClient';
import { resetTaamenComplete, type ResetResult } from '../services/resetService';
import Support from './Support';

type PrivacyPrefs={notifications?:boolean;analytics?:boolean;preferences?:boolean;motion?:boolean};

export default function Settings({language,profile,onLanguage,onReset,onProfile,session=null,onSession,onSignOut}:{language:'ar'|'en';profile:LocalProfile;onLanguage:()=>void;onReset:()=>void;onProfile:(p:LocalProfile)=>void;session?:Session|null;onSession:(s:Session)=>void;onSignOut:()=>void}){
 const ar=language==='ar';
 const recognized=session?.authMethod==='code';
 const isOwner=session?.authMethod==='password'&&session.member.role==='OWNER';
 const [p,setP]=useState(profile); const [showRecognition,setShowRecognition]=useState(false);
 const [notify,setNotify]=useState(true); const [analytics,setAnalytics]=useState(false); const [preferences,setPreferences]=useState(true); const [motion,setMotion]=useState(true);
 const [status,setStatus]=useState(''); const restoreRef=useRef<HTMLInputElement>(null);
 const [showResetModal,setShowResetModal]=useState(false); const [resetting,setResetting]=useState(false);
 const [resetResult,setResetResult]=useState<ResetResult | null>(null);
 const [showGuide,setShowGuide]=useState(false);
 const [showSupport,setShowSupport]=useState(false);
 useEffect(()=>{setP(profile)},[profile]);
 useEffect(()=>{getItem<PrivacyPrefs&{id:string}>('settings','privacy').then(v=>{if(v){setNotify(v.notifications!==false);setAnalytics(Boolean(v.analytics));setPreferences(v.preferences!==false);setMotion(v.motion!==false)}})},[]);
 const persistPrefs=(next:PrivacyPrefs)=>putItem('settings',{id:'privacy',notifications:notify,analytics,preferences,motion,...next});
 const saveEmail=async(email:string)=>{const next=await saveProfile({...p,email:email.trim(),emailVerified:false,verifiedAt:undefined});setP(next);onProfile(next)};
 const backup=async()=>{try{const data=await exportTaamenBackup();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`taamen-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);setStatus(ar?'تم تصدير النسخة الاحتياطية.':'Backup exported.')}catch{setStatus(ar?'تعذر تصدير النسخة الاحتياطية.':'Backup export failed.')}};
 const restore=async(file?:File)=>{if(!file)return;try{await importTaamenBackup(JSON.parse(await file.text()));setStatus(ar?'تم استيراد البيانات.':'Data imported.');setTimeout(()=>location.reload(),500)}catch{setStatus(ar?'ملف النسخة الاحتياطية غير صالح.':'Invalid backup file.')}};
 const startReset=()=>{setShowResetModal(true);setResetting(false);setResetResult(null)};
 const handleBackdropClick=(e:React.MouseEvent)=>{if(e.target===e.currentTarget)!resetting&&setShowResetModal(false)};
 const executeReset=async()=>{
  setResetting(true);
  try{
    const result=await resetTaamenComplete();
    setResetResult(result);
    if(result.success){
      await onReset();
      setShowResetModal(false);
      setTimeout(()=>location.reload(),100);
    }else{
      setResetting(false);
    }
  }catch{
    setResetResult({success:false,clearedStores:[],errors:['Reset process failed unexpectedly']});
    setResetting(false);
  }
};
 if(showRecognition&&!session)return <FeaturedMember language={language} onClose={()=>setShowRecognition(false)} onRecognized={next=>{onSession(next);setShowRecognition(false)}}/>;
 if(showSupport)return <Support language={language} profile={profile} onBack={()=>setShowSupport(false)}/>;
 return <section className="page-content settings-page">
   <div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / SETTINGS</p><h1>{ar?'الإعدادات':'Settings'}</h1><p className="subtitle">{ar?'تحكم بالتجربة والبيانات المحلية والخصوصية دون حساب للمستخدم العادي.':'Control your local TAAMEN experience, data and privacy without a normal-user account.'}</p></div><div className="setting-actions"><button className="dark-action" onClick={()=>setShowGuide(true)}><BookOpen size={15}/>{ar?'دليل الاستخدام':'How-to Guide'}</button></div></div>
   {status&&<div className="success-banner">{status}</div>}
   {showResetModal&&<div className="overlay" role="dialog" aria-modal="true"><div className="overlay-backdrop" onClick={handleBackdropClick}/><div className="modal-card danger-modal"><div className="panel-heading"><div><p className="eyebrow">SECURITY & DATA</p><h2>{ar?'إعادة ضبط بيانات TAAMEN':'Reset TAAMEN Data'}</h2></div><button className="icon-button" onClick={()=>!resetting&&setShowResetModal(false)} disabled={resetting}><X/></button></div><div className="danger-modal-content">{!resetResult?<>
    <AlertTriangle size={32} className="danger-icon"/>
    <p>{ar?'سيؤدي هذا الإجراء إلى حذف جميع بيانات TAAMEN المحلية من هذا المتصفح وإعادة التطبيق إلى حالته الأولية.':'This action will remove all TAAMEN local data from this browser and return the application to its initial setup state.'}</p>
    <div className="reset-scope">
      <strong>{ar?'سيتم حذف:':'Will be removed:'}</strong>
      <ul>
        <li>{ar?'الملف الشخصي والصورة والغلاف':'Profile, avatar, and banner'}</li>
        <li>{ar?'المباريات الحالية والمؤرشفة':'Current and archived matches'}</li>
        <li>{ar?('البيانات التكتيكية والمخططات'):'Tactical data and plans'}</li>
        <li>{ar?'الإشعارات المحلية':'Local notifications'}</li>
        <li>{ar?('التفضيلات والإعدادات واللغة'):'Preferences, settings, and language'}</li>
        <li>{ar?'حالة الموافقة على السياسة':'Privacy consent state'}</li>
        <li>{ar?'الجلسة الحالية على هذا المتصفح':'The current session on this browser'}</li>
      </ul>
    </div>
    <div className="reset-not-removed">
      <strong>{ar?'لن يتم حذف:':'Will NOT be removed:'}</strong>
      <ul>
        <li>{ar?'بيانات المواقع الأخرى':'Other websites\' data'}</li>
        <li>{ar?'سجل المتصفح':'Browser history'}</li>
        <li>{ar?'الملفات المحلية':'Local files'}</li>
        <li>{ar?('البيانات الخادمية الخاصة بالدائرة الخاصة'):'Private Circle server-side data'}</li>
      </ul>
    </div>
    <p className="danger-warning">{ar?'⚠️ هذا الإجراء لا يمكن التراجع عنه.':'⚠️ This action cannot be undone.'}</p>
    <button className="primary-action danger" onClick={executeReset} disabled={resetting}>{ar?'إعادة ضبط TAAMEN':'Reset TAAMEN'}</button>
  </>:<>
    {resetResult.success?<><CheckCircle2 size={32} className="success-icon"/><p>{ar?'تم إعادة ضبط TAAMEN بنجاح.':'TAAMEN has been reset successfully.'}</p><p className="danger-warning">{ar?'جاري إعادة تحميل التطبيق...':'Reloading application...'}</p></>:<>
      <XCircle size={32} className="danger-icon"/><p>{ar?'فشلت إعادة ضبط TAAMEN.':'TAAMEN reset failed.'}</p>
      {resetResult.errors.length>0&&<div className="error-list"><strong>{ar?'الأخطاء:':'Errors:'}</strong><ul>{resetResult.errors.map((e,i)=><li key={i}>{e}</li>)}</ul></div>}
      <button className="primary-action" onClick={()=>setShowResetModal(false)}>{ar?'إغلاق':'Close'}</button>
    </>}
  </>}</div></div></div>}
   <HowToGuide language={language} open={showGuide} onClose={()=>setShowGuide(false)}/>
   <div className="settings-grid">
    <section className="panel settings-panel featured-setting-panel">
      <div className="panel-heading"><div><p className="eyebrow">TAAMEN / FEATURED</p><h2>{recognized?(ar?'وضع العضو المميز':'Featured member mode'):(ar?'هل أنت عضو مميز؟':'Are you a Featured Member?')}</h2></div><BadgeCheck size={18}/></div>
      {recognized&&session?<><div className="featured-active"><strong>{ar?(session.member.arabicName||session.member.displayName):session.member.displayName}</strong><span>{ar?'وصول للقراءة فقط إلى السجل التاريخي':'Read-only historical archive access'}</span></div><button className="dark-action" onClick={onSignOut}><LogOut size={15}/>{ar?'العودة للمستخدم العام':'Return to General User'}</button></>:session?<p>{ar?'أنت متصل بالدائرة الخاصة. للتعرف كعضو مميز، اخرج أولًا.':'You are signed in to the Private Circle. Sign out first to use Featured Member recognition.'}</p>:<button className="primary-action" onClick={()=>setShowRecognition(true)}>{ar?'دخول أعضاء TAAMEN':'TAAMEN member access'}</button>}
    </section>
    <PrivateCirclePanel language={language} session={session} onSession={onSession} onSignOut={onSignOut}/>
    {isOwner&&<OwnerPanel language={language}/>}
    <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">PREFERENCES</p><h2>{ar?'المظهر واللغة':'Appearance & language'}</h2></div></div><div className="setting-row"><span><Globe2 size={16}/>{ar?'اللغة':'Language'}</span><button className="language-button" onClick={onLanguage}>{ar?'English':'العربية'}</button></div><div className="setting-row"><span><Moon size={16}/>{ar?'الحركة':'Motion'}</span><input type="checkbox" checked={motion} onChange={e=>{setMotion(e.target.checked);persistPrefs({motion:e.target.checked})}}/></div><div className="setting-row"><span><Accessibility size={16}/>{ar?'إتاحة الوصول':'Accessibility'}</span><span className="status-chip muted">{ar?'مراعية للنظام':'System aware'}</span></div></section>
    <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">NOTIFICATIONS & PRIVACY</p><h2>{ar?'التحكم المحلي':'Local controls'}</h2></div></div><div className="setting-row"><span><Bell size={16}/>{ar?'الإشعارات':'Notifications'}</span><input type="checkbox" checked={notify} onChange={e=>{setNotify(e.target.checked);persistPrefs({notifications:e.target.checked})}}/></div><div className="setting-row"><span>{ar?'التفضيلات':'Preferences'}</span><input type="checkbox" checked={preferences} onChange={e=>{setPreferences(e.target.checked);persistPrefs({preferences:e.target.checked})}}/></div><div className="setting-row"><span>{ar?'التحليلات':'Analytics'}</span><input type="checkbox" checked={analytics} onChange={e=>{setAnalytics(e.target.checked);persistPrefs({analytics:e.target.checked})}}/></div><button className="text-button danger" onClick={()=>clearNotifications()}><Trash2 size={14}/>{ar?'حذف الإشعارات المحلية':'Clear local notifications'}</button></section>
    <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">EMAIL</p><h2>{ar?'بريد الملف':'Profile email'}</h2></div><Mail size={17}/></div><label>{ar?'بريد الملف':'Profile email'} <span className="optional">{ar?'اختياري':'Optional'}</span><input type="email" value={p.email} onChange={e=>setP(x=>({...x,email:e.target.value,emailVerified:false,verifiedAt:undefined}))} onBlur={()=>saveEmail(p.email)}/></label><div className="profile-status-row"><span className={p.emailVerified?'status-chip':'status-chip muted'}>{p.emailVerified?(ar?'البريد مؤكد':'Email verified'):(p.email?(ar?'غير مؤكد':'Not verified'):(ar?'غير مضاف':'Not added'))}</span></div><div className="verify-box frozen"><div><strong>{ar?'التحقق من البريد — قريبًا':'Email verification — Coming Soon'}</strong><small>{ar?'ميزة التحقق مجمّدة حاليًا ولن تبدأ أي عملية وهمية. ستتوفر عند إعداد مسار التحقق الفعلي.':'Verification is frozen until a real verification flow is configured. No fake verification process will run.'}</small></div><button className="dark-action" disabled aria-disabled="true">{ar?'قريبًا':'Coming Soon'}</button></div><p className="settings-note">{ar?'لمراسلة فريق TAAMEN استخدم صفحة الدعم.':'To message the TAAMEN team, use the Support page.'}</p></section>
    <section className="panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">STORAGE</p><h2>{ar?'البيانات والتثبيت':'Data & installation'}</h2></div><Database size={17}/></div><div className="setting-row"><span><HardDrive size={16}/>{ar?'التخزين المحلي':'Local storage'}</span><span className="status-chip">IndexedDB</span></div><div className="setting-row"><span><Wifi size={16}/>{ar?'الشبكة':'Network'}</span><span className="status-chip">{navigator.onLine?(ar?'متصل':'Online'):(ar?'دون اتصال':'Offline')}</span></div><div className="backup-actions"><button className="dark-action" onClick={backup}><Download size={14}/>{ar?'تصدير البيانات':'Export data'}</button><button className="dark-action" onClick={()=>restoreRef.current?.click()}><Upload size={14}/>{ar?'استيراد البيانات':'Import data'}</button><input ref={restoreRef} hidden type="file" accept="application/json,.json" onChange={e=>restore(e.target.files?.[0])}/></div><CaptureWallet language={language} embedded/><div className="setting-row"><span><Smartphone size={16}/>{ar?'تثبيت TAAMEN':'Install TAAMEN'}</span><span className="status-chip">{installService.getInstallationState()}</span></div>{installService.canPromptInstall()&&<button className="primary-action" onClick={()=>installService.promptInstall()}>{ar?'تثبيت الآن':'Install now'}</button>}</section>
    <section className="panel settings-panel support-entry-panel"><div className="panel-heading"><div><p className="eyebrow">SUPPORT</p><h2>{ar?'الدعم والتواصل':'Support & Contact'}</h2></div><LifeBuoy size={17}/></div><p>{ar?'تواصل مع فريق TAAMEN للحصول على المساعدة أو إرسال ملاحظاتك.':'Contact the TAAMEN team for help or send your feedback.'}</p><button className="primary-action" onClick={()=>setShowSupport(true)}><LifeBuoy size={15}/>{ar?'فتح الدعم والتواصل':'Open Support'}</button></section>
    <section className="panel settings-panel danger-zone"><div className="panel-heading"><div><p className="eyebrow">SECURITY & DATA</p><h2>{ar?'إعادة ضبط بيانات TAAMEN':'Reset TAAMEN Data'}</h2></div><RotateCcw size={18}/></div><p>{ar?'يحذف جميع بيانات TAAMEN المحلية من هذا المتصفح ويعيد التطبيق إلى حالته الأولية.':'Removes all TAAMEN local data from this browser and returns the application to its initial setup state.'}</p><p className="danger-zone-note">{ar?'لا يحذف بيانات المواقع الأخرى أو سجل المتصفح أو البيانات الخادمية للدائرة الخاصة.':'Does not delete other websites\' data, browser history, or Private Circle server-side data.'}</p><button className="danger-action" onClick={startReset}><RotateCcw size={15}/>{ar?'إعادة ضبط البيانات المحلية':'Reset local data'}</button></section>
   </div>
 </section>;
}
