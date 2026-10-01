import '../../styles/admin.css';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CalendarDays, Check, Clock3, Laptop, Shield, UsersRound } from 'lucide-react';
import apiClient from '../../api/apiClient';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import UserAvatar from '../../components/common/UserAvatar';

function formatDate(value) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : '—';
}

function describeDevice(userAgent = '') {
  const browser = /Edg\//.test(userAgent) ? 'Microsoft Edge' : /Firefox\//.test(userAgent) ? 'Firefox' : /Chrome\//.test(userAgent) ? 'Chrome' : /Safari\//.test(userAgent) ? 'Safari' : 'Web browser';
  const platform = /iPhone|iPad/.test(userAgent) ? 'iPhone / iPad' : /Android/.test(userAgent) ? 'Android' : /Windows/.test(userAgent) ? 'Windows' : /Mac OS/.test(userAgent) ? 'macOS' : 'Unknown device';
  return `${browser} on ${platform}`;
}

export default function UserDetails() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [role, setRole] = useState('user');
  const [isLoading, setIsLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    if (!notice) return undefined;

    const timeoutId = window.setTimeout(() => setNotice(''), 5000);
    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  const loadUser = useCallback(async () => {
    try {
      const response = await apiClient.get(`/admin/users/${userId}`);
      setUser(response.data.user);
      setSessions(response.data.sessions || []);
      setRole(response.data.user.role);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load this user.');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    apiClient.get(`/admin/users/${userId}`)
      .then((response) => {
        if (cancelled) return;
        setUser(response.data.user);
        setSessions(response.data.sessions || []);
        setRole(response.data.user.role);
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.response?.data?.message || 'Unable to load this user.');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  const updateRole = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
      setUser((current) => ({ ...current, ...response.data.user }));
      setNotice('User role updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update this user role.');
    } finally {
      setBusy(false);
    }
  };

  const requestRoleUpdate = (event) => {
    event.preventDefault();
    setConfirmation({
      title: 'Update user role?',
      message: `Change ${name || user.email}'s role from ${user.role} to ${role}?`,
      confirmLabel: 'Update role',
      tone: 'primary',
      onConfirm: updateRole,
    });
  };

  const updateStatus = async (nextStatus) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await apiClient.patch(`/admin/users/${userId}/status`, { status: nextStatus });
      setUser((current) => ({ ...current, ...response.data.user }));
      setNotice(response.data.message);
      if (nextStatus === 'suspended') await loadUser();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update account status.');
    } finally {
      setBusy(false);
    }
  };

  const requestStatusUpdate = () => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const suspending = nextStatus === 'suspended';
    setConfirmation({
      title: suspending ? 'Suspend this account?' : 'Reactivate this account?',
      message: suspending
        ? `${name || user.email} will be blocked from signing in, and their active sessions will be revoked.`
        : `${name || user.email} will be able to sign in again.`,
      confirmLabel: suspending ? 'Suspend account' : 'Reactivate account',
      tone: suspending ? 'danger' : 'primary',
      onConfirm: () => updateStatus(nextStatus),
    });
  };

  const revokeSessions = async () => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      const response = await apiClient.delete(`/admin/users/${userId}/sessions`);
      setNotice(`${response.data.revokedCount} active session(s) revoked.`);
      await loadUser();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to revoke this user’s sessions.');
    } finally {
      setBusy(false);
    }
  };

  const confirmRevokeSessions = () => setConfirmation({
    title: 'Revoke all sessions?',
    message: `All active sessions for ${name || user.email} will be signed out.`,
    confirmLabel: 'Revoke sessions',
    onConfirm: revokeSessions,
  });

  const confirmPendingAction = () => {
    const action = confirmation?.onConfirm;
    setConfirmation(null);
    action?.();
  };

  const activeSessions = sessions.filter((session) => !session.revokedAt && new Date(session.expiresAt) > new Date());
  const name = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '';

  if (isLoading) return <div className="account-page"><div className="sessions-empty">Loading user details…</div></div>;
  if (!user) return <div className="account-page"><div className="account-alert account-alert--error">{error || 'User not found.'}</div><Link to="/admin/users" className="admin-back-link"><ArrowLeft size={15} /> Back to User Management</Link></div>;

  return (
    <div className="account-page user-details-page">
      <Link to="/admin/users" className="admin-back-link"><ArrowLeft size={15} /> Back to User Management</Link>
      {error && <div className="account-alert account-alert--error">{error}</div>}
      {notice && <div className="account-alert account-alert--success"><Check size={16} />{notice}</div>}
      <header className="user-details-heading"><div><h1>User Details</h1><p>View and manage this user&apos;s account.</p></div><strong>User ID: #{String(user._id).slice(-6)}</strong></header>

      <section className="user-detail-identity account-panel"><UserAvatar user={user} className="admin-user-avatar admin-user-avatar--large" /><div><h2>{name || user.email} <span className={`admin-role-badge admin-role-badge--${user.role}`}>{user.role}</span><span className={`admin-status-badge admin-status-badge--${user.status}`}>● {user.status}</span></h2><p>@{user.userName} | {user.email}</p></div><div className="user-detail-identity__date"><small>MEMBER SINCE</small><b>{formatDate(user.createdAt)}</b></div></section>

      <div className="user-controls-grid">
        <section className="account-panel"><div className="account-panel__heading"><div><h2><UsersRound size={16} /> Account Role</h2><p>Change the user&apos;s access level in this system.</p></div><span className="admin-role-badge admin-role-badge--current">Current: {user.role}</span></div><form className="user-role-form" onSubmit={requestRoleUpdate}><label htmlFor="user-role">Select Role</label><select id="user-role" value={role} onChange={(event) => setRole(event.target.value)}><option value="user">User</option><option value="admin">Admin</option></select><small>You cannot remove your own admin access while signed in.</small><button className="btn btn--primary" type="submit" disabled={busy || role === user.role}><Check size={14} /> Update Role</button></form></section>
        <section className="account-panel"><div className="account-panel__heading"><div><h2><Shield size={16} /> Account Status</h2><p>Control whether this user can log in and access the application.</p></div><span className={`admin-status-badge admin-status-badge--${user.status}`}>● {user.status}</span></div><div className="user-signin-state"><span>Sign-in Status</span><b>{user.status === 'active' ? 'Authorized' : 'Blocked'}</b></div><p className="user-status-help">Suspending the account immediately blocks sign-in across all devices.</p><button className={`btn ${user.status === 'active' ? 'btn--danger-soft' : 'btn--primary'} user-status-action`} onClick={requestStatusUpdate} disabled={busy}><Shield size={14} /> {user.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}</button></section>
      </div>

      <section className="account-panel user-sessions-panel"><div className="account-panel__heading"><div><h2>User Sessions</h2><p>Active and previous login sessions.</p></div><button className="btn btn--danger-outline" onClick={confirmRevokeSessions} disabled={busy || activeSessions.length === 0}>Revoke All Sessions</button></div><div className="user-sessions-list">{sessions.length === 0 ? <p className="sessions-empty">No session history.</p> : sessions.map((session) => {
        const active = !session.revokedAt && new Date(session.expiresAt) > new Date();
        return <div className={`user-session-row${active ? '' : ' user-session-row--ended'}`} key={session._id}><span className="user-session-row__icon"><Laptop size={16} /></span><div><b>{describeDevice(session.userAgent)}</b><small>IP: {session.ipAddress || 'Unavailable'} | {formatDate(session.createdAt)}</small></div><span className={active ? 'session-active' : 'session-ended'}>{active ? 'Active' : 'Ended'}</span></div>;
      })}</div></section>

      <section className="user-danger-zone"><div><h2><AlertTriangle size={15} /> Account Actions</h2><p>Immediate administrative changes for {name || user.email}.</p></div><button className="btn btn--danger-outline" onClick={requestStatusUpdate} disabled={busy || user.status === 'suspended'}>Suspend Account</button><button className="btn btn--secondary" onClick={confirmRevokeSessions} disabled={busy || activeSessions.length === 0}>Revoke All Sessions</button></section>
      <div className="user-detail-meta"><span><CalendarDays size={14} /> Joined {formatDate(user.createdAt)}</span><span><Clock3 size={14} /> {activeSessions.length} active session(s)</span></div>
      {confirmation && <ConfirmDialog isOpen title={confirmation.title} message={confirmation.message} confirmLabel={confirmation.confirmLabel} tone={confirmation.tone} onConfirm={confirmPendingAction} onCancel={() => setConfirmation(null)} />}
    </div>
  );
}
