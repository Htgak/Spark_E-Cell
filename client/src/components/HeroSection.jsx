import React from 'react';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  const scrollToStories = () => {
    document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="about">
      <div className="hero-section">
        <div className="hero-inner">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            Student entrepreneurship at SBIT Khammam
          </div>
          <h1 className="hero-heading">Make room for <em>what’s next.</em></h1>
          <p className="hero-lead">
            Spark E-Cell is where SBIT students turn promising ideas into ventures through community, mentorship and hands-on building.
          </p>
          <div className="hero-cta-row">
            <a href="#features" className="btn-pill-primary">
              Meet the community <ArrowRight size={15} />
            </a>
            <button type="button" className="btn-pill-outline" onClick={scrollToStories}>
              Read our stories <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
