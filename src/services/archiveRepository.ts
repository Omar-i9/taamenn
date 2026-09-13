import type { Match } from '../data/footballData';
import { getAll, putItem, deleteItem } from './localDb';

/** Current/general-user archive only. Historical TAAMEN records live in a feature boundary. */
export async function listCurrentArchive(): Promise<Match[]> {
  const dedicated = await getAll<Match>('archive');
  const local = (await getAll<Match>('matches'))
    .filter(m => m.source !== 'legacy')
    .filter(m => m.visibility !== 'PRIVATE')
    .filter(m => m.status === 'FINISHED' || m.status === 'ARCHIVED');
  const map = new Map<string, Match>();
  [...dedicated, ...local].forEach(m => {
    if (m.source !== 'legacy') map.set(m.id, m);
  });
  return [...map.values()].sort((a, b) => b.dateKey - a.dateKey);
}

export async function addMatchToArchive(match: Match): Promise<Match> {
  if (match.visibility === 'PRIVATE' || match.source === 'legacy') throw new Error('invalid-current-record');
  await putItem('archive', match);
  return match;
}

export async function savePublicArchive(m: Match) {
  if (m.visibility === 'PRIVATE' || m.source === 'legacy') throw new Error('invalid-current-record');
  await putItem('archive', m);
  return m;
}

export async function removePublicArchive(id: string) {
  await deleteItem('archive', id);
}
