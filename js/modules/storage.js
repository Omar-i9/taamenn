import { CONFIG } from '../config.js';

const prefix = CONFIG.storagePrefix;

export function key(name) {
  return `${prefix}${name}`;
}

export function read(name, fallback = null) {
  try {
    const raw = localStorage.getItem(key(name));
    return raw === null ? fallback : JSON.parse(raw);
  } catch (error) {
    console.warn('Storage read failed:', name, error);
    return fallback;
  }
}

export function write(name, value) {
  try {
    localStorage.setItem(key(name), JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn('Storage write failed:', name, error);
    return false;
  }
}

export function remove(name) {
  try {
    localStorage.removeItem(key(name));
  } catch (error) {
    console.warn('Storage remove failed:', name, error);
  }
}

export function mergeArray(name, item, idField = 'id') {
  const list = read(name, []);
  const exists = list.some(entry => entry?.[idField] === item?.[idField]);
  const next = exists
    ? list.map(entry => entry?.[idField] === item?.[idField] ? item : entry)
    : [item, ...list];
  write(name, next);
  return next;
}
