"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import gsap from 'gsap';

// Default reviews in case none are provided
const defaultReviews = [
  {
    id: 1,
    name: "Priya Patel",
    rating: 5,
    text: "The AC cleaning service was thorough and efficient. My home feels fresh and cool again. Thank you.",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 2,
    name: "Purvi Patel",
    rating: 5,
    text: "Helper Buddy transformed my home with their exceptional cleaning service. Highly recommend for any cleaning needs.",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: 3,
    name: "Rahul Shah",
    rating: 4,
    text: "Great handyman service! Fixed multiple issues in my apartment in just one visit. Very professional team.",
    avatar: "/api/placeholder/32/32"
  }
];

const Testimonials = ({ initialReviews = defaultReviews }) => {
  const [reviews, setReviews] = useState(Array.isArray(initialReviews) ? initialReviews : defaultReviews);
  const carouselRef = useRef(null);
  const carouselWrapperRef = useRef(null);
  const animation = useRef(null);

  useEffect(() => {
    if (!reviews.length) return; // Guard clause if reviews is empty

    const carousel = carouselRef.current;
    if (!carousel) return; // Guard clause if ref isn't attached

    const firstCard = carousel.children[0];
    if (!firstCard) return; // Guard clause if no children
    
    // Reset position when animation completes
    const resetPosition = () => {
      const lastCardWidth = carousel.children[reviews.length - 1].offsetWidth;
      const totalGap = 32; // 8rem gap
      gsap.set(carousel, { x: -(lastCardWidth + totalGap) });
    };

    // Create seamless infinite scroll
    const createInfiniteScroll = () => {
      const cardWidth = firstCard.offsetWidth;
      const totalGap = 32; // 8rem gap
      const totalWidth = (cardWidth + totalGap) * reviews.length;

      // Kill previous animation if it exists
      if (animation.current) {
        animation.current.kill();
      }

      // Create new animation
      animation.current = gsap.to(carousel, {
        x: -totalWidth,
        duration: reviews.length *5, // Duration based on number of cards
        ease: "none",
        repeat: -1,
        onRepeat: resetPosition,
      });
    };

    // Initial setup
    const setupCarousel = () => {
      // Clone first item and add to end
      var clonedItems = carousel.children[0].cloneNode(true);
      carousel.appendChild(clonedItems);
      clonedItems = carousel.children[1].cloneNode(true);
      carousel.appendChild(clonedItems);
      clonedItems = carousel.children[2].cloneNode(true);
      carousel.appendChild(clonedItems);
      
      createInfiniteScroll();
    };

    setupCarousel();

    // Pause on hover
    const wrapper = carouselWrapperRef.current;
    if (!wrapper) return;

    const handleMouseEnter = () => animation.current?.pause();
    const handleMouseLeave = () => animation.current?.play();

    wrapper.addEventListener('mouseenter', handleMouseEnter);
    wrapper.addEventListener('mouseleave', handleMouseLeave);

    // Cleanup
    return () => {
      if (animation.current) {
        animation.current.kill();
      }
      wrapper.removeEventListener('mouseenter', handleMouseEnter);
      wrapper.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [reviews]);

  const StarRating = ({ rating }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={20}
          className={`${
            index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
          }`}
        />
      ))}
    </div>
  );

  // If no reviews, show loading or empty state
  if (!reviews.length) {
    return (
      <div className="py-12 px-4 bg-[#141414] text-[#EAEAEA] text-center">
        No reviews available
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-[#141414]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-[#EAEAEA]">
            What Our Customers Say
          </h2>
          <p className="text-[#EAEAEA]/80 mb-8">
            Read trusted reviews from our happy customers
          </p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                className="bg-[#EAEAEA] hover:bg-[#EAEAEA]/90 text-[#141414] mb-8"
                onMouseEnter={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1.05,
                    duration: 0.3
                  });
                }}
                onMouseLeave={(e) => {
                  gsap.to(e.currentTarget, {
                    scale: 1,
                    duration: 0.3
                  });
                }}
              >
                Write a Review
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-[#141414] border border-[#EAEAEA]/10">
              <DialogHeader>
                <DialogTitle className="text-[#EAEAEA]">Write Your Review</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-[#EAEAEA]/80">This is a demo component. In a real application, this would contain a form to submit reviews.</p>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div 
          ref={carouselWrapperRef}
          className="relative w-full overflow-hidden h-64"
        >
          <div 
            ref={carouselRef}
            className="flex gap-8 absolute left-0 top-0"
            style={{ width: 'max-content' }}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="w-80 flex-shrink-0"
              >
                <Card className="bg-[#141414] border border-[#EAEAEA]/10 shadow-lg h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={review.avatar}
                        alt={`${review.name}'s avatar`}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-[#EAEAEA]">
                          {review.name}
                        </h3>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    <p className="text-[#EAEAEA]/80">
                      {review.text}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Testimonials;