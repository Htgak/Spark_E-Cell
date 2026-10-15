import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Check, Clock, Sparkles, Send, Globe, Zap } from 'lucide-react';

// Format ISO string or Date to 'YYYY-MM-DDTHH:mm' for <input type="datetime-local">
function toLocalDatetimeInput(dateInput) {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Convert local datetime string to UTC ISO string
function localToUtcIso(localDatetimeStr) {
  if (!localDatetimeStr) return null;
  const d = new Date(localDatetimeStr);
  return d.toISOString();
}

// Compute human friendly relative time description
function getSchedulePreview(datetimeStr) {
  if (!datetimeStr) return null;
  const targetTime = new Date(datetimeStr).getTime();
  const now = Date.now();
  const diffMs = targetTime - now;

  if (diffMs <= 60000) {
    return { isFuture: false, label: 'Immediate Publication', text: 'Will be published immediately on save.' };
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  const remainingMinutes = diffMinutes % 60;

  let timeString = '';
  if (diffDays > 0) {
    timeString = `${diffDays} day${diffDays > 1 ? 's' : ''}${remainingHours > 0 ? `, ${remainingHours} hr${remainingHours > 1 ? 's' : ''}` : ''}`;
  } else if (diffHours > 0) {
    timeString = `${diffHours} hour${diffHours > 1 ? 's' : ''}${remainingMinutes > 0 ? `, ${remainingMinutes} min` : ''}`;
  } else {
    timeString = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }

  const formattedTarget = new Date(datetimeStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    isFuture: true,
    label: `Scheduled in ${timeString}`,
    text: `Will go live on ${formattedTarget}`,
  };
}

export default function PostForm({ editingPost, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('Spark E-Cell');
  const [category, setCategory] = useState('Venture Stories');
  const [content, setContent] = useState('');
  const [publishAtLocal, setPublishAtLocal] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time';

  useEffect(() => {
    if (editingPost) {
      setTitle(editingPost.title || '');
      setAuthor(editingPost.author || 'Spark E-Cell');
      setCategory(editingPost.category || 'Venture Stories');
      setContent(editingPost.content || '');
      setPublishAtLocal(toLocalDatetimeInput(editingPost.publishAt));
      setError('');
    } else {
      setTitle('');
      setAuthor('Spark E-Cell');
      setCategory('Venture Stories');
      setContent('');
      setPublishAtLocal(toLocalDatetimeInput());
      setError('');
    }
  }, [editingPost]);

  // Quick Preset Handlers
  const applyPreset = (type) => {
    const target = new Date();
    if (type === 'now') {
      setPublishAtLocal(toLocalDatetimeInput());
    } else if (type === 'tomorrow-morning') {
      target.setDate(target.getDate() + 1);
      target.setHours(9, 0, 0, 0);
      setPublishAtLocal(toLocalDatetimeInput(target));
    } else if (type === 'tomorrow-evening') {
      target.setDate(target.getDate() + 1);
      target.setHours(18, 0, 0, 0);
      setPublishAtLocal(toLocalDatetimeInput(target));
    } else if (type === 'in-3-days') {
      target.setDate(target.getDate() + 3);
      target.setHours(10, 0, 0, 0);
      setPublishAtLocal(toLocalDatetimeInput(target));
    } else if (type === 'next-monday') {
      const day = target.getDay();
      const diffToMonday = (8 - day) % 7 || 7;
      target.setDate(target.getDate() + diffToMonday);
      target.setHours(10, 0, 0, 0);
      setPublishAtLocal(toLocalDatetimeInput(target));
    }
  };

  const scheduleInfo = getSchedulePreview(publishAtLocal);

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
      publishAt: utcIso,
    };

    setSubmitting(true);
    try {
      await onSave(payload);
      if (!editingPost) {
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

  return (
    <div className="admin-panel post-form-panel">
      <div style={{ marginBottom: '24px' }}>
        <div className="section-tag">
          {editingPost ? '/ EDIT DISPATCH' : '/ NEW DISPATCH'}
        </div>
        <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em' }}>
          {editingPost ? 'Edit Article & Schedule' : 'Create & Schedule Article'}
        </h3>
        <p className="admin-description">
          Publish immediately or schedule for a future date. The backend will automatically publish it at the set time.
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
          <label className="form-label">Article Title *</label>
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
            <label className="form-label">Author / Byline</label>
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

        {/* Redesigned Scheduling Card */}
        <div className="schedule-config-card" style={{
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
          background: 'var(--bg-subtle)',
          marginBottom: '22px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--accent-blue)' }} />
              <span style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-heading)' }}>
                Publishing Schedule
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
              <Globe size={13} />
              <span>{userTimeZone}</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={() => applyPreset('now')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              <Zap size={13} style={{ color: '#10b981' }} /> Publish Now
            </button>
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={() => applyPreset('tomorrow-morning')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Tomorrow 9:00 AM
            </button>
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={() => applyPreset('tomorrow-evening')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Tomorrow 6:00 PM
            </button>
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={() => applyPreset('in-3-days')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              In 3 Days
            </button>
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={() => applyPreset('next-monday')}
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Next Mon 10 AM
            </button>
          </div>

          {/* Datetime Input & Live Status Banner */}
          <div className="schedule-input-banner-grid">
            <div>
              <label className="form-label" style={{ fontSize: '12px', marginBottom: '4px' }}>
                Pick Exact Date & Time:
              </label>
              <input
                type="datetime-local"
                className="form-input"
                style={{ width: '100%', background: 'var(--bg-white)' }}
                value={publishAtLocal}
                onChange={(e) => setPublishAtLocal(e.target.value)}
                required
              />
            </div>

            {/* Dynamic visual preview chip */}
            {scheduleInfo && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: scheduleInfo.isFuture ? '1px solid rgba(217,119,6,0.3)' : '1px solid rgba(16,185,129,0.3)',
                background: scheduleInfo.isFuture ? 'rgba(217,119,6,0.08)' : 'rgba(16,185,129,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {scheduleInfo.isFuture ? (
                  <Clock size={22} style={{ color: '#d97706', flexShrink: 0 }} />
                ) : (
                  <Check size={22} style={{ color: '#10b981', flexShrink: 0 }} />
                )}
                <div>
                  <div style={{
                    fontWeight: 700,
                    fontSize: '13px',
                    color: scheduleInfo.isFuture ? '#b45309' : '#047857'
                  }}>
                    {scheduleInfo.label}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                    {scheduleInfo.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Article Body *</label>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            {submitting ? (
              'Saving...'
            ) : editingPost ? (
              <>Update Dispatch</>
            ) : scheduleInfo?.isFuture ? (
              <><Clock size={15} /> Schedule Dispatch</>
            ) : (
              <><Send size={15} /> Publish Now</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

