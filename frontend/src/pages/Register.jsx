import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2, UserPlus, Shield, Monitor } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import registrationIllustration from '../assets/Sign-up.png';

function StudentIllustration() {
  return (
    <img className="auth-panel__illustration" src={registrationIllustration} alt="Student creating an account at a desk" />
  );
}

function PasswordRequirement({ met, label }) {
  return (
    <span className={`pwd-req ${met ? 'pwd-req--met' : ''}`}>
      <CheckCircle2 size={13} />
      {label}
    </span>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const pwdReqs = {
    length: form.password.length >= 8,
    letter: /[a-zA-Z]/.test(form.password),
    number: /[0-9]/.test(form.password),
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        userName: form.username,
        email: form.email,
        password: form.password,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar variant="register" />

      <div className="auth-page__body">
        <div className="auth-card auth-card--wide">
          {/* ── Left Panel ── */}
          <div className="auth-panel auth-panel--left">
            <div className="auth-panel__live-badge">
              <span className="live-dot" />
              Live Interactive Environment
            </div>
            <h2 className="auth-panel__heading">
              Join Group 30 Auth App 🚀
            </h2>
            <p className="auth-panel__subtext">
              Set up your account and start using the Group 30 Auth App.
            </p>
            <StudentIllustration />
            <div className="auth-panel__features">
              <div className="auth-feature">
                <UserPlus size={16} className="auth-feature__icon" />
                <div>
                  <p className="auth-feature__title">Easy Registration</p>
                  <p className="auth-feature__desc">Quick self-service account setup</p>
                </div>
              </div>
              <div className="auth-feature">
                <Shield size={16} className="auth-feature__icon" />
                <div>
                  <p className="auth-feature__title">Secure Password Protection</p>
                  <p className="auth-feature__desc">Hashed credentials &amp; policy checks</p>
                </div>
              </div>
              <div className="auth-feature">
                <Monitor size={16} className="auth-feature__icon" />
                <div>
                  <p className="auth-feature__title">Profile &amp; Session Management</p>
                  <p className="auth-feature__desc">Full control over your active logins</p>
                </div>
              </div>
            </div>
            <div className="auth-panel__badge">🏆 Capstone Project Demo</div>
          </div>

          {/* ── Right Panel ── */}
          <div className="auth-panel auth-panel--right">
            <div className="auth-form-header">
              <h1 className="auth-form-header__title">Create your account</h1>
              <p className="auth-form-header__subtitle">Join the Group 30 Auth App.</p>
            </div>

            {error && (
              <div className="auth-alert auth-alert--error">
                <span>{error}</span>
                <button className="auth-alert__close" onClick={() => setError('')}>✕</button>
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    className="form-input"
                    placeholder="Alex"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                    autoComplete="given-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    className="form-input"
                    placeholder="Rivera"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="form-label-row">
                  <label className="form-label">Username</label>
                  {form.username.length > 2 && (
                    <span className="username-badge">
                      <CheckCircle2 size={12} /> Username available
                    </span>
                  )}
                </div>
                <div className="input-wrapper">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    name="username"
                    className="form-input form-input--icon"
                    placeholder="alexrivera"
                    value={form.username}
                    onChange={handleChange}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="input-wrapper">
                  <Mail size={16} className="input-icon" />
                  <input
                    type="email"
                    name="email"
                    className="form-input form-input--icon"
                    placeholder="alex.rivera@email.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="form-input form-input--icon form-input--icon-right"
                      placeholder="ProjectPass30!"
                      value={form.password}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className="input-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock size={16} className="input-icon" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      className="form-input form-input--icon form-input--icon-right"
                      placeholder="ProjectPass30!"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      autoComplete="new-password"
                    />
                    <button type="button" className="input-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {form.password && (
                <div className="pwd-requirements">
                  <span className="pwd-requirements__label">Password Requirements:</span>
                  <PasswordRequirement met={pwdReqs.length} label="At least 8 characters" />
                  <PasswordRequirement met={pwdReqs.letter} label="Contains a letter" />
                  <PasswordRequirement met={pwdReqs.number} label="Contains a number" />
                </div>
              )}

              <button type="submit" className="btn-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create Account →'}
              </button>
            </form>

            <p className="auth-form-footer">
              Already have an account?{' '}
              <Link to="/login" className="auth-form-footer__link">Sign in</Link>
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
