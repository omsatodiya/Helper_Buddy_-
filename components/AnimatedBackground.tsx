"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);
  const [particlePositions, setParticlePositions] = useState<
    { top: number; left: number }[]
  >([]);

  useEffect(() => {
    // Generate random positions only on the client-side
    const positions = Array.from({ length: 15 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
    }));
    setParticlePositions(positions);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-900" />
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-slate-900" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {[...Array(3)].map((_, index) => (
        <motion.div
          key={index}
          className="absolute opacity-[0.07]"
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "2px solid white",
            top: `${index * 20}%`,
            left: `${index * 10 - 50}%`,
            scale: 2 + index * 0.5,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20 + index * 5,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.03),transparent_50%)]" />

      {particlePositions.map((position, index) => (
        <motion.div
          key={`particle-${index}`}
          className="absolute w-1 h-1 bg-white rounded-full opacity-20"
          style={{
            top: `${position.top}%`,
            left: `${position.left}%`,
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 0.3, 0],
            y: [-20, 20],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 opacity-[0.03]"
        animate={{
          background: [
            "radial-gradient(circle at 0% 0%, transparent 50%, #fff 100%)",
            "radial-gradient(circle at 100% 100%, transparent 50%, #fff 100%)",
            "radial-gradient(circle at 0% 0%, transparent 50%, #fff 100%)",
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
