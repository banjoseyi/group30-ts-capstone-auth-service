import '../styles/dashboard-layout.css';
import '../styles/account-common.css';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  User,
  Shield,
  Monitor,
  Users,
  Bell,
  LogOut,
  Menu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/common/UserAvatar';
import overviewIllustration from '../assets/Overview.png';

function SidebarNavLink({ to, icon: Icon, children, onNavigate }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `sidebar-link${isActive ? ' sidebar-link--active' : ''}`
      }
    >
      <Icon size={17} />
      <span>{children}</span>
    </NavLink>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const displayName = user?.name || user?.email || 'User';

  useEffect(() => {
    if (!drawerOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [drawerOpen]);

  return (
    <div className="dash-layout">
      {/* ── Sidebar ── */}
      <button
        className={`sidebar-overlay${drawerOpen ? ' sidebar-overlay--visible' : ''}`}
        type="button"
        aria-label="Close navigation menu"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={() => setDrawerOpen(false)}
      />
      <aside id="dashboard-sidebar" className={`sidebar${drawerOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar__top">
          <Link to="/dashboard" className="sidebar__brand">
            <span className="sidebar__brand-badge">Ts</span>
            <div>
              <p className="sidebar__brand-name">Group 30 Auth App</p>
              <p className="sidebar__brand-sub">Authentication Project</p>
              <p className="sidebar__brand-link">Built by Group 30</p>
            </div>
          </Link>
        </div>

        <nav className="sidebar__nav">
          <p className="sidebar__nav-label">MAIN NAVIGATION</p>
          <SidebarNavLink to="/dashboard" icon={LayoutDashboard} onNavigate={() => setDrawerOpen(false)}>Overview</SidebarNavLink>
          <SidebarNavLink to="/profile" icon={User} onNavigate={() => setDrawerOpen(false)}>Profile</SidebarNavLink>
          <SidebarNavLink to="/security" icon={Shield} onNavigate={() => setDrawerOpen(false)}>Security</SidebarNavLink>
          <SidebarNavLink to="/sessions" icon={Monitor} onNavigate={() => setDrawerOpen(false)}>Sessions</SidebarNavLink>

          {user?.role === 'admin' && (
            <>
              <p className="sidebar__nav-label sidebar__nav-label--mt">ADMINISTRATION</p>
              <SidebarNavLink to="/admin/users" icon={Users} onNavigate={() => setDrawerOpen(false)}>User Management</SidebarNavLink>
            </>
          )}
        </nav>

        <div className="sidebar__promo">
          <img className="sidebar__promo-image" src={overviewIllustration} alt="" />
          <div className="sidebar__promo-copy">
            <p className="sidebar__promo-title">
              <span>Project Demo</span>
              <span className="sidebar__promo-badge">Group 30</span>
            </p>
            <p className="sidebar__promo-desc">
              Built for TS Capstone — exploring full authentication lifecycles and session controls.
            </p>
          </div>
        </div>

        <div className="sidebar__user">
          <div className="sidebar__user-summary">
            <UserAvatar user={user} className="sidebar__user-avatar" />
            <div className="sidebar__user-info">
              <div className="sidebar__user-identity">
                <p className="sidebar__user-name">{displayName}</p>
                {user?.role && (
                  <span className="role-badge role-badge--sm">{user.role}</span>
                )}
              </div>
              <p className="sidebar__user-email">{user?.email}</p>
            </div>
          </div>
          <button className="sidebar__logout" onClick={handleLogout} title="Log out">
            <LogOut size={15} />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="dash-layout__right">
        {/* Top Bar */}
        <header className="dash-header">
          <button className="dash-header__menu" type="button" aria-label="Open navigation menu" aria-expanded={drawerOpen} aria-controls="dashboard-sidebar" onClick={() => setDrawerOpen(true)}>
            <Menu size={21} />
          </button>
          <div className="dash-header__brand">
            <span className="dash-header__badge">Ts</span>
            <span className="dash-header__title">Group 30 Auth App</span>
          </div>
          <div className="dash-header__right">
            <button className="dash-header__bell" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="dash-header__user">
              <UserAvatar user={user} />
              <div className="dash-header__user-info">
                <p className="dash-header__user-name">{displayName}</p>
                {user?.role && <span className="role-badge">{user.role}</span>}
              </div>
              <span className="dash-header__status"><span className="status-dot status-dot--active" />Active</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="dash-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
