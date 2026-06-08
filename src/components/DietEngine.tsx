/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDietStore } from '../store/dietStore';
import { mealPhases } from '../data/protocol';
import { 
  Check, X, RefreshCw, ChevronDown, ChevronUp, Image, 
  MessageSquare, Sliders, Brain, Gauge, Sparkles, Flame, Eye,
  BookOpen, HeartPulse, ShieldAlert, Award, Star, Clock
} from 'lucide-react';
import { ScalpCondition, HairSheddingLevel } from '../types';

export const DietEngine: React.FC = () => {
  const {
    currentDateStr,
    dailyLogs,
    toggleMealCompletion,
    skipMeal,
    replaceMeal,
    updateMealNotes,
    updateMealReview
  } = useDietStore();

  const activeLog = dailyLogs[currentDateStr];
  
  // Local UI status tracking state
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>('phase_1');
  const [replacingPhaseId, setReplacingPhaseId] = useState<string | null>(null);
  const [reviewingPhaseId, setReviewingPhaseId] = useState<string | null>(null);

  // Local state for meal reviews to prevent lagging
  const [reviewMood, setReviewMood] = useState<number>(4);
  const [reviewEnergy, setReviewEnergy] = useState<number>(4);
  const [reviewScalp, setReviewScalp] = useState<ScalpCondition>(ScalpCondition.NORMAL);
  const [reviewShedding, setReviewShedding] = useState<HairSheddingLevel>(HairSheddingLevel.NORMAL);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [reviewPhoto, setReviewPhoto] = useState<string | null>(null);

  if (!activeLog) {
    return (
      <div className="border-4 border-dashed border-red-300 p-8 rounded-[24px] text-center font-bold uppercase text-red-700 bg-red-50">
        Fatal Error: Active Day Log Not Seeded and Loaded.
      </div>
    );
  }

  const handleOpenReview = (phaseId: string, currentReview: any) => {
    setReviewingPhaseId(phaseId);
    setReviewMood(currentReview.moodAfterMeal || 4);
    setReviewEnergy(currentReview.energyAfterMeal || 4);
    setReviewScalp(currentReview.scalpCondition || ScalpCondition.NORMAL);
    setReviewShedding(currentReview.hairSheddingLevel || HairSheddingLevel.NORMAL);
    setReviewNotes(currentReview.notes || '');
    setReviewPhoto(currentReview.photo || null);
  };

  const handleSaveReview = (phaseId: string) => {
    updateMealNotes(phaseId, reviewNotes);
    updateMealReview(phaseId, reviewMood, reviewEnergy, reviewScalp, reviewShedding);
    setReviewingPhaseId(null);
  };

  // Safe file reader for mock/real photo uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Color generator for high-fidelity cards
  const getPhaseTheme = (phaseId: string) => {
    switch (phaseId) {
      case 'phase_1': return {
        bg: 'bg-[#FFF9E6]',
        border: 'border-[#FFB703]',
        headerBg: 'bg-[#FFB703]',
        badgeBg: 'bg-[#FFE2CC]',
        accentText: 'text-amber-800',
        glowColor: 'shadow-[0_0_15px_rgba(255,183,3,0.35)]',
        emoji: '🍳'
      };
      case 'phase_2': return {
        bg: 'bg-[#EFF8FF]',
        border: 'border-[#0057FF]',
        headerBg: 'bg-[#0057FF]',
        badgeBg: 'bg-[#CCEFFF]',
        accentText: 'text-blue-900',
        glowColor: 'shadow-[0_0_15px_rgba(0,87,255,0.25)]',
        emoji: '🍗'
      };
      case 'phase_3': return {
        bg: 'bg-blue-50/50',
        border: 'border-[#0057FF]',
        headerBg: 'bg-[#0057FF]',
        badgeBg: 'bg-blue-100',
        accentText: 'text-blue-950 dark:text-blue-200',
        glowColor: 'shadow-[0_0_15px_rgba(0,87,255,0.25)]',
        emoji: '🌰'
      };
      case 'phase_4': return {
        bg: 'bg-[#FAF5FF]',
        border: 'border-[#8A2BE2]',
        headerBg: 'bg-[#8A2BE2]',
        badgeBg: 'bg-[#E0DCFF]',
        accentText: 'text-purple-900',
        glowColor: 'shadow-[0_0_15px_rgba(138,43,226,0.25)]',
        emoji: '🥣'
      };
      default: return {
        bg: 'bg-white',
        border: 'border-black',
        headerBg: 'bg-black',
        badgeBg: 'bg-gray-100',
        accentText: 'text-black',
        glowColor: 'shadow-none',
        emoji: '🍽️'
      };
    }
  };

  return (
    <div id="diet-engine-root" className="space-y-6 pb-28 font-sans text-black dark:text-white">
      {/* Top Banner Guide - High Custom Styling */}
      <div className="bg-white dark:bg-[#111111] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] text-black dark:text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/15 rounded-full filter blur-xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full filter blur-lg pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full border border-[#1E293B]/10 dark:border-white/10 w-fit select-none">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400" />
            <span className="font-mono text-[9px] font-black uppercase tracking-widest text-[#0057FF] dark:text-[#4D8DFF]">BIOLOGICALLY CALIBRATED</span>
          </div>
          
          <h2 className="text-2xl font-black uppercase tracking-tight mt-2 leading-none text-[#16213E] dark:text-white">
            Ganesh&apos;s Diet Fuel Deck
          </h2>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 leading-relaxed mt-1">
            Activate, check compliance, and evaluate each meal-block. Every logged element feeds amino acids directly into your follicle growth timeline.
          </p>
        </div>
      </div>

      {/* Large Custom Beautiful Recipe Booklet Cards */}
      <div className="space-y-6">
        {mealPhases.map((phase) => {
          const mLog = activeLog.meals[phase.id] || {
            completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null,
            moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null
          };
          
          const selectedMealId = mLog.replacedWithId || phase.options[0].id;
          const activeMealOption = phase.options.find(o => o.id === selectedMealId) || phase.options[0];
          
          const isExpanded = expandedPhaseId === phase.id;
          const theme = getPhaseTheme(phase.id);

          return (
            <div 
              key={phase.id}
              className={`border-4 border-black rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${theme.glowColor} transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${theme.bg} text-black`}
            >
              <div className="absolute top-2 right-2 w-20 h-20 opacity-10 select-none pointer-events-none text-8xl leading-none">
                {theme.emoji}
              </div>

              {/* Card Header section info */}
              <div 
                className="p-5 cursor-pointer select-none"
                onClick={() => setExpandedPhaseId(isExpanded ? null : phase.id)}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-black border-2 border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] bg-white`}>
                    ⏱ {phase.timeSlot}
                  </span>
                  
                  {mLog.completed && (
                    <span className="text-[9px] uppercase font-mono font-black bg-[#0057FF] text-white border-2 border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      ACTIVE ✓
                    </span>
                  )}
                  {mLog.skipped && (
                    <span className="text-[9px] uppercase font-mono font-black bg-rose-200 text-rose-800 border-2 border-black px-2 py-0.5 rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      SKIPPED ✗
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-black uppercase tracking-tight mt-2 leading-none flex items-center justify-between">
                  <span>{phase.title}</span>
                  <span className="text-gray-400 font-normal shrink-0">
                    {isExpanded ? <ChevronUp className="w-5.5 h-5.5 text-black" /> : <ChevronDown className="w-5.5 h-5.5 text-black" />}
                  </span>
                </h3>
                
                <p className="text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">
                  🎯 Target biomarkers: {phase.goal}
                </p>
              </div>

              {/* Expanded active visual recipe details booklet block */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden border-t-4 border-black bg-white dark:bg-[#151515] text-black dark:text-white"
                  >
                    <div className="p-5 space-y-5">
                      
                      {/* Detailed Recipe layout card */}
                      <div className="bg-[#FFFDF7] dark:bg-[#1A1A1A] border-3 border-black rounded-[24px] p-4.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] select-none">
                        
                        <div className="flex justify-between items-start gap-3">
                          <div>
                            <span className="text-[9px] font-mono font-black text-blue-600 block uppercase">RECOMMENDED TARGET MEDICINE</span>
                            <h4 className="text-lg font-black uppercase leading-tight tracking-wide text-black dark:text-white mt-0.5">{activeMealOption.name}</h4>
                          </div>

                          <button
                            onClick={() => setReplacingPhaseId(phase.id)}
                            className="bg-white text-black border-2 border-black p-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase tracking-widest shrink-0 cursor-pointer hover:bg-gray-50 active:translate-y-0.5 flex items-center gap-1 transition-transform"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> SWAP RECIPE
                          </button>
                        </div>

                        {/* Stars indicator of efficacy */}
                        <div className="flex items-center gap-1.5 mt-2.5">
                          <div className="flex text-yellow-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                            ))}
                          </div>
                          <span className="font-mono text-[10px] font-black uppercase text-gray-400">
                            Growth index: {activeMealOption.nutrition.hairGrowthScore}/10
                          </span>
                        </div>

                        {/* Ingredients Checklist */}
                        <div className="mt-4 border-t border-dashed border-gray-300 dark:border-white/10 pt-3">
                          <span className="text-[10px] font-mono font-black text-gray-500 uppercase tracking-widest block mb-1">INGREDIENT DISPENSARY PROTOCOL</span>
                          <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                            {activeMealOption.ingredients.map(ing => (
                              <div 
                                key={ing}
                                className="flex items-center gap-1.5 bg-blue-50/50 dark:bg-black/30 border border-black/10 p-1.5 rounded-xl text-xs font-bold text-black dark:text-white"
                              >
                                <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="truncate uppercase">{ing}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Animated Glowing Nutrient Progress bar metrics */}
                        <div className="mt-4 border-t border-black/10 pt-3">
                          <span className="text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 uppercase block mb-2 tracking-widest">
                            MOLECULAR METRIC SPECS
                          </span>
                          
                          <div className="grid grid-cols-4 gap-2 text-center text-black">
                            {/* Protein chip */}
                            <div className="bg-[#CCEFFF] border-2 border-black p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                              <span className="block text-[8px] font-bold uppercase text-blue-900 leading-none">Protein</span>
                              <span className="font-mono text-xs font-black">{activeMealOption.nutrition.protein}g</span>
                            </div>
                            
                            {/* Iron chip */}
                            <div className="bg-[#FFE2CC] border-2 border-black p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                              <span className="block text-[8px] font-bold uppercase text-orange-950 leading-none">Iron</span>
                              <span className="font-mono text-xs font-black">{activeMealOption.nutrition.iron}mg</span>
                            </div>

                            {/* Biotin chip */}
                            <div className="bg-[#CCEFFF] border-2 border-black p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                              <span className="block text-[8px] font-bold uppercase text-blue-900 leading-none">Biotin</span>
                              <span className="font-mono text-xs font-black">{activeMealOption.nutrition.biotin}mcg</span>
                            </div>

                            {/* Zinc chip */}
                            <div className="bg-[#E0DCFF] border-2 border-black p-2 rounded-xl shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)]">
                              <span className="block text-[8px] font-bold uppercase text-purple-950 leading-none">Zinc</span>
                              <span className="font-mono text-xs font-black">{activeMealOption.nutrition.zinc}mg</span>
                            </div>
                          </div>
                        </div>

                        {/* Clinical impact mechanism */}
                        <div className="mt-4 bg-orange-50/50 dark:bg-black/30 border border-black/10 p-3 rounded-2xl">
                          <span className="text-[9px] font-mono font-black text-rose-800 uppercase flex items-center gap-1 mb-1 leading-none">
                            <HeartPulse className="w-3.5 h-3.5" /> RECOVERY MECHANISM SUMMARY:
                          </span>
                          <p className="text-[11px] leading-relaxed font-semibold text-gray-700 dark:text-gray-300 uppercase italic">
                            &ldquo;{activeMealOption.nutrition.recoveryImpact}&rdquo;
                          </p>
                        </div>
                      </div>

                      {/* Operation action trays - Neobrutalist design */}
                      <div className="grid grid-cols-3 gap-3">
                        <button
                          onClick={() => toggleMealCompletion(phase.id, activeMealOption.id)}
                          title="Complete Meal"
                          className={`py-2.5 rounded-xl border-3 border-black text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 select-none transition-all flex items-center justify-center ${
                            mLog.completed 
                              ? 'bg-[#0057FF] text-white' 
                              : 'bg-white hover:bg-gray-50 text-black'
                          }`}
                        >
                          <Check className="w-5 h-5 stroke-[3.5]" />
                        </button>

                        <button
                          onClick={() => skipMeal(phase.id)}
                          title="Skip Meal"
                          className={`py-2.5 rounded-xl border-3 border-black text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 select-none transition-all flex items-center justify-center ${
                            mLog.skipped 
                              ? 'bg-rose-400 text-black border-red-800' 
                              : 'bg-white hover:bg-rose-50 text-black'
                          }`}
                        >
                          <X className="w-5 h-5 stroke-[3.5]" />
                        </button>

                        <button
                          onClick={() => handleOpenReview(phase.id, mLog)}
                          title="Log Reviews"
                          className="py-2.5 bg-[#FFB703] hover:bg-amber-400 text-black rounded-xl border-3 border-black text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 select-none transition-transform flex items-center justify-center"
                        >
                          <MessageSquare className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Biofeedback evaluation details */}
                      {(mLog.moodAfterMeal || mLog.notes) && (
                        <div className="bg-[#E0DCFF] border-3 border-black text-black rounded-[24px] p-4 flex gap-3 shadow-[2.5px_2.5px_0px_0px_rgba(0,0,0,1)] select-none">
                          <Brain className="w-5.5 h-5.5 text-purple-800 shrink-0 mt-0.5 animate-pulse" />
                          <div>
                            <span className="text-[9px] font-mono font-black text-purple-900 block uppercase leading-none">COMMITTED POST-MEAL EVALUATION</span>
                            {mLog.notes && <p className="font-extrabold text-[#1a153c] italic mt-1 text-xs">&ldquo;{mLog.notes}&rdquo;</p>}
                            
                            <div className="flex flex-wrap gap-2.5 mt-2.5 text-[9px] font-mono text-[#201552] font-black uppercase">
                              <span className="bg-white border border-black/10 px-1.5 py-0.5 rounded">Mood: {mLog.moodAfterMeal}★</span>
                              <span className="bg-white border border-black/10 px-1.5 py-0.5 rounded">Energy: {mLog.energyAfterMeal}⚡</span>
                              {mLog.scalpCondition && <span className="bg-white border border-black/10 px-1.5 py-0.5 rounded">Scalp: {mLog.scalpCondition}</span>}
                              {mLog.hairSheddingLevel && <span className="bg-white border border-black/10 px-1.5 py-0.5 rounded">Shedding: {mLog.hairSheddingLevel}</span>}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* SWAP RECIPE MODAL SELECTOR */}
      <AnimatePresence>
        {replacingPhaseId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFDF7] dark:bg-[#111111] border-4 border-black dark:border-[#2E2E2E] rounded-[28px] p-5.5 w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white"
            >
              <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-black dark:border-white/25 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-black text-gray-500 uppercase">SWAP SELECTION BOARD</span>
                  <h3 className="text-xl font-black uppercase tracking-tight leading-none text-black dark:text-white">Alternative Protocols</h3>
                </div>
                <button 
                  onClick={() => setReplacingPhaseId(null)}
                  className="bg-white border-2 border-black p-1 rounded-lg text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex items-center justify-center"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {mealPhases.find(p => p.id === replacingPhaseId)?.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => {
                      replaceMeal(replacingPhaseId, option.id);
                      setReplacingPhaseId(null);
                    }}
                    className="bg-white dark:bg-[#1C1C1E] text-black dark:text-white hover:border-[#0057FF] hover:scale-[1.02] border-3 border-black rounded-[22px] p-4 cursor-pointer shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-extrabold text-sm uppercase leading-tight text-black dark:text-white">{option.name}</h4>
                      <span className="font-mono text-[9px] font-black border border-black/10 bg-[#FFF2B2] text-black px-1.5 py-0.5 rounded leading-none shrink-0">
                        ⭐ {option.nutrition.hairGrowthScore} Score
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold uppercase leading-snug">
                      🧫 {option.nutritionLabel}
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium italic mt-1 font-mono">
                      {option.ingredients.join(' + ')}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DETAILED RECIPE biofeedback evaluations modal */}
      <AnimatePresence>
        {reviewingPhaseId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#FFFDF7] dark:bg-[#111111] border-4 border-black dark:border-[#2E2E2E] rounded-[28px] p-6 w-full max-w-md shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white"
            >
              <div className="flex justify-between items-center mb-4 border-b-2 border-dashed border-black/20 pb-3">
                <div>
                  <span className="text-[9px] font-mono font-black text-gray-500 uppercase">POST-PRANDIAL SYMPTOM CORE</span>
                  <h3 className="text-xl font-black uppercase text-black dark:text-white leading-none">Biofeedback Report</h3>
                </div>
                <button 
                  onClick={() => setReviewingPhaseId(null)}
                  className="bg-white border-2 border-black p-1 rounded-lg text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 flex-row"
                >
                  <X className="w-5.5 h-5.5" />
                </button>
              </div>

              <div className="space-y-4.5 max-h-[420px] overflow-y-auto pr-1">
                {/* Mood Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 block tracking-wider">Mood Satiety Assessment</label>
                  <div className="flex justify-between gap-1.5">
                    {[1, 2, 3, 4, 5].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setReviewMood(m)}
                        className={`flex-1 py-1.5 px-1 border-3 border-black text-base rounded-xl font-bold cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 select-none transition-all ${
                          reviewMood === m ? 'bg-[#FF7A00] text-black font-black scale-105 border-white' : 'bg-white text-black'
                        }`}
                      >
                        {m === 1 && '🤬'}
                        {m === 2 && '🙁'}
                        {m === 3 && '😐'}
                        {m === 4 && '🙂'}
                        {m === 5 && '🔥'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Energy Rating */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 block tracking-wider">Neural Energy State</label>
                  <div className="flex justify-between gap-1.5">
                    {[1, 2, 3, 4, 5].map((e) => (
                      <button
                        key={e}
                        type="button"
                        onClick={() => setReviewEnergy(e)}
                        className={`flex-1 py-1 px-1 border-3 border-black rounded-xl font-bold font-mono cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 select-none transition-all ${
                          reviewEnergy === e ? 'bg-[#FFB703] text-black font-black scale-105 border-white' : 'bg-white text-black'
                        }`}
                      >
                        {e} ⚡
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scalp state */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 block tracking-wider">Epidermal Scalp State</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(ScalpCondition).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewScalp(s)}
                        className={`py-1.5 px-0.5 border-3 border-black text-xs rounded-xl font-extrabold uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                          reviewScalp === s ? 'bg-[#D4F7E7] text-black border-white' : 'bg-white text-black'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hair shedding level */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 block tracking-wider">Active Shedding Count</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(HairSheddingLevel).map((sh) => (
                      <button
                        key={sh}
                        type="button"
                        onClick={() => setReviewShedding(sh)}
                        className={`py-1.5 px-0.5 border-3 border-black text-xs text-center rounded-xl font-extrabold uppercase cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                          reviewShedding === sh ? 'bg-[#FFE9E5] text-black border-white' : 'bg-white text-black'
                        }`}
                      >
                        {sh}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes review details input */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 block tracking-wider">Biofeedback Note Logs</label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Describe textures, symptoms, or stomach fullness..."
                    className="w-full bg-white text-black border-3 border-black rounded-[20px] p-3 text-xs font-bold focus:outline-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  />
                </div>

                {/* Photos simulation component */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500 block tracking-wider font-sans">Visual Payload Photo</label>
                  <div className="flex gap-3 items-center">
                    <label className="bg-[#E0DCFF] text-black border-3 border-black px-4.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#bcb5ff] active:translate-y-0.5">
                      <Image className="w-3.5 h-3.5 inline-block mr-1" /> UPLOAD IMAGE
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                        className="hidden" 
                      />
                    </label>
                    {reviewPhoto ? (
                      <span className="text-[10px] bg-blue-100 text-blue-800 border-2 border-dashed border-blue-400 p-1 rounded-md font-mono font-bold">
                        D-PICTURE SEEDED ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase font-mono leading-none">NO PICTURE DETECTED</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action commit button */}
              <button
                onClick={() => handleSaveReview(reviewingPhaseId!)}
                className="w-full bg-[#0057FF] text-white border-4 border-black py-3 rounded-[24px] text-sm font-black uppercase cursor-pointer hover:bg-blue-600 active:translate-y-0.5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mt-5"
              >
                COMMIT MEAL EVALUATION
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
