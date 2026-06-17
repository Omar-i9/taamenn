import { injuryCases, injuryMeta, injurySeverity } from '../../data/injuries-data.js';
import { $, safeText } from './ui.js';

const DAY = 86400000;
let togglesBound = false;

function toDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function todayNoon() {
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  return now;
}

function daysBetween(a, b) {
  const start = toDate(a);
  const end = toDate(b);
  if (!start || !end) return null;
  return Math.max(0, Math.ceil((end - start) / DAY));
}

function daysUntil(value) {
  const target = toDate(value);
  if (!target) return null;
  return Math.ceil((target - todayNoon()) / DAY);
}

function formatDate(value) {
  const date = toDate(value);
  if (!date) return 'غير محدد';
  return new Intl.DateTimeFormat('ar-PS', { year: 'numeric', month: 'long', day: 'numeric' }).format(date);
}

function monthKey(value) {
  const date = toDate(value);
  if (!date) return '0000-00';
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(value) {
  const date = toDate(value);
  if (!date) return 'بدون تاريخ محدد';
  return new Intl.DateTimeFormat('ar-PS', { year: 'numeric', month: 'long' }).format(date);
}

function isRecovered(item) {
  const status = String(item.status || '');
  const severity = String(item.severity || '');
  const recovery = toDate(item.recoveryDate);
  const expected = toDate(item.expectedReturn);
  const now = todayNoon();

  if (item.autoArchive === false) return false;
  return (
    severity === 'healed' ||
    severity === 'recovery' ||
    status.includes('تعاف') ||
    (recovery && recovery <= now) ||
    (expected && expected < now)
  );
}

function runtimeStatus(item) {
  if (isRecovered(item)) return 'تعافى وانحفظ في السجل السابق';
  const left = daysUntil(item.expectedReturn);
  if (left === null) return item.status || 'تحت المتابعة';
  if (left < 0) return 'انتهى موعد الرجوع المتوقع وسيتم أرشفته';
  if (left === 0) return 'موعد الرجوع المتوقع اليوم';
  return item.status || 'تحت المتابعة';
}

function formatReturnLabel(item) {
  if (isRecovered(item)) {
    const date = item.recoveryDate || item.expectedReturn;
    return date ? `اكتمل: ${formatDate(date)}` : 'مكتمل';
  }
  const left = daysUntil(item.expectedReturn);
  if (left === null) return 'غير محدد';
  if (left < 0) return 'تحتاج مراجعة';
  if (left === 0) return 'متوقع اليوم';
  if (left === 1) return 'باقي يوم واحد';
  return `باقي ${left} يوم`;
}

function severityData(item) {
  if (isRecovered(item)) return injurySeverity.healed || injurySeverity.recovery;
  return injurySeverity[item.severity] || injurySeverity.medium;
}

function riskValue(item) {
  return isRecovered(item) ? 0 : Math.max(0, Math.min(100, Number(item.riskPercent) || 0));
}

function recoveryProgress(item) {
  if (isRecovered(item)) return 100;
  const total = daysBetween(item.startDate, item.expectedReturn);
  const left = daysUntil(item.expectedReturn);
  if (!total || left === null) return Math.max(6, Math.min(94, 100 - riskValue(item)));
  const passed = Math.max(0, total - left);
  return Math.max(6, Math.min(94, Math.round((passed / total) * 100)));
}

function phaseLabel(item) {
  if (isRecovered(item)) return item.afterStatus || 'تعافى وانتقل إلى سجل الإصابات السابقة';
  const progress = recoveryProgress(item);
  if (progress < 35) return 'مرحلة تهدئة ومراقبة';
  if (progress < 70) return 'مرحلة تحسن تدريجي';
  return 'مرحلة اختبار الرجوع بحذر';
}

function renderCareAndHistory(item) {
  const care = (item.care || []).map(step => `<li>${safeText(step)}</li>`).join('');
  const history = (item.history || []).map(entry => `
    <li>
      <time>${safeText(entry.date)}</time>
      <strong>${safeText(entry.title)}</strong>
      <span>${safeText(entry.text)}</span>
    </li>
  `).join('');

  return `
    <div class="injury-panel-grid">
      <div>
        <h4><i class="fa-solid fa-kit-medical"></i> خطة المتابعة</h4>
        <ul>${care || '<li>لا توجد خطة متابعة مضافة.</li>'}</ul>
      </div>
      <div>
        <h4><i class="fa-solid fa-clock-rotate-left"></i> سجل الحالة</h4>
        <ol class="injury-history">${history || '<li><span>لا يوجد سجل بعد.</span></li>'}</ol>
      </div>
    </div>
  `;
}

function renderSectionDivider(title, subtitle, icon = 'fa-kit-medical') {
  return `
    <div class="injury-section-divider" role="presentation">
      <span></span>
      <b><i class="fa-solid ${safeText(icon)}"></i> ${safeText(title)}</b>
      <em>${safeText(subtitle)}</em>
      <span></span>
    </div>
  `;
}

function renderInjuryCard(item, index = 0) {
  const severity = severityData(item);
  const risk = riskValue(item);
  const progress = recoveryProgress(item);
  const detailsId = `injury-panel-${safeText(item.id)}`;

  return `
    <article class="injury-card glass-panel severity-${safeText(item.severity)} is-active-injury" style="--delay:${index * 45}ms">
      <div class="injury-card-top">
        <div class="injury-icon-wrap">
          <i class="fa-solid ${safeText(item.icon || severity.icon)}"></i>
          <span class="injury-pulse"></span>
        </div>
        <div>
          <span class="injury-player">${safeText(item.player)}</span>
          <h3>${safeText(item.caseName)}</h3>
          <small>${safeText(item.bodyPart)} • ${safeText(item.type)}</small>
        </div>
        <span class="severity-pill">${safeText(severity.label)}</span>
      </div>

      <div class="injury-stage-strip" aria-label="مرحلة الحالة">
        <span class="stage-before">بداية</span>
        <b><i style="width:${progress}%"></i></b>
        <span class="stage-after">رجوع</span>
      </div>

      <div class="risk-meter" aria-label="نسبة الخطورة ${risk}%">
        <span style="width:${risk}%"></span>
        <b>${risk}%</b>
      </div>

      <div class="injury-facts">
        <span><i class="fa-solid fa-calendar-plus"></i> ${safeText(formatDate(item.startDate))}</span>
        <span><i class="fa-solid fa-hourglass-half"></i> ${safeText(formatReturnLabel(item))}</span>
        <span><i class="fa-solid fa-notes-medical"></i> ${safeText(runtimeStatus(item))}</span>
      </div>

      <p class="injury-desc">${safeText(item.description)}</p>
      <p class="injury-effect"><i class="fa-solid fa-wave-square"></i> ${safeText(item.effect)}</p>
      <p class="injury-phase"><i class="fa-solid fa-arrows-spin"></i> ${safeText(phaseLabel(item))}</p>

      <button class="injury-toggle-btn" type="button" data-injury-toggle="${detailsId}" aria-expanded="false" aria-controls="${detailsId}">
        <span><i class="fa-solid fa-kit-medical"></i> خطة العلاج وسجل الحالة</span>
        <i class="fa-solid fa-chevron-down"></i>
      </button>
      <div class="injury-action-panel" id="${detailsId}" hidden>
        ${renderCareAndHistory(item)}
      </div>
    </article>
  `;
}

function renderRecoveredFile(item, index = 0) {
  const severity = severityData(item);
  const completedAt = item.recoveryDate || item.expectedReturn || item.startDate;
  const period = `${formatDate(item.startDate)} ← ${formatDate(completedAt)}`;
  const before = item.beforeStatus || item.statusBefore || item.effect || 'كانت الحالة مؤثرة على الجاهزية.';
  const after = item.afterStatus || 'تعافى اللاعب وانتقلت الحالة للسجل السابق.';

  return `
    <article class="recovered-file-card" style="--delay:${index * 35}ms">
      <div class="recovered-file-head">
        <i class="fa-solid ${safeText(item.icon || severity.icon)}"></i>
        <div class="recovered-file-text">
          <strong>${safeText(item.player)} — ${safeText(item.caseName)}</strong>
          <small>${safeText(period)} • ${safeText(item.bodyPart)} • ${safeText(item.type)}</small>
        </div>
        <span class="recovered-file-state"><b>تعافى</b><em>محفوظ</em></span>
      </div>
      <div class="recovered-mini-transition">
        <span><b>قبل</b>${safeText(before)}</span>
        <i class="fa-solid fa-arrow-left-long"></i>
        <span><b>بعد</b>${safeText(after)}</span>
      </div>
      <p class="recovered-file-description">${safeText(item.description)}</p>
      <div class="recovered-file-care">
        ${renderCareAndHistory(item)}
      </div>
    </article>
  `;
}

function splitCases() {
  const active = [];
  const recovered = [];
  injuryCases.forEach(item => (isRecovered(item) ? recovered : active).push(item));
  active.sort((a, b) => riskValue(b) - riskValue(a));
  recovered.sort((a, b) => String(b.recoveryDate || b.expectedReturn || '').localeCompare(String(a.recoveryDate || a.expectedReturn || '')));
  return { active, recovered };
}

function renderSummary(active, recovered) {
  const high = active.filter(item => ['high', 'critical'].includes(item.severity)).length;
  const medium = active.filter(item => item.severity === 'medium').length;
  const avgRisk = Math.round(active.reduce((sum, item) => sum + riskValue(item), 0) / Math.max(1, active.length));
  return { active: active.length, recovered: recovered.length, high, medium, avgRisk };
}

function groupRecovered(recovered) {
  return recovered.reduce((groups, item) => {
    const key = monthKey(item.recoveryDate || item.expectedReturn || item.startDate);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

function renderRecoveredBlock(recovered) {
  const count = recovered.length;
  const groups = groupRecovered(recovered);
  const groupHtml = Object.entries(groups)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([, items]) => `
      <section class="recovered-month-group">
        <div class="recovered-month-label">
          <span>${safeText(monthLabel(items[0]?.recoveryDate || items[0]?.expectedReturn || items[0]?.startDate))}</span>
          <b>${items.length}</b>
        </div>
        <div class="recovered-files-list">
          ${items.map(renderRecoveredFile).join('')}
        </div>
      </section>
    `).join('');

  return `
    <section class="recovered-drawer-shell glass-panel">
      <button class="recovered-drawer-toggle" type="button" data-injury-toggle="recovered-drawer-body" aria-expanded="false" aria-controls="recovered-drawer-body">
        <span class="drawer-line-title"><i class="fa-solid fa-folder-tree"></i> سجل الإصابات السابقة والمتعافين</span>
        <span class="drawer-line-meta">${count ? `${count} حالة محفوظة` : 'لا توجد حالات محفوظة'}</span>
        <i class="fa-solid fa-chevron-down"></i>
      </button>
      <div class="recovered-drawer-body" id="recovered-drawer-body" hidden>
        ${count ? groupHtml : '<p class="empty-recovery">لا توجد حالات تعافي محفوظة بعد.</p>'}
      </div>
    </section>
  `;
}

function bindTogglesOnce() {
  if (togglesBound) return;
  togglesBound = true;

  document.addEventListener('click', event => {
    const toggle = event.target.closest('[data-injury-toggle]');
    if (!toggle) return;

    event.preventDefault();
    event.stopPropagation();

    const targetId = toggle.dataset.injuryToggle;
    const target = document.getElementById(targetId);
    if (!target) return;

    const open = target.hasAttribute('hidden');
    target.toggleAttribute('hidden', !open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.classList.toggle('is-open', open);
  }, true);
}

export function initInjuries() {
  bindTogglesOnce();

  const list = $('#injuriesList');
  const recoveredHost = $('#injuriesRecoveredLog');
  const stats = $('#injuryStats');
  const mini = $('#homeInjuriesMini');
  const meta = $('#injuryMetaNote');

  const { active, recovered } = splitCases();
  const summary = renderSummary(active, recovered);

  if (meta) meta.textContent = injuryMeta.note;

  if (stats) {
    stats.innerHTML = `
      <article><span>الحالات النشطة</span><strong>${summary.active}</strong></article>
      <article><span>السجل السابق</span><strong>${summary.recovered}</strong></article>
      <article><span>متوسطة/أعلى</span><strong>${summary.medium + summary.high}</strong></article>
      <article><span>معدل الخطورة</span><strong>${summary.avgRisk}%</strong></article>
    `;
  }

  if (list) {
    list.innerHTML = `
      ${renderSectionDivider('الحالات النشطة', 'اللاعبون الذين لم يكتمل تعافيهم بعد', 'fa-heart-pulse')}
      ${active.length
        ? active.map(renderInjuryCard).join('')
        : `<div class="glass-panel empty-state"><i class="fa-solid fa-circle-check"></i><strong>لا توجد إصابات نشطة</strong><span>كل الحالات الحالية متعافية أو محفوظة في السجل السابق.</span></div>`}
      ${renderSectionDivider('السجل السابق', 'الحالات المنتهية محفوظة أسفل هذا الفاصل', 'fa-folder-open')}
    `;
  }

  if (recoveredHost) recoveredHost.innerHTML = renderRecoveredBlock(recovered);

  if (mini) {
    const next = active[0];
    mini.innerHTML = `
      <div class="mini-health-row">
        <i class="fa-solid ${next ? safeText(next.icon || 'fa-kit-medical') : 'fa-circle-check'}"></i>
        <div>
          <strong>${summary.active ? `${summary.active} حالة نشطة` : 'لا توجد إصابات نشطة'}</strong>
          <span>${next ? `أعلى حالة: ${safeText(next.player)} • ${safeText(next.caseName)}` : `${summary.recovered} حالة في السجل السابق`}</span>
        </div>
      </div>
      <div class="mini-risk-line"><span style="width:${summary.active ? summary.avgRisk : 100}%"></span></div>
      <small class="tap-note">اضغط للانتقال للصفحة</small>
    `;
  }
}
