import React from 'react';
import { motion } from 'motion/react';

export default function HeroSection() {
  const scrollToStories = () => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section id="about">
      <div className="hero-section hero-redesign">
        <div className="hero-inner hero-redesign-inner">
          {/* Left Column: Heading, Lead, CTAs */}
          <div className="hero-left-content">
            <motion.div 
              className="hero-eyebrow" 
              initial={{ opacity: 0, y: 14 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.55 }}
            >
              <span className="hero-eyebrow-dot" />
               Student entrepreneurship · SBIT Khammam
            </motion.div>

            <motion.h1 
              className="hero-heading hero-redesign-heading" 
              initial={{ opacity: 0, y: 26 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.72, delay: 0.08, ease: [0.2, 0.75, 0.2, 1] }}
            >
              Make room for <em>what’s next.</em>
            </motion.h1>

            <motion.p 
              className="hero-lead" 
              initial={{ opacity: 0, y: 18 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Spark E-Cell is where SBIT students turn promising ideas into ventures through community, mentorship, hackathons and hands-on building.
            </motion.p>

            <motion.div 
              className="hero-cta-row" 
              initial={{ opacity: 0, y: 14 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <a href="#features" className="btn-pill-primary">
                Find your starting point
              </a>
              <button type="button" className="btn-pill-outline" onClick={scrollToStories}>
                Read our stories
              </button>
            </motion.div>
          </div>

          {/* Right Column: ONLY the Spark E-Cell Logo (no borders, no text, no card) */}
          <motion.div 
            className="hero-logo-showcase hero-logo-showcase-pure" 
            initial={{ opacity: 0, scale: 0.92, y: 16 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            transition={{ duration: 0.75, delay: 0.18, ease: [0.2, 0.75, 0.2, 1] }}
          >
            <img 
              src="/images/spark-ecell-logo.png" 
              alt="Spark E-Cell Logo" 
              className="hero-pure-logo"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}



