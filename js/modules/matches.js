import { matchArchive, upcomingMatches, playerStats } from '../../data/site-data.js';
import { $, $all, safeText, copyText, toast, debounce } from './ui.js';
import { getLatestWeather, calculatePlayability } from './weather.js';

const ONE_DAY = 24 * 60 * 60 * 1000;

let archiveState = {
  filter: 'all',
  search: '',
  sort: 'newest',
  openId: null
};

let matchTicker = null;

export function getAllMatches() {
  return [...matchArchive];
}


function isValidDate(date) {
  return date instanceof Date && !Number.isNaN(date.getTime());
}

function getDateFromKey(match) {
  const key = String(match?.dateKey || '');
  if (!/^\d{8}$/.test(key)) return null;

  const year = Number(key.slice(0, 4));
  const month = Number(key.slice(4, 6)) - 1;
  const day = Number(key.slice(6, 8));
  const hour = Number(match?.hour ?? 19);
  const minute = Number(match?.minute ?? 0);
  const date = new Date(year, month, day, hour, minute, 0, 0);

  return isValidDate(date) ? date : null;
}

function getExactMatchDate(match) {
  if (match?.dateISO) {
    const date = new Date(match.dateISO);
    if (isValidDate(date)) return date;
  }

  return getDateFromKey(match);
}

export function getNextMatchDate(match = upcomingMatches[0], fromDate = new Date()) {
  const exactDate = getExactMatchDate(match);
  if (exactDate) return exactDate;

  const target = new Date(fromDate);
  const weekday = Number(match?.weekday ?? 5);
  const hour = Number(match?.hour ?? 19);
  const minute = Number(match?.minute ?? 0);
  const dayDiff = (weekday - target.getDay() + 7) % 7;

  target.setDate(target.getDate() + dayDiff);
  target.setHours(hour, minute, 0, 0);
  if (target <= fromDate) target.setDate(target.getDate() + 7);

  return target;
}

function getMatchEndDate(match) {
  const date = match.date || getNextMatchDate(match);
  const duration = Number(match.durationMinutes || 60) * 60 * 1000;
  return new Date(date.getTime() + duration);
}

export function getAllUpcoming(fromDate = new Date(), options = {}) {
  const all = upcomingMatches
    .map((match, index) => {
      const date = getNextMatchDate(match, fromDate);
      const endDate = new Date(date.getTime() + (Number(match.durationMinutes || 60) * 60 * 1000));
      return { ...match, date, endDate, order: Number(match.priority ?? index) };
    })
    .sort((a, b) => (a.date - b.date) || (a.order - b.order));

  if (options.includePast) return all;

  const activeAndFuture = all.filter(match => match.endDate >= fromDate);
  return activeAndFuture.length ? activeAndFuture : all.slice(-1);
}

export function getPrimaryUpcoming() {
  return getAllUpcoming()[0] || getAllUpcoming(new Date(), { includePast: true })[0] || null;
}

function heatClass(diff) {
  if (diff <= 0) return 'is-live';
  if (diff <= ONE_DAY) return 'is-hot';
  if (diff <= 3 * ONE_DAY) return 'is-warm';
  return '';
}

function heatLabel(diff) {
  if (diff <= 0) return 'الموعد الآن';
  if (diff <= ONE_DAY) return 'اقتربت المواجهة';
  if (diff <= 3 * ONE_DAY) return 'قريبة';
  return 'قادمة';
}


function ensureMatchDynamicStyles() {
  if (document.getElementById('taamen-match-engine-style')) return;

  const style = document.createElement('style');
  style.id = 'taamen-match-engine-style';
  style.textContent = `
    .countdown-engine {
      direction: rtl;
      unicode-bidi: isolate;
      display: inline-flex;
      align-items: baseline;
      justify-content: center;
      gap: .18em;
      white-space: nowrap;
      flex-wrap: wrap;
    }

    .countdown-engine .countdown-days,
    .countdown-engine .countdown-clock {
      font-family: var(--font-display, Orbitron, monospace);
      unicode-bidi: isolate;
    }

    .countdown-engine .countdown-days {
      color: var(--gold, #e7c75f);
      text-shadow: 0 0 18px rgba(231, 199, 95, .26);
    }

    .countdown-engine .countdown-word {
      font-family: var(--font-main, Tajawal, sans-serif);
      font-size: .42em;
      color: rgba(238, 245, 255, .76);
      margin-inline: .12em .34em;
    }

    .countdown-engine .countdown-clock {
      direction: ltr;
      color: inherit;
      animation: taamenClockBreath 2.7s ease-in-out infinite;
    }

    .countdown-engine.is-live .countdown-clock,
    .countdown-engine.is-hot .countdown-clock {
      color: #ff786f;
      text-shadow: 0 0 18px rgba(255, 95, 109, .42), 0 0 34px rgba(255, 122, 24, .22);
    }

    .upcoming-pill {
      position: relative;
      isolation: isolate;
      overflow: hidden;
      transform: translateZ(0);
      transition: transform .28s cubic-bezier(.22, 1, .36, 1), border-color .28s ease, box-shadow .28s ease, background .28s ease;
    }

    .upcoming-pill::after {
      content: '';
      position: absolute;
      inset: -30%;
      z-index: -1;
      opacity: 0;
      background: radial-gradient(circle at 30% 20%, rgba(231,199,95,.17), transparent 38%);
      transition: opacity .28s ease;
    }

    .upcoming-pill:hover,
    .upcoming-pill.is-next {
      transform: translateY(-3px);
      border-color: rgba(231, 199, 95, .26);
      box-shadow: 0 18px 38px rgba(0,0,0,.20), 0 0 22px rgba(231,199,95,.08);
    }

    .upcoming-pill:hover::after,
    .upcoming-pill.is-next::after { opacity: 1; }

    .upcoming-pill strong {
      direction: rtl;
      unicode-bidi: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .32em;
      white-space: nowrap;
    }

    .upcoming-pill .countdown-engine { font-size: .98em; }
    .upcoming-pill .countdown-word { font-size: .82em; }

    .archive-card {
      animation: taamenCardRise .34s cubic-bezier(.22, 1, .36, 1) both;
      will-change: transform, opacity;
    }

    .archive-card.open {
      box-shadow: 0 22px 48px rgba(0,0,0,.28), 0 0 24px rgba(231,199,95,.08);
    }

    .archive-details:not([hidden]) {
      animation: taamenDetailsOpen .32s cubic-bezier(.22, 1, .36, 1) both;
    }

    .details-button {
      transition: transform .22s ease, filter .22s ease, box-shadow .22s ease;
    }

    .details-button:hover {
      transform: translateY(-2px);
      filter: brightness(1.06);
    }

    .detail-bar i {
      animation: taamenBarFill .62s cubic-bezier(.22, 1, .36, 1) both;
      transform-origin: right center;
    }

    @keyframes taamenClockBreath {
      0%, 100% { filter: drop-shadow(0 0 0 rgba(231,199,95,0)); }
      50% { filter: drop-shadow(0 0 10px rgba(231,199,95,.16)); }
    }

    @keyframes taamenCardRise {
      from { opacity: .001; transform: translateY(10px) scale(.992); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @keyframes taamenDetailsOpen {
      from { opacity: .001; transform: translateY(-6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes taamenBarFill {
      from { transform: scaleX(.08); opacity: .72; }
      to { transform: scaleX(1); opacity: 1; }
    }
  `;

  document.head.appendChild(style);
}

function countdownParts(diff) {
  const safeDiff = Math.max(0, Number(diff) || 0);
  return {
    days: Math.floor(safeDiff / ONE_DAY),
    hours: String(Math.floor((safeDiff / (60 * 60 * 1000)) % 24)).padStart(2, '0'),
    minutes: String(Math.floor((safeDiff / (60 * 1000)) % 60)).padStart(2, '0'),
    seconds: String(Math.floor((safeDiff / 1000) % 60)).padStart(2, '0')
  };
}

function formatSmartCountdown(diff, options = {}) {
  const status = diff <= 0 ? 'is-live' : heatClass(diff);

  if (diff <= 0) {
    return `<span class="countdown-engine is-live"><span class="countdown-clock" dir="ltr">00:00:00</span><span class="countdown-word">الآن</span></span>`;
  }

  const { days, hours, minutes, seconds } = countdownParts(diff);
  const dayWord = days === 1 ? 'يوم' : 'أيام';
  const clock = `<span class="countdown-clock" dir="ltr">${hours}:${minutes}:${seconds}</span>`;

  if (days > 0) {
    return `<span class="countdown-engine ${status}"><span class="countdown-days">${days}</span><span class="countdown-word">${dayWord}</span>${clock}</span>`;
  }

  return `<span class="countdown-engine ${status}">${clock}</span>`;
}

function formatSmartCountdownText(diff) {
  if (diff <= 0) return 'الموعد الآن';

  const { days, hours, minutes } = countdownParts(diff);
  const h = Number(hours);
  const m = Number(minutes);

  if (days > 0) return `باقي ${days} ${days === 1 ? 'يوم' : 'أيام'} و ${h} ساعة`;
  if (h > 0) return `باقي ${h} ساعة و ${m} دقيقة`;
  return `باقي ${m} دقيقة`;
}

function formatMatchDate(match, options = {}) {
  const date = match?.date || getNextMatchDate(match);
  const datePart = match?.dateLabel || date.toLocaleDateString('ar-PS', {
    weekday: options.withWeekday === false ? undefined : 'long',
    day: 'numeric',
    month: '2-digit',
    year: 'numeric'
  });

  const timePart = date.toLocaleTimeString('ar-PS', {
    hour: 'numeric',
    minute: '2-digit'
  });

  return options.dateOnly ? datePart : `${datePart} في ${timePart}`;
}

function matchStatusLabel(match, diff) {
  if (diff <= 0 && getMatchEndDate(match) >= new Date()) return 'جارية الآن';
  if (match?.heatLabel && diff > 3 * ONE_DAY) return match.heatLabel;
  return heatLabel(diff);
}

export function initMatchCenter() {
  ensureMatchDynamicStyles();
  renderMatchCenter();
  bindMatchActions();
  bindArchive();
  renderArchive();
  renderHomeMatch();
  renderHomeStats();

  if (matchTicker) clearInterval(matchTicker);
  matchTicker = setInterval(() => {
    renderMatchCenter(false);
    renderHomeMatch();
  }, 1000);
}

function bindMatchActions() {
  $('#shareMatchBtn')?.addEventListener('click', async () => {
    const text = buildShareText();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'تأمين 2026', text });
        return;
      } catch (_) {}
    }
    copyText(text, 'تم نسخ موعد المباراة للمشاركة');
  });

  $('#copyMatchBtn')?.addEventListener('click', () => copyText(buildShareText(), 'تم نسخ نص المباراة'));
}

export function renderMatchCenter(showPulse = true) {
  const card = $('#matchCenterCard');
  if (!card) return;

  const match = getPrimaryUpcoming();
  if (!match) {
    card.innerHTML = '<div class="empty-state">لا توجد مواعيد قادمة حاليًا.</div>';
    return;
  }

  const now = new Date();
  const diff = match.date - now;
  const heat = heatClass(diff);
  const weather = getLatestWeather();
  const play = weather ? calculatePlayability(weather.data.current) : null;
  const upcoming = getAllUpcoming(now).slice(0, 5);

  card.classList.toggle('is-hot', heat === 'is-hot');
  card.classList.toggle('is-live', heat === 'is-live');

  card.innerHTML = `
    <div class="match-badge-line">
      <span><i class="fa-solid fa-calendar"></i> ${safeText(match.title)}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${safeText(match.location)}</span>
      <span class="heat-badge ${heat}"><i class="fa-solid fa-fire-flame-curved"></i> ${matchStatusLabel(match, diff)}</span>
    </div>
    <div class="teams-line">
      <strong>${safeText(match.team1)}</strong>
      <b>VS</b>
      <strong>${safeText(match.team2)}</strong>
    </div>
    <div class="big-countdown ${heat} ${showPulse ? 'pulse-once' : ''}">${formatSmartCountdown(diff)}</div>
    <p class="match-date-line">${safeText(formatMatchDate(match))}</p>
    <div class="match-info-grid">
      <div><span>الحالة</span><strong>${safeText(matchStatusLabel(match, diff))}</strong></div>
      <div><span>جاهزية اللعب</span><strong>${play ? `${safeText(play.label)} ${play.score}%` : 'بانتظار الطقس'}</strong></div>
      <div><span>ملاحظة</span><strong>${safeText(match.note)}</strong></div>
    </div>
    <div class="upcoming-strip" aria-label="المواعيد القادمة">
      ${upcoming.map((item, index) => {
        const itemDiff = item.date - now;
        return `<article class="upcoming-pill ${heatClass(itemDiff)} ${index === 0 ? 'is-next' : ''}" data-match-id="${safeText(item.id)}">
          <span>${safeText(item.title)}</span>
          <strong>${formatSmartCountdown(itemDiff)}</strong>
          <small>${safeText(item.location)}</small>
        </article>`;
      }).join('')}
    </div>
  `;
}

function renderHomeMatch() {
  const container = $('#homeNextMatch');
  if (!container) return;

  const match = getPrimaryUpcoming();
  if (!match) {
    container.innerHTML = '<div class="mini-empty">لا توجد مباراة قادمة.</div>';
    return;
  }

  const diff = match.date - new Date();
  container.innerHTML = `
    <div class="mini-teams"><strong>${safeText(match.team1)}</strong><span>ضد</span><strong>${safeText(match.team2)}</strong></div>
    <div class="mini-countdown ${heatClass(diff)}">${formatSmartCountdown(diff)}</div>
    <p>${safeText(match.location)} - ${safeText(formatMatchDate(match))}</p>
    <span class="mini-heat-label ${heatClass(diff)}"><i class="fa-solid fa-fire-flame-curved"></i> ${safeText(matchStatusLabel(match, diff))}</span>
  `;
}

function buildShareText() {
  const match = getPrimaryUpcoming();
  if (!match) return 'تأمين 2026\nلا توجد مباراة قادمة حاليًا.';

  const diff = match.date - new Date();
  return `تأمين 2026\n${match.title}\n${match.team1} ضد ${match.team2}\nالموعد: ${formatMatchDate(match)}\nالوقت المتبقي: ${formatSmartCountdownText(diff)}\nالمكان: ${match.location}\n${match.note}`;
}

export function renderHomeStats() {
  const matches = getAllMatches().sort((a, b) => Number(b.dateKey || 0) - Number(a.dateKey || 0));
  const last = matches[0];
  const lastScore = $('#lastMatchScore');
  const lastText = $('#lastMatchText');
  if (last && lastScore && lastText) {
    lastScore.textContent = `${last.score1} - ${last.score2}`;
    lastText.textContent = `${last.team1} ضد ${last.team2}`;
  }

  const mvp = playerStats
    .map(p => ({ ...p, impact: (p.goals * 2) + (p.assists * 1.5) + (p.saves * 1.1) + p.rating }))
    .sort((a, b) => b.impact - a.impact)[0];

  if ($('#mvpName')) $('#mvpName').textContent = mvp?.name || '--';
  if ($('#mvpReason')) $('#mvpReason').textContent = mvp ? `${mvp.goals} أهداف، ${mvp.assists} أسيست، تقييم ${mvp.rating}` : 'لا توجد بيانات';
}

function bindArchive() {
  $('#archiveSearch')?.addEventListener('input', debounce(event => {
    archiveState.search = event.target.value.trim().toLowerCase();
    renderArchive();
  }, 160));

  $('#archiveSort')?.addEventListener('change', event => {
    archiveState.sort = event.target.value;
    renderArchive();
  });

  $all('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $all('.filter-btn').forEach(item => item.classList.remove('active'));
      btn.classList.add('active');
      archiveState.filter = btn.dataset.filter || 'all';
      archiveState.openId = null;
      renderArchive();
    });
  });

  $('#archiveList')?.addEventListener('click', event => {
    const btn = event.target.closest('[data-toggle-match]');
    if (!btn) return;
    archiveState.openId = archiveState.openId === btn.dataset.toggleMatch ? null : btn.dataset.toggleMatch;
    renderArchive();
  });
}

function getFilteredMatches() {
  const q = archiveState.search;
  let list = getAllMatches().filter(match => {
    const type = match.type || 'normal';
    const haystack = [match.id, match.team1, match.team2, match.dateLabel, match.status, type, typeLabel(type), `${match.score1}-${match.score2}`, match.story].join(' ').toLowerCase();
    return (archiveState.filter === 'all' || type === archiveState.filter) && (!q || haystack.includes(q));
  });

  list.sort((a, b) => {
    if (archiveState.sort === 'oldest') return Number(a.dateKey || 0) - Number(b.dateKey || 0);
    if (archiveState.sort === 'goals') return ((b.score1 + b.score2) - (a.score1 + a.score2));
    return Number(b.dateKey || 0) - Number(a.dateKey || 0);
  });
  return list;
}

export function renderArchive() {
  const list = getFilteredMatches();
  renderArchiveStats(list);
  const host = $('#archiveList');
  if (!host) return;

  if (!list.length) {
    host.innerHTML = '<div class="empty-state">لا توجد مباريات مطابقة. حتى الأرشيف عنده حدود للصبر.</div>';
    return;
  }

  host.innerHTML = list.map(match => matchCard(match)).join('');
}

function renderArchiveStats(list) {
  const host = $('#archiveStats');
  if (!host) return;
  const summary = list.reduce((acc, match) => {
    acc.total += 1;
    acc.goals += match.score1 + match.score2;
    acc[match.type || 'normal'] += 1;
    if (match.score1 === match.score2) acc.draws += 1;
    else acc.decided += 1;
    return acc;
  }, { total: 0, goals: 0, strong: 0, normal: 0, friendly: 0, draws: 0, decided: 0 });

  host.innerHTML = [
    ['المباريات', summary.total, 'fa-layer-group'],
    ['الأهداف', summary.goals, 'fa-futbol'],
    ['حُسمت', summary.decided, 'fa-flag-checkered'],
    ['تعادل', summary.draws, 'fa-scale-balanced'],
    ['قوية', summary.strong, 'fa-fire'],
    ['ودية', summary.friendly, 'fa-handshake']
  ].map(([label, value, icon]) => `<div class="stat-tile"><i class="fa-solid ${icon}"></i><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function typeLabel(type) {
  if (type === 'strong') return 'قوية';
  if (type === 'friendly') return 'ودية';
  return 'عادية';
}

function typeIcon(type) {
  if (type === 'strong') return 'fa-fire-flame-curved';
  if (type === 'friendly') return 'fa-handshake';
  return 'fa-futbol';
}

function matchCard(match) {
  const open = archiveState.openId === match.id;
  const winner = match.score1 > match.score2 ? 'team1' : match.score2 > match.score1 ? 'team2' : 'draw';
  const details = match.details;
  const totalGoals = match.score1 + match.score2;
  return `
    <article class="archive-card ${match.type || 'normal'} ${open ? 'open' : ''}">
      <div class="archive-ribbon"><i class="fa-solid ${typeIcon(match.type)}"></i> ${typeLabel(match.type)}</div>
      <div class="archive-card-main">
        <div class="archive-team ${winner === 'team1' ? 'winner' : ''}">
          <i class="fa-solid fa-shield-halved"></i>
          <strong>${safeText(match.team1)}</strong>
          <small>${winner === 'team1' ? 'الفائز' : winner === 'draw' ? 'تعادل' : 'طرف المباراة'}</small>
        </div>
        <div class="archive-score-block">
          <span class="archive-id">${safeText(match.id)}</span>
          <strong>${match.score2} - ${match.score1}</strong>
          <small>${safeText(match.dateLabel)}</small>
          <p>${safeText(match.story || 'مباراة مؤرشفة بدون وصف إضافي.')}</p>
        </div>
        <div class="archive-team ${winner === 'team2' ? 'winner' : ''}">
          <i class="fa-solid fa-shirt"></i>
          <strong>${safeText(match.team2)}</strong>
          <small>${winner === 'team2' ? 'الفائز' : winner === 'draw' ? 'تعادل' : 'طرف المباراة'}</small>
        </div>
      </div>
      <div class="archive-actions-row">
        <span><i class="fa-solid fa-bullseye"></i> ${totalGoals} هدف</span>
        <span><i class="fa-solid fa-circle-info"></i> ${details ? 'إحصائيات كاملة' : 'ملخص تاريخي'}</span>
        <button class="details-button" data-toggle-match="${safeText(match.id)}" type="button">
          <i class="fa-solid ${open ? 'fa-chevron-up' : 'fa-chart-simple'}"></i>
          ${open ? 'إغلاق التفاصيل' : 'عرض التفاصيل'}
        </button>
      </div>
      <div class="archive-details" ${open ? '' : 'hidden'}>
        ${details ? detailedStats(match) : legacySummary(match)}
      </div>
    </article>
  `;
}

function legacySummary(match) {
  const winner = match.score1 > match.score2 ? match.team1 : match.score2 > match.score1 ? match.team2 : 'تعادل';
  return `
    <div class="legacy-summary">
      <h4>ملخص المباراة</h4>
      <p>${safeText(match.story || 'هذه مباراة قديمة بدون تفاصيل إحصائية كاملة.')}</p>
      <div class="legacy-summary-grid">
        <span><b>النتيجة</b>${match.score2} - ${match.score1}</span>
        <span><b>الحالة</b>${safeText(match.status)}</span>
        <span><b>الفائز</b>${safeText(winner)}</span>
      </div>
    </div>
  `;
}

function detailedStats(match) {
  const rows = [
    ['الاستحواذ', 'possession', '%'],
    ['التسديدات', 'shots', ''],
    ['على المرمى', 'onTarget', ''],
    ['التصديات', 'saves', ''],
    ['الأسيست', 'assists', ''],
    ['التمريرات', 'passes', ''],
    ['الأخطاء', 'fouls', ''],
    ['الركنيات', 'corners', '']
  ];
  return `
    <div class="details-grid">
      <div>${teamStats(match.team1, match.details.team1, rows)}</div>
      <div>${teamStats(match.team2, match.details.team2, rows)}</div>
    </div>
  `;
}

function teamStats(name, stats, rows) {
  return `
    <h4>${safeText(name)}</h4>
    ${rows.map(([label, key, suffix]) => {
      const value = Number(stats[key] || 0);
      const max = key === 'possession' || key === 'passes' ? 100 : 25;
      const width = Math.min(100, Math.round((value / max) * 100));
      return `
        <div class="detail-row">
          <div><span>${label}</span><b>${value}${suffix}</b></div>
          <div class="detail-bar"><i style="width:${width}%"></i></div>
        </div>
      `;
    }).join('')}
  `;
}
