import { useRef, useState } from 'react';
import { ChevronLeft, Globe2, ImagePlus, Trash2, AlertCircle, ChevronDown } from 'lucide-react';
import type { LocalProfile } from '../services/profileRepository';
import { imageFileToDataUrl } from '../services/imageProcessing';
import { TAAMEN_LOGO_ALT, TAAMEN_LOGO_SRC } from '../config/branding';
import PrivacyPolicyModal, { recordConsent } from './PrivacyPolicyModal';

type Draft = Omit<LocalProfile, 'id' | 'updatedAt' | 'bannerData'>;
const empty: Draft = { firstName: '', lastName: '', email: '', phone: '', avatarData: '', emailVerified: false };

export function ProfileSetup({ language, onSave, onLanguage }: { language: 'ar' | 'en'; onSave: (p: Draft) => void; onLanguage: () => void }) {
  const ar = language === 'ar';
  const [p, setP] = useState<Draft>(empty);
  const [consentChecked, setConsentChecked] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms'>('privacy');
  const [consentError, setConsentError] = useState(false);
  const avatarRef = useRef<HTMLInputElement>(null);
  
  const update = (k: keyof Draft, v: string | boolean) => setP(x => ({ ...x, [k]: v }));
  
  const image = async (file?: File) => {
    if (!file) return;
    try {
      const data = await imageFileToDataUrl(file, { maxWidth: 900, maxHeight: 900, quality: 0.82 });
      update('avatarData', data);
    } catch {}
  };
  
  const initials = `${p.firstName.slice(0, 1)}${p.lastName.slice(0, 1)}`.trim().toUpperCase() || '?';
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!p.firstName.trim()) return;
    if (!consentChecked) {
      setConsentError(true);
      return;
    }
    recordConsent();
    onSave({ ...p, firstName: p.firstName.trim(), lastName: p.lastName.trim(), email: p.email.trim(), phone: p.phone.trim() });
  };
  
  const handleConsentChange = (checked: boolean) => {
    setConsentChecked(checked);
    if (checked) setConsentError(false);
  };

  return (
    <main className="profile-entry">
      {showPolicy && <PrivacyPolicyModal language={language} initialDocument={legalDoc} onClose={() => setShowPolicy(false)} />}
      <div className="entry-container">
        <button className="language-button mobile-language" onClick={onLanguage}>
          <Globe2 size={14} />
          {ar ? 'EN' : 'AR'}
        </button>
        <div className="entry-content">
          <div className="mobile-branding">
            <div className="mobile-logo">
              <img src={TAAMEN_LOGO_SRC} alt={TAAMEN_LOGO_ALT} />
            </div>
            <div className="mobile-brand-text">
              <span className="brand-name">TAAMEN</span>
              <span className="brand-version">2.0</span>
            </div>
          </div>
          <form className="profile-form" onSubmit={handleSubmit}>
            <div className="avatar-section">
              <button type="button" className="avatar-circle" onClick={() => avatarRef.current?.click()}>
                {p.avatarData ? <img src={p.avatarData} alt="" /> : initials}
              </button>
              <div className="avatar-desktop-controls">
                <strong>{ar ? 'الصورة الشخصية' : 'Profile photo'}</strong>
                <small>{ar ? 'اختيارية ومحفوظة محليًا' : 'Optional and stored locally'}</small>
                <div className="photo-actions">
                  <button type="button" className="mini-action" onClick={() => avatarRef.current?.click()}>
                    <ImagePlus size={14} />
                    {ar ? 'تغيير' : 'Change'}
                  </button>
                  {p.avatarData && (
                    <button type="button" className="mini-action" onClick={() => update('avatarData', '')}>
                      <Trash2 size={14} />
                      {ar ? 'حذف' : 'Remove'}
                    </button>
                  )}
                </div>
              </div>
              <button type="button" className="avatar-change mobile-only" onClick={() => avatarRef.current?.click()}>
                <ImagePlus size={16} />
              </button>
              {p.avatarData && (
                <button type="button" className="avatar-remove mobile-only" onClick={() => update('avatarData', '')}>
                  <Trash2 size={14} />
                </button>
              )}
              <input ref={avatarRef} hidden type="file" accept="image/*" onChange={e => image(e.target.files?.[0])} />
            </div>
            <label className="form-label">
              {ar ? 'الاسم الأول' : 'First name'}
              <input 
                type="text" 
                required 
                value={p.firstName} 
                onChange={e => update('firstName', e.target.value)} 
                placeholder={ar ? 'أدخل الاسم الأول' : 'Enter first name'}
              />
            </label>
            <label className="form-label">
              {ar ? 'اسم العائلة (اختياري)' : 'Family name (optional)'}
              <input 
                type="text" 
                value={p.lastName} 
                onChange={e => update('lastName', e.target.value)} 
                placeholder={ar ? 'أدخل اسم العائلة' : 'Enter family name'}
              />
            </label>
            <label className="form-label">
              {ar ? 'البريد الإلكتروني (اختياري)' : 'Email (optional)'}
              <input 
                type="email" 
                value={p.email} 
                onChange={e => update('email', e.target.value)} 
                placeholder="name@example.com"
              />
            </label>
            <label className="form-label">
              {ar ? 'رقم الهاتف (اختياري)' : 'Phone (optional)'}
              <input 
                type="tel" 
                value={p.phone} 
                onChange={e => update('phone', e.target.value)} 
                placeholder="+970 5XX XXX XXXX"
              />
            </label>
            <div className={`consent-row ${consentError ? 'consent-error' : ''}`}>
              <input
                type="checkbox"
                checked={consentChecked}
                id="consent-checkbox"
                onChange={(e) => handleConsentChange(e.target.checked)}
              />
              <span className="consent-text">
                <label htmlFor="consent-checkbox" className="consent-label-text">
                  {ar ? 'أوافق على ' : 'I agree to the '}
                </label>
                <button
                  type="button"
                  className="policy-link"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalDoc('privacy');
                    setShowPolicy(true);
                  }}
                >
                  {ar ? 'سياسة الخصوصية' : 'Privacy Policy'}
                </button>
                <label htmlFor="consent-checkbox" className="consent-label-text">
                  {ar ? ' و ' : ' and '}
                </label>
                <button
                  type="button"
                  className="policy-link"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLegalDoc('terms');
                    setShowPolicy(true);
                  }}
                >
                  {ar ? 'الشروط والأحكام' : 'Terms & Conditions'}
                </button>
              </span>
              {consentError && (
                <div className="consent-error-text">
                  <AlertCircle size={12} />
                  {ar ? 'مطلوب الموافقة' : 'Required'}
                </div>
              )}
            </div>
            <button type="submit" className="primary-action mobile-submit" disabled={!p.firstName.trim() || !consentChecked}>
              {ar ? 'متابعة' : 'Continue'}
              <ChevronLeft size={16} />
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
