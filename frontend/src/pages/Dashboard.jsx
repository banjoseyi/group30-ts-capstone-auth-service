import '../styles/dashboard.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Monitor,
  Key,
  BadgeCheck,
  User,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import overviewIllustration from '../assets/Overview.png';

function StatCard({ label, icon: Icon, children }) {
  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <span className="stat-card__label">{label}</span>
        <div className="stat-card__icon"><Icon size={16} /></div>
      </div>
      {children}
    </div>
  );
}

function QuickAction({ to, icon: Icon, label }) {
  return (
    <Link to={to} className="quick-action">
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [sessionCount, setSessionCount] = useState(null);

  useEffect(() => {
    apiClient.get('/auth/me/sessions')
      .then((res) => {
        const sessions = res.data?.sessions || res.data || [];
        setSessionCount(Array.isArray(sessions) ? sessions.length : null);
      })
      .catch(() => setSessionCount(null));
  }, []);

  const displayName = user?.name || user?.email || 'User';
  const firstName = displayName.split(' ')[0];

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—';

  return (
    <div className="dash-page">
      <div className="dash-page__welcome">
        <h1 className="dash-page__title">Welcome back, {firstName} 👋</h1>
        <p className="dash-page__subtitle">Here&apos;s a quick look at your account.</p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stat-cards">
        <StatCard label="ACCOUNT STATUS" icon={Shield}>
          <div className="stat-card__status">
            <span className="status-pill status-pill--active">● Active</span>
          </div>
          <p className="stat-card__desc">Verified student account</p>
        </StatCard>

        <StatCard label="ACTIVE SESSIONS" icon={Monitor}>
          <p className="stat-card__big">
            {sessionCount !== null ? `${sessionCount} session${sessionCount !== 1 ? 's' : ''}` : '—'}
          </p>
          <p className="stat-card__desc">Laptop &amp; mobile device</p>
        </StatCard>

        <StatCard label="ACCOUNT ROLE" icon={BadgeCheck}>
          <div>
            <span className={`role-badge role-badge--${user?.role === 'admin' ? 'admin' : 'user'}`}>
              {user?.role || 'user'}
            </span>
          </div>
          <p className="stat-card__desc">Full demo access permissions</p>
        </StatCard>
      </div>

      {/* ── Lower Grid ── */}
      <div className="dash-grid">
        {/* Account Details */}
        <div className="detail-card">
          <div className="detail-card__header">
            <div>
              <h2 className="detail-card__title">Account Details</h2>
              <p className="detail-card__subtitle">Current authenticated user profile attributes</p>
            </div>
            <div className="detail-card__icon"><User size={18} /></div>
          </div>

          <table className="detail-table">
            <tbody>
              <tr>
                <td className="detail-table__key">Full Name</td>
                <td className="detail-table__val">{user?.name || '—'}</td>
              </tr>
              <tr>
                <td className="detail-table__key">Username</td>
                <td className="detail-table__val detail-table__val--accent">
                  {user?.username || '—'}
                </td>
              </tr>
              <tr>
                <td className="detail-table__key">Email</td>
                <td className="detail-table__val">{user?.email || '—'}</td>
              </tr>
              <tr>
                <td className="detail-table__key">Member Since</td>
                <td className="detail-table__val">{memberSince}</td>
              </tr>
            </tbody>
          </table>

          <div className="quick-actions">
            <p className="quick-actions__label">QUICK ACTIONS</p>
            <div className="quick-actions__grid">
              <QuickAction to="/profile" icon={User} label="View Profile" />
              <QuickAction to="/security" icon={Key} label="Change Password" />
              <QuickAction to="/sessions" icon={Monitor} label="Manage Sessions" />
            </div>
          </div>
        </div>

        {/* Capstone Info Card */}
        <div className="capstone-card">
          <div className="capstone-card__img-wrap">
            <img className="capstone-card__img" src={overviewIllustration} alt="Secure authentication dashboard on a laptop" />
          </div>

          <div className="capstone-card__body">
            <div className="capstone-card__tags">
              <span className="tag">🏫 Ts Academy</span>
              <span className="tag">🚀 Group 30 Project</span>
            </div>
            <h3 className="capstone-card__title">Student Capstone Demonstration</h3>
            <p className="capstone-card__desc">
              Explore account protection, live session monitoring, and role-based permissions
              designed and tested for our group capstone milestone.
            </p>
            <div className="capstone-card__ready">
              <CheckCircle size={16} />
              <div>
                <p className="capstone-card__ready-title">Capstone Submission Ready</p>
                <p className="capstone-card__ready-sub">All cryptographic safeguards passing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
