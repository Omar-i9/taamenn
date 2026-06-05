import { matchArchive, upcomingMatches, playerStats } from '../../data/site-data.js';
import { $, $all, safeText, formatCountdown, copyText, toast, debounce } from './ui.js';
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

export function getNextMatchDate(match = upcomingMatches[0], fromDate = new Date()) {
  const target = new Date(fromDate);
  const dayDiff = (match.weekday - target.getDay() + 7) % 7;
  target.setDate(target.getDate() + dayDiff);
  target.setHours(match.hour, match.minute, 0, 0);
  if (target <= fromDate) target.setDate(target.getDate() + 7);
  return target;
}

export function getAllUpcoming() {
  return upcomingMatches
    .map(match => ({ ...match, date: getNextMatchDate(match) }))
    .sort((a, b) => a.date - b.date);
}

export function getPrimaryUpcoming() {
  return getAllUpcoming()[0];
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

export function initMatchCenter() {
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
  const diff = match.date - new Date();
  const heat = heatClass(diff);
  const weather = getLatestWeather();
  const play = weather ? calculatePlayability(weather.data.current) : null;
  const upcoming = getAllUpcoming();

  card.classList.toggle('is-hot', heat === 'is-hot');
  card.classList.toggle('is-live', heat === 'is-live');

  card.innerHTML = `
    <div class="match-badge-line">
      <span><i class="fa-solid fa-calendar"></i> ${safeText(match.title)}</span>
      <span><i class="fa-solid fa-location-dot"></i> ${safeText(match.location)}</span>
      <span class="heat-badge ${heat}"><i class="fa-solid fa-fire-flame-curved"></i> ${heatLabel(diff)}</span>
    </div>
    <div class="teams-line">
      <strong>${safeText(match.team1)}</strong>
      <b>VS</b>
      <strong>${safeText(match.team2)}</strong>
    </div>
    <div class="big-countdown ${heat} ${showPulse ? 'pulse-once' : ''}">${formatCountdown(diff)}</div>
    <p class="match-date-line">${match.date.toLocaleString('ar-PS', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}</p>
    <div class="match-info-grid">
      <div><span>الحالة</span><strong>${diff <= 0 ? 'بدأت أو انتهت' : heatLabel(diff)}</strong></div>
      <div><span>جاهزية اللعب</span><strong>${play ? `${play.label} ${play.score}%` : 'بانتظار الطقس'}</strong></div>
      <div><span>ملاحظة</span><strong>${safeText(match.note)}</strong></div>
    </div>
    <div class="upcoming-strip" aria-label="المواعيد القادمة">
      ${upcoming.map(item => {
        const itemDiff = item.date - new Date();
        return `<article class="upcoming-pill ${heatClass(itemDiff)}">
          <span>${safeText(item.title)}</span>
          <strong>${formatCountdown(itemDiff)}</strong>
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
  const diff = match.date - new Date();
  container.innerHTML = `
    <div class="mini-teams"><strong>${safeText(match.team1)}</strong><span>ضد</span><strong>${safeText(match.team2)}</strong></div>
    <div class="mini-countdown ${heatClass(diff)}">${formatCountdown(diff)}</div>
    <p>${safeText(match.location)} - ${match.date.toLocaleString('ar-PS', { weekday: 'long', hour: 'numeric', minute: '2-digit' })}</p>
    <span class="mini-heat-label ${heatClass(diff)}"><i class="fa-solid fa-fire-flame-curved"></i> ${heatLabel(diff)}</span>
  `;
}

function buildShareText() {
  const match = getPrimaryUpcoming();
  return `تأمين 2026\n${match.title}\n${match.team1} ضد ${match.team2}\nالموعد: ${match.date.toLocaleString('ar-PS', { weekday: 'long', day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' })}\nالمكان: ${match.location}\n${match.note}`;
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
          <strong>${match.score1} - ${match.score2}</strong>
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
        <span><b>النتيجة</b>${match.score1} - ${match.score2}</span>
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
