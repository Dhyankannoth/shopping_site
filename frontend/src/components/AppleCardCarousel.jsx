import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react';

const cards = [
  {
    id: '1',
    category: 'Technology',
    title: (
      <>
        Powerful solutions,
        <br /> beautifully engineered.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&auto=format&fit=crop&q=80',
    alt: 'Cutting-edge modern technology workspace and devices',
  },
  {
    id: '2',
    category: 'Clothes & Fashion',
    title: (
      <>
        Attention to detail,
        <br /> from start to finish.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80',
    alt: 'High-end apparel and curated fashion styling',
  },
  {
    id: '3',
    category: 'Sneakers & Footwear',
    title: (
      <>
        Precision silhouettes,
        <br /> engineered for every stride.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=1200&auto=format&fit=crop&q=80',
    alt: 'Contemporary designer footwear on clean backdrop',
  },
  {
    id: '4',
    category: 'Health & Fitness',
    title: (
      <>
        Peak performance,
        <br /> built for body and mind.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1200&auto=format&fit=crop&q=80',
    alt: 'Active health, fitness gear and training lifestyle',
  },
  {
    id: '5',
    category: 'Living & Workspace',
    title: (
      <>
        Intentional spaces,
        <br /> inspired modern living.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=1200&auto=format&fit=crop&q=80',
    alt: 'Architectural interior living and minimalist workspace',
  },
  {
    id: '6',
    category: 'Timepieces & Essentials',
    title: (
      <>
        Timeless craftsmanship,
        <br /> ready to lead.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
    alt: 'Minimalist luxury timepiece and everyday carry accessories',
  },
  {
    id: '7',
    category: 'Audio & Acoustics',
    title: (
      <>
        Pure soundstage,
        <br /> zero distraction.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
    alt: 'High-fidelity audio studio headphones and sound engineering',
  },
  {
    id: '8',
    category: 'Outdoor & Exploration',
    title: (
      <>
        All-weather protection,
        <br /> ready for every terrain.
      </>
    ),
    src: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?w=1200&auto=format&fit=crop&q=80',
    alt: 'Technical outdoor outerwear and adventure exploration',
  },
];

export default function AppleCardCarousel({ onSelectCategory }) {
  const scrollContainerRef = useRef(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollPrev(scrollLeft > 10);
    setCanScrollNext(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    checkScrollability();
    el.addEventListener('scroll', checkScrollability, { passive: true });
    window.addEventListener('resize', checkScrollability);
    return () => {
      el.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [checkScrollability]);

  const scrollPrev = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.clientWidth < 640 ? 280 : 360;
    scrollContainerRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
  };

  const scrollNext = () => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.clientWidth < 640 ? 280 : 360;
    scrollContainerRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
  };

  const handleCardClick = (card) => {
    if (onSelectCategory) {
      onSelectCategory(card.category);
    }
  };

  return (
    <section className="apple-carousel-section" id="catalogue-section" aria-label="Curated Categories Carousel">
      {/* Header */}
      <div className="apple-carousel-header">
        <h2 className="apple-carousel-title">
          Get to know Yourself.
        </h2>
        <p className="apple-carousel-subtitle">
          Curated essentials across technology, fashion, footwear, and modern living.
        </p>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollContainerRef}
        className="apple-carousel-track"
        tabIndex={0}
        role="region"
        aria-label="Product categories carousel"
      >
        {cards.map((card) => (
          <article
            key={card.id}
            className="apple-card-item"
            onClick={() => handleCardClick(card)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCardClick(card);
              }
            }}
            aria-label={`Explore ${card.category}: ${typeof card.title === 'string' ? card.title : card.category}`}
          >
            {/* Background Image */}
            <img
              src={card.src}
              alt={card.alt}
              loading="lazy"
              className="apple-card-bg-img"
            />

            {/* Gradient Scrim for Contrast */}
            <div className="apple-card-scrim" />

            {/* Top Text Content */}
            <div className="apple-card-content">
              <span className="apple-card-category">
                {card.category}
              </span>
              <h3 className="apple-card-heading">
                {card.title}
              </h3>
            </div>

            {/* Bottom-right Action Button */}
            <div className="apple-card-action">
              <div className="apple-card-btn" aria-hidden="true">
                <ArrowUpRight className="apple-card-icon" size={18} strokeWidth={2.4} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="apple-carousel-controls">
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          className="apple-control-btn"
          aria-label="Scroll left"
          title="Scroll left"
        >
          <ArrowLeft size={18} strokeWidth={2.2} />
        </button>
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          className="apple-control-btn"
          aria-label="Scroll right"
          title="Scroll right"
        >
          <ArrowRight size={18} strokeWidth={2.2} />
        </button>
      </div>
    </section>
  );
}
