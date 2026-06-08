/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDietStore } from '../store/dietStore';
import { 
  ChevronLeft, ChevronRight, Calendar, Layers, Clock, 
  Info, Check, X, ShieldAlert, Award, HeartPulse, Droplets, BookOpen, Workflow
} from 'lucide-react';
import { mealPhases } from '../data/protocol';
import { WorkspaceHub } from './WorkspaceHub';

export const CalendarView: React.FC = () => {
  const {
    currentDateStr,
    dailyLogs,
    calculateScoresForDate,
    setCurrentDate,
    onboarding,
    getOverallRating
  } = useDietStore();

  const [activeMode, setActiveMode] = useState<'calendar' | 'heatmap' | 'workspace'>('calendar');
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Helper: check performance color of a given day
  const getDayStatusTheme = (dateStr: string) => {
    const dLog = dailyLogs[dateStr];
    if (!dLog) return 'bg-[#FFFDF7] dark:bg-[#141414] text-gray-400 border-black/10';
    
    const score = calculateScoresForDate(dateStr);
    
    // Check if missed completely (skipped or no meals logged and date is past)
    const activeMeals = Object.values(dLog.meals) as any[];
    const completedCount = activeMeals.filter(m => m.completed).length;
    const skippedCount = activeMeals.filter(m => m.skipped).length;
    
    if (completedCount === 0 && skippedCount > 0) {
      return 'bg-rose-200 dark:bg-rose-950 border-[#FF3B30] text-red-900 dark:text-rose-200'; // Missed
    }
    
    if (score.dailyScore >= 90) {
      return 'bg-[#CCEFFF] border-[#0057FF] text-blue-900'; // Perfect Day
    } else if (score.dailyScore >= 70) {
      return 'bg-[#E0F2FE] border-[#0EA5E9] text-sky-900'; // Completed
    } else if (score.dailyScore > 0) {
      return 'bg-[#FFE2CC] border-[#FF7A00] text-[#A04000]'; // Partial
    }
    
    return 'bg-[#FFFDF7] dark:bg-[#141414] border-black text-black dark:text-white'; // Unlogged
  };

  const getDayLabel = (dateStr: string) => {
    const dLog = dailyLogs[dateStr];
    if (!dLog) return 'Unlogged';
    const score = calculateScoresForDate(dateStr);
    if (score.dailyScore >= 90) return 'Perfect Day';
    if (score.dailyScore >= 70) return 'Completed';
    if (score.dailyScore > 0) return 'Partial';
    return 'Missed';
  };

  // Calendar calculations
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();

  // Create grid cells
  const dayCells = [];
  // Empty slots before first day
  for (let i = 0; i < firstDayIndex; i++) {
    dayCells.push(<div key={`empty-${i}`} className="h-10 opacity-0" />);
  }

  // Actual day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isActive = dateStr === currentDateStr;
    const themeClass = getDayStatusTheme(dateStr);

    dayCells.push(
      <div
        key={`day-${day}`}
        onClick={() => setCurrentDate(dateStr)}
        className={`h-11 rounded-xl border-2 flex flex-col items-center justify-center font-bold font-mono text-xs cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:scale-95 transition-all text-center relative ${themeClass} ${
          isActive ? 'ring-4 ring-black dark:ring-white scale-105 z-10 animate-pulse' : ''
        }`}
      >
        <span>{day}</span>
        {isActive && (
          <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-black dark:bg-white" />
        )}
      </div>
    );
  }

  // Heatmap calculations (simulate last 12 weeks / 84 days)
  const renderHeatmap = () => {
    const today = new Date();
    const daysArr = [];
    const totalDays = 12 * 7; // 84 days

    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const themeClass = getDayStatusTheme(dStr);
      
      daysArr.push({
        dateStr: dStr,
        themeClass,
        label: getDayLabel(dStr),
        dayNum: d.getDate()
      });
    }

    return (
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-4 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white">
        <h4 className="font-extrabold text-sm uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-blue-500" /> Follicle Growth Grid (12 Weeks)
        </h4>

        {/* The Grid */}
        <div className="grid grid-cols-12 gap-1.5 h-36">
          {Array.from({ length: 12 }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-rows-7 gap-1">
              {Array.from({ length: 7 }).map((_, dayOfWeek) => {
                const cellIndex = (weekIndex * 7) + dayOfWeek;
                const cell = daysArr[cellIndex];
                if (!cell) return null;
                
                const isSelected = cell.dateStr === currentDateStr;

                return (
                  <div
                    key={dayOfWeek}
                    onClick={() => setCurrentDate(cell.dateStr)}
                    title={`${cell.dateStr}: ${cell.label}`}
                    className={`aspect-square rounded-xs border-2 cursor-pointer transition-all hover:scale-125 ${cell.themeClass} ${
                      isSelected ? 'ring-2 ring-black dark:ring-white scale-110 z-10' : ''
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3 text-[10px] font-bold font-mono uppercase text-gray-500">
          <span>84 Days Ago</span>
          <div className="flex gap-1 items-center">
            <span>Keys: </span>
            <span className="w-2.5 h-2.5 bg-rose-200 border-2 border-black rounded-xs" title="Missed" />
            <span className="w-2.5 h-2.5 bg-white border-2 border-black rounded-xs" title="Unlogged" />
            <span className="w-2.5 h-2.5 bg-[#FFE2CC] border-2 border-black rounded-xs" title="Partial" />
            <span className="w-2.5 h-2.5 bg-[#E0F2FE] border-2 border-black rounded-xs" title="Completed" />
            <span className="w-2.5 h-2.5 bg-[#CCEFFF] border-2 border-black rounded-xs" title="Perfect" />
          </div>
          <span>Today</span>
        </div>
      </div>
    );
  };

  const selectedLog = dailyLogs[currentDateStr];
  const selectedScores = calculateScoresForDate(currentDateStr);
  const ratingText = getOverallRating(selectedScores.dailyScore);

  return (
    <div id="calendar-root" className="space-y-6 pb-28 font-sans text-black dark:text-white">
      {/* Toggle mode headers */}
      <div className="bg-[#FFFDF7] dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-2 rounded-[24px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grid grid-cols-3 gap-1.5 text-black">
        <button
          onClick={() => setActiveMode('calendar')}
          className={`py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all outline-none ${
            activeMode === 'calendar' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Calendar
        </button>
        <button
          onClick={() => setActiveMode('heatmap')}
          className={`py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all ${
            activeMode === 'heatmap' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Heatmap
        </button>
        <button
          onClick={() => setActiveMode('workspace')}
          className={`py-3 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1 transition-all ${
            activeMode === 'workspace' 
              ? 'bg-[#0057FF] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' 
              : 'text-gray-500 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800'
          }`}
        >
          <Workflow className="w-3.5 h-3.5" /> Workspace
        </button>
      </div>

      {activeMode === 'calendar' ? (
        <div className="bg-white dark:bg-[#1B1B1B] border-4 border-black dark:border-[#2E2E2E] p-5 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black dark:text-white">
          <div className="flex justify-between items-center mb-5">
            <button
              onClick={handlePrevMonth}
              className="bg-white hover:bg-gray-50 border-3 border-black p-2 rounded-xl text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black uppercase text-black dark:text-white tracking-wide">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={handleNextMonth}
              className="bg-white hover:bg-gray-50 border-3 border-black p-2 rounded-xl text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center font-black text-xs uppercase text-gray-500 mb-2">
            <span>Su</span>
            <span>Mo</span>
            <span>Tu</span>
            <span>We</span>
            <span>Th</span>
            <span>Fr</span>
            <span>Sa</span>
          </div>

          {/* Grid Cells */}
          <div className="grid grid-cols-7 gap-2">
            {dayCells}
          </div>

          <div className="border-t-3 border-dashed border-gray-300 dark:border-[#2E2E2E] mt-5 pt-4 flex flex-wrap gap-3 text-[10px] font-bold font-mono uppercase text-[#A0A0A0]">
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-[#CCEFFF] border border-black rounded-lg inline-block text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" /> Perfect Day
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-[#E0F2FE] border border-black rounded-lg inline-block text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" /> Completed
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-[#FFE2CC] border border-black rounded-lg inline-block text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" /> Partial
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-4 bg-rose-200 border border-black rounded-lg inline-block text-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]" /> Missed
            </span>
          </div>
        </div>
      ) : activeMode === 'heatmap' ? (
        renderHeatmap()
      ) : (
        <WorkspaceHub />
      )}

      {/* 2. Upgrade Calendar View into rich visual "Mission History" logs */}
      {activeMode !== 'workspace' && selectedLog ? (
        <div className="bg-[#E0DCFF] border-4 border-black p-5 rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-black space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#5A50A1]">DIET COMMAND MISSION ARCHIVE</span>
            <span className="font-mono text-xs font-black bg-white border border-black px-2.5 py-0.5 rounded-lg text-black">
              {currentDateStr}
            </span>
          </div>

          <div className="flex justify-between items-center border-b border-purple-400 pb-3">
            <div>
              <h3 className="text-xl font-black uppercase text-black leading-none">
                Mission History Log
              </h3>
              <p className="text-[11px] font-mono font-bold uppercase text-purple-900 mt-1">
                {ratingText}
              </p>
            </div>
            
            {/* Compliance Badge display */}
            <div className="bg-white border-2 border-black p-2.5 rounded-xl text-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] select-none">
              <span className="text-[9px] font-mono font-black text-gray-500 uppercase block leading-none">DAY MATRIX</span>
              <span className="font-mono text-xl font-black text-black">{selectedScores.dailyScore}%</span>
            </div>
          </div>

          {/* Quick Metrics cards row for hydration & hair indices */}
          <div className="grid grid-cols-2 gap-3 pb-1">
            <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-400 flex items-center justify-center shrink-0">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-400 uppercase block leading-none">WATER METRIC</span>
                <span className="font-mono text-sm font-black">{selectedLog.waterIntake} ml</span>
              </div>
            </div>

            <div className="bg-white border-2 border-black rounded-xl p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-pink-100 border border-pink-400 flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <span className="text-[9px] font-mono text-gray-400 uppercase block leading-none">HAIR NUTRITION</span>
                <span className="font-mono text-sm font-black">{selectedScores.hairHealthCompliance}%</span>
              </div>
            </div>
          </div>

          {/* Dynamic checklist of individual phase operations */}
          <div className="space-y-3.5">
            <span className="text-[10px] font-mono font-black text-purple-900 uppercase tracking-widest block mb-0.5">CHECKLIST ADHERENCE DETAILS</span>
            
            {mealPhases.map((phase) => {
              const mData = selectedLog.meals[phase.id];
              const completed = mData?.completed;
              const skipped = mData?.skipped;

              // Extract associated active components
              const activeMealId = mData?.replacedWithId || phase.options[0].id;
              const selectedOption = phase.options.find(o => o.id === activeMealId) || phase.options[0];

              return (
                <div 
                  key={phase.id} 
                  className={`border-2 border-black rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    completed ? 'bg-[#E0F2FE]/65' : skipped ? 'bg-rose-50' : 'bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-black text-sm uppercase text-black leading-tight flex items-center gap-1.5">
                        {completed ? (
                          <span className="w-4 h-4 rounded-full bg-[#0057FF] flex items-center justify-center border border-black shrink-0">
                            <Check className="w-2.5 h-2.5 text-white" />
                          </span>
                        ) : skipped ? (
                          <span className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center border border-black shrink-0">
                            <X className="w-2.5 h-2.5 text-white" />
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center border border-black shrink-0" />
                        )}
                        {phase.title}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-mono uppercase font-bold mt-0.5">{phase.timeSlot}</p>
                    </div>

                    <span className={`text-[9px] font-mono font-black border px-2 py-0.5 rounded-md ${
                      completed ? 'bg-blue-100 border-blue-400 text-blue-800' : 
                      skipped ? 'bg-rose-100 border-rose-400 text-rose-800' : 'bg-gray-100 border-gray-400 text-gray-500'
                    }`}>
                      {completed ? 'COMPLETED' : skipped ? 'SKIPPED' : 'UNLOGGED'}
                    </span>
                  </div>

                  {/* Active Selected Meal options payload */}
                  <div className="bg-black/5 dark:bg-black/10 p-2.5 rounded-xl flex justify-between items-center text-xs mt-1 border border-black/5 select-none">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span className="font-bold text-gray-800 leading-none truncate max-w-[160px]">{selectedOption.name}</span>
                    </div>
                    <span className="font-mono text-[9px] bg-white border border-black/10 px-1.5 py-0.5 rounded font-extrabold text-black/80">
                      +{selectedOption.nutrition.protein}g Protein
                    </span>
                  </div>

                  {/* Optional Notes review display */}
                  {mData?.notes && (
                    <div className="mt-2.5 border-t border-dashed border-black/15 pt-2 text-[11px] text-gray-600">
                      <span className="font-mono font-black text-gray-400 block uppercase leading-none mb-1">NOTES RECORDED:</span>
                      <p className="italic font-medium leading-normal">&ldquo;{mData.notes}&rdquo;</p>
                    </div>
                  )}

                  {/* Post-meal reviews like mood/energy */}
                  {completed && mData?.moodAfterMeal && (
                    <div className="mt-2 text-[10px] border-t border-dashed border-black/15 pt-2 flex gap-3 text-gray-500 uppercase tracking-tight font-black font-mono">
                      <span>Mood: {mData.moodAfterMeal}/5</span>
                      <span>Energy: {mData.energyAfterMeal}/5</span>
                      {mData.scalpCondition && <span>Scalp: {mData.scalpCondition}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="border-4 border-dashed border-purple-300 p-6 rounded-[24px] text-center uppercase font-black text-xs text-purple-800 tracking-widest bg-purple-50">
          No logs loaded for active calendar day {currentDateStr}. Add meals and water to record!
        </div>
      )}
    </div>
  );
};
