'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Service } from '../types';
import { ServiceCard } from './ServiceCard';

interface ServiceCarouselProps {
  title: string;
  services: Service[];
}

export const ServiceCarousel = ({ title, services }: ServiceCarouselProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const calculateVisibleCards = useCallback(() => {
    if (typeof window === 'undefined') return 5;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 768) return 3;
    if (window.innerWidth < 1024) return 4;
    return 5;
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setVisibleCards(calculateVisibleCards());
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateVisibleCards]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX - translateX);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const containerWidth = carouselRef.current?.offsetWidth || 0;
    const slideWidth = containerWidth / visibleCards;
    const newIndex = Math.round(-translateX / slideWidth);
    
    const maxIndex = services.length - visibleCards;
    const boundedIndex = Math.max(0, Math.min(newIndex, maxIndex));
    
    setCurrentIndex(boundedIndex);
    setTranslateX(-boundedIndex * slideWidth);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const walk = clientX - startX;
    
    const containerWidth = carouselRef.current?.offsetWidth || 0;
    const maxTranslate = -(services.length - visibleCards) * (containerWidth / visibleCards);
    
    let newTranslate = Math.max(maxTranslate, Math.min(0, walk));
    setTranslateX(newTranslate);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => {
      const nextIndex = prev + 1;
      const maxIndex = services.length - visibleCards;
      return nextIndex > maxIndex ? 0 : nextIndex;
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => {
      const prevIndex = prev - 1;
      const maxIndex = services.length - visibleCards;
      return prevIndex < 0 ? maxIndex : prevIndex;
    });
  };

  useEffect(() => {
    if (!isDragging) {
      const containerWidth = carouselRef.current?.offsetWidth || 0;
      const slideWidth = containerWidth / visibleCards;
      setTranslateX(-currentIndex * slideWidth);
    }
  }, [currentIndex, visibleCards, isDragging]);

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        {title}
      </h2>
      <div className="relative px-16">
        {services.length > visibleCards && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-110 md:block hidden"
              style={{ left: '2rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 p-3 rounded-full shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-110 md:block hidden"
              style={{ right: '2rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
        <div 
          className="overflow-hidden select-none"
          ref={carouselRef}
        >
          <div 
            className={`flex transition-transform duration-300 ease-in-out ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{
              transform: `translateX(${translateX}px)`,
              touchAction: 'pan-x',
            }}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            onMouseMove={handleDragMove}
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
            onTouchMove={handleDragMove}
          >
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};