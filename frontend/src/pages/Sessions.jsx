import '../styles/sessions.css';
import { useCallback, useEffect, useState } from 'react';
import { Clock3, Laptop, LogOut, MapPin, Monitor, RotateCcw, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import ConfirmDialog from '../components/common/ConfirmDialog';

function getDevice(userAgent = '') {
  const browser = /Edg\//.test(userAgent) ? 'Microsoft Edge'
    : /Firefox\//.test(userAgent) ? 'Firefox'
      : /Chrome\//.test(userAgent) ? 'Chrome'
        : /Safari\//.test(userAgent) ? 'Safari' : 'Web browser';
  const platform = /iPhone|iPad/.test(userAgent) ? 'iPhone / iPad'
    : /Android/.test(userAgent) ? 'Android'
      : /Windows/.test(userAgent) ? 'Windows'
        : /Mac OS/.test(userAgent) ? 'macOS'
          : /Linux/.test(userAgent) ? 'Linux' : 'Unknown device';
  return { browser, platform, mobile: /iPhone|iPad|Android/.test(userAgent) };
}

function formatDate(value) {
  if (!value) return 'Unknown date';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

export default function Sessions() {
  const { logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const loadSessions = useCallback(async () => {
    try {
      const response = await apiClient.get('/auth/me/sessions');
      setSessions(response.data?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load your sessions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiClient.get('/auth/me/sessions')
      .then((response) => {
        if (!cancelled) setSessions(response.data?.data || []);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.response?.data?.message || 'Unable to load your sessions.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const revokeSession = async (sessionId) => {
    setBusyId(sessionId);
    setError('');
    try {
      await apiClient.delete(`/auth/me/sessions/${sessionId}`);
      await loadSessions();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to revoke this session.');
    } finally {
      setBusyId('');
    }
  };

  const revokeAll = async () => {
    setBusyId('all');
    setError('');
    try {
      await apiClient.delete('/auth/me/sessions');
      await logout();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign out all sessions.');
    } finally {
      setBusyId('');
    }
  };

  const requestRevokeSession = (session, device) => setConfirmation({
    title: 'Revoke this session?',
    message: `This will sign out ${device.browser} on ${device.platform}.`,
    confirmLabel: 'Revoke session',
    tone: 'danger',
    onConfirm: () => revokeSession(session._id),
  });

  const requestRevokeAll = () => setConfirmation({
    title: 'Sign out all sessions?',
    message: 'This will end every active session, including the one on this device.',
    confirmLabel: 'Sign out all',
    tone: 'danger',
    onConfirm: revokeAll,
  });

  const confirmPendingAction = () => {
    const action = confirmation?.onConfirm;
    setConfirmation(null);
    action?.();
  };

  const activeSessions = sessions.filter((session) => !session.revokedAt && new Date(session.expiresAt) > new Date());

  return (
    <div className="account-page sessions-page">
      <section className="sessions-banner"><div><span><ShieldCheck size={15} /> ACCOUNT SECURITY &amp; ACTIVITY</span><h1>Your Sessions</h1><p>See where your account is currently signed in, manage device access, and ensure your account stays protected.</p></div><div className="sessions-banner__state"><span /> <div><small>ACCOUNT STATE</small><b>Protected &amp; Syncing</b></div></div></section>
      {error && <div className="account-alert account-alert--error">{error}</div>}
      <div className="sessions-list-heading"><h2>Active Devices <span>{activeSessions.length} Online</span></h2><button className="btn btn--danger-soft" onClick={requestRevokeAll} disabled={busyId !== '' || activeSessions.length === 0}><LogOut size={14} /> Sign Out of All Sessions</button></div>
      {isLoading ? <div className="sessions-empty">Loading sessions…</div> : sessions.length === 0 ? <div className="sessions-empty">No session history is available.</div> : (
        <div className="sessions-list">
          {sessions.map((session) => {
            const device = getDevice(session.userAgent || '');
            const active = !session.revokedAt && new Date(session.expiresAt) > new Date();
            const isCurrent = session.userAgent === window.navigator.userAgent && active;
            const DeviceIcon = device.mobile ? Smartphone : Laptop;
            return (
              <article className={`session-row${active ? '' : ' session-row--ended'}`} key={session._id}>
                <div className="session-row__icon"><DeviceIcon size={20} /></div>
                <div className="session-row__details"><h3>{device.browser} on {device.platform} {isCurrent && <span className="session-current">This Device</span>} {active && <span className="session-active">Active</span>}</h3><div><span><Monitor size={12} /> IP: {session.ipAddress || 'Unavailable'}</span><span><MapPin size={12} /> Network unavailable</span><span><Clock3 size={12} /> {formatDate(session.createdAt)}</span></div></div>
                {isCurrent ? <span className="session-current-device"><ShieldCheck size={13} /> Current Device</span> : active ? <button className="btn btn--danger-soft" onClick={() => requestRevokeSession(session, device)} disabled={busyId !== ''}><RotateCcw size={13} /> {busyId === session._id ? 'Revoking…' : 'Revoke Session'}</button> : <span className="session-ended"><LogOut size={13} /> Session ended</span>}
              </article>
            );
          })}
        </div>
      )}
      <aside className="sessions-tip"><span><ShieldCheck size={18} /></span><div><strong>Security Tip</strong><p>If you see a device or location you don&apos;t recognize, revoke its session immediately. For extra peace of mind, you can also reset your password to invalidate all historical tokens.</p></div></aside>
      <ConfirmDialog isOpen={Boolean(confirmation)} title={confirmation?.title} message={confirmation?.message} confirmLabel={confirmation?.confirmLabel} tone={confirmation?.tone} onConfirm={confirmPendingAction} onCancel={() => setConfirmation(null)} />
    </div>
  );
}
