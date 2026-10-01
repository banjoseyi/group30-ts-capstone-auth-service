import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Info, ArrowLeft, ArrowRight } from 'lucide-react';
import apiClient from '../api/apiClient';
import Navbar from '../components/common/Navbar';

function MailIcon() {
  return (
    <div className="fp-icon-wrap">
      <Mail size={28} color="#5B5FEF" />
    </div>
  );
}

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Request failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar variant="register" />

      <div className="auth-page__body auth-page__body--center">
        <div className="fp-card">
          <MailIcon />
          <h1 className="fp-card__title">Forgot your password?</h1>
          <p className="fp-card__subtitle">
            No worries! Enter your email address and we&apos;ll send you a password reset link.
          </p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
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

            {submitted && (
              <div className="auth-alert auth-alert--info">
                <Info size={15} />
                <span>
                  If an account exists for that email, we will send a password reset link.
                  Please check your inbox or spam folder.
                </span>
              </div>
            )}

            {error && (
              <div className="auth-alert auth-alert--error">
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn-submit" disabled={isSubmitting || submitted}>
              {isSubmitting ? 'Sending…' : (
                <>Send Reset Link <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <Link to="/login" className="fp-back-link">
            <ArrowLeft size={15} /> Back to Login
          </Link>

          <p className="fp-card__project-label">● Group 30 Capstone Project</p>
        </div>

        <footer className="auth-page__footer">
          Group 30 Capstone Project • Ts Academy Demonstration
        </footer>
      </div>
    </div>
  );
}
