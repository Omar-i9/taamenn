import { $, copyText, toast } from './ui.js';
import { buildSiteKnowledge } from './site-knowledge.js';
import { clearTaamenSiteData, openCookieSettings } from './cookies.js';

const CORE_READY_CLASS = 'tactical-core-ready';
const SOUND_STORAGE_KEY = 'taamen.sound.enabled.v1';

export function initTacticalCoreShell() {
  document.body.classList.add(CORE_READY_CLASS);
  ensureMorePage();
  wireCoreActions();
  renderCoreState();
  window.setInterval(renderCoreState, 30000);
  document.addEventListener('taamen:route', renderCoreState);
  document.addEventListener('taamen:services-refreshed', renderCoreState);
  document.addEventListener('taamen:site-data-cleared', renderCoreState);
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
      <h1>روابط سريعة بدون زحمة</h1>
      <p>افتح الصفحة التي تحتاجها مباشرة. الإعدادات الخفيفة والخصوصية موجودة هنا بدون صفحة إضافية.</p>
    </div>
    <div id="moreSettingsCard" class="more-settings-card glass-panel reveal-up visible"></div>
    <div class="more-page-grid reveal-up visible">
      ${moreCard('weather-prayer', 'fa-cloud-sun', 'الطقس والصلاة', 'الطقس ومواقيت الصلاة للمدينة المختارة.')}
      ${moreCard('injuries', 'fa-kit-medical', 'الإصابات والحالات', 'حالة اللاعبين بشكل سريع ومختصر.')}
      ${moreCard('qibla', 'fa-compass', 'القبلة', 'اتجاه القبلة فقط بدون فحص الجهاز.')}
      ${moreCard('device-check', 'fa-microchip', 'فحص الجهاز', 'دعم المتصفح، المستشعرات، والتخزين المحلي.')}
      ${moreCard('about', 'fa-circle-info', 'عن المنصة', 'فكرة تأمين وكيف تتطور.')}
      ${moreCard('security', 'fa-shield-halved', 'الخصوصية', 'ملخص التخزين المحلي وأدوات الحذف والتواصل.')}
      <a class="more-page-card" href="https://omar-i9.github.io/omar-i9/" target="_blank" rel="noopener noreferrer">
        <i class="fa-solid fa-code"></i>
        <span><strong>صفحات المبرمج</strong><small>روابط عمر ومشاريعه.</small></span>
      </a>
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
      renderMoreSettingsCard();
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
  renderMoreSettingsCard();
}

function renderMoreSettingsCard() {
  const host = $('#moreSettingsCard');
  if (!host) return;
  const soundEnabled = getSoundEnabled();
  host.innerHTML = `
    <div class="merged-section-head">
      <span class="eyebrow"><i class="fa-solid fa-sliders"></i> إعدادات بسيطة</span>
      <h2>تحكم سريع بدون ازدحام</h2>
      <p>الصوت مغلق افتراضيا، والثيم والكوكيز من هنا بدون صفحة إعدادات مستقلة.</p>
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
      <button class="settings-toggle-row" data-core-action="cookie-settings" type="button">
        <i class="fa-solid fa-cookie-bite"></i>
        <span><strong>الكوكيز</strong><small>إدارة الموافقة والتفضيلات المحلية.</small></span>
        <b>فتح</b>
      </button>
    </div>
  `;
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
