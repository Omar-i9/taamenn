import {
  siteMeta,
  security,
  upcomingMatches,
  matchArchive,
  playerStats,
  tactics
} from '../../data/site-data.js';
import { injuryCases } from '../../data/injuries-data.js';
import { getLatestWeather, calculatePlayability, weatherDescription } from './weather.js';
import { hasAIEndpoint } from './api-client.js';

export const PALESTINE_TIME_ZONE = 'Asia/Jerusalem';

const DATE_PARTS = new Intl.DateTimeFormat('en-CA', {
  timeZone: PALESTINE_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23'
});

const WEEKDAY_PARTS = new Intl.DateTimeFormat('en-US', {
  timeZone: PALESTINE_TIME_ZONE,
  weekday: 'short'
});

const WEEKDAY_INDEX = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6
};

export function getPalestineParts(date = new Date()) {
  const parts = Object.fromEntries(
    DATE_PARTS.formatToParts(date)
      .filter(part => part.type !== 'literal')
      .map(part => [part.type, Number(part.value)])
  );
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: parts.hour,
    minute: parts.minute,
    second: parts.second
  };
}

export function getPalestineWeekday(date = new Date()) {
  return WEEKDAY_INDEX[WEEKDAY_PARTS.format(date)] ?? date.getDay();
}

function getTimeZoneOffsetMs(date) {
  const parts = getPalestineParts(date);
  const asUTC = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return asUTC - date.getTime();
}

export function makePalestineDate({ year, month, day, hour = 0, minute = 0, second = 0 }) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  let offset = getTimeZoneOffsetMs(new Date(utcGuess));
  let instant = utcGuess - offset;
  offset = getTimeZoneOffsetMs(new Date(instant));
  instant = utcGuess - offset;
  return new Date(instant);
}

function parseDateISO(value) {
  const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2})(?::(\d{2}))?)?/);
  if (!match) return null;
  return makePalestineDate({
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4] || 19),
    minute: Number(match[5] || 0),
    second: Number(match[6] || 0)
  });
}

export function getMatchDate(match, fromDate = new Date()) {
  if (!match) return null;

  const isoDate = parseDateISO(match.dateISO);
  if (isoDate && Number.isFinite(isoDate.getTime())) return isoDate;

  const key = String(match.dateKey || '');
  if (/^\d{8}$/.test(key)) {
    return makePalestineDate({
      year: Number(key.slice(0, 4)),
      month: Number(key.slice(4, 6)),
      day: Number(key.slice(6, 8)),
      hour: Number(match.hour ?? 19),
      minute: Number(match.minute ?? 0)
    });
  }

  const nowParts = getPalestineParts(fromDate);
  const currentWeekday = getPalestineWeekday(fromDate);
  const targetWeekday = Number(match.weekday ?? 5);
  const daysUntil = (targetWeekday - currentWeekday + 7) % 7;
  const candidate = makePalestineDate({
    year: nowParts.year,
    month: nowParts.month,
    day: nowParts.day + daysUntil,
    hour: Number(match.hour ?? 19),
    minute: Number(match.minute ?? 0)
  });

  if (candidate <= fromDate) {
    const parts = getPalestineParts(candidate);
    return makePalestineDate({ ...parts, day: parts.day + 7, hour: Number(match.hour ?? 19), minute: Number(match.minute ?? 0) });
  }
  return candidate;
}

export function formatPalestineDate(date, options = {}) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ar-PS', {
    timeZone: PALESTINE_TIME_ZONE,
    weekday: options.withWeekday === false ? undefined : 'long',
    year: options.year === false ? undefined : 'numeric',
    month: options.month || 'long',
    day: 'numeric'
  }).format(date);
}

export function formatPalestineTime(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ar-PS', {
    timeZone: PALESTINE_TIME_ZONE,
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

export function getPrimaryUpcomingMatch(now = new Date()) {
  const matches = upcomingMatches
    .map((match, index) => {
      const date = getMatchDate(match, now);
      const duration = Number(match.durationMinutes || 60) * 60 * 1000;
      return { ...match, date, endDate: new Date(date.getTime() + duration), order: Number(match.priority ?? index) };
    })
    .filter(match => match.endDate >= now)
    .sort((a, b) => (a.date - b.date) || (a.order - b.order));

  if (matches.length) return matches[0];

  return upcomingMatches
    .map((match, index) => ({ ...match, date: getMatchDate(match, now), order: Number(match.priority ?? index) }))
    .sort((a, b) => (b.date - a.date) || (a.order - b.order))[0] || null;
}

export function getMatchState(match = getPrimaryUpcomingMatch(), now = new Date()) {
  if (!match?.date) return { mood: 'هادئ', label: 'لا توجد مباراة قادمة حاليا', accent: 'calm', diff: null, live: false };
  const diff = match.date - now;
  const endDate = match.endDate || new Date(match.date.getTime() + Number(match.durationMinutes || 60) * 60 * 1000);

  if (diff <= 0 && endDate >= now) {
    return { mood: 'مباراة', label: 'LIVE / وضع المباراة', accent: 'live', diff, live: true };
  }
  if (diff > 0 && diff <= 3 * 60 * 60 * 1000) {
    return { mood: 'مباراة', label: 'استعداد المباراة', accent: 'match', diff, live: false };
  }
  if (diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000) {
    return { mood: 'استعداد', label: 'وضع الاستعداد', accent: 'warm', diff, live: false };
  }
  if (diff < 0) {
    return { mood: 'مراقبة', label: 'مراجعة ما بعد المباراة', accent: 'calm', diff, live: false };
  }
  return { mood: 'هادئ', label: 'وضع الاستعداد الهادئ', accent: 'calm', diff, live: false };
}

export function buildSiteKnowledge() {
  const now = new Date();
  const next = getPrimaryUpcomingMatch(now);
  const matchState = getMatchState(next, now);
  const archive = [...matchArchive].sort((a, b) => Number(b.dateKey || 0) - Number(a.dateKey || 0));
  const lastMatch = archive[0] || null;
  const weatherState = getLatestWeather();
  const currentWeather = weatherState?.data?.current || null;
  const playability = currentWeather ? calculatePlayability(currentWeather) : null;
  const weatherCode = currentWeather ? weatherDescription(currentWeather.weather_code) : null;
  const activeInjuries = injuryCases.filter(item => !isRecovered(item));
  const recoveredInjuries = injuryCases.filter(item => isRecovered(item));
  const readiness = buildReadiness(activeInjuries, playerStats, playability);
  const topPlayer = [...playerStats].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))[0] || null;

  return {
    nextMatch: next ? {
      date: formatPalestineDate(next.date, { withWeekday: true }) || next.dateLabel || '',
      time: formatPalestineTime(next.date),
      location: next.location || '',
      opponent: [next.team1, next.team2].filter(Boolean).join(' ضد '),
      notes: next.note || '',
      title: next.title || '',
      team1: next.team1 || '',
      team2: next.team2 || '',
      dateLabel: next.dateLabel || formatPalestineDate(next.date, { withWeekday: true }),
      day: formatPalestineDate(next.date, { withWeekday: true })
    } : null,
    lastMatch: lastMatch ? {
      date: lastMatch.dateLabel || '',
      result: lastMatch.status || '',
      score: `${lastMatch.score1 ?? '-'} - ${lastMatch.score2 ?? '-'}`,
      teams: [lastMatch.team1, lastMatch.team2].filter(Boolean)
    } : null,
    teamReadiness: readiness,
    radarAvailable: Boolean(document.getElementById('radar') || document.getElementById('tacticalPitch')),
    weather: currentWeather ? {
      temp: currentWeather.temperature_2m ?? null,
      description: weatherCode?.[0] || '',
      wind: currentWeather.wind_speed_10m ?? null,
      humidity: currentWeather.relative_humidity_2m ?? null
    } : null,
    systemMood: matchState.mood,
    pages: ['home', 'match-center', 'archive', 'ai', 'more', 'weather-prayer', 'injuries', 'qibla', 'device-check', 'security', 'about'],
    meta: {
      name: siteMeta.name,
      edition: 'Taamen Tactical Core',
      version: siteMeta.version,
      aiStatus: hasAIEndpoint() ? 'remote-ready' : 'local-only',
      timeZone: PALESTINE_TIME_ZONE
    },
    matchMode: matchState,
    archive: {
      total: matchArchive.length,
      latestMatch: lastMatch,
      recentMatches: archive.slice(0, 5)
    },
    injuries: {
      active: activeInjuries.map(compactInjury),
      recovered: recoveredInjuries.map(compactInjury).slice(0, 8),
      lastUpdated: ''
    },
    tactical: {
      available: Boolean(document.getElementById('radar') || document.getElementById('tacticalPitch')),
      formations: Object.values(tactics).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description
      }))
    },
    security: {
      status: security.status,
      privacyMode: security.privacyMode,
      emergencyMode: security.emergencyMode,
      aiProtection: security.aiProtection,
      cookiePolicy: security.cookiePolicy
    },
    playerStats: {
      total: playerStats.length,
      topPlayer,
      leaders: [...playerStats].sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0)).slice(0, 5)
    },
    quickFacts: [
      `${matchArchive.length} مباراة في الأرشيف`,
      `${activeInjuries.length} حالة تحتاج متابعة`,
      `${Object.keys(tactics).length} تشكيلات تكتيكية`,
      hasAIEndpoint() ? 'المساعد متصل عبر endpoint عند توفره' : 'المساعد يعمل محليا'
    ],
    health: {
      activeInjuries: activeInjuries.length,
      trackedPlayers: playerStats.length,
      playability
    }
  };
}

function buildReadiness(activeInjuries, stats, playability) {
  if (!stats.length && !activeInjuries.length && !playability) return null;
  const risk = activeInjuries.length >= 4 ? 'مرتفع' : activeInjuries.length >= 2 ? 'متوسط' : 'منخفض';
  const weatherNote = playability?.label ? `الطقس: ${playability.label}` : 'الطقس بانتظار التحديث';
  return {
    level: activeInjuries.length >= 4 ? 'watch' : activeInjuries.length >= 2 ? 'ready' : 'strong',
    label: activeInjuries.length >= 4 ? 'تحتاج متابعة' : activeInjuries.length >= 2 ? 'جاهزية جيدة' : 'جاهزية مستقرة',
    notes: `المخاطر: ${risk}. ${weatherNote}.`
  };
}

function isRecovered(item) {
  const severity = String(item?.severity || '');
  const status = String(item?.status || '');
  return severity === 'healed' || severity === 'recovery' || status.includes('تعاف');
}

function compactInjury(item) {
  return {
    id: item.id,
    player: item.player,
    caseName: item.caseName,
    severity: item.severity,
    status: item.status,
    expectedReturn: item.expectedReturn,
    recoveryDate: item.recoveryDate,
    effect: item.effect
  };
}
