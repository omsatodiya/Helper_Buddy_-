"use client"
import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import gsap from 'gsap';

interface Review {
  id: number;
  name: string;
  rating: number;
  text: string;
  avatar: string;
}

// Default reviews in case none are provided
const defaultReviews: Review[] = [
  {
    id: 1,
    name: "Priya Patel",
    rating: 5,
    text: "The AC cleaning service was thorough and efficient. My home feels fresh and cool again. Thank you.",
    avatar: "https://picsum.photos/seed/priya/100/100"
  },
  {
    id: 2,
    name: "Purvi Patel",
    rating: 5,
    text: "Helper Buddy transformed my home with their exceptional cleaning service. Highly recommend for any cleaning needs.",
    avatar: "https://picsum.photos/seed/purvi/100/100"
  },
  {
    id: 3,
    name: "Rahul Shah",
    rating: 4,
    text: "Great handyman service! Fixed multiple issues in my apartment in just one visit. Very professional team.",
    avatar: "https://picsum.photos/seed/rahul/100/100"
  },
  {
    id: 4,
    name: "Jay Patel",
    rating: 4,
    text: "Great handyman service! Fixed multiple issues in my apartment in just one visit. Very professional team.",
    avatar: "https://picsum.photos/seed/jay/100/100"
  },
  {
    id: 5,
    name: "Pura Shah",
    rating: 4,
    text: "Great handyman service! Fixed multiple issues in my apartment in just one visit. Very professional team.",
    avatar: "https://picsum.photos/seed/pura/100/100"
  },
  {
    id: 6,
    name: "Satu Patel",
    rating: 4,
    text: "Great handyman service! Fixed multiple issues in my apartment in just one visit. Very professional team.",
    avatar: "https://picsum.photos/seed/satu/100/100"
  }
];

interface TestimonialsProps {
  initialReviews?: Review[];
}

interface StarRatingProps {
  rating: number;
}

const Testimonials: React.FC<TestimonialsProps> = ({ initialReviews = defaultReviews }) => {
  const reviews = Array.isArray(initialReviews) ? initialReviews : defaultReviews;
  const carouselRef = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const animation = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    if (!reviews.length) return;

    const carousel = carouselRef.current;
    if (!carousel) return;

    const firstCard = carousel.children[0] as HTMLElement;
    if (!firstCard) return;
    
    // Reset position when animation completes
    const resetPosition = () => {
      const lastCard = carousel.children[reviews.length - 1] as HTMLElement;
      const lastCardWidth = lastCard.offsetWidth;
      const totalGap = 32;
      gsap.set(carousel, { x: -(lastCardWidth + totalGap) });
    };

    // Create seamless infinite scroll
    const createInfiniteScroll = () => {
      const cardWidth = firstCard.offsetWidth;
      const totalGap = 32;
      const totalWidth = (cardWidth + totalGap) * reviews.length;

      if (animation.current) {
        animation.current.kill();
      }

      animation.current = gsap.to(carousel, {
        x: -totalWidth,
        duration: reviews.length * 5,
        ease: "none",
        repeat: -1,
        onRepeat: resetPosition,
      });
    };

    // Initial setup
    const setupCarousel = () => {
      Array.from(carousel.children).slice(0, 4).forEach(child => {
        const clonedItem = child.cloneNode(true) as HTMLElement;
        carousel.appendChild(clonedItem);
      });
      
      createInfiniteScroll();

      // Add hover handlers to each card
      const cards = carousel.querySelectorAll('.review-card');
      cards.forEach(card => {
        card.addEventListener('mouseenter', () => animation.current?.pause());
        card.addEventListener('mouseleave', () => animation.current?.play());
      });
    };

    setupCarousel();

    return () => {
      animation.current?.kill();
      // Remove event listeners if needed
      const cards = carousel.querySelectorAll('.review-card');
      cards.forEach(card => {
        card.removeEventListener('mouseenter', () => animation.current?.pause());
        card.removeEventListener('mouseleave', () => animation.current?.play());
      });
    };
  }, [reviews]);

  const StarRating: React.FC<StarRatingProps> = ({ rating }) => (
    <div className="flex gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={20}
          className={`${
            index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'
          }`}
        />
      ))}
    </div>
  );

  if (!reviews.length) {
    return (
      <div className="py-12 px-4 bg-background text-foreground text-center">
        No reviews available
      </div>
    );
  }

  return (
    <div className="py-12 px-4 bg-background">
      <div className="max-w-screen mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            What Our Customers Say
          </h2>
          <p className="text-foreground/80 mb-8">
            Read trusted reviews from our happy customers
          </p>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="outline"
                className="mb-8 hover:bg-foreground hover:text-background"
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
            <DialogContent className="bg-background border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Write Your Review</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <p className="text-foreground/80">This is a demo component. In a real application, this would contain a form to submit reviews.</p>
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
                className="w-80 flex-shrink-0 review-card"
              >
                <Card className="bg-background border-border shadow-lg h-full hover:border-foreground/20 transition-colors duration-300">
                  <CardContent className="pt-6">
                    <div className="flex items-center mb-4">
                      <img
                        src={review.avatar}
                        alt={`${review.name}'s avatar`}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {review.name}
                        </h3>
                        <StarRating rating={review.rating} />
                      </div>
                    </div>
                    <p className="text-foreground/80">
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