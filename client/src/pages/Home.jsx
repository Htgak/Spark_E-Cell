import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import PostCard from '../components/PostCard';
import { fetchPublishedPosts } from '../api';
import { RefreshCw, BookOpen, AlertCircle } from 'lucide-react';

const FEATURES = [
  { title: 'Learn by doing', desc: 'Work through real problems, test early ideas and build practical skills with your peers.' },
  { title: 'Find your people', desc: 'Meet students who share your curiosity and mentors who can help you move forward.' },
  { title: 'Take the next step', desc: 'Shape a promising idea into a prototype, project or venture worth pursuing.' }
];

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPublishedPosts();
      setPosts(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch stories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Spark E-Cell — SBIT Khammam | Startup Incubator';
    loadPosts();

  }, []);

  return (
    <div>
      {/* ── 1. Hero ── */}
      <HeroSection />

      {/* ── 2. Features / Why Spark E-Cell ── */}
      <section className="features-section section-wrapper" id="features">
        <div className="section-inner">
          <div className="features-header">
              <div className="section-tag">What we do</div>
            <h2 className="section-title">From first thought to first venture.</h2>
            <p className="section-lead">
              Find your people, test your thinking and build something real, one step at a time.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                
                <div className="feature-title">{f.title}</div>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Stats Banner ── */}
      <GallerySection />

      {/* ── 4. Our Ecosystem — Other Websites + Eureka Button ── */}
      <section className="ecosystem-section section-wrapper" id="ecosystem">
        <div className="section-inner">
          <div className="features-header" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div className="section-tag" style={{ display: 'inline-flex' }}>🌐 Our Ecosystem</div>
            <h2 className="section-title" style={{ marginTop: 12 }}>Explore Our World</h2>
            <p className="section-lead" style={{ margin: '8px auto 0' }}>
              Everything Spark E-Cell and SBIT — one place to find it all.
            </p>
          </div>

          <div className="ecosystem-grid">

            {/* ── Eureka Event Card (featured, dark) ── */}
            <a
              href="https://eureka.sparkecell.in"   /* ← replace with your Eureka site URL */
              target="_blank"
              rel="noopener noreferrer"
              className="ecosystem-card eureka-card"
              style={{ flex: '1 1 320px' }}
            >
              <div className="ecosystem-card-icon">💡</div>
              <div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'rgba(245,197,24,0.15)', border: '1px solid rgba(245,197,24,0.35)',
                  borderRadius: 999, padding: '3px 10px', fontSize: 11,
                  fontWeight: 700, color: '#f5c518', marginBottom: 8
                }}>
                  ⚡ Flagship Event
                </div>
                <div className="ecosystem-card-title" style={{ fontSize: 22 }}>Eureka!</div>
              </div>
              <p className="ecosystem-card-desc">
                SBIT's premier entrepreneurship challenge where student innovators pitch ideas, build prototypes, and compete for mentorship and seed support.
              </p>
              <div style={{ marginTop: 8 }}>
                <a
                  href="https://eureka.sparkecell.in"   /* ← same URL */
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-eureka"
                  onClick={e => e.stopPropagation()}
                >
                  <span className="btn-eureka-pulse" />
                  Visit Eureka Site
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                </a>
              </div>
            </a>

            {/* ── SBIT College Website ── */}
            <a
              href="https://www.sbit.ac.in"   /* ← SBIT official site */
              target="_blank"
              rel="noopener noreferrer"
              className="ecosystem-card"
            >
              <div className="ecosystem-card-icon">🏛️</div>
              <div className="ecosystem-card-title">SBIT Official Website</div>
              <p className="ecosystem-card-desc">
                Swarna Bharathi Institute of Science &amp; Technology — admissions, academics, departments, and campus life.
              </p>
              <span className="ecosystem-card-link">
                Visit sbit.ac.in
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>
                </svg>
              </span>
            </a>


          </div>
        </div>
      </section>

      {/* ── 5. Blog & Dispatches ── */}
      <section className="blog-section section-wrapper" id="blog">
        <div className="section-inner">
          <div className="blog-header">
            <div>
              <div className="section-tag">📝 Stories</div>
              <h2 className="section-title">Ideas, lessons and updates.</h2>
              <p className="section-lead" style={{ marginTop: '6px' }}>
                Notes and updates from the Spark E-Cell community.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn-pill-outline btn-pill-sm" onClick={loadPosts}>
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="state-box">
              <RefreshCw size={28} className="animate-spin" style={{ color: 'var(--accent-blue)' }} />
              <div className="state-title">Loading Stories...</div>
              <div className="state-desc">Just a moment while we load the latest updates.</div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="state-box">
              <AlertCircle size={32} style={{ color: '#ef4444' }} />
              <div className="state-title">Unable to Load Stories</div>
              <div className="state-desc">{error}</div>
              <button type="button" className="btn-pill-primary" onClick={loadPosts} style={{ marginTop: '12px' }}>
                Retry
              </button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && posts.length === 0 && (
            <div className="state-box">
              <BookOpen size={32} style={{ color: 'var(--text-muted)' }} />
              <div className="state-title">No Stories Published Yet</div>
                <div className="state-desc">New stories and updates will appear here.</div>
            </div>
          )}

          {/* Posts grid */}
          {!loading && !error && posts.length > 0 && (
            <div className="posts-grid">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}


