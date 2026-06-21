import { security } from '../../data/site-data.js';
import { $, safeText, copyText, toast } from './ui.js';
import { clearTaamenSiteData, openCookieSettings } from './cookies.js';

const reportMessage = `مرحبًا، عندي بلاغ أمني بخصوص منصة تأمين:
نوع المشكلة:
وقت حدوثها:
الرابط أو الصفحة:
التفاصيل:`;

const statusCards = [
  {
    icon: 'fa-server',
    title: 'حالة المنصة',
    value: 'مستقرة',
    text: 'يتم تشغيل المنصة ومراجعة الصفحات الأساسية بشكل مستمر لتقليل الأخطاء والمشاكل.'
  },
  {
    icon: 'fa-user-shield',
    title: 'وضع الخصوصية',
    value: 'مفعّل',
    text: 'يتم تقليل نشر الروابط والمعلومات الحساسة داخل النطاق العام.'
  },
  {
    icon: 'fa-users-gear',
    title: 'حماية المجموعات',
    value: 'مقيّدة',
    text: 'روابط المجموعات لا تُنشر عشوائيًا، ويتم التعامل مع أي تسريب بجدية.'
  },
  {
    icon: 'fa-brain',
    title: 'حماية AI',
    value: 'محمي عبر خادم وسيط',
    text: 'مفاتيح الربط لا تظهر داخل ملفات الموقع العامة.'
  },
  {
    icon: 'fa-cookie-bite',
    title: 'Cookies',
    value: 'شفافة وقابلة للتحكم',
    text: 'تُستخدم لحفظ التفضيلات فقط، وليس لجمع كلمات مرور أو بيانات حساسة.'
  },
  {
    icon: 'fa-triangle-exclamation',
    title: 'وضع الطوارئ',
    value: 'جاهز',
    text: 'يمكن تقييد المعلومات الحساسة مؤقتًا عند رصد نشاط غير طبيعي.'
  }
];

const protectItems = [
  'مواعيد المباريات قبل الإعلان الرسمي',
  'التشكيلات والخطط التنظيمية',
  'روابط المجموعات الخاصة',
  'بيانات الإصابات والحضور المعروضة داخل الموقع',
  'أرشيف المباريات والنتائج',
  'تجربة الأعضاء من الروابط المشبوهة والرسائل الاحتيالية',
  'مفاتيح ربط المساعد الذكي والخدمات الخارجية',
  'استقرار الواجهة والتنقل بين الصفحات'
];

const cookieCategories = [
  {
    title: 'ضرورية',
    items: [
      'تحفظ موافقة المستخدم على سياسة الكوكيز',
      'تساعد على عدم إظهار نفس التنبيه كل مرة',
      'لا يمكن تعطيلها إذا كانت مطلوبة لتجربة الموقع الأساسية'
    ]
  },
  {
    title: 'تفضيلات',
    items: ['اللغة', 'الثيم / نمط العرض', 'حالة إخفاء بعض التنبيهات', 'آخر قسم تمت زيارته']
  },
  {
    title: 'تحسين التجربة',
    items: ['إعدادات الواجهة', 'تفضيلات العرض', 'لا تشمل بيانات حساسة']
  },
  {
    title: 'تحليلات',
    items: ['غير مفعّلة حاليًا', 'لا تتم إضافة أدوات تحليل خارجية من دون طلب واضح', 'تبقى معطلة من إعدادات الخصوصية']
  }
];

const responseSteps = [
  ['الرصد', 'مراجعة أي نشاط غير طبيعي أو رسائل مشبوهة أو محاولة وصول غير معتادة.'],
  ['التقييد', 'تقليل الوصول إلى المجموعات أو تعليق نشر معلومات حساسة مؤقتًا.'],
  ['التأمين', 'مراجعة كلمات المرور، الجلسات النشطة، وسائل الدخول، وروابط الخدمات.'],
  ['المراجعة', 'فحص إعدادات الموقع والخادم والتأكد من عدم وجود مفاتيح أو روابط مكشوفة.'],
  ['الإبلاغ', 'تنبيه الأعضاء عند الحاجة دون نشر تفاصيل تقنية قد تساعد على تكرار المشكلة.'],
  ['الاستعادة', 'إعادة الخدمات والمعلومات تدريجيًا بعد التأكد من استقرار الوضع.']
];

const memberRules = [
  'لا تشارك روابط المجموعة خارج النطاق المسموح',
  'لا تنشر المواعيد أو التشكيلات قبل الإعلان الرسمي',
  'لا تضغط على روابط مشبوهة حتى لو وصلت من شخص معروف',
  'لا ترسل كلمات مرور أو أكواد تحقق لأي شخص',
  'لا ترسل بيانات شخصية أو سرية داخل المساعد الذكي',
  'عند وصول رسالة غريبة أو محاولة احتيال، أبلغ الآدمن فورًا',
  'أي تسريب متعمد قد يؤدي إلى تقييد الوصول للمجموعة'
];

export function initSecurityCenter() {
  const mount = $('#securityMount');
  if (!mount || mount.dataset.ready === '1') return;

  mount.dataset.ready = '1';
  mount.innerHTML = renderSecurityPage();
  bindSecurityActions();
}

function renderSecurityPage() {
  const reportUrl = getReportUrl();
  const canOpenReport = reportUrl !== '#';

  return `
    <div class="security-hero glass-panel">
      <div>
        <span class="eyebrow"><i class="fa-solid fa-shield-halved"></i> مركز الحماية والأمان</span>
        <h1>مركز الحماية والأمان</h1>
        <p>منصة تأمين 2026 تعمل وفق مبدأ الخصوصية أولًا، وتقليل المخاطر، وحماية تجربة الأعضاء من التسريب أو التخريب أو الاستخدام غير المنظم.</p>
      </div>
      <div class="security-hero-badges" aria-label="حالة الحماية">
        <span>الحالة: نشطة</span>
        <span>الخصوصية: مفعّلة</span>
        <span>الطوارئ: مراقبة نشطة</span>
        <span>${safeText(security.lastReviewLabel)}</span>
      </div>
    </div>

    <section class="security-grid security-status-grid" aria-label="بطاقات حالة الأمان">
      ${statusCards.map(card => `
        <article class="security-card glass-panel">
          <i class="fa-solid ${safeText(card.icon)}"></i>
          <span>${safeText(card.title)}</span>
          <strong>${safeText(card.value)}</strong>
          <p>${safeText(card.text)}</p>
        </article>
      `).join('')}
    </section>

    <section class="security-notice glass-panel">
      <div class="security-section-head">
        <span class="eyebrow"><i class="fa-solid fa-circle-exclamation"></i> تنبيه رسمي</span>
        <h2>تنبيه أمني من نظام تأمين</h2>
      </div>
      <div class="security-meta-row">
        <span>الحالة: محتوى</span>
        <span>التأثير: لا يوجد تأثير فعلي مؤكد على حسابات المستخدمين</span>
        <span>الإجراء: مراجعة وتأمين</span>
        <span>المتابعة: مستمرة</span>
      </div>
      <p>تم خلال الفترة الأخيرة رصد نشاط غير طبيعي ومحاولات وصول غير مصرح بها مرتبطة ببعض الحسابات والبوابات التابعة لنظام تأمين.</p>
      <p>وبحسب المتابعة، كان من الممكن أن يؤدي هذا النشاط في حال عدم اكتشافه إلى وصول تدريجي لبعض الحسابات المرتبطة، وربما محاولة استهداف حسابات مستخدمين أو جهات مرتبطة بالنظام عبر مراحل متتابعة.</p>
      <p>تم التعامل مع الخطر بشكل مباشر، واحتواء النشاط المشبوه، وتأمين الحسابات والبوابات الأساسية، مع مراجعة كلمات المرور والجلسات النشطة ووسائل الدخول المرتبطة.</p>
      <p>نؤكد أن الوضع حاليًا تحت السيطرة، ولم يتم تسجيل أي تأثير فعلي مؤكد على حسابات المستخدمين، وسيستمر العمل على مراقبة أي نشاط غير طبيعي وتعزيز إجراءات الحماية عند الحاجة.</p>
      <p>نظام تأمين مستمر في المتابعة والحماية، وأي محاولة وصول غير مصرح بها سيتم التعامل معها فورًا.</p>
    </section>

    ${section('ماذا نحمي داخل تأمين؟', 'fa-lock', `
      <div class="security-chip-grid">
        ${protectItems.map(item => `<span>${safeText(item)}</span>`).join('')}
      </div>
      <p class="security-note">الحماية هنا تعني تقليل المخاطر واحتواء الحالات غير الطبيعية بسرعة، وليس ادعاء أن أي نظام مستحيل الاختراق.</p>
    `)}

    ${section('ملفات Cookies والتخزين المحلي', 'fa-cookie-bite', `
      <p>قد تستخدم منصة تأمين ملفات Cookies أو التخزين المحلي داخل المتصفح لحفظ إعدادات بسيطة مثل موافقة الخصوصية، اللغة، تفضيلات الواجهة، حالة بعض التنبيهات، أو آخر صفحة تم فتحها.</p>
      <p>لا يتم استخدام Cookies لجمع كلمات مرور أو معلومات شخصية حساسة، ولا يتم بيع أو مشاركة بيانات المستخدمين مع أي جهة خارجية. يمكن للمستخدم حذف هذه البيانات من المتصفح أو من إعدادات الخصوصية داخل الموقع في أي وقت.</p>
      <div class="security-grid">
        ${cookieCategories.map(category => `
          <article class="security-mini-card">
            <h3>${safeText(category.title)}</h3>
            <ul>${category.items.map(item => `<li>${safeText(item)}</li>`).join('')}</ul>
          </article>
        `).join('')}
      </div>
      <div class="security-action-row">
        <button id="securityCookieSettings" class="primary-btn" type="button"><i class="fa-solid fa-sliders"></i> إدارة تفضيلات الكوكيز</button>
        <button id="securityClearData" class="danger-btn" type="button"><i class="fa-solid fa-trash-can"></i> حذف بيانات الموقع من هذا الجهاز</button>
      </div>
    `)}

    ${section('حماية المساعد الذكي', 'fa-brain', `
      <p>المساعد الذكي في تأمين 2026 يعمل من خلال خادم وسيط، بحيث لا تظهر مفاتيح Gemini أو أي مفاتيح API داخل ملفات الموقع العامة.</p>
      <p>المساعد يعتمد على البيانات التي يرسلها الموقع فقط، مثل حالة المنصة، المباراة القادمة، الأرشيف، الإصابات، والصفحات المتاحة. لذلك لا يجب إرسال معلومات شخصية أو سرية داخله.</p>
      <p>في حال فشل الاتصال الخارجي أو ضغط الخدمة، يعود النظام إلى الردود المحلية المتاحة داخل الموقع قدر الإمكان.</p>
      <div class="security-pill-row">
        <span>API keys: غير ظاهرة في الواجهة</span>
        <span>Backend: خادم وسيط</span>
        <span>Data scope: بيانات الموقع فقط</span>
        <span>Fallback: رد محلي عند الحاجة</span>
      </div>
    `)}

    ${section('روابط المجموعات والتواصل الإداري', 'fa-link', `
      <p>روابط المجموعات تُعامل كمعلومات محدودة التداول. لا يتم نشر الروابط الخاصة عشوائيًا، ويتم استخدام قناة الآدمن للتواصل أو التبليغ عن مشكلة.</p>
      <div class="security-grid">
        ${security.links.map(link => linkCard(link)).join('')}
      </div>
    `)}

    ${section('كيف نردع المخاطر ونحتويها؟', 'fa-timeline', `
      <ol class="security-timeline">
        ${responseSteps.map(([title, text]) => `<li><strong>${safeText(title)}</strong><p>${safeText(text)}</p></li>`).join('')}
      </ol>
    `)}

    ${section('الفحص الأمني الدفاعي', 'fa-magnifying-glass-chart', `
      <p>في الحالات الحرجة، يمكن استخدام أدوات فحص أمنية دفاعية وبيئات Linux مخصصة للمراجعة، بهدف فحص إعدادات المنصة والخادم، التأكد من عدم وجود روابط مكشوفة، مراجعة الأخطاء، وتحسين إجراءات الحماية.</p>
      <p>أي فحص يتم فقط ضمن نطاق منصة تأمين وبهدف الحماية والتنظيم، وليس لاستهداف أي أجهزة أو حسابات أو جهات خارجية.</p>
    `)}

    ${section('تعليمات الأعضاء', 'fa-list-check', `
      <ul class="security-rules">${memberRules.map(rule => `<li>${safeText(rule)}</li>`).join('')}</ul>
    `)}

    ${section('وضع الطوارئ', 'fa-triangle-exclamation', `
      <div class="emergency-track" data-state="${safeText(security.emergencyMode)}">
        <span>الوضع الطبيعي</span>
        <span class="active">مراقبة نشطة</span>
        <span>تقييد مؤقت</span>
        <span>إغلاق مؤقت للمعلومات الحساسة</span>
      </div>
      <p>يتم استخدام وضع الطوارئ عند رصد نشاط غير طبيعي أو خطر تسريب أو محاولة تأثير على تنظيم المجموعة.</p>
    `)}

    <section class="security-report glass-panel">
      <div>
        <span class="eyebrow"><i class="fa-solid fa-headset"></i> بلاغ أمني</span>
        <h2>الإبلاغ عن مشكلة أمنية</h2>
        <p>إذا لاحظت رابطًا مشبوهًا، رسالة غريبة، تسريبًا، أو محاولة وصول غير معتادة، أرسل بلاغًا مختصرًا للآدمن بدون نشر التفاصيل للعامة.</p>
      </div>
      <div class="security-action-row">
        ${canOpenReport ? `<a class="primary-btn link-btn" href="${safeText(reportUrl)}" target="_blank" rel="noopener noreferrer"><i class="fa-brands fa-whatsapp"></i> إرسال بلاغ عبر واتساب</a>` : ''}
        <button id="securityCopyReport" class="ghost-btn" type="button"><i class="fa-solid fa-copy"></i> نسخ نموذج البلاغ</button>
      </div>
    </section>
  `;
}

function section(title, icon, content) {
  return `
    <section class="security-section glass-panel">
      <div class="security-section-head">
        <span class="eyebrow"><i class="fa-solid ${safeText(icon)}"></i> Security Center</span>
        <h2>${safeText(title)}</h2>
      </div>
      ${content}
    </section>
  `;
}

function linkCard(link) {
  const isPlaceholder = !link.url || link.url === '#';
  const label = safeText(link.label);
  return `
    <article class="security-link-card">
      <h3>${label}</h3>
      <p>${safeText(link.note)}</p>
      ${isPlaceholder
        ? '<span class="security-disabled-link">غير منشور للعامة</span>'
        : `<a class="ghost-btn link-btn" href="${safeText(link.url)}" target="_blank" rel="noopener noreferrer">فتح الرابط</a>`}
    </article>
  `;
}

function getReportUrl() {
  const reportLink = security.links.find(link => link.type === 'security-report' || link.type === 'admin');
  if (!reportLink?.url || reportLink.url === '#') return '#';
  const separator = reportLink.url.includes('?') ? '&' : '?';
  return `${reportLink.url}${separator}text=${encodeURIComponent(reportMessage)}`;
}

function bindSecurityActions() {
  $('#securityCookieSettings')?.addEventListener('click', openCookieSettings);
  $('#securityCopyReport')?.addEventListener('click', () => copyText(reportMessage, 'تم نسخ نموذج البلاغ الأمني'));
  $('#securityClearData')?.addEventListener('click', () => {
    const confirmed = window.confirm('سيتم حذف بيانات تأمين المحفوظة على هذا الجهاز فقط، مثل التفضيلات وموافقة الكوكيز. هل تريد المتابعة؟');
    if (!confirmed) return;
    const removed = clearTaamenSiteData();
    toast(`تم حذف ${removed.length} مفتاحًا خاصًا بتأمين من هذا الجهاز`, { icon: 'fa-trash-can' });
  });
}
