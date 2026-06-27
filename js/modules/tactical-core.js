import { $, safeText, copyText, toast } from './ui.js';
import { buildSiteKnowledge } from './site-knowledge.js';
import { clearTaamenSiteData, openCookieSettings } from './cookies.js';

const CORE_READY_CLASS = 'tactical-core-ready';
const SETTINGS_SOURCES = ['radar', 'injuries', 'weather-prayer', 'qibla', 'security', 'guide', 'about'];

export function initTacticalCoreShell() {
  document.body.classList.add(CORE_READY_CLASS);
  ensureLivingPanel();
  ensureMatchArchiveMount();
  ensureSettingsPage();
  moveArchiveIntoMatchCenter();
  moveSupportSectionsIntoSettings();
  wireCoreActions();
  renderCoreState();
  window.setInterval(renderCoreState, 30000);
  document.addEventListener('taamen:route', renderCoreState);
  document.addEventListener('taamen:services-refreshed', renderCoreState);
  document.addEventListener('taamen:site-data-cleared', renderCoreState);
}

function ensureLivingPanel() {
  if ($('#taamenLivingPanel')) return;
  const hero = $('.hero-grid');
  if (!hero) return;
  const panel = document.createElement('section');
  panel.id = 'taamenLivingPanel';
  panel.className = 'tactical-living-panel glass-panel reveal-up visible';
  panel.setAttribute('aria-label', 'نبض تأمين الآن');
  panel.innerHTML = `
    <div class="living-head">
      <div>
        <span class="eyebrow"><i class="fa-solid fa-wave-square"></i> نبض تأمين الآن</span>
        <h2 id="livingMoodTitle">جاهز</h2>
        <p id="livingMoodText">يتم تجهيز حالة المنصة...</p>
      </div>
      <span class="living-mood-badge" id="livingMoodBadge">هادئ</span>
    </div>
    <div class="living-grid">
      <div><span>المباراة</span><strong id="livingMatchStatus">--</strong><small id="livingCountdown">--</small></div>
      <div><span>الطقس</span><strong id="livingWeather">--</strong><small id="livingWeatherMeta">--</small></div>
      <div><span>الجاهزية</span><strong id="livingReadiness">--</strong><small id="livingReadinessMeta">--</small></div>
      <div><span>AI</span><strong id="livingAiStatus">محلي</strong><small>يرفض الطلبات الحساسة محليا</small></div>
    </div>
    <div class="living-actions">
      <button class="primary-btn" data-route="match-center" type="button"><i class="fa-solid fa-calendar-check"></i> مركز المباراة</button>
      <button class="ghost-btn" data-core-action="share-status" type="button"><i class="fa-solid fa-share-nodes"></i> شارك الحالة</button>
      <button class="ghost-btn" data-route="ai" data-ai-writing-action="match-announcement" data-ai-question="اكتب إعلان مباراة واتساب جاهز للنسخ من بيانات تأمين الحالية" type="button"><i class="fa-solid fa-pen-nib"></i> إعلان واتساب</button>
      <button class="ghost-btn" data-route="settings" type="button"><i class="fa-solid fa-sliders"></i> الصحة والإعدادات</button>
    </div>
  `;
  hero.after(panel);
}

function ensureMatchArchiveMount() {
  if ($('#matchArchiveMount')) return;
  const grid = $('.match-center-grid');
  if (!grid) return;
  const mount = document.createElement('section');
  mount.id = 'matchArchiveMount';
  mount.className = 'merged-archive-shell reveal-up visible';
  mount.innerHTML = `
    <div class="merged-section-head">
      <span class="eyebrow"><i class="fa-solid fa-box-archive"></i> مركز المباراة والأرشيف</span>
      <h2>الأرشيف داخل تدفق المباراة</h2>
      <p>المباراة القادمة ثم النتائج السابقة في مكان واحد.</p>
    </div>
  `;
  grid.after(mount);
}

function ensureSettingsPage() {
  if ($('#settings')) return;
  const main = $('.app-shell');
  if (!main) return;
  const section = document.createElement('section');
  section.className = 'page';
  section.id = 'settings';
  section.dataset.pageTitle = 'غرفة الصحة والإعدادات';
  section.innerHTML = `
    <div class="page-heading reveal-up visible">
      <span class="eyebrow"><i class="fa-solid fa-heart-pulse"></i> غرفة الصحة والإعدادات</span>
      <h1>الصحة، الرادار، الإعدادات</h1>
      <p>قسم واحد للجاهزية، الإصابات، الرادار، الخدمات، الخصوصية المختصرة، وروابط المنصة.</p>
    </div>
    <div id="teamReadinessCard" class="team-readiness-card glass-panel reveal-up visible"></div>
    <div id="compactPrivacyCard" class="compact-privacy-card glass-panel reveal-up visible"></div>
    <div id="settingsMergedMount" class="settings-merged-grid"></div>
  `;
  main.appendChild(section);
}

function moveArchiveIntoMatchCenter() {
  const source = $('#archive');
  const mount = $('#matchArchiveMount');
  if (!source || !mount || mount.dataset.merged === '1') return;
  while (source.firstChild) mount.appendChild(source.firstChild);
  source.classList.add('legacy-route-shell');
  mount.dataset.merged = '1';
}

function moveSupportSectionsIntoSettings() {
  const mount = $('#settingsMergedMount');
  if (!mount || mount.dataset.merged === '1') return;

  SETTINGS_SOURCES.forEach(id => {
    const source = document.getElementById(id);
    if (!source) return;
    const card = document.createElement('article');
    card.className = `settings-merged-card settings-source-${id}`;
    card.dataset.sourceSection = id;
    while (source.firstChild) card.appendChild(source.firstChild);
    mount.appendChild(card);
    source.classList.add('legacy-route-shell');
  });
  mount.dataset.merged = '1';
}

function wireCoreActions() {
  document.addEventListener('click', event => {
    const shareButton = event.target.closest('[data-core-action="share-status"]');
    if (shareButton) {
      event.preventDefault();
      copyText(buildStatusShareText(), 'تم النسخ.. جاهز للجروب! ⚽');
      return;
    }

    const deleteButton = event.target.closest('[data-core-action="delete-local-data"]');
    if (deleteButton) {
      event.preventDefault();
      if (!window.confirm('سيتم حذف بيانات تأمين المحلية من هذا الجهاز فقط. هل تريد المتابعة؟')) return;
      const removed = clearTaamenSiteData();
      toast(`تم حذف ${removed.length} مفتاحا محليا`, { icon: 'fa-trash-can' });
      return;
    }

    const cookieButton = event.target.closest('[data-core-action="cookie-settings"]');
    if (cookieButton) {
      event.preventDefault();
      openCookieSettings();
      return;
    }

    const reportButton = event.target.closest('[data-core-action="report-issue"]');
    if (reportButton) {
      event.preventDefault();
      window.open('https://wa.me/972594054750?text=' + encodeURIComponent('مرحبا، عندي ملاحظة أو مشكلة في منصة تأمين:'), '_blank', 'noopener,noreferrer');
    }
  });
}

function renderCoreState() {
  const knowledge = buildSiteKnowledge();
  document.body.dataset.systemMood = knowledge.systemMood || 'هادئ';
  document.body.dataset.matchMode = knowledge.matchMode?.accent || 'calm';
  renderLivingPanel(knowledge);
  renderReadinessCard(knowledge);
  renderPrivacyCard();
  renderMatchActionPanel();
}

function renderLivingPanel(knowledge) {
  const mood = knowledge.matchMode || {};
  const next = knowledge.nextMatch;
  const weather = knowledge.weather;
  const readiness = knowledge.teamReadiness;

  setText('#livingMoodTitle', mood.label || 'النظام جاهز');
  setText('#livingMoodText', next ? `${next.opponent || 'مباراة قادمة'} - ${next.location || 'المكان غير محدد'}` : 'لا توجد مباراة قادمة حاليا.');
  setText('#livingMoodBadge', knowledge.systemMood || 'هادئ');
  setText('#livingMatchStatus', next ? `${next.date || ''} ${next.time || ''}`.trim() : 'لا توجد مباراة قادمة');
  setText('#livingCountdown', mood.live ? 'المباراة نشطة الآن' : mood.diff === null ? 'بانتظار البيانات' : formatCountdownText(mood.diff));
  setText('#livingWeather', weather ? `${Math.round(weather.temp ?? 0)}°C` : 'بانتظار الطقس');
  setText('#livingWeatherMeta', weather ? `${weather.description || 'طقس متاح'} / رياح ${weather.wind ?? '--'}` : 'سيظهر بعد تحديث الخدمات');
  setText('#livingReadiness', readiness?.label || 'تحتاج تحديث بيانات اللاعبين');
  setText('#livingReadinessMeta', readiness?.notes || 'لا توجد بيانات كافية لحساب الجاهزية.');
  setText('#livingAiStatus', knowledge.meta?.aiStatus === 'remote-ready' ? 'Backend جاهز' : 'محلي');

  $('#taamenLivingPanel')?.setAttribute('data-mood', mood.accent || 'calm');
}

function renderReadinessCard(knowledge) {
  const host = $('#teamReadinessCard');
  if (!host) return;
  const readiness = knowledge.teamReadiness;
  const health = knowledge.health || {};
  host.innerHTML = `
    <div class="merged-section-head">
      <span class="eyebrow"><i class="fa-solid fa-heart-pulse"></i> جاهزية الفريق</span>
      <h2>${safeText(readiness?.label || 'الجاهزية تحتاج تحديث بيانات اللاعبين')}</h2>
      <p>${safeText(readiness?.notes || 'لا توجد بيانات كافية لحساب الجاهزية.')}</p>
    </div>
    <div class="readiness-grid">
      <span><b>جاهزية الفريق</b>${safeText(readiness?.label || 'غير مكتملة')}</span>
      <span><b>جاهزية التكتيك</b>${knowledge.radarAvailable ? 'الرادار متاح' : 'غير متاح'}</span>
      <span><b>الحضور</b>${Number(health.trackedPlayers || 0)} لاعب محفوظ</span>
      <span><b>مستوى المخاطرة</b>${Number(health.activeInjuries || 0) ? `${health.activeInjuries} حالة تحتاج متابعة` : 'منخفض'}</span>
      <span><b>توصية قصيرة</b>${Number(health.activeInjuries || 0) ? 'راجع الحالات قبل تثبيت التشكيلة.' : 'ثبّت الخطة وشارك الحالة.'}</span>
    </div>
  `;
}

function renderPrivacyCard() {
  const host = $('#compactPrivacyCard');
  if (!host || host.dataset.ready === '1') return;
  host.dataset.ready = '1';
  host.innerHTML = `
    <div class="merged-section-head">
      <span class="eyebrow"><i class="fa-solid fa-shield-halved"></i> الخصوصية والحماية</span>
      <h2>خصوصية مختصرة بدون تضخيم</h2>
      <p>تستخدم منصة تأمين التخزين المحلي والكوكيز لحفظ تفضيلات بسيطة مثل اللغة والموافقة والإعدادات. لا يتم جمع كلمات مرور أو بيانات حساسة داخل الموقع، ولا يتم وضع مفاتيح الذكاء الاصطناعي داخل ملفات الواجهة العامة.</p>
    </div>
    <div class="privacy-actions">
      <button class="primary-btn" data-core-action="cookie-settings" type="button"><i class="fa-solid fa-cookie-bite"></i> إدارة الكوكيز</button>
      <button class="danger-btn" data-core-action="delete-local-data" type="button"><i class="fa-solid fa-trash-can"></i> حذف بيانات تأمين من هذا الجهاز</button>
      <button class="ghost-btn" data-core-action="report-issue" type="button"><i class="fa-solid fa-headset"></i> الإبلاغ عن مشكلة</button>
    </div>
  `;
}

function renderMatchActionPanel() {
  const panel = $('.match-side-panel .action-panel');
  if (!panel || panel.dataset.coreActions === '1') return;
  panel.dataset.coreActions = '1';
  panel.insertAdjacentHTML('beforeend', `
    <button class="ghost-btn full" data-core-action="share-status" type="button"><i class="fa-solid fa-signal"></i> شارك الحالة</button>
    <button class="ghost-btn full" data-route="ai" data-ai-writing-action="match-announcement" data-ai-question="اكتب إعلان مباراة واتساب جاهز للنسخ من بيانات تأمين الحالية" type="button"><i class="fa-solid fa-pen-nib"></i> اكتب إعلان مباراة</button>
    <button class="ghost-btn full" data-route="ai" data-ai-writing-action="reminder" data-ai-question="اكتب رسالة تذكير قصيرة للجروب عن المباراة القادمة" type="button"><i class="fa-solid fa-bell"></i> اكتب رسالة تذكير</button>
  `);
}

function buildStatusShareText() {
  const knowledge = buildSiteKnowledge();
  const lines = ['حالة تأمين الآن:'];
  lines.push(`الوضع: ${knowledge.matchMode?.label || knowledge.systemMood || 'هادئ'}`);
  if (knowledge.nextMatch) {
    if (knowledge.nextMatch.date || knowledge.nextMatch.time) lines.push(`الموعد: ${[knowledge.nextMatch.date, knowledge.nextMatch.time].filter(Boolean).join(' ')}`);
    if (knowledge.nextMatch.location) lines.push(`المكان: ${knowledge.nextMatch.location}`);
  }
  if (knowledge.teamReadiness?.label) lines.push(`الجاهزية: ${knowledge.teamReadiness.label}`);
  lines.push(`النظام: جاهز`);
  lines.push(`الرادار: ${knowledge.radarAvailable ? 'متاح' : 'غير متاح'}`);
  lines.push('Taamen Tactical Core');
  return lines.join('\n');
}

function formatCountdownText(diff) {
  const safe = Math.max(0, Number(diff) || 0);
  const days = Math.floor(safe / 86400000);
  const hours = Math.floor((safe % 86400000) / 3600000);
  const minutes = Math.floor((safe % 3600000) / 60000);
  if (days > 0) return `باقي ${days} يوم و ${hours} ساعة`;
  if (hours > 0) return `باقي ${hours} ساعة و ${minutes} دقيقة`;
  return `باقي ${minutes} دقيقة`;
}

function setText(selector, value) {
  const node = $(selector);
  if (node) node.textContent = value;
}
