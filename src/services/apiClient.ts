import type { Match } from '../data/footballData';

/**
 * The single HTTP layer for the TAAMEN backend.
 *
 * Defaults to a same-origin `/api` path so the session cookie is first-party.
 * `VITE_API_BASE_URL` exists for deployments that serve the API from another
 * origin; that topology also needs CORS_ORIGIN configured on the server.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api';

/** A cross-site form cannot set a custom header, so requiring one blocks CSRF. */
const CSRF_HEADER = 'X-TAAMEN-Requested';

export type AuthMethod = 'code' | 'password';
export type MemberRole = 'OWNER' | 'MEMBER';

export type SessionMember = {
  id: string;
  displayName: string;
  arabicName: string;
  role: MemberRole;
};

/**
 * Authorization context as reported by the server. It is display and routing
 * information for the UI; the server re-derives it for every request.
 */
export type Session = {
  authMethod: AuthMethod;
  member: SessionMember;
  expiresAt: number;
};

export type CirclePlayer = {
  id: string;
  displayName: string;
  role: string;
  preferredPosition: string;
  currentStatus: string;
};

export type CircleStatistic = {
  playerId: string;
  displayName: string;
  appearances: number;
  goals: number;
  assists: number;
  saves: number;
  averageRating: number | null;
};

export type CircleNotification = {
  id: string;
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
  createdAt: number;
  read: boolean;
};

export type AdminMember = {
  id: string;
  username: string;
  displayName: string;
  role: MemberRole;
  active: boolean;
  hasPassword: boolean;
};

export type OwnerOverview = {
  activeMembers: number;
  players: number;
  archivedMatches: number;
  unreadNotifications: number;
  latestActivity: Array<{ actor: string; action: string; entity: string; timestamp: number }>;
  members: AdminMember[];
};

export type TacticalPlanPayload = {
  formationId: string;
  players: Array<Record<string, unknown>>;
  landscape?: boolean;
};

/** Carries the HTTP status so callers can distinguish "not signed in" from "not allowed". */
export class ApiError extends Error {
  readonly status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const isUnauthenticated = (error: unknown) => error instanceof ApiError && error.status === 401;
export const isForbidden = (error: unknown) => error instanceof ApiError && error.status === 403;

type RequestOptions = { method?: 'GET' | 'POST'; body?: unknown };

async function request<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers[CSRF_HEADER] = '1';

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      credentials: 'include',
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, 'TAAMEN could not reach the server. Check your connection and try again.');
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof (payload as { error?: unknown }).error === 'string'
      ? (payload as { error: string }).error
      : 'The request could not be completed.';
    throw new ApiError(response.status, message);
  }
  return payload as T;
}

/** Historical and Circle responses are mapped into the one UI Match model. */
function toMatch(record: Record<string, unknown>, visibility: 'PRIVATE'): Match {
  return {
    id: String(record.id ?? ''),
    type: (record.type as Match['type']) ?? 'normal',
    team1: String(record.team1 ?? ''),
    team2: String(record.team2 ?? ''),
    score1: Number(record.score1) || 0,
    score2: Number(record.score2) || 0,
    status: (record.status as Match['status']) ?? 'ARCHIVED',
    dateLabel: String(record.dateLabel ?? ''),
    dateKey: Number(record.dateKey) || 0,
    dateISO: typeof record.dateISO === 'string' ? record.dateISO : undefined,
    story: typeof record.story === 'string' ? record.story : '',
    stadium: typeof record.stadium === 'string' ? record.stadium : undefined,
    city: typeof record.city === 'string' ? record.city : undefined,
    time: typeof record.time === 'string' ? record.time : undefined,
    visibility,
    source: 'legacy',
    details: record.details as Match['details'],
    playerContributions: record.playerContributions as Match['playerContributions'],
  };
}

export const api = {
  /** Returns null when there is no valid session, instead of throwing. */
  async session(): Promise<Session | null> {
    try {
      return await request<Session>('/auth/session');
    } catch (error) {
      if (isUnauthenticated(error)) return null;
      throw error;
    }
  },

  /** Featured Member recognition. Creates a restricted `code` session server-side. */
  recognizeMember(memberCode: string) {
    return request<Session>('/featured/member', { method: 'POST', body: { memberCode } });
  },

  /** Private Circle authentication. Creates a `password` session server-side. */
  login(name: string, password: string) {
    return request<Session>('/auth/login', { method: 'POST', body: { name, password } });
  },

  logout() {
    return request<{ ok: true }>('/auth/logout', { method: 'POST' });
  },

  /** Historical archive. Authorized for recognition sessions only. */
  async historicalMatches(): Promise<Match[]> {
    const { items } = await request<{ items: Record<string, unknown>[] }>('/private/historical');
    return items.map(item => toMatch(item, 'PRIVATE'));
  },

  async circleMatches(): Promise<Match[]> {
    const { items } = await request<{ items: Record<string, unknown>[] }>('/private/circle/matches');
    return items.map(item => toMatch(item, 'PRIVATE'));
  },

  async circlePlayers() {
    const { items } = await request<{ items: CirclePlayer[] }>('/private/circle/players');
    return items;
  },

  async circleStatistics() {
    const { items } = await request<{ items: CircleStatistic[] }>('/private/circle/statistics');
    return items;
  },

  async circleNotifications() {
    const { items } = await request<{ items: CircleNotification[] }>('/private/circle/notifications');
    return items;
  },

  async circleTactical() {
    const { plan } = await request<{ plan: TacticalPlanPayload | null }>('/private/circle/tactical');
    return plan;
  },

  saveCircleTactical(plan: TacticalPlanPayload) {
    return request<{ ok: true }>('/private/circle/tactical', { method: 'POST', body: { plan } });
  },

  ownerOverview() {
    return request<OwnerOverview>('/owner/overview');
  },

  resetMemberPassword(memberId: string, newPassword: string) {
    return request<{ ok: true; member: AdminMember }>(
      `/owner/members/${encodeURIComponent(memberId)}/reset-password`,
      { method: 'POST', body: { newPassword } },
    );
  },

  setMemberStatus(memberId: string, active: boolean) {
    return request<{ ok: true; member: AdminMember }>(
      `/owner/members/${encodeURIComponent(memberId)}/status`,
      { method: 'POST', body: { active } },
    );
  },

  /** The support recipient is chosen by the server, never by this call. */
  sendContactMessage(input: { email: string; message: string; name?: string }) {
    return request<{ ok: true }>('/public/contact', { method: 'POST', body: input });
  },
};
