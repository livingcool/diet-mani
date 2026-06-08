/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gender, HairConcern, Lifestyle, StressLevel, ExerciseFrequency, OnboardingData 
} from '../types';
import { ArrowRight, ArrowLeft, Ruler, Activity, Check, Smile, Droplets, Flame } from 'lucide-react';

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  
  // States
  const [age, setAge] = useState<number>(26);
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [height, setHeight] = useState<number>(175);
  const [weight, setWeight] = useState<number>(70);
  const [selectedConcerns, setSelectedConcerns] = useState<HairConcern[]>([]);
  const [lifestyle, setLifestyle] = useState<Lifestyle>(Lifestyle.NON_VEGETARIAN);
  const [waterIntakeTarget, setWaterIntakeTarget] = useState<number>(3000);
  const [sleepTarget, setSleepTarget] = useState<number>(8);
  const [stressLevel, setStressLevel] = useState<StressLevel>(StressLevel.MEDIUM);
  const [exerciseFrequency, setExerciseFrequency] = useState<ExerciseFrequency>(ExerciseFrequency.THREE_TIMES_A_WEEK);

  const toggleConcern = (concern: HairConcern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(selectedConcerns.filter(c => c !== concern));
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Complete!
      const data: OnboardingData = {
        age,
        gender,
        height,
        weight,
        selectedConcerns,
        lifestyle,
        waterIntakeTarget,
        sleepTarget,
        stressLevel,
        exerciseFrequency
      };
      onComplete(data);
    }
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  // Recommended calculators
  const recommendedWater = Math.round((weight * 35) + (exerciseFrequency !== ExerciseFrequency.RARELY ? 500 : 0));
  const recommendedSleep = stressLevel === StressLevel.HIGH ? 8.5 : 8.0;

  const concernOptions = Object.values(HairConcern);

  return (
    <div id="onboarding-root" className="min-h-screen bg-[#FFFDF7] flex flex-col justify-between p-6 overflow-x-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />

      {/* Top Profile Header */}
      <div className="flex justify-between items-center z-10 max-w-lg mx-auto w-full mb-6 text-[#16213E]">
        <h2 className="text-2xl font-black tracking-tight uppercase">
          Follicle Profile Setup
        </h2>
        <span className="font-mono font-extrabold text-sm border-2 border-[#1E293B] bg-[#FFB703] text-[#16213E] px-3 py-1 rounded-xl shadow-[2px_2px_0px_0px_#1E293B]">
          Step {step}/3
        </span>
      </div>

      {/* Interactive Form Stack */}
      <div className="flex-1 max-w-lg mx-auto w-full flex flex-col justify-center z-10 My-4 text-[#16213E]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-[#FFF1EE] border-4 border-[#1E293B] p-5 rounded-[24px] shadow-[4px_4px_0px_0px_#1E293B]">
                <span className="flex items-center gap-2 font-black uppercase text-sm mb-1 tracking-wider text-[#FF8A65]">
                  <Flame className="w-5 h-5" /> 01. BIOMETRIC CORE
                </span>
                <p className="text-xs text-slate-700 font-semibold">Your baseline stats calibrate recovery rates and keratin production targets.</p>
              </div>

              {/* Age */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-wide">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Math.max(1, parseInt(e.target.value) || 0))}
                  className="bg-white border-4 border-[#1E293B] px-5 py-3 rounded-[24px] text-lg font-bold text-[#16213E] focus:outline-none shadow-[4px_4px_0px_0px_#1E293B]"
                />
              </div>

              {/* Gender */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black uppercase tracking-wide">Biological Gender</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(Gender).map((g) => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`py-3.5 px-2 font-black text-sm uppercase rounded-[24px] border-4 border-[#1E293B] text-center cursor-pointer shadow-[3px_3px_0px_0px_#1E293B] active:translate-y-1 transition-all ${
                        gender === g ? 'bg-[#0057FF] text-white border-[#1E293B]' : 'bg-white text-[#16213E] border-[#1E293B]'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black uppercase tracking-wide py-1 flex items-center gap-1">
                    <Ruler className="w-4 h-4" /> Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-white border-4 border-[#1E293B] px-5 py-3 rounded-[24px] text-lg font-bold text-[#16213E] focus:outline-none shadow-[4px_4px_0px_0px_#1E293B]"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-black uppercase tracking-wide py-1 flex items-center gap-1">
                    <Activity className="w-4 h-4" /> Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-white border-4 border-[#1E293B] px-5 py-3 rounded-[24px] text-lg font-bold text-[#16213E] focus:outline-none shadow-[4px_4px_0px_0px_#1E293B]"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-[#E0DCFF] border-4 border-[#1E293B] p-5 rounded-[24px] shadow-[4px_4px_0px_0px_#1E293B]">
                <span className="font-black uppercase text-sm mb-1 tracking-wider text-[#8B5CF6] block">
                  02. FOLLICLE CONCERNS
                </span>
                <p className="text-xs text-slate-700 font-semibold">Select the symptoms you wish to intercept. These calibrate your macro/micronutrient targeting weights.</p>
              </div>

              {/* Concerns Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                {concernOptions.map((c) => {
                  const selected = selectedConcerns.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleConcern(c)}
                      className={`p-4 border-4 border-[#1E293B] rounded-[24px] text-left cursor-pointer transition-all flex flex-col justify-between h-28 relative ${
                        selected 
                          ? 'bg-[#FFB703] text-[#16213E] shadow-[3px_3px_0px_0px_#1E293B]' 
                          : 'bg-white text-[#16213E] shadow-[4px_4px_0px_0px_#1E293B]'
                      }`}
                    >
                      <div className="w-6 h-6 rounded-full border-2 border-[#1E293B] bg-white flex items-center justify-center self-end">
                        {selected && <Check className="w-3.5 h-3.5 text-[#16213E] stroke-[3]" />}
                      </div>
                      <span className="font-extrabold text-sm tracking-tight uppercase leading-none mt-2">
                        {c}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Warning/Helper advice if empty */}
              {selectedConcerns.length === 0 && (
                <div className="border-4 border-dashed border-gray-300 p-4 rounded-[24px] text-center font-bold text-xs text-gray-500 uppercase tracking-wide bg-gray-50">
                  Select at least one option to customize calculations
                </div>
              )}
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="bg-[#E0FBF9] border-4 border-[#1E293B] p-5 rounded-[24px] shadow-[4px_4px_0px_0px_#1E293B]">
                <span className="font-black uppercase text-sm mb-1 tracking-wider text-[#00C2B8] block">
                  03. LIFESTYLE SHIELD
                </span>
                <p className="text-xs text-slate-700 font-semibold">Your metabolics benefit from customized hydration, exercise routines, and stress shielding limits.</p>
              </div>

              {/* Diet Profile */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Dietary Boundary</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(Lifestyle).map((l) => (
                    <button
                      key={l}
                      onClick={() => setLifestyle(l)}
                      className={`py-3 px-1 font-bold text-xs uppercase rounded-[20px] border-4 border-[#1E293B] text-center cursor-pointer shadow-[2px_2px_0px_0px_#1E293B] active:translate-y-1 transition-all ${
                        lifestyle === l ? 'bg-[#00C2B8] text-white border-[#1E293B] font-black' : 'bg-white text-[#16213E]'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Level */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-500">Chronic Stress Load</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(StressLevel).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStressLevel(s)}
                      className={`py-3 px-1 font-bold text-xs uppercase rounded-[20px] border-4 border-[#1E293B] text-center cursor-pointer shadow-[2px_2px_0px_0px_#1E293B] active:translate-y-1 transition-all ${
                        stressLevel === s ? 'bg-[#FF8A65] text-white border-[#1E293B] font-black' : 'bg-white text-[#16213E]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders for Targets */}
              <div className="bg-white border-4 border-[#1E293B] p-4 rounded-[24px] space-y-4 shadow-[4px_4px_0px_0px_#1E293B]">
                {/* Hydration Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Droplets className="w-4 h-4 text-blue-500" /> Daily Hydration Goal
                    </span>
                    <span className="font-mono font-bold text-sm bg-[#CCEFFF] border-2 border-[#1E293B] px-2 py-0.5 rounded-lg text-black">
                      {waterIntakeTarget} ml
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1500"
                    max="5000"
                    step="250"
                    value={waterIntakeTarget}
                    onChange={(e) => setWaterIntakeTarget(parseInt(e.target.value))}
                    className="w-full accent-[#00C2B8] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 font-bold uppercase">
                    <span>1.5L</span>
                    <span className="text-[#00C2B8] font-black">Rec: {recommendedWater}ml</span>
                    <span>5.0L</span>
                  </div>
                </div>

                {/* Sleep Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      <Smile className="w-4 h-4 text-amber-500" /> Target Sleep Duration
                    </span>
                    <span className="font-mono font-bold text-sm bg-[#FFF9E6] border-2 border-[#1E293B] px-2 py-0.5 rounded-lg text-black">
                      {sleepTarget} Hrs
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="10"
                    step="0.5"
                    value={sleepTarget}
                    onChange={(e) => setSleepTarget(parseFloat(e.target.value))}
                    className="w-full accent-[#FFB703] h-2 bg-gray-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-500 font-bold uppercase">
                    <span>5 HR</span>
                    <span className="text-[#FFB703] font-black">Rec: {recommendedSleep}hr</span>
                    <span>10 HR</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button Tray */}
      <div className="w-full max-w-lg mx-auto flex gap-4 mt-6 z-10">
        {step > 1 && (
          <button
            onClick={handlePrev}
            className="flex items-center justify-center gap-2 bg-white border-4 border-[#1E293B] px-5 py-4 rounded-[24px] font-black uppercase text-sm text-[#16213E] cursor-pointer shadow-[3px_3px_0px_0px_#1E293B]"
          >
            <ArrowLeft className="w-5 h-5 shrink-0" /> Back
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-3 bg-[#0057FF] text-white border-4 border-[#1E293B] px-6 py-4 rounded-[24px] font-black text-lg uppercase cursor-pointer hover:bg-blue-600 shadow-[4px_4px_0px_0px_#1E293B]"
        >
          {step === 3 ? 'Generate Personalized Targets' : 'Continue'}{' '}
          <ArrowRight className="w-5 h-5 shrink-0" />
        </button>
      </div>
    </div>
  );
};
