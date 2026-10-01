import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Public Navbar — used on Landing, Login, Register, ForgotPassword pages.
 * variant: 'login'   → "Sign In" filled + "Join Group30" ghost
 * variant: 'register'→ "Sign In" text    + "Join Group30" filled
 * variant: 'landing' → "Sign In" text    + "Register now" filled
 */
export default function Navbar({ variant = 'landing' }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="pub-nav">
      <Link to="/" className="pub-nav__logo">
        <span className="pub-nav__logo-badge">Ts</span>
        <span className="pub-nav__logo-text">Group30</span>
      </Link>

      <div id="public-nav-actions" className={`pub-nav__actions${isMenuOpen ? ' pub-nav__actions--open' : ''}`}>
        {variant === 'login' ? (
          <>
            <Link to="/login" className="btn btn--primary" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn btn--ghost" onClick={() => setIsMenuOpen(false)}>Join Group30</Link>
          </>
        ) : variant === 'register' ? (
          <>
            <Link to="/login" className="btn btn--ghost-dark" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn btn--primary" onClick={() => setIsMenuOpen(false)}>Join Group30</Link>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--ghost-dark" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
            <Link to="/register" className="btn btn--primary" onClick={() => setIsMenuOpen(false)}>Create Account</Link>
          </>
        )}
      </div>

      <button
        type="button"
        className="pub-nav__toggle"
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        aria-controls="public-nav-actions"
        onClick={() => setIsMenuOpen((open) => !open)}
      >
        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </nav>
  );
}
