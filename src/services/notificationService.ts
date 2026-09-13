import { getAll, putItem, deleteItem, getItem } from './localDb';
import { listMatches } from './matchRepository';

export type AppNotification = {
  id: string;
  type: 'match'|'system'|'tactical'|'archive';
  kind: 'match'|'system'|'tactical';
  title: string;
  titleAr?: string;
  body: string;
  bodyAr?: string;
  message?: string;
  messageAr?: string;
  timestamp?: number;
  createdAt: number;
  read: boolean;
  relatedEntityId?: string;
};

const seed:AppNotification[]=[
 {id:'welcome',type:'system',kind:'system',title:'TAAMEN 2.0',titleAr:'TAAMEN 2.0',body:'Your local notification center is ready.',bodyAr:'تم تجهيز مركز الإشعارات محليًا.',createdAt:Date.now()-86400000,read:false,timestamp:Date.now()-86400000},
];

export async function listNotifications(){
  const all=await getAll<AppNotification>('notifications');
  const hasBootstrapped=await getItem<{bootstrapped:boolean}>('appState','notificationBootstrap');
  if(hasBootstrapped===undefined || !hasBootstrapped.bootstrapped){
    for(const item of seed)await putItem('notifications',item);
    await putItem('appState',{id:'notificationBootstrap',bootstrapped:true});
  }
  return (await getAll<AppNotification>('notifications')).sort((a,b)=>b.createdAt-a.createdAt);
}
export async function unreadCount(){return (await listNotifications()).filter(n=>!n.read).length}
export async function markNotificationRead(id:string){const item=(await listNotifications()).find(n=>n.id===id);if(item)await putItem('notifications',{...item,read:true,timestamp:item.timestamp||item.createdAt})}
export async function markAllNotificationsRead(){for(const item of await listNotifications())if(!item.read)await putItem('notifications',{...item,read:true,timestamp:item.timestamp||item.createdAt})}
export async function deleteNotification(id:string){await deleteItem('notifications',id)}
export async function clearNotifications(){for(const item of await listNotifications())await deleteItem('notifications',item.id)}

async function ensureEvent(id:string, payload:Omit<AppNotification,'id'>){
  const existing=await getAll<AppNotification>('notifications');
  if(existing.some(n=>n.id===id))return false;
  await putItem('notifications',{id,...payload});
  return true;
}

export async function reconcileMatchNotifications(now=Date.now()){
  const matches=await listMatches();
  let changed=false;
  for(const match of matches){
    const teams=`${match.team1} × ${match.team2}`;
    if(match.status==='FINISHED'||match.status==='ARCHIVED'||match.status==='انتهت'){
      changed ||= await ensureEvent(`match:${match.id}:completed`,{type:'match',kind:'match',title:'Match completed',titleAr:'اكتملت المباراة',body:`${teams} — ${match.score1}:${match.score2}`,bodyAr:`${teams} — ${match.score1}:${match.score2}`,message:`${teams} — ${match.score1}:${match.score2}`,messageAr:`${teams} — ${match.score1}:${match.score2}`,createdAt:now,read:false,relatedEntityId:match.id,timestamp:now});
      if(match.status==='ARCHIVED')changed ||= await ensureEvent(`archive:${match.id}:completed`,{type:'archive',kind:'system',title:'Archive created',titleAr:'تم إنشاء سجل المباراة',body:`${teams} is now archived.`,bodyAr:`تمت أرشفة ${teams}.`,message:`${teams} is now archived.`,messageAr:`تمت أرشفة ${teams}.`,createdAt:now,read:false,relatedEntityId:match.id,timestamp:now});
      continue;
    }
    if(!match.time)continue;
    const date=`${String(match.dateKey).slice(0,4)}-${String(match.dateKey).slice(4,6)}-${String(match.dateKey).slice(6,8)}`;
    const target=new Date(`${date}T${match.time}:00`).getTime();
    if(!Number.isFinite(target))continue;
    const diff=target-now;
    if(diff>0&&diff<=24*60*60*1000)changed ||= await ensureEvent(`match:${match.id}:approaching`,{type:'match',kind:'match',title:'Match approaching',titleAr:'المباراة تقترب',body:`${teams} starts within 24 hours.`,bodyAr:`تبدأ ${teams} خلال 24 ساعة.`,message:`${teams} starts within 24 hours.`,messageAr:`تبدأ ${teams} خلال 24 ساعة.`,createdAt:now,read:false,relatedEntityId:match.id,timestamp:now});
    if(diff>0&&diff<=5*60*1000)changed ||= await ensureEvent(`match:${match.id}:starting`,{type:'match',kind:'match',title:'Match starting soon',titleAr:'المباراة ستبدأ قريبًا',body:`${teams} starts in a few minutes.`,bodyAr:`تبدأ ${teams} خلال دقائق قليلة.`,message:`${teams} starts in a few minutes.`,messageAr:`تبدأ ${teams} خلال دقائق قليلة.`,createdAt:now,read:false,relatedEntityId:match.id,timestamp:now});
    if(diff<=0)changed ||= await ensureEvent(`match:${match.id}:started`,{type:'match',kind:'match',title:'Match started',titleAr:'بدأت المباراة',body:`${teams} has reached its scheduled start time.`,bodyAr:`حان موعد بدء ${teams}.`,message:`${teams} has reached its scheduled start time.`,messageAr:`حان موعد بدء ${teams}.`,createdAt:now,read:false,relatedEntityId:match.id,timestamp:now});
  }
  return changed;
}
