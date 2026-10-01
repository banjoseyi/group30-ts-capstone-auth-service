export default function UserAvatar({ user, className = 'avatar' }) {
  const displayName = user?.name
    || [user?.firstName, user?.lastName].filter(Boolean).join(' ')
    || user?.email
    || 'User';
  const initials = displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (user?.profileImage?.url) {
    const imageClass = `${className.split(' ')[0]}--image`;
    return <img className={`${className} ${imageClass}`} src={user.profileImage.url} alt={`${displayName} profile`} />;
  }

  return <div className={className} role="img" aria-label={`${displayName} initials`}>{initials}</div>;
}