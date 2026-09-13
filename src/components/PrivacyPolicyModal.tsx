import { useState } from 'react';
import { X, Shield, FileText, Lock, Database, Mail, Bell, Users, Settings, Clock, AlertTriangle } from 'lucide-react';

type Language = 'ar' | 'en';
type DocumentType = 'privacy' | 'terms';

const POLICY_VERSION = '1.0';

interface PrivacyPolicyModalProps {
  language: Language;
  onClose: () => void;
  initialDocument?: DocumentType;
}

export function getPolicyVersion(): string {
  return POLICY_VERSION;
}

export function hasAcceptedConsent(): boolean {
  const accepted = localStorage.getItem('taamen-consent-version');
  return accepted === POLICY_VERSION;
}

export function recordConsent(): void {
  localStorage.setItem('taamen-consent-version', POLICY_VERSION);
}

export function clearConsent(): void {
  localStorage.removeItem('taamen-consent-version');
}

const privacySections = {
  ar: [
    { id: 'intro', title: 'مقدمة', icon: Shield, content: 'TAAMEN هو تطبيق لإدارة مباريات كرة القدم، تنظيم الفرق، وتتبع النتائج محليًا. يوفر تجربة كرة قدم هادئة وواضحة مع التركيز على الخصوصية والبيانات المحلية.' },
    { id: 'collection', title: 'البيانات التي نجمعها', icon: Database, content: 'تتضمن بيانات الملف الشخصي: الاسم الأول، اسم العائلة (اختياري)، الصورة الشخصية، البريد الإلكتروني (اختياري)، رقم الهاتف (اختياري). جميع البيانات محفوظة محليًا على جهازك ما لم يتم مشاركتها عمدًا.' },
    { id: 'storage', title: 'التخزين المحلي', icon: Lock, content: 'يتم تخزين معلومات الملف العام بشكل أساسي محليًا على جهازك باستخدام IndexedDB و localStorage. عند مسح بيانات المتصفح، سيتم حذف بيانات TAAMEN المحلية. يمكنك تصدير نسخة احتياطية واستيرادها.' },
    { id: 'email', title: 'التواصل عبر البريد', icon: Mail, content: 'يتم استخدام البريد الإلكتروني بشكل اختياري للرسائل الدعم والردود التلقائية. لا يتم إرسال بريد إلكتروني تلقائيًا دون إجراء المستخدم. يجب توفير بريد إلكتروني تملك الحق في استخدامه.' },
    { id: 'notifications', title: 'الإشعارات', icon: Bell, content: 'تتضمن الإشعارات: دورة حياة المباراة، أرشفة المباريات، والسلوك المحلي للإشعارات. يتم التعامل مع أذونات الإشعارات من خلال المتصفح.' },
    { id: 'sharing', title: 'المشاركة والخصوصية', icon: Users, content: 'المشاركة تتم بناءً على طلب المستخدم. يجب معاينة المحتوى المشترك قبل الاستيراد. يجب على المستلم تأكيد الاستيراد صراحة. البيانات المشتركة لا تكتبي البيانات المحلية الموجودة تلقائيًا.' },
    { id: 'security', title: 'الأمان', icon: Shield, content: 'يتم توفير حماية معقولة من جانب العميل، لكن لا يوجد ضمان بالأمان المطلق. أمان المتصفح والجهاز مهم. لا يتم تخزين كلمات المرور للملف المحلي العادي.' },
    { id: 'deletion', title: 'حذف البيانات', icon: Database, content: 'يمكن للمستخدم: تعديل الملف، تصدير/نسخ احتياطي، حذف/إعادة تعيين البيانات المحلية. إعادة التعيين تحذف جميع بيانات TAAMEN المحلية.' },
    { id: 'changes', title: 'التغييرات', icon: Clock, content: 'قد تتغير السياسات بمرور الوقت. يتم استخدام إصدار السياسة للمطالبة بمراجعة الموافقة عند التحديثات المهمة.' },
  ],
  en: [
    { id: 'intro', title: 'Introduction', icon: Shield, content: 'TAAMEN is a football match management, team organization, and result tracking application with a local-first approach. It provides a calm, clear football experience focused on privacy and local data.' },
    { id: 'collection', title: 'Information We Collect', icon: Database, content: 'Profile data includes: first name, family name (optional), profile photo, email (optional), phone (optional). All data is stored locally on your device unless explicitly shared.' },
    { id: 'storage', title: 'Local Storage', icon: Lock, content: 'Normal public profile information is primarily stored locally on your device using IndexedDB and localStorage. When browser data is cleared, TAAMEN local data will be deleted. You can export a backup and import it.' },
    { id: 'email', title: 'Email Communication', icon: Mail, content: 'Email is used optionally for support messages and automatic replies. No email is sent automatically without user action. You should only provide an email you are permitted to use.' },
    { id: 'notifications', title: 'Notifications', icon: Bell, content: 'Notifications include: match lifecycle notifications, archive notifications, and local notification behavior. Permission handling is managed through the browser.' },
    { id: 'sharing', title: 'Sharing & Privacy', icon: Users, content: 'Sharing is user-initiated. Shared content should be previewed before importing. Recipients must explicitly confirm import. Shared data does NOT silently overwrite existing local data.' },
    { id: 'security', title: 'Security', icon: Shield, content: 'Reasonable client-side protection is provided, but there is no guarantee of absolute security. Browser/device security matters. No passwords are stored for the normal local profile.' },
    { id: 'deletion', title: 'Data Deletion', icon: Database, content: 'Users can: edit profile, export/backup, delete/reset local data. Reset deletes all TAAMEN local data.' },
    { id: 'changes', title: 'Policy Changes', icon: Clock, content: 'Policies may change over time. Policy versioning is used to require consent review on significant updates.' },
  ]
};

const termsSections = {
  ar: [
    { id: 'intro', title: 'مقدمة', icon: FileText, content: 'شروط وأحكام استخدام TAAMEN تنظم استخدامك للتطبيق وتوضح المسؤوليات والمحدوديات.' },
    { id: 'acceptable-use', title: 'الاستخدام المقبول', icon: Users, content: 'تطبيق لإدارة مباريات كرة القدم محليًا. مسؤوليتك عن البيانات التي تختار تقديمها. عدم استخدام التطبيق لأغراض غير مقصودة.' },
    { id: 'user-responsibility', title: 'مسؤولية المستخدم', icon: Shield, content: 'أنت مسؤول عن الحفاظ على سرية معلوماتك. عدم مشاركة معلومات حساسة دون موافقة صريحة.' },
    { id: 'limitations', title: 'المحدوديات', icon: AlertTriangle, content: 'التطبيق مقدم "كما هو" دون ضمانات. لا يوجد ضمان بالأمان المطلق. يجب التعامل مع الروابط المشتركة بحذر.' },
    { id: 'data', title: 'البيانات', icon: Database, content: 'يمكنك تعديل ملفك وحذف بياناتك المحلية. إعادة التعيين تحذف جميع بيانات TAAMEN المحلية.' },
    { id: 'updates', title: 'التحديثات', icon: Clock, content: 'قد يتم تحديث الشروط والأحكام بمرور الوقت. الاستخدام المستمر يعني الموافقة على التحديثات.' },
  ],
  en: [
    { id: 'intro', title: 'Introduction', icon: FileText, content: 'TAAMEN Terms & Conditions govern your use of the application and clarify responsibilities and limitations.' },
    { id: 'acceptable-use', title: 'Acceptable Use', icon: Users, content: 'Football match management application for local use. You are responsible for data you choose to provide. Do not use the application for unintended purposes.' },
    { id: 'user-responsibility', title: 'User Responsibility', icon: Shield, content: 'You are responsible for maintaining the confidentiality of your information. Do not share sensitive information without explicit consent.' },
    { id: 'limitations', title: 'Limitations', icon: AlertTriangle, content: 'The application is provided "as is" without warranties. No guarantee of absolute security. Treat shared links carefully.' },
    { id: 'data', title: 'Data', icon: Database, content: 'You can edit your profile and delete your local data. Reset deletes all TAAMEN local data.' },
    { id: 'updates', title: 'Updates', icon: Clock, content: 'Terms & Conditions may be updated over time. Continued use indicates acceptance of updates.' },
  ]
};

export default function PrivacyPolicyModal({ language, onClose, initialDocument = 'privacy' }: PrivacyPolicyModalProps) {
  const ar = language === 'ar';
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocument);
  const [activeSection, setActiveSection] = useState<string>('intro');

  const sections = documentType === 'privacy' ? privacySections[language] : termsSections[language];
  const title = documentType === 'privacy' 
    ? (ar ? 'سياسة الخصوصية' : 'Privacy Policy')
    : (ar ? 'الشروط والأحكام' : 'Terms & Conditions');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="overlay legal-overlay" role="dialog" aria-modal="true" aria-label={title}>
      <button className="overlay-backdrop" aria-label="close" onClick={onClose} />
      <aside className="legal-modal">
        <header>
          <div className="legal-header-top">
            <div className="document-switcher">
              <button 
                className={`doc-tab ${documentType === 'privacy' ? 'is-active' : ''}`}
                onClick={() => { setDocumentType('privacy'); setActiveSection('intro'); }}
              >
                <Shield size={16} />
                {ar ? 'الخصوصية' : 'Privacy'}
              </button>
              <button 
                className={`doc-tab ${documentType === 'terms' ? 'is-active' : ''}`}
                onClick={() => { setDocumentType('terms'); setActiveSection('intro'); }}
              >
                <FileText size={16} />
                {ar ? 'الشروط' : 'Terms'}
              </button>
            </div>
            <button className="icon-button" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
          <div>
            <h1>{title}</h1>
            <p className="document-subtitle">
              {ar ? 'آخر تحديث: ' : 'Last updated: '}
              {new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
            </p>
          </div>
        </header>

        <div className="legal-body">
          <nav className="legal-toc">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  className={`toc-item ${activeSection === section.id ? 'is-active' : ''}`}
                  onClick={() => scrollToSection(section.id)}
                >
                  <Icon size={14} />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="legal-content">
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <section key={section.id} id={`section-${section.id}`} className="legal-section">
                  <div className="section-header">
                    <Icon size={20} />
                    <h2>{section.title}</h2>
                  </div>
                  <p>{section.content}</p>
                </section>
              );
            })}
          </div>
        </div>

        <footer>
          <div className="policy-version">
            <Shield size={14} />
            <span>Version {POLICY_VERSION}</span>
          </div>
          <button className="primary-action" onClick={onClose}>
            {ar ? 'إغلاق' : 'Close'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
