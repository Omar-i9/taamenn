import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import type { Match, MatchType } from '../data/footballData';
import { api } from '../services/apiClient';
import MatchCard from '../components/MatchCard';

export default function HistoricalMatchCenter({language,onExitFeatured}:{language:'ar'|'en';onExitFeatured:()=>void}) {
  const ar=language==='ar';
  const [matches,setMatches]=useState<Match[]>([]);
  const [error,setError]=useState('');
  const [q,setQ]=useState('');
  const [type,setType]=useState<'all'|MatchType>('all');
  useEffect(()=>{
    let active=true;
    api.historicalMatches()
      .then(items=>{if(active)setMatches(items)})
      .catch(()=>{if(active)setError(ar?'تعذر تحميل السجلات التاريخية.':'The historical records could not be loaded.')});
    return()=>{active=false};
  },[ar]);
  const typeLabel=(v:string)=>({friendly:ar?'ودية':'Friendly',normal:ar?'عادية':'Normal',competitive:ar?'تنافسية':'Competitive',tournament:ar?'بطولة':'Tournament',strong:ar?'قوية':'Strong'} as Record<string,string>)[v]||v;
  const filtered=useMemo(()=>matches.filter(m=>{
    const query=q.trim().toLocaleLowerCase();
    const haystack=`${m.id} ${m.team1} ${m.team2} ${m.stadium||''} ${m.city||''} ${m.story||''}`.toLocaleLowerCase();
    return (!query||haystack.includes(query))&&(type==='all'||m.type===type);
  }),[matches,q,type]);
  return <section className="page-content archive-page">
    <div className="page-heading"><div><button className="back-button-large" onClick={onExitFeatured}><ArrowLeft size={18}/>{ar?'العودة للمستخدم العام':'Return to General User'}</button><p className="eyebrow">TAAMEN 2.0 / HISTORICAL MATCH CENTER</p><h1>{ar?'مركز المباريات التاريخي':'Historical Match Center'}</h1><p className="subtitle">{ar?'سجلات المباريات المؤرشفة من مصدر TAAMEN التاريخي — للعرض والبحث فقط.':'Archived Match Center records from the established TAAMEN historical source — browse and inspect only.'}</p></div><div className="archive-count"><strong>{filtered.length}</strong><span>{ar?'سجل':'records'}</span></div></div>
    <div className="archive-tools redesigned"><label className="search-control"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={ar?'ابحث عن فريق أو معرف المباراة…':'Search team or match ID…'} /></label><label className="filter-control"><SlidersHorizontal size={15}/><select value={type} onChange={e=>setType(e.target.value as 'all'|MatchType)}><option value="all">{ar?'كل الأنواع':'All types'}</option>{(['friendly','normal','competitive','tournament','strong'] as MatchType[]).map(v=><option key={v} value={v}>{typeLabel(v)}</option>)}</select></label></div>
    {error&&<div className="error-banner" role="alert">{error}</div>}
    <div className="archive-filter-summary"><span>{ar?'للقراءة فقط':'Read-only'}</span><span>{ar?'المصدر: أرشيف TAAMEN التاريخي':'Source: established TAAMEN historical archive'}</span></div>
    {filtered.length?<div className="archive-grid">{filtered.map(m=><MatchCard key={m.id} match={m} language={language} featured/>)}</div>:<div className="empty-state archive-empty"><Search size={22}/><strong>{ar?'لا توجد نتائج':'No records found'}</strong><span>{ar?'جرّب بحثًا أو نوعًا آخر.':'Try another search or match type.'}</span></div>}
  </section>;
}
