/**
 * Response shaping. Each endpoint returns only the fields its caller needs.
 */

/** Identity of the caller's own session. Never includes the recognition code. */
export function sessionMemberDto(member) {
  return {
    id: member.id,
    username: member.username,
    displayName: member.displayName,
    arabicName: member.arabicName || '',
    role: member.role,
  };
}

const MATCH_FIELDS = [
  'id', 'type', 'team1', 'team2', 'score1', 'score2', 'status',
  'dateLabel', 'dateKey', 'dateISO', 'time', 'stadium', 'city', 'story',
  'details', 'playerContributions',
];

function baseMatch(match) {
  const out = {};
  for (const field of MATCH_FIELDS) {
    if (match[field] !== undefined) out[field] = match[field];
  }
  return out;
}

/** Historical archive read for a Featured Member recognition session. */
export function historicalMatchDto(match) {
  return { ...baseMatch(match), source: 'legacy' };
}
