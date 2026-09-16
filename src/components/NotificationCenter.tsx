import {useEffect,useState} from 'react';
import {Bell,Check,CheckCheck,X,Trash2,Clock3,Archive} from'lucide-react';
import {clearNotifications,deleteNotification,listNotifications,markAllNotificationsRead,markNotificationRead,type AppNotification}from'../services/notificationService';
import {useOverlayPresence}from'../motion/useOverlayPresence';
import {notificationUiCopy}from'../i18n/translations';
import {PALESTINE_TIMEZONE}from'../shared/formatting/dateTime';

export function NotificationCenter({open,onClose,language,onChanged}:{open:boolean;onClose:()=>void;language:'ar'|'en';onChanged?:()=>void}){
 const ar=language==='ar';const copy=notificationUiCopy[language];const[items,setItems]=useState<AppNotification[]>([]);const[filter,setFilter]=useState<'all'|'unread'|'match'|'system'|'tactical'>('all');
 useEffect(()=>{if(open)listNotifications().then(setItems)},[open]);
 const{backdropRef,panelRef,requestClose}=useOverlayPresence<HTMLButtonElement,HTMLElement>('drawer',onClose,open);
 if(!open)return null;
 const shown=items.filter(x=>filter==='all'||filter===x.kind||(filter==='unread'&&!x.read));
 const refresh=async()=>{setItems(await listNotifications());onChanged?.()};
 const remove=async(id:string)=>{await deleteNotification(id);await refresh()};
 return <div className="overlay" role="dialog" aria-modal="true" aria-label={copy.title}><button ref={backdropRef} className="overlay-backdrop" aria-label={copy.close} onClick={requestClose}/><aside ref={panelRef} className="notification-drawer">
  <header><div><span className="eyebrow">TAAMEN / NOTIFICATIONS</span><h2>{copy.title} <em>{items.filter(x=>!x.read).length}</em></h2></div><button className="icon-button" onClick={requestClose} aria-label={copy.close}><X/></button></header>
  <div className="notification-toolbar"><div className="filter-row">{(['all','unread','match','system','tactical'] as const).map(f=><button className={filter===f?'is-active':''} key={f} onClick={()=>setFilter(f)}>{f==='all'?copy.all:f==='unread'?copy.unread:f==='match'?copy.matches:f==='system'?copy.system:copy.tactical}</button>)}</div><div className="notification-actions"><button onClick={async()=>{await markAllNotificationsRead();await refresh()}}><CheckCheck size={14}/>{copy.markAll}</button><button onClick={async()=>{await clearNotifications();await refresh()}}><Trash2 size={14}/>{copy.deleteAll}</button></div></div>
  <div className="notification-list">{shown.length===0&&<div className="empty-state"><Bell/><strong>{copy.empty}</strong></div>}{shown.map(item=><article className={`notification-card ${item.read?'read':'unread'}`} key={item.id}><div className="notification-icon">{item.type==='archive'?<Archive size={17}/>:item.type==='match'?<Clock3 size={17}/>:<Bell size={17}/>}</div><div className="notification-copy"><strong>{ar?(item.titleAr||item.title):(item.title)}</strong><p>{ar?(item.messageAr||item.bodyAr||item.message||item.body):(item.message||item.body)}</p><small>{new Date(item.createdAt).toLocaleString(ar?'ar-PS':'en-GB',{timeZone:PALESTINE_TIMEZONE})}</small></div><div className="notification-item-actions">{!item.read&&<button className="icon-button" onClick={async()=>{await markNotificationRead(item.id);await refresh()}} aria-label={copy.markRead}><Check size={15}/></button>}<button className="icon-button" onClick={()=>remove(item.id)} aria-label={copy.delete}><Trash2 size={15}/></button></div></article>)}</div>
 </aside></div>;
}
