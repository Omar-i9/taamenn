import { useState, type Dispatch, type SetStateAction } from 'react';
import { Minus, Plus, Trophy, X } from 'lucide-react';
import type { Match, PlayerContribution } from '../data/footballData';
import { matchUiCopy, type Language } from '../i18n/translations';
import { useOverlayPresence } from '../motion/useOverlayPresence';
import { recordMatchResult } from '../services/matchRepository';

function emptyContribution():PlayerContribution{return{playerName:'',goals:0,assists:0}}

export default function ResultEntryModal({match,language,onClose,onSaved}:{match:Match;language:Language;onClose:()=>void;onSaved:()=>void}){
  const copy=matchUiCopy[language];
  const[score1,setScore1]=useState('');
  const[score2,setScore2]=useState('');
  const[story,setStory]=useState(match.story||'');
  const[team1,setTeam1]=useState<PlayerContribution[]>([]);
  const[team2,setTeam2]=useState<PlayerContribution[]>([]);
  const[error,setError]=useState('');
  const[saving,setSaving]=useState(false);
  const{backdropRef,panelRef,requestClose}=useOverlayPresence<HTMLButtonElement,HTMLElement>('modal',onClose);
  const update=(team:'team1'|'team2',index:number,field:keyof PlayerContribution,value:string)=>{
    const rows=[...(team==='team1'?team1:team2)];
    rows[index]={...rows[index],[field]:field==='playerName'?value:Math.max(0,Number(value)||0)};
    (team==='team1'?setTeam1:setTeam2)(rows);
  };
  const remove=(team:'team1'|'team2',index:number)=>(team==='team1'?setTeam1:setTeam2)(rows=>rows.filter((_,row)=>row!==index));
  const save=async()=>{
    const left=Number(score1),right=Number(score2);
    if(!Number.isInteger(left)||!Number.isInteger(right)||left<0||right<0||left>99||right>99){setError(copy.invalidScore);return}
    setSaving(true);setError('');
    try{
      const clean=(rows:PlayerContribution[])=>rows.filter(row=>row.playerName.trim()).map(row=>({...row,playerName:row.playerName.trim(),goals:Math.max(0,Math.trunc(Number(row.goals)||0)),assists:Math.max(0,Math.trunc(Number(row.assists)||0))}));
      const contributions={team1:clean(team1),team2:clean(team2)};
      await recordMatchResult(match.id,left,right,story.trim(),contributions.team1.length||contributions.team2.length?contributions:undefined);
      onSaved();
      onClose();
    }catch{setError(copy.resultFailed)}finally{setSaving(false)}
  };
  const contributions=(name:string,team:'team1'|'team2',rows:PlayerContribution[],setRows:Dispatch<SetStateAction<PlayerContribution[]>>)=><div className="result-contributions-team">
    <div className="contributions-team-header"><strong>{name}</strong>{rows.length<5&&<button type="button" className="icon-button small" onClick={()=>setRows(value=>[...value,emptyContribution()])} aria-label={copy.player}><Plus size={14}/></button>}</div>
    {rows.map((row,index)=><div className="contribution-row" key={`${team}-${index}`}>
      <input value={row.playerName} onChange={event=>update(team,index,'playerName',event.target.value)} placeholder={copy.player}/>
      <input type="number" min="0" value={row.goals||''} onChange={event=>update(team,index,'goals',event.target.value)} placeholder={copy.goals}/>
      <input type="number" min="0" value={row.assists||''} onChange={event=>update(team,index,'assists',event.target.value)} placeholder={copy.assists}/>
      <button type="button" className="icon-button small danger" onClick={()=>remove(team,index)} aria-label={copy.delete}><Minus size={14}/></button>
    </div>)}
  </div>;
  return <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="result-modal-title">
    <button ref={backdropRef} className="overlay-backdrop" onClick={requestClose} aria-label={copy.cancel}/>
    <aside ref={panelRef} className="modal-card result-entry-modal">
      <header className="panel-heading"><div><p className="eyebrow">TAAMEN / RESULT</p><h2 id="result-modal-title">{copy.resultTitle}</h2></div><button className="icon-button" onClick={requestClose} aria-label={copy.cancel}><X/></button></header>
      <div className="result-match-preview"><strong>{match.team1}</strong><Trophy/><strong>{match.team2}</strong></div>
      <div className="result-score-grid">
        <label>{copy.team1Score}<input type="number" inputMode="numeric" min="0" max="99" value={score1} onChange={event=>setScore1(event.target.value)}/></label>
        <label>{copy.team2Score}<input type="number" inputMode="numeric" min="0" max="99" value={score2} onChange={event=>setScore2(event.target.value)}/></label>
      </div>
      <label>{copy.note}<textarea rows={3} value={story} onChange={event=>setStory(event.target.value)}/></label>
      <section className="result-contributions"><div><strong>{copy.contributions}</strong><small>{copy.contributionsHelp}</small></div>{contributions(match.team1,'team1',team1,setTeam1)}{contributions(match.team2,'team2',team2,setTeam2)}</section>
      {error&&<div className="error-banner" role="alert">{error}</div>}
      <div className="modal-actions"><button className="dark-action" onClick={requestClose}>{copy.cancel}</button><button className="primary-action" onClick={save} disabled={saving}>{saving?copy.saving:copy.saveResult}</button></div>
    </aside>
  </div>;
}
