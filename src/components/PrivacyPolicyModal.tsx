import { useEffect, useRef, useState } from 'react';
import { X, Shield, FileText, Lock, Database, Mail, Bell, Users, Clock, AlertTriangle } from 'lucide-react';
import { POLICY_VERSION } from '../config/consent';
import { uiCopy } from '../i18n/translations';
import { useOverlayPresence } from '../motion/useOverlayPresence';

type Language = 'ar' | 'en';
type DocumentType = 'privacy' | 'terms';

const POLICY_PUBLISHED = '2026-09-15';

interface PrivacyPolicyModalProps {
  language: Language;
  onClose: () => void;
  initialDocument?: DocumentType;
  requireAccept?: boolean;
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
    { id: 'intro', title: 'مقدمة', icon: Shield, content: 'TAAMEN تطبيق محلي-أولًا لإدارة مباريات كرة القدم على جهازك. الاستخدام العادي لا يتطلب حسابًا ولا كلمة مرور. تعرّف العضو المميز اختياري ويقتصر على سجل تاريخي للقراءة فقط.' },
    { id: 'collection', title: 'البيانات التي تبقى على جهازك', icon: Database, content: 'يحفظ TAAMEN محليًا: الاسم، الصورة والغلاف إن اخترتهما، البريد والهاتف إن أدخلتهما، المباريات والسجل، الخطط التكتيكية، الإشعارات، ولقطات الملعب. هذه البيانات تعيش في متصفحك (IndexedDB وlocalStorage) ولا تُرفع إلى حساب مستخدم عام.' },
    { id: 'storage', title: 'التخزين المحلي والنسخ الاحتياطي', icon: Lock, content: 'مسح بيانات المتصفح يحذف بيانات TAAMEN المحلية. يمكنك تصدير نسخة احتياطية واستيرادها على هذا الجهاز أو جهاز آخر. الملفات غير الصالحة تُرفض قبل أي كتابة حتى لا تُفسَد بياناتك الحالية.' },
    { id: 'email', title: 'رسائل الدعم', icon: Mail, content: 'عند إرسال رسالة من صفحة الدعم تُمرَّر عبر خادم TAAMEN إلى قناة التواصل الرسمية. المستلم يحدده الخادم، وليس النموذج. لا يُرسل بريد تلقائي دون إجراء منك. البريد في الملف اختياري ولا يُضمَّن في روابط المشاركة.' },
    { id: 'notifications', title: 'الإشعارات', icon: Bell, content: 'إشعارات دورة حياة المباراة محلية داخل التطبيق. إن أوقفت الإشعارات من الإعدادات فلن تُسجَّل أحداث جديدة ولن تُستهلك حتى لا تضيع عند إعادة التفعيل. أذونات نظام التشغيل إن وُجدت تُدار عبر المتصفح.' },
    { id: 'sharing', title: 'المشاركة', icon: Users, content: 'مشاركة المباراة اختيارية ومن إنشاء المستخدم. الرابط يحمل هوية المباراة وبصمة المحتوى، لا البريد ولا الهاتف ولا صورة الملف. السماح بالحفظ إذن داخل التطبيق وليس قفلًا تشفيريًا. الاستيراد لا يستبدل مباراة موجودة صامتًا: إن كانت نفس المباراة محدّثة تُعرض خيارات الإبقاء أو الاستبدال، وإن تصادف المعرّف مع أصل مختلف تُحفظ كنسخة جديدة فقط بعد تأكيدك.' },
    { id: 'featured', title: 'العضو المميز والسجل التاريخي', icon: Users, content: 'رمز العضو المميز معرّف للتعرّف وليس كلمة مرور. الجلسة تبقى على الخادم في ملف تعريف ارتباط HttpOnly وتفتح سجلًا تاريخيًا للقراءة فقط. لا توجد مساحة أعضاء محمية بكلمة مرور.' },
    { id: 'security', title: 'الأمان', icon: Shield, content: 'الحماية من جانب العميل معقولة وليست ضمانًا مطلقًا. أمان الجهاز والمتصفح مهم. لا تُخزَّن كلمات مرور للملف المحلي العادي. لا تضع أسرارًا في روابط المشاركة.' },
    { id: 'deletion', title: 'الحذف', icon: Database, content: 'يمكنك تعديل الملف، تصدير البيانات، أو إعادة ضبط TAAMEN لحذف كل بياناته المحلية من هذا المتصفح. إعادة الضبط لا تمسح مواقع أخرى ولا سجل المتصفح.' },
    { id: 'changes', title: 'التغييرات', icon: Clock, content: 'عند تغيير هذه النصوص جوهريًا يُرفع رقم الإصدار ويُطلب قبول جديد قبل المتابعة.' },
  ],
  en: [
    { id: 'intro', title: 'Introduction', icon: Shield, content: 'TAAMEN is a local-first football match workspace on your device. Ordinary use needs no account and no password. Featured Member recognition is optional and opens a read-only historical record.' },
    { id: 'collection', title: 'What stays on your device', icon: Database, content: 'TAAMEN stores locally: your name, photo and cover if you add them, optional email and phone, matches and archive, tactical plans, notifications, and pitch captures. This lives in your browser (IndexedDB and localStorage) and is not uploaded to a general-user account.' },
    { id: 'storage', title: 'Local storage and backups', icon: Lock, content: 'Clearing browser data deletes local TAAMEN data. You can export a backup and import it on this device or another. Malformed backup files are rejected before any write so your current data is not damaged.' },
    { id: 'email', title: 'Support messages', icon: Mail, content: 'Messages from the Support page are posted to the TAAMEN backend, which owns the official EmailJS destination. This form cannot choose the recipient. No email is sent without your action. Profile email is optional and is never included in share links.' },
    { id: 'notifications', title: 'Notifications', icon: Bell, content: 'Match lifecycle notices are in-app and local. If you turn notifications off in Settings, new events are not recorded and are not consumed, so they can still appear after you turn notices back on. Operating-system permission, if any, is handled by the browser.' },
    { id: 'sharing', title: 'Sharing', icon: Users, content: 'Match sharing is user-initiated. The link carries match identity and a content fingerprint — not email, phone, or profile photos. Allow-save is an application permission, not a cryptographic lock. Import never silently overwrites: the same match with newer content offers Keep or Replace; an ID collision with a different origin can only be saved as a new local copy after you confirm.' },
    { id: 'featured', title: 'Featured Member and historical records', icon: Users, content: 'The Featured Member identifier is recognition, not a password. The session lives in an HttpOnly cookie on the server and opens a read-only historical archive. There is no password-protected member workspace.' },
    { id: 'security', title: 'Security', icon: Shield, content: 'Client-side protection is reasonable, not absolute. Device and browser security matter. No passwords are stored for the ordinary local profile. Do not put secrets in share links.' },
    { id: 'deletion', title: 'Deletion', icon: Database, content: 'You can edit your profile, export data, or reset TAAMEN to delete all of its local data from this browser. Reset does not erase other sites or browser history.' },
    { id: 'changes', title: 'Policy changes', icon: Clock, content: 'When this text changes in a material way, the policy version is raised and a new acceptance is required before you continue.' },
  ]
};

const termsSections = {
  ar: [
    { id: 'intro', title: 'مقدمة', icon: FileText, content: 'باستخدام TAAMEN توافق على استخدامه كأداة محلية لإدارة مباريات كرة القدم، وعلى أن البيانات العادية تبقى على جهازك ما لم تشاركها أو ترسل رسالة دعم.' },
    { id: 'acceptable-use', title: 'الاستخدام المقبول', icon: Users, content: 'استخدم التطبيق لإدارة مبارياتك وخططك. لا تستخدمه لانتحال الهوية أو إرسال محتوى مسيء عبر الدعم أو مشاركة بيانات لا يحق لك نشرها.' },
    { id: 'user-responsibility', title: 'مسؤوليتك', icon: Shield, content: 'أنت مسؤول عن ما تُدخله وتشاركه. روابط المشاركة يمكن لأي حامل لها عرض المحتوى؛ تعامل معها كروابط عامة. السماح بالحفظ لا يمنع لقطة شاشة.' },
    { id: 'limitations', title: 'المحدوديات', icon: AlertTriangle, content: 'يُقدَّم التطبيق كما هو. لا ضمان لاستمرارية الجهاز أو المتصفح أو النسخ الاحتياطي. السجل التاريخي للعضو المميز للقراءة فقط ويعتمد على توفر الخادم.' },
    { id: 'data', title: 'البيانات', icon: Database, content: 'يمكنك تصدير بياناتك أو حذفها بإعادة الضبط. الاستيراد يرفض الملفات التالفة قبل الكتابة. مشاركة المباراة لا تنشئ حسابًا على الخادم.' },
    { id: 'updates', title: 'التحديثات', icon: Clock, content: 'قد تتحدث الشروط مع إصدارات التطبيق. الاستمرار بعد رفع رقم الموافقة يعني القبول.' },
  ],
  en: [
    { id: 'intro', title: 'Introduction', icon: FileText, content: 'By using TAAMEN you agree to use it as a local football workspace, and that ordinary data stays on your device unless you share a match or send a support message.' },
    { id: 'acceptable-use', title: 'Acceptable use', icon: Users, content: 'Use the app to manage your matches and plans. Do not impersonate others, abuse Support, or share information you are not allowed to publish.' },
    { id: 'user-responsibility', title: 'Your responsibility', icon: Shield, content: 'You are responsible for what you enter and share. Anyone with a share link can view that content; treat links as public. Allow-save does not prevent screenshots.' },
    { id: 'limitations', title: 'Limitations', icon: AlertTriangle, content: 'The application is provided as is. There is no warranty that your device, browser, or backups will persist. Featured historical records are read-only and depend on the server being available.' },
    { id: 'data', title: 'Data', icon: Database, content: 'You can export your data or delete it with Reset. Import rejects malformed files before writing. Sharing a match does not create a server account.' },
    { id: 'updates', title: 'Updates', icon: Clock, content: 'These terms may change with application releases. Continuing after a consent-version bump means you accept the update.' },
  ]
};

export default function PrivacyPolicyModal({ language, onClose, initialDocument = 'privacy', requireAccept = false }: PrivacyPolicyModalProps) {
  const copy = uiCopy[language];
  const [documentType, setDocumentType] = useState<DocumentType>(initialDocument);
  const [activeSection, setActiveSection] = useState<string>('intro');
  const dialogRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { backdropRef, panelRef, requestClose } = useOverlayPresence<HTMLButtonElement, HTMLElement>(
    'modal',
    onClose,
    true,
    { closeOnEscape: !requireAccept },
  );

  const accept = () => {
    recordConsent();
    requestClose();
  };

  const sections = documentType === 'privacy' ? privacySections[language] : termsSections[language];
  const title = documentType === 'privacy' ? copy.privacyPolicyTitle : copy.termsTitle;
  const published = new Date(`${POLICY_PUBLISHED}T00:00:00`).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-GB', { dateStyle: 'medium' });

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [initialDocument]);

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = contentRef.current?.querySelector(`#section-${sectionId}`);
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="overlay legal-overlay" role="presentation">
      <button ref={backdropRef} className="overlay-backdrop" aria-label={copy.closeViewer} onClick={requireAccept ? undefined : requestClose} />
      <aside
        ref={node => { dialogRef.current = node; panelRef.current = node; }}
        className="legal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="legal-modal-title"
        tabIndex={-1}
      >
        <header>
          <div className="legal-header-top">
            <div className="document-switcher">
              <button
                type="button"
                className={`doc-tab ${documentType === 'privacy' ? 'is-active' : ''}`}
                onClick={() => { setDocumentType('privacy'); setActiveSection('intro'); }}
              >
                <Shield size={16} />
                {copy.privacyTab}
              </button>
              <button
                type="button"
                className={`doc-tab ${documentType === 'terms' ? 'is-active' : ''}`}
                onClick={() => { setDocumentType('terms'); setActiveSection('intro'); }}
              >
                <FileText size={16} />
                {copy.termsTab}
              </button>
            </div>
            {!requireAccept && (
              <button type="button" className="icon-button" onClick={requestClose} aria-label={copy.closeViewer}>
                <X size={18} />
              </button>
            )}
          </div>
          <div>
            <h1 id="legal-modal-title">{title}</h1>
            <p className="document-subtitle">
              {copy.lastUpdated} {published}
            </p>
          </div>
        </header>

        <div className="legal-body">
          <nav className="legal-toc" aria-label={title}>
            {sections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  type="button"
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

          <div className="legal-content" ref={contentRef}>
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
          <button type="button" className="primary-action" onClick={requireAccept ? accept : requestClose}>
            {requireAccept ? copy.consentAcceptContinue : copy.closeViewer}
          </button>
        </footer>
      </aside>
    </div>
  );
}
