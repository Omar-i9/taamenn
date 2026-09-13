import { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, LogIn } from 'lucide-react';
import { api, type Session } from '../services/apiClient';

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
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const value = code.trim();
    if (!value) {
      setError(ar ? 'أدخل معرّف العضو.' : 'Enter the member identifier.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const session = await api.recognizeMember(value);
      onRecognized(session);
    } catch (caught) {
      setError(caught instanceof Error
        ? caught.message
        : (ar ? 'تعذر التحقق الآن.' : 'Verification is unavailable right now.'));
    } finally {
      setBusy(false);
    }
  };

  return <section className="page-content featured-page">
    <div className="featured-entry panel">
      <p className="eyebrow">TAAMEN / FEATURED MEMBER</p>
      <div className="panel-heading featured-login-heading">
        <div>
          <h1>{ar ? 'دخول أعضاء TAAMEN' : 'TAAMEN member access'}</h1>
          <p className="subtitle">{ar ? 'أدخل معرّف العضو.' : 'Enter your member identifier.'}</p>
        </div>
        <BadgeCheck size={18} />
      </div>
      <label className="featured-code-label">{ar ? 'معرّف العضو' : 'Member identifier'}
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !busy && submit()}
          placeholder="user#****"
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
