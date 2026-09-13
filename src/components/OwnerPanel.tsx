import { useCallback, useEffect, useState } from 'react';
import { Crown, RefreshCw, ShieldOff, ShieldCheck } from 'lucide-react';
import { api, type OwnerOverview } from '../services/apiClient';

const MIN_PASSWORD_LENGTH = 12;

/**
 * Owner administration.
 *
 * Rendering this panel is a convenience, not a control: every action below is
 * re-authorized by the server against the session's own role.
 */
export default function OwnerPanel({ language }: { language: 'ar' | 'en' }) {
  const ar = language === 'ar';
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busyId, setBusyId] = useState('');
  const [resetTarget, setResetTarget] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const load = useCallback(async () => {
    try {
      setOverview(await api.ownerOverview());
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (ar ? 'تعذر التحميل.' : 'Loading failed.'));
    }
  }, [ar]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (memberId: string, active: boolean) => {
    setBusyId(memberId);
    setStatus('');
    try {
      await api.setMemberStatus(memberId, active);
      setStatus(active ? (ar ? 'تم تنشيط العضو.' : 'Member activated.') : (ar ? 'تم إيقاف العضو.' : 'Member deactivated.'));
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (ar ? 'تعذر التنفيذ.' : 'The action failed.'));
    } finally {
      setBusyId('');
    }
  };

  const resetPassword = async () => {
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(ar
        ? `كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل.`
        : `The password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    setBusyId(resetTarget);
    setError('');
    try {
      await api.resetMemberPassword(resetTarget, newPassword);
      setStatus(ar
        ? 'تم تغيير كلمة المرور وإلغاء جلسات العضو.'
        : 'The password was changed and the member\'s sessions were revoked.');
      setResetTarget('');
      setNewPassword('');
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : (ar ? 'تعذر التنفيذ.' : 'The action failed.'));
    } finally {
      setBusyId('');
    }
  };

  return <section className="panel settings-panel">
    <div className="panel-heading">
      <div><p className="eyebrow">OWNER</p><h2>{ar ? 'إدارة المالك' : 'Owner administration'}</h2></div>
      <Crown size={18} />
    </div>

    {error && <div className="error-banner" role="alert">{error}</div>}
    {status && <div className="success-banner">{status}</div>}

    {!overview ? <p>{ar ? 'جارٍ التحميل…' : 'Loading…'}</p> : <>
      <div className="setting-row"><span>{ar ? 'الأعضاء النشطون' : 'Active members'}</span><span className="status-chip">{overview.activeMembers}</span></div>
      <div className="setting-row"><span>{ar ? 'اللاعبون' : 'Players'}</span><span className="status-chip">{overview.players}</span></div>
      <div className="setting-row"><span>{ar ? 'المباريات المؤرشفة' : 'Archived matches'}</span><span className="status-chip">{overview.archivedMatches}</span></div>

      <div className="reset-scope">
        <strong>{ar ? 'الأعضاء' : 'Members'}</strong>
        <ul>{overview.members.map(member => <li key={member.id}>
          <span>{member.displayName} — {member.role}{member.active ? '' : ar ? ' (موقوف)' : ' (inactive)'}</span>
          <button
            className="text-button"
            disabled={busyId === member.id}
            onClick={() => toggleStatus(member.id, !member.active)}
          >
            {member.active ? <><ShieldOff size={13} />{ar ? 'إيقاف' : 'Deactivate'}</> : <><ShieldCheck size={13} />{ar ? 'تنشيط' : 'Activate'}</>}
          </button>
          <button className="text-button" onClick={() => { setResetTarget(member.id); setNewPassword(''); }}>
            <RefreshCw size={13} />{ar ? 'كلمة مرور جديدة' : 'New password'}
          </button>
        </li>)}</ul>
      </div>

      {resetTarget && <div className="verify-box">
        <label>{ar ? 'كلمة المرور الجديدة' : 'New password'}
          <input
            type="password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
          />
        </label>
        <div className="setting-actions">
          <button className="primary-action" disabled={busyId === resetTarget} onClick={resetPassword}>
            {ar ? 'تعيين' : 'Set password'}
          </button>
          <button className="text-button" onClick={() => { setResetTarget(''); setNewPassword(''); }}>
            {ar ? 'إلغاء' : 'Cancel'}
          </button>
        </div>
      </div>}
    </>}
  </section>;
}
