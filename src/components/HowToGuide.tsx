import { useState } from 'react';
import { X, ArrowLeft, BookOpen, Archive, ClipboardList, Swords, Share2, Download, Upload, Bell, BadgeCheck, Smartphone, Mail, RotateCcw } from 'lucide-react';

type Language = 'ar' | 'en';

interface GuideSection {
  id: string;
  title: { ar: string; en: string };
  content: { ar: string; en: string };
  icon: any;
}

const guideSections: GuideSection[] = [
  {
    id: 'getting-started',
    title: { ar: 'البدء', en: 'Getting Started' },
    content: {
      ar: 'قم بإنشاء ملفك الشخصي المحلي في البداية. املأ الاسم الأول، والاسم العائلة (اختياري)، والبريد الإلكتروني (اختياري)، والهاتف (اختياري). يمكنك إضافة صورة شخصية وغلاف لملفك. بعد الإنشاء، ستنتقل مباشرة إلى الصفحة الرئيسية لتجربة TAAMEN.',
      en: 'Create your local profile first. Fill in your first name, family name (optional), email (optional), and phone (optional). You can add a personal photo and banner for your profile. After creation, you will go directly to the Home page to experience TAAMEN.'
    },
    icon: BookOpen
  },
  {
    id: 'profile',
    title: { ar: 'الملف الشخصي', en: 'Profile' },
    content: {
      ar: 'الملف الشخصي المحلي يحتوي على هويتك في TAAMEN. يمكنك تعديل اسمك، صورتك، وغلافك في أي وقت. زر الحفظ يكون نشطًا فقط عند وجود تغييرات غير محفوظة. إذا حاولت المغادرة مع تغييرات غير محفوظة، سيظهر لك تحذير. البريد والهاتف اختياريان ولا يتم مشاركتهما أبدًا في المشاركات العامة.',
      en: 'Your local profile contains your TAAMEN identity. You can edit your name, photo, and banner at any time. The Save button is only active when there are unsaved changes. If you try to leave with unsaved changes, you will see a warning. Email and phone are optional and are never included in public shares.'
    },
    icon: Swords
  },
  {
    id: 'match-center',
    title: { ar: 'مركز المباريات', en: 'Match Center' },
    content: {
      ar: 'أنشئ مبارياتك الحالية من خلال مركز المباريات. أدخل اسم الفريقين، التاريخ، الوقت، الملعب، المدينة، ونوع المباراة. يمكنك إدارة المباريات القادمة وإدخال النتائج عند انتهائها. عند إدخال النتيجة، يمكن أرشفة المباراة في السجل المحلي.',
      en: 'Create your current matches through the Match Center. Enter team names, date, time, stadium, city, and match type. You can manage upcoming matches and enter results when they finish. After entering the result, you can archive the match to your local archive.'
    },
    icon: ClipboardList
  },
  {
    id: 'archive',
    title: { ar: 'السجل', en: 'Archive' },
    content: {
      ar: 'السجل المحلي يحتوي على المباريات التي أنشأتها بنفسك أو استوردتها إلى حسابك المحلي. يمكنك البحث في السجل حسب الفريق أو الملعب أو نوع المباراة. السجل التاريخي متاح فقط للأعضاء المميزين وللقراءة فقط.',
      en: 'Your local archive contains matches you created yourself or imported into your local account. You can search the archive by team, stadium, or match type. The Historical Archive is available only to Featured Members for read-only viewing.'
    },
    icon: Archive
  },
  {
    id: 'player-contributions',
    title: { ar: 'مساهمات اللاعبين', en: 'Player Contributions' },
    content: {
      ar: 'عند أرشفة مباراة، يمكنك اختياريًا إضافة مساهمات اللاعبين. يمكن إضافة ما يصل إلى 5 لاعبين من كل فريق، مع إدخال عدد الأهداف والتسديدات. يتم حساب المساهمات الإجمالية تلقائيًا (الأهداف + التسديدات). هذه الميزة اختيارية ولا تُفرض لكل مباراة.',
      en: 'When archiving a match, you can optionally add player contributions. You can add up to 5 players per team, entering their goals and assists. Total contributions are calculated automatically (goals + assists). This feature is optional and not required for every match.'
    },
    icon: Swords
  },
  {
    id: 'tactical',
    title: { ar: 'الملعب التكتيكي', en: 'Tactical Playground' },
    content: {
      ar: 'الملعب التكتيكي هو لوح تكتيكي محلي يمكنك من خلاله ترتيب اللاعبين، اختيار التشكيلات، وتعيين الأدوار والتعليمات التكتيكية. يمكنك حفظ خطتك التكتيكية محليًا. في وضع التركيز الملعب، يفضل استخدام وضع أفقي للتجربة الأفضل.',
      en: 'The Tactical Playground is a local tactical board where you can arrange players, select formations, and assign tactical roles and instructions. You can save your tactical plan locally. In tactical focus mode, landscape orientation is preferred for the best experience.'
    },
    icon: Swords
  },
  {
    id: 'sharing',
    title: { ar: 'المشاركة', en: 'Sharing' },
    content: {
      ar: 'يمكنك مشاركة المباريات والسجلات مع الآخرين. عند المشاركة، يمكنك اختيار ما إذا كنت تريد تضمين مساهمات اللاعبين. المستلم يمكنه معاينة المحتوى أو إضافته إلى مركز المباريات أو السجل المحلي. لن يتم استبدال بياناتك المحلية تلقائيًا.',
      en: 'You can share matches and archive records with others. When sharing, you can choose whether to include player contributions. The recipient can preview the content or add it to their Match Center or local archive. Your local data will not be automatically overwritten.'
    },
    icon: Share2
  },
  {
    id: 'profile-sharing',
    title: { ar: 'مشاركة الملف', en: 'Profile Sharing' },
    content: {
      ar: 'مشاركة الملف الشخصي تُنشئ نسخة عامة آمنة تحتوي على اسمك وصورتك فقط. البريد الإلكتروني والهاتف لا يتم تضمينهما أبدًا. المستلم يرى معاينة فقط ولا يتم استيراد الملف تلقائيًا إلى حسابه.',
      en: 'Profile sharing creates a safe public copy containing only your name and photos. Email and phone are never included. The recipient sees only a preview and the profile is not automatically imported to their account.'
    },
    icon: Share2
  },
  {
    id: 'import-export',
    title: { ar: 'الاستيراد والتصدير', en: 'Import / Export' },
    content: {
      ar: 'يمكنك تصدير بيانات TAAMEN المحلية كنسخة احتياطية واستيرادها لاحقًا. يتم التحقق من صحة البيانات المستوردة لمنع الملفات التالفة. استخدم هذه الميزة لنقل بياناتك بين الأجهزة.',
      en: 'You can export your local TAAMEN data as a backup and import it later. Imported data is validated to prevent corrupt files. Use this feature to transfer your data between devices.'
    },
    icon: Download
  },
  {
    id: 'featured',
    title: { ar: 'الأعضاء المميزون', en: 'Featured Members' },
    content: {
      ar: 'الدخول كعضو مميز متاح من الإعدادات. أدخل معرّف العضو بالتنسيق user#****. المعرف هو للتعرف فقط وليس كلمة مرور. الأعضاء المميزون يحصلون على الوصول إلى السجل التاريخي ومركز المباريات التاريخي.',
      en: 'Featured Member access is available from Settings. Enter the member identifier in the format user#****. The identifier is for recognition only, not a password. Featured Members get access to the Historical Archive and Historical Match Center.'
    },
    icon: BadgeCheck
  },
  {
    id: 'notifications',
    title: { ar: 'الإشعارات', en: 'Notifications' },
    content: {
      ar: 'تلقى إشعارات عند تقرب المباريات، بدء المباريات، وانتهائها. يمكنك عرض جميع الإشعارات في مركز الإشعارات. يمكن حذف الإشعارات أو تحديدها كمقروءة. الإشعارات المحلية تُحفظ على جهازك.',
      en: 'Receive notifications when matches are approaching, starting, or finishing. You can view all notifications in the notification center. Notifications can be deleted or marked as read. Local notifications are stored on your device.'
    },
    icon: Bell
  },
  {
    id: 'pwa',
    title: { ar: 'تثبيت TAAMEN', en: 'PWA / Installation' },
    content: {
      ar: 'يمكنك تثبيت TAAMEN كتطبيق ويب على هاتفك أو جهازك المحمول. عند التثبيت، يمكنك استخدام TAAMEN دون اتصال. يرجى ملاحظة أن الإشعارات الخلفية محدودة بقدرات المتصفح.',
      en: 'You can install TAAMEN as a PWA on your phone or mobile device. When installed, you can use TAAMEN without an internet connection. Please note that background notifications are limited by browser capabilities.'
    },
    icon: Smartphone
  },
  {
    id: 'email',
    title: { ar: 'البريد الإلكتروني', en: 'Email' },
    content: {
      ar: 'البريد الإلكتروني في ملفك اختياري. يمكنك استخدام صفحة الدعم لإرسال رسائل إلى فريق TAAMEN. سيتم إرسال رد تلقائي تلقائيًا عند استلام رسالتك. التحقق من البريد سيكون متاحًا قريبًا.',
      en: 'Email in your profile is optional. You can use the Support page to send messages to the TAAMEN team. An auto-reply will be sent automatically when your message is received. Email verification will be available soon.'
    },
    icon: Mail
  },
  {
    id: 'reset',
    title: { ar: 'إعادة ضبط البيانات', en: 'Resetting Data' },
    content: {
      ar: 'إعادة ضبط TAAMEN ستحذف جميع بياناتك المحلية بما في ذلك الملف الشخصي، المباريات، السجل، البيانات التكتيكية، والإشعارات. هذا الإجراء لا يمكن التراجع عنه. يجب عليك الانتظار 5 ثوانٍ قبل تنفيذ الحذف.',
      en: 'Resetting TAAMEN will delete all your local data including your profile, matches, archive, tactical data, and notifications. This action cannot be undone. You must wait 5 seconds before executing the deletion.'
    },
    icon: RotateCcw
  }
];

export default function HowToGuide({ language, open, onClose }: { language: Language; open: boolean; onClose: () => void }) {
  const ar = language === 'ar';

  if (!open) return null;

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label={ar ? 'دليل الاستخدام' : 'How-to Guide'}>
      <button className="overlay-backdrop" aria-label="close" onClick={onClose} />
      <aside className="guide-modal">
        <header>
          <div>
            <span className="eyebrow">TAAMEN / GUIDE</span>
            <h2>{ar ? 'دليل الاستخدام' : 'How-to Guide'}</h2>
          </div>
          <button className="icon-button large" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="guide-content">
          {guideSections.map(section => {
            const Icon = section.icon;
            return (
              <div key={section.id} className="guide-section">
                <div className="guide-section-header">
                  <div className="guide-section-icon">
                    <Icon size={20} />
                  </div>
                  <h3>{section.title[language]}</h3>
                </div>
                <p className="guide-section-content">{section.content[language]}</p>
              </div>
            );
          })}
        </div>
        <footer>
          <button className="primary-action wide" onClick={onClose}>
            <ArrowLeft size={17} />
            {ar ? 'عودة' : 'Back'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
