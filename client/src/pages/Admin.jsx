import React, { useState, useEffect } from 'react';
import { 
  loginAdmin, 
  logoutAdmin, 
  fetchAdminPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  isAuthenticated, 
  clearToken 
} from '../api';
import PostForm from '../components/PostForm';
import PostList from '../components/PostList';
import GalleryAdmin from '../components/GalleryAdmin';
import { Lock, LogOut, Layers, Clock, CheckCircle2, AlertCircle, RefreshCw, Image, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Admin() {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Tab: 'posts' | 'gallery'
  const [activeTab, setActiveTab] = useState('posts');

  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState(null);

  const [editingPost, setEditingPost] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    document.title = 'Admin Operations — /SPARK E-Cell';
    if (authed) {
      loadAdminPosts();
    }
  }, [authed]);

  const loadAdminPosts = async () => {
    setLoadingPosts(true);
    setPostsError(null);
    try {
      const data = await fetchAdminPosts();
      setPosts(data);
    } catch (err) {
      if (err.status === 401) {
        setAuthed(false);
        clearToken();
      } else {
        setPostsError(err.message || 'Failed to load posts');
      }
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);
    try {
      await loginAdmin(password);
      setAuthed(true);
      window.dispatchEvent(new Event('spark-auth-change'));
      setPassword('');
    } catch (err) {
      setLoginError(err.message || 'Incorrect password.');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAuthed(false);
    window.dispatchEvent(new Event('spark-auth-change'));
    setPosts([]);
    setEditingPost(null);
  };

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSavePost = async (postData) => {
    if (editingPost) {
      const updated = await updatePost(editingPost.id, postData);
      showNotification(`Post "${updated.title}" updated successfully.`);
      setEditingPost(null);
    } else {
      const created = await createPost(postData);
      showNotification(`Post "${created.title}" ${created.status === 'scheduled' ? 'scheduled' : 'published'} successfully!`);
    }
    await loadAdminPosts();
  };

  const handleDeletePost = async (id) => {
    await deletePost(id);
    showNotification('Post deleted successfully.');
    await loadAdminPosts();
  };

  // If not logged in: show login screen
  if (!authed) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', background: 'var(--bg-canvas)' }}>
        <div style={{ background: 'var(--bg-white)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)', padding: '40px 36px', maxWidth: '440px', width: '100%', boxShadow: 'var(--shadow-card)' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="section-tag" style={{ justifyContent: 'center', display: 'inline-flex' }}>
              🔒 Restricted Access
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)', marginTop: '12px' }}>
              Admin Login
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '6px' }}>
              Sign in to schedule dispatches and manage the showcase gallery.
            </p>
          </div>

          {loginError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13.5px' }}>
              <AlertCircle size={16} />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Admin Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              
            </div>

            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="submit"
                className="btn-pill-solid"
                style={{ width: '100%', padding: '12px' }}
                disabled={loggingIn}
              >
                <Lock size={15} /> {loggingIn ? 'Authenticating...' : 'Sign In to Panel'}
              </button>
              <Link to="/" className="btn-pill-outline" style={{ width: '100%', textAlign: 'center', padding: '11px' }}>
                Back to Public Site
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalPosts = posts.length;
  const publishedCount = posts.filter(p => p.status === 'published').length;
  const scheduledCount = posts.filter(p => p.status === 'scheduled').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      {/* Top Admin Control Bar */}
      <div className="canvas-card" style={{ padding: '24px 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="section-tag">/ OPERATIONS DESK</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Content & Media Center
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={loadAdminPosts}
              title="Refresh posts"
            >
              <RefreshCw size={13} /> Refresh
            </button>

            <Link to="/" className="btn-pill-outline btn-pill-sm" target="_blank">
              View Public Site
            </Link>

            <button
              type="button"
              className="btn-pill-solid btn-pill-sm"
              style={{ backgroundColor: '#374151' }}
              onClick={handleLogout}
            >
              <LogOut size={13} /> Log Out
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: activeTab === 'posts' ? '1.5px solid var(--accent-blue)' : '1.5px solid var(--border-subtle)',
              backgroundColor: activeTab === 'posts' ? 'var(--accent-blue)' : 'var(--bg-white)',
              color: activeTab === 'posts' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={15} /> Blog Posts &amp; Scheduling
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '8px 18px',
              borderRadius: '9999px',
              fontSize: '13.5px',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              border: activeTab === 'gallery' ? '1.5px solid var(--accent-blue)' : '1.5px solid var(--border-subtle)',
              backgroundColor: activeTab === 'gallery' ? 'var(--accent-blue)' : 'var(--bg-white)',
              color: activeTab === 'gallery' ? '#ffffff' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Image size={15} /> Gallery Photos &amp; Media
          </button>
        </div>

        {/* Stats bar for Posts Tab */}
        {activeTab === 'posts' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '20px', width: '100%' }}>
            <div style={{ flex: '1 1 160px', background: 'var(--bg-subtle)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
                <Layers size={14} /> Total Dispatches
              </div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-heading)', marginTop: '4px' }}>
                {totalPosts}
              </div>
            </div>

            <div className="admin-stat-card admin-stat-published">
              <div className="admin-stat-label">
                <CheckCircle2 size={14} /> Published Live
              </div>
              <div className="admin-stat-value">
                {publishedCount}
              </div>
            </div>

            <div className="admin-stat-card admin-stat-scheduled">
              <div className="admin-stat-label">
                <Clock size={14} /> Scheduled Future
              </div>
              <div className="admin-stat-value">
                {scheduledCount}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Flash Notification */}
      {notification && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: notification.type === 'success' ? '#d1fae5' : '#fee2e2',
          color: notification.type === 'success' ? '#065f46' : '#991b1b',
          fontWeight: 600,
          fontSize: '14px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* TAB 1: Blog Posts & Scheduling */}
      {activeTab === 'posts' && (
        <div className="admin-grid">
          <PostForm
            editingPost={editingPost}
            onSave={handleSavePost}
            onCancel={() => setEditingPost(null)}
          />

          <div className="admin-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <div className="section-tag">/ REGISTRY</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                  All Dispatches & Schedule
                </h3>
              </div>
              <span className="admin-description">
                Dynamic request-time resolution
              </span>
            </div>

            {loadingPosts ? (
              <div className="state-box">
                <RefreshCw size={24} className="animate-spin" />
                <div className="state-title">Refreshing posts...</div>
              </div>
            ) : postsError ? (
              <div className="state-box">
                <AlertCircle size={28} style={{ color: 'var(--accent-rose)' }} />
                <div className="state-title">Error Loading Posts</div>
                <div className="state-desc">{postsError}</div>
              </div>
            ) : (
              <PostList
                posts={posts}
                onEdit={(post) => {
                  setEditingPost(post);
                  window.scrollTo({ top: 120, behavior: 'smooth' });
                }}
                onDelete={handleDeletePost}
              />
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Gallery Photos & Media Management */}
      {activeTab === 'gallery' && (
        <GalleryAdmin onNotification={(msg) => showNotification(msg)} />
      )}
    </div>
  );
}
