/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDietStore } from '../store/dietStore';
import { 
  Sparkles, Brain, Soup, Calendar, Flame, ShieldAlert, 
  TrendingUp, Activity, FileText, Camera, ShoppingCart, HelpCircle,
  Clock, CheckCircle, RefreshCcw, DollarSign, ListOrdered, ChevronRight,
  User, ArrowRight, Eye, RefreshCw, Send, Sliders
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const AICopilot: React.FC = () => {
  const {
    currentDateStr,
    dailyLogs,
    onboarding,
    calculateScoresForDate,
    hairPhotos,
    xp,
    addXp
  } = useDietStore();

  // Selected sub-feature inside the Copilot Hub
  const [activeSubView, setActiveSubView] = useState<'moat' | 'coach' | 'swap' | 'planner' | 'scalp' | 'shedding' | 'timeline' | 'behavior' | 'doctor' | 'report' | 'shopping'>('moat');

  // Loading indicator
  const [loading, setLoading] = useState<boolean>(false);
  const [logText, setLogText] = useState<string>('');

  // Level 1: AI Recovery Coach State
  const [coachResponse, setCoachResponse] = useState<string>('');

  // Level 1: AI Meal Swapper State
  const [swapQuery, setSwapQuery] = useState<string>('');
  const [selectedPhase, setSelectedPhase] = useState<string>('phase_1');
  const [swapResponse, setSwapResponse] = useState<string>('');

  // Level 1: AI Diet Planner State
  const [plannerBudget, setPlannerBudget] = useState<string>('₹150/day');
  const [plannerResponse, setPlannerResponse] = useState<string>('');

  // Level 2: AI Trend/Forecast State
  const [forecastResponse, setForecastResponse] = useState<string>('');

  // Level 3: Computer Vision Scalp State
  const [photoPosition, setPhotoPosition] = useState<'Front' | 'Top' | 'Left' | 'Right'>('Top');
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [scalpResponse, setScalpResponse] = useState<string>('');
  const [isPhotoScanning, setIsPhotoScanning] = useState<boolean>(false);

  // Level 3: Hair Fall Tracking State
  const [sheddingPhoto, setSheddingPhoto] = useState<string | null>(null);
  const [sheddingSource, setSheddingSource] = useState<'Pillow' | 'Comb' | 'Drain'>('Comb');
  const [sheddingResponse, setSheddingResponse] = useState<string>('');

  // Level 5: Behavioral AI State
  const [behaviorResponse, setBehaviorResponse] = useState<string>('');

  // Level 6: AI Hair Doctor State
  const [doctorQuestion, setDoctorQuestion] = useState<string>('');
  const [doctorChat, setDoctorChat] = useState<{ sender: 'user' | 'doctor'; text: string }[]>([
    { sender: 'doctor', text: "Welcome to your Premium AI Hair Clinic. Ask me any diagnosis question about your daily logs, stress levels, hydration patterns or progressive follicle photos." }
  ]);

  // Level 6: AI Tool Reports & Grocery
  const [weeklyReportResponse, setWeeklyReportResponse] = useState<string>('');
  const [shoppingListResponse, setShoppingListResponse] = useState<string>('');

  // Core Moat Answer
  const [moatResponse, setMoatResponse] = useState<string>('');

  // Auto-load Moat on arrival
  useEffect(() => {
    handleMoatQuery();
  }, [currentDateStr]);

  // Handler for Core Moat query
  const handleMoatQuery = async () => {
    setLoading(true);
    setLogText('Calling Biological Recovery Intelligence algorithms...');
    const currentScores = calculateScoresForDate(currentDateStr);
    const yesterdayDate = new Date();
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    const yesterdayLog = dailyLogs[yesterdayStr] || null;

    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/moat-copilot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          todayLogs: dailyLogs[currentDateStr] || {},
          yesterdayLogs: yesterdayLog,
          onboardingData: onboarding || {},
          currentScores: currentScores
        })
      });
      const data = await res.json();
      setMoatResponse(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 1: Morning Recovery Coach
  const handleCoachQuery = async () => {
    setLoading(true);
    setLogText('Generating personalized trichology routine matrices...');
    const scores = calculateScoresForDate(currentDateStr);
    const currentLog = dailyLogs[currentDateStr] || {};
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/recovery-coach`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: onboarding?.name || 'Ganesh',
          log: currentLog,
          scores: scores,
          onboarding: onboarding
        })
      });
      const data = await res.json();
      setCoachResponse(data.text);
      addXp(15);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 1: Meal Swap
  const handleSwapQuery = async () => {
    if (!swapQuery.trim()) return;
    setLoading(true);
    setLogText('Analyzing amino profile replacements and recovery levels...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/meal-swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: swapQuery,
          phaseId: selectedPhase,
          currentMealName: selectedPhase === 'phase_1' ? 'Egg Protocol' : 'Bean curry',
          lifestyle: onboarding?.lifestyle || 'Vegetarian'
        })
      });
      const data = await res.json();
      setSwapResponse(data.text);
      addXp(10);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 1: Diet Planner
  const handlePlannerQuery = async () => {
    setLoading(true);
    setLogText('Assembling cost-efficient micronutrient targets...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/diet-planner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget: plannerBudget,
          lifestyle: onboarding?.lifestyle || 'Vegetarian',
          concerns: onboarding?.selectedConcerns?.join(', ') || 'Thinning and hair loss'
        })
      });
      const data = await res.json();
      setPlannerResponse(data.text);
      addXp(20);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 2: Recovery Timeline Forecast
  const handleForecastQuery = async () => {
    setLoading(true);
    setLogText('Computing day 30, 60, 90 follicular progression simulation...');
    const currentScores = calculateScoresForDate(currentDateStr);
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/recovery-forecast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScore: currentScores.dailyScore,
          complianceLog: dailyLogs,
          timelineDays: 90
        })
      });
      const data = await res.json();
      setForecastResponse(data.text);
      addXp(25);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 3: Computer Vision Scalp Photo Upload/Scan
  const handleScalpPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScalpScan = async () => {
    if (!uploadedPhoto) return;
    setIsPhotoScanning(true);
    setLogText('Executing image processing and miniaturization pattern matching...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/scalp-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: uploadedPhoto,
          position: photoPosition
        })
      });
      const data = await res.json();
      setScalpResponse(data.text);
      addXp(50);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPhotoScanning(false);
    }
  };

  // Level 3: Hair Fall Tracker Photo Scan
  const handleSheddingPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSheddingPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSheddingScan = async () => {
    if (!sheddingPhoto) return;
    setIsPhotoScanning(true);
    setLogText('Counting physical follicles and projecting telogen shedding states...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/hair-fall-tracker`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: sheddingPhoto,
          source: sheddingSource
        })
      });
      const data = await res.json();
      setSheddingResponse(data.text);
      addXp(40);
    } catch (err) {
      console.error(err);
    } finally {
      setIsPhotoScanning(false);
    }
  };

  // Level 5: Behavioral Pattern Detection
  const handleBehaviorQuery = async () => {
    setLoading(true);
    setLogText('Locating routine anomalies and hydration failure patterns...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/behavioral-diagnostics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logsTimeline: dailyLogs
        })
      });
      const data = await res.json();
      setBehaviorResponse(data.text);
      addXp(30);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 6: Premium AI Hair Doctor Question
  const handleDoctorSubmit = async () => {
    if (!doctorQuestion.trim()) return;
    const userQuery = doctorQuestion;
    setDoctorQuestion('');
    setDoctorChat(prev => [...prev, { sender: 'user', text: userQuery }]);
    
    setLoading(true);
    setLogText('Interfacing with clinic trichologist databases...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/doctor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuery,
          logData: dailyLogs,
          photosRecord: hairPhotos
        })
      });
      const data = await res.json();
      setDoctorChat(prev => [...prev, { sender: 'doctor', text: data.text }]);
      addXp(20);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 6: Premium Weekly PDF-styled Trichology Report
  const handleWeeklyReportQuery = async () => {
    setLoading(true);
    setLogText('Reviewing preceding scores and compiling report panels...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/weekly-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logs: dailyLogs,
          scores: calculateScoresForDate(currentDateStr)
        })
      });
      const data = await res.json();
      setWeeklyReportResponse(data.text);
      addXp(45);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Level 6: Premium Grocery Shopping Assistant list
  const handleShoppingListQuery = async () => {
    setLoading(true);
    setLogText('Generating targeted micronutrient grocery grids...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/gemini/shopping-assistant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lifestyle: onboarding?.lifestyle || 'Vegetarian',
          concerns: onboarding?.selectedConcerns?.join(', ') || 'Hair loss'
        })
      });
      const data = await res.json();
      setShoppingListResponse(data.text);
      addXp(15);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render submenus Neobrutalism grids
  const menuItems = [
    { id: 'moat', label: 'Core Recovery', icon: <Brain className="w-4 h-4 text-pink-500" />, level: 'Moat' },
    { id: 'coach', label: 'Morning Coach', icon: <Sparkles className="w-4 h-4 text-amber-500" />, level: 'Level 1' },
    { id: 'swap', label: 'Meal Swapper', icon: <Soup className="w-4 h-4 text-blue-500" />, level: 'Level 1' },
    { id: 'planner', label: 'Diet Planner', icon: <Calendar className="w-4 h-4 text-[#8A2BE2]" />, level: 'Level 1' },
    { id: 'timeline', label: 'Forecast Timeline', icon: <TrendingUp className="w-4 h-4 text-emerald-500" />, level: 'Level 4' },
    { id: 'scalp', label: 'Scalp Scan', icon: <Camera className="w-4 h-4 text-cyan-500" />, level: 'Level 3' },
    { id: 'shedding', label: 'Hair Fall Tracker', icon: <Activity className="w-4 h-4 text-rose-500" />, level: 'Level 3' },
    { id: 'behavior', label: 'Anomalies Detector', icon: <Sliders className="w-4 h-4 text-amber-600" />, level: 'Level 5' },
    { id: 'doctor', label: 'AI Hair Doctor', icon: <HelpCircle className="w-4 h-4 text-indigo-500" />, level: 'Level 6' },
    { id: 'report', label: 'Weekly Report', icon: <FileText className="w-4 h-4 text-[#FF5722]" />, level: 'Level 6' },
    { id: 'shopping', label: 'Grocery Assis.', icon: <ShoppingCart className="w-4 h-4 text-[#0EA5E9]" />, level: 'Level 6' }
  ];

  return (
    <div id="ai-recovery-copilot-modular" className="space-y-6 text-black dark:text-white">
      
      {/* Visual Header Banner */}
      <div className="bg-[#E0DCFF] text-black border-4 border-[#1E293B] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] relative overflow-hidden">
        <div className="absolute right-4 top-4 opacity-10">
          <Brain className="w-32 h-32" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#5A50A1] bg-white border-2 border-[#1E293B] px-2.5 py-0.5 rounded-full">
              Intelligence Layer
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#FFB703] bg-black border-2 border-black px-2.5 py-0.5 rounded-full select-none animate-pulse">
              Biological AI Mode
            </span>
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">AI Hair Recovery Copilot</h2>
          <p className="text-xs font-semibold text-gray-700 max-w-lg leading-relaxed">
            Integrating nutrition, chemical hair care timelines, restful sleep hygiene, and physical scalp routines inside an ecosystem of raw biological recovery forecasting.
          </p>
        </div>
      </div>

      {/* Grid Sub-Features Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {menuItems.map((item) => {
          const isActive = activeSubView === item.id;
          return (
            <button
              id={`copilot-subbtn-${item.id}`}
              key={item.id}
              onClick={() => {
                setActiveSubView(item.id as any);
                // Trigger auto calls for specific views on click if needed
                if (item.id === 'moat' && !moatResponse) handleMoatQuery();
                if (item.id === 'coach' && !coachResponse) handleCoachQuery();
                if (item.id === 'timeline' && !forecastResponse) handleForecastQuery();
                if (item.id === 'behavior' && !behaviorResponse) handleBehaviorQuery();
                if (item.id === 'report' && !weeklyReportResponse) handleWeeklyReportQuery();
                if (item.id === 'shopping' && !shoppingListResponse) handleShoppingListQuery();
              }}
              className={`p-3 border-3 rounded-2xl cursor-pointer text-left transition-all select-none flex flex-col justify-between h-24 shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C] ${
                isActive 
                  ? 'bg-[#0057FF] text-white border-[#1E293B] scale-[1.03] z-10 font-bold' 
                  : 'bg-white dark:bg-[#1B1B1B] border-[#1E293B] dark:border-[#475569] hover:bg-slate-50 dark:hover:bg-zinc-800'
              }`}
            >
              <div className="flex justify-between items-start w-full">
                <span className={`text-[8px] font-mono font-black py-0.5 px-1.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-zinc-800 text-gray-500'}`}>
                  {item.level}
                </span>
                {item.icon}
              </div>
              <div className="mt-2.5">
                <span className="text-[11px] font-black uppercase leading-tight tracking-tight block">
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Universal Loading Modal */}
      {loading && (
        <div className="bg-amber-100 border-4 border-amber-400 p-4 rounded-2xl flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
          <div className="text-xs font-mono font-black text-amber-800 uppercase tracking-widest leading-none">
            {logText}
          </div>
        </div>
      )}

      {/* Dynamic Render Sub Views containers */}
      <div className="bg-white dark:bg-[#1B1B1B] border-4 border-[#1E293B] dark:border-[#475569] p-5 sm:p-6 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] min-h-[220px]">
        
        {/* VIEW 1: MOAT (Core Biological recovery priority answering) */}
        {activeSubView === 'moat' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-pink-600 dark:text-pink-400 uppercase tracking-wider block">THE ESSENTIAL STRATEGY HUB</span>
                <h3 className="text-lg font-black uppercase mt-1">Biological Recovery Intelligence</h3>
              </div>
              <button 
                onClick={handleMoatQuery}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-[#475569] p-2 rounded-xl text-xs font-black uppercase select-none cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1E293B]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Recompute
              </button>
            </div>

            <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none text-gray-700 dark:text-gray-300">
              {moatResponse ? (
                <div className="rounded-2xl p-4 bg-slate-50/70 dark:bg-black/25 border-2 border-[#1E293B]/10 whitespace-pre-line font-mono text-[11px] font-medium leading-relaxed">
                  {moatResponse}
                </div>
              ) : (
                <div className="text-center py-10 uppercase text-gray-400 font-mono font-bold">Computing response...</div>
              )}
            </div>

            <div className="border-t border-[#1E293B]/10 dark:border-white/10 pt-3 text-[10px] text-gray-500 dark:text-gray-400 font-semibold flex items-center gap-1.5 leading-tight">
              <Brain className="w-4 h-4 text-pink-500 shrink-0" />
              <span>Moat Logic: Tracks macro compliance variables across date arrays to filter the single most immediate move to restart stagnant follicle restoration.</span>
            </div>
          </div>
        )}

        {/* VIEW 2: AI Recovery Coach summaries */}
        {activeSubView === 'coach' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider block">LEVEL 1 — IMMEDIATE AI FEATURES</span>
                <h3 className="text-lg font-black uppercase mt-1">AI Recovery Morning Coach</h3>
              </div>
              <button 
                onClick={handleCoachQuery}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-[#475569] p-2 rounded-xl text-xs font-black uppercase select-none cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1E293B]"
              >
                <RefreshCcw className="w-3.5 h-3.5" /> Reload Coach
              </button>
            </div>

            <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none">
              {coachResponse ? (
                <div className="rounded-2xl p-4 bg-amber-500/5 border-2 border-amber-300 dark:border-amber-900/25 whitespace-pre-line font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  {coachResponse}
                </div>
              ) : (
                <div className="text-center py-10 uppercase text-gray-400 font-mono font-bold animate-pulse">Running diagnostic models...</div>
              )}
            </div>

            <div className="border-t border-[#1E293B]/10 dark:border-white/10 pt-3 text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Gives personalized daily nutritional feedback and bottleneck diagnostics over active metrics (+15 XP).</span>
            </div>
          </div>
        )}

        {/* VIEW 3: AI Meal Swapper */}
        {activeSubView === 'swap' && (
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider block">ANALOGOUS PROTEIN EXCHANGE ENGINE</span>
              <h3 className="text-lg font-black uppercase mt-1">AI Meal Swap Assistant</h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">I don&apos;t have eggs today? Swap for direct bio-equivalent items with active keratin-safe sulfur chains.</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="e.g. I don't have eggs today / No Paneer available..."
                  value={swapQuery}
                  onChange={(e) => setSwapQuery(e.target.value)}
                  className="bg-white dark:bg-[#111111] dark:text-white border-2 border-black rounded-xl text-xs font-mono px-3 py-2 flex-1 outline-none focus:border-[#0057FF]"
                />
                <button
                  type="button"
                  onClick={handleSwapQuery}
                  className="bg-[#0057FF] hover:bg-blue-600 text-white font-black uppercase text-xs px-4 py-2 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_#1E293B] select-none flex items-center justify-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Swap Meal
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono font-black bg-slate-50 dark:bg-black/20 p-2 rounded-xl border border-black/5">
                <span className="text-gray-400 uppercase text-[9px]">Select Phase:</span>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value)}
                  className="bg-white dark:bg-zinc-800 border p-1 rounded font-sans cursor-pointer outline-none"
                >
                  <option value="phase_1">Phase 1: Breakfast Protocol</option>
                  <option value="phase_2">Phase 2: Power Lunch</option>
                  <option value="phase_3">Phase 3: Evening Activation</option>
                  <option value="phase_4">Phase 4: Synthesis Dinner</option>
                </select>
              </div>

              {swapResponse && (
                <div className="rounded-2xl p-4 bg-blue-500/5 border-2 border-blue-400/20 whitespace-pre-line font-mono text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed max-h-[300px] overflow-y-auto">
                  {swapResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: AI Diet Planner */}
        {activeSubView === 'planner' && (
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-black text-purple-700 dark:text-purple-400 uppercase tracking-wider block">MICRO-BUDGET restoraton PLANS</span>
              <h3 className="text-lg font-black uppercase mt-1">AI Nutritional Planner</h3>
              <p className="text-xs text-gray-550 mt-1 font-semibold">Generates budget-coupled custom vegetarian or non-vegetarian diet schedules dynamically.</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap gap-2.5">
                {['₹100/day', '₹150/day', '₹250/day', '₹350/day'].map((budget) => (
                  <button
                    key={budget}
                    onClick={() => setPlannerBudget(budget)}
                    className={`py-1.5 px-3 border-2 border-black text-xs font-mono font-extrabold rounded-xl cursor-pointer ${
                      plannerBudget === budget ? 'bg-[#FF7A00] text-white shadow-[2px_2px_0px_0px_#1E293B]' : 'bg-slate-50 dark:bg-zinc-800'
                    }`}
                  >
                    💰 {budget}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handlePlannerQuery}
                className="w-full bg-[#8A2BE2] hover:bg-purple-700 text-white font-black uppercase text-xs py-2.5 rounded-xl cursor-pointer border-3 border-black shadow-[3px_3px_0px_0px_#1E293B] select-none text-center"
              >
                Assemble 3-Day Hair Plan & Grocery Matrix (+20 XP)
              </button>

              {plannerResponse && (
                <div className="rounded-2xl p-4 bg-purple-500/5 border-2 border-purple-400/25 whitespace-pre-line font-mono text-[11px] text-gray-700 dark:text-gray-350 leading-relaxed max-h-[350px] overflow-y-auto">
                  {plannerResponse}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 5: FORECAST TIMELINE SIMULATOR */}
        {activeSubView === 'timeline' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">ANAGEN Restoraton SIMULATION MODEL</span>
                <h3 className="text-lg font-black uppercase mt-1">AI Recovery Timeline</h3>
              </div>
              <button 
                onClick={handleForecastQuery}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-[#475569] p-2 rounded-xl text-xs font-black uppercase select-none cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1E293B]"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Re-Simulate
              </button>
            </div>

            <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none">
              {forecastResponse ? (
                <div className="rounded-2xl p-4 bg-emerald-500/5 border-2 border-emerald-400/30 whitespace-pre-line font-mono text-[11px] font-bold text-gray-700 dark:text-gray-300">
                  {forecastResponse}
                </div>
              ) : (
                <div className="text-center py-10 uppercase text-gray-400 font-mono font-bold animate-pulse">Running monte-carlo biometric projections...</div>
              )}
            </div>

            <div className="border-t border-[#1E293B]/10 dark:border-white/10 pt-3 text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Builds 30/60/90 days predictive models of follicle density recovery based on current daily habit variables (+25 XP).</span>
            </div>
          </div>
        )}

        {/* VIEW 6: COMPUTER VISION SCALP PHOTO CAN SCAN */}
        {activeSubView === 'scalp' && (
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block">LEVEL 3 — COMPUTER VISION DIAGNOSIS</span>
              <h3 className="text-lg font-black uppercase mt-1">AI Scalp Micro-Photo Scan</h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Upload high-res scalp photos (top, left, crown) to estimate current density thresholds and miniaturization risk curves.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-black/20 p-2 border rounded-xl border-dashed">
                {(['Front', 'Top', 'Left', 'Right'] as const).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => setPhotoPosition(pos)}
                    className={`py-1 px-2.5 font-mono text-[10px] font-black rounded-lg cursor-pointer ${
                      photoPosition === pos ? 'bg-[#0057FF] text-white' : 'bg-white dark:bg-[#1E293B]'
                    }`}
                  >
                    📍 {pos}
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-56 shrink-0 space-y-2">
                  <div className="aspect-square border-3 border-dashed border-gray-300 dark:border-zinc-750 bg-slate-50 dark:bg-[#111] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-3 select-none">
                    {uploadedPhoto ? (
                      <img src={uploadedPhoto} alt="Scalp slice" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-[9px] font-mono font-semibold text-gray-400 uppercase text-center">Tap to load Camera frame</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleScalpPhotoUpload} 
                    />
                  </div>

                  {uploadedPhoto && (
                    <button
                      type="button"
                      onClick={handleScalpScan}
                      disabled={isPhotoScanning}
                      className="w-full bg-[#0057FF] hover:bg-blue-600 text-white font-black text-xs uppercase py-2 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_#1E293B]"
                    >
                      {isPhotoScanning ? 'Scanning...' : 'Execute Vision Scan (+50 XP)'}
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full">
                  {scalpResponse ? (
                    <div className="rounded-2xl p-4 bg-cyan-500/5 border-2 border-cyan-400/20 whitespace-pre-line font-mono text-[11px] text-gray-700 dark:text-gray-300 leading-normal max-h-[300px] overflow-y-auto">
                      {scalpResponse}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 dark:border-[#2E2E2E] rounded-xl p-6 text-center text-xs font-mono font-bold text-gray-400 uppercase select-none">
                      Waiting for photo frame upload to process trichology metrics...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: HAIR SHEDDING TRACKING Progressive analyzer */}
        {activeSubView === 'shedding' && (
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-black text-rose-600 dark:text-rose-450 uppercase tracking-wider block">Daily Shedding Counts</span>
              <h3 className="text-lg font-black uppercase mt-1">Computer Vision Hair-Fall Counter</h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Upload photos of your pillowcase, bathroom drain, or hairbrush to allow computer-vision counts of follicles lost.</p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 bg-slate-50 dark:bg-black/20 p-2 border rounded-xl border-dashed">
                {(['Pillow', 'Comb', 'Drain'] as const).map((src) => (
                  <button
                    key={src}
                    onClick={() => setSheddingSource(src)}
                    className={`py-1 px-2.5 font-mono text-[10px] font-black rounded-lg cursor-pointer ${
                      sheddingSource === src ? 'bg-rose-500 text-white' : 'bg-white dark:bg-[#1E293B]'
                    }`}
                  >
                    🪶 {src} Photo Source
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row gap-4 items-start">
                <div className="w-full md:w-56 shrink-0 space-y-2">
                  <div className="aspect-square border-3 border-dashed border-gray-300 dark:border-zinc-750 bg-slate-50 dark:bg-[#111] rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-3 select-none">
                    {sheddingPhoto ? (
                      <img src={sheddingPhoto} alt="Shedding items" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-[9px] font-mono font-semibold text-gray-400 uppercase text-center">Tap to load Camera frame</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleSheddingPhotoUpload} 
                    />
                  </div>

                  {sheddingPhoto && (
                    <button
                      type="button"
                      onClick={handleSheddingScan}
                      disabled={isPhotoScanning}
                      className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase py-2 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_#1E293B]"
                    >
                      {isPhotoScanning ? 'Estimating...' : 'Analyze Photo (+40 XP)'}
                    </button>
                  )}
                </div>

                <div className="flex-1 w-full">
                  {sheddingResponse ? (
                    <div className="rounded-2xl p-4 bg-rose-500/5 border-2 border-rose-450/20 whitespace-pre-line font-mono text-[11px] text-gray-700 dark:text-gray-300 leading-normal max-h-[300px] overflow-y-auto">
                      {sheddingResponse}
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 dark:border-[#2E2E2E] rounded-xl p-6 text-center text-xs font-mono font-bold text-gray-400 uppercase select-none">
                      Upload photo from Pillow or Comb to test shedding density logs...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 8: BEHAVIORAL DETECTOR */}
        {activeSubView === 'behavior' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider block">ANOMALY DETECTOR ENGINE</span>
                <h3 className="text-lg font-black uppercase mt-1">AI Routine Failure Patterns</h3>
              </div>
              <button 
                onClick={handleBehaviorQuery}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-[#475569] p-2 rounded-xl text-xs font-black uppercase select-none cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1E293B]"
              >
                <Sliders className="w-3.5 h-3.5" /> Re-Detect Anomaly
              </button>
            </div>

            <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none">
              {behaviorResponse ? (
                <div className="rounded-2xl p-4 bg-orange-500/5 border-2 border-orange-400/20 whitespace-pre-line font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                  {behaviorResponse}
                </div>
              ) : (
                <div className="text-center py-10 uppercase text-gray-400 font-mono font-bold animate-pulse">Running sequence pattern auditing...</div>
              )}
            </div>

            <div className="border-t border-[#1E293B]/10 dark:border-white/10 pt-3 text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Analyzes chronological logs to check for hidden nutrition failure sequences (e.g. hydrated drops on specific weekdays) and awards (+30 XP) on recovery habit logs.</span>
            </div>
          </div>
        )}

        {/* VIEW 9: PREMIUM AI HAIR DOCTOR */}
        {activeSubView === 'doctor' && (
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-mono font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">LEVEL 6 - PREMIUM SUBSCRIBERS DIRECT LINE</span>
              <h3 className="text-lg font-black uppercase mt-1">AI Hair Doctor Consultancy</h3>
              <p className="text-xs text-gray-500 mt-1 font-semibold">Ask questions, and allow the AI Doctor to scan diet logs, sleep levels, hydration scales and photos to respond with clinical trichology explanations.</p>
            </div>

            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto p-2 bg-slate-50 dark:bg-zinc-800/40 rounded-2xl border">
              {doctorChat.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-2xl max-w-[85%] text-xs font-mono leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user' 
                      ? 'bg-[#0057FF] text-white self-end rounded-br-none' 
                      : 'bg-white dark:bg-[#1E1E1E] text-black dark:text-white border border-[#1E293B]/15 self-start rounded-bl-none'
                  }`}
                >
                  <span className="text-[8px] uppercase font-black tracking-widest block opacity-60 mb-0.5">
                    {msg.sender === 'user' ? 'YOU' : 'AI HAIR DOCTOR'}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Why is my hair still shedding on week 2?"
                value={doctorQuestion}
                onChange={(e) => setDoctorQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDoctorSubmit()}
                className="bg-white dark:bg-[#111111] dark:text-white border-2 border-black rounded-xl text-xs font-mono px-3 py-2 flex-1 outline-none focus:border-[#0057FF]"
              />
              <button
                type="button"
                onClick={handleDoctorSubmit}
                className="bg-[#0057FF] hover:bg-blue-600 text-white font-black uppercase text-xs px-4 py-2 rounded-xl cursor-pointer border-2 border-black shadow-[2px_2px_0px_0px_#1E293B]"
              >
                Consult
              </button>
            </div>
          </div>
        )}

        {/* VIEW 10: AI WEEKLY SUMMARY REPORT */}
        {activeSubView === 'report' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-[#FF5722] uppercase tracking-wider block">WEEKLY TRICHOLOGIST ANALYSIS</span>
                <h3 className="text-lg font-black uppercase mt-1">AI Weekly Progress Report</h3>
              </div>
              <button 
                onClick={handleWeeklyReportQuery}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-[#475569] p-2 rounded-xl text-xs font-black uppercase select-none cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1E293B]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Re-Analyze Report
              </button>
            </div>

            <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none">
              {weeklyReportResponse ? (
                <div className="rounded-2xl p-5 bg-white dark:bg-zinc-900 border-4 border-[#FF5722] text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.15)] whitespace-pre-line font-mono text-[11px] font-semibold leading-relaxed max-h-[350px] overflow-y-auto">
                  {weeklyReportResponse}
                </div>
              ) : (
                <div className="text-center py-10 uppercase text-gray-400 font-mono font-bold animate-pulse">Assembling weekly report data sheets...</div>
              )}
            </div>

            <div className="border-t border-[#1E293B]/10 dark:border-white/10 pt-3 text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#FF5722] shrink-0" />
              <span>Full weekly PDF-structured trichological overview compiling nutrient indices, photo comparisons, and recommended pivots (+45 XP).</span>
            </div>
          </div>
        )}

        {/* VIEW 11: SHOPPING GROCERY ASSISTANT */}
        {activeSubView === 'shopping' && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-mono font-black text-[#0EA5E9] uppercase tracking-wider block">GROCERY MATRIX SOURCING</span>
                <h3 className="text-lg font-black uppercase mt-1">AI Grocery Shopping List</h3>
              </div>
              <button 
                onClick={handleShoppingListQuery}
                className="bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-black dark:text-white border-2 border-black dark:border-[#475569] p-2 rounded-xl text-xs font-black uppercase select-none cursor-pointer flex items-center gap-1 shadow-[2px_2px_0px_0px_#1E293B]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload List
              </button>
            </div>

            <div className="prose dark:prose-invert text-xs leading-relaxed max-w-none">
              {shoppingListResponse ? (
                <div className="rounded-2xl p-4 bg-sky-500/5 border-2 border-sky-400/25 whitespace-pre-line font-mono text-[11px] font-medium text-gray-700 dark:text-gray-300 leading-relaxed max-h-[350px] overflow-y-auto">
                  {shoppingListResponse}
                </div>
              ) : (
                <div className="text-center py-10 uppercase text-gray-400 font-mono font-bold animate-pulse">Sorting items by sulfur/iron hair-building properties...</div>
              )}
            </div>

            <div className="border-t border-[#1E293B]/10 dark:border-white/10 pt-3 text-[10px] text-gray-500 font-semibold flex items-center gap-1.5">
              <ShoppingCart className="w-4 h-4 text-[#0EA5E9] shrink-0" />
              <span>Returns structured lists divided cleanly by Proteins, Iron sources, and Seed complexes targeting active concern profiles (+15 XP).</span>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
