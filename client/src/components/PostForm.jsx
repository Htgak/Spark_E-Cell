import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Check, Clock } from 'lucide-react';

// Convert ISO string or Date to format required by <input type="datetime-local"> (YYYY-MM-DDTHH:mm in local time)
function toLocalDatetimeInput(isoString) {
  const d = isoString ? new Date(isoString) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convert local datetime-local string to UTC ISO string
function localToUtcIso(localDatetimeStr) {
  if (!localDatetimeStr) return null;
  const d = new Date(localDatetimeStr);
  return d.toISOString();
}

export default function PostForm({ editingPost, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Spark E-Cell');
  const [category, setCategory] = useState('Venture Stories');
  const [content, setContent] = useState('');
  const [publishAtLocal, setPublishAtLocal] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setAuthor(editingPost.author || 'Spark E-Cell');
      setCategory(editingPost.category || 'Venture Stories');
      setContent(editingPost.content || '');
      setPublishAtLocal(toLocalDatetimeInput(editingPost.publishAt));
      setError('');
    } else {
      // Default to current time for new post (FR-13)
      setTitle('');
      setAuthor('Spark E-Cell');
      setCategory('Venture Stories');
      setContent('');
      setPublishAtLocal(toLocalDatetimeInput());
      setError('');
    }
  }, [editingPost]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Post title is required.');
      return;
    }
    if (!content.trim()) {
      setError('Post content is required.');
      return;
    }
    if (!publishAtLocal) {
      setError('Please select a publish date and time.');
      return;
    }

    const utcIso = localToUtcIso(publishAtLocal);
    if (!utcIso) {
      setError('Invalid date format.');
      return;
    }

    const payload = {
      title: title.trim(),
      author: author.trim() || 'Spark E-Cell',
      category: category.trim() || 'General',
      content: content.trim(),
      publishAt: utcIso
    };

    setSubmitting(true);
    try {
      await onSave(payload);
      if (!editingPost) {
        // Reset form for next post
        setTitle('');
        setContent('');
        setPublishAtLocal(toLocalDatetimeInput());
      }
    } catch (err) {
      setError(err.message || 'Failed to save post.');
    } finally {
      setSubmitting(false);
    }
  };

  const isScheduledInFuture = publishAtLocal && new Date(publishAtLocal).getTime() > Date.now();

  return (
    <div className="admin-panel post-form-panel">
      <div style={{ marginBottom: '24px' }}>
        <div className="section-tag">
          {editingPost ? '/ EDIT ARTICLE' : '/ NEW DISPATCH'}
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          {editingPost ? 'Edit Blog Post' : 'Create & Schedule Post'}
        </h3>
        <p className="admin-description">
          Set future date & time to schedule. The post will appear publicly automatically.
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '13.5px' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Post Title *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Scaling Autonomous Freight in Global Harbors"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', width: '100%' }}>
          <div className="form-group" style={{ flex: '1 1 220px' }}>
            <label className="form-label">Author</label>
            <input
              type="text"
              className="form-input"
              placeholder="Spark E-Cell"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>

          <div className="form-group" style={{ flex: '1 1 220px' }}>
            <label className="form-label">Category</label>
            <select
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Venture Stories">Venture Stories</option>
              <option value="Founder Lessons">Founder Lessons</option>
              <option value="Fundraising">Fundraising</option>
              <option value="Hardware & DeepTech">Hardware & DeepTech</option>
              <option value="Masterclass">Masterclass</option>
              <option value="Announcements">Announcements</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Publish Date & Time (Your Local Time) *</span>
            {isScheduledInFuture ? (
              <span style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={13} /> Will be scheduled
              </span>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={13} /> Immediate publication
              </span>
            )}
          </label>
          <input
            type="datetime-local"
            className="form-input"
            value={publishAtLocal}
            onChange={(e) => setPublishAtLocal(e.target.value)}
            required
          />
          <span className="form-help">
            Converted to UTC on submission. The post will go live automatically at this exact time.
          </span>
        </div>

        <div className="form-group">
          <label className="form-label">Article Content (Plain Text) *</label>
          <textarea
            className="form-textarea"
            rows={8}
            placeholder="Write the full body of the post here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          {editingPost && (
            <button
              type="button"
              className="btn-pill-outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            className="btn-pill-solid"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : editingPost ? 'Update Post' : 'Save & Publish / Schedule'}
          </button>
        </div>
      </form>
    </div>
  );
}
