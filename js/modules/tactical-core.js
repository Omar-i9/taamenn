import { $, safeText, copyText, toast } from './ui.js';
import { buildSiteKnowledge } from './site-knowledge.js';
import { clearTaamenSiteData, openCookieSettings } from './cookies.js';

const CORE_READY_CLASS = 'tactical-core-ready';
const SOUND_STORAGE_KEY = 'taamen.sound.enabled.v1';

export function initTacticalCoreShell() {
  document.body.classList.add(CORE_READY_CLASS);
  ensureLivingPanel();
  ensureMorePage();
  ensureSettingsPage();
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
      <button class="ghost-btn" data-route="more" type="button"><i class="fa-solid fa-layer-group"></i> المزيد</button>
    </div>
  `;
  hero.after(panel);
}

function ensureMorePage() {
  if ($('#more')) return;
  const main = $('.app-shell');
  if (!main) return;

  const section = document.createElement('section');
  section.className = 'page';
  section.id = 'more';
  section.dataset.pageTitle = 'المزيد';
  section.innerHTML = `
    <div class="page-heading reveal-up visible">
      <span class="eyebrow"><i class="fa-solid fa-layer-group"></i> المزيد</span>
      <h1>كل الصفحات المساندة في مكان واضح</h1>
      <p>اختصارات سريعة للصفحات الثانوية بدون خلطها داخل الصحة والإعدادات.</p>
    </div>
    <div class="more-page-grid reveal-up visible">
      ${moreCard('settings', 'fa-heart-pulse', 'الصحة والإعدادات', 'جاهزية الفريق، إعدادات بسيطة، وصلاحيات مختصرة.')}
      ${moreCard('weather-prayer', 'fa-cloud-sun', 'الطقس والصلاة', 'جاهزية اللعب ومواقيت الصلاة للمدينة النشطة.')}
      ${moreCard('injuries', 'fa-kit-medical', 'الإصابات', 'حالات اللاعبين، مدة الرجوع، وتأثير الغياب.')}
      ${moreCard('qibla', 'fa-compass', 'القبلة', 'بوصلة الجهاز وفحص قدرات الاتجاه.')}
      ${moreCard('guide', 'fa-book-open', 'دليل الاستخدام', 'شرح الصفحات والأزرار وتحرير البيانات.')}
      ${moreCard('about', 'fa-circle-info', 'عن المنصة', 'الفكرة، المصادر، وروابط التواصل.')}
      <a class="more-page-card" href="https://omar-i9.github.io/omar-i9/" target="_blank" rel="noopener noreferrer">
        <i class="fa-solid fa-code"></i>
        <span><strong>صفحات المبرمج</strong><small>روابط عمر ومشاريعه.</small></span>
      </a>
      ${moreCard('security', 'fa-shield-halved', 'الخصوصية المختصرة', 'ملخص التخزين المحلي والكوكيز وأدوات الحذف.')}
    </div>
  `;
  main.appendChild(section);
}

function moreCard(route, icon, title, description) {
  return `
    <button class="more-page-card" data-route="${route}" type="button">
      <i class="fa-solid ${icon}"></i>
      <span><strong>${title}</strong><small>${description}</small></span>
    </button>
  `;
}

function ensureSettingsPage() {
  if ($('#settings')) return;
  const main = $('.app-shell');
  if (!main) return;
  const section = document.createElement('section');
  section.className = 'page';
  section.id = 'settings';
  section.dataset.pageTitle = 'الصحة والإعدادات';
  section.innerHTML = `
    <div class="page-heading reveal-up visible">
      <span class="eyebrow"><i class="fa-solid fa-heart-pulse"></i> الصحة والإعدادات</span>
      <h1>جاهزية الفريق وإعدادات سريعة</h1>
      <p>صفحة خفيفة للصحة، الصوت، الثيم، وخصوصية مختصرة. بقية الصفحات موجودة في المزيد.</p>
    </div>
    <div id="teamReadinessCard" class="team-readiness-card glass-panel reveal-up visible"></div>
    <div id="simpleSettingsCard" class="simple-settings-card glass-panel reveal-up visible"></div>
    <div id="compactPrivacyCard" class="compact-privacy-card glass-panel reveal-up visible"></div>
  `;
  main.appendChild(section);
}

function wireCoreActions() {
  document.addEventListener('click', event => {
    const shareButton = event.target.closest('[data-core-action="share-status"]');
    if (shareButton) {
      event.preventDefault();
      copyText(buildStatusShareText(), 'تم نسخ الحالة. جاهزة للمشاركة.');
      return;
    }

    const soundButton = event.target.closest('[data-core-action="toggle-sound"]');
    if (soundButton) {
      event.preventDefault();
      const next = !getSoundEnabled();
      localStorage.setItem(SOUND_STORAGE_KEY, String(next));
      renderSettingsCard();
      toast(next ? 'تم تفعيل الصوت الاختياري' : 'تم إيقاف الصوت', { icon: next ? 'fa-volume-high' : 'fa-volume-xmark' });
      return;
    }

    const themeButton = event.target.closest('[data-core-action="theme-toggle"]');
    if (themeButton) {
      event.preventDefault();
      $('#themeToggle')?.click();
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
  renderSettingsCard();
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

  const livingPanel = $('#taamenLivingPanel');
  livingPanel?.setAttribute('data-mood', mood.accent || 'calm');
  pulseOnMoodChange(livingPanel, mood.accent || 'calm');
}

function pulseOnMoodChange(panel, mood) {
  if (!panel || panel.dataset.lastMood === mood) return;
  panel.dataset.lastMood = mood;
  panel.classList.remove('state-pulse');
  requestAnimationFrame(() => panel.classList.add('state-pulse'));
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
      <span><b>الحضور</b>${Number(health.trackedPlayers || 0)} لاعب محفوظ</span>
      <span><b>مستوى المخاطرة</b>${Number(health.activeInjuries || 0) ? `${health.activeInjuries} حالة تحتاج متابعة` : 'منخفض'}</span>
      <span><b>توصية قصيرة</b>${Number(health.activeInjuries || 0) ? 'راجع الحالات قبل تثبيت التشكيلة.' : 'ثبت الخطة وشارك الحالة.'}</span>
    </div>
  `;
}

function renderSettingsCard() {
  const host = $('#simpleSettingsCard');
  if (!host) return;
  const soundEnabled = getSoundEnabled();
  host.innerHTML = `
    <div class="merged-section-head">
      <span class="eyebrow"><i class="fa-solid fa-sliders"></i> إعدادات بسيطة</span>
      <h2>تحكم سريع بدون ازدحام</h2>
      <p>الصوت مغلق افتراضيا، والثيم يستخدم زر الواجهة الرئيسي.</p>
    </div>
    <div class="settings-action-grid">
      <button class="settings-toggle-row" data-core-action="toggle-sound" type="button" aria-pressed="${String(soundEnabled)}">
        <i class="fa-solid ${soundEnabled ? 'fa-volume-high' : 'fa-volume-xmark'}"></i>
        <span><strong>الصوت الاختياري</strong><small>${soundEnabled ? 'مفعل لهذا الجهاز' : 'مغلق افتراضيا'}</small></span>
        <b>${soundEnabled ? 'تشغيل' : 'إيقاف'}</b>
      </button>
      <button class="settings-toggle-row" data-core-action="theme-toggle" type="button">
        <i class="fa-solid fa-moon"></i>
        <span><strong>الثيم</strong><small>بدل بين ثيم الليل والغروب من دون مغادرة الصفحة.</small></span>
        <b>تبديل</b>
      </button>
    </div>
  `;
}

function renderPrivacyCard() {
  const host = $('#compactPrivacyCard');
  if (!host || host.dataset.ready === '1') return;
  host.dataset.ready = '1';
  host.innerHTML = `
    <div class="merged-section-head">
      <span class="eyebrow"><i class="fa-solid fa-shield-halved"></i> الخصوصية المختصرة</span>
      <h2>تخزين محلي واضح وقابل للحذف</h2>
      <p>تستخدم تأمين التخزين المحلي والكوكيز لحفظ تفضيلات بسيطة مثل اللغة والموافقة والإعدادات. لا توضع مفاتيح ذكاء اصطناعي داخل ملفات الواجهة العامة.</p>
    </div>
    <div class="privacy-actions">
      <button class="primary-btn" data-core-action="cookie-settings" type="button"><i class="fa-solid fa-cookie-bite"></i> إدارة الكوكيز</button>
      <button class="danger-btn" data-core-action="delete-local-data" type="button"><i class="fa-solid fa-trash-can"></i> حذف بيانات هذا الجهاز</button>
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
  lines.push('الصفحات: الرئيسية / مركز المباراة / الأرشيف / المساعد الذكي / المزيد');
  lines.push('Taamen 2026');
  return lines.join('\n');
}

function getSoundEnabled() {
  return localStorage.getItem(SOUND_STORAGE_KEY) === 'true';
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
