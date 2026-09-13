/**
 * Response shaping. Each endpoint returns only the fields its caller needs, so a
 * narrower scope cannot receive data belonging to a wider one.
 */

/** Identity of the caller's own session. Never includes the recognition code. */
export function sessionMemberDto(member) {
  return {
    id: member.id,
    displayName: member.displayName,
    arabicName: member.arabicName || '',
    role: member.role,
  };
}

/** Owner member administration view. Still excludes hashes and recognition codes. */
export function adminMemberDto(member) {
  return {
    id: member.id,
    username: member.username,
    displayName: member.displayName,
    role: member.role,
    active: member.active !== false,
    hasPassword: Boolean(member.passwordHash),
  };
}

const MATCH_FIELDS = [
  'id', 'type', 'team1', 'team2', 'score1', 'score2', 'status',
  'dateLabel', 'dateKey', 'dateISO', 'time', 'stadium', 'city', 'story',
];

function baseMatch(match) {
  const out = {};
  for (const field of MATCH_FIELDS) {
    if (match[field] !== undefined) out[field] = match[field];
  }
  return out;
}

/** Historical archive read for a recognition (code) session. */
export function historicalMatchDto(match) {
  return { ...baseMatch(match), source: 'legacy' };
}

/** Private Circle match read for a password session, including per-match detail. */
export function circleMatchDto(match) {
  const out = { ...baseMatch(match), visibility: 'PRIVATE' };
  if (match.details && typeof match.details === 'object') out.details = match.details;
  if (match.playerContributions && typeof match.playerContributions === 'object') {
    out.playerContributions = match.playerContributions;
  }
  return out;
}

export function circlePlayerDto(player) {
  return {
    id: player.id,
    displayName: player.displayName,
    role: player.role || 'Player',
    preferredPosition: player.preferredPosition || '',
    currentStatus: player.currentStatus || 'active',
  };
}

export function notificationDto(notification) {
  return {
    id: notification.id,
    title: notification.title || '',
    titleAr: notification.titleAr || '',
    body: notification.body || '',
    bodyAr: notification.bodyAr || '',
    createdAt: Number(notification.createdAt) || 0,
    read: notification.read === true,
  };
}

/** Derived statistics from authoritative match/performance records. */
export function statisticsFor(data) {
  const totals = new Map();
  for (const row of data.performance) {
    if (!row || typeof row.playerId !== 'string') continue;
    const entry = totals.get(row.playerId) || { appearances: 0, goals: 0, assists: 0, saves: 0, ratingSum: 0 };
    entry.appearances += 1;
    entry.goals += Number(row.goals) || 0;
    entry.assists += Number(row.assists) || 0;
    entry.saves += Number(row.saves) || 0;
    entry.ratingSum += Number(row.rating) || 0;
    totals.set(row.playerId, entry);
  }

  return data.players
    .map(player => {
      const live = totals.get(player.id);
      const legacy = player.legacyStats || {};
      const appearances = live?.appearances || Number(legacy.appearances) || 0;
      const averageRating = live?.appearances
        ? live.ratingSum / live.appearances
        : (typeof legacy.averageRating === 'number' ? legacy.averageRating : null);
      return {
        playerId: player.id,
        displayName: player.displayName,
        appearances,
        goals: live?.goals || Number(legacy.goals) || 0,
        assists: live?.assists || Number(legacy.assists) || 0,
        saves: live?.saves || Number(legacy.saves) || 0,
        averageRating,
      };
    })
    .sort((a, b) => (b.averageRating ?? -1) - (a.averageRating ?? -1));
}
