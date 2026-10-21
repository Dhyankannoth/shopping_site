import React, { useState, useRef, useCallback } from 'react';
import { MoveUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const THEMES = [
  {
    id: 'footwear',
    name: 'Footwear',
    tag: 'Signature Silhouettes',
    title: 'Products How You Like Them',
    desc: 'Crafted silhouettes engineered for everyday performance and bold identity. Handpicked for quality, comfort, and uncompromising aesthetic.',
    projects: [
      {
        id: 'fw-01',
        img: 'https://cdn.21st.dev/assets/mirror/f2/f267202371f1d7603ebceea7cbcac251b6a9f5b035f6ff48146e0e29f85736d8.jpg',
        title: 'Distrokings',
        des: 'We make your logo communicate with your customers more than words ever could',
      },
      {
        id: 'fw-02',
        img: 'https://cdn.21st.dev/assets/mirror/ac/ac1b54879a9289f1cf908a8e6e7e4da09828ddd43eef95cae78a0c71cb748c29.jpg',
        title: 'Profitables',
        des: 'We are dedicated to unlocking your business potential through precision development',
      },
      {
        id: 'fw-03',
        img: 'https://cdn.21st.dev/assets/mirror/94/94876618573b337e94fc0f2716364c23a6f4e486ccb75e5a25a91af75dd30ca5.jpg',
        title: 'Topserve-copiers',
        des: 'We are dedicated to unlocking your business potential through precision development',
      },
      {
        id: 'fw-04',
        img: 'https://cdn.21st.dev/assets/mirror/fc/fc8b7c4531f5c2a277663830ae19cac5569b9e36c97a65e3bd6a515f4435aeb9.jpg',
        title: 'Labramart.',
        des: 'We specialize in crafting marketing solutions that propel your brand to new heights',
      },
    ],
  },
  {
    id: 'apparel',
    name: 'Clothes & Streetwear',
    tag: 'Apparel Editorial',
    title: 'Clothes How You Wear Them',
    desc: 'Heavyweight organic loopback fleece, technical windbreaker shells, and structured overcoats tailored for effortless layering.',
    projects: [
      {
        id: 'ap-01',
        img: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=1200&auto=format&fit=crop&q=80',
        title: 'Monochrome Studio',
        des: 'Heavyweight 450GSM loopback fleece engineered with relaxed dropped shoulders',
      },
      {
        id: 'ap-02',
        img: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&auto=format&fit=crop&q=80',
        title: 'AeroForm Outerwear',
        des: 'Three-layer waterproof technical shell designed for versatile modular layering',
      },
      {
        id: 'ap-03',
        img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop&q=80',
        title: 'Nordic Trench',
        des: 'Minimalist structured silhouette constructed from water-repellent gabardine',
      },
      {
        id: 'ap-04',
        img: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=1200&auto=format&fit=crop&q=80',
        title: 'Organic Atelier',
        des: 'Double-needle ribbing and pre-shrunk combed organic cotton jersey crewneck',
      },
    ],
  },
  {
    id: 'lifestyle',
    name: 'Tech & Everyday Carry',
    tag: 'Modern Essentials',
    title: 'Gear How You Carry It',
    desc: 'Precision matte timepieces, studio-grade planar acoustic drivers, and vegetable-tanned leather crafted for daily commutes.',
    projects: [
      {
        id: 'ls-01',
        img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop&q=80',
        title: 'Chronos Matte',
        des: 'Precision movement housed in sapphire crystal and bead-blasted surgical steel',
      },
      {
        id: 'ls-02',
        img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&auto=format&fit=crop&q=80',
        title: 'Aura Studio ANC',
        des: 'Active acoustic drivers with low-latency lossless playback and plush ear cushions',
      },
      {
        id: 'ls-03',
        img: 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=1200&auto=format&fit=crop&q=80',
        title: 'Kobenhavn Carry',
        des: 'Vegetable-tanned full-grain leather reinforced with brass hardware and laptop sleeve',
      },
      {
        id: 'ls-04',
        img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=1200&auto=format&fit=crop&q=80',
        title: 'Solaris Eclipse',
        des: 'Hand-polished bio-acetate frames featuring polarized UV400 lenses and five-barrel hinges',
      },
    ],
  },
];

export default function ConditionGrid() {
  const [activeThemeIdx, setActiveThemeIdx] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef(0);
  const isPointerDownRef = useRef(false);

  const activeTheme = THEMES[activeThemeIdx];

  const handlePrev = useCallback(() => {
    setActiveThemeIdx((prev) => (prev - 1 + THEMES.length) % THEMES.length);
  }, []);

  const handleNext = useCallback(() => {
    setActiveThemeIdx((prev) => (prev + 1) % THEMES.length);
  }, []);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    dragStartXRef.current = e.touches[0].clientX;
    isPointerDownRef.current = true;
    setIsDragging(true);
  };

  const handleTouchMove = (e) => {
    if (!isPointerDownRef.current) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - dragStartXRef.current;
    setDragOffset(diff);
  };

  const handleTouchEnd = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (dragOffset < -60) {
      handleNext();
    } else if (dragOffset > 60) {
      handlePrev();
    }
    setDragOffset(0);
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    dragStartXRef.current = e.clientX;
    isPointerDownRef.current = true;
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isPointerDownRef.current) return;
    const diff = e.clientX - dragStartXRef.current;
    setDragOffset(diff);
  };

  const handleMouseUp = () => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;
    setIsDragging(false);

    if (dragOffset < -60) {
      handleNext();
    } else if (dragOffset > 60) {
      handlePrev();
    }
    setDragOffset(0);
  };

  const handleCardClick = () => {
    if (Math.abs(dragOffset) > 8) return; // Prevent card click when swiping
    const el = document.getElementById('catalogue-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="condition-grid-section" aria-label="Featured Collection Showcase">
      {/* Editorial Header */}
      <div className="condition-grid-header">
        <span className="condition-grid-tag">
          {activeTheme.tag}
        </span>
        <h2 className="condition-grid-title">
          {activeTheme.title}
        </h2>
        <p className="condition-grid-desc">
          {activeTheme.desc}
        </p>

        {/* Theme Category Switcher Pills */}
        <div className="condition-grid-theme-pills" role="tablist" aria-label="Product theme categories">
          {THEMES.map((theme, idx) => (
            <button
              key={theme.id}
              role="tab"
              aria-selected={idx === activeThemeIdx}
              onClick={() => setActiveThemeIdx(idx)}
              className={`condition-grid-theme-pill ${idx === activeThemeIdx ? 'active' : ''}`}
            >
              {theme.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid Wrapper with Side Navigation Arrows and Smooth Sliding Track */}
      <div className="condition-grid-stage">
        {/* Left Side Arrow Button */}
        <button
          className="condition-side-arrow condition-side-arrow-left"
          onClick={handlePrev}
          aria-label="Previous theme"
          title="Previous theme"
        >
          <ChevronLeft size={22} strokeWidth={2.4} />
        </button>

        {/* Sliding Carousel Track Viewport */}
        <div
          className="condition-grid-viewport"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <div
            className="condition-grid-sliding-track"
            style={{
              transform: `translateX(calc(-${activeThemeIdx * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.62s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {THEMES.map((theme) => (
              <div key={theme.id} className="condition-grid-slide">
                <div className="condition-grid-container">
                  {theme.projects.map((project, index) => {
                    let colSpanClass = 'condition-grid-item-col-6';
                    if (index === 0) {
                      colSpanClass = 'condition-grid-item-col-5';
                    } else if (index === 1) {
                      colSpanClass = 'condition-grid-item-col-7';
                    } else if (index === theme.projects.length - 2) {
                      colSpanClass = 'condition-grid-item-col-7';
                    } else if (index === theme.projects.length - 1) {
                      colSpanClass = 'condition-grid-item-col-5';
                    }

                    return (
                      <article
                        key={project.id ?? project.title}
                        className={`condition-grid-item ${colSpanClass}`}
                        onClick={handleCardClick}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCardClick();
                          }
                        }}
                        aria-label={`Explore ${project.title} in catalogue`}
                      >
                        <div className="condition-grid-img-wrap">
                          <img
                            src={project.img}
                            alt={project.title}
                            loading="lazy"
                            className="condition-grid-img"
                            draggable={false}
                          />
                        </div>

                        <div className="condition-grid-overlay">
                          <h3 className="condition-grid-title-pill">
                            {project.title}
                          </h3>
                          <div className="condition-grid-arrow-btn" aria-hidden="true">
                            <MoveUpRight size={18} strokeWidth={2.4} />
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side Arrow Button */}
        <button
          className="condition-side-arrow condition-side-arrow-right"
          onClick={handleNext}
          aria-label="Next theme"
          title="Next theme"
        >
          <ChevronRight size={22} strokeWidth={2.4} />
        </button>
      </div>

      {/* Compact Theme Progress Indicators */}
      <div className="condition-grid-pagination" aria-hidden="true">
        {THEMES.map((_, idx) => (
          <span
            key={idx}
            className={`condition-grid-dot ${idx === activeThemeIdx ? 'active' : ''}`}
            onClick={() => setActiveThemeIdx(idx)}
          />
        ))}
      </div>
    </section>
  );
}
