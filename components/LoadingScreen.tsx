"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function LoadingScreen() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[1000] bg-brand-dark flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Technical Drawing Lines - Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="absolute left-1/4 w-[1px] bg-white"
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
              className="absolute left-1/2 w-[1px] bg-white"
            />
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.4 }}
              className="absolute left-3/4 w-[1px] bg-white"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.1 }}
              className="absolute top-1/4 h-[1px] bg-white"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
              className="absolute top-1/2 h-[1px] bg-white"
            />
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
              className="absolute top-3/4 h-[1px] bg-white"
            />
          </div>

          {/* Central Logo & Progress */}
          <div className="relative z-10 text-center scale-150">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="w-16 h-16 relative mx-auto mb-12"
            >
              {/* Geometric Icon */}
              <div className="absolute inset-0 border-2 border-brand-blue rotate-45" />
              <div className="absolute inset-2 border border-brand-blue/30 -rotate-12" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 border border-brand-blue/10"
              />
            </motion.div>

            {/* Progress Line */}
            <div className="w-32 h-[1px] bg-white/5 relative mx-auto overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(progress, 100)}%` }}
                className="absolute inset-y-0 left-0 bg-brand-blue shadow-[0_0_8px_rgba(47,127,179,0.5)]"
              />
            </div>
          </div>

          {/* Wireframe Prism */}
          <div className="absolute bottom-20 right-20 w-32 h-32 opacity-20 hidden md:block">
            <motion.div
              animate={{
                rotateX: [0, 90, 180, 270, 360],
                rotateY: [0, 360],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-full h-full border border-brand-blue relative"
            >
              <div className="absolute inset-0 border border-white" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
