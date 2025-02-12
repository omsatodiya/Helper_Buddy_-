'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import SplitType from 'split-type';

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Transform values for left and right SVGs
  const leftX = useTransform(scrollYProgress, [0, 1], ["-100%", "0%"]);
  const rightX = useTransform(scrollYProgress, [0, 1], ["100%", "0%"]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="bg-black min-h-screen relative overflow-hidden">
      {/* Background SVGs */}
      <motion.div 
        className="fixed left-0 top-1/4 w-64 h-64 opacity-20 hidden md:block"
        style={{ x: leftX }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#2C786C"
            d="M45.3,-51.5C59.9,-37.3,73.5,-18.7,73.8,0.3C74.1,19.3,61.1,38.6,46.5,52.8C31.8,67,15.9,76,-0.9,77.1C-17.7,78.2,-35.4,71.4,-48.9,57.9C-62.4,44.4,-71.7,24.2,-72.1,3.8C-72.4,-16.6,-63.8,-33.2,-50.3,-47.4C-36.8,-61.6,-18.4,-73.4,0.2,-73.6C18.7,-73.8,37.4,-62.4,45.3,-51.5Z"
            transform="translate(100 100)"
          />
        </svg>
      </motion.div>

      <motion.div 
        className="fixed right-0 top-2/3 w-64 h-64 opacity-20 hidden md:block"
        style={{ x: rightX }}
      >
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path
            fill="#2C786C"
            d="M38.5,-44.3C52.9,-34.1,69.5,-23.1,73.5,-8.3C77.5,6.5,68.9,25.1,56.4,37.8C43.9,50.5,27.5,57.3,11.3,58.9C-4.9,60.5,-21,56.9,-35.4,48.4C-49.8,39.9,-62.5,26.5,-66.9,9.9C-71.3,-6.7,-67.3,-26.5,-55.8,-37.8C-44.2,-49.1,-25.1,-51.9,-8.5,-49.5C8.1,-47.1,24.1,-54.5,38.5,-44.3Z"
            transform="translate(100 100)"
          />
        </svg>
      </motion.div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      {/* Main content */}
      <div className="relative mt-28 z-10 container mx-auto px-4 min-h-screen flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white  mb-10">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-[#2C786C] to-[#004AAD] text-transparent bg-clip-text">
              Helper Buddy
            </span>
          </h1>
          <div className="flex flex-col gap-2 mb-20">
            <p className="text-3xl md:text-5xl text-[#EAEAEA] font-light">
              Reliable, Fast & Affordable Services
            </p>
            <p className="text-3xl md:text-5xl text-[#EAEAEA] font-light">
              Your Helper Buddy
            </p>
            <p className="text-3xl md:text-5xl text-[#EAEAEA] font-light">
              is Just a Click Away
            </p>
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-12 py-4 bg-[#F4A261] text-[#141414] rounded-lg font-semibold hover:bg-[#F4A261]/90 transition-colors text-2xl"
            >
              Book Now
            </motion.button>
          </div>
        </motion.div>

        {/* Interactive mouse follower */}
        <motion.div
          className="hidden md:block fixed w-64 h-64 rounded-full pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(44,120,108,0.15) 0%, rgba(44,120,108,0) 70%)",
            left: mousePosition.x - 128,
            top: mousePosition.y - 128,
          }}
          animate={{
            x: mousePosition.x - 128,
            y: mousePosition.y - 128,
          }}
          transition={{ type: "spring", damping: 30 }}
        />

        {/* Features Section */}
        <div className="w-full mt-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Home & Office Cleaning",
                description: "Expert cleaning tailored to your space, using eco-friendly products",
                icon: "🏠"
              },
              {
                title: "Appliance Repair & Maintenance",
                description: "Quick, reliable appliance repairs and maintenance",
                icon: "🔧"
              },
              {
                title: "Plumbing & Electrical",
                description: "Trusted plumbing and electrical services, with emergency response",
                icon: "⚡"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="p-6 rounded-lg border border-[#2C786C]/20 backdrop-blur-sm bg-black/30"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">{feature.title}</h3>
                <p className="text-[#EAEAEA]/80">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}