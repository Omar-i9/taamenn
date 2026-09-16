import { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, LogIn } from 'lucide-react';
import { ApiError, api, type Session } from '../services/apiClient';
import { useFormEntrance } from '../motion/useFormEntrance';
import { uiCopy } from '../i18n/translations';

/**
 * Featured Member recognition.
 *
 * The identifier is verified by the server, which issues a restricted session.
 * No member directory or recognition code exists in the client.
 */
export default function FeaturedMember({
  language,
  onClose,
  onRecognized,
}: {
  language: 'ar' | 'en';
  onClose: () => void;
  onRecognized: (session: Session) => void;
}) {
  const ar = language === 'ar';
  const copy = uiCopy[language];
  const pageRef = useFormEntrance<HTMLElement>();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const value = code.trim();
    if (!value) {
      setError(copy.featuredEnterId);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const session = await api.recognizeMember(value);
      onRecognized(session);
    } catch (caught) {
      const status = caught instanceof ApiError ? caught.status : -1;
      if (status === 0) setError(copy.featuredOffline);
      else if (status === 401) setError(copy.featuredInvalidId);
      else if (status === 429) setError(copy.featuredRateLimited);
      else setError(copy.featuredUnavailable);
    } finally {
      setBusy(false);
    }
  };

  return <section className="page-content featured-page" ref={pageRef}>
    <div className="featured-entry panel">
      <p className="eyebrow">TAAMEN / FEATURED MEMBER</p>
      <div className="panel-heading featured-login-heading">
        <div>
          <h1>{ar ? 'دخول أعضاء TAAMEN' : 'TAAMEN member access'}</h1>
          <p className="subtitle">{copy.featuredEnterId}</p>
        </div>
        <BadgeCheck size={18} />
      </div>
      <label className="featured-code-label">{ar ? 'معرّف العضو' : 'Member identifier'}
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !busy && submit()}
          autoComplete="off"
          spellCheck={false}
          aria-invalid={Boolean(error)}
        />
      </label>
      {error && <div className="error-banner" role="alert">{error}</div>}
      <div className="featured-actions">
        <button className="primary-action" disabled={busy} onClick={submit}>
          <LogIn size={16} />
          {busy ? (ar ? 'جارٍ التحقق…' : 'Checking…') : (ar ? 'دخول' : 'Continue')}
        </button>
        <button className="text-button" onClick={onClose}>
          {ar ? 'إلغاء' : 'Cancel'} {ar ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
        </button>
      </div>
    </div>
  </section>;
}
