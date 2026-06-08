/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDietStore, Challenge } from '../store/dietStore';
import { mealPhases } from '../data/protocol';
import { 
  Sparkles, Award, Flame, Droplets, Moon, Check, 
  HelpCircle, ChevronRight, Info, HeartPulse, 
  Zap, Compass, Dna, Layers, AlertCircle, Trophy, User, ArrowRight, Star
} from 'lucide-react';

// Stable seed data for up to 60 follicle strands across the Scalp Recovery Forest
const STABLE_FOLLICLES = Array.from({ length: 60 }).map((_, idx) => {
  // Distribute x evenly, from 8% to 92% across the viewport width
  const x = 8 + (idx * 17.53) % 84 + (Math.sin(idx) * 2);
  const baseHeight = 16 + (idx % 4) * 8 + (Math.cos(idx) * 4); // Peak potential height
  const curveAmount = (idx % 2 === 0 ? 1 : -1) * (2 + (idx % 3) * 1.5);
  return {
    id: idx,
    x,
    baseHeight,
    curveAmount,
  };
});

// Premium internal visual helper for the Hero Centerpiece
const FollicleCoreVisual: React.FC<{ score: number }> = ({ score }) => {
  // Compute individual indicators dynamically based on compliance score
  const proteinVal = Math.min(100, Math.floor(score * 0.94));
  const hydrationVal = Math.min(100, Math.floor(score * 1.04));
  
  return (
    <div id="follicle-core-orb" className="relative w-36 h-36 border-4 border-[#1E293B] dark:border-[#475569] rounded-full bg-slate-50 dark:bg-[#111111] flex items-center justify-center overflow-hidden shadow-[inset_0_0_16px_rgba(0,87,255,0.15)] dark:shadow-[inset_0_0_16px_rgba(0,87,255,0.25)] shrink-0 select-none">
      {/* Concentric biological pulsing membranes */}
      <motion.div 
        className="absolute w-28 h-28 border-3 border-blue-500/10 dark:border-blue-500/15 rounded-full flex items-center justify-center pointer-events-none"
        animate={{ scale: [0.96, 1.04, 0.96] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div 
          className="w-22 h-22 border-3 border-blue-500/15 dark:border-blue-500/20 rounded-full flex items-center justify-center"
          animate={{ scale: [1.03, 0.97, 1.03] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div 
            className="w-16 h-16 border-3 border-sky-500/20 dark:border-sky-500/25 rounded-full flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          >
            {/* Iron Core (Red) */}
            <div className="w-10 h-10 rounded-full border-2 border-red-500/40 bg-red-100 dark:bg-red-950/20 flex items-center justify-center filter blur-[0.25px]">
              <div className="w-3.5 h-3.5 rounded-full bg-red-500 animate-ping [animation-duration:2s]" />
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* SVG layers representing biological alignment rings */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 100 100">
        {/* Ring 1: Recovery Layer (Blue, Outer) */}
        <circle cx="50" cy="50" r="41" fill="none" stroke="#e2e8f0" strokeWidth="4" className="stroke-slate-200 dark:stroke-zinc-800" />
        <motion.circle 
          cx="50" cy="50" r="41" fill="none" 
          stroke="#0057FF" strokeWidth="4.5" 
          strokeDasharray={`${2.57 * score} 300`} 
          strokeLinecap="round" 
        />

        {/* Ring 2: Protein Layer (Blue, Middle) */}
        <circle cx="50" cy="50" r="33" fill="none" stroke="#e2e8f0" strokeWidth="4" className="stroke-slate-200 dark:stroke-zinc-900" />
        <motion.circle 
          cx="50" cy="50" r="33" fill="none" 
          stroke="#0057FF" strokeWidth="4.5" 
          strokeDasharray={`${2.07 * proteinVal} 300`} 
          strokeLinecap="round" 
        />

        {/* Ring 3: Hydration Layer (Sky, Inner) */}
        <circle cx="50" cy="50" r="25" fill="none" stroke="#e2e8f0" strokeWidth="3.5" className="stroke-slate-200 dark:stroke-neutral-900" />
        <motion.circle 
          cx="50" cy="50" r="25" fill="none" 
          stroke="#0EA5E9" strokeWidth="4" 
          strokeDasharray={`${1.57 * hydrationVal} 300`} 
          strokeLinecap="round" 
        />
      </svg>

      {/* Center percentage overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/70 dark:bg-black/55 rounded-full select-none">
        <span className="text-[7.5px] font-mono font-bold text-gray-500 dark:text-gray-400 tracking-wider leading-none mb-0.5">RECOVERY</span>
        <span className="text-xl font-black font-mono tracking-tight text-zinc-900 dark:text-white">{score}%</span>
        <span className="text-[6.5px] font-black text-[#0057FF] bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 border border-blue-200 dark:border-blue-500/20 rounded-md block leading-none scale-90 uppercase tracking-widest mt-0.5">ANAGEN</span>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const {
    currentDateStr,
    streakCount,
    badges,
    dailyLogs,
    calculateScoresForDate,
    addWater,
    getOverallRating,
    onboarding,
    setTab,
    xp,
    addXp,
    challenges,
    completeChallenge,
    getLevelInfo
  } = useDietStore();

  const scores = calculateScoresForDate(currentDateStr);
  const activeLog = dailyLogs[currentDateStr] || { waterIntake: 0, sleepDuration: 8.0, meals: {} };

  const [selectedGauge, setSelectedGauge] = useState<string | null>(null);
  
  // Interactive states
  const [selectedNutrient, setSelectedNutrient] = useState<string>('PROTEIN');
  const [follicleDay, setFollicleDay] = useState<number>(41); // Interactive simulation day
  const [timelineWeek, setTimelineWeek] = useState<number>(3); // Timeline slider week
  
  // Particle generator state
  const [particles, setParticles] = useState<{ id: number; left: number; top: number; size: number; delay: number }[]>([]);

  useEffect(() => {
    // Generate organic floating nutrient particles for standard atmospheric overlay
    const list = Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      left: Math.random() * 85 + 5,
      top: Math.random() * 80 + 10,
      size: Math.random() * 5 + 3,
      delay: Math.random() * 4
    }));
    setParticles(list);
  }, []);

  const levelInfo = getLevelInfo();

  // Targets
  const targetWater = onboarding?.waterIntakeTarget || 3000;
  const targetSleep = onboarding?.sleepTarget || 8.0;

  // Emotional "Protocol Day" calculator (Calculates days since an approximate onboarding start)
  const getProtocolDay = () => {
    try {
      const baseDate = new Date('2026-04-28'); // Consistent reference start date (matches current local date)
      const current = new Date(currentDateStr);
      const diff = current.getTime() - baseDate.getTime();
      const calculatedDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, calculatedDays);
    } catch {
      return 41;
    }
  };
  const protocolDay = getProtocolDay();

  // Selected date human readable
  const getHumanDate = () => {
    const d = new Date(currentDateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  // 1. Nutrient DNA collectible details
  const nutrientDNADeck: {
    [key: string]: {
      name: string;
      desc: string;
      current: string;
      target: string;
      rawPercent: number;
      themeColor: string;
      accentBg: string; // Tailwind color matching
      benefits: string[];
      sources: string[];
    }
  } = {
    PROTEIN: {
      name: 'Essential Amino Acids',
      desc: 'Supplies absolute protein building blocks to force rapid stem-cell division inside pre-dermal follicles.',
      current: `${scores.proteinCompliance > 0 ? '78g' : '0g'}`,
      target: '85g',
      rawPercent: scores.proteinCompliance,
      themeColor: '#0057FF',
      accentBg: 'bg-blue-50 dark:bg-blue-950/40 border-[#0057FF] text-blue-900 dark:text-blue-200',
      benefits: ['Keratinocyte micro-proliferation', 'Strengthens shaft inner cortex', 'Blocks premature catagen phase'],
      sources: ['Chicken Breasts', 'Egg Whites', 'Sattu', 'Mung Gram Sprouts']
    },
    IRON: {
      name: 'Bio-available Iron (Fe)',
      desc: 'Catalyzes cellular transfer of oxygen via hemoglobin straight to scalp root capillaries.',
      current: `${scores.ironCompliance > 0 ? '12.5mg' : '1.2mg'}`,
      target: '15mg',
      rawPercent: scores.ironCompliance,
      themeColor: '#FF3B30',
      accentBg: 'bg-[#FFE9E5] border-[#FF3B30] text-red-900',
      benefits: ['Dermal capillary oxygen transport', 'Supports root cell hemoglobin map', 'Fights seasonal shedding waves'],
      sources: ['Murungai Keerai', 'Rajma Beans', 'Black Dates', 'Spinach Puré']
    },
    BIOTIN: {
      name: 'Pure Biotin (Vit B7)',
      desc: 'Serves as an essential enzymatic co-factor critical for structural keratin filament synthesis.',
      current: `${scores.hairHealthCompliance > 10 ? '25mcg' : '5mcg'}`,
      target: '30mcg',
      rawPercent: Math.min(100, Math.round(scores.hairHealthCompliance * 1.15)),
      themeColor: '#FFB703',
      accentBg: 'bg-[#FFF9E6] border-[#FFB703] text-amber-955',
      benefits: ['Accelerates cellular growth speed', 'Stabilizes strand thickness', 'Reinforces root lipid barrier'],
      sources: ['Organic Whole Eggs', 'Slivered Almonds', 'Sweet Potato Mash']
    },
    ZINC: {
      name: 'Zinc Molecule (Zn)',
      desc: 'Controls cellular RNA transcription cycles and blocks autoimmune scaling around the hair follicles.',
      current: `${scores.hairHealthCompliance > 25 ? '7.8mg' : '2.0mg'}`,
      target: '8.0mg',
      rawPercent: Math.min(100, Math.round(scores.hairHealthCompliance * 1.05)),
      themeColor: '#0EA5E9',
      accentBg: 'bg-[#E0F2FE] border-[#0EA5E9] text-sky-950',
      benefits: ['Restricts severe scalp scaling', 'Aids local protein enzyme binds', 'Controls epidermal sebum rate'],
      sources: ['Amla Seeds', 'Pumpkin Seeds', 'Lentils Sprouts', 'Oat Bran']
    },
    MAGNESIUM: {
      name: 'Magnesium (Mg)',
      desc: 'Blocks local micro-calcification build-up around follicle entryways to avoid tissue strangulation.',
      current: '310mg',
      target: '355mg',
      rawPercent: 87,
      themeColor: '#8A2BE2',
      accentBg: 'bg-[#F2EFFE] border-[#8A2BE2] text-purple-950',
      benefits: ['Relieves scalp tissue tension', 'Halts calcium vessel blockage', 'Optimizes subcutaneous blood flow'],
      sources: ['Pure Dark Cocoa', 'Steamed Spinach', 'Pumpkin Seed Flour']
    },
    VITAMIN_D3: {
      name: 'Vitamin D3 Hormone',
      desc: 'Triggers the formation of completely new subcutaneous hair pores and wakes up sleeping, dormant follicles.',
      current: '350 IU',
      target: '400 IU',
      rawPercent: 88,
      themeColor: '#FF9500',
      accentBg: 'bg-[#FFF6E6] border-[#FF9500] text-orange-950',
      benefits: ['Re-awakens dormant hair glands', 'Optimizes follicular cell division', 'Recharges immune resistance'],
      sources: ['Egg Yolks', 'Direct Sunshine Exposure', 'Fortified Milks']
    }
  };

  // AI Insights synthesis engine
  const getAIInsight = () => {
    if (scores.ironCompliance < 50) {
      return {
        issue: 'Low Capillary Iron Tension Detected',
        impact: 'Follicle oxygen maps indicate a sluggish flow rate, increasing premature shedding risk indicators by 12%.',
        recommendation: 'Incorporate Morning Egg Protocol enriched with fresh Murungai Keerai or swallow 100ml pure Beetroot shot tomorrow.',
        expected: '+18% cellular oxygen transport speed'
      };
    } else if (scores.hydrationCompliance < 70) {
      return {
        issue: 'Subcutaneous Dermal Dehydration',
        impact: 'Sebum viscosity is elevated. Keratin assembly is experiencing micro frictional resistance.',
        recommendation: 'Deploy hydration targets. Log three 500ml pure water intervals this afternoon.',
        expected: 'Stabilized scalp epidermal pH factor'
      };
    } else if (scores.proteinCompliance < 60) {
      return {
        issue: 'Amino Acid Stack Depletion',
        impact: 'Persistent protein deficit causes metabolic diversion of priority protein away from follicle cells.',
        recommendation: 'Secure a premium Chicken Payload for lunch, or double the morning Egg Whites intake.',
        expected: '+12.4% follicle replication pace'
      };
    } else {
      return {
        issue: 'Bio-Symphony System Equilibrium',
        impact: 'Perfect saturation of micronutrients is prompting optimal keratinization at the subcutaneous matrix layer.',
        recommendation: 'Maintain the current Morning Egg + Sprouts sequence. Your follicular biomarkers are in active synergy.',
        expected: 'Peak cellular regeneration rate'
      };
    }
  };

  const insight = getAIInsight();

  // Timeline biochemical progress math
  const getTimelineMetricsForWeek = (wk: number) => {
    switch (wk) {
      case 1: return { protein: 35, iron: 42, hydration: 51, recovery: 15 };
      case 2: return { protein: 55, iron: 60, hydration: 72, recovery: 40 };
      case 3: return { protein: 82, iron: 75, hydration: 88, recovery: 68 };
      default: return { protein: 95, iron: 92, hydration: 95, recovery: 91 };
    }
  };

  const timelineVals = getTimelineMetricsForWeek(timelineWeek);

  const getHourGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div id="mission-control-root" className="space-y-6 pb-24 text-black dark:text-white">
      
      {/* Problem 1, 2 & 8: Level 1 Premium Centerpiece Hero Core */}
      <div id="premium-hero-control" className="bg-white dark:bg-[#111111] border-4 border-[#1E293B] dark:border-[#475569] text-black dark:text-white p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] relative overflow-hidden flex flex-col justify-between">
        
        {/* Floating background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-25">
          {particles.map(p => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-[#0EA5E9]"
              style={{
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: p.size,
                height: p.size,
              }}
              animate={{
                y: [0, -40, 0],
                opacity: [0.1, 0.8, 0.1],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>

        {/* Header greeting metadata */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 w-fit px-2 py-0.5 rounded-full border border-[#1E293B]/20 dark:border-white/20 select-none">
              <span className="w-2 h-2 rounded-full bg-[#0057FF] dark:bg-[#4D8DFF] animate-pulse" />
              <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#0057FF] dark:text-[#4D8DFF]">BIOMETRIC FEED ACTIVE</span>
            </div>
            
            <h1 className="text-2xl font-black tracking-tight leading-none uppercase text-[#16213E] dark:text-white">
              {getHourGreeting()}, <span className="text-[#0057FF] dark:text-[#4D8DFF]">{onboarding?.name || 'Ganesh'}</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              FOLICULAR RANK: <span className="text-amber-500 dark:text-yellow-400 font-mono">{levelInfo.title}</span> (LVL {levelInfo.level})
            </p>
          </div>

          <div 
            onClick={() => setTab('calendar')}
            className="bg-[#0057FF] dark:bg-[#4D8DFF] border-2 border-[#1E293B] dark:border-[#475569] px-2.5 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C] flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 transition-all text-white dark:text-[#0F172A]"
          >
            <Award className="w-4 h-4" />
            <span className="font-mono font-black text-xs">{xp} XP</span>
          </div>
        </div>

        {/* Level and XP progress tracker */}
        <div className="relative z-10 mt-4 bg-slate-50 dark:bg-white/5 border border-[#1E293B]/10 dark:border-white/10 p-2.5 rounded-xl">
          <div className="flex justify-between items-center text-[9px] font-mono font-black text-gray-500 dark:text-gray-400 uppercase mb-1">
            <span>XP DISPENSARY CALIBRATION</span>
            <span>{xp} / {levelInfo.maxXp} XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-white/10 h-2 border border-[#1E293B]/10 dark:border-white/20 rounded-full overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-[#0EA5E9] to-[#0057FF] h-full"
              initial={{ width: 0 }}
              animate={{ width: `${levelInfo.progressPercent}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>

        {/* Problem 1 & 2: Center core grid integration side-by-side cockpit */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 my-5 border-y-2 border-dashed border-[#1E293B]/10 dark:border-white/15 py-5">
          {/* Substantial signature centerpiece visual orb */}
          <FollicleCoreVisual score={scores.hairHealthCompliance} />
          
          <div className="flex-1 space-y-3 w-full">
            <div>
              <span className="text-[9px] font-mono text-gray-400 dark:text-gray-500 uppercase block tracking-wider leading-none">BIOPHYSIQUE READOUT</span>
              <p className="text-lg font-black text-[#0057FF] dark:text-[#4D8DFF] uppercase tracking-wide mt-1">Anagen Saturated</p>
              <p className="text-[11px] text-gray-600 dark:text-gray-400 font-semibold leading-normal">
                Amino acids and trace minerals are circulating through capillary nodes at nominal speeds.
              </p>
            </div>

            {/* Micro progress parameters */}
            <div className="space-y-2">
              {/* Protein indicator */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[9px] font-mono font-black text-[#1E293B] dark:text-gray-400">
                  <span className="text-indigo-600 dark:text-[#818CF8]">PROTEIN SYNTHESIS STATUS</span>
                  <span className="text-black dark:text-white">{scores.proteinCompliance}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 border border-[#1E293B]/10 dark:border-white/10 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full transition-all" style={{ width: `${scores.proteinCompliance}%` }} />
                </div>
              </div>

              {/* Iron indicator */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[9px] font-mono font-black text-[#1E293B] dark:text-gray-400">
                  <span className="text-[#FF3B30]">HEMOGLOBIN OXYGENATION</span>
                  <span className="text-black dark:text-white">{scores.ironCompliance}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 border border-[#1E293B]/10 dark:border-white/10 rounded-full overflow-hidden">
                  <div className="bg-[#FF3B30] h-full transition-all" style={{ width: `${scores.ironCompliance}%` }} />
                </div>
              </div>

              {/* Hydration indicator */}
              <div className="space-y-0.5">
                <div className="flex justify-between items-center text-[9px] font-mono font-black text-[#1E293B] dark:text-gray-400">
                  <span className="text-[#0EA5E9]">INTRA-DERMIS HYDRATION</span>
                  <span className="text-black dark:text-white">{scores.hydrationCompliance}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-white/10 h-1.5 border border-[#1E293B]/10 dark:border-white/10 rounded-full overflow-hidden">
                  <div className="bg-[#0EA5E9] h-full transition-all" style={{ width: `${scores.hydrationCompliance}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Card Footer metrics */}
        <div className="relative z-10 flex justify-between items-center text-xs font-mono select-none">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-[#8A2BE2] rounded-full inline-block animate-ping" />
            <div>
              <span className="text-[7.5px] text-gray-500 uppercase block leading-none">WEEKLY ACCELERATION</span>
              <span className="text-xs font-black uppercase text-purple-400">+2.3% projected growth</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[7.5px] text-gray-500 uppercase block leading-none">BIOLOGICAL INDEX</span>
            <span className="text-sm font-black text-[#0EA5E9]">{scores.dailyScore}% COMPLIANT</span>
          </div>
        </div>
      </div>

      {/* Problem 7: Premium Scalp Recovery Engine with Follicle Forest Visualizer */}
      <div id="scalp-microscope-card" className="bg-white dark:bg-[#111111] text-black dark:text-white border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        {/* Card Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400 tracking-widest block mb-0.5">BIOLOGICAL SIMULATOR</span>
            <h3 className="text-xl font-extrabold uppercase text-[#16213E] dark:text-white leading-none">Scalp Recovery Engine</h3>
          </div>
          <span className="text-[9px] uppercase font-black bg-blue-50 dark:bg-blue-900/40 text-[#0057FF] dark:text-[#4D8DFF] border border-blue-200 dark:border-blue-500/30 px-2.5 py-1 rounded-lg font-mono animate-pulse">
            Anagen Matrix Active
          </span>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-semibold leading-relaxed mb-6">
          "How is my hair getting better?" Visualize active follicle counts and scalp coverage growing dynamically over your 90-day nutrition and supplement timeline.
        </p>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
          {/* Left Column: Metric Core Readings */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4 bg-slate-50 dark:bg-zinc-900/60 border-2 border-[#1E293B]/10 dark:border-zinc-800 p-4 rounded-2xl">
            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">RECOVERY SCORE</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-black font-mono tracking-tighter text-[#16213E] dark:text-white">
                  {Math.min(100, 32 + Math.floor((follicleDay / 90) * 63))}%
                </span>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase font-mono bg-blue-100 dark:bg-blue-950/50 px-1.5 py-0.5 border border-blue-300 dark:border-blue-500/20 rounded">
                  anagen
                </span>
              </div>
              {/* Neobrutalist Block Progress Bar */}
              <div className="text-blue-500 dark:text-blue-400 font-mono text-md tracking-widest mt-1.5 select-none font-bold">
                {"█".repeat(Math.min(10, Math.round((Math.min(100, 32 + Math.floor((follicleDay / 90) * 63))) / 10)))}
                <span className="text-zinc-300 dark:text-zinc-850">
                  {"░".repeat(Math.max(0, 10 - Math.round((Math.min(100, 32 + Math.floor((follicleDay / 90) * 63))) / 10)))}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">PROJECTED DENSITY</span>
              <span className="text-lg font-extrabold text-[#0EA5E9] flex items-center gap-1 mt-0.5 font-mono">
                +{(0.2 + (follicleDay / 90) * 4.4).toFixed(1)}% <span className="text-zinc-500 font-normal text-xs">coverage increase</span>
              </span>
            </div>

            <div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block font-bold">CURRENT PHASE</span>
              <span className={`text-sm font-black uppercase mt-1 block font-mono ${
                follicleDay < 25 ? 'text-amber-500' : follicleDay < 55 ? 'text-blue-500' : 'text-[#0057FF]'
              }`}>
                {follicleDay < 25 ? 'Dormant Repair (Waking)' : follicleDay < 55 ? 'Transitional Growth' : 'Maximum Anagen Phase'}
              </span>
            </div>
          </div>

          {/* Right Column: Follicle Forest Viewport */}
          <div className="md:col-span-7 border-2 border-[#1E293B] dark:border-[#475569] bg-slate-100 dark:bg-[#151515] rounded-2xl min-h-[200px] relative overflow-hidden flex flex-col justify-between shadow-[inset_0_0_12px_rgba(0,0,0,0.15)] dark:shadow-[inset_0_0_12px_rgba(0,0,0,0.8)] select-none">
            {/* Ambient Background Grid lines */}
            <div className="absolute inset-0 bg-[#0EA5E9]/5 dark:bg-[linear-gradient(to_right,#222_1px,transparent_1px),linear-gradient(to_bottom,#222_1px,transparent_1px)] bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

            {/* Custom SVG Follicle Forest */}
            <div className="relative w-full h-full flex-grow flex items-end justify-center py-2">
              <svg className="w-full h-40 overflow-visible z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Horizontal Scalp Layer Reference */}
                <line x1="0" y1="85" x2="100" y2="85" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-zinc-800" />
                
                {/* Dynamic Follicles Array Rendering */}
                {STABLE_FOLLICLES.slice(0, Math.min(60, 10 + Math.floor((follicleDay / 90) * 50))).map((f) => {
                  // Standard height grows relative to timeline days
                  const progressFactor = follicleDay / 90;
                  const currentHeight = Math.min(f.baseHeight * 1.5, progressFactor * f.baseHeight * 1.8);
                  const isFullyGrown = follicleDay >= 55;

                  return (
                    <g key={f.id}>
                      {/* Sub-dermal bulb indicator node */}
                      <circle 
                        cx={f.x} 
                        cy={85} 
                        r={0.8 + progressFactor * 0.7} 
                        className="fill-blue-400/80 transition-all duration-300" 
                      />
                      {/* Active Hair Strand path */}
                      <motion.path 
                        d={`M${f.x},85 Q${f.x + f.curveAmount},${85 - currentHeight/2} ${f.x + f.curveAmount/2},${85 - currentHeight}`}
                        fill="none" 
                        stroke={isFullyGrown ? '#0EA5E9' : '#0057FF'}
                        strokeWidth={0.8 + progressFactor * 1.4}
                        strokeLinecap="round"
                        className="transition-all duration-300 opacity-90"
                        animate={{
                          d: [
                            `M${f.x},85 Q${f.x + f.curveAmount},${85 - currentHeight/2} ${f.x + f.curveAmount/2},${85 - currentHeight}`,
                            `M${f.x},85 Q${f.x + f.curveAmount + Math.sin(f.id) * 1.5},${85 - currentHeight/2} ${f.x + f.curveAmount/2 + Math.sin(f.id) * 2.5},${85 - currentHeight}`,
                            `M${f.x},85 Q${f.x + f.curveAmount},${85 - currentHeight/2} ${f.x + f.curveAmount/2},${85 - currentHeight}`
                          ]
                        }}
                        transition={{
                          duration: 4.5 + (f.id % 4) * 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Micro labels */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/80 dark:bg-black/60 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#1E293B]/10 dark:border-neutral-800 text-[8.5px] font-mono tracking-wider font-extrabold text-zinc-600 dark:text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
              FOL. FOREST ACTIVE: {Math.min(60, 10 + Math.floor((follicleDay / 90) * 50))} / 60 NODES
            </div>

            <div className="absolute top-2 right-2 flex items-center bg-[#8A2BE2] text-white font-mono text-[9px] font-black px-2 mt-0.5 py-0.5 rounded leading-none border border-black/10 dark:border-black/30">
              SIM DAY {follicleDay}
            </div>
          </div>
        </div>

        {/* biological input drivers instead of fake variables */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 text-[9.5px] font-mono select-none">
          <div className="bg-slate-50 dark:bg-zinc-900 border border-[#1E293B]/10 dark:border-zinc-800 p-2.5 rounded-xl animate-fade-in">
            <span className="block leading-none text-zinc-500 uppercase font-black">PROTEIN INPUT</span>
            <span className="font-extrabold text-zinc-800 dark:text-white block mt-1">
              {Math.min(100, 52 + Math.floor(Math.sin(follicleDay / 8) * 4) + Math.floor((follicleDay / 90) * 41))}% Compliance
            </span>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 mt-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, 52 + Math.floor(Math.sin(follicleDay / 8) * 4) + Math.floor((follicleDay / 90) * 41))}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 border border-[#1E293B]/10 dark:border-zinc-800 p-2.5 rounded-xl">
            <span className="block leading-none text-zinc-500 uppercase font-black">IRON COMPLIANCE</span>
            <span className="font-extrabold text-[#0057FF] block mt-1">
              {Math.min(100, 64 + Math.floor(Math.cos(follicleDay / 10) * 6) + Math.floor((follicleDay / 90) * 31))}% Level
            </span>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 mt-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-blue-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, 64 + Math.floor(Math.cos(follicleDay / 10) * 6) + Math.floor((follicleDay / 90) * 31))}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 border border-[#1E293B]/10 dark:border-zinc-800 p-2.5 rounded-xl">
            <span className="block leading-none text-zinc-500 uppercase font-black">HYDRATION RATE</span>
            <span className="font-extrabold text-[#0EA5E9] block mt-1">
              {Math.min(100, 48 + Math.floor(Math.sin(follicleDay / 12) * 5) + Math.floor((follicleDay / 90) * 47))}% Stable
            </span>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 mt-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-[#0EA5E9] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, 48 + Math.floor(Math.sin(follicleDay / 12) * 5) + Math.floor((follicleDay / 90) * 47))}%` }}
              />
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-zinc-900 border border-[#1E293B]/10 dark:border-zinc-800 p-2.5 rounded-xl">
            <span className="block leading-none text-zinc-500 uppercase font-black">SLEEP RECOVERY</span>
            <span className="font-extrabold text-purple-600 dark:text-purple-400 block mt-1">
              {Math.min(100, 72 + Math.floor(Math.cos(follicleDay / 15) * 5) + Math.floor((follicleDay / 90) * 23))}% Recovery
            </span>
            <div className="w-full bg-slate-200 dark:bg-zinc-800 h-1 mt-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-purple-500 h-full transition-all duration-300"
                style={{ width: `${Math.min(100, 72 + Math.floor(Math.cos(follicleDay / 15) * 5) + Math.floor((follicleDay / 90) * 23))}%` }}
              />
            </div>
          </div>
        </div>

        {/* Interactive Timeline slider panel */}
        <div className="space-y-2 bg-slate-50 dark:bg-[#202020]/40 p-3.5 rounded-xl border border-[#1E293B]/10 dark:border-zinc-800">
          <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-500 dark:text-zinc-400 uppercase">
            <span>DRAG PROTOCOL TIMELINE PROGRESSOR</span>
            <span className="text-[#0057FF] dark:text-[#4D8DFF] font-bold">Day {follicleDay} of 90</span>
          </div>
          
          <input 
            type="range"
            min="1"
            max="90"
            value={follicleDay}
            onChange={(e) => setFollicleDay(parseInt(e.target.value))}
            className="w-full accent-blue-500 h-2 bg-slate-200 dark:bg-neutral-800 rounded-lg cursor-pointer"
          />

          <div className="flex justify-between items-center text-[8.5px] font-bold text-zinc-500 uppercase font-mono">
            <span>Day 1: Dormant</span>
            <span>Day 45: Sprouting Zone</span>
            <span>Day 90: Dense Lock</span>
          </div>
        </div>
      </div>

      {/* 3. Biological Intelligence Recommendation Engine */}
      <div id="ai-biomonitor-card" className="bg-[#FFE9E5] text-black border-4 border-black p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Zap className="w-5 h-5 text-red-600 animate-bounce" />
          <h3 className="text-sm font-black uppercase tracking-wider text-red-950">AI BIOLOGICAL RECOVERY ANALYTICS</h3>
        </div>

        <div className="bg-white border-2 border-black rounded-2xl p-4 space-y-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div>
            <span className="text-[9px] font-mono font-black bg-red-100 border border-red-300 text-red-700 px-1.5 py-0.5 rounded">
              BIOMARKER DRIFT WARNING
            </span>
            <h4 className="font-extrabold text-[#3C1410] text-sm mt-1 uppercase">{insight.issue}</h4>
            <p className="text-xs text-gray-600 leading-snug mt-1">
              {insight.impact}
            </p>
          </div>

          <div className="border-t-2 border-dashed border-gray-200 pt-2.5">
            <span className="text-[9px] font-mono font-black text-red-800 uppercase block">RECOMMENDED NEXT PAYLOAD</span>
            <p className="text-xs font-bold text-[#111111] leading-snug mt-0.5">
              💡 {insight.recommendation}
            </p>
          </div>

          <div className="bg-[#E0DCFF] border border-black/10 px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold flex justify-between items-center text-black/85">
            <span>EXPECTED SPEED BOOST:</span>
            <span className="text-purple-900 font-extrabold">{insight.expected}</span>
          </div>
        </div>
      </div>

      {/* Problem 3, 5: Upgraded Nutrient DNA-Card Collectible Game built with Filling Progress Sliders */}
      <div id="biological-potency-card" className="space-y-3">
        <div className="flex justify-between items-end mb-1">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">NUTRITION SYSTEM DECK</span>
            <h4 className="text-md font-black uppercase text-black dark:text-white flex items-center gap-1 leading-none">
              <Dna className="w-4 h-4 text-blue-500 animate-spin" /> Chemical Potency Deck
            </h4>
          </div>
          <span className="text-[9px] font-extrabold text-blue-600 uppercase tracking-widest font-mono">
            6 Elements
          </span>
        </div>

        {/* Styled Horizontal selection deck */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.keys(nutrientDNADeck).map((key) => {
            const active = selectedNutrient === key;
            const element = nutrientDNADeck[key];
            return (
              <button
                key={key}
                onClick={() => setSelectedNutrient(key)}
                className={`px-3 py-2 border-2 border-black rounded-lg text-[10px] cursor-pointer font-black uppercase tracking-wider shrink-0 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                  active ? 'bg-[#111111] text-white border-white scale-105 z-10' : 'bg-white dark:bg-[#1B1B1B] text-black dark:text-white'
                }`}
              >
                <span className="mr-1" style={{ color: element.themeColor }}>●</span>{key}
              </button>
            );
          })}
        </div>

        {/* Selected card block with real progress indicators */}
        <AnimatePresence mode="wait">
          {selectedNutrient && (
            <motion.div
              key={selectedNutrient}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`border-4 border-black p-5 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${nutrientDNADeck[selectedNutrient].accentBg}`}
            >
              <div className="flex justify-between items-center mb-3.5">
                <span className="text-[9px] font-mono font-black border border-black/20 bg-white/40 px-2 py-0.5 rounded leading-none">
                  {selectedNutrient} MICROBIO MATRIX
                </span>
                
                <span className="text-[9.5px] uppercase font-mono font-black bg-white border-2 border-black px-2 py-0.5 rounded text-black leading-none">
                  {nutrientDNADeck[selectedNutrient].current} / {nutrientDNADeck[selectedNutrient].target}
                </span>
              </div>

              <h3 className="text-xl font-black uppercase leading-none tracking-wide text-black mb-1.5">
                {nutrientDNADeck[selectedNutrient].name}
              </h3>
              
              <p className="text-xs font-semibold leading-relaxed text-neutral-850 mb-3.5">
                {nutrientDNADeck[selectedNutrient].desc}
              </p>

              {/* Progress fillings with customized biological colors */}
              <div className="space-y-1.5 mb-4 bg-white/40 p-2.5 border-2 border-dashed border-black/20 rounded-xl text-black">
                <div className="flex justify-between items-center text-[9px] font-mono font-black uppercase">
                  <span>BIO-AVAILIBILITY COMPLIANCE</span>
                  <span>{nutrientDNADeck[selectedNutrient].rawPercent}%</span>
                </div>
                <div className="w-full bg-white h-3.5 border-2 border-black rounded-full overflow-hidden relative">
                  <motion.div 
                    className="h-full rounded-full"
                    style={{ backgroundColor: nutrientDNADeck[selectedNutrient].themeColor }}
                    initial={{ width: 0 }}
                    animate={{ width: `${nutrientDNADeck[selectedNutrient].rawPercent}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
              </div>

              {/* Specs benefits list */}
              <div className="space-y-3 bg-white/75 border-3 border-black p-3.5 rounded-2xl text-black select-none">
                <div>
                  <span className="text-[9px] font-mono font-black text-gray-500 uppercase block leading-none mb-1">POTENT ANAGEN BIOLOGICAL IMPACT:</span>
                  <div className="space-y-1">
                    {nutrientDNADeck[selectedNutrient].benefits.map((b, idx) => (
                      <p key={idx} className="text-xs font-black flex items-center gap-1.5 uppercase text-black leading-none py-0.5">
                        <Check className="w-4 h-4 text-blue-600 stroke-[3] shrink-0" /> {b}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="border-t border-black/10 pt-2 text-black">
                  <span className="text-[9px] font-mono font-black text-gray-500 uppercase block leading-none mb-1">BEST DAILY ENRICHED PROTOCOLS:</span>
                  <div className="flex flex-wrap gap-1">
                    {nutrientDNADeck[selectedNutrient].sources.map((src, idx) => (
                      <span key={idx} className="text-[9px] font-black font-mono border border-black bg-[#FFFEEB] px-2 py-0.5 rounded uppercase leading-none mt-1">
                        {src}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Problem 1 - Level 3: Upgraded Today's Mission Step Console (Highly Interactive Diet Phase cards) */}
      <div id="today-mission-protocol-stack" className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">OPERATIONAL LAUNCH CONTROL</span>
            <h3 className="text-lg font-black uppercase text-black dark:text-white leading-none">Today&apos;s Diet Protocol</h3>
          </div>
          <button
            onClick={() => setTab('diet')}
            className="flex items-center gap-1 font-black text-[10px] uppercase bg-[#0057FF] text-white border-2 border-black px-2.5 py-1.5 rounded-lg cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600 active:translate-y-0.5 transition-all text-center shrink-0"
          >
            Deploy Deck <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Render interactive structural steps */}
        <div className="space-y-4">
          {mealPhases.map((phase) => {
            const mData = activeLog.meals[phase.id];
            const completed = mData?.completed;
            const skipped = mData?.skipped;

            const activeOptionId = mData?.replacedWithId || phase.options[0].id;
            const currentOption = phase.options.find(o => o.id === activeOptionId) || phase.options[0];

            let phaseAccentColor = 'border-amber-400';
            let phaseEmoji = '🔥';
            let phaseBackground = 'bg-amber-50/20 dark:bg-amber-950/10';
            
            if (phase.id === 'phase_1') {
              phaseAccentColor = 'border-[#FFB703] text-amber-900';
              phaseEmoji = '🍳';
              phaseBackground = 'bg-[#FAF4E8] dark:bg-black/35';
            } else if (phase.id === 'phase_2') {
              phaseAccentColor = 'border-[#0057FF] text-blue-900';
              phaseEmoji = '🍗';
              phaseBackground = 'bg-blue-50/20 dark:bg-[#141414]';
            } else if (phase.id === 'phase_3') {
              phaseAccentColor = 'border-[#0057FF] text-blue-950';
              phaseEmoji = '🌰';
              phaseBackground = 'bg-blue-50/10 dark:bg-black/35';
            } else if (phase.id === 'phase_4') {
              phaseAccentColor = 'border-[#8A2BE2] text-purple-950';
              phaseEmoji = '🥣';
              phaseBackground = 'bg-purple-50/20 dark:bg-[#141414]';
            }

            return (
              <div 
                key={phase.id}
                onClick={() => setTab('diet')}
                className={`border-3 border-black rounded-2xl p-4.5 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:scale-[1.015] active:translate-y-0.5 transition-all flex flex-col justify-between ${phaseBackground} h-40 ${phaseAccentColor}`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{phaseEmoji}</span>
                      <h4 className="font-black text-sm uppercase text-black dark:text-white leading-none tracking-wide">{phase.title}</h4>
                    </div>
                    
                    <span className={`text-[8.5px] font-mono font-black border-2 border-black px-2 py-0.5 rounded-md shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                      completed ? 'bg-[#0057FF] text-white border-black' : skipped ? 'bg-rose-200 text-rose-800 border-red-500' : 'bg-white text-black'
                    }`}>
                      {completed ? 'DEPLOYED ✓' : skipped ? 'SKIPPED ✗' : 'READY TO DEPLOY'}
                    </span>
                  </div>

                  <p className="text-[9.5px] font-mono font-black text-gray-400 mt-1 uppercase">TIME INT: {phase.timeSlot}</p>
                </div>

                {/* Protein, Iron targets progress bars inside diet cards */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono select-none mt-2">
                  <div className="bg-white/85 dark:bg-black/40 border border-black/10 rounded-xl p-2">
                    <span className="text-[7.5px] font-bold text-blue-600 block uppercase">Protein Target</span>
                    <span className="font-black text-black dark:text-white">{currentOption.nutrition.protein}g</span>
                  </div>
                  <div className="bg-white/85 dark:bg-black/40 border border-black/10 rounded-xl p-2">
                    <span className="text-[7.5px] font-bold text-red-500 block uppercase">Iron Target</span>
                    <span className="font-black text-black dark:text-white">{currentOption.nutrition.iron}mg</span>
                  </div>
                </div>

                <div className="bg-black/5 dark:bg-black/30 px-2 py-1 rounded-lg flex items-center justify-between text-[10px] font-bold text-neutral-700 dark:text-neutral-400 mt-2 border border-black/5 select-none text-ellipsis overflow-hidden">
                  <span className="truncate max-w-[170px] uppercase font-black text-black dark:text-white">★ ACTIVE: {currentOption.name}</span>
                  <span className="text-[8px] font-mono text-[#8A2BE2] bg-white dark:bg-black px-1.5 py-0.5 rounded font-black">
                    +{currentOption.nutrition.biotin}mcg Bio
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Custom Visual Biological Timeline Section (Month-level progression) */}
      <div id="biological-progress-timeline" className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">MONTHLY EVOLUTION PATH</span>
            <h3 className="text-lg font-black uppercase text-black dark:text-white leading-none">Chemical Growth Timeline</h3>
          </div>
          <span className="text-[10px] uppercase font-black bg-[#E0DCFF] border-2 border-black tracking-tight px-2 py-0.5 rounded-lg text-black">
            Timeline
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mb-4">
          Witness simulated biochemical accumulation rates from Week 1 to Week 4 as nutrient thresholds stabilize.
        </p>

        {/* Interactive Week Switchers */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {[1, 2, 3, 4].map((wk) => (
            <button
              key={wk}
              onClick={() => setTimelineWeek(wk)}
              className={`py-2 border-2 border-black rounded-lg text-xs font-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                timelineWeek === wk 
                  ? 'bg-[#0057FF] text-white border-white scale-105' 
                  : 'bg-white dark:bg-[#141414] text-black dark:text-white hover:bg-gray-50'
              }`}
            >
              WK {wk}
            </button>
          ))}
        </div>

        {/* Custom Visual Timeline progress indicators mapping biological milestones */}
        <div className="space-y-3">
          {/* Protein Synthesis gauge */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-gray-500 uppercase">
              <span>Protein Synthesis Catalyst</span>
              <span className="text-black dark:text-white font-black">{timelineVals.protein}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/40 h-3 border-2 border-black rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#0057FF] h-full"
                animate={{ width: `${timelineVals.protein}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
            </div>
          </div>

          {/* Iron Stores gauge */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-gray-500 uppercase">
              <span>Iron Stores Index</span>
              <span className="text-black dark:text-white font-black">{timelineVals.iron}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/40 h-3 border-2 border-black rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#FF3B30] h-full"
                animate={{ width: `${timelineVals.iron}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
            </div>
          </div>

          {/* Hydration level gauge */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-gray-500 uppercase">
              <span>System Hydration Index</span>
              <span className="text-black dark:text-white font-black">{timelineVals.hydration}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/40 h-3 border-2 border-black rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#0057FF] h-full"
                animate={{ width: `${timelineVals.hydration}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
            </div>
          </div>

          {/* Hair recovery output */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[10px] font-mono font-black text-gray-500 uppercase">
              <span>Simulated Hair Root Recovery</span>
              <span className="text-[#8A2BE2] font-black">{timelineVals.recovery}%</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-black/40 h-3 border-2 border-black rounded-full overflow-hidden">
              <motion.div 
                className="bg-[#8A2BE2] h-full"
                animate={{ width: `${timelineVals.recovery}%` }}
                transition={{ type: 'spring', stiffness: 80 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 7. Gamification Monthly Challenges Center */}
      <div id="campaigns-challenges-card" className="bg-[#E0DCFF] border-4 border-black p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider">ACTIVE CAMPAIGNS</span>
            <h2 className="text-xl font-black text-black uppercase leading-none">Monthly Campaigns</h2>
          </div>
          <Trophy className="w-5 h-5 text-purple-800 animate-bounce" />
        </div>

        <p className="text-xs font-semibold text-gray-700 leading-snug mb-4">
          Sustain target parameters to claim deep XP, upgrade your rank levels, and unlock elite badges.
        </p>

        <div className="space-y-3.5">
          {challenges.map((challenge) => {
            const progressPct = Math.min(100, Math.round((challenge.current / challenge.target) * 100));
            const isCompleted = challenge.completed;

            return (
              <div 
                key={challenge.id}
                className="bg-white border-2 border-black rounded-2xl p-4 space-y-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-sm uppercase text-black leading-tight">{challenge.name}</h4>
                    <p className="text-[10px] text-gray-500 font-medium leading-snug mt-0.5">{challenge.description}</p>
                  </div>
                  <div>
                    <span className="font-mono text-[10px] font-black border border-black px-1.5 py-0.5 rounded bg-yellow-100 shrink-0">
                      +{challenge.rewardXp} XP
                    </span>
                  </div>
                </div>

                {/* Progress bar info */}
                <div className="pt-1.5 flex justify-between items-center text-[10px] font-mono font-black text-gray-400 uppercase">
                  <span>Target compliance</span>
                  <span>{challenge.current} / {challenge.target} Days</span>
                </div>

                <div className="w-full bg-gray-100 h-2 border border-black rounded-full overflow-hidden relative">
                  <div 
                    className="bg-purple-600 h-full"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>

                {/* Claim reward button */}
                <div className="flex justify-end pt-1">
                  {isCompleted ? (
                    <span className="text-[9px] font-mono font-black border-2 border-blue-600 text-blue-800 bg-blue-50 px-2 py-0.5 rounded-lg whitespace-nowrap animate-pulse">
                      CLAIMED ✓
                    </span>
                  ) : challenge.current >= challenge.target ? (
                    <button
                      onClick={() => completeChallenge(challenge.id)}
                      className="bg-[#0057FF] hover:bg-blue-600 text-white border border-black font-black text-[9px] px-3 py-1 rounded shadow cursor-pointer active:translate-y-0.5 select-none"
                    >
                      CLAIM XP REWARD
                    </button>
                  ) : (
                    <span className="text-[9px] font-mono font-black text-gray-400 uppercase">
                      IN PROGRESS...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. PWA HomeScreen Widgets Interactive Emulation Block */}
      <div id="pwa-launcher-widgets" className="bg-[#FAF4E8] dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-gray-500 tracking-wider">SYSTEM INTEGRATION</span>
            <h3 className="text-lg font-black uppercase text-black dark:text-white leading-none">Home Screen PWA Widgets</h3>
          </div>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold leading-relaxed mb-4">
          Enable home screen widgets in your browser launcher to track micro goals instantly without opening the applet.
        </p>

        {/* Emulated widgets container */}
        <div className="grid grid-cols-2 gap-4">
          
          {/* Widget 1: Hair Health Tracker */}
          <div className="bg-white dark:bg-[#111111] text-black dark:text-white border-3 border-[#1E293B] dark:border-[#475569] p-4 rounded-2xl relative shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C] flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-mono font-black text-[#0057FF] tracking-widest leading-none">DIET MANI</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-extrabold text-gray-500 dark:text-gray-400 uppercase leading-none block mb-0.5">HAIR COMPLIANCE</span>
              <span className="text-xl font-mono font-black text-[#16213E] dark:text-white">{scores.hairHealthCompliance}%</span>
            </div>
            <div className="flex justify-between items-center text-[7px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider border-t border-[#1E293B]/10 dark:border-white/10 pt-1 mt-1 font-mono">
              <span>{currentDateStr}</span>
              <span className="text-[#0057FF]">ACTIVE</span>
            </div>
          </div>

          {/* Widget 2: Hydration logs progress */}
          <div className="bg-[#CCEFFF] text-black border-3 border-black p-4 rounded-2xl relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between h-28">
            <div className="flex justify-between items-start">
              <span className="text-[8px] font-mono font-black text-blue-700 tracking-widest leading-none">HYDRATOR</span>
              <Droplets className="w-3.5 h-3.5 text-blue-600 animate-bounce" />
            </div>
            <div>
              <span className="text-[9px] font-mono font-extrabold text-gray-600 uppercase leading-none block mb-0.5">WATER LOGGINGS</span>
              <span className="text-xl font-mono font-black text-black">{activeLog.waterIntake} ml</span>
            </div>
            <div className="flex justify-between items-center text-[7px] text-gray-500 font-bold uppercase tracking-wider border-t border-black/10 pt-1 mt-1 font-mono">
              <span>TARGET {targetWater}ml</span>
              <span className="font-black text-blue-800">{Math.round((activeLog.waterIntake / targetWater) * 100)}%</span>
            </div>
          </div>

        </div>

        <button
          onClick={() => alert('PWA installation protocol unlocked. Standard installer can be invoked through browser menu icon.')}
          className="w-full bg-white dark:bg-[#141414] font-black border-2 border-black text-xs uppercase cursor-pointer py-2 px-3 rounded-lg mt-3 text-center transition-all hover:bg-gray-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 truncate shrink-0"
        >
          🔑 Install Biometric Widget Payload
        </button>
      </div>

    </div>
  );
};
