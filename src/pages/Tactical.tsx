import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Camera, Maximize2, Minimize2, Move, RotateCcw, X, Undo2, Redo2, Save, Share2 } from 'lucide-react';
import { formations, genericTacticalPlayers } from '../data/tacticalPresets';
import type { TacticalPlayer } from '../data/footballData';
import { getItem, putItem } from '../services/localDb';
import { requestLandscape, releaseOrientation } from '../services/tacticalOrientation';
import { canvasToPngBlob, html2canvas } from '../utils/capture';
import { copyPngToClipboard, saveCapture } from '../services/screenshotService';
import { tacticalCopy, uiCopy } from '../i18n/translations';
import {
  applyFormation, beginDrag, derivedPosition, dragTo, endDrag,
  pointerToPitchPercent, setCaptain, type Drag,
} from '../services/tacticalBoard';

const instructions=['','pressForward','coverDepth','stayWide','dropBack','betweenLines'] as const;
const teamRoles=['','captain','playmaker','defensiveLeader','freePlayer','attackLeader'] as const;
const UNDO_LIMIT=20;

const defaultFormation=formations[0];

/** Default squad, already placed at the starting formation so x/y is authoritative from the first render. */
function defaultPlayers(language:'ar'|'en'):TacticalPlayer[]{
  const copy=tacticalCopy[language];
  const named=genericTacticalPlayers.map((player,index)=>({
    ...player,
    name:`${copy.player} ${index%5+1}`,
  }));
  return applyFormation(named,defaultFormation);
}

type StoredPlan={id:string;formationId:string;players:TacticalPlayer[];landscape?:boolean};

export default function Tactical({language}:{language:'ar'|'en'}){
 const ar=language==='ar';
 const copy=uiCopy[language];
 const tactical=tacticalCopy[language];
 const [formationId,setFormationId]=useState(defaultFormation.id);
 const [players,setPlayers]=useState<TacticalPlayer[]>(()=>defaultPlayers(ar?'ar':'en'));
 const [selectedId,setSelectedId]=useState<string|null>(null);
 const [saved,setSaved]=useState(false);
 const [capturing,setCapturing]=useState(false);
 const [captureNote,setCaptureNote]=useState<{kind:'ok'|'warn'|'err';text:string}|null>(null);
 const [landscape,setLandscape]=useState(false);
 const [undoStack,setUndoStack]=useState<TacticalPlayer[][]>([]);
 const [redoStack,setRedoStack]=useState<TacticalPlayer[][]>([]);
 // Rendered so the dragging token restyles; also read inside pointer handlers.
 const [drag,setDrag]=useState<Drag|null>(null);
 const dragRef=useRef<Drag|null>(null);
 const pitchRef=useRef<HTMLDivElement>(null);
 const savedTimer=useRef<number>(0);
 const captureTimer=useRef<number>(0);

 const formation=formations.find(f=>f.id===formationId)||defaultFormation;
 const formationCopy=tactical.formations[formation.id as keyof typeof tactical.formations]||{name:formation.id,description:''};
 const selected=selectedId?players.find(p=>p.id===selectedId)||null:null;

 useEffect(()=>{
  getItem<StoredPlan>('tactical','plan').then(stored=>{
   if(!stored)return;
   setFormationId(stored.formationId);
   // Player names are the user's own local data and are preserved as saved.
   if(Array.isArray(stored.players)&&stored.players.length)setPlayers(stored.players);
   setLandscape(Boolean(stored.landscape));
  });
 },[]);

 useEffect(()=>{
  document.body.classList.toggle('tactical-focus-mode',landscape);
  return()=>{document.body.classList.remove('tactical-focus-mode');releaseOrientation()};
 },[landscape]);

 useEffect(()=>()=>{
  window.clearTimeout(savedTimer.current);
  window.clearTimeout(captureTimer.current);
 },[]);

 const persist=useCallback(async(nextPlayers:TacticalPlayer[],nextFormationId:string,nextLandscape:boolean)=>{
  await putItem('tactical',{id:'plan',formationId:nextFormationId,players:nextPlayers,landscape:nextLandscape});
  setSaved(true);
  window.clearTimeout(savedTimer.current);
  savedTimer.current=window.setTimeout(()=>setSaved(false),1800);
 },[]);

 /** The one place that records undo history. */
 const commit=useCallback((next:TacticalPlayer[],previous:TacticalPlayer[],nextFormationId=formationId)=>{
  setUndoStack(history=>[...history.slice(-(UNDO_LIMIT-1)),previous]);
  setRedoStack([]);
  setPlayers(next);
  persist(next,nextFormationId,landscape);
 },[formationId,landscape,persist]);

 const changeFormation=(id:string)=>{
  const next=formations.find(f=>f.id===id);
  if(!next)return;
  setFormationId(id);
  commit(applyFormation(players,next),players,id);
 };

 const undo=()=>{
  const previous=undoStack.at(-1);
  if(!previous)return;
  setUndoStack(history=>history.slice(0,-1));
  setRedoStack(history=>[...history,players]);
  setPlayers(previous);
  persist(previous,formationId,landscape);
 };

 const redo=()=>{
  const next=redoStack.at(-1);
  if(!next)return;
  setRedoStack(history=>history.slice(0,-1));
  setUndoStack(history=>[...history,players]);
  setPlayers(next);
  persist(next,formationId,landscape);
 };

 const updateSelected=(patch:Partial<TacticalPlayer>)=>{
  if(!selected)return;
  const next=patch.captain!==undefined
   ? setCaptain(players,selected.id,patch.captain)
   : players.map(p=>p.id===selected.id?{...p,...patch}:p);
  commit(next,players);
 };

 // --- Pointer lifecycle -----------------------------------------------------
 // Capture and every listener live on the token itself, so the element that owns
 // the pointer is the element that receives its events.

 const applyDrag=(event:React.PointerEvent)=>{
  const rect=pitchRef.current?.getBoundingClientRect();
  if(!rect)return;
  const point=pointerToPitchPercent(event.clientX,event.clientY,rect);
  setPlayers(current=>dragTo(dragRef.current,event.pointerId,current,point));
 };

 const onPointerDown=(playerId:string,event:React.PointerEvent<HTMLButtonElement>)=>{
  if(dragRef.current)return; // one pointer at a time
  const started=beginDrag(players,playerId,event.pointerId);
  if(!started)return;
  dragRef.current=started;
  setDrag(started);
  setSelectedId(playerId);
  event.currentTarget.setPointerCapture?.(event.pointerId);
 };

 const onPointerMove=(event:React.PointerEvent<HTMLButtonElement>)=>{
  if(!dragRef.current)return;
  applyDrag(event);
 };

 /**
  * Shared by pointerup, pointercancel and lostpointercapture. A cancelled drag keeps
  * the position already applied instead of leaving the board mid-gesture, and the
  * whole gesture contributes a single undo entry.
  */
 const finishDrag=(event:React.PointerEvent<HTMLButtonElement>)=>{
  const { drag:next, settled, before }=endDrag(dragRef.current,event.pointerId);
  dragRef.current=next;
  if(!settled)return;
  setDrag(null);
  if(before)setUndoStack(history=>[...history.slice(-(UNDO_LIMIT-1)),before]);
  setRedoStack([]);
  setPlayers(current=>{persist(current,formationId,landscape);return current});
 };

 const captureTactical=async()=>{
  if(!pitchRef.current||capturing)return;
  setCapturing(true);
  setCaptureNote(null);
  try{
   const target=pitchRef.current;
   const blobPromise=(async()=>{
    const canvas=await html2canvas(target);
    const blob=await canvasToPngBlob(canvas);
    return {blob,width:canvas.width,height:canvas.height};
   })();
   const clipboardPromise=copyPngToClipboard(blobPromise.then(result=>result.blob));
   const {blob,width,height}=await blobPromise;
   await saveCapture(blob,`TAAMEN tactical ${new Date().toISOString().slice(0,10)}`,{width,height});
   const clipboard=await clipboardPromise;
   setCaptureNote(clipboard==='copied'
     ?{kind:'ok',text:copy.captureCopied}
     :{kind:'warn',text:copy.captureSavedNoClipboard});
   window.clearTimeout(captureTimer.current);
   captureTimer.current=window.setTimeout(()=>setCaptureNote(null),5000);
  }catch{
   setCaptureNote({kind:'err',text:copy.captureFailed});
  }finally{setCapturing(false)}
 };

 const toggleLandscape=async()=>{
  const next=!landscape;
  setLandscape(next);
  const shouldLock=next&&window.matchMedia('(pointer: coarse)').matches&&window.innerWidth<=900;
  if(shouldLock)await requestLandscape();
  else if(!next)await releaseOrientation();
  persist(players,formationId,next);
 };

 const resetPlan=()=>{
  const fresh=defaultPlayers(ar?'ar':'en');
  setFormationId(defaultFormation.id);
  setSelectedId(null);
  commit(fresh,players,defaultFormation.id);
 };

 return <section className={`page-content tactical-page ${landscape?'is-landscape':''}`}><div className="page-heading"><div><p className="eyebrow">TAAMEN 2.0 / TACTICAL</p><h1>{tactical.title}</h1><p className="subtitle">{tactical.description}</p></div><div className="tactical-toolbar"><div className="formation-picker" role="group" aria-label={tactical.formationsLabel}>{formations.map(f=><button type="button" aria-pressed={f.id===formationId} className={f.id===formationId?'is-selected':''} onClick={()=>changeFormation(f.id)} key={f.id}>{tactical.formations[f.id as keyof typeof tactical.formations]?.name||f.id}</button>)}</div><button type="button" className="dark-action landscape-action" onClick={toggleLandscape} aria-pressed={landscape} title={landscape?tactical.exitFocusTitle:tactical.expandTitle}>{landscape?<Minimize2 size={15}/>:<Maximize2 size={15}/>} <span>{landscape?tactical.exitFocus:tactical.focus}</span></button></div></div>
 <div className="tactical-layout"><div ref={pitchRef} className="pitch"><div className="pitch-midline"/><div className="pitch-circle"/><div className="pitch-center-spot"/><div className="penalty-box penalty-home"/><div className="penalty-box penalty-away"/><div className="goal-box goal-home"/><div className="goal-box goal-away"/><div className="goal-area goal-area-home"/><div className="goal-area goal-area-away"/><div className="penalty-spot penalty-spot-home"/><div className="penalty-spot penalty-spot-away"/><span className="corner-arc corner-tl"/><span className="corner-arc corner-tr"/><span className="corner-arc corner-bl"/><span className="corner-arc corner-br"/>{players.map(p=><button
   type="button"
   key={p.id}
   aria-pressed={selectedId===p.id}
   aria-label={`${p.name} · ${derivedPosition(p)}`}
   className={`player-token ${p.team} ${selectedId===p.id?'selected':''} ${drag?.playerId===p.id?'is-dragging':''}`}
   style={{left:`${p.x}%`,top:`${p.y}%`}}
   onPointerDown={e=>onPointerDown(p.id,e)}
   onPointerMove={onPointerMove}
   onPointerUp={finishDrag}
   onPointerCancel={finishDrag}
   onLostPointerCapture={finishDrag}
   onDoubleClick={()=>setSelectedId(p.id)}
   title={`${p.name} · ${derivedPosition(p)}`}
  ><span>{p.name.slice(0,1)}</span><small>{p.name}</small><em className="player-position">{derivedPosition(p)}</em>{p.captain&&<i aria-label={tactical.captain}>★</i>}</button>)}</div>
 <section className="panel tactical-summary">
  <div className="tactical-ops-top"><span className="status-chip">{players.length===10?tactical.ready:tactical.playersRequired}</span><div className="ops-actions">
   <button className="icon-button" onClick={undo} disabled={!undoStack.length} aria-label={tactical.undo}><Undo2 size={15}/></button>
   <button className="icon-button" onClick={redo} disabled={!redoStack.length} aria-label={tactical.redo}><Redo2 size={15}/></button>
   <button className={`icon-button${capturing?' is-capturing':''}`} onClick={captureTactical} disabled={capturing} aria-busy={capturing} aria-label={copy.capturePitchAria} title={copy.capturePitchAria}>{capturing?<span className="capture-spinner"/>:<Camera size={15}/>}</button>
   <button className="icon-button landscape-exit" onClick={toggleLandscape} aria-label={tactical.exitTacticalFocus}>{landscape?<Minimize2 size={15}/>:<Maximize2 size={15}/>}</button>
  </div></div>
  <p className="eyebrow">PLAN / {formation.id}</p><h2>{formationCopy.name}</h2><p>{formationCopy.description}</p>
  <div className="tactical-help"><span>{tactical.drag}</span><span>{tactical.tap}</span><span>{tactical.changeFormation}</span><span>{tactical.useFocus}</span></div>
  {selected?<div className="player-inspector floating-inspector">
   <div className="inspector-head"><strong>{tactical.editPlayer}</strong><button className="icon-button" onClick={()=>setSelectedId(null)} aria-label={tactical.closeEditor}><X size={15}/></button></div>
   <label>{tactical.playerName}<input value={selected.name} onChange={e=>updateSelected({name:e.target.value})}/></label>
   <div className="derived-position"><span>{tactical.autoPosition}</span><strong>{derivedPosition(selected)}</strong><small>{tactical.positionHelp}</small></div>
   <label>{tactical.role}<select value={selected.teamRole} onChange={e=>updateSelected({teamRole:e.target.value})}>{teamRoles.map(x=><option key={x} value={x}>{x?tactical.roles[x as keyof typeof tactical.roles]:'—'}</option>)}</select></label>
   <label>{tactical.instruction}<select value={selected.instruction} onChange={e=>updateSelected({instruction:e.target.value})}>{instructions.map(x=><option key={x} value={x}>{x?tactical.instructions[x as keyof typeof tactical.instructions]:'—'}</option>)}</select></label>
   <div className="setting-row"><span>{tactical.captain}</span><input type="checkbox" checked={selected.captain} onChange={e=>updateSelected({captain:e.target.checked})}/></div>
   <div className="inspector-actions"><button className="dark-action" onClick={()=>persist(players,formationId,landscape)}><Save size={15}/>{tactical.savePlan}</button><button className="text-button" onClick={()=>navigator.share?.({title:tactical.shareTitle,text:formationCopy.name})}><Share2 size={14}/>{tactical.share}</button></div>
  </div>:<div className="inspector-empty"><Move/><strong>{tactical.selectPlayer}</strong><span>{tactical.selectHelp}</span></div>}
  <button className="text-button" onClick={resetPlan}><RotateCcw size={14}/>{tactical.reset}</button>
  {saved&&<small className="save-flash">{tactical.saved}</small>}
  {captureNote&&<small className={`capture-note is-${captureNote.kind}`} role={captureNote.kind==='err'?'alert':undefined}>{captureNote.text}</small>}
 </section></div></section>
}
