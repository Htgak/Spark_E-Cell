'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export const items = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1600&q=85',
    title: 'Where Big Ideas Begin',
    desc: 'Curious student minds coming together to build real entrepreneurial momentum.',
    category: 'Campus Life',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1600&q=85',
    title: 'Collaborative Problem Solving',
    desc: 'Cross-functional teams designing solutions for campus and real-world challenges.',
    category: 'Incubation',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1600&q=85',
    title: 'Workshops & Mentorship',
    desc: 'Hands-on bootcamps with industry founders and experienced venture advisors.',
    category: 'Workshops',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1600&q=85',
    title: 'Pitch Competitions & Demo Days',
    desc: 'Presenting student-led prototypes to angel investors and jury panels.',
    category: 'Pitch Deck',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=85',
    title: 'From Sketchbook to Prototype',
    desc: 'Rapid hardware and software prototyping in the E-Cell maker lab.',
    category: 'Innovation',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=85',
    title: 'National Entrepreneurship Challenge',
    desc: 'Representing SBIT Khammam on the national stage at IIT Bombay NEC 2026.',
    category: 'National Stage',
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1600&q=85',
    title: 'Inspiring Future Founders',
    desc: 'Building an enduring legacy of leadership and technical self-reliance.',
    category: 'Leadership',
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=85',
    title: 'Venture Demo Network',
    desc: 'A thriving ecosystem of innovators, alumni, and ecosystem partners.',
    category: 'Ecosystem',
  },
];

export interface CarouselItem {
  id: string | number;
  url: string;
  title?: string;
  desc?: string;
  category?: string;
}

export interface FramerCarouselProps {
  items?: CarouselItem[];
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
  className?: string;
  aspectHeight?: string;
  autoplay?: boolean;
}

export function FramerCarousel({
  items: propItems,
  selectedIndex: controlledIndex,
  onIndexChange,
  className = '',
  aspectHeight = 'h-[500px]',
  autoplay = false,
}: FramerCarouselProps = {}) {
  const displayItems = propItems && propItems.length > 0 ? propItems : items;
  const [internalIndex, setInternalIndex] = useState(0);
  const index = controlledIndex !== undefined ? controlledIndex : internalIndex;

  const setIndex = (i: number | ((prev: number) => number)) => {
    const nextIdx = typeof i === 'function' ? i(index) : i;
    const clamped = Math.max(0, Math.min(displayItems.length - 1, nextIdx));
    if (controlledIndex === undefined) {
      setInternalIndex(clamped);
    }
    if (onIndexChange) {
      onIndexChange(clamped);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || 1;
      const targetX = -index * containerWidth;

      animate(x, targetX, {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      });
    }
  }, [index, x]);

  // Autoplay support
  useEffect(() => {
    if (!autoplay || displayItems.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((curr) => (curr + 1) % displayItems.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [autoplay, displayItems.length]);

  return (
    <div className={`framer-carousel-container lg:p-10 sm:p-4 p-2 max-w-4xl mx-auto ${className}`.trim()}>
      <div className="flex flex-col gap-3">
        <div 
          className="relative overflow-hidden rounded-lg framer-carousel-stage" 
          ref={containerRef}
          style={{ position: 'relative', overflow: 'hidden', borderRadius: '14px', background: '#181b17', boxShadow: '0 20px 50px rgba(0,0,0,0.18)' }}
        >
          <motion.div className="flex" style={{ x, display: 'flex' }}>
            {displayItems.map((item, itemIdx) => (
              <div 
                key={item.id} 
                className={`shrink-0 w-full ${aspectHeight}`}
                style={{ flexShrink: 0, width: '100%', position: 'relative', minHeight: '440px', height: 'clamp(360px, 50vw, 540px)' }}
              >
                <img
                  src={item.url}
                  alt={item.title || 'Carousel image'}
                  className="w-full h-full object-cover rounded-lg select-none pointer-events-none"
                  draggable={false}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
                />

                {/* Caption Overlay */}
                <div 
                  className="framer-carousel-caption"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(180deg, transparent 35%, rgba(0,0,0,0.82) 90%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    padding: 'clamp(20px, 4vw, 36px)',
                    color: '#ffffff',
                    pointerEvents: 'none'
                  }}
                >
                  {item.category && (
                    <span style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#f97316', marginBottom: '6px' }}>
                      {item.category}
                    </span>
                  )}
                  {item.title && (
                    <h3 style={{ fontSize: 'clamp(18px, 3.2vw, 26px)', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', margin: '0 0 6px 0', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
                      {item.title}
                    </h3>
                  )}
                  {item.desc && (
                    <p style={{ fontSize: 'clamp(13px, 2vw, 15px)', color: 'rgba(255,255,255,0.85)', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>

          {/* Previous Button with Lucide icon */}
          <motion.button
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === 0
                  ? 'opacity-40 cursor-not-allowed'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-80'
              }`}
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: index === 0 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.92)',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: index === 0 ? 'not-allowed' : 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              border: 'none',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              opacity: index === 0 ? 0.35 : 0.95
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
          </motion.button>

          {/* Next Button with Lucide icon */}
          <motion.button
            disabled={index === displayItems.length - 1}
            onClick={() => setIndex((i) => Math.min(displayItems.length - 1, i + 1))}
            className={`absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform z-10
              ${
                index === displayItems.length - 1
                  ? 'opacity-40 cursor-not-allowed'
                  : 'bg-white hover:scale-110 hover:opacity-100 opacity-80'
              }`}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: index === displayItems.length - 1 ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.92)',
              color: '#1e293b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: index === displayItems.length - 1 ? 'not-allowed' : 'pointer',
              zIndex: 10,
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              border: 'none',
              transition: 'transform 0.2s ease, opacity 0.2s ease',
              opacity: index === displayItems.length - 1 ? 0.35 : 0.95
            }}
            aria-label="Next slide"
          >
            <ChevronRight size={22} strokeWidth={2.5} />
          </motion.button>

          {/* Progress Indicator Dots */}
          <div 
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-white/20 rounded-xl border border-white/30 backdrop-blur-sm"
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.25)',
              zIndex: 10
            }}
          >
            {displayItems.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                style={{
                  height: '6px',
                  width: i === index ? '24px' : '6px',
                  borderRadius: '999px',
                  backgroundColor: i === index ? '#ffffff' : 'rgba(255,255,255,0.4)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.25s ease'
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FramerCarousel;

