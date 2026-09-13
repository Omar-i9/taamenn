import { useEffect, useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Plus } from 'lucide-react';
import type { Match, MatchType } from '../data/footballData';
import { listCurrentArchive } from '../services/archiveRepository';
import { api } from '../services/apiClient';
import MatchCard from '../components/MatchCard';
import ArchiveDetailModal from '../components/ArchiveDetailModal';
import AddArchiveModal from '../components/AddArchiveModal';

export default function Archive({language,featured=false}:{language:'ar'|'en';featured?:boolean}) {
  const ar=language==='ar';
  const [archive,setArchive]=useState<Match[]>([]);
  const [error,setError]=useState('');
  const [q,setQ]=useState('');
  const [type,setType]=useState<'all'|MatchType>('all');
  const [selectedMatch,setSelectedMatch]=useState<Match|null>(null);
  const [showAddModal,setShowAddModal]=useState(false);
  useEffect(()=>{
    let active=true;
    setError('');
    // Historical records come from the server; local records come from IndexedDB.
    const load=featured?api.historicalMatches():listCurrentArchive();
    load.then(items=>{if(active)setArchive(items)}).catch(()=>{
      if(!active)return;
      setArchive([]);
      setError(ar?'تعذر تحميل السجل.':'The archive could not be loaded.');
    });
    return()=>{active=false};
  },[featured,ar]);
  const filtered=useMemo(()=>archive.filter(m=>{
    const query=q.trim().toLocaleLowerCase();
    const haystack=`${m.team1} ${m.team2} ${m.stadium||''} ${m.city||''} ${m.story||''}`.toLocaleLowerCase();
    return (!query||haystack.includes(query))&&(type==='all'||m.type===type);
  }),[archive,q,type]);
  const typeLabel=(v:string)=>({friendly:ar?'ودية':'Friendly',normal:ar?'عادية':'Normal',competitive:ar?'تنافسية':'Competitive',tournament:ar?'بطولة':'Tournament',strong:ar?'قوية':'Strong'} as Record<string,string>)[v]||v;
  return <section className="page-content archive-page">
    <div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / ARCHIVE</p><h1>{featured?(ar?'السجل التاريخي':'Historical Archive'):(ar?'السجل':'Archive')}</h1><p className="subtitle">{featured?(ar?'المباريات التاريخية للعرض والبحث فقط.':'Historical records for browse and inspection only.'):(ar?'مبارياتك الحالية المؤرشفة محفوظة محليًا ويمكنك البحث فيها.':'Your current archived matches are stored locally and can be searched here.')}</p></div><div className="archive-count"><strong>{filtered.length}</strong><span>{ar?'مباراة':'matches'}</span></div><div className="setting-actions"><button className="primary-action" onClick={()=>setShowAddModal(true)} disabled={featured}><Plus size={15}/>{ar?'إضافة مباراة مؤرشفة':'Add Archived Match'}</button></div></div>
    <div className="archive-tools redesigned"><label className="search-control"><Search size={16}/><input value={q} onChange={e=>setQ(e.target.value)} placeholder={ar?'ابحث عن فريق أو ملعب…':'Search team or stadium…'} aria-label={ar?'بحث في السجل':'Search archive'}/></label><label className="filter-control"><SlidersHorizontal size={15}/><select value={type} onChange={e=>setType(e.target.value as 'all'|MatchType)} aria-label={ar?'نوع المباراة':'Match type'}><option value="all">{ar?'كل الأنواع':'All types'}</option>{(['friendly','normal','competitive','tournament','strong'] as MatchType[]).map(v=><option key={v} value={v}>{typeLabel(v)}</option>)}</select></label></div>
    {error&&<div className="error-banner" role="alert">{error}</div>}
    <div className="archive-filter-summary"><span>{ar?'النوع:':'Type:'} {type==='all'?(ar?'الكل':'All'):typeLabel(type)}</span><span>{featured?(ar?'المصدر: أرشيف TAAMEN التاريخي':'Source: established historical archive'):(ar?'المصدر: سجلاتك المحلية':'Source: your local records')}</span></div>
    {filtered.length>0?<div className="archive-grid">{filtered.map(m=><MatchCard key={m.id} match={m} language={language} featured={featured} onClick={()=>setSelectedMatch(m)}/>)}</div>:<div className="empty-state archive-empty"><Search size={22}/><strong>{ar?'لا توجد نتائج':'No matches found'}</strong><span>{ar?'جرّب كلمة بحث أو نوعًا آخر.':'Try another search or match type.'}</span></div>}
    {selectedMatch&&<ArchiveDetailModal match={selectedMatch} language={language} featured={featured} onClose={()=>setSelectedMatch(null)}/>}
    {showAddModal&&<AddArchiveModal language={language} onClose={()=>setShowAddModal(false)}/>}
  </section>;
}
