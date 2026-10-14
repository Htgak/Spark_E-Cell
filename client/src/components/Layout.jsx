import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

/* ── Social icon SVGs (inline, no external dependency) ── */
function IconInstagram({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

function IconLinkedIn({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}


const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/spark_ecell?utm_source=ig_web_button_share_sheet&xtok=ZDNlZDc0MzIxNw==',
    Icon: IconInstagram,
    hoverColor: '#e1306c',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/spark-e-cell-sbit',
    Icon: IconLinkedIn,
    hoverColor: '#0a66c2',
  },
  
];

function SocialIconBtn({ label, href, Icon, hoverColor, className = '' }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className={`social-nav-btn ${className}`.trim()}
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        border: '1.5px solid var(--border-subtle)',
        background: 'var(--bg-white)',
        color: 'var(--text-secondary)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        flexShrink: 0,
        boxShadow: 'var(--shadow-xs)',
        textDecoration: 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.color = hoverColor;
        e.currentTarget.style.borderColor = hoverColor;
        e.currentTarget.style.background = 'var(--bg-subtle)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.borderColor = 'var(--border-subtle)';
        e.currentTarget.style.background = 'var(--bg-white)';
      }}
    >
      <Icon size={16} />
    </a>
  );
}

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spark_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('spark_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const scrollToSection = (id) => {
    if (!isHome) {
      window.location.href = `/#${id}`;
      return;
    }
    const elem = document.getElementById(id);
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="page-wrapper">
      {/* ── Sticky Frosted-Glass Navbar ── */}
      <header className="site-header">
        <div className="nav-inner">
          {/* Brand */}
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <div className="brand-logos-group">
              <img src="/images/sbit-logo.png" alt="SBIT Khammam" className="logo-sbit" />
              <img src="/images/spark-ecell-logo.png" alt="Spark E-Cell" className="logo-spark" />
            </div>
            <div className="brand-logo-text">
              <span className="brand-main-title">SPARK E-CELL</span>
              <span className="brand-sub-badge">SBIT KHAMMAM</span>
            </div>
          </Link>

          {/* Center nav */}
          <nav>
            <ul className="nav-links">
              <li>
                <button onClick={() => scrollToSection('about')} className="nav-link">About</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('gallery')} className="nav-link">Gallery</button>
              </li>
              <li>
                <button onClick={() => scrollToSection('blog')} className="nav-link">Blog</button>
              </li>
            </ul>
          </nav>

          {/* Right: Social icons + Theme Toggle + Admin */}
          <div className="header-actions">
            {SOCIAL_LINKS.map(s => (
              <SocialIconBtn key={s.label} {...s} className="header-social-btn" />
            ))}
            <button
              type="button"
              className="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <Link to="/admin" className="btn-pill-primary btn-pill-sm nav-admin-btn">
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="site-footer">
        <div className="footer-inner">
          {/* Left — brand + contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div className="footer-brand">
              <img
                src="/images/sbit-logo.png"
                alt="SBIT"
                style={{ height: 28, borderRadius: '50%', border: '1.5px solid #e2e8f0', padding: 2, background: '#fff' }}
              />
              <img
                src="/images/spark-ecell-logo.png"
                alt="Spark E-Cell"
                style={{ height: 26, objectFit: 'contain' }}
              />
              <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-heading)' }}>SPARK E-CELL</span>
            </div>

            <p className="footer-text" style={{ maxWidth: 340 }}>
              © {new Date().getFullYear()} Spark E-Cell &mdash; Swarna Bharathi Institute of Science &amp; Technology, Khammam, Telangana.
            </p>

            {/* Contact details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 4 }}>
              <a
                href="tel:+917331104384"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 7331104384
              </a>
              <a
                href="tel:+918341266934"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                +91 83412 66934
              </a>
              <a
                href="sparkinfra.sbit@gmail.com"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                sparkinfra.sbit@gmail.com
              </a>
            </div>
          </div>

          {/* Right — nav links + social icons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'flex-end' }}>
            <nav className="footer-links">
              <Link to="/" className="footer-link">Home</Link>
              <button onClick={() => scrollToSection('gallery')} className="footer-link">Gallery</button>
              <button onClick={() => scrollToSection('blog')} className="footer-link">Blog</button>
              <Link to="/admin" className="footer-link">Admin Portal</Link>
            </nav>

            {/* Social icons row */}
            <div style={{ display: 'flex', gap: 10 }}>
              {SOCIAL_LINKS.map(s => (
                <SocialIconBtn key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
