import React, { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const subject = encodeURIComponent(`Spark E-Cell enquiry from ${formData.name}`);
    const body = encodeURIComponent(`${formData.message}\n\n${formData.name}\n${formData.email}${formData.company ? `\n${formData.company}` : ''}`);
    window.location.href = `mailto:ecell@sbit.ac.in?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div className="section-tag">📬 Get in touch</div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-heading)', marginTop: '8px' }}>Contact Spark E-Cell</h3>
          </div>
          <button className="btn-circle" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircle2 size={48} color="#15803d" style={{ margin: '0 auto 16px' }} />
            <h4 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-heading)' }}>Email draft ready</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Your email app should open with this message ready to send.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Company / Venture</label>
              <input
                type="text"
                className="form-input"
                placeholder="Optional"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">How can we assist you?</label>
              <textarea
                required
                className="form-textarea"
                rows={3}
                placeholder="Tell us about your idea or question..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn-pill-outline" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-pill-solid">
                <Send size={15} /> Send Message
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

