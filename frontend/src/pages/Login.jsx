import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, X, Shield, Users, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import loginIllustration from '../assets/Study desk illustration with secure login screen.png';

function DeskIllustration() {
  return (
    <img className="auth-panel__illustration" src={loginIllustration} alt="Study desk with a secure login screen" />
  );
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar variant="login" />

      <div className="auth-page__body">
        <div className="auth-card">
          {/* ── Left Panel ── */}
          <div className="auth-panel auth-panel--left">
            <DeskIllustration />
            <h2 className="auth-panel__heading">Welcome back! 👋</h2>
            <p className="auth-panel__subtext">
              Sign in to continue to the Group 30 Auth App.
            </p>
            <div className="auth-panel__features">
              <div className="auth-feature">
                <Shield size={16} className="auth-feature__icon" />
                <div>
                  <p className="auth-feature__title">Secure Login</p>
                  <p className="auth-feature__desc">Protected authentication sessions</p>
                </div>
              </div>
              <div className="auth-feature">
                <Users size={16} className="auth-feature__icon" />
                <div>
                  <p className="auth-feature__title">Role-Based Access</p>
                  <p className="auth-feature__desc">Student &amp; admin privilege levels</p>
                </div>
              </div>
              <div className="auth-feature">
                <Monitor size={16} className="auth-feature__icon" />
                <div>
                  <p className="auth-feature__title">Session Management</p>
                  <p className="auth-feature__desc">Audit &amp; revoke active devices</p>
                </div>
              </div>
            </div>
            <div className="auth-panel__badge">🏆 Capstone Project Demo</div>
          </div>

          {/* ── Right Panel ── */}
          <div className="auth-panel auth-panel--right">
            <div className="auth-form-header">
              <div className="auth-form-header__icon">
                <Lock size={20} />
              </div>
              <h1 className="auth-form-header__title">Sign in</h1>
              <p className="auth-form-header__subtitle">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error">
                <AlertCircle size={16} />
                <span>{error}</span>
                <button className="auth-alert__close" onClick={() => setError('')}><X size={14} /></button>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    className="form-input form-input--icon"
                    placeholder="student@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Password</label>
                  <Link to="/forgot-password" className="form-label-link">Forgot password?</Link>
                </div>
                <div className="input-wrapper">
                  <Lock size={16} className="input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-input form-input--icon form-input--icon-right"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                />
                <span>Keep me signed in</span>
              </label>

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in →'}
              </button>
            </form>

            <p className="auth-form-footer">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-form-footer__link">Create account</Link>
            </p>
          </div>
        </div>

        <footer className="auth-page__footer">
          Group 30 Capstone Project • Ts Academy Demonstration
        </footer>
      </div>
    </div>
  );
}
