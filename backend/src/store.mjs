import { getDataStore } from './runtime.mjs';

const SCHEMA_VERSION = 1;
const COLLECTIONS = ['members', 'players', 'matches', 'notifications', 'performance', 'invitations', 'audit'];

const ROLES = new Set(['OWNER', 'MEMBER', 'FEATURED_MEMBER']);

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function validMember(member) {
  return Boolean(
    member &&
    typeof member === 'object' &&
    typeof member.id === 'string' && member.id &&
    typeof member.username === 'string' && member.username &&
    typeof member.displayName === 'string' &&
    ROLES.has(member.role)
  );
}

/**
 * Repair rather than reject: a single malformed member must not make the whole
 * operator dataset unloadable, but it must not be trusted either.
 */
export function validateData(input) {
  const raw = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const data = { schemaVersion: SCHEMA_VERSION };
  for (const key of COLLECTIONS) data[key] = asArray(raw[key]);
  data.tacticalPlan = raw.tacticalPlan && typeof raw.tacticalPlan === 'object' ? raw.tacticalPlan : null;

  const seen = new Set();
  data.members = data.members.filter(member => {
    if (!validMember(member)) return false;
    if (seen.has(member.id)) return false;
    seen.add(member.id);
    member.active = member.active !== false;
    return true;
  });

  return data;
}

export const store = {
  load: () => getDataStore().load(),
  read: reader => getDataStore().read(reader),
  update: mutator => getDataStore().update(mutator),
};

export function findMemberById(data, memberId) {
  return data.members.find(member => member.id === memberId) || null;
}

export function findActiveMemberByCode(data, code) {
  const wanted = String(code).trim().toUpperCase();
  if (!wanted) return null;
  return data.members.find(
    member => member.active && String(member.memberCode || '').toUpperCase() === wanted
  ) || null;
}

export function findActiveMemberByName(data, name) {
  const raw = String(name).trim();
  if (!raw) return null;
  const normalized = raw.toLocaleLowerCase().replace(/\s+/g, ' ');
  return data.members.find(member => {
    if (!member.active) return false;
    return (
      member.username === normalized ||
      String(member.displayName || '').toLocaleLowerCase() === normalized ||
      member.arabicName === raw
    );
  }) || null;
}

export function appendAudit(data, entry) {
  data.audit.push({ ...entry, timestamp: Date.now() });
  if (data.audit.length > 500) data.audit.splice(0, data.audit.length - 500);
}
