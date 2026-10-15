import React, { useState, useEffect } from 'react';
import { X, Maximize2, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchGallery, resolveMediaUrl } from '../api';
import { FramerCarousel } from '@/components/ui/framer-carousel';

const defaultFallbackImages = [
  { id: 'campus', title: 'Where big ideas find their beginning', desc: 'A curious community, building the confidence to turn “what if?” into “what’s next.”', url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=2000&q=85', category: 'Campus life' },
  { id: 'teamwork', title: 'Better ideas happen together', desc: 'Different perspectives. One table. A hundred ways to move forward.', url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2000&q=85', category: 'The community' },
  { id: 'workshop', title: 'Make room for the messy first draft', desc: 'Workshops that turn early curiosity into practical momentum.', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=85', category: 'Workshops' },
  { id: 'pitch', title: 'Every venture starts with a voice', desc: 'Share your thinking, find your people, and take the next step.', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=2000&q=85', category: 'Ideas in action' },
  { id: 'build', title: 'From sketchbook to something real', desc: 'Try, learn, iterate. Progress is built one small experiment at a time.', url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2000&q=85', category: 'Building together' },
  { id: 'event', title: 'A campus full of possibility', desc: 'Meet the people and moments that make the Spark community.', url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=2000&q=85', category: 'Community' },
];

export default function GallerySection() {
  const [images, setImages] = useState(defaultFallbackImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    fetchGallery()
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setImages(data);
        }
      })
      .catch(() => {});
  }, []);

  // Map to format required by FramerCarousel
  const carouselItems = images.map((img, idx) => ({
    id: img.id || idx,
    url: resolveMediaUrl(img.url),
    title: img.title || 'Spark E-Cell Innovation Showcase',
    desc: img.desc || '',
    category: img.category || 'SPARK E-CELL · SBIT',
  }));

  const currentItem = carouselItems[currentIndex] || carouselItems[0];

  return (
    <section className="gallery-section section-wrapper" id="gallery">
      <div className="section-inner">
        {/* Gallery Header */}
        <div className="gallery-header">
          <div>
            <div className="section-tag">
               A FEEL FOR SPARK
            </div>
            <h2 className="section-title">
              Big ideas start <em>somewhere.</em>
            </h2>
            <p className="section-lead" style={{ marginTop: '6px' }}>
              A glimpse into the people, experiments and little breakthroughs behind our entrepreneurial community.
            </p>
          </div>

          <div className="gallery-header-right">
            {/* Slide Index Counter */}
            <span className="gallery-count-badge">
              {String(currentIndex + 1).padStart(2, '0')} / {String(carouselItems.length).padStart(2, '0')}
            </span>

            {/* Lightbox Trigger */}
            <button
              type="button"
              className="btn-circle"
              onClick={() => setLightboxImage(currentItem)}
              title="Open full view"
              aria-label="Fullscreen view"
            >
              <Maximize2 size={16} />
            </button>
          </div>
        </div>

        {/* Integrated Framer Carousel Component */}
        <div style={{ position: 'relative', width: '100%' }}>
          <FramerCarousel
            items={carouselItems}
            selectedIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            autoplay={true}
            className="p-0 max-w-full"
          />
        </div>

        {/* Quick Nav Thumbnails */}
        <div className="gallery-thumbnails-strip" style={{ marginTop: '16px' }}>
          {carouselItems.map((img, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={img.id}
                type="button"
                className={`gallery-thumb-btn${isActive ? ' is-active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  border: isActive ? '2.5px solid var(--accent-blue)' : '2px solid var(--border-subtle)',
                  opacity: isActive ? 1 : 0.65,
                  transform: isActive ? 'scale(1.04)' : 'scale(1)',
                }}
                title={img.title}
                aria-label={`Photo ${idx + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div className="modal-overlay" onClick={() => setLightboxImage(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '960px', padding: 0, overflow: 'hidden', maxHeight: '92vh', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 55vw, 540px)', display: 'flex' }}>
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Close Button */}
              <button
                type="button"
                className="btn-circle"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.25)',
                  zIndex: 10,
                }}
                onClick={() => setLightboxImage(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Prev in Modal */}
              <button
                type="button"
                className="btn-circle"
                style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.25)',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const prev = currentIndex > 0 ? currentIndex - 1 : carouselItems.length - 1;
                  setCurrentIndex(prev);
                  setLightboxImage(carouselItems[prev]);
                }}
                aria-label="Previous"
              >
                <ChevronLeft size={18} />
              </button>

              {/* Next in Modal */}
              <button
                type="button"
                className="btn-circle"
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.25)',
                  zIndex: 10,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  const next = (currentIndex + 1) % carouselItems.length;
                  setCurrentIndex(next);
                  setLightboxImage(carouselItems[next]);
                }}
                aria-label="Next"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent-blue)', textTransform: 'uppercase' }}>
                {lightboxImage.category}
              </span>
              <h3 style={{ fontSize: 'clamp(17px, 3.5vw, 22px)', fontWeight: 800, margin: '6px 0 8px', color: 'var(--text-heading)' }}>
                {lightboxImage.title}
              </h3>
              {lightboxImage.desc && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6', margin: 0 }}>
                  {lightboxImage.desc}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}


