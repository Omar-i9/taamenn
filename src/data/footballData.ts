/**
 * Shared match domain model.
 *
 * This file holds types only. It previously also exported seed arrays that were a
 * second copy of the real private archive; those were unreferenced and were removed.
 * Match data reaches the UI from IndexedDB (local records) or the API (private records).
 */

export type MatchType = 'strong' | 'normal' | 'friendly' | 'competitive' | 'tournament';

export type MatchStats = {
  possession: number;
  shots: number;
  onTarget: number;
  saves: number;
  assists: number;
  passes: number;
  fouls: number;
  corners: number;
};

export type PlayerContribution = {
  playerName: string;
  goals: number;
  assists: number;
};

export type Match = {
  createdBy?: string;
  id: string;
  type: MatchType;
  team1: string;
  team2: string;
  score1: number;
  score2: number;
  status: 'UPCOMING'|'STARTING_SOON'|'LIVE'|'FINISHED'|'ARCHIVED'|string;
  dateLabel: string;
  dateKey: number;
  dateISO?: string;
  story: string;
  title?: string;
  stadium?: string;
  city?: string;
  time?: string;
  timezone?: string;
  durationMinutes?: number;
  visibility?: 'LOCAL'|'PUBLIC'|'PRIVATE';
  createdAt?: number;
  updatedAt?: number;
  source?: 'legacy'|'local';
  details?: { team1: MatchStats; team2: MatchStats };
  playerContributions?: {
    team1: PlayerContribution[];
    team2: PlayerContribution[];
  };
};

export type TacticalPlayer = {
  id: string;
  team: 'home' | 'away';
  name: string;
  x: number;
  y: number;
  role: string;
  teamRole: string;
  instruction: string;
  captain: boolean;
  positionMode?: 'auto' | 'manual';
};
