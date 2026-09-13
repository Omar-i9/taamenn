import { useEffect, useMemo, useState } from 'react';
import { Archive as ArchiveIcon, CalendarClock, Edit3, Plus, Share2, Trash2, Trophy, Plus as PlusIcon, Minus } from 'lucide-react';
import type { Match, MatchType, PlayerContribution } from '../data/footballData';
import { createLocalUpcomingMatch, deleteMatch, listMatches, updateMatch } from '../services/matchRepository';
import { shareMatch } from '../services/shareService';
import { reconcileMatchNotifications } from '../services/notificationService';

const typeLabels:{value:MatchType;ar:string;en:string}[]=[
  {value:'friendly',ar:'ودية',en:'Friendly'},
  {value:'normal',ar:'عادية',en:'Normal'},
  {value:'competitive',ar:'تنافسية',en:'Competitive'},
  {value:'tournament',ar:'بطولة',en:'Tournament'},
  {value:'strong',ar:'قوية',en:'Strong'}
];

function dateParts(m:Match,ar:boolean){
  const d=new Date(`${String(m.dateKey).slice(0,4)}-${String(m.dateKey).slice(4,6)}-${String(m.dateKey).slice(6,8)}T12:00:00`);
  return{
    weekday:d.toLocaleDateString(ar?'ar-PS':'en-US',{weekday:'long'}),
    date:d.toLocaleDateString(ar?'ar-PS':'en-US',{day:'numeric',month:'long',year:'numeric'})
  };
}

function countdown(m:Match,now:number){
  if(!m.time)return 0;
  const y=String(m.dateKey).slice(0,4),mo=String(m.dateKey).slice(4,6),d=String(m.dateKey).slice(6,8);
  return Math.max(0,new Date(`${y}-${mo}-${d}T${m.time}:00`).getTime()-now);
}

type Draft={
  id?:string;
  team1:string;
  team2:string;
  stadium:string;
  city:string;
  date:string;
  time:string;
  duration:string;
  type:MatchType;
  visibility:'LOCAL'|'PUBLIC';
  story:string;
  score1:string;
  score2:string;
  status:Match['status'];
  contributions1:PlayerContribution[];
  contributions2:PlayerContribution[];
};

const blank:Draft={
  team1:'',
  team2:'',
  stadium:'',
  city:'',
  date:'',
  time:'19:00',
  duration:'60',
  type:'normal',
  visibility:'LOCAL',
  story:'',
  score1:'0',
  score2:'0',
  status:'UPCOMING',
  contributions1:[],
  contributions2:[]
};

function emptyContribution():PlayerContribution{
  return{playerName:'',goals:0,assists:0};
}

export default function Matches({language}:{language:'ar'|'en'}){
  const ar=language==='ar';
  const[matches,setMatches]=useState<Match[]>([]);
  const[now,setNow]=useState(Date.now());
  const[open,setOpen]=useState(false);
  const[draft,setDraft]=useState<Draft>(blank);
  const[msg,setMsg]=useState('');

  const load=async()=>{
    setMatches(await listMatches());
    await reconcileMatchNotifications();
  };

  useEffect(()=>{
    load();
    const id=window.setInterval(()=>setNow(Date.now()),1000);
    return()=>clearInterval(id);
  },[]);

  const visible=useMemo(()=>matches.filter(m=>m.visibility!=='PRIVATE'),[matches]);
  const upcoming=visible.filter(m=>m.status==='UPCOMING').sort((a,b)=>a.dateKey-b.dateKey||String(a.time||'').localeCompare(String(b.time||'')))[0];
  const remaining=upcoming?countdown(upcoming,now):0;
  const days=Math.floor(remaining/86400000),hh=Math.floor((remaining%86400000)/3600000),mm=Math.floor((remaining%3600000)/60000),ss=Math.floor((remaining%60000)/1000);

  const openNew=()=>{
    setDraft({...blank,date:new Date().toISOString().slice(0,10)});
    setMsg('');
    setOpen(true);
  };

  const openEdit=(m:Match)=>{
    setDraft({
      id:m.id,
      team1:m.team1,
      team2:m.team2,
      stadium:m.stadium||'',
      city:m.city||'',
      date:`${String(m.dateKey).slice(0,4)}-${String(m.dateKey).slice(4,6)}-${String(m.dateKey).slice(6,8)}`,
      time:m.time||'19:00',
      duration:String(m.durationMinutes||60),
      type:m.type as MatchType,
      visibility:m.visibility==='PUBLIC'?'PUBLIC':'LOCAL',
      story:m.story||'',
      score1:String(m.score1),
      score2:String(m.score2),
      status:m.status,
      contributions1:m.playerContributions?.team1||[],
      contributions2:m.playerContributions?.team2||[]
    });
    setMsg('');
    setOpen(true);
  };

  const addContribution=(team:'team1'|'team2')=>{
    if(team==='team1'){
      if(draft.contributions1.length>=5)return;
      setDraft({...draft,contributions1:[...draft.contributions1,emptyContribution()]});
    }else{
      if(draft.contributions2.length>=5)return;
      setDraft({...draft,contributions2:[...draft.contributions2,emptyContribution()]});
    }
  };

  const removeContribution=(team:'team1'|'team2',index:number)=>{
    if(team==='team1'){
      setDraft({...draft,contributions1:draft.contributions1.filter((_,i)=>i!==index)});
    }else{
      setDraft({...draft,contributions2:draft.contributions2.filter((_,i)=>i!==index)});
    }
  };

  const updateContribution=(team:'team1'|'team2',index:number,field: keyof PlayerContribution,value:string|number)=>{
    if(team==='team1'){
      const updated=[...draft.contributions1];
      updated[index]={...updated[index],[field]:value};
      setDraft({...draft,contributions1:updated});
    }else{
      const updated=[...draft.contributions2];
      updated[index]={...updated[index],[field]:value};
      setDraft({...draft,contributions2:updated});
    }
  };

  const save=async()=>{
    if(!draft.team1.trim()||!draft.team2.trim()||!draft.stadium.trim()||!draft.city.trim()||!draft.date||!draft.time){
      setMsg(ar?'أكمل الفريقين والملعب والمدينة والتاريخ والوقت.':'Complete teams, stadium, city, date and time.');
      return;
    }
    const d=new Date(`${draft.date}T${draft.time}:00`);
    if(Number.isNaN(d.getTime())){
      setMsg(ar?'التاريخ أو الوقت غير صالح.':'Invalid date or time.');
      return;
    }
    
    const validContributions1=draft.contributions1.filter(c=>c.playerName.trim()).map(c=>({
      playerName:c.playerName.trim(),
      goals:Math.max(0,Number(c.goals)||0),
      assists:Math.max(0,Number(c.assists)||0)
    }));
    
    const validContributions2=draft.contributions2.filter(c=>c.playerName.trim()).map(c=>({
      playerName:c.playerName.trim(),
      goals:Math.max(0,Number(c.goals)||0),
      assists:Math.max(0,Number(c.assists)||0)
    }));

    const playerContributions=(validContributions1.length>0||validContributions2.length>0)?{
      team1:validContributions1,
      team2:validContributions2
    }:undefined;

    if(draft.id){
      const old=matches.find(x=>x.id===draft.id);
      await updateMatch({
        ...old!,
        team1:draft.team1.trim(),
        team2:draft.team2.trim(),
        stadium:draft.stadium.trim(),
        city:draft.city.trim(),
        dateKey:Number(draft.date.replaceAll('-','')),
        dateLabel:d.toLocaleDateString('ar-PS',{day:'numeric',month:'long',year:'numeric'}),
        time:draft.time,
        durationMinutes:Number(draft.duration)||60,
        type:draft.type,
        visibility:draft.visibility,
        story:draft.story.trim(),
        score1:Number(draft.score1)||0,
        score2:Number(draft.score2)||0,
        status:draft.status,
        playerContributions
      });
    }else{
      await createLocalUpcomingMatch({
        team1:draft.team1.trim(),
        team2:draft.team2.trim(),
        stadium:draft.stadium.trim(),
        city:draft.city.trim(),
        date:draft.date,
        time:draft.time,
        durationMinutes:Number(draft.duration)||60,
        type:draft.type,
        visibility:draft.visibility,
        title:`${draft.team1.trim()} × ${draft.team2.trim()}`,
        note:draft.story.trim()
      });
    }
    setOpen(false);
    setMsg(ar?'تم حفظ المباراة محليًا.':'Match saved locally.');
    await load();
  };

  const remove=async(m:Match)=>{
    if(!confirm(ar?'حذف هذه المباراة؟':'Delete this match?'))return;
    await deleteMatch(m.id);
    await load();
  };

  const finish=(m:Match)=>openEdit({...m,status:'FINISHED'});

  const archive=async(m:Match)=>{
    await updateMatch({...m,status:'ARCHIVED'});
    await load();
    setMsg(ar?'تمت أرشفة المباراة.':'Match archived.');
  };

  return <section className="page-content match-center-page">
    <div className="page-heading">
      <div>
        <p className="eyebrow">TAAMEN 2.0 / MATCH CENTER</p>
        <h1>{ar?'مركز المباريات':'Match Center'}</h1>
        <p className="subtitle">{ar?'أنشئ مبارياتك الحالية وأدر نتائجها وأرشِفها محليًا.':'Create and manage current matches, enter results, and archive them locally.'}</p>
      </div>
      <button className="primary-action" onClick={openNew}><Plus size={16}/>{ar?'إنشاء مباراة':'Create match'}</button>
    </div>
    {msg&&<div className="success-banner">{msg}</div>}
    {upcoming&&<section className="next-match-card premium">
      <div>
        <span className="eyebrow">{ar?'المواجهة القادمة':'NEXT MATCH'}</span>
        <h2>{upcoming.title||`${upcoming.team1} × ${upcoming.team2}`}</h2>
        <p>{upcoming.stadium} · {upcoming.city}</p>
        <div className="countdown">
          <span><b>{days}</b><small>{ar?'يوم':'days'}</small></span>
          <i>:</i>
          <span><b>{String(hh).padStart(2,'0')}</b><small>{ar?'ساعة':'hrs'}</small></span>
          <i>:</i>
          <span><b>{String(mm).padStart(2,'0')}</b><small>{ar?'دقيقة':'min'}</small></span>
          <i>:</i>
          <span><b>{String(ss).padStart(2,'0')}</b><small>{ar?'ثانية':'sec'}</small></span>
        </div>
      </div>
      <div className="next-score">
        <strong>{upcoming.team1}</strong>
        <b>VS</b>
        <strong>{upcoming.team2}</strong>
        <small>{dateParts(upcoming,ar).weekday}<br/>{dateParts(upcoming,ar).date} · {upcoming.time}</small>
      </div>
    </section>}
    <div className="section-label">{ar?'مبارياتك':'Your matches'} · {visible.length}</div>
    <div className="archive-grid compact-results">
      {visible.map(m=>{
        const parts=dateParts(m,ar);
        const ended=m.status==='FINISHED'||m.status==='ARCHIVED'||m.status==='انتهت';
        return <article className={`match-card ${ended&&m.score1!==m.score2?(m.score1>m.score2?'is-winner-team1':'is-winner-team2'):'is-draw'}`} key={m.id}>
          <div className="match-card-top">
            <span className={`match-type ${m.type}`}>{typeLabels.find(x=>x.value===m.type)?.[ar?'ar':'en']||m.type}</span>
            <span className="status-chip muted">{m.status==='ARCHIVED'?(ar?'مؤرشفة':'Archived'):ended?(ar?'منتهية':'Finished'):(ar?'قادمة':'Upcoming')}</span>
          </div>
          <div className="match-date-block">
            <strong>{parts.weekday}</strong>
            <span>{parts.date}</span>
            <b>{m.time||'—'}</b>
          </div>
          <div className="scoreline">
            <strong>{m.team1}{ended&&m.score1>m.score2&&<em className="winner-badge"><Trophy size={12}/></em>}</strong>
            <b>{ended?`${m.score1}:${m.score2}`:'VS'}</b>
            <strong>{m.team2}{ended&&m.score2>m.score1&&<em className="winner-badge"><Trophy size={12}/></em>}</strong>
          </div>
          <small className="settings-note">{m.stadium||'—'} · {m.city||'—'} · {m.visibility||'LOCAL'}</small>
          {m.story&&<p>{m.story}</p>}
          <div className="card-actions">
            {m.status!=='ARCHIVED'&&<button className="text-button" onClick={()=>openEdit(m)}><Edit3 size={14}/>{ar?'تعديل':'Edit'}</button>}
            {!ended&&<button className="text-button" onClick={()=>finish(m)}><Trophy size={14}/>{ar?'إدخال النتيجة':'Enter result'}</button>}
            {m.status==='FINISHED'&&<button className="text-button" onClick={()=>archive(m)}><ArchiveIcon size={14}/>{ar?'أرشفة':'Archive'}</button>}
            <button className="text-button" onClick={()=>shareMatch(m,{includeContributions:true}).catch(()=>{})}><Share2 size={14}/>{ar?'مشاركة':'Share'}</button>
            <button className="text-button danger" onClick={()=>remove(m)}><Trash2 size={14}/>{ar?'حذف':'Delete'}</button>
          </div>
        </article>;
      })}
      {visible.length===0&&<div className="empty-state panel">
        <CalendarClock/>
        <strong>{ar?'لا توجد مباريات بعد':'No matches yet'}</strong>
        <span>{ar?'أنشئ أول مباراة لتبدأ.':'Create your first match to start.'}</span>
        <button className="dark-action" onClick={openNew}><Plus size={14}/>{ar?'إنشاء أول مباراة':'Create first match'}</button>
      </div>}
    </div>
    {open&&<div className="modal-backdrop">
      <div className="modal-card">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">TAAMEN / MATCH</p>
            <h2>{draft.id?(ar?'تعديل المباراة':'Edit match'):(ar?'إنشاء مباراة':'Create match')}</h2>
          </div>
          <button className="icon-button" aria-label={ar?'إغلاق':'Close'} onClick={()=>setOpen(false)}>×</button>
        </div>
        <div className="form-grid">
          <label>{ar?'الفريق الأول':'Team 1'} *<input value={draft.team1} onChange={e=>setDraft({...draft,team1:e.target.value})}/></label>
          <label>{ar?'الفريق الثاني':'Team 2'} *<input value={draft.team2} onChange={e=>setDraft({...draft,team2:e.target.value})}/></label>
          <label>{ar?'الملعب':'Stadium'} *<input value={draft.stadium} onChange={e=>setDraft({...draft,stadium:e.target.value})}/></label>
          <label>{ar?'المدينة':'City'} *<input value={draft.city} onChange={e=>setDraft({...draft,city:e.target.value})}/></label>
          <label>{ar?'التاريخ':'Date'} *<input type="date" value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label>
          <label>{ar?'الوقت':'Time'} *<input type="time" value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}/></label>
          <label>{ar?'المدة بالدقائق':'Duration'}<input type="number" min="1" value={draft.duration} onChange={e=>setDraft({...draft,duration:e.target.value})}/></label>
          <label>{ar?'نوع المباراة':'Match type'}<select value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value as MatchType})}>{typeLabels.map(x=><option key={x.value} value={x.value}>{ar?x.ar:x.en}</option>)}</select></label>
          <label>{ar?'الرؤية':'Visibility'}<select value={draft.visibility} onChange={e=>setDraft({...draft,visibility:e.target.value as 'LOCAL'|'PUBLIC'})}><option value="LOCAL">{ar?'محلي على هذا الجهاز':'Local on this device'}</option><option value="PUBLIC">PUBLIC</option></select></label>
          <label className="form-span-2">{ar?'ملاحظة':'Note'}<textarea rows={3} value={draft.story} onChange={e=>setDraft({...draft,story:e.target.value})}/></label>
          {draft.id&&<>
            <label>{ar?'نتيجة الفريق الأول':'Team 1 score'}<input type="number" min="0" value={draft.score1} onChange={e=>setDraft({...draft,score1:e.target.value})}/></label>
            <label>{ar?'نتيجة الفريق الثاني':'Team 2 score'}<input type="number" min="0" value={draft.score2} onChange={e=>setDraft({...draft,score2:e.target.value})}/></label>
          </>}
          {(draft.status==='FINISHED'||draft.status==='ARCHIVED'||draft.status==='انتهت')&&<>
            <div className="form-span-2 contributions-section">
              <div className="contributions-header">
                <span>{ar?'مساهمات اللاعبين':'Player Contributions'}</span>
                <small>{ar?'(اختياري، حتى 5 لاعبين لكل فريق)':'(optional, up to 5 players per team)'}</small>
              </div>
              <div className="contributions-team">
                <div className="contributions-team-header">
                  <strong>{draft.team1}</strong>
                  {draft.contributions1.length<5&&<button type="button" className="icon-button small" onClick={()=>addContribution('team1')}><PlusIcon size={14}/></button>}
                </div>
                {draft.contributions1.map((c,i)=><div key={i} className="contribution-row">
                  <input type="text" placeholder={ar?'اللاعب':'Player'} value={c.playerName} onChange={e=>updateContribution('team1',i,'playerName',e.target.value)}/>
                  <input type="number" min="0" placeholder={ar?'أهداف':'Goals'} value={c.goals||''} onChange={e=>updateContribution('team1',i,'goals',e.target.value)}/>
                  <input type="number" min="0" placeholder={ar?'تسديدات':'Assists'} value={c.assists||''} onChange={e=>updateContribution('team1',i,'assists',e.target.value)}/>
                  <button type="button" className="icon-button small danger" onClick={()=>removeContribution('team1',i)}><Minus size={14}/></button>
                </div>)}
              </div>
              <div className="contributions-team">
                <div className="contributions-team-header">
                  <strong>{draft.team2}</strong>
                  {draft.contributions2.length<5&&<button type="button" className="icon-button small" onClick={()=>addContribution('team2')}><PlusIcon size={14}/></button>}
                </div>
                {draft.contributions2.map((c,i)=><div key={i} className="contribution-row">
                  <input type="text" placeholder={ar?'اللاعب':'Player'} value={c.playerName} onChange={e=>updateContribution('team2',i,'playerName',e.target.value)}/>
                  <input type="number" min="0" placeholder={ar?'أهداف':'Goals'} value={c.goals||''} onChange={e=>updateContribution('team2',i,'goals',e.target.value)}/>
                  <input type="number" min="0" placeholder={ar?'تسديدات':'Assists'} value={c.assists||''} onChange={e=>updateContribution('team2',i,'assists',e.target.value)}/>
                  <button type="button" className="icon-button small danger" onClick={()=>removeContribution('team2',i)}><Minus size={14}/></button>
                </div>)}
              </div>
            </div>
          </>}
        </div>
        <div className="modal-actions">
          <button className="dark-action" onClick={()=>setOpen(false)}>{ar?'إلغاء':'Cancel'}</button>
          <button className="primary-action" onClick={save}>{ar?'حفظ':'Save'}</button>
        </div>
      </div>
    </div>}
  </section>;
}
