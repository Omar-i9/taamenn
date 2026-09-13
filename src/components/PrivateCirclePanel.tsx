import { useEffect, useState } from 'react';
import { KeyRound, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { api, type CircleNotification, type CircleStatistic, type Session } from '../services/apiClient';

/**
 * Private Circle authentication and summary.
 *
 * Signing in here produces a password session, which is a different authorization
 * scope from Featured Member recognition. All Circle data is fetched from
 * scope-specific endpoints and is never written to local storage.
 */
export default function PrivateCirclePanel({
  language,
  session,
  onSession,
  onSignOut,
}: {
  language: 'ar' | 'en';
  session: Session | null;
  onSession: (session: Session) => void;
  onSignOut: () => void;
}) {
  const ar = language === 'ar';
  const authenticated = session?.authMethod === 'password';

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [players, setPlayers] = useState(0);
  const [matches, setMatches] = useState(0);
  const [top, setTop] = useState<CircleStatistic[]>([]);
  const [notices, setNotices] = useState<CircleNotification[]>([]);

  useEffect(() => {
    if (!authenticated) {
      setPlayers(0);
      setMatches(0);
      setTop([]);
      setNotices([]);
      return;
    }
    let active = true;
    // Held in component state only: private responses never reach IndexedDB.
    Promise.all([api.circlePlayers(), api.circleMatches(), api.circleStatistics(), api.circleNotifications()])
      .then(([playerRows, matchRows, stats, noticeRows]) => {
        if (!active) return;
        setPlayers(playerRows.length);
        setMatches(matchRows.length);
        setTop(stats.slice(0, 5));
        setNotices(noticeRows.slice(0, 5));
      })
      .catch(() => {
        if (active) setError(ar ? 'تعذر تحميل بيانات الدائرة الخاصة.' : 'Private Circle data could not be loaded.');
      });
    return () => { active = false; };
  }, [authenticated, ar]);

  const submit = async () => {
    if (!name.trim() || !password) {
      setError(ar ? 'أدخل الاسم وكلمة المرور.' : 'Enter your name and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const next = await api.login(name.trim(), password);
      setPassword('');
      setName('');
      onSession(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (ar ? 'تعذر الدخول.' : 'Sign-in failed.'));
    } finally {
      setBusy(false);
    }
  };

  return <section className="panel settings-panel">
    <div className="panel-heading">
      <div>
        <p className="eyebrow">PRIVATE CIRCLE</p>
        <h2>{authenticated ? (ar ? 'الدائرة الخاصة' : 'Private Circle') : (ar ? 'دخول الدائرة الخاصة' : 'Private Circle sign-in')}</h2>
      </div>
      {authenticated ? <ShieldCheck size={18} /> : <Lock size={18} />}
    </div>

    {error && <div className="error-banner" role="alert">{error}</div>}

    {authenticated && session ? <>
      <div className="featured-active">
        <strong>{ar ? (session.member.arabicName || session.member.displayName) : session.member.displayName}</strong>
        <span>{session.member.role === 'OWNER' ? (ar ? 'مالك' : 'Owner') : (ar ? 'عضو' : 'Member')}</span>
      </div>
      <div className="setting-row"><span>{ar ? 'اللاعبون' : 'Players'}</span><span className="status-chip">{players}</span></div>
      <div className="setting-row"><span>{ar ? 'المباريات الخاصة' : 'Private matches'}</span><span className="status-chip">{matches}</span></div>
      {top.length > 0 && <div className="reset-scope">
        <strong>{ar ? 'أعلى التقييمات' : 'Top rated'}</strong>
        <ul>{top.map(row => <li key={row.playerId}>
          {row.displayName} — {row.averageRating === null ? (ar ? 'بدون تقييم' : 'no rating') : row.averageRating.toFixed(1)}
        </li>)}</ul>
      </div>}
      {notices.length > 0 && <div className="reset-scope">
        <strong>{ar ? 'إشعارات الدائرة' : 'Circle notices'}</strong>
        <ul>{notices.map(notice => <li key={notice.id}>{ar ? (notice.titleAr || notice.title) : notice.title}</li>)}</ul>
      </div>}
      <button className="dark-action" onClick={onSignOut}><LogOut size={15} />{ar ? 'خروج' : 'Sign out'}</button>
    </> : <>
      <p>{ar
        ? 'الدائرة الخاصة تتطلب كلمة مرور. هذا نطاق صلاحيات مختلف عن التعرف على العضو المميز.'
        : 'The Private Circle requires a password. This is a different authorization scope from Featured Member recognition.'}</p>
      <label>{ar ? 'الاسم' : 'Name'}
        <input value={name} onChange={e => setName(e.target.value)} autoComplete="username" spellCheck={false} />
      </label>
      <label>{ar ? 'كلمة المرور' : 'Password'}
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !busy && submit()}
          autoComplete="current-password"
        />
      </label>
      <button className="primary-action" disabled={busy} onClick={submit}>
        <KeyRound size={15} />{busy ? (ar ? 'جارٍ الدخول…' : 'Signing in…') : (ar ? 'دخول' : 'Sign in')}
      </button>
    </>}
  </section>;
}
