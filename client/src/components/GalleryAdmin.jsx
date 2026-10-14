import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  fetchGallery, 
  createGalleryImage, 
  updateGalleryImage, 
  deleteGalleryImage,
  uploadGalleryImage,
  resolveMediaUrl
} from '../api';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';

export default function GalleryAdmin({ onNotification }) {
  const [images, setImages] = useState([]);
  const [error, setError] = useState('');

  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete modal state
  const [itemToDelete, setItemToDelete] = useState(null);

  const loadImages = async () => {
    setError('');
    try {
      const data = await fetchGallery();
      setImages(data);
    } catch (err) {
      setError(err.message || 'Failed to load gallery images');
    } finally {
      // The gallery remains visible while refresh requests complete.
    }
  };

  useEffect(() => {
    loadImages();
  }, []);

  const handleStartEdit = (img) => {
    setEditingItem(img);
    setTitle(img.title || '');
    setDesc(img.desc || '');
    setUrl(img.url || '');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setTitle('');
    setDesc('');
    setUrl('');
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!url.trim() && !selectedFile) {
      setError('Choose an image file or enter an image URL.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      let imageUrl = url.trim();
      if (selectedFile) {
        const uploaded = await uploadGalleryImage(selectedFile);
        imageUrl = uploaded.url;
      }

      if (editingItem) {
        await updateGalleryImage(editingItem.id, {
          title: title.trim(),
          desc: desc.trim(),
          url: imageUrl
        });
        if (onNotification) onNotification('Gallery image updated successfully');
      } else {
        await createGalleryImage({
          title: title.trim() || 'Incubator Photo',
          desc: desc.trim(),
          url: imageUrl
        });
        if (onNotification) onNotification('New gallery image added successfully');
      }

      handleCancelEdit();
      await loadImages();
    } catch (err) {
      setError(err.message || 'Failed to save image');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    try {
      await deleteGalleryImage(itemToDelete.id);
      if (onNotification) onNotification('Gallery image removed successfully');
      setItemToDelete(null);
      await loadImages();
    } catch (err) {
      setError(err.message || 'Failed to delete image');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', width: '100%' }}>
      {/* Gallery Form & Image List Flex */}
      <div className="admin-grid">
        {/* Form to Add / Change Image */}
        <div className="gallery-admin-panel">
          <div style={{ marginBottom: '20px' }}>
            <div className="section-tag">{editingItem ? '/ EDIT PHOTO' : '/ ADD NEW PHOTO'}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
              {editingItem ? 'Change Gallery Image' : 'Add Photo to Gallery'}
            </h3>
            <p className="admin-description">
              Add or update images displayed in the interactive showcase carousel.
            </p>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--radius-md)', marginBottom: '18px', fontSize: '13px' }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Upload an image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="form-input"
                onChange={(event) => {
                  const file = event.target.files?.[0] || null;
                  setSelectedFile(file);
                  if (file) setUrl('');
                }}
              />
              <span className="form-help">JPG, PNG, WebP or GIF, up to 8 MB.</span>
            </div>

            <div className="form-group">
              <label className="form-label">Or use an image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  if (e.target.value) {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }
                }}
              />
              <span className="form-help">Enter a public HTTPS image link</span>
            </div>

            {/* Live Image Preview if URL is valid */}
            {url && (
              <div style={{ marginBottom: '18px', width: '100%', height: '140px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid #e5e7eb', backgroundColor: '#1f2937' }}>
                <img
                  src={resolveMediaUrl(url)}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Photo Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Annual Startup Demo Day"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Caption / Description</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Brief summary of the event or milestone..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              {editingItem && (
                <button
                  type="button"
                  className="btn-pill-outline"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="btn-pill-solid"
                disabled={saving}
              >
                {saving ? 'Saving...' : editingItem ? 'Save Changes' : 'Add to Gallery'}
              </button>
            </div>
          </form>
        </div>

        {/* List of Existing Gallery Images */}
        <div className="gallery-admin-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div className="section-tag">/ PHOTO ARCHIVE</div>
              <h3 style={{ fontSize: '20px', fontWeight: 800 }}>Active Showcase Images</h3>
            </div>
              <span className="admin-description gallery-photo-count">
              {images.length} Photos
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {images.map((item, idx) => (
              <div
                key={item.id || idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #f3f4f6',
                  backgroundColor: 'var(--bg-white)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                }}
              >
                <div style={{ width: '64px', height: '48px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', flexShrink: 0, backgroundColor: '#1f2937' }}>
                  <img
                    src={resolveMediaUrl(item.url)}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.title}
                  </div>
                  <div className="admin-description admin-small-text gallery-caption">
                    {item.desc || 'No caption'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    type="button"
                    className="btn-circle"
                    style={{ width: '32px', height: '32px' }}
                    onClick={() => handleStartEdit(item)}
                    title="Change/Edit image"
                  >
                    <Edit2 size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn-circle"
                    style={{ width: '32px', height: '32px', color: 'var(--accent-rose)' }}
                    onClick={() => setItemToDelete(item)}
                    title="Delete image"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {itemToDelete && createPortal(
        <div className="modal-overlay gallery-delete-overlay" onClick={() => !deleting && setItemToDelete(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '12px' }}>
              Confirm Photo Deletion
            </h3>
            <p className="admin-description delete-description">
              Are you sure you want to remove <strong>"{itemToDelete.title}"</strong> from the showcase gallery?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-pill-outline"
                onClick={() => !deleting && setItemToDelete(null)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="gallery-delete-confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete photo'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

