import '../styles/landing.css';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Cloud,
  History,
  Image,
  KeyRound,
  Mail,
  MailCheck,
  Monitor,
  ShieldCheck,
  UserRoundCog,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import gitLogo from '../assets/Git.svg';
import githubLogo from '../assets/GitHub.svg';
import jwtLogo from '../assets/icons8-jwt-48.png';
import heroPreview from '../assets/image.png';
import mongoDBLogo from '../assets/MongoDB.svg';
import nodeLogo from '../assets/Node.js.svg';
import reactLogo from '../assets/React.svg';
import userManagementPreview from '../assets/USER-MANAGEMENT.png';

const features = [
  {
    icon: KeyRound,
    title: 'Registration & Login',
    description: 'Secure account creation and sign-in with access and refresh tokens.',
    badge: 'Dual Token Flow',
    detail: {
      type: 'tokens',
      items: [
        { title: 'Hashing', value: 'Argon2id' },
        { title: 'Short-Lived', value: '15m Access' },
        { title: 'Persistent', value: 'HTTP-only Refresh' },
      ],
    },
    featured: true,
  },
  {
    icon: History,
    title: 'Password Recovery',
    description: 'Email-based password reset with secure, expiring tokens.',
    badge: '15-Minute Expiry',
    iconTone: 'green',
    detail: {
      type: 'notice',
      title: 'One-time token dispatch',
      text: 'Single-use reset link via Nodemailer',
    },
  },
  {
    icon: Monitor,
    title: 'Session Management',
    description: 'View, refresh, and revoke active login sessions.',
    badge: 'Telemetry',
    detail: {
      type: 'session',
      device: 'Chrome / macOS',
      action: 'Revoke',
    },
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    description: 'Separate permissions for users and administrators.',
    badge: 'Middleware Gate',
    badgeTone: 'violet',
    detail: {
      type: 'roles',
      items: [
        { label: 'U', title: 'USER Role', description: 'Standard App Access' },
        { label: 'A', title: 'ADMIN Role', description: 'Elevated Controls' },
      ],
    },
  },
  {
    icon: Image,
    title: 'Profile Images',
    description: 'Upload and manage profile photos with Cloudinary.',
    compact: true,
    iconTone: 'soft-blue',
  },
  {
    icon: UserRoundCog,
    title: 'Admin Controls',
    description: 'Manage users, roles, account status, and sessions.',
    compact: true,
    iconTone: 'soft-teal',
  },
];

const technologies = [
  { name: 'Node.js', logo: nodeLogo },
  { name: 'Express.js', wordmark: 'express', tone: 'express' },
  { name: 'MongoDB', logo: mongoDBLogo },
  { name: 'Mongoose', wordmark: 'mongoose', tone: 'mongoose' },
  { name: 'JSON Web Token', logo: jwtLogo },
  { name: 'Joi', wordmark: 'joi', tone: 'joi' },
  { name: 'Cloudinary', icon: Cloud, tone: 'cloudinary' },
  { name: 'Nodemailer', icon: Mail, tone: 'nodemailer' },
  { name: 'React.js', logo: reactLogo },
  { name: 'Git', logo: gitLogo },
  { name: 'GitHub', logo: githubLogo },
  { name: 'bcrypt', wordmark: 'bcrypt', tone: 'express' },
];

function FeatureDetails({ detail }) {
  if (detail.type === 'tokens') {
    return (
      <div className="landing-feature__details landing-feature__details--tokens">
        {detail.items.map(({ title, value }) => <span key={title}><small>{title}</small>{value}</span>)}
      </div>
    );
  }

  if (detail.type === 'notice') {
    return (
      <div className="landing-feature__details landing-feature__details--notice">
        <MailCheck size={16} />
        <span><b>{detail.title}</b><small>{detail.text}</small></span>
      </div>
    );
  }

  if (detail.type === 'session') {
    return (
      <div className="landing-feature__details landing-feature__details--session">
        <span><i />{detail.device}</span><b>{detail.action}</b>
      </div>
    );
  }

  return (
    <div className="landing-feature__details landing-feature__details--roles">
      {detail.items.map(({ label, title, description }) => (
        <span key={title}><i>{label}</i><span><b>{title}</b><small>{description}</small></span></span>
      ))}
    </div>
  );
}

function WorkflowPreview({ number, title, label, type }) {
  return (
    <article className="workflow-card">
      <div className={`workflow-card__screen workflow-card__screen--${type}`}>
        <div className="workflow-card__chrome"><span /><span /><span /><small>group30.auth/{type}</small><b>⌑</b></div>
        {type === 'register' ? (
          <div className="workflow-card__form"><b>Create an account</b><small>Enter credentials to register</small><span>student@tsacademy.org <Check size={12} /></span><span>•••••••••••• <span>◉</span></span><strong>Register Account <ArrowRight size={11} /></strong></div>
        ) : type === 'dashboard' ? (
          <div className="workflow-card__mini-dashboard"><b>Alex Chen</b><small>Role: User (Verified)</small><div><span>TOKEN VALIDITY<strong>14m 45s</strong></span><span>SESSIONS<strong>2 Active</strong></span></div><span>Cloudinary Profile Synced - ☁</span></div>
        ) : (
          <div className="workflow-card__sessions"><b>Active Devices (2) <i>Revoke All</i></b><span>▣ Chrome / macOS <em>Active now</em></span><span>▯ iPhone 15 <em>2 hrs ago</em></span></div>
        )}
      </div>
      <span className="workflow-card__number">{number}</span>
      <h3>{title}</h3>
      <p>{label}</p>
    </article>
  );
}

export default function Landing() {
  return (
    <div className="landing-page">
      <Navbar />
      <main>
        <section className="landing-hero">
          <div className="landing-hero__copy">
            <h1>Group 30 <span>Authentication</span> Service</h1>
            <p>A full-stack authentication system built to demonstrate secure login, password recovery,<br className="landing-desktop-break" /> session management and role-based access.</p>
            <div className="landing-hero__actions">
              <Link className="landing-text-link" to="/login">Sign In</Link>
              <Link className="btn btn--primary" to="/register">Explore Project <ArrowRight size={15} /></Link>
            </div>
          </div>
          <img className="landing-hero__image" src={heroPreview} alt="Group 30 authentication dashboard preview" />
        </section>

        <section className="landing-features">
          <div className="landing-section-heading"><span>CORE FEATURES</span><h2>What We Built</h2><p>Key parts of our authentication system.</p></div>
          <div className="landing-feature-grid">
            {features.map(({ icon: Icon, title, description, detail, badge, badgeTone, featured, compact, iconTone }) => (
              <article key={title} className={`landing-feature${featured ? ' landing-feature--featured' : ''}${compact ? ' landing-feature--compact' : ''}${iconTone ? ` landing-feature--icon-${iconTone}` : ''}`}>
                <div className="landing-feature__top"><span className="landing-feature__icon"><Icon size={17} /></span>{badge && <small className={badgeTone ? `landing-feature__badge--${badgeTone}` : ''}>{badge}</small>}</div>
                <h3>{title}</h3><p>{description}</p>
                {detail && <FeatureDetails detail={detail} />}
              </article>
            ))}
          </div>
        </section>

        <section className="landing-stack">
          <div className="landing-section-heading"><span className="landing-stack__eyebrow">TECHNOLOGY STACK<span className="landing-stack__background-text" aria-hidden="true">TECHNOLOGY STACK</span></span><h2>Built With</h2><p>The tools and technologies used to build the project.</p></div>
          <div className="landing-stack__grid">{technologies.map(({ name, logo, wordmark, icon: Icon, tone }) => (
            <div className="landing-stack__item" key={name}>
              {logo ? <img className="landing-stack__logo" src={logo} alt="" aria-hidden="true" /> : Icon ? <Icon className={`landing-stack__icon landing-stack__icon--${tone}`} aria-hidden="true" /> : <b className={`landing-stack__wordmark landing-stack__wordmark--${tone}`}>{wordmark}</b>}
              <span>{name}</span>
            </div>
          ))}</div>
        </section>

        <section className="landing-workflows">
          <div className="landing-section-heading"><span>PROJECT PREVIEW</span><h2>See It In Action</h2><p>A quick look at the application experience.</p></div>
          <div className="landing-workflows__grid">
            <WorkflowPreview number="01" title="Registration" label="Create an account with clear validation." type="register" />
            <WorkflowPreview number="02" title="Account Dashboard" label="View account details and quick actions." type="dashboard" />
            <WorkflowPreview number="03" title="Session Control" label="Review and revoke active logins." type="sessions" />
          </div>
        </section>

        <section className="landing-about">
          <div className="landing-about__copy"><span>TS ACADEMY • GROUP 30</span><h2>Designed and developed as our TS Academy capstone project.</h2><p>A practical demonstration of authentication, API, security, and frontend concepts developed during the project.</p><div><span>Learn Together</span><span>Build Together</span><span>Grow Together</span></div></div>
          <div className="landing-about__visual">
            <img className="landing-about__image" src={userManagementPreview} alt="Group 30 user management dashboard preview" />
            <p className="landing-about__scribble" aria-label="Learning, Building, Together, at TS Academy"><span>Learning</span><span>Building</span><span>Together</span><span>@ TS Academy</span></p>
            <div className="landing-about__team-initials" aria-label="Engineering team initials: OO, CD, HD"><span>OO</span><span>CD</span><span>HD</span></div>
          </div>
        </section>

        <section className="landing-cta"><div><h2>Ready to explore the project?</h2><p>Create an account or sign in to try the authentication system.</p></div><div><Link to="/register">Create Account <ArrowRight size={15} /></Link><Link to="/login">Sign In</Link></div></section>
      </main>
      <footer className="landing-footer"><div><Link to="/" className="landing-footer__brand"><span>Ts</span> Group 30 Auth</Link><small>TS Academy • Capstone Project</small><nav><a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a></nav></div><p>TS Academy Capstone Project • Group 30</p></footer>
    </div>
  );
}
