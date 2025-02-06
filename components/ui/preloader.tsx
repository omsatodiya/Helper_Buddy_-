"use client";
import React, { useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";

interface PreloaderProps {
  onLoadingComplete?: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onLoadingComplete }) => {
  const progressControls = useAnimationControls();

  useEffect(() => {
    const loadingSequence = async () => {
      await progressControls.start({
        scaleX: 1,
        transition: {
          duration: 1,
          ease: "easeInOut",
        },
      });

      onLoadingComplete?.();
    };

    loadingSequence();
  }, [progressControls, onLoadingComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
        }}>
        <div className="text-4xl font-bold text-blue-600">
          <img src="/images/logo.jpg" alt="" />
        </div>
      </motion.div>

      <div className="relative w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full w-full bg-white origin-left"
          initial={{ scaleX: 0 }}
          animate={progressControls}
        />
      </div>
    </motion.div>
  );
};

export default Preloader;
