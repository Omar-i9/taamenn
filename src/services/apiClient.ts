import type { Match } from '../data/footballData';

/**
 * HTTP layer for remaining TAAMEN server features:
 * Featured Member recognition, historical records, and support contact.
 *
 * Private Circle password sessions are no longer a product surface.
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') || '/api';

/** A cross-site form cannot set a custom header, so requiring one blocks CSRF. */
const CSRF_HEADER = 'X-TAAMEN-Requested';

export type AuthMethod = 'code';

export type SessionMember = {
  id: string;
  username?: string;
  displayName: string;
  arabicName: string;
  role: string;
};

export type Session = {
  authenticated?: boolean;
  authMethod: AuthMethod;
  member: SessionMember;
  expiresAt: number;
};

export type ContactResult = {
  ok: true;
  contactSent: boolean;
  autoReplySent: boolean;
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

function toMatch(record: Record<string, unknown>): Match {
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
    visibility: 'PRIVATE',
    source: 'legacy',
    details: record.details as Match['details'],
    playerContributions: record.playerContributions as Match['playerContributions'],
  };
}

export const api = {
  async session(): Promise<Session | null> {
    try {
      const value = await request<Session & { authenticated?: boolean; authMethod?: string }>('/auth/session');
      if (value?.authenticated === false) return null;
      if (value?.authMethod !== 'code') {
        await request('/auth/logout', { method: 'POST' }).catch(() => undefined);
        return null;
      }
      return value;
    } catch (error) {
      if (isUnauthenticated(error)) return null;
      throw error;
    }
  },

  recognizeMember(memberCode: string) {
    return request<Session>('/featured/member', { method: 'POST', body: { memberCode } });
  },

  logout() {
    return request<{ ok: true }>('/auth/logout', { method: 'POST' });
  },

  async historicalMatches(): Promise<Match[]> {
    const { items } = await request<{ items: Record<string, unknown>[] }>('/private/historical');
    return items.map(toMatch);
  },

  /** The support recipient is chosen by the server, never by this call. */
  sendContactMessage(input: { email: string; message: string; name?: string }) {
    return request<ContactResult>('/public/contact', { method: 'POST', body: input });
  },
};
