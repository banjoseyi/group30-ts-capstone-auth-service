import '../styles/security.css';
import { useState } from 'react';
import { Eye, EyeOff, Info, KeyRound, Lightbulb, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import ConfirmDialog from '../components/common/ConfirmDialog';

const initialForm = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Security() {
  const { logout } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [visible, setVisible] = useState({});
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmUpdate, setConfirmUpdate] = useState(false);

  const requirements = [
    ['At least 8 characters', form.newPassword.length >= 8],
    ['Contains a letter', /[a-z]/i.test(form.newPassword)],
    ['Contains a number', /\d/.test(form.newPassword)],
  ];

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    if (form.newPassword !== form.confirmPassword) {
      setError('Your new passwords do not match.');
      return;
    }
    setConfirmUpdate(true);
  };

  const updatePassword = async () => {
    setConfirmUpdate(false);
    setIsSubmitting(true);
    try {
      await apiClient.patch('/auth/me/password', form);
      await logout();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update your password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordField = (name, label, placeholder) => (
    <div className="form-group" key={name}>
      <label className="form-label" htmlFor={name}>{label}</label>
      <div className="input-wrapper">
        <LockKeyhole size={15} className="input-icon" />
        <input id={name} className="form-input form-input--icon form-input--icon-right" type={visible[name] ? 'text' : 'password'} value={form[name]} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} placeholder={placeholder} required autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'} />
        <button className="input-toggle" type="button" aria-label={`Toggle ${label.toLowerCase()} visibility`} onClick={() => setVisible((current) => ({ ...current, [name]: !current[name] }))}>{visible[name] ? <EyeOff size={15} /> : <Eye size={15} />}</button>
      </div>
    </div>
  );

  return (
    <div className="account-page security-page">
      <section className="security-banner"><div><span><ShieldCheck size={16} /> ACCOUNT PROTECTION</span><h1>Security</h1><p>Manage your password and keep your account secure across all campus devices.</p></div><b><span /> Protected by Group 30 Protocol</b></section>
      <div className="security-grid">
        <section className="account-panel security-form-panel">
          <div className="account-panel__heading"><div><h2>Change Password</h2><p>Update your password to ensure your account remains protected.</p></div><span className="account-icon"><KeyRound size={16} /></span></div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {passwordField('currentPassword', 'Current Password', 'Enter current password')}
            {passwordField('newPassword', 'New Password', 'Create a strong password')}
            {form.newPassword && <div className="password-strength" aria-label="Password strength"><span className={requirements[0][1] ? 'is-met' : ''} /><span className={requirements[1][1] ? 'is-met' : ''} /><span className={requirements[2][1] ? 'is-met' : ''} /></div>}
            {passwordField('confirmPassword', 'Confirm New Password', 'Re-enter your new password')}
            <div className="security-requirements"><strong>Must contain:</strong>{requirements.map(([label, met]) => <span key={label} className={met ? 'is-met' : ''}><i />{label}</span>)}</div>
            <div className="account-info-note"><Info size={16} /> Changing your password will sign you out of all other active devices.</div>
            {error && <div className="account-alert account-alert--error">{error}</div>}
            <button className="btn btn--primary" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Updating…' : <><ShieldCheck size={15} /> Update Password</>}</button>
          </form>
        </section>
        <aside className="security-aside">
          <section className="account-panel"><div className="account-panel__heading"><h2><Lightbulb size={16} /> Security Tips</h2></div><ul className="security-tips"><li><b>🔑 Make it unique</b><span>Use a unique password you don&apos;t use on other websites.</span></li><li><b>🤫 Keep it private</b><span>Never share your password or authentication link with anyone.</span></li><li><b>▣ Campus computer safety</b><span>Sign out of devices you no longer use or shared campus computers.</span></li></ul></section>
          <section className="security-implementation"><span>GROUP 30 IMPLEMENTATION</span><p>Passwords are securely hashed with bcrypt and sessions use HTTP-only cookies to prevent unauthorized script access.</p><small>CS Student Project Showcase <b>● Safe &amp; Verified</b></small></section>
        </aside>
      </div>
      <ConfirmDialog isOpen={confirmUpdate} title="Update password?" message="You will be signed out after your password is updated. Continue?" confirmLabel="Update password" tone="primary" onConfirm={updatePassword} onCancel={() => setConfirmUpdate(false)} />
    </div>
  );
}