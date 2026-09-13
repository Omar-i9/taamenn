const DB_NAME='taamen-2';
const DB_VERSION=4;
export type StoreName='profile'|'settings'|'matches'|'archive'|'notifications'|'tactical'|'screenshots'|'sharedItems'|'preferences'|'appState'|'syncQueue'|'metadata';
const STORES:StoreName[]=['profile','settings','matches','archive','notifications','tactical','screenshots','sharedItems','preferences','appState','syncQueue','metadata'];
function openDb():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,DB_VERSION);r.onupgradeneeded=(event)=>{const d=r.result;for(const n of STORES)if(!d.objectStoreNames.contains(n))d.createObjectStore(n,{keyPath:'id'});const tx=r.transaction;if((event as IDBVersionChangeEvent).oldVersion<4&&d.objectStoreNames.contains('matches')&&d.objectStoreNames.contains('archive')&&tx){const src=tx.objectStore('matches');const dest=tx.objectStore('archive');src.getAll().onsuccess=e=>{const result=(e.target as IDBRequest).result||[];for(const m of result)if(m.status==='ARCHIVED')dest.put({...m,visibility:m.visibility==='PRIVATE'?'PRIVATE':m.visibility||'LOCAL'});};}};r.onsuccess=()=>{const db=r.result;db.onversionchange=()=>db.close();resolve(db)};r.onerror=()=>reject(r.error)})}
async function tx<T>(store:StoreName,mode:IDBTransactionMode,work:(s:IDBObjectStore)=>IDBRequest|void):Promise<T|undefined>{const db=await openDb();return new Promise((resolve,reject)=>{const t=db.transaction(store,mode),s=t.objectStore(store);let r:IDBRequest|void;try{r=work(s)}catch(e){db.close();reject(e);return}t.oncomplete=()=>{resolve(r?(r.result as T):undefined);db.close()};t.onerror=()=>{reject(t.error);db.close()}})}
export async function getItem<T>(s:StoreName,id:string){return tx<T>(s,'readonly',x=>x.get(id))}
export async function getAll<T>(s:StoreName){return (await tx<T[]>(s,'readonly',x=>x.getAll()))||[]}
export async function putItem<T extends {id:string}>(s:StoreName,v:T){await tx(s,'readwrite',x=>x.put(v))}
export async function deleteItem(s:StoreName,id:string){await tx(s,'readwrite',x=>x.delete(id))}
export async function clearStore(s:StoreName){await tx(s,'readwrite',x=>x.clear())}
export async function resetTaamenData(){for(const s of STORES)await clearStore(s)}
export async function seedMatches(seed:unknown[]){if((await getAll('matches')).length)return;for(const m of seed as Array<{id:string}>)await putItem('matches',m)}
export async function seedNotifications(seed:unknown[]){if((await getAll('notifications')).length)return;for(const m of seed as Array<{id:string}>)await putItem('notifications',m)}
export async function getStorageEstimate(){try{return await navigator.storage?.estimate()}catch{return undefined}}
export type BackupEnvelope={format:'taamen-backup';version:2;createdAt:string;stores:Partial<Record<StoreName,unknown[]>>};
export async function exportTaamenBackup():Promise<BackupEnvelope>{const stores:BackupEnvelope['stores']={};for(const s of STORES)stores[s]=await getAll(s);return{format:'taamen-backup',version:2,createdAt:new Date().toISOString(),stores}}
function validBackup(x:unknown):x is BackupEnvelope{if(!x||typeof x!=='object')return false;const b=x as BackupEnvelope;return b.format==='taamen-backup'&&[1,2].includes(b.version)&&!!b.stores&&typeof b.stores==='object'}
export async function importTaamenBackup(input:unknown){if(!validBackup(input))throw new Error('Invalid TAAMEN backup');const stores=input.stores||{};for(const s of STORES){const records=Array.isArray(stores[s])?stores[s]! : [];for(const item of records)if(item&&typeof item==='object'&&typeof(item as{id?:unknown}).id==='string')await putItem(s,item as{id:string})}}
