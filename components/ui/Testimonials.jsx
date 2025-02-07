"use client"
import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';

const Testimonials = () => {
  const [reviews] = useState([
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
  ]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const titleVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const StarRating = ({ rating }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Star
              size={20}
              className={`${
                index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'
              }`}
            />
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="py-12 px-4 bg-[#141414]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="text-center mb-12"
          variants={titleVariants}
        >
          <motion.h2 
            className="text-3xl font-bold mb-4 text-[#EAEAEA]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            What Our Customers Say
          </motion.h2>
          <motion.p 
            className="text-[#EAEAEA]/80 mb-8"
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Read trusted reviews from our happy customers
          </motion.p>
          
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button className="bg-[#EAEAEA] hover:bg-[#EAEAEA]/90 text-[#141414]">
                  Write a Review
                </Button>
              </motion.div>
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
        </motion.div>

        <motion.div 
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
        >
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              variants={cardVariants}
              whileHover="hover"
              custom={index}
            >
              <Card className="bg-[#141414] border border-[#EAEAEA]/10 shadow-lg transform-gpu">
                <CardContent className="pt-6">
                  <motion.div 
                    className="flex items-center mb-4"
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <motion.img
                      src={review.avatar}
                      alt={`${review.name}'s avatar`}
                      className="w-12 h-12 rounded-full mr-4"
                      whileHover={{ scale: 1.1, rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    />
                    <div>
                      <motion.h3 
                        className="font-semibold text-[#EAEAEA]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {review.name}
                      </motion.h3>
                      <StarRating rating={review.rating} />
                    </div>
                  </motion.div>
                  <motion.p 
                    className="text-[#EAEAEA]/80"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    {review.text}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Testimonials;