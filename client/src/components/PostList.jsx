import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Clock, CheckCircle2, Edit2, Trash2, ExternalLink, AlertTriangle, Search, Filter, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

function getRemainingTimeStr(isoDateStr) {
  const diffMs = new Date(isoDateStr).getTime() - Date.now();
  if (diffMs <= 0) return 'Publishing now';
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  const remMinutes = diffMinutes % 60;

  if (diffDays > 0) return `in ${diffDays}d ${remHours}h`;
  if (diffHours > 0) return `in ${diffHours}h ${remMinutes}m`;
  return `in ${diffMinutes}m`;
}

export default function PostList({ posts, onEdit, onDelete }) {
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'published' | 'scheduled'
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  const confirmDelete = (post) => {
    setPostToDelete(post);
  };

  const handleExecuteDelete = async () => {
    if (!postToDelete) return;
    setDeletingId(postToDelete.id);
    try {
      await onDelete(postToDelete.id);
    } finally {
      setDeletingId(null);
      setPostToDelete(null);
    }
  };

  const counts = useMemo(() => {
    const published = posts.filter((p) => p.status === 'published').length;
    const scheduled = posts.filter((p) => p.status === 'scheduled').length;
    return { all: posts.length, published, scheduled };
  }, [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Tab filter
      if (filterTab === 'published' && post.status !== 'published') return false;
      if (filterTab === 'scheduled' && post.status !== 'scheduled') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title?.toLowerCase().includes(q);
        const matchesAuthor = post.author?.toLowerCase().includes(q);
        const matchesCategory = post.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesAuthor && !matchesCategory) return false;
      }
      return true;
    });
  }, [posts, filterTab, searchQuery]);

  return (
    <div>
      {/* Scheduling Filter Bar */}
      <div className="post-list-filter-bar">
        {/* Status Tabs */}
        <div className="post-list-tabs">
          <button
            type="button"
            className={`btn-pill-sm ${filterTab === 'all' ? 'btn-pill-solid' : 'btn-pill-outline'}`}
            style={{ border: 'none', minHeight: '32px' }}
            onClick={() => setFilterTab('all')}
          >
            All Dispatches ({counts.all})
          </button>
          <button
            type="button"
            className={`btn-pill-sm ${filterTab === 'published' ? 'btn-pill-solid' : 'btn-pill-outline'}`}
            style={{ border: 'none', minHeight: '32px' }}
            onClick={() => setFilterTab('published')}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            Live ({counts.published})
          </button>
          <button
            type="button"
            className={`btn-pill-sm ${filterTab === 'scheduled' ? 'btn-pill-solid' : 'btn-pill-outline'}`}
            style={{ border: 'none', minHeight: '32px' }}
            onClick={() => setFilterTab('scheduled')}
          >
            <Clock size={12} style={{ color: '#f59e0b' }} />
            Scheduled Queue ({counts.scheduled})
          </button>
        </div>

        {/* Search Input */}
        <div className="post-list-search-wrap">
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search dispatches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px', height: '36px', fontSize: '13px', width: '100%' }}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title & Category</th>
              <th>Status & Schedule</th>
              <th>Release Date & Time</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  <p className="admin-description">
                    {searchQuery ? 'No dispatches match your search.' : filterTab === 'scheduled' ? 'No posts currently in the scheduled queue.' : 'No posts found.'}
                  </p>
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => {
                const isPublished = post.status === 'published';
                const dateObj = new Date(post.publishAt);
                const localDateStr = dateObj.toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                });
                const localTimeStr = dateObj.toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit'
                });
                const remainingCountdown = !isPublished ? getRemainingTimeStr(post.publishAt) : null;

                return (
                  <tr key={post.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>
                        {post.title}
                      </div>
                      <div className="admin-description admin-small-text">
                        <span style={{ fontWeight: 600 }}>{post.author || 'Spark E-Cell'}</span> • {post.category || 'General'}
                      </div>
                    </td>

                    <td>
                      {isPublished ? (
                        <span className="admin-badge-published">
                          <CheckCircle2 size={13} /> Published
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'flex-start' }}>
                          <span className="admin-badge-scheduled">
                            <Clock size={13} /> Scheduled
                          </span>
                          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                            {remainingCountdown}
                          </span>
                        </div>
                      )}
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                        {localDateStr}
                      </div>
                      <div className="admin-description admin-small-text">
                        {localTimeStr} (Local)
                      </div>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div className="admin-actions" style={{ justifyContent: 'flex-end' }}>
                        {isPublished && (
                          <Link
                            to={`/post/${post.id}`}
                            target="_blank"
                            className="btn-circle"
                            title="View live post"
                            style={{ width: '32px', height: '32px' }}
                          >
                            <ExternalLink size={14} />
                          </Link>
                        )}

                        <button
                          type="button"
                          className="btn-circle"
                          onClick={() => onEdit(post)}
                          title="Edit post & schedule"
                          style={{ width: '32px', height: '32px' }}
                        >
                          <Edit2 size={14} />
                        </button>

                        <button
                          type="button"
                          className="btn-circle"
                          onClick={() => confirmDelete(post)}
                          title="Delete post"
                          style={{ width: '32px', height: '32px', color: 'var(--accent-rose)' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog */}
      {postToDelete && createPortal(
        <div className="modal-overlay gallery-delete-overlay" onClick={() => !deletingId && setPostToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', color: 'var(--accent-rose)' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Confirm Post Deletion</h3>
            </div>
            
            <p className="admin-description delete-description">
              Are you sure you want to permanently delete this post?
            </p>

            <div className="delete-summary">
              <div style={{ fontWeight: 700, fontSize: '15px' }}>{postToDelete.title}</div>
              <div className="admin-description admin-small-text">
                Status: {postToDelete.status} • Author: {postToDelete.author}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-pill-outline"
                onClick={() => !deletingId && setPostToDelete(null)}
                disabled={Boolean(deletingId)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-pill-solid"
                style={{ backgroundColor: 'var(--accent-rose)' }}
                onClick={handleExecuteDelete}
                disabled={Boolean(deletingId)}
              >
                {deletingId ? 'Deleting...' : 'Yes, Delete Post'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


