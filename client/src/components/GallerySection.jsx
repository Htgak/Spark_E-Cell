import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, Play, Pause, Maximize2 } from 'lucide-react';
import { fetchGallery } from '../api';

const defaultFallbackImages = [
  {
    id: 'img-1',
    title: 'Spark E-Cell at SBIT',
    desc: 'A community for students ready to explore entrepreneurship.',
    url: '/images/spark-ecell-logo.png'
  }
];

export default function GallerySection() {
  const [images, setImages] = useState(defaultFallbackImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [lightboxImage, setLightboxImage] = useState(null);

  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const timerRef = useRef(null);
  const SLIDE_DURATION = 3500;

  useEffect(() => {
    fetchGallery()
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isPlaying || isDragging || lightboxImage || images.length <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalTime = 50;
    const step = (intervalTime / SLIDE_DURATION) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % images.length);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isPlaying, isDragging, lightboxImage, images.length, currentIndex]);

  const changeIndex = (newIdx) => {
    setCurrentIndex(newIdx);
    setProgress(0);
  };

  const handlePrev = () => changeIndex(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  const handleNext = () => changeIndex((currentIndex + 1) % images.length);

  // Mouse drag
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.clientX;
    setDragOffset(0);
  };
  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    setDragOffset(e.clientX - startXRef.current);
  };
  const handleMouseUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (dragOffset < -50) handleNext();
    else if (dragOffset > 50) handlePrev();
    setDragOffset(0);
  };

  // Touch drag
  const handleTouchStart = (e) => {
    isDraggingRef.current = true;
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    setDragOffset(0);
  };
  const handleTouchMove = (e) => {
    if (!isDraggingRef.current) return;
    setDragOffset(e.touches[0].clientX - startXRef.current);
  };
  const handleTouchEnd = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    if (dragOffset < -40) handleNext();
    else if (dragOffset > 40) handlePrev();
    setDragOffset(0);
  };

  const currentItem = images[currentIndex] || images[0];

  return (
    <section className="gallery-section section-wrapper" id="gallery">
      <div className="section-inner">
        {/* Header */}
        <div className="gallery-header">
          <div>
            <div className="section-tag">📸 Gallery</div>
            <h2 className="section-title">Incubator in Action</h2>
            <p className="section-lead" style={{ marginTop: '6px' }}>
              Events, workshops, and moments from the Spark E-Cell journey.
            </p>
          </div>

          <div className="gallery-header-right">
            {/* Play / Pause */}
            <button
              type="button"
              className="btn-pill-outline btn-pill-sm"
              onClick={() => setIsPlaying(!isPlaying)}
              title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              {isPlaying ? 'Pause' : 'Play'}
            </button>

            {/* Counter */}
            <span className="gallery-count-badge">
              {String(currentIndex + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
            </span>

            {/* Arrows */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-circle" onClick={handlePrev} aria-label="Previous">
                <ArrowLeft size={16} />
              </button>
              <button type="button" className="btn-circle" onClick={handleNext} aria-label="Next">
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Main carousel stage */}
        <div
          className="gallery-stage"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            backgroundColor: 'rgba(255,255,255,0.25)', zIndex: 20
          }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              backgroundColor: '#ffffff', transition: 'width 0.05s linear'
            }} />
          </div>

          {/* Fullscreen btn */}
          <button
            type="button"
            onClick={() => setLightboxImage(currentItem)}
            className="btn-circle"
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 15,
              backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)',
              color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)'
            }}
            title="View fullscreen"
            aria-label="Fullscreen"
          >
            <Maximize2 size={15} />
          </button>

          {/* Slides */}
          <div style={{
            display: 'flex', height: '100%', width: '100%',
            transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
            transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)'
          }}>
            {images.map((img, idx) => (
              <div
                key={img.id || idx}
                style={{ minWidth: '100%', width: '100%', height: '100%', position: 'relative' }}
                onClick={() => { if (Math.abs(dragOffset) < 10) setLightboxImage(img); }}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }}
                />
                <div className="gallery-overlay-light">
                  <h3 style={{
                    fontSize: 'clamp(17px, 3.5vw, 23px)', fontWeight: 800,
                    letterSpacing: '-0.02em', marginBottom: '5px', color: '#ffffff'
                  }}>
                    {img.title}
                  </h3>
                  {img.desc && (
                    <p style={{ fontSize: 'clamp(13px, 2.5vw, 14.5px)', color: 'rgba(255,255,255,0.8)', maxWidth: '600px', lineHeight: '1.5' }}>
                      {img.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thumbnails */}
        <div className="gallery-thumbnails-strip">
          {images.map((img, idx) => {
            const isActive = currentIndex === idx;
            return (
              <button
                key={img.id || idx}
                type="button"
                className="gallery-thumb-btn"
                onClick={() => changeIndex(idx)}
                style={{
                  border: isActive ? '2.5px solid var(--accent-blue)' : '2px solid var(--border-subtle)',
                  opacity: isActive ? 1 : 0.6,
                  transform: isActive ? 'scale(1.05)' : 'scale(1)'
                }}
                title={img.title}
                aria-label={`Photo ${idx + 1}`}
              >
                <img src={img.url} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="modal-overlay" onClick={() => setLightboxImage(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '940px', padding: 0, overflow: 'hidden', maxHeight: '92vh', position: 'relative' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'relative', width: '100%', height: 'clamp(280px, 55vw, 520px)', display: 'flex' }}>
              <img src={lightboxImage.url} alt={lightboxImage.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

              {/* Close */}
              <button
                className="btn-circle"
                style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', zIndex: 10 }}
                onClick={() => setLightboxImage(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Prev */}
              <button
                type="button" className="btn-circle"
                style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', zIndex: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  const prev = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
                  changeIndex(prev);
                  setLightboxImage(images[prev]);
                }}
                aria-label="Previous"
              >
                <ArrowLeft size={16} />
              </button>

              {/* Next */}
              <button
                type="button" className="btn-circle"
                style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', borderColor: 'rgba(255,255,255,0.2)', zIndex: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  const next = (currentIndex + 1) % images.length;
                  changeIndex(next);
                  setLightboxImage(images[next]);
                }}
                aria-label="Next"
              >
                <ArrowRight size={16} />
              </button>
            </div>

            <div style={{ padding: '24px 32px' }}>
              <h3 style={{ fontSize: 'clamp(17px, 3.5vw, 21px)', fontWeight: 800, marginBottom: '8px', color: 'var(--text-heading)' }}>
                {lightboxImage.title}
              </h3>
              {lightboxImage.desc && (
                <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6' }}>
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
