"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";

const AnimatedBackground = () => {
  const [mounted, setMounted] = React.useState(false);
  const beamsRef = useRef<HTMLDivElement[]>([]);
  const wavesRef = useRef<HTMLDivElement[]>([]);
  const orbsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Animate beams
      beamsRef.current.forEach((beam, i) => {
        if (beam) {
          gsap.to(beam, {
            top: "100%",
            opacity: 0.04,
            duration: 7 + i * 2,
            delay: i * 2,
            repeat: -1,
            ease: "none",
            yoyo: true
          });
        }
      });

      // Animate waves
      wavesRef.current.forEach((wave, index) => {
        if (wave) {
          gsap.to(wave, {
            x: "50%",
            duration: 20 + index * 3,
            repeat: -1,
            ease: "none",
          });
        }
      });

      // Animate orbs
      orbsRef.current.forEach((orb, i) => {
        if (orb) {
          gsap.to(orb, {
            scale: 1.2,
            opacity: 0.03,
            duration: 4 + i,
            yoyo: true,
            repeat: -1,
            ease: "power1.inOut",
          });
        }
      });
    }

    return () => {
      gsap.killTweensOf([...beamsRef.current, ...wavesRef.current, ...orbsRef.current]);
    };
  }, [mounted]);

  const addToBeamsRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !beamsRef.current.includes(el)) {
      beamsRef.current[index] = el;
    }
  };

  const addToWavesRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !wavesRef.current.includes(el)) {
      wavesRef.current[index] = el;
    }
  };

  const addToOrbsRef = (el: HTMLDivElement | null, index: number) => {
    if (el && !orbsRef.current.includes(el)) {
      orbsRef.current[index] = el;
    }
  };

  if (!mounted) {
    return (
      <div className="fixed inset-0 z-0 overflow-hidden bg-gradient-to-br from-black via-gray-950 to-black" />
    );
  }

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Base gradient - darker */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />

      {/* Floating light beams - reduced opacity */}
      <div className="absolute inset-0">
        {[...Array(3)].map((_, i) => (
          <div
            key={`beam-${i}`}
            ref={(el) => addToBeamsRef(el, i)}
            className="absolute h-[50vh] w-[1px] opacity-0"
            style={{
              background: "linear-gradient(to bottom, transparent, white, transparent)",
              left: `${30 + i * 20}%`,
              top: "-50%"
            }}
          />
        ))}
      </div>

      {/* Horizontal waves - reduced opacity */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, index) => (
          <div
            key={`wave-${index}`}
            ref={(el) => addToWavesRef(el, index)}
            className="absolute w-[200%] opacity-[0.02]"
            style={{
              height: "1px",
              background: "linear-gradient(90deg, transparent 0%, white 50%, transparent 100%)",
              top: `${15 + index * 15}%`,
              left: "-50%"
            }}
          />
        ))}
      </div>

      {/* Pulsing orbs - reduced opacity */}
      <div className="absolute inset-0">
        {[...Array(4)].map((_, i) => (
          <div
            key={`orb-${i}`}
            ref={(el) => addToOrbsRef(el, i)}
            className="absolute rounded-full opacity-[0.01]"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.03) 0%, transparent 70%)",
              width: `${200 + i * 100}px`,
              height: `${200 + i * 100}px`,
              left: `${20 + i * 20}%`,
              top: `${30 + i * 15}%`
            }}
          />
        ))}
      </div>

      {/* Darker vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
};

export default AnimatedBackground;
