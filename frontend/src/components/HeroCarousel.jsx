import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlides } from '../data/heroSlides';

const AUTO_SLIDE_INTERVAL = 3000; // 3 seconds interval

export default function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused]         = useState(false);
  const touchStartX = useRef(0);
  const touchEndX   = useRef(0);

  const totalSlides = heroSlides.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Auto-slide effect with 3 seconds interval
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const id = setInterval(nextSlide, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [isPaused, nextSlide, totalSlides, currentIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; setIsPaused(true); };
  const handleTouchMove  = (e) => { touchEndX.current   = e.touches[0].clientX; };
  const handleTouchEnd   = () => {
    const dist = touchStartX.current - touchEndX.current;
    if (Math.abs(dist) > 50) dist > 0 ? nextSlide() : prevSlide();
    setIsPaused(false);
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft')  prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  };

  return (
    <section
      className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[650px] overflow-hidden bg-white select-none group"
      aria-label="Hero Carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* ── Horizontal Sliding Track (Smooth 600ms Transition) ── */}
      <div
        className="flex w-full h-full transition-transform duration-600 ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          willChange: 'transform',
        }}
      >
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="w-full h-full flex-shrink-0 relative overflow-hidden"
            aria-hidden={index !== currentIndex}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-full object-cover object-top select-none"
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
            {/* Subtle 18% Dark Transparent Overlay */}
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
          </div>
        ))}
      </div>

      {/* ── Center Overlay: "Welcome to Reeyansh Aya Care" + "About" Button ── */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
        <div className="max-w-2xl mx-auto flex flex-col items-center animate-fade-in">
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] mb-3 sm:mb-5">
            Welcome to Reeyansh Aya Care
          </h1>
          <Link
            to="/about"
            className="pointer-events-auto inline-flex items-center justify-center px-5 sm:px-7 py-2 sm:py-3 rounded-full bg-blue-950/90 hover:bg-blue-900 text-white text-xs sm:text-base font-semibold shadow-lg hover:shadow-xl border border-white/30 backdrop-blur-xs transition-all duration-200 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            About
          </Link>
        </div>
      </div>

      {/* ── Previous Arrow ── */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Previous slide"
        className="absolute left-2 sm:left-5 md:left-8 top-1/2 -translate-y-1/2 z-25
                   w-8 h-8 sm:w-11 sm:h-11 rounded-full
                   bg-white/80 hover:bg-white text-slate-800
                   shadow-md hover:shadow-lg backdrop-blur-xs
                   flex items-center justify-center
                   transition-all duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-950
                   cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>

      {/* ── Next Arrow ── */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Next slide"
        className="absolute right-2 sm:right-5 md:right-8 top-1/2 -translate-y-1/2 z-25
                   w-8 h-8 sm:w-11 sm:h-11 rounded-full
                   bg-white/80 hover:bg-white text-slate-800
                   shadow-md hover:shadow-lg backdrop-blur-xs
                   flex items-center justify-center
                   transition-all duration-200
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-950
                   cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* ── Slide Indicator Dots ── */}
      <div
        className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-25
                   flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full
                   bg-black/25 backdrop-blur-xs"
        role="tablist"
        aria-label="Slides"
      >
        {heroSlides.map((slide, index) => {
          const isActive = index === currentIndex;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${index + 1} of ${totalSlides}`}
              onClick={() => goToSlide(index)}
              className={`h-2 sm:h-2.5 rounded-full transition-all duration-300
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
                          cursor-pointer ${
                            isActive
                              ? 'w-6 sm:w-8 bg-white shadow-sm'
                              : 'w-2 sm:w-2.5 bg-white/55 hover:bg-white/85'
                          }`}
            />
          );
        })}
      </div>
    </section>
  );
}
