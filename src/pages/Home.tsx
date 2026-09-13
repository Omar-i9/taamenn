import { Archive, ChevronRight, UserRound, MapPin, BadgeCheck } from 'lucide-react';
import type { Match } from '../data/footballData';
import type { RouteId } from '../config/routes';
import MatchCard from '../components/MatchCard';
import FeaturedMember from '../components/FeaturedMember';
import { useEffect, useState } from 'react';
import { listCurrentArchive } from '../services/archiveRepository';
import { api, type Session } from '../services/apiClient';

export default function Home({language,go,profile,session=null,onSession}:{language:'ar'|'en';go:(p:RouteId)=>void;profile?:{firstName:string};session?:Session|null;onSession?:(s:Session)=>void}) {
  const ar=language==='ar';
  const featured=session?.authMethod==='code';
  const [archive,setArchive]=useState<Match[]>([]);
  const [error,setError]=useState('');
  const [showRecognition,setShowRecognition]=useState(false);

  useEffect(()=>{
    let active=true;
    setError('');
    // Historical records are fetched from the server only while a recognition session exists.
    const load=featured?api.historicalMatches():listCurrentArchive();
    load.then(items=>{if(active)setArchive(items)}).catch(()=>{
      if(!active)return;
      setArchive([]);
      setError(ar?'تعذر تحميل السجل.':'The archive could not be loaded.');
    });
    return()=>{active=false};
  },[featured,ar]);

  const latest=archive.slice(0,3);
  const total=archive.length;
  const decided=archive.filter(m=>m.score1!==m.score2).length;
  const draws=archive.filter(m=>m.score1===m.score2).length;

  return <section className="page-content home-page">
    {showRecognition && (
      <div className="overlay" role="dialog" aria-modal="true" aria-label={ar ? 'دخول أعضاء TAAMEN' : 'TAAMEN member access'}>
        <div className="overlay-backdrop" onClick={() => setShowRecognition(false)} />
        <aside className="modal-card">
          <FeaturedMember
            language={language}
            onClose={() => setShowRecognition(false)}
            onRecognized={(next) => {
              setShowRecognition(false);
              onSession?.(next);
              go('archive');
            }}
          />
        </aside>
      </div>
    )}
    <div className="home-hero home-hero-single">
      <div className="home-hero-copy">
        <p className="eyebrow">TAAMEN 2.0 / HOME</p>
        <h1>{session ? (ar?`مرحبًا ${session.member.arabicName||session.member.displayName}`:`Welcome ${session.member.displayName}`) : (ar?`أهلًا ${profile?.firstName||''}`:`Welcome ${profile?.firstName||''}`)}</h1>
        <p>{featured?(ar?'استكشف حضورك التاريخي في TAAMEN.':'Explore your historical TAAMEN presence.'):(ar?'كرة القدم كما يجب أن تُعرض: هادئة، واضحة، ومحلية أولًا.':'Football presented as it should be: calm, clear, and local-first.')}</p>
        <div className="home-actions"><button className="primary-action" onClick={()=>go('archive')}><Archive size={16}/>{ar?'استكشف السجل':'Explore archive'}</button><button className="dark-action" onClick={()=>go('profile')}><UserRound size={16}/>{ar?'الملف الشخصي':'Profile'}</button></div>
      </div>
    </div>
    {error&&<div className="error-banner" role="alert">{error}</div>}
    <div className="stats-grid home-stats">
      <article className="stat-card stat-dark"><span>{ar?'السجل':'Archive'}</span><strong>{total}</strong><small>{featured?(ar?'سجلات تاريخية':'historical records'):(ar?'سجلات متاحة':'available records')}</small></article>
      <article className="stat-card stat-lime"><span>{ar?'المواجهات الحاسمة':'Decided matches'}</span><strong>{decided}</strong><small>{ar?'نتيجة غير متعادلة':'non-draw results'}</small></article>
      <article className="stat-card stat-pale"><span>{ar?'التعادلات':'Draws'}</span><strong>{draws}</strong><small>{ar?'بدون فائز':'no winner'}</small></article>
    </div>
    {!session && onSession && (
      <div className="verified-cta-container">
        <button
          type="button"
          className="verified-cta"
          onClick={()=>setShowRecognition(true)}
          aria-label={ar ? 'هل أنت عضو مميز؟' : 'Are you a verified user?'}
        >
          <BadgeCheck size={16}/>
          <span>{ar?'هل أنت عضو مميز؟':'Are you a verified user?'}</span>
        </button>
      </div>
    )}
    <div className="home-secondary-actions">
      <button
        type="button"
        className="secondary-action stadiums-action"
        onClick={()=>go('stadiums')}
        aria-label={ar ? 'تصفح الملاعب' : 'Browse stadiums'}
      >
        <MapPin size={18}/>
        <span>{ar?'الملاعب':'Stadiums'}</span>
        <small>{ar?'تصفح الملاعب والمواقع':'Browse stadiums and locations'}</small>
      </button>
    </div>
    <section className="panel archive-preview-panel">
      <div className="panel-heading"><div><p className="eyebrow">{ar?'من السجل':'FROM THE ARCHIVE'}</p><h2>{ar?'أحدث المواجهات':'Latest matches'}</h2></div><button className="text-button" onClick={()=>go('archive')}>{ar?'عرض الكل':'View all'}<ChevronRight size={15}/></button></div>
      <div className="home-match-list">{latest.map(m=><MatchCard key={m.id} match={m} language={language} featured={featured}/>)}</div>
    </section>
  </section>;
}
