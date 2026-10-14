import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchPostById } from '../api';
import { ArrowLeft, Calendar, User, AlertCircle } from 'lucide-react';

export default function PostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchPostById(id)
      .then((data) => {
        if (!isMounted) return;
        setPost(data);
        document.title = `${data.title} — Spark E-Cell`;
      })
      .catch((err) => {
        if (!isMounted) return;
        document.title = 'Article Not Found — Spark E-Cell';
        setError(err.message || 'Article not found');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
        <div className="state-box" style={{ maxWidth: '400px' }}>
          <div className="state-title">Loading Article…</div>
          <div className="state-desc">Fetching post content from the server.</div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={{ background: 'var(--bg-canvas)', minHeight: '60vh', padding: '48px 20px' }}>
        <div className="post-detail-container">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} /> Back to All Stories
          </Link>
          <div className="state-box" style={{ marginTop: '24px', padding: '80px 24px' }}>
            <AlertCircle size={40} style={{ color: '#ef4444' }} />
            <h2 className="state-title" style={{ fontSize: '22px' }}>Post Not Found or Not Yet Published</h2>
            <p className="state-desc">
              This article either does not exist or has been scheduled for a future date. Administrators can view scheduled posts in the Admin Portal.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/" className="btn-pill-primary">Return Home</Link>
              <Link to="/admin" className="btn-pill-outline">Admin Portal</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const publishDate = new Date(post.publishAt);
  const formattedDate = publishDate.toLocaleDateString(undefined, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });


  return (
    <div style={{ background: 'var(--bg-white)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="post-detail-container">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to All Stories
        </Link>

        <header className="post-detail-header">
          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: 'var(--text-primary)' }}>
              <User size={15} /> {post.author || 'Spark E-Cell'}
            </span>
            <span style={{ color: 'var(--border-hover)' }}>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={15} /> {formattedDate}
            </span>
          </div>
        </header>

        <article className="post-detail-content">
          {post.content}
        </article>

        <div style={{
          marginTop: '64px', paddingTop: '32px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginBottom: '4px' }}>Published under</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-heading)' }}>Spark E-Cell Incubator Editorial</div>
          </div>
          <Link to="/" className="btn-pill-primary">
            Read More Stories
          </Link>
        </div>
      </div>
    </div>
  );
}

