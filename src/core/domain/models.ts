export interface LocalDataRepository {
  get<T>(store:string,id:string):Promise<T|undefined>;
  list<T>(store:string):Promise<T[]>;
  put<T extends {id:string}>(store:string,value:T):Promise<void>;
  remove(store:string,id:string):Promise<void>;
}

export interface CloudDataRepository extends LocalDataRepository {}
export interface SyncEngine { enqueue(operation:unknown):Promise<void>; flush():Promise<void>; }
