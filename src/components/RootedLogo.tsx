/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface RootedLogoProps {
  size?: number; // width/height of the SVG view
  showWordmark?: boolean; // display "ROOTEDAI SYSTEM" layout below
  animateOnLoad?: boolean; // trigger complete Stage 1-6 flow automatically
  className?: string;
  onClick?: () => void;
}

export const RootedLogo: React.FC<RootedLogoProps> = ({
  size = 140,
  showWordmark = false,
  className = '',
  onClick
}) => {
  // Defined particle sequence (Teal, Blue, Purple, Amber as per spec)
  const logoParticles = [
    { id: 1, color: "#2DD4BF", cx: 65, cy: 90, targetX: 42, targetY: 15, size: 4.5, delay: 2.1 },
    { id: 2, color: "#4D8DFF", cx: 80, cy: 95, targetX: 98, targetY: -8, size: 5.0, delay: 2.4 },
    { id: 3, color: "#A78BFA", cx: 95, cy: 90, targetX: 114, targetY: 8, size: 3.8, delay: 1.9 },
    { id: 4, color: "#FBBF24", cx: 74, cy: 100, targetX: 48, targetY: 28, size: 4.2, delay: 2.6 },
    { id: 5, color: "#4D8DFF", cx: 86, cy: 105, targetX: 78, targetY: -12, size: 3.5, delay: 2.8 },
    { id: 6, color: "#A78BFA", cx: 60, cy: 100, targetX: 30, targetY: 35, size: 4.0, delay: 2.3 },
    { id: 7, color: "#2DD4BF", cx: 102, cy: 100, targetX: 130, targetY: 25, size: 3.2, delay: 2.0 },
    { id: 8, color: "#FBBF24", cx: 80, cy: 82, targetX: 92, targetY: 2, size: 4.8, delay: 2.5 }
  ];

  return (
    <div 
      className={`flex flex-col items-center justify-center select-none ${className}`}
      onClick={onClick}
    >
      {/* 
        Master SVG Canvas 
        Apply Hard Offset Sticker Shadow system: X: 8px, Y: 8px, Blur: 0, Color: #1E293B (light) or #0A0F1C (dark)
      */}
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Folder clip definition matching the precise U-shaped capsule basin geometry */}
            <clipPath id="follicle-basin-clip">
              <path d="M 44,74 L 44,104 A 36,36 0 0 0 116,104 L 116,74 Z" />
            </clipPath>
          </defs>

          {/* Combined rendering layer wrapping shadow on all elements jointly */}
          <g className="filter drop-shadow-[8px_8px_0px_#1E293B] dark:drop-shadow-[8px_8px_0px_#0A0F1C]">
            
            {/* Stage 4: Entire coordinated core group pulse (Scale: 1 -> 1.04 -> 1) */}
            <motion.g
              animate={{
                scale: [1, 1.04, 1]
              }}
              transition={{
                duration: 0.8,
                delay: 1.4, // Delays to start after Stage 3 completes (0.9s delay + 0.5s duration = 1.4s)
                ease: "easeInOut"
              }}
              style={{ transformOrigin: "80px 80px" }}
            >
              {/* 
                STAGE 3: The growth pillar emerging from the center of the follicle.
                Solid rigid rectangle skewed/angled at 14 degrees forward. Width 28px.
              */}
              <motion.polygon
                points="66,120 94,120 118,20 90,20"
                fill="#0057FF"
                className="stroke-[#1E293B] dark:stroke-[#475569]"
                strokeWidth="4"
                strokeLinejoin="miter"
                style={{ originY: "115px", originX: "80px" }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 12,
                  delay: 0.9 // Delay to start precisely after Stage 2 completes (0.3s delay + 0.6s duration = 0.9s)
                }}
              />

              {/* 
                STAGE 1 & 2: Symmetrical Capsule Basin Follicle Core
                U-shaped basin.
              */}
              {/* Transparent outline layer ALWAYS visible (representing Stage 1 outline canvas) */}
              <path 
                d="M 44,74 L 44,104 A 36,36 0 0 0 116,104 L 116,74 Z" 
                className="fill-[#FFFDF7] dark:fill-[#1D293B] stroke-[#1E293B] dark:stroke-[#475569]"
                strokeWidth="4" 
                strokeLinejoin="miter"
              />

              {/* Clip group for upward filling transition */}
              <g clipPath="url(#follicle-basin-clip)">
                <motion.rect
                  x="40"
                  y="142" // Placed complete off bottom bounds
                  width="80"
                  height="72"
                  fill="#E0DCFF"
                  className="dark:fill-[#202E5C]"
                  initial={{ y: 142 }}
                  animate={{ y: 74 }}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                    delay: 0.3 // Begins Stage 2 after 300ms initial outline pause
                  }}
                />
              </g>

              {/* Thick geometric front outline border on top for maximum visual precision */}
              <path 
                d="M 44,74 L 44,104 A 36,36 0 0 0 116,104 L 116,74 Z" 
                fill="none" 
                className="stroke-[#1E293B] dark:stroke-[#475569]"
                strokeWidth="4" 
                strokeLinejoin="miter"
              />
            </motion.g>

            {/* STAGE 5: Tiny nutrient micro particles drifting upward from core boundary */}
            {logoParticles.map(p => (
              <motion.circle
                key={p.id}
                cx={p.cx}
                cy={p.cy}
                r={p.size}
                fill={p.color}
                className="stroke-[#1E293B] dark:stroke-[#475569]"
                strokeWidth="1.5"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  cx: [p.cx, p.targetX],
                  cy: [p.cy, p.targetY],
                  opacity: [0, 1, 1, 0],
                  scale: [0, 1, 1, 0.5]
                }}
                transition={{
                  duration: 1.8,
                  delay: p.delay,
                  repeat: Infinity,
                  repeatDelay: 1.2,
                  ease: "easeOut"
                }}
              />
            ))}
          </g>
        </svg>
      </div>

      {/* STAGE 6: Premium Wordmark with high contrast custom typography elements */}
      {showWordmark && (
        <div id="wordmark-container" className="mt-8 flex flex-col items-center select-none text-center">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.3, duration: 0.6 }}
            className="text-4xl font-black tracking-tight text-[#16213E] dark:text-[#F8FAFC] uppercase leading-none"
          >
            DIET <span className="text-[#0057FF] dark:text-[#4D8DFF]">MANI</span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.1em" }}
            animate={{ opacity: 0.65, letterSpacing: "0.36em" }}
            transition={{ delay: 2.7, duration: 0.8 }}
            className="text-xs font-mono font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mt-2 pl-[0.36em] leading-none"
          >
            SYSTEM
          </motion.div>
        </div>
      )}
    </div>
  );
};
