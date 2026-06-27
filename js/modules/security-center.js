import { security } from '../../data/site-data.js';
import { $, safeText, copyText, toast } from './ui.js';
import { clearTaamenSiteData, openCookieSettings } from './cookies.js';

const noticeText = [
  'تم خلال الفترة الأخيرة رصد نشاط غير طبيعي ومحاولات وصول غير مصرح بها مرتبطة ببعض الحسابات والبوابات التابعة لنظام تأمين. تم التعامل مع الخطر واحتواؤه، مع مراجعة كلمات المرور والجلسات النشطة ووسائل الدخول المرتبطة.',
  'نؤكد أن الوضع الحالي تحت السيطرة، ولم يتم تسجيل تأثير فعلي مؤكد على حسابات المستخدمين. سيستمر نظام تأمين في متابعة أي نشاط غير طبيعي وتعزيز إجراءات الحماية عند الحاجة.'
].join('\n\n');

const reportMessage = `مرحبا، عندي بلاغ أمني بخصوص منصة تأمين:
نوع المشكلة:
وقت حدوثها:
الرابط أو الصفحة:
التفاصيل المختصرة:`;

const statusCards = [
  ['platform', 'fa-server', 'حالة المنصة', 'مستقرة', 'الصفحات الأساسية تعمل مع متابعة أي خلل واضح.'],
  ['privacy', 'fa-user-shield', 'الخصوصية', 'مفعلة', 'يتم تقليل البيانات الحساسة وحفظ التفضيلات محليا عند الحاجة.'],
  ['ai', 'fa-brain', 'حماية AI', 'خادم وسيط', 'لا يجب أن تظهر مفاتيح AI في ملفات الواجهة العامة.'],
  ['emergency', 'fa-triangle-exclamation', 'الطوارئ', 'جاهزة', 'يمكن تقليل المعلومات الحساسة مؤقتا عند وجود خطر.']
];

const protectItems = [
  'خصوصية الأعضاء',
  'روابط المجموعات',
  'المساعد الذكي',
  'بيانات المباراة',
  'الأرشيف والإحصائيات',
  'تجربة استخدام منصة تأمين'
];

const memberRules = [
  'لا تشارك روابط المجموعة خارج النطاق المسموح',
  'لا تضغط على روابط مشبوهة',
  'لا ترسل كلمات مرور أو أكواد تحقق لأي شخص',
  'أبلغ الأدمن عند وجود رسالة غريبة'
];

const cookieSummary = [
  ['ضرورية', 'حفظ الموافقة وتشغيل التجربة الأساسية.'],
  ['تفضيلات', 'حفظ اللغة والثيم وبعض إعدادات الواجهة.'],
  ['تحسين التجربة', 'تذكر اختيارات محلية بسيطة بدون أسرار.'],
  ['تحليلات', 'غير مفعلة حاليا إلا بطلب واضح.']
];

const aiProtection = [
  ['fa-key', 'الأسرار', 'مفاتيح AI لا توضع في JavaScript العام.'],
  ['fa-database', 'نطاق البيانات', 'يرسل الموقع ملخصا محدودا من بيانات تأمين فقط.'],
  ['fa-house-signal', 'رجوع محلي', 'عند فشل الاتصال، يعمل المساعد بردود محلية آمنة.'],
  ['fa-ban', 'حدود السلامة', 'يرفض الاختراق والسرقة وتجاوز الخصوصية.']
];

export function initSecurityCenter() {
  const mount = $('#securityMount');
  if (!mount || mount.dataset.ready === '1') return;

  mount.dataset.ready = '1';
  mount.innerHTML = renderSecurityPage();
  bindSecurityActions(mount);
}

function renderSecurityPage() {
  const reportUrl = getReportUrl();
  const canOpenReport = reportUrl !== '#';

  return `
    <div class="security-hero glass-panel">
      <div>
        <span class="eyebrow"><i class="fa-solid fa-shield-halved"></i> مركز الحماية</span>
        <h1>مركز الحماية والأمان</h1>
        <p>حماية مختصرة وواضحة لخصوصية الأعضاء، روابط المجموعات، المساعد الذكي، وتجربة استخدام منصة تأمين.</p>
      </div>
      <div class="security-hero-badges" aria-label="حالة الحماية">
        <span>الحالة: تحت السيطرة</span>
        <span>التأثير: لا يوجد تأثير فعلي مؤكد</span>
        <span>المتابعة: مستمرة</span>
      </div>
    </div>

    <section class="security-grid security-status-grid" aria-label="بطاقات حالة الأمان">
      ${statusCards.map(([id, icon, title, value, text], index) => `
        <article class="security-card glass-panel ${index === 0 ? 'open' : ''}">
          <button class="security-card-toggle" type="button" aria-expanded="${index === 0}" aria-controls="securityStatus-${safeText(id)}" data-security-status="${safeText(id)}">
            <i class="fa-solid ${safeText(icon)}"></i>
            <span>${safeText(title)}</span>
            <strong>${safeText(value)}</strong>
            <em>${index === 0 ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}</em>
          </button>
          <p id="securityStatus-${safeText(id)}" ${index === 0 ? '' : 'hidden'}>${safeText(text)}</p>
        </article>
      `).join('')}
    </section>

    <section class="security-notice glass-panel">
      <div class="security-section-head">
        <span class="eyebrow"><i class="fa-solid fa-circle-exclamation"></i> تنبيه رسمي</span>
        <h2>تنبيه أمني مختصر</h2>
      </div>
      <div class="security-meta-row">
        <span>الحالة: تحت السيطرة</span>
        <span>التأثير: لا يوجد تأثير فعلي مؤكد</span>
        <span>المتابعة: مستمرة</span>
      </div>
      <button class="ghost-btn security-details-toggle" type="button" aria-expanded="false" aria-controls="securityNoticeDetails" data-security-notice-toggle>
        <i class="fa-solid fa-chevron-down"></i>
        عرض التفاصيل
      </button>
      <p id="securityNoticeDetails" hidden>${safeText(noticeText)}</p>
    </section>

    ${section('ماذا نحمي؟', 'fa-lock', `
      <div class="security-chip-grid">
        ${protectItems.map(item => `<span>${safeText(item)}</span>`).join('')}
      </div>
    `)}

    ${section('الكوكيز والخصوصية', 'fa-cookie-bite', `
      <div class="security-grid">
        ${cookieSummary.map(([title, text]) => `
          <article class="security-mini-card">
            <h3>${safeText(title)}</h3>
            <p>${safeText(text)}</p>
          </article>
        `).join('')}
      </div>
      <div class="security-action-row">
        <button id="securityCookieSettings" class="primary-btn" type="button"><i class="fa-solid fa-sliders"></i> إدارة الكوكيز</button>
        <button id="securityClearData" class="danger-btn" type="button"><i class="fa-solid fa-trash-can"></i> حذف بيانات تأمين من هذا الجهاز</button>
      </div>
    `)}

    ${section('حماية المساعد الذكي', 'fa-brain', `
      <div class="security-grid">
        ${aiProtection.map(([icon, title, text]) => `
          <article class="security-mini-card">
            <i class="fa-solid ${safeText(icon)}"></i>
            <h3>${safeText(title)}</h3>
            <p>${safeText(text)}</p>
          </article>
        `).join('')}
      </div>
    `)}

    <section class="security-report glass-panel">
      <div>
        <span class="eyebrow"><i class="fa-solid fa-headset"></i> بلاغ أمني</span>
        <h2>الإبلاغ عن مشكلة أمنية</h2>
        <p>أرسل بلاغا مختصرا عند وجود رابط مشبوه، رسالة غريبة، أو محاولة وصول غير معتادة.</p>
      </div>
      <div class="security-action-row">
        ${canOpenReport ? `<a class="primary-btn link-btn" href="${safeText(reportUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i> إبلاغ الأدمن</a>` : ''}
        <button id="securityCopyReport" class="ghost-btn" type="button"><i class="fa-solid fa-copy"></i> نسخ نموذج البلاغ</button>
      </div>
    </section>

    ${section('وضع الطوارئ', 'fa-triangle-exclamation', `
      <div class="emergency-track" data-state="${safeText(security.emergencyMode)}">
        <span>الوضع الطبيعي</span>
        <span class="active">مراقبة نشطة</span>
        <span>تقييد مؤقت</span>
        <span>إخفاء معلومات حساسة</span>
      </div>
    `)}

    ${section('قواعد الأعضاء المختصرة', 'fa-list-check', `
      <ul class="security-rules compact">
        ${memberRules.map(rule => `<li>${safeText(rule)}</li>`).join('')}
      </ul>
    `)}
  `;
}

function section(title, icon, content) {
  return `
    <section class="security-section glass-panel">
      <div class="security-section-head">
        <span class="eyebrow"><i class="fa-solid ${safeText(icon)}"></i> مركز الحماية</span>
        <h2>${safeText(title)}</h2>
      </div>
      ${content}
    </section>
  `;
}

function bindSecurityActions(mount) {
  mount.addEventListener('click', event => {
    const statusButton = event.target.closest('[data-security-status]');
    if (statusButton) {
      toggleStatusCard(mount, statusButton);
      return;
    }

    const noticeButton = event.target.closest('[data-security-notice-toggle]');
    if (noticeButton) {
      toggleNotice(noticeButton);
    }
  });

  $('#securityCookieSettings')?.addEventListener('click', openCookieSettings);
  $('#securityCopyReport')?.addEventListener('click', () => copyText(reportMessage, 'تم نسخ نموذج البلاغ الأمني'));
  $('#securityClearData')?.addEventListener('click', () => {
    const confirmed = window.confirm('سيتم حذف بيانات تأمين المحفوظة على هذا الجهاز فقط، مثل التفضيلات وموافقة الكوكيز. هل تريد المتابعة؟');
    if (!confirmed) return;
    const removed = clearTaamenSiteData();
    toast(`تم حذف ${removed.length} مفتاحا خاصا بتأمين من هذا الجهاز`, { icon: 'fa-trash-can' });
  });
}

function toggleStatusCard(mount, button) {
  mount.querySelectorAll('[data-security-status]').forEach(toggle => {
    const isCurrent = toggle === button;
    const panel = document.getElementById(toggle.getAttribute('aria-controls'));
    toggle.setAttribute('aria-expanded', String(isCurrent));
    toggle.querySelector('em').textContent = isCurrent ? 'إخفاء التفاصيل' : 'عرض التفاصيل';
    toggle.closest('.security-card')?.classList.toggle('open', isCurrent);
    if (panel) panel.hidden = !isCurrent;
  });
}

function toggleNotice(button) {
  const panel = document.getElementById(button.getAttribute('aria-controls'));
  const open = button.getAttribute('aria-expanded') !== 'true';
  button.setAttribute('aria-expanded', String(open));
  button.innerHTML = `<i class="fa-solid fa-chevron-${open ? 'up' : 'down'}"></i> ${open ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}`;
  if (panel) panel.hidden = !open;
}

function getReportUrl() {
  const reportLink = security.links.find(link => link.type === 'security-report' || link.type === 'admin');
  if (!reportLink?.url || reportLink.url === '#') return '#';
  const separator = reportLink.url.includes('?') ? '&' : '?';
  return `${reportLink.url}${separator}text=${encodeURIComponent(reportMessage)}`;
}
