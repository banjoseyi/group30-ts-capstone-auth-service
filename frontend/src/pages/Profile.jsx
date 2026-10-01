import '../styles/profile.css';
import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, ImagePlus, Info, Trash2, UploadCloud, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInput = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [removeConfirmation, setRemoveConfirmation] = useState(false);

  useEffect(() => {
    if (!error && !notice) return undefined;

    const timeoutId = window.setTimeout(() => {
      setError('');
      setNotice('');
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [error, notice]);

  const name = user?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  const uploadImage = async (file) => {
    setError('');
    setNotice('');
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('The image must be 5 MB or smaller.');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', file);
    setIsSaving(true);
    try {
      const response = await apiClient.patch('/auth/me/profile-image', formData);
      updateUser({ profileImage: response.data.profileImage });
      setNotice('Profile image updated successfully.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to upload this image. Please try again.');
    } finally {
      setIsSaving(false);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const removeImage = async () => {
    setError('');
    setNotice('');
    setIsSaving(true);
    try {
      const response = await apiClient.delete('/auth/me/profile-image');
      updateUser({ profileImage: response.data.profileImage });
      setNotice('Profile image removed.');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to remove the profile image.');
    } finally {
      setIsSaving(false);
    }
  };

  const confirmRemoveImage = () => {
    setRemoveConfirmation(false);
    removeImage();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    uploadImage(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="account-page profile-page">
      {notice && <div className="account-alert account-alert--success"><Check size={18} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss message">×</button></div>}
      {error && <div className="account-alert account-alert--error">{error}<button onClick={() => setError('')} aria-label="Dismiss error">×</button></div>}
      <header className="account-page__heading"><h1>Profile</h1><p>Manage your profile photo and view your account information.</p></header>

      <div className="profile-grid">
        <section className="account-panel profile-photo-panel">
          <div className="account-panel__heading"><h2>Profile Photo</h2><span>AVATAR</span></div>
          <div className="profile-identity">
            {user?.profileImage?.url
              ? <img className="profile-avatar" src={user.profileImage.url} alt={`${name} profile`} />
              : <div className="profile-avatar profile-avatar--fallback"><UserRound size={28} /></div>}
            <div><strong>{name}</strong><p>JPG, PNG or WEBP. Maximum size 5 MB.</p></div>
          </div>
          <div className="profile-actions">
            <button className="btn btn--primary" onClick={() => fileInput.current?.click()} disabled={isSaving}><ImagePlus size={15} /> Change Photo</button>
            {user?.profileImage?.url && <button className="btn btn--danger-soft" onClick={() => setRemoveConfirmation(true)} disabled={isSaving}><Trash2 size={15} /> Remove Photo</button>}
          </div>
          <input ref={fileInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadImage(event.target.files?.[0])} />
          <button className={`profile-dropzone${isDragging ? ' profile-dropzone--active' : ''}`} type="button" onClick={() => fileInput.current?.click()} onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={handleDrop} disabled={isSaving}>
            <UploadCloud size={24} />
            <strong>{isSaving ? 'Uploading image…' : 'Drop an image here or choose a file'}</strong>
            <span>Select a photo to personalize your student profile</span>
          </button>
        </section>

        <section className="account-panel profile-info-panel">
          <div className="account-panel__heading"><h2>Personal Information</h2><span>ACCOUNT DETAILS</span></div>
          <div className="account-info-note"><Info size={16} /> Personal information is currently read-only.</div>
          <div className="profile-info-grid">
            <div><small>FIRST NAME</small><strong>{user?.firstName || name.split(' ')[0] || '—'}</strong></div>
            <div><small>LAST NAME</small><strong>{user?.lastName || name.split(' ').slice(1).join(' ') || '—'}</strong></div>
            <div><small>USERNAME</small><strong>{user?.username ? `@${user.username}` : '—'}</strong></div>
            <div><small>EMAIL</small><strong>{user?.email || '—'}</strong></div>
            <div><small>ROLE</small><strong className="profile-info-grid__role">{user?.role || 'user'}</strong></div>
            <div><small>STATUS</small><strong className="profile-info-grid__status">{user?.status || 'Active'}</strong></div>
            <div className="profile-info-grid__member"><small>MEMBER SINCE</small><strong><CalendarDays size={15} /> {memberSince}</strong></div>
          </div>
        </section>
      </div>
      <ConfirmDialog isOpen={removeConfirmation} title="Remove profile photo?" message="Your current profile photo will be removed from your account." confirmLabel="Remove photo" tone="danger" onConfirm={confirmRemoveImage} onCancel={() => setRemoveConfirmation(false)} />
    </div>
  );
}