import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { Bell } from 'lucide-react';
import { ProfileSetup } from './components/ProfileSetup';
import { NotificationCenter } from './components/NotificationCenter';
import { getProfile, removeProfile, saveProfile, type LocalProfile } from './services/profileRepository';
import { reconcileMatchNotifications, unreadCount } from './services/notificationService';
import PublicSharePreview from './components/PublicSharePreview';
import { routeRegistry, routesForScope, routesForMobileNav, routesForDesktopNav, routesBySection, type RouteId, type Scope } from './config/routes';
import { api, type Session } from './services/apiClient';
import { TAAMEN_LOGO_ALT, TAAMEN_LOGO_SRC } from './config/branding';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallBanner } from './shared/ui/InstallBanner';
import { ConnectivityStatus } from './shared/ui/ConnectivityStatus';
import { installService } from './infrastructure/pwa/installService';
import DateTimeBlock from './components/DateTimeBlock';
import './styles/global.css';

const Home=lazy(()=>import('./pages/Home')); const Archive=lazy(()=>import('./pages/Archive')); const Matches=lazy(()=>import('./pages/Matches')); const HistoricalMatchCenter=lazy(()=>import('./pages/HistoricalMatchCenter')); const Tactical=lazy(()=>import('./pages/Tactical')); const Stadiums=lazy(()=>import('./pages/Stadiums')); const Profile=lazy(()=>import('./components/Profile')); const Settings=lazy(()=>import('./pages/Settings')); const Support=lazy(()=>import('./pages/Support'));
type Language='ar'|'en';

/**
 * Recognition (`code`) sessions switch the shell into the read-only historical
 * experience. Private Circle (`password`) sessions stay in the normal workspace
 * and gain an authenticated panel instead.
 */
function scopeFor(session:Session|null):Scope{return session?.authMethod==='code'?'featured':'normal'}

type ShellProps={
 language:Language;
 profile:LocalProfile;
 session:Session|null;
 onProfile:(p:LocalProfile)=>void;
 onReset:()=>void;
 onLanguage:()=>void;
 onSession:(s:Session)=>void;
 onSignOut:()=>void;
};

function RouteView({page,language,profile,go,onProfile,onReset,onLanguage,session,onSession,onSignOut}:ShellProps&{page:RouteId;go:(p:RouteId)=>void}){
 const common={language};
 const scope=scopeFor(session);
 return <ErrorBoundary language={language} label={page}><Suspense fallback={<div className="loading-screen"><img src={TAAMEN_LOGO_SRC} alt={TAAMEN_LOGO_ALT}/><span>TAAMEN 2.0</span></div>}>
  {page==='home'&&<Home {...common} profile={profile} go={go} session={session} onSession={onSession}/>} {page==='archive'&&<Archive {...common} featured={scope==='featured'}/>} {page==='match-center'&&scope==='normal'&&<Matches {...common}/>} {page==='historical-match-center'&&scope==='featured'&&<HistoricalMatchCenter {...common} onExitFeatured={onSignOut}/>} {page==='tactical'&&scope==='normal'&&<Tactical {...common}/>} {page==='stadiums'&&<Stadiums {...common}/>} {page==='profile'&&<Profile language={language} profile={profile} onProfile={onProfile} session={session}/>} {page==='support'&&<Support language={language} profile={profile}/>} {page==='settings'&&<Settings language={language} profile={profile} onLanguage={onLanguage} onReset={onReset} onProfile={onProfile} session={session} onSession={onSession} onSignOut={onSignOut}/>}
 </Suspense></ErrorBoundary>;
}

function MainShell(props:ShellProps){
 const {language,profile,session,onLanguage}=props;
 const ar=language==='ar';const scope=scopeFor(session);
 const routes=useMemo(()=>routesForScope(scope),[scope]);const mobileRoutes=useMemo(()=>routesForMobileNav(scope),[scope]);const desktopSections=useMemo(()=>routesBySection(scope),[scope]);const desktopRoutes=useMemo(()=>routesForDesktopNav(scope),[scope]);const labels=routeRegistry.reduce((a,r)=>(a[r.id]=r.label[language],a),{} as Record<string,string>);const sectionLabels:{core:{ar:string;en:string};football:{ar:string;en:string};personal:{ar:string;en:string};system:{ar:string;en:string}}={core:{ar:'الأساسي',en:'Core'},football:{ar:'كرة القدم',en:'Football'},personal:{ar:'الشخصي',en:'Personal'},system:{ar:'النظام',en:'System'}};const[unread,setUnread]=useState(0);const[page,setPage]=useState<RouteId>(()=>(location.hash.slice(1) as RouteId)||'home');const[notifications,setNotifications]=useState(false);
 const[sidebar,setSidebar]=useState<boolean>(()=>{
   const saved=localStorage.getItem('taamen-sidebar-collapsed');
   return saved!==null?saved!=='true':true;
 });
 const toggleSidebar=()=>{
   setSidebar(x=>{
     const next=!x;
     localStorage.setItem('taamen-sidebar-collapsed',String(!next));
     return next;
   });
 };
 useEffect(()=>{const refresh=async()=>{await reconcileMatchNotifications();setUnread(await unreadCount())};refresh();const id=window.setInterval(refresh,15000);return()=>clearInterval(id)},[]);
 useEffect(()=>{if(!routes.some(r=>r.id===page))setPage(routes[0].id)},[routes,page]);
 useEffect(()=>{const onHash=()=>{const next=location.hash.slice(1) as RouteId;if(routes.some(r=>r.id===next))setPage(next)};window.addEventListener('hashchange',onHash);return()=>window.removeEventListener('hashchange',onHash)},[routes]);
 const go=(p:RouteId)=>{if(!routes.some(r=>r.id===p))return;setPage(p);history.replaceState(null,'',`${location.pathname}#${p}`);window.scrollTo({top:0,behavior:'smooth'})};
 const identityCaption=scope==='featured'?'FEATURED':session?.authMethod==='password'?'PRIVATE CIRCLE':'LOCAL · TAAMEN';
 return <div className={`app-shell ${scope==='featured'?'is-featured-shell':''}`}>
  <aside className={`sidebar ${sidebar?'':'is-collapsed'}`}>
   <div className={`brand-row ${sidebar?'':'is-collapsed'}`}>
     {sidebar && (
       <div className="brand-identity" onClick={()=>go('home')} role="button" tabIndex={0} title={labels.home}>
         <img className="brand-image" src={TAAMEN_LOGO_SRC} alt={TAAMEN_LOGO_ALT}/>
         <span className="brand-name">TAAMEN 2.0</span>
       </div>
     )}
     <button
       type="button"
       className={`hamburger-toggle ${sidebar?'is-expanded':'is-collapsed'}`}
       onClick={toggleSidebar}
       aria-expanded={sidebar}
       aria-label={sidebar?(ar?'طي الشريط الجانبي':'Collapse navigation'):(ar?'توسيع القائمة':'Expand navigation')}
       title={sidebar?(ar?'طي الشريط الجانبي':'Collapse navigation'):(ar?'توسيع القائمة':'Expand navigation')}
     >
       <span className="hamburger-box">
         <span className="hamburger-line line-1"/>
         <span className="hamburger-line line-2"/>
         <span className="hamburger-line line-3"/>
       </span>
     </button>
   </div>
   <nav className="side-nav" aria-label={ar?'التنقل الرئيسي':'Primary navigation'}>{sidebar?Object.entries(desktopSections).map(([sectionKey,sectionRoutes])=>sectionRoutes.length>0?<div key={sectionKey} className="nav-section"><span className="nav-section-label">{sectionLabels[sectionKey as keyof typeof sectionLabels][language]}</span>{sectionRoutes.map(r=>{const Icon=r.icon;return <button key={r.id} className={`nav-item ${page===r.id?'is-active':''}`} onClick={()=>go(r.id)} aria-current={page===r.id?'page':undefined}><Icon size={18}/><span>{labels[r.id]}</span></button>})}</div>:null):desktopRoutes.map(r=>{const Icon=r.icon;return <button key={r.id} className={`nav-item ${page===r.id?'is-active':''}`} onClick={()=>go(r.id)} aria-current={page===r.id?'page':undefined}><Icon size={18}/><span className="tooltip">{labels[r.id]}</span></button>})}</nav>
   <div className="sidebar-footer"><button className="avatar avatar-button" title={labels.profile} onClick={()=>go('profile')}>{profile.avatarData?<img src={profile.avatarData} alt=""/>:profile.firstName.slice(0,1)}</button>{sidebar&&<div className="user-caption"><strong>{profile.firstName} {profile.lastName}</strong><span>{identityCaption}</span></div>}</div>
  </aside>
  <main className="main-content"><InstallBanner language={language}/><header className="topbar"><div className="mobile-brand"><img className="brand-image" src={TAAMEN_LOGO_SRC} alt={TAAMEN_LOGO_ALT}/><strong>TAAMEN 2.0</strong></div><div className="topbar-left">{!ar&&<DateTimeBlock language={language}/>}</div><div className="topbar-actions"><ConnectivityStatus language={language}/><button className="avatar topbar-profile" onClick={()=>go('profile')} aria-label={labels.profile}>{profile.avatarData?<img src={profile.avatarData} alt=""/>:profile.firstName.slice(0,1)}</button><button className="language-button" onClick={onLanguage}>{ar?'English':'العربية'}</button><button className="notification-button icon-button" onClick={()=>setNotifications(true)} aria-label={ar?'الإشعارات':'Notifications'}><Bell size={18}/>{unread>0&&<i>{unread>99?'99+':unread}</i>}</button></div><div className="topbar-right">{ar&&<DateTimeBlock language={language}/>}</div></header>
   <RouteView {...props} page={page} go={go}/>
   <nav className="bottom-nav" aria-label={ar?'تنقل الهاتف':'Mobile navigation'}>{mobileRoutes.map(r=>{const Icon=r.icon;return <button className={`bottom-nav-item ${page===r.id?'is-active':''}`} key={r.id} onClick={()=>go(r.id)}><Icon size={18}/><span>{r.label[language]}</span></button>})}</nav>
   {/* Local notifications only. Private Circle notices are memory-only and live in the Circle panel. */}
   <NotificationCenter open={notifications} onClose={()=>setNotifications(false)} language={language} onChanged={()=>unreadCount().then(setUnread)}/>
  </main>
 </div>;
}

export default function App(){
 const sharePath=window.location.pathname.match(/^\/share\/(match|profile)\/(.+)$/);
 const[language,setLanguage]=useState<Language>(()=>(localStorage.getItem('taamen-language') as Language)||'ar');
 const[profile,setProfile]=useState<LocalProfile>();
 const[boot,setBoot]=useState(true);
 const[updateAvailable,setUpdateAvailable]=useState(false);
 const[session,setSession]=useState<Session|null>(null);

 useEffect(()=>{installService.init();const onUpdate=()=>setUpdateAvailable(true);window.addEventListener('taamen-sw-update',onUpdate);return()=>window.removeEventListener('taamen-sw-update',onUpdate)},[]);
 useEffect(()=>{document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr';localStorage.setItem('taamen-language',language)},[language]);

 // The server owns session state. Local storage never records who is signed in.
 useEffect(()=>{
  let active=true;
  Promise.all([getProfile(),api.session().catch(()=>null)]).then(([storedProfile,serverSession])=>{
   if(!active)return;
   setProfile(storedProfile);
   setSession(serverSession);
   setBoot(false);
  });
  return()=>{active=false};
 },[]);

 const toggle=()=>setLanguage(x=>x==='ar'?'en':'ar');

 const signOut=useCallback(async()=>{
  try{await api.logout()}catch{/* the local session is dropped regardless */}
  setSession(null);
 },[]);

 /** Reset clears local TAAMEN data and ends any server session. */
 const resetProfile=useCallback(async()=>{
  await removeProfile();
  try{await api.logout()}catch{/* nothing to end */}
  setSession(null);
  setProfile(undefined);
  setLanguage('ar');
 },[]);

 if(sharePath)return <PublicSharePreview language={language} kind={sharePath[1] as 'match'|'profile'} token={decodeURIComponent(sharePath[2])}/>;
 if(boot)return <div className="loading-screen"><img src={TAAMEN_LOGO_SRC} alt={TAAMEN_LOGO_ALT}/><span>TAAMEN 2.0</span></div>;
 if(profile)return <><div className="update-banner" hidden={!updateAvailable}><span>{language==='ar'?'يتوفر تحديث جديد لـ TAAMEN.':'A new TAAMEN update is available.'}</span><button className="primary-action" onClick={()=>navigator.serviceWorker?.getRegistration().then(r=>r?.waiting?.postMessage({type:'SKIP_WAITING'})).then(()=>location.reload())}>{language==='ar'?'تحديث':'Update'}</button></div><MainShell language={language} profile={profile} session={session} onProfile={setProfile} onReset={resetProfile} onLanguage={toggle} onSession={setSession} onSignOut={signOut}/></>;
 return <ProfileSetup language={language} onLanguage={toggle} onSave={async p=>{const saved=await saveProfile(p);setProfile(saved)}}/>;
}
