import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import type { Match, MatchType } from '../data/footballData';
import { api } from '../services/apiClient';
import MatchCard from '../components/MatchCard';
import ArchiveDetailModal from '../components/ArchiveDetailModal';
import { archiveCopy, matchUiCopy } from '../i18n/translations';

export default function HistoricalMatchCenter({language,onExitFeatured}:{language:'ar'|'en';onExitFeatured:()=>void}) {
  const ar=language==='ar';
  const [matches,setMatches]=useState<Match[]>([]);
  const [error,setError]=useState('');
  const [q,setQ]=useState('');
  const [type,setType]=useState<'all'|MatchType>('all');
  const[selected,setSelected]=useState<Match|null>(null);
  const copy=matchUiCopy[language];
  useEffect(()=>{
    let active=true;
    api.historicalMatches()
      .then(items=>{if(active)setMatches(items)})
      .catch(()=>{if(active)setError(ar?'تعذر تحميل السجلات التاريخية.':'The historical records could not be loaded.')});
    return()=>{active=false};
  },[ar]);
  const typeLabel=(v:string)=>({friendly:archiveCopy[language].friendly,normal:archiveCopy[language].normal,competitive:archiveCopy[language].competitive,tournament:archiveCopy[language].tournament,strong:archiveCopy[language].strong} as Record<string,string>)[v]||v;
  const filtered=useMemo(()=>matches.filter(m=>{
    const query=q.trim().toLocaleLowerCase();
    const haystack=`${m.id} ${m.team1} ${m.team2} ${m.stadium||''} ${m.city||''} ${m.story||''}`.toLocaleLowerCase();
    return (!query||haystack.includes(query))&&(type==='all'||m.type===type);
  }),[matches,q,type]);
  return <section className="page-content archive-page">
    <div className="page-heading"><div><button className="back-button-large" onClick={onExitFeatured}><ArrowLeft size={18}/>{copy.returnGeneral}</button><p className="eyebrow">TAAMEN 2.0 / HISTORICAL MATCH CENTER</p><h1>{copy.historicalTitle}</h1><p className="subtitle">{copy.historicalDesc}</p></div><div className="archive-count"><strong>{filtered.length}</strong><span>{copy.records}</span></div></div>
    <div className="archive-tools redesigned"><label className="search-control"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={copy.searchHistorical} /></label><label className="filter-control"><SlidersHorizontal size={15}/><select value={type} onChange={e=>setType(e.target.value as 'all'|MatchType)}><option value="all">{copy.allTypes}</option>{(['friendly','normal','competitive','tournament','strong'] as MatchType[]).map(v=><option key={v} value={v}>{typeLabel(v)}</option>)}</select></label></div>
    {error&&<div className="error-banner" role="alert">{error}</div>}
    <div className="archive-filter-summary"><span>{copy.readOnly}</span><span>{copy.historicalSource}</span></div>
    {filtered.length?<div className="archive-grid">{filtered.map(m=><MatchCard key={m.id} match={m} language={language} featured onClick={()=>setSelected(m)}/>)}</div>:<div className="empty-state archive-empty"><Search size={22}/><strong>{copy.noResults}</strong><span>{copy.trySearch}</span></div>}
    {selected&&<ArchiveDetailModal match={selected} language={language} featured onClose={()=>setSelected(null)}/>}
  </section>;
}
