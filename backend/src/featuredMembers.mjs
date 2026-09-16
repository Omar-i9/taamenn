/**
 * Authoritative Featured Member directory.
 *
 * Recognition codes stay on the server. The client never receives this list.
 * Identifiers are stable (username-based), not array indexes.
 * There are no passwords: a Featured ID is recognition, not a secret credential.
 */
export const FEATURED_MEMBERS = [
  { id: 'member-omar', username: 'omar', displayName: 'عمر ابوزينة', arabicName: 'عمر ابوزينة', memberCode: 'user#E9772' },
  { id: 'member-hani', username: 'hani', displayName: 'هاني كرامة', arabicName: 'هاني كرامة', memberCode: 'user#223G5' },
  { id: 'member-kareem', username: 'kareem', displayName: 'كريم الدويك', arabicName: 'كريم الدويك', memberCode: 'user#13F4' },
  { id: 'member-mohammad-ali', username: 'mohammad-ali', displayName: 'محمد الجعبري', arabicName: 'محمد الجعبري', memberCode: 'user#93D07' },
  { id: 'member-moamen', username: 'moamen', displayName: 'مؤمن كرامة', arabicName: 'مؤمن كرامة', memberCode: 'user#03651' },
  { id: 'member-ibrahim', username: 'ibrahim', displayName: 'ابراهيم كرامة', arabicName: 'ابراهيم كرامة', memberCode: 'user#C7E7E' },
  { id: 'member-arqam', username: 'arqam', displayName: 'ارقم ابوزينة', arabicName: 'ارقم ابوزينة', memberCode: 'user#B67E6' },
  { id: 'member-moayad', username: 'moayad', displayName: 'مؤيد القواسمة', arabicName: 'مؤيد القواسمة', memberCode: 'user#3C885' },
  { id: 'member-khodr', username: 'khodr', displayName: 'خضر مسك', arabicName: 'خضر مسك', memberCode: 'user#7A2D1' },
  { id: 'member-abu-zughair', username: 'abu-zughair', displayName: 'محمد زغير', arabicName: 'محمد زغير', memberCode: 'user#D83F2' },
  { id: 'member-muhammad', username: 'muhammad', displayName: 'محمد ناصر الدين', arabicName: 'محمد ناصر الدين', memberCode: 'user#91B6D' },
  { id: 'member-sanqurt', username: 'sanqurt', displayName: 'محمد سنقرط', arabicName: 'محمد سنقرط', memberCode: 'user#E52A9' },
];

const CREATED_AT = 1_700_000_000_000;

export function featuredMemberRecord(canonical, existing) {
  return {
    id: existing?.id || canonical.id,
    username: canonical.username,
    displayName: canonical.displayName,
    arabicName: canonical.arabicName,
    role: 'FEATURED_MEMBER',
    active: true,
    memberCode: canonical.memberCode,
    createdAt: typeof existing?.createdAt === 'number' ? existing.createdAt : CREATED_AT,
  };
}

/** Replace the member collection with the 12 canonical Featured records. Matches are untouched. */
export function syncFeaturedMembers(data) {
  const byCode = new Map();
  for (const member of data.members || []) {
    const code = String(member.memberCode || '').toUpperCase();
    if (code) byCode.set(code, member);
  }
  data.members = FEATURED_MEMBERS.map(canonical => (
    featuredMemberRecord(canonical, byCode.get(canonical.memberCode.toUpperCase()))
  ));
}
