"use client";
import { motion } from "framer-motion";
import React, { useState, useEffect } from "react";

const AnimatedBackground = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />

      {/* Animated gradient overlay */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(45deg, transparent, rgba(255,255,255,0.05), transparent),
            linear-gradient(-45deg, transparent, rgba(255,255,255,0.05), transparent)
          `,
          backgroundSize: "400% 400%",
        }}
        animate={{
          backgroundPosition: [
            "0% 0%",
            "100% 100%",
            "100% 0%",
            "0% 100%",
            "0% 0%",
          ],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Floating light beams */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`beam-${i}`}
            className="absolute h-[50vh] w-[1px] opacity-[0.07]"
            style={{
              background: "linear-gradient(to bottom, transparent, white, transparent)",
              left: `${30 + i * 20}%`,
            }}
            animate={{
              top: ["-50%", "100%"],
              opacity: [0, 0.07, 0],
            }}
            transition={{
              duration: 7 + i * 2,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2,
            }}
          />
        ))}
      </div>

      {/* Horizontal waves */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, index) => (
          <motion.div
            key={`wave-${index}`}
            className="absolute w-[200%] opacity-[0.03]"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)",
              top: `${15 + index * 15}%`,
              left: "-50%",
            }}
            animate={{
              x: ["0%", "50%"],
            }}
            transition={{
              duration: 20 + index * 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      {/* Pulsing orbs */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)",
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.02, 0.05, 0.02],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Enhanced vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
};

export default AnimatedBackground;
