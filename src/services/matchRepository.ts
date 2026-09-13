import type { Match, MatchType } from '../data/footballData';
import { getAll, putItem, deleteItem } from './localDb';

export async function initMatchRepository(){ await getAll<Match>('matches'); }
export async function listMatches():Promise<Match[]>{ await initMatchRepository(); return (await getAll<Match>('matches')).sort((a,b)=>(b.dateKey-a.dateKey)||(Number(b.createdAt||0)-Number(a.createdAt||0))); }
export async function createLocalUpcomingMatch(input:{title?:string;team1:string;team2:string;stadium:string;city:string;date:string;time:string;durationMinutes?:number;note?:string;type?:MatchType;visibility?:'LOCAL'|'PUBLIC'}) {
  const d=new Date(`${input.date}T${input.time}:00`); if(Number.isNaN(d.getTime())) throw new Error('Invalid date/time');
  const now=Date.now(); const id=`LOCAL-${now}-${Math.random().toString(36).slice(2,9)}`;
  const match:Match={id,type:input.type||'normal',team1:input.team1||'TAAMEN',team2:input.team2||'Opponent',score1:0,score2:0,status:'UPCOMING',dateLabel:d.toLocaleDateString('ar-PS',{day:'numeric',month:'long',year:'numeric'}),dateKey:Number(input.date.replaceAll('-','')),story:input.note||'',title:input.title||`${input.team1} × ${input.team2}`,stadium:input.stadium,city:input.city,time:input.time,timezone:'Asia/Jerusalem',durationMinutes:input.durationMinutes||60,visibility:input.visibility||'LOCAL',source:'local',createdAt:now,updatedAt:now};
  await putItem('matches',match); return match;
}
export async function updateMatch(match:Match){const value={...match,updatedAt:Date.now()}; await putItem('matches',value); return value;}
export async function deleteMatch(id:string){await deleteItem('matches',id);await deleteItem('archive',id);}
export async function archiveMatch(id:string){const all=await listMatches();const current=all.find(x=>x.id===id);if(!current)throw new Error('Match not found');const archived=await updateMatch({...current,status:'ARCHIVED',source:'local'});await putItem('archive',archived);return archived}
export async function finishMatch(id:string,score1:number,score2:number,story=''){const all=await listMatches();const current=all.find(x=>x.id===id);if(!current)throw new Error('Match not found');return updateMatch({...current,score1,score2,status:'FINISHED',story});}
