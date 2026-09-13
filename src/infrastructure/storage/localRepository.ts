import { getAll, getItem, putItem, deleteItem } from '../../services/localDb';
import type { LocalDataRepository } from '../../core/domain/models';

export const localRepository: LocalDataRepository = {
  get: (store,id) => getItem(store as never,id),
  list: store => getAll(store as never),
  put: (store,value) => putItem(store as never,value as never),
  remove: (store,id) => deleteItem(store as never,id),
};
