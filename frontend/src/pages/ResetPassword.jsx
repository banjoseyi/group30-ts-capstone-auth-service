import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react';
import apiClient from '../api/apiClient';
import Navbar from '../components/common/Navbar';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.post(`/auth/reset-password/${token}`, {
        password,
        confirmPassword: confirm,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <Navbar variant="register" />
      <div className="auth-page__body auth-page__body--center">
        <section className="fp-card reset-card">
          <div className="fp-icon-wrap"><LockKeyhole size={27} /></div>
          <h1 className="fp-card__title">Create a new password</h1>
          <p className="fp-card__subtitle">Choose a strong password to secure your account.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">New Password</label>
              <div className="input-wrapper">
                <LockKeyhole size={16} className="input-icon" />
                <input id="new-password" className="form-input form-input--icon form-input--icon-right" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter at least 8 characters" required autoComplete="new-password" />
                <button className="input-toggle" type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle new password visibility">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">Confirm New Password</label>
              <div className="input-wrapper">
                <LockKeyhole size={16} className="input-icon" />
                <input id="confirm-password" className="form-input form-input--icon form-input--icon-right" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" required autoComplete="new-password" />
                <button className="input-toggle" type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label="Toggle confirmation password visibility">{showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <div className="reset-requirements"><span>PASSWORD REQUIREMENTS</span><p>○ Minimum 8 characters</p><p>○ At least one letter</p><p>○ At least one number</p></div>
            {error && <div className="auth-alert auth-alert--error">{error}</div>}
            <button className="btn-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Resetting…' : <>Reset Password <ArrowRight size={16} /></>}</button>
          </form>
          <Link to="/login" className="fp-back-link"><ArrowLeft size={15} /> Back to Login</Link>
        </section>
        <footer className="auth-page__footer">Group 30 Capstone Project • Ts Academy Demonstration</footer>
      </div>
    </div>
  );
}
