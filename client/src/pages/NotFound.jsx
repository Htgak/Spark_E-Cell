import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="canvas-card" style={{ maxWidth: '600px', margin: '40px auto', textAlign: 'center', padding: '60px 32px' }}>
      <Compass size={48} style={{ color: '#4b5563', margin: '0 auto 16px' }} />
      <div className="section-tag" style={{ justifyContent: 'center' }}>/ 404 NOT FOUND</div>
      <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '12px' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '28px', lineHeight: '1.6' }}>
        The page you’re looking for doesn’t exist. Check the address or head back to Spark E-Cell.
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link to="/" className="btn-pill-solid">
          Return to Homepage
        </Link>
        <Link to="/admin" className="btn-pill-outline">
          Admin Portal
        </Link>
      </div>
    </div>
  );
}

