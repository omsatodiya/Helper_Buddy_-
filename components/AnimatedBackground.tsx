"use client";
import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";

interface Dot {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const dotsRef = useRef<Dot[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const { theme } = useTheme();

  // Initialize dots
  useEffect(() => {
    const initializeDots = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const dotSpacing = 30; // Space between dots
      const dots: Dot[] = [];

      for (let x = 0; x < canvas.width; x += dotSpacing) {
        for (let y = 0; y < canvas.height; y += dotSpacing) {
          dots.push({
            x,
            y,
            originalX: x,
            originalY: y,
            vx: 0,
            vy: 0,
          });
        }
      }

      dotsRef.current = dots;
    };

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        initializeDots();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle mouse movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      const isDark = theme === "dark";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = isDark ? "white" : "black";

      const mouseRadius = 100; // Radius of mouse influence
      const maxDistance = 30; // Maximum distance dots can move from original position
      const easing = 0.1; // Movement easing

      dotsRef.current.forEach((dot) => {
        const dx = mousePosition.x - dot.x;
        const dy = mousePosition.y - dot.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseRadius) {
          // Calculate repulsion force
          const force = (1 - distance / mouseRadius) * 5;
          const angle = Math.atan2(dy, dx);

          // Update velocity with repulsion
          dot.vx -= Math.cos(angle) * force;
          dot.vy -= Math.sin(angle) * force;
        }

        // Apply velocity with boundaries
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Return to original position with easing
        dot.vx += (dot.originalX - dot.x) * easing;
        dot.vy += (dot.originalY - dot.y) * easing;

        // Apply friction
        dot.vx *= 0.9;
        dot.vy *= 0.9;

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mousePosition, theme]);

  return (
    <div className={`fixed inset-0 z-0 overflow-hidden ${theme === "dark" ? "bg-black" : "bg-white"}`}>
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
};

export default AnimatedBackground;
