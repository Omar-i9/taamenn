import type { Match } from '../data/footballData';
import { archiveCopy } from '../i18n/translations';

function winnerFor(match: Match): 'team1'|'team2'|'draw' {
  if (match.score1 > match.score2) return 'team1';
  if (match.score2 > match.score1) return 'team2';
  return 'draw';
}

function typeLabel(type: Match['type'], ar: boolean) {
  const t=archiveCopy[ar?'ar':'en'];
  return ({friendly:t.friendly,normal:t.normal,competitive:t.competitive,tournament:t.tournament,strong:t.strong} as Record<string,string>)[type] || t.other;
}

function formatDate(match: Match, language: 'ar'|'en') {
  if (match.dateISO) {
    const d = new Date(`${match.dateISO}T12:00:00`);
    return d.toLocaleDateString(language === 'ar' ? 'ar-PS' : 'en-GB', { weekday:'short', day:'2-digit', month:'short', year:'numeric' });
  }
  return match.dateLabel;
}

export default function MatchCard({match,language,featured=false,onClick}:{match:Match;language:'ar'|'en';featured?:boolean;onClick?:()=>void}) {
  const ar=language==='ar';
  const winner=winnerFor(match);
  const accent=match.type;
  const confetti=winner==='draw'?null:<div className={`winner-confetti ${winner}`} aria-hidden="true">{Array.from({length:10},(_,i)=><i key={i} className={`confetti-piece piece-${i}`}/>)}</div>;
  const meta=[
    match.id ? `#${match.id}` : '',
    match.status==='ARCHIVED'||match.status==='انتهت' ? (ar?'مؤرشفة':'Archived') : '',
    match.time ? `${archiveCopy[language].time} ${match.time}` : '',
    match.stadium || '',
    match.city || '',
  ].filter(Boolean);
  return <article className={`match-card match-card-premium type-${accent} ${winner!=='draw'?`has-winner winner-${winner}`:'is-draw'} ${featured?'is-featured':''}`} onClick={onClick} role="button" tabIndex={0} aria-label={`${match.team1} ${ar?'مقابل':'vs'} ${match.team2} - ${match.score1}:${match.score2}`}>
    {confetti}
    <div className="match-card-top">
      <span className={`match-type ${accent}`}>{typeLabel(match.type,ar)}</span>
      <span>{formatDate(match,language)}</span>
    </div>
    <div className="match-score-layout">
      <div className={`team-block ${winner==='team1'?'is-winner':''} ${winner==='team2'?'is-loser':''}`}>
        <strong>{match.team1}</strong>
        {winner==='team1'&&<span className="winner-label">{archiveCopy[language].winner}</span>}
      </div>
      <div className="score-block" aria-label={`${match.score1} ${ar?'مقابل':'versus'} ${match.score2}`}>
        <b>{match.score1}</b><i>:</i><b>{match.score2}</b>
        {winner==='draw'&&<span className="result-label">{archiveCopy[language].draw}</span>}
      </div>
      <div className={`team-block team-block-right ${winner==='team2'?'is-winner':''} ${winner==='team1'?'is-loser':''}`}>
        <strong>{match.team2}</strong>
        {winner==='team2'&&<span className="winner-label">{archiveCopy[language].winner}</span>}
      </div>
    </div>
    {meta.length>0&&<div className="match-meta-row">{meta.map((item,i)=><span key={`${item}-${i}`}>{item}</span>)}</div>}
    {match.story&&<p className="match-story">{match.story}</p>}
    {match.details&&<div className="match-metrics">
      <span>{match.score1+match.score2}<small>{archiveCopy[language].goals}</small></span>
      <span>{match.details.team1.shots}<small>{archiveCopy[language].shots}</small></span>
      <span>{match.details.team2.shots}<small>{archiveCopy[language].oppShots}</small></span>
    </div>}
  </article>;
}

export { winnerFor };
