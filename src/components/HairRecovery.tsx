/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDietStore, Challenge } from '../store/dietStore';
import { 
  Camera, Sparkles, Trash2, Info, Activity, Clock, 
  Sun, Droplet, Zap, CheckCircle2, Coffee, ShieldAlert,
  Moon, Flame, Award, Calendar, RefreshCw
} from 'lucide-react';

export const HairRecovery: React.FC = () => {
  const {
    currentDateStr,
    dailyLogs,
    onboarding,
    hairPhotos,
    addHairPhoto,
    deleteHairPhoto,
    streakCount,
    calculateScoresForDate,
    updateHairProtocol,
    xp,
    addXp
  } = useDietStore();

  // Range slider compare index
  const [sliderIndex, setSliderIndex] = useState<number>(50);

  // Diagnosis wizard form fields
  const [newPhotoBase64, setNewPhotoBase64] = useState<string | null>(null);
  const [inputHairFall, setInputHairFall] = useState<number>(3);
  const [inputDensity, setInputDensity] = useState<number>(3);
  const [inputDandruff, setInputDandruff] = useState<'None'|'Light'|'Medium'|'Severe'>('Light');
  const [inputGrowth, setInputGrowth] = useState<number>(3);
  const [inputItching, setInputItching] = useState<'None'|'Light'|'High'>('Light');

  // Dynamic values for active date
  const activeLog = dailyLogs[currentDateStr] || {
    waterIntake: 0,
    sleepDuration: 8,
    meals: {}
  };
  
  const protocolState = activeLog.hairProtocol || {};

  // Extract compliance scores
  const scoresOnDate = calculateScoresForDate(currentDateStr);

  // 1. Calculate Scalp Health Score components
  const proteinScorePart = Math.min(100, scoresOnDate.proteinCompliance);
  const ironScorePart = Math.min(100, scoresOnDate.ironCompliance);
  const hydrationScorePart = Math.min(100, scoresOnDate.hydrationCompliance);
  
  const sleepTarget = onboarding?.sleepTarget || 7.5;
  const sleepScorePart = Math.min(100, Math.round((activeLog.sleepDuration / sleepTarget) * 100));
  
  const stressMapping = { 'Low': 100, 'Medium': 65, 'High': 30 };
  const stressScorePart = stressMapping[onboarding?.stressLevel || 'Medium'];

  // Checklist compliance part
  const totalHabits = 8;
  let completedHabits = 0;
  if (protocolState.morningWater) completedHabits++;
  if (protocolState.sunlight) completedHabits++;
  if (protocolState.scalpMassage) completedHabits++;
  if (protocolState.rosemaryOiling) completedHabits++;
  if (protocolState.stressControl) completedHabits++;
  if (protocolState.neckMobility) completedHabits++;
  if (protocolState.silkPillowcase) completedHabits++;
  if (protocolState.deepMassage) completedHabits++;

  const checklistScorePart = Math.round((completedHabits / totalHabits) * 100);

  // Combined score formula
  const scalpHealthScore = Math.min(100, Math.round(
    (proteinScorePart * 0.2) + 
    (ironScorePart * 0.15) + 
    (hydrationScorePart * 0.15) + 
    (sleepScorePart * 0.15) + 
    (stressScorePart * 0.15) + 
    (checklistScorePart * 0.2)
  ));

  // Determine Recovery Level
  const getRecoveryLevel = (score: number) => {
    if (score <= 20) return { label: 'Recovery Initiated', desc: 'Follicles are adapting to core nutrition profiles.', color: 'text-indigo-600 dark:text-indigo-400', badgeColor: 'bg-indigo-100 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-900/60' };
    if (score <= 40) return { label: 'Follicle Activation', desc: 'Micro-circulation is activating root dermal papilla cellular energy.', color: 'text-rose-500 dark:text-rose-400', badgeColor: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50' };
    if (score <= 60) return { label: 'Growth Stabilization', desc: 'Hair fallout rates are decreasing toward natural cycles.', color: 'text-amber-600 dark:text-amber-400', badgeColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50' };
    if (score <= 80) return { label: 'Recovery Acceleration', desc: 'Active structural strengthening of keratin bonds occurs.', color: 'text-cyan-600 dark:text-cyan-400', badgeColor: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50' };
    return { label: 'Peak Recovery', desc: 'Maximum follicular expansion, scalp elasticity, and sebum balance achieved.', color: 'text-emerald-600 dark:text-[#32D74B]', badgeColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50' };
  };

  const currentLevel = getRecoveryLevel(scalpHealthScore);

  // Dynamic AI coach messages using live logs
  const getDynamicCoachingInsight = () => {
    if (scoresOnDate.proteinCompliance < 70) {
      return "Keratin production is bottlenecked by low protein profiles today. Prioritize egg protocols or lean poultry to supply amino blocks.";
    }
    if (completedHabits >= 5) {
      return "Fantastic routine coverage today! Excellent scalp stimulation and mobility practice improves capillary nourishment.";
    }
    if (protocolState.scalpCheck === 'Itchy') {
      return "Scalp itch is registered. Ensure hair washing relies strictly on lukewarm water, and schedule a paraben-free calming wash.";
    }
    if (activeLog.sleepDuration < 7) {
      return "Sleep recorded is below recovery standards tonight. Elevated cortisol limits follicular progression. Aim for 8 hours.";
    }
    return "Scalp biometrics look highly stable. Nutrient absorption and follicle blood circulation levels are on healthy trajectories!";
  };

  const coachMessage = getDynamicCoachingInsight();

  // Photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateRecord = () => {
    if (!newPhotoBase64) return;
    addHairPhoto(
      newPhotoBase64,
      inputHairFall,
      inputDensity,
      inputDandruff,
      inputGrowth,
      inputItching
    );
    // Reset parameters
    setNewPhotoBase64(null);
  };

  const handleToggleHabit = (key: keyof typeof protocolState) => {
    updateHairProtocol({ [key]: !protocolState[key] });
  };

  const handleScalpSelect = (condition: 'Comfortable' | 'Oily' | 'Dry' | 'Itchy') => {
    updateHairProtocol({ scalpCheck: condition });
  };

  const beforePhoto = hairPhotos[hairPhotos.length - 1];
  const afterPhoto = hairPhotos[0];

  return (
    <div id="hair-recovery-modular" className="space-y-6 pb-28 text-black dark:text-white">
      
      {/* 1. SCALP HEALTH BIOMETRIC SCORE PANEL */}
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <div className="flex flex-col md:flex-row items-center gap-6">
          
          {/* Radial score ring */}
          <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
            {/* SVG circle rendering */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-gray-100 dark:stroke-zinc-800"
                strokeWidth="10"
                fill="transparent"
              />
              <motion.circle
                cx="64"
                cy="64"
                r="50"
                className="stroke-[#0057FF] dark:stroke-[#4D8DFF]"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 50}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - scalpHealthScore / 100) }}
                strokeLinecap="round"
                transition={{ duration: 1 }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-black font-mono leading-none">{scalpHealthScore}</span>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">SCALP REF</span>
            </div>
          </div>

          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#0057FF] dark:text-[#4D8DFF] bg-blue-50 dark:bg-blue-950/30 px-2 rounded-full border border-blue-200 dark:border-blue-900/40">
                Live Biometric
              </span>
              <span className={`text-[10px] uppercase font-black tracking-widest px-2 rounded-full border ${currentLevel.badgeColor} ${currentLevel.color}`}>
                {currentLevel.label}
              </span>
            </div>
            
            <h3 className="text-xl font-black uppercase text-[#16213E] dark:text-white leading-none">
              Scalp Health Index
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {currentLevel.desc} Calculated from protein, iron, water intake, sleep cycles, and daily follicle physical therapies.
            </p>
          </div>
        </div>

        {/* Breakdown segments */}
        <div className="mt-5 pt-4 border-t border-gray-100 dark:border-zinc-800/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[10px] font-mono select-none">
          <div className="p-2 bg-slate-50 dark:bg-[#151515]/40 rounded-xl border border-gray-100 dark:border-zinc-800/40">
            <span className="text-gray-400 block uppercase font-bold">Protein Synt:</span>
            <span className="text-indigo-600 dark:text-[#818CF8] font-black text-xs">{proteinScorePart}%</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-[#151515]/40 rounded-xl border border-gray-100 dark:border-zinc-800/40">
            <span className="text-gray-400 block uppercase font-bold">Iron Oxygenation:</span>
            <span className="text-red-500 dark:text-red-400 font-black text-xs">{ironScorePart}%</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-[#151515]/40 rounded-xl border border-gray-100 dark:border-zinc-800/40">
            <span className="text-gray-400 block uppercase font-bold">Scalar Water:</span>
            <span className="text-[#0EA5E9] dark:text-[#38BDF8] font-black text-xs">{hydrationScorePart}%</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-[#151515]/40 rounded-xl border border-gray-100 dark:border-zinc-800/40">
            <span className="text-gray-400 block uppercase font-bold">Sleep Restore:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black text-xs">{sleepScorePart}%</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-[#151515]/40 rounded-xl border border-gray-100 dark:border-zinc-800/40">
            <span className="text-gray-400 block uppercase font-bold">Stress Limit:</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-black text-xs">{stressScorePart}%</span>
          </div>
          <div className="p-2 bg-slate-50 dark:bg-[#151515]/40 rounded-xl border border-gray-100 dark:border-zinc-800/40">
            <span className="text-gray-400 block uppercase font-bold">Protocol Checked:</span>
            <span className="text-amber-600 dark:text-amber-400 font-black text-xs">{checklistScorePart}%</span>
          </div>
        </div>
      </div>

      {/* 2. DYNAMIC PREMIUM AI COACH INSIGHT CARD */}
      <div className="bg-amber-500/5 dark:bg-amber-500/10 border-3 border-amber-300 dark:border-amber-900/40 rounded-2xl p-4 flex gap-3 select-none">
        <div className="p-2 bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl h-fit">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="text-[9px] font-mono font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider">Premium AI Coach Insight</span>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-200 leading-snug mt-1">
            &quot;{coachMessage}&quot;
          </p>
        </div>
      </div>

      {/* 3. DAILY TRACKING HABIT PROTOCOLS */}
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <div className="mb-4">
          <span className="text-[9px] font-black tracking-widest uppercase text-purple-700 dark:text-purple-400">BIOLOGICAL ROUTINE LOG</span>
          <h3 className="text-xl font-black uppercase leading-none mt-1">Daily Capillary Protocols</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Ticking off items triggers instant 20 XP awards and builds follicle health streaks.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Wake-up Water */}
          <div 
            onClick={() => handleToggleHabit('morningWater')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.morningWater 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.morningWater ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Droplet className="w-4 h-4 text-[#0EA5E9]" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Wake-up Hydration</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">500ml pure water right after waking.</span>
            </div>
          </div>

          {/* Sunlight Exposure */}
          <div 
            onClick={() => handleToggleHabit('sunlight')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.sunlight 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.sunlight ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Sunlight Rays</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">10-15 Min before 9 AM for Vitamin D.</span>
            </div>
          </div>

          {/* Scalp Stimulation */}
          <div 
            onClick={() => handleToggleHabit('scalpMassage')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.scalpMassage 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.scalpMassage ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Activity className="w-4 h-4 text-purple-500" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Scalp Activation</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">5m finger massage to increase circulation.</span>
            </div>
          </div>

          {/* Rosemary Oil */}
          <div 
            onClick={() => handleToggleHabit('rosemaryOiling')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.rosemaryOiling 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.rosemaryOiling ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Zap className="w-4 h-4 text-[#8A2BE2]" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Rosemary Oiling</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">Carrier + rosemary 30-60m (3x/wk).</span>
            </div>
          </div>

          {/* Midday Stress Reduction */}
          <div 
            onClick={() => handleToggleHabit('stressControl')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.stressControl 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.stressControl ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Clock className="w-4 h-4 text-teal-500" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Stress Control</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">10m deep breathing or meditation walk.</span>
            </div>
          </div>

          {/* Neck & Scalp Mobility */}
          <div 
            onClick={() => handleToggleHabit('neckMobility')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.neckMobility 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.neckMobility ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Neck / Back Mobility</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">5m neck rotations & shoulder rolls.</span>
            </div>
          </div>

          {/* Silk Protection */}
          <div 
            onClick={() => handleToggleHabit('silkPillowcase')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.silkPillowcase 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.silkPillowcase ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Moon className="w-4 h-4 text-indigo-500" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Silk Protection</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">Satin or silk pillowcase cover deployment.</span>
            </div>
          </div>

          {/* Deep Massage */}
          <div 
            onClick={() => handleToggleHabit('deepMassage')}
            className={`cursor-pointer p-3 border-2 rounded-2xl flex items-start gap-2.5 transition-all select-none ${
              protocolState.deepMassage 
                ? 'bg-emerald-500/10 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-800 dark:text-[#32D74B]' 
                : 'bg-slate-50/50 dark:bg-[#111]/30 border-[#1E293B]/10 dark:border-[#2E2E2E] hover:border-blue-400'
            }`}
          >
            <div className={`p-1.5 rounded-lg border ${protocolState.deepMassage ? 'bg-emerald-500/20 border-emerald-500' : 'bg-white dark:bg-[#202020] border-gray-200 dark:border-zinc-800'}`}>
              <Award className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <span className="text-xs font-black block uppercase tracking-wide">Deep Scalp Massage</span>
              <span className="text-[10px] font-medium text-gray-500 block leading-tight mt-0.5">Weekly deep massage of 10-15 Min.</span>
            </div>
          </div>

        </div>
      </div>

      {/* 4. MIDDAY SCALP CONDITION SURVEY */}
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <div className="text-center sm:text-left mb-4">
          <span className="text-[9px] font-black tracking-widest uppercase text-sky-600 dark:text-sky-400">13:00 MIDDAY SECRETE CHECK</span>
          <h3 className="text-lg font-black uppercase text-black dark:text-white leading-none mt-1">
            Check Scalp Condition
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">
            Evaluate how your baseline feels right now to establish micro-sebum trend logs.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['Comfortable', 'Oily', 'Dry', 'Itchy'] as const).map((item) => {
            const isActive = protocolState.scalpCheck === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => handleScalpSelect(item)}
                className={`py-2 px-3 border-2 border-[#1E293B] dark:border-[#475569] text-xs font-black uppercase rounded-xl transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-[#FFB703] text-black border-2 border-[#1E293B] shadow-[2px_2px_0px_0px_#1E293B]' 
                    : 'bg-slate-50 dark:bg-zinc-800/40 text-black dark:text-white hover:bg-slate-100'
                }`}
              >
                {item === 'Comfortable' && '😌 '}
                {item === 'Oily' && '🧴 '}
                {item === 'Dry' && '🏜️ '}
                {item === 'Itchy' && '🪶 '}
                {item}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. INTERLOCKING BASELINE STRETCH VISUAL COMPARATOR */}
      {beforePhoto && afterPhoto && beforePhoto.id !== afterPhoto.id ? (
        <div className="bg-white dark:bg-[#1B1B1B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[9px] font-black uppercase text-gray-500 dark:text-gray-400 tracking-wider">VISUAL COMPARATOR</span>
              <h3 className="text-lg font-black uppercase text-black dark:text-white leading-none">Scalp Timeline Slider</h3>
            </div>
            <span className="text-[8px] font-mono uppercase font-black bg-[#FFB703] border-2 border-black tracking-tight px-1.5 py-0.5 rounded-lg text-black">
              Interactive Slide
            </span>
          </div>

          {/* Interactive slider image container split */}
          <div className="relative border-4 border-[#1E293B] dark:border-[#475569] rounded-[24px] overflow-hidden select-none aspect-3/2 bg-gray-100 shadow-[3px_3px_0px_0px_#1E293B] dark:shadow-[3px_3px_0px_0px_#0A0F1C]">
            {/* Base Image: AFTER (Newer) */}
            <img 
              referrerPolicy="no-referrer"
              src={afterPhoto.photoUrl} 
              alt="After follicle progress"
              className="absolute inset-0 w-full h-full object-cover animate-fade-in"
            />
            <div className="absolute bottom-2 right-4 bg-black/60 border border-white px-2 py-0.5 rounded-lg text-[9px] font-mono text-white tracking-wider uppercase font-black">
              Today ({afterPhoto.date})
            </div>

            {/* Hidden Left Layer: BEFORE (Older) */}
            <div 
              className="absolute inset-y-0 left-0 overflow-hidden border-r-3 border-black dark:border-white"
              style={{ width: `${sliderIndex}%` }}
            >
              <img 
                referrerPolicy="no-referrer"
                src={beforePhoto.photoUrl} 
                alt="Before follicle progress"
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="absolute bottom-2 left-4 bg-[#FFB703] border border-black px-2 py-0.5 rounded-lg text-[9px] font-mono text-black tracking-wider uppercase font-black">
                Baseline ({beforePhoto.date})
              </div>
            </div>

            {/* Slider Line Indicator Button handle */}
            <div 
              className="absolute inset-y-0 pointer-events-none"
              style={{ left: `${sliderIndex}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-3 border-black flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[#1E293B]">
                ↔
              </div>
            </div>

            {/* The Actual Range Input Overlay */}
            <input 
              type="range"
              min="0"
              max="100"
              value={sliderIndex}
              onChange={(e) => setSliderIndex(parseInt(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full"
            />
          </div>

          <div className="mt-3 bg-slate-50 dark:bg-zinc-900/20 border border-slate-100 dark:border-zinc-800/80 rounded-xl p-3 flex gap-2">
            <Info className="w-4 h-4 shrink-0 text-[#0057FF] dark:text-[#4D8DFF]" />
            <p className="text-[10px] leading-snug font-semibold text-gray-500 dark:text-gray-400">
              Drag left or right directly on the follicle progress window to wipe dynamically between original baseline scalp structures and today&apos;s recovery state.
            </p>
          </div>
        </div>
      ) : null}

      {/* 6. UPLOAD & DIAGNOSTIC LAB */}
      <div className="bg-[#E0F2FE] dark:bg-cyan-950/20 text-black dark:text-white border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <div className="mb-4">
          <span className="text-[9px] font-black tracking-widest uppercase text-cyan-600 dark:text-cyan-400">BIOMETRIC CAMERA LAB</span>
          <h3 className="text-xl font-black uppercase text-black dark:text-white leading-none mt-1">
            Diagnose Follicle Status
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 font-semibold">
            Capture or upload weekly front/left/right/top progress photos and verify root parameters.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <label className="bg-white text-[#1E293B] border-3 border-[#1E293B] hover:bg-slate-100 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-0.5 inline-flex items-center gap-1.5 transition-all select-none">
              <Camera className="w-4.5 h-4.5 text-blue-500" /> Specify Scalp Photo
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload} 
              />
            </label>
            {newPhotoBase64 ? (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 border-2 border-dashed border-emerald-400 py-1 px-2.5 rounded-lg font-mono font-black animate-pulse select-none">
                PHOTO REGISTERED ✓
              </span>
            ) : (
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider select-none">No camera frame selected</span>
            )}
          </div>

          {newPhotoBase64 && (
            <AnimatePresence>
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-[#1E1E1E] border-3 border-[#1E293B] dark:border-[#475569] p-4 rounded-[20px] space-y-4 shadow-[4px_4px_0px_0px_#1E293B] dark:shadow-[4px_4px_0px_0px_#0A0F1C]"
              >
                {/* Visual preview of chosen image */}
                <div className="border border-[#1E293B]/20 rounded-xl overflow-hidden aspect-video relative max-w-sm">
                  <img src={newPhotoBase64} alt="Frame preview" className="w-full h-full object-cover" />
                </div>

                {/* Hair fall input */}
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>Recent Daily Fallout</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400 font-extrabold">{inputHairFall}/5</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={inputHairFall} 
                    onChange={(e) => setInputHairFall(parseInt(e.target.value))} 
                    className="w-full accent-rose-500 cursor-pointer h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] font-mono font-extrabold text-gray-400 uppercase">
                    <span>LOW</span>
                    <span>NORMAL</span>
                    <span>HIGH SHED</span>
                  </div>
                </div>

                {/* Density input */}
                <div>
                  <div className="flex justify-between text-xs font-bold uppercase mb-1">
                    <span>Follicle Density</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-extrabold">{inputDensity}/5</span>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    value={inputDensity} 
                    onChange={(e) => setInputDensity(parseInt(e.target.value))} 
                    className="w-full accent-indigo-500 cursor-pointer h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg"
                  />
                  <div className="flex justify-between text-[9px] font-mono font-extrabold text-gray-400 uppercase">
                    <span>THIN</span>
                    <span>MODERATE</span>
                    <span>HIGH DENSITY</span>
                  </div>
                </div>

                {/* Dandruff options */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wide">Dandruff scale</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['None', 'Light', 'Medium', 'Severe'].map((ds) => (
                      <button
                        key={ds}
                        type="button"
                        onClick={() => setInputDandruff(ds as any)}
                        className={`py-1.5 border-2 border-[#1E293B] dark:border-[#475569] text-[9px] rounded-lg font-black uppercase cursor-pointer ${
                          inputDandruff === ds 
                            ? 'bg-[#FFB703] text-black font-black' 
                            : 'bg-slate-50 dark:bg-zinc-800 text-black dark:text-white'
                        }`}
                      >
                        {ds}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scalp Itching options */}
                <div className="space-y-1">
                  <span className="text-xs font-black uppercase tracking-wide">Scalp Pruritus (Itching)</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['None', 'Light', 'High'].map((it) => (
                      <button
                        key={it}
                        type="button"
                        onClick={() => setInputItching(it as any)}
                        className={`py-1.5 border-2 border-[#1E293B] dark:border-[#475569] text-[9px] rounded-lg font-black uppercase cursor-pointer ${
                          inputItching === it 
                            ? 'bg-amber-500 text-black font-black' 
                            : 'bg-slate-50 dark:bg-zinc-800 text-black dark:text-white'
                        }`}
                      >
                        {it}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateRecord}
                  className="w-full bg-[#0057FF] hover:bg-blue-600 text-white border-3 border-[#1E293B] py-2.5 rounded-xl text-xs font-black uppercase shadow-[2px_2px_0px_0px_#1E293B] cursor-pointer transition-colors"
                >
                  Save Diagnostics Log Photo (+100 XP)
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* 7. HAIR WASH PROTOCOL & SHOWER GUIDE */}
      <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <div className="mb-4">
          <span className="text-[9px] font-black tracking-widest uppercase text-indigo-600 dark:text-indigo-400">SHOWER DIRECTIVES</span>
          <h3 className="text-lg font-black uppercase leading-none mt-1">Shampoo & Water Protocol</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-semibold">Strict adherence protects lipid barriers from erosion.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-[#1E293B] dark:border-[#475569] rounded-2xl">
            <span className="text-[9px] text-[#0057FF] font-black block uppercase font-mono">RECOMMENDED GAP</span>
            <span className="text-xs font-black text-black dark:text-white block mt-1 uppercase">2-3 Wash Cycles Weekly</span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-1">Oily Scalp: Every 2 days. Dry Scalp: Twice weekly max.</span>
          </div>
          
          <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-[#1E293B] dark:border-[#475569] rounded-2xl">
            <span className="text-[9px] text-amber-500 font-black block uppercase font-mono">SHAMPOO REQUIREMENTS</span>
            <span className="text-xs font-black text-black dark:text-white block mt-1 uppercase">Sulfate & Paraben Free</span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-1">Gentle, safe, mild natural surfactant cleansers only.</span>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 border-2 border-[#1E293B] dark:border-[#475569] rounded-2xl">
            <span className="text-[9px] text-rose-500 font-black block uppercase font-mono">WATER TEMPERATURE</span>
            <span className="text-xs font-black text-black dark:text-white block mt-1 uppercase">Lukewarm Water Only</span>
            <span className="text-[10px] text-gray-500 block leading-tight mt-1">Never use hot water. Hot temp inflames follicular follicles.</span>
          </div>
        </div>
      </div>

      {/* 8. HISTORIC TIMELINE LOGS */}
      <div className="space-y-3">
        <h4 className="font-black text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5 select-none">
          <Activity className="w-4 h-4 text-orange-500" /> Follicle Growth Historic Logs
        </h4>
        
        {hairPhotos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 uppercase font-black font-mono text-xs border-2 border-dashed border-[#1E293B]/20 rounded-2xl">
            No follicle photologs found. Upload your baseline photo.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hairPhotos.map((photo) => (
              <div 
                key={photo.id}
                className="bg-white dark:bg-[#1B1B1B] text-black dark:text-white border-4 border-[#1E293B] dark:border-[#475569] p-4 rounded-[24px] shadow-[4px_4px_0px_0px_#1E293B] dark:shadow-[4px_4px_0px_0px_#0A0F1C] flex gap-4 font-sans"
              >
                <div className="w-24 h-24 border-2 border-black rounded-xl overflow-hidden shrink-0 relative shadow-[2px_2px_0px_0px_#1E293B]">
                  <img 
                    referrerPolicy="no-referrer"
                    src={photo.photoUrl} 
                    alt="Scalp timeline thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center bg-slate-50 dark:bg-zinc-800/40 p-1 rounded-lg border border-[#1E293B]/10">
                      <span className="font-mono text-[9px] font-black text-gray-600 dark:text-gray-400">
                        🗓️ {photo.date}
                      </span>
                      
                      <button 
                        onClick={() => deleteHairPhoto(photo.id)}
                        className="text-gray-400 hover:text-red-500 cursor-pointer transition-colors p-0.5 rounded"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2.5 text-[10px] font-bold font-mono">
                      <div>
                        <span className="text-gray-400 uppercase text-[8px] block">FALLOUT</span>
                        <span className="font-black text-rose-500 text-xs">{photo.metrics.hairFall}/5</span>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase text-[8px] block">DENSITY</span>
                        <span className="font-black text-[#0057FF] text-xs">{photo.metrics.density}/5</span>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase text-[8px] block">SCALP TEXTURE</span>
                        <span className="font-black text-black dark:text-white">{photo.metrics.scalpItching}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 uppercase text-[8px] block">FLAKES</span>
                        <span className="font-black text-black dark:text-white">{photo.metrics.dandruffStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
