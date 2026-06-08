/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Leaf, ShieldAlert, HeartPulse } from 'lucide-react';
import { RootedLogo } from './RootedLogo';

interface SplashScreenProps {
  onBegin: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onBegin }) => {
  return (
    <div id="splash-container" className="relative min-h-screen bg-[#FFFDF7] dark:bg-[#0F172A] flex flex-col justify-between p-6 overflow-hidden select-none font-sans transition-colors duration-200">
      {/* Visual Canvas Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] opacity-15 pointer-events-none" />

      {/* Central Visual Logo Reveal */}
      <div className="flex-grow flex flex-col items-center justify-center text-center z-10 max-w-md mx-auto my-auto py-12">
        <RootedLogo size={140} showWordmark={true} className="mb-8" />

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-lg font-bold text-[#16213E] dark:text-[#F8FAFC] font-sans tracking-tight mb-8 px-4"
        >
          &ldquo;Your follicles are built in the kitchen.&rdquo;
        </motion.p>

        {/* Nutritional Subtext Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-[#E0DCFF] dark:bg-[#202E5C] border-4 border-[#1E293B] dark:border-[#475569] p-4 rounded-[24px] shadow-[4px_4px_0px_0px_#1E293B] dark:shadow-[4px_4px_0px_0px_#0A0F1C] text-left mb-6 flex gap-3 text-[#16213E] dark:text-[#F8FAFC]"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] dark:bg-[#A78BFA] border-2 border-[#1E293B] dark:border-[#475569] flex items-center justify-center shrink-0">
            <HeartPulse className="w-6 h-6 text-white dark:text-[#0F172A]" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-[#16213E] dark:text-[#F8FAFC] uppercase tracking-wide">Follicle Ignition Protocol</h4>
            <p className="text-xs text-[#16213E]/85 dark:text-[#F8FAFC]/85 font-medium">Hair recovery, sebum balance, and metabolic optimization in one seamless daily dashboard.</p>
          </div>
        </motion.div>
      </div>

      {/* Primary Landing Controller Call to Action */}
      <div className="w-full max-w-sm mx-auto flex flex-col items-center gap-3 z-10">
        <motion.button
          id="begin-mission-btn"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97, y: 2 }}
          onClick={onBegin}
          className="w-full bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] border-4 border-[#1E293B] dark:border-[#475569] py-4 rounded-[24px] font-black text-xl tracking-wide uppercase cursor-pointer hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] duration-150"
        >
          Begin Mission
        </motion.button>
        <span className="text-[11px] font-mono font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" /> 100% Secure &amp; Locally Encrypted
        </span>
      </div>
    </div>
  );
};

