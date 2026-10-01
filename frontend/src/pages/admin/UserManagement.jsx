import '../../styles/admin.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, ShieldCheck, UsersRound } from 'lucide-react';
import apiClient from '../../api/apiClient';
import UserAvatar from '../../components/common/UserAvatar';

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—';
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPagination((current) => ({ ...current, page: 1 }));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const loadUsers = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiClient.get('/admin/users', {
          params: { page: pagination.page, limit: 5, search: search || undefined, role: role || undefined, status: status || undefined },
        });
        if (cancelled) return;
        setUsers(response.data?.data || []);
        setPagination(response.data?.pagination || { page: 1, total: 0, totalPages: 1 });
      } catch (requestError) {
        if (!cancelled) setError(requestError.response?.data?.message || 'Unable to load users.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadUsers();
    return () => { cancelled = true; };
  }, [pagination.page, role, search, status]);

  const changePage = (page) => setPagination((current) => ({ ...current, page }));
  const activeCount = users.filter((user) => user.status === 'active').length;
  const firstVisible = pagination.total === 0 ? 0 : (pagination.page - 1) * 5 + 1;
  const lastVisible = Math.min(pagination.page * 5, pagination.total);

  return (
    <div className="account-page admin-users-page">
      <header className="admin-page-heading"><div><span><ShieldCheck size={14} /> ADMIN WORKSPACE</span><h1>User Management</h1><p>Manage users registered on the platform.</p></div><div className="admin-summary"><div><span><UsersRound size={17} /></span><small>Total Directory</small><b>{pagination.total} Users</b></div><div><span className="admin-summary__active"><ShieldCheck size={17} /></span><small>Active on Page</small><b>{activeCount} Active</b></div></div></header>
      {error && <div className="account-alert account-alert--error">{error}</div>}
      <div className="admin-toolbar">
        <label className="admin-search"><Search size={16} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search users by name or email..." aria-label="Search users" /></label>
        <select aria-label="Filter by role" value={role} onChange={(event) => { setRole(event.target.value); changePage(1); }}><option value="">All Roles</option><option value="user">User</option><option value="admin">Admin</option></select>
        <select aria-label="Filter by status" value={status} onChange={(event) => { setStatus(event.target.value); changePage(1); }}><option value="">All Status</option><option value="active">Active</option><option value="suspended">Suspended</option></select>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-users-table">
          <thead><tr><th>User</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Joined Date</th><th>Actions</th></tr></thead>
          <tbody>
            {isLoading ? <tr><td colSpan="7" className="admin-table-message">Loading users…</td></tr> : users.length === 0 ? <tr><td colSpan="7" className="admin-table-message">No users match these filters.</td></tr> : users.map((user) => {
              const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;
              return <tr key={user._id}><td><span className="admin-user-cell"><UserAvatar user={user} className="admin-user-avatar" /><span><b>{name}</b><small>{user.status === 'suspended' ? 'Account suspended' : 'Registered user'}</small></span></span></td><td>@{user.userName}</td><td>{user.email}</td><td><span className={`admin-role-badge admin-role-badge--${user.role}`}>{user.role === 'admin' && <ShieldCheck size={11} />}{user.role}</span></td><td><span className={`admin-status-badge admin-status-badge--${user.status}`}>● {user.status}</span></td><td>{formatDate(user.createdAt)}</td><td><Link className="admin-view-link" to={`/admin/users/${user._id}`}>View Details <ArrowRight size={13} /></Link></td></tr>;
            })}
          </tbody>
        </table>
        <footer className="admin-table-footer"><span>Showing {firstVisible} to {lastVisible} of {pagination.total} users</span><nav aria-label="User pages"><button onClick={() => changePage(pagination.page - 1)} disabled={pagination.page <= 1}>‹ Previous</button>{Array.from({ length: pagination.totalPages }, (_, index) => index + 1).map((page) => <button key={page} className={page === pagination.page ? 'is-current' : ''} onClick={() => changePage(page)}>{page}</button>)}<button onClick={() => changePage(pagination.page + 1)} disabled={pagination.page >= pagination.totalPages}>Next ›</button></nav></footer>
      </div>
    </div>
  );
}
