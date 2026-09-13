export type Visibility = 'LOCAL' | 'PUBLIC' | 'PRIVATE';
export type MatchStatus = 'UPCOMING' | 'FINISHED' | 'ARCHIVED';
export type MatchType = 'friendly' | 'normal' | 'competitive' | 'tournament' | 'strong';
export type MatchRecord = {
  id:string; type:MatchType; team1:string; team2:string; score1:number; score2:number;
  status:MatchStatus; title?:string; dateLabel:string; dateKey:number; dateISO?:string; time?:string;
  timezone:string; weekday?:string; stadium?:string; city?:string; durationMinutes?:number; story?:string;
  details?:unknown; visibility:Visibility; createdAt:number; updatedAt:number;
};

export interface LocalDataRepository {
  get<T>(store:string,id:string):Promise<T|undefined>;
  list<T>(store:string):Promise<T[]>;
  put<T extends {id:string}>(store:string,value:T):Promise<void>;
  remove(store:string,id:string):Promise<void>;
}

export interface CloudDataRepository extends LocalDataRepository {}
export interface SyncEngine { enqueue(operation:unknown):Promise<void>; flush():Promise<void>; }
