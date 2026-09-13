import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Camera, Check, Maximize2, Minimize2, Move, RotateCcw, X, Undo2, Redo2, Save, Share2 } from 'lucide-react';
import { formations, genericTacticalPlayers } from '../data/tacticalPresets';
import type { TacticalPlayer } from '../data/footballData';
import { getItem, putItem } from '../services/localDb';
import { requestLandscape, releaseOrientation } from '../services/tacticalOrientation';
import { html2canvas } from '../utils/capture';
import { saveCapture } from '../services/screenshotService';

const instructions=['','Press Forward','Cover Depth','Stay Wide','Drop Back','يتحرك بين الخطوط','يضغط للأمام'];
const teamRoles=['','Captain','Playmaker','Defensive Leader','Free Player','صانع ألعاب','قائد الهجوم'];
function genericFor(language:'ar'|'en'){return genericTacticalPlayers.map((p,i)=>({...p,name:language==='ar'?`لاعب ${i%5+1}`:`Player ${i%5+1}`}))}
function sanitizePublic(ps:TacticalPlayer[],language:'ar'|'en'){return ps.map((p,i)=>/^(Player|لاعب) [1-5]$/.test(p.name)?p:{...p,name:language==='ar'?`لاعب ${i%5+1}`:`Player ${i%5+1}`})}
function derivedPosition(p:TacticalPlayer){
 const depth=p.team==='home'?p.x:100-p.x;
 const lateral=p.y;
 
 if(depth<=12)return 'GK';
 
 if(depth<=35){
  if(lateral<30)return 'LB';
  if(lateral>70)return 'RB';
  return 'CB';
 }
 
 if(depth<=60){
  if(lateral<20)return 'LW';
  if(lateral>80)return 'RW';
  return 'CM';
 }
 
 if(depth<=80){
  if(lateral<25)return 'LM';
  if(lateral>75)return 'RM';
  return 'CAM';
 }
 
 return 'ST';
}

export default function Tactical({language}:{language:'ar'|'en'}){
 const ar=language==='ar';
 const [formationId,setFormationId]=useState('diamond');
 const genericPlayers=genericFor(ar?'ar':'en');
 const [players,setPlayers]=useState<TacticalPlayer[]>(genericPlayers);
 const [selected,setSelected]=useState<TacticalPlayer|null>(null);
 const [saved,setSaved]=useState(false); const [capturing,setCapturing]=useState(false); const [landscape,setLandscape]=useState(false); const latestPlayers=useRef<TacticalPlayer[]>(players); const [undoStack,setUndoStack]=useState<TacticalPlayer[][]>([]); const [redoStack,setRedoStack]=useState<TacticalPlayer[][]>([]); const drag=useRef<string|null>(null); const dragStart=useRef<TacticalPlayer[]|null>(null); const pitchRef=useRef<HTMLDivElement>(null);
 const formation=formations.find(f=>f.id===formationId)||formations[0];
 useEffect(()=>{getItem<{id:string;formationId:string;players:TacticalPlayer[];landscape?:boolean}>('tactical','plan').then(v=>{if(v){setFormationId(v.formationId);setPlayers(sanitizePublic(v.players,language));setLandscape(Boolean(v.landscape))}})},[language]);
 useEffect(()=>{document.body.classList.toggle('tactical-focus-mode',landscape);return()=>{document.body.classList.remove('tactical-focus-mode');releaseOrientation()}},[landscape]);
 useEffect(()=>{latestPlayers.current=players},[players]);
 const persist=async(ps=latestPlayers.current,f=formationId,l=landscape)=>{await putItem('tactical',{id:'plan',formationId:f,players:ps,landscape:l});setSaved(true);window.setTimeout(()=>setSaved(false),1800)};
 const commit=(next:TacticalPlayer[],previous=players)=>{setUndoStack(h=>[...h.slice(-19),previous]);setRedoStack([]);setPlayers(next);};
 const changeFormation=(f:string)=>{const nextFormation=formations.find(x=>x.id===f)||formations[0];if(players.length!==10)return;const ps=players.map((p,i)=>{const next={...p,...nextFormation.positions[p.team][i%5],positionMode:'auto' as const};return {...next,role:derivedPosition(next)}});setFormationId(f);commit(ps,players);setSelected(selected?ps.find(p=>p.id===selected.id)||null:null);persist(ps,f,landscape)};
 const undo=()=>{const prev=undoStack.at(-1);if(!prev)return;setUndoStack(h=>h.slice(0,-1));setRedoStack(h=>[...h,players]);setPlayers(prev);latestPlayers.current=prev;setSelected(selected?prev.find(p=>p.id===selected.id)||null:null);persist(prev,formationId,landscape)};
 const redo=()=>{const next=redoStack.at(-1);if(!next)return;setRedoStack(h=>h.slice(0,-1));setUndoStack(h=>[...h,players]);setPlayers(next);latestPlayers.current=next;setSelected(selected?next.find(p=>p.id===selected.id)||null:null);persist(next,formationId,landscape)};
 const update=(patch:Partial<TacticalPlayer>)=>{if(!selected)return;let ps=players.map(p=>p.id===selected.id?{...p,...patch}:p);if(patch.captain)ps=ps.map(p=>p.id!==selected.id&&p.team===selected.team?{...p,captain:false}:p);commit(ps,players);setSelected(ps.find(p=>p.id===selected.id)||null);persist(ps,formationId,landscape)};
 const positionFor=(p:TacticalPlayer,i:number)=>p.positionMode==='manual'?{x:p.x,y:p.y}:formation.positions[p.team][i%5];
 const moveAt=(id:string,e:React.PointerEvent)=>{const r=pitchRef.current?.getBoundingClientRect();if(!r)return;const x=Math.max(3,Math.min(97,((e.clientX-r.left)/r.width)*100));const y=Math.max(4,Math.min(96,((e.clientY-r.top)/r.height)*100));const ps=latestPlayers.current.map(p=>{if(p.id!==id)return p;const next={...p,x,y,positionMode:'manual' as const};return {...next,role:derivedPosition(next)}});latestPlayers.current=ps;setPlayers(ps);setSelected(ps.find(p=>p.id===id)||null)};
 const onPointerDown=(id:string,e:React.PointerEvent)=>{drag.current=id;dragStart.current=players;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);setSelected(players.find(p=>p.id===id)||null)};
 const onPointerMove=(e:React.PointerEvent)=>{if(drag.current)moveAt(drag.current,e)};
 const onPointerUp=()=>{if(drag.current){const previous=dragStart.current||players;setUndoStack(h=>[...h.slice(-19),previous]);setRedoStack([]);persist(latestPlayers.current);drag.current=null;dragStart.current=null}};
 const captureTactical=async()=>{
  if(!pitchRef.current||capturing)return;
  setCapturing(true);
  try{const canvas=await html2canvas(pitchRef.current);await saveCapture(canvas.toDataURL('image/png'),`TAAMEN tactical ${new Date().toISOString().slice(0,10)}`);setSaved(true);window.setTimeout(()=>setSaved(false),1800)}catch{setSaved(false)}finally{setCapturing(false)}
 };
 const toggleLandscape=async()=>{const next=!landscape;setLandscape(next);const shouldLock=next&&window.matchMedia('(pointer: coarse)').matches&&window.innerWidth<=900;if(shouldLock)await requestLandscape();else if(!next)await releaseOrientation();persist(players,formationId,next)};
 return <section className={`page-content tactical-page ${landscape?'is-landscape':''}`}><div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / TACTICAL</p><h1>{ar?'لوح التكتيك':'Tactical Board'}</h1><p className="subtitle">{ar?'لوح تكتيكي محلي: حرّك اللاعبين مباشرة على الملعب واحفظ خطتك.':'Local tactical board: move players directly on the pitch and save your plan.'}</p></div><div className="tactical-toolbar"><div className="formation-picker" role="group" aria-label={ar?'التشكيلات':'Formations'}>{formations.map(f=><button type="button" aria-pressed={f.id===formationId} className={f.id===formationId?'is-selected':''} onClick={()=>changeFormation(f.id)} key={f.id}>{ar?f.name:f.id}</button>)}</div><button type="button" className="dark-action landscape-action" onClick={toggleLandscape} aria-pressed={landscape} title={landscape?(ar?'الخروج من التركيز':'Exit focus mode'):(ar?'توسيع الملعب':'Expand tactical board')}>{landscape?<Minimize2 size={15}/>:<Maximize2 size={15}/>} <span>{landscape?(ar?'الخروج من التركيز':'Exit focus'):(ar?'تركيز الملعب':'Focus pitch')}</span></button></div></div>
 <div className="tactical-layout"><div ref={pitchRef} className="pitch" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}><div className="pitch-midline"/><div className="pitch-circle"/><div className="pitch-center-spot"/><div className="penalty-box penalty-home"/><div className="penalty-box penalty-away"/><div className="goal-box goal-home"/><div className="goal-box goal-away"/><div className="goal-area goal-area-home"/><div className="goal-area goal-area-away"/><div className="penalty-spot penalty-spot-home"/><div className="penalty-spot penalty-spot-away"/><span className="corner-arc corner-tl"/><span className="corner-arc corner-tr"/><span className="corner-arc corner-bl"/><span className="corner-arc corner-br"/>{players.map((p,i)=>{const pos=positionFor(p,i);return <button type="button" aria-pressed={selected?.id===p.id} aria-label={`${p.name} · ${p.role}`} className={`player-token ${p.team} ${selected?.id===p.id?'selected':''} ${drag.current===p.id?'is-dragging':''}`} style={{left:`${pos.x}%`,top:`${pos.y}%`}} key={p.id} onPointerDown={e=>onPointerDown(p.id,e)} onDoubleClick={()=>setSelected(p)} title={`${p.name} · ${p.role}`}><span>{p.name.slice(0,1)}</span><small>{p.name}</small><em className="player-position">{derivedPosition({...p,...pos})}</em>{p.captain&&<i aria-label={ar?'القائد':'Captain'}>★</i>}</button>})}</div>
 <section className="panel tactical-summary"><div className="tactical-ops-top"><span className="status-chip">{players.length===10?(ar?'5 ضد 5 جاهز':'5v5 ready'):(ar?'يجب أن يكون هناك 10 لاعبين':'10 players required')}</span><div className="ops-actions"><button className="icon-button" onClick={undo} disabled={!undoStack.length} aria-label={ar?'تراجع':'Undo'}><Undo2 size={15}/></button><button className="icon-button" onClick={redo} disabled={!redoStack.length} aria-label={ar?'إعادة':'Redo'}><Redo2 size={15}/></button><button className="icon-button" onClick={captureTactical} disabled={capturing} aria-label={ar?'أخذ لقطة للملعب والتكتيك':'Capture tactical board'} title={ar?'أخذ لقطة للملعب والتكتيك':'Capture tactical board'}>{capturing?<span className="capture-spinner"/>:<Camera size={15}/>}</button><button className="icon-button landscape-exit" onClick={toggleLandscape} aria-label={ar?'الخروج من الوضع الممتد':'Exit tactical focus'}>{landscape?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button></div></div><p className="eyebrow">PLAN / {formation.id}</p><h2>{ar?formation.name:formation.id}</h2><p>{formation.description}</p><div className="tactical-help"><span>{ar?'اسحب اللاعب':'Drag player'}</span><span>{ar?'انقر للاختيار':'Tap to select'}</span><span>{ar?'غيّر التشكيل':'Change formation'}</span><span>{ar?'ركّز الملعب عند الحاجة':'Use focus view when needed'}</span></div>{selected?<div className="player-inspector floating-inspector"><div className="inspector-head"><strong>{ar?'تعديل اللاعب':'Edit Player'}</strong><button className="icon-button" onClick={()=>setSelected(null)}><X size={15}/></button></div><label>{ar?'اسم اللاعب':'Player name'}<input value={selected.name} onChange={e=>update({name:e.target.value})}/></label><div className="derived-position"><span>{ar?'المركز التلقائي':'Auto position'}</span><strong>{derivedPosition(selected)}</strong><small>{ar?'يُحسب من موقع اللاعب على الملعب':'Derived from the player location on the pitch'}</small></div><label>{ar?'الدور التكتيكي':'Tactical role'}<select value={selected.teamRole} onChange={e=>update({teamRole:e.target.value})}>{teamRoles.map(x=><option key={x} value={x}>{x||'—'}</option>)}</select></label><label>{ar?'التعليمات':'Instruction'}<select value={selected.instruction} onChange={e=>update({instruction:e.target.value})}>{instructions.map(x=><option key={x} value={x}>{x||'—'}</option>)}</select></label><div className="setting-row"><span>{ar?'القائد':'Captain'}</span><input type="checkbox" checked={selected.captain} onChange={e=>update({captain:e.target.checked})}/></div><div className="inspector-actions"><button className="dark-action" onClick={()=>persist()}><Save size={15}/>{ar?'حفظ الخطة':'Save plan'}</button><button className="text-button" onClick={()=>navigator.share?.({title:'TAAMEN Tactical',text:formation.name})}><Share2 size={14}/>{ar?'مشاركة':'Share'}</button></div></div>:<div className="inspector-empty"><Move/><strong>{ar?'اختر لاعبًا':'Select a player'}</strong><span>{ar?'اضغط مطولًا واسحب اللاعب، أو انقر مرتين لتحريره.':'Press and hold to drag, or double-click to edit.'}</span></div>}<button className="text-button" onClick={()=>{const resetPlayers=genericPlayers;commit(resetPlayers,players);setFormationId('diamond');setSelected(null);persist(resetPlayers,'diamond',landscape)}}><RotateCcw size={14}/>{ar?'إعادة الخطة':'Reset plan'}</button>{saved&&<small className="save-flash">{ar?'تم الحفظ محليًا':'Saved locally'}</small>}</section></div></section>
}
