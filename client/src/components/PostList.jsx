import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Clock, CheckCircle2, Edit2, Trash2, ExternalLink, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PostList({ posts, onEdit, onDelete }) {
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

  return (
    <div>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title & Category</th>
              <th>Status</th>
              <th>Publish Date & Time</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>
                  <p className="admin-description">No posts found. Create your first post using the form.</p>
                </td>
              </tr>
            ) : (
              posts.map((post) => {
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
                        <span className="admin-badge-scheduled">
                          <Clock size={13} /> Scheduled
                        </span>
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
                          title="Edit post"
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

      {/* Confirmation Dialog (FR-12) */}
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

