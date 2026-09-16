import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarCopy, type Language } from '../i18n/translations';
import { formatMatchDate, todayInTimeZone } from '../shared/formatting/dateTime';

type Props={
  value:string;
  onChange:(value:string)=>void;
  language:Language;
  min?:string;
  max?:string;
  required?:boolean;
};

function civilDate(value:string){
  const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match?new Date(Date.UTC(Number(match[1]),Number(match[2])-1,Number(match[3]),12)):null;
}

function isoDate(year:number,month:number,day:number){
  return `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

export default function TaamenDatePicker({value,onChange,language,min,max,required}:Props){
  const copy=calendarCopy[language];
  const root=useRef<HTMLDivElement>(null);
  const selected=civilDate(value);
  const today=todayInTimeZone();
  const initial=selected||civilDate(today)!;
  const[open,setOpen]=useState(false);
  const[view,setView]=useState(()=>({year:initial.getUTCFullYear(),month:initial.getUTCMonth()}));

  useEffect(()=>{
    if(!open)return;
    const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};
    window.addEventListener('pointerdown',close);
    root.current?.querySelector('.date-picker-popover')?.scrollIntoView({block:'nearest',inline:'nearest'});
    return()=>window.removeEventListener('pointerdown',close);
  },[open]);

  useEffect(()=>{
    if(!selected)return;
    setView({year:selected.getUTCFullYear(),month:selected.getUTCMonth()});
  },[value]);

  const days=useMemo(()=>{
    const first=new Date(Date.UTC(view.year,view.month,1,12));
    const count=new Date(Date.UTC(view.year,view.month+1,0,12)).getUTCDate();
    return [...Array(first.getUTCDay()).fill(null),...Array.from({length:count},(_,index)=>index+1)];
  },[view]);
  const monthLabel=new Intl.DateTimeFormat(language==='ar'?'ar-PS':'en-GB',{month:'long',year:'numeric',timeZone:'UTC'})
    .format(new Date(Date.UTC(view.year,view.month,1,12)));
  const move=(delta:number)=>{
    const date=new Date(Date.UTC(view.year,view.month+delta,1,12));
    setView({year:date.getUTCFullYear(),month:date.getUTCMonth()});
  };
  const choose=(day:number)=>{
    const next=isoDate(view.year,view.month,day);
    if((min&&next<min)||(max&&next>max))return;
    onChange(next);
    setOpen(false);
  };

  return <div className="taamen-date-picker" ref={root}>
    <button type="button" className="date-picker-trigger" aria-haspopup="dialog" aria-expanded={open} aria-label={copy.open} onClick={()=>setOpen(value=>!value)}>
      <span>{value?formatMatchDate(value,Number(value.replaceAll('-','')),language).compact:'DD/MM/YY'}</span>
      <CalendarDays size={17}/>
    </button>
    {required&&<input className="date-picker-required" tabIndex={-1} aria-hidden="true" required value={value} onChange={()=>{}}/>}
    {open&&<div className="date-picker-popover" role="dialog" aria-label={copy.open}>
      <header>
        <button type="button" className="icon-button" onClick={()=>move(-1)} aria-label={copy.previousMonth}><ChevronLeft size={17}/></button>
        <strong>{monthLabel}</strong>
        <button type="button" className="icon-button" onClick={()=>move(1)} aria-label={copy.nextMonth}><ChevronRight size={17}/></button>
      </header>
      <div className="date-picker-weekdays">{copy.weekdays.map(day=><span key={day}>{day}</span>)}</div>
      <div className="date-picker-days">{days.map((day,index)=>day===null?<span key={`empty-${index}`}/>:(()=>{
        const iso=isoDate(view.year,view.month,day);
        const disabled=Boolean((min&&iso<min)||(max&&iso>max));
        return <button type="button" key={iso} disabled={disabled} className={`${iso===value?'is-selected ':''}${iso===today?'is-today':''}`} aria-pressed={iso===value} onClick={()=>choose(day)}>{day}</button>;
      })())}</div>
      <footer>
        <button type="button" className="text-button" onClick={()=>{onChange('');setOpen(false)}}>{copy.clear}</button>
        <button type="button" className="text-button" onClick={()=>{onChange(today);setOpen(false)}} disabled={Boolean((min&&today<min)||(max&&today>max))}>{copy.today}</button>
      </footer>
    </div>}
  </div>;
}
