import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import GallerySection from '../components/GallerySection';
import PostCard from '../components/PostCard';
import { fetchPublishedPosts } from '../api';
import { RefreshCw, BookOpen, AlertCircle, Compass, UsersRound, Rocket, Lightbulb, Landmark, Sparkles, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

const FEATURES = [
  { number: '01', icon: Compass, title: 'Explore without a map', desc: 'Start with curiosity. Discover problems worth solving and learn how to ask sharper questions.' },
  { number: '02', icon: UsersRound, title: 'Build with your people', desc: 'Meet collaborators, get honest feedback and find mentors who help good ideas grow.' },
  { number: '03', icon: Rocket, title: 'Make the first move', desc: 'Turn a promising thought into an experiment, a prototype, or your next big thing.' }
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
          <div className="journey-heading">
            <div className="features-header">
              <div className="section-tag">A LITTLE LESS “SOMEDAY”</div>
              <h2 className="section-title">Your idea has a <em>next step.</em></h2>
              <p className="section-lead">You don’t need a perfect plan. Just a place to start, people to learn with, and room to try.</p>
            </div>
            <span className="journey-side-note">THE SPARK<br/>JOURNEY</span>
          </div>
          <div className="features-grid journey-grid">
            {FEATURES.map(({ icon: Icon, ...f }, i) => (
              <motion.article key={f.title} className="feature-card journey-card" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .22 }} transition={{ duration: .55, delay: i * .12 }} whileHover={{ y: -8 }}>
                <div className="journey-card-top"><span>{f.number}</span><Icon size={22} strokeWidth={1.6} /></div>
                <div className="journey-card-bottom"><div className="feature-title">{f.title}</div><p className="feature-desc">{f.desc}</p></div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. Stats Banner ── */}
      <section className="manifesto-band"><div className="manifesto-inner"><span>THINK IT.</span><span className="manifesto-mark">✳</span><span>TRY IT.</span><span className="manifesto-mark">✳</span><span>MAKE IT REAL.</span></div></section>
      <GallerySection />

      {/* ── 4. Our Ecosystem — Other Websites + Eureka Button ── */}
      <section className="ecosystem-section section-wrapper" id="ecosystem">
        <div className="section-inner">
          <div className="features-header ecosystem-heading" style={{ textAlign: 'center', marginBottom: 0 }}>
            <div className="section-tag" style={{ display: 'inline-flex' }}>BEYOND THE CLASSROOM</div>
            <h2 className="section-title" style={{ marginTop: 12 }}>A bigger world of <em>possibility.</em></h2>
            <p className="section-lead" style={{ margin: '8px auto 0' }}>
              Everything Spark E-Cell and SBIT — one place to find it all.
            </p>
          </div>

          <div className="ecosystem-grid">

            {/* ── Eureka Event Card (featured) ── */}
            <a
              href="https://spark-ecell-eureka.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="ecosystem-card eureka-card"
            >
              <div className="ecosystem-card-icon">
                <Lightbulb size={24} />
              </div>
              <div>
                <div className="eureka-badge">
                  <Sparkles size={12} />
                  <span>Flagship Event</span>
                </div>
                <div className="ecosystem-card-title">Eureka!</div>
              </div>
              <p className="ecosystem-card-desc">
                SBIT's premier entrepreneurship challenge where student innovators pitch ideas, build prototypes, and compete for mentorship and seed support.
              </p>
              <div className="eureka-card-footer">
                <span className="btn-eureka">
                  <span>Visit Eureka Site</span>
                  <ExternalLink size={15} />
                </span>
              </div>
            </a>

            {/* ── SBIT College Website ── */}
            <a
              href="https://www.sbit.ac.in"   /* ← SBIT official site */
              target="_blank"
              rel="noopener noreferrer"
              className="ecosystem-card"
            >
              <div className="ecosystem-card-icon"><Landmark size={25}/></div>
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
              <div className="section-tag">NOTES FROM THE COMMUNITY</div>
              <h2 className="section-title">Things we’re <em>figuring out.</em></h2>
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


