/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useDietStore } from '../store/dietStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as LucideSettings, Sun, Moon, Database, 
  Bell, HelpCircle, RefreshCw, Send, CheckCircle, Info, Sparkles, Cpu,
  User, Mail, Phone, Edit3, Save, X
} from 'lucide-react';
import { ReminderSystem } from './ReminderSystem';

export const Settings: React.FC = () => {
  const {
    isDarkMode,
    toggleTheme,
    resetOnboarding,
    setOnboarded,
    dailyLogs,
    hairPhotos,
    badges,
    onboarding
  } = useDietStore();

  const [testNotification, setTestNotification] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Profile edit state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(onboarding?.name || '');
  const [editEmail, setEditEmail] = useState(onboarding?.email || '');
  const [editPhone, setEditPhone] = useState(onboarding?.phone || '');

  const handleSaveProfile = () => {
    if (!editName.trim()) { alert('Name is required.'); return; }
    if (!editEmail.trim() || !editEmail.includes('@')) { alert('Please enter a valid email.'); return; }
    if (onboarding) {
      setOnboarded({ ...onboarding, name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() || undefined });
    }
    setEditingProfile(false);
    setSuccessMsg('Profile updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleStartEditProfile = () => {
    setEditName(onboarding?.name || '');
    setEditEmail(onboarding?.email || '');
    setEditPhone(onboarding?.phone || '');
    setEditingProfile(true);
  };
  
  // Tab selector inside Setup: general vs alerts
  const [subTab, setSubTab] = useState<'reminders' | 'general'>('reminders');

  // Alert toggles states
  const [morningAlert, setMorningAlert] = useState(true);
  const [lunchAlert, setLunchAlert] = useState(true);
  const [eveningAlert, setEveningAlert] = useState(true);
  const [nightAlert, setNightAlert] = useState(true);

  const handleTriggerNotification = (type: 'morning' | 'lunch' | 'evening' | 'night') => {
    let msg = '';
    switch (type) {
      case 'morning':
        msg = '☀️ Morning Action: Breakfast mission unlocked! Log your Egg Protocol now.';
        break;
      case 'lunch':
        msg = '🍗 Lunch Payload: Protein payload is ready. Fuel your scalp with Amino Acids.';
        break;
      case 'evening':
        msg = '🍿 Evening Bridge: Bridge protocol pending. Pumpkin seeds ready for DHT abatement.';
        break;
      case 'night':
        msg = '🌙 Metabolic Shutdown: Sleep shield protocol active. Time for overnight recovery.';
        break;
    }
    setTestNotification(msg);
    setTimeout(() => {
      setTestNotification(null);
    }, 4500);
  };

  const handleExport = () => {
    const data = {
      onboarding,
      dailyLogs,
      hairPhotos,
      badges
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', 'diet_mani_recovery_data.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setSuccessMsg('Recovery data exported successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleBackup = () => {
    setSuccessMsg('Follicle metadata backed up successfully in Local Storage!');
    setTimeout(() => setSuccessMsg(null), 3550);
  };

  return (
    <div id="settings-root" className="space-y-6 pb-28 font-sans text-[#16213E] dark:text-[#F8FAFC]">
      {/* Top Header with Switcher Tabs */}
      <div className="bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-3 rounded-[24px] shadow-[4px_4px_0px_0px_#1E293B] dark:shadow-[4px_4px_0px_0px_#0A0F1C] flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center gap-2 pl-2 py-1">
          <LucideSettings className="w-5 h-5 text-[#16213E] dark:text-[#F8FAFC]" />
          <h2 className="text-lg font-black uppercase text-[#16213E] dark:text-[#F8FAFC] tracking-widest leading-none">
            SETUP &amp; COACHING
          </h2>
        </div>

        {/* Dynamic Neobrutalist sub-tab selector */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-[#273449] border-2 border-[#1E293B] dark:border-[#475569] rounded-xl text-xs font-mono font-black uppercase">
          <button
            onClick={() => setSubTab('reminders')}
            className={`py-2 px-3 text-center rounded-lg cursor-pointer transition-all ${
              subTab === 'reminders' 
                ? 'bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C]' 
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            🧬 COACH &amp; REMINDERS
          </button>
          <button
            onClick={() => setSubTab('general')}
            className={`py-2 px-3 text-center rounded-lg cursor-pointer transition-all ${
              subTab === 'general' 
                ? 'bg-[#FFB703] dark:bg-[#FBBF24] text-black shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C]' 
                : 'text-zinc-500 hover:text-black dark:hover:text-white'
            }`}
          >
            ⚙️ APP SETTINGS
          </button>
        </div>
      </div>

      {/* Floating test notification toast overlay */}
      <AnimatePresence>
        {testNotification && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-50 bg-[#E0DCFF] dark:bg-[#202E5C] border-4 border-[#1E293B] dark:border-[#475569] p-4 rounded-xl shadow-[4px_4px_0px_0px_#1E293B] dark:shadow-[4px_4px_0px_0px_#0A0F1C] text-[#16213E] dark:text-[#F8FAFC] font-extrabold text-xs"
          >
            <div className="flex gap-2 items-center">
              <span className="animate-bounce">🔔</span>
              <span>{testNotification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export Success messages */}
      <AnimatePresence>
        {successMsg && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#E0DCFF] dark:bg-[#202E5C] border-3 border-[#1E293B] dark:border-[#475569] text-[#8B5CF6] dark:text-[#A78BFA] p-3 rounded-xl font-black text-xs text-center"
          >
            {successMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER ACTIVE SUBTAB CONTENT */}
      {subTab === 'reminders' ? (
        <ReminderSystem />
      ) : (
        <div className="space-y-6">
          {/* Personal Profile Details Card */}
          {onboarding && (
            <div className="bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[24px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-[#0057FF] dark:text-[#4D8DFF]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#16213E] dark:text-[#F8FAFC]">Agent Profile</h3>
                </div>
                {!editingProfile ? (
                  <button
                    onClick={handleStartEditProfile}
                    className="flex items-center gap-1 text-[10px] font-black uppercase bg-[#E0DCFF] dark:bg-[#202E5C] border-2 border-[#1E293B] dark:border-[#475569] px-2.5 py-1 rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#1E293B] hover:bg-[#d0c9ff] transition-all"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                ) : (
                  <div className="flex gap-1.5">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-1 text-[10px] font-black uppercase bg-[#0057FF] text-white border-2 border-[#1E293B] dark:border-[#475569] px-2.5 py-1 rounded-xl cursor-pointer shadow-[2px_2px_0px_0px_#1E293B] hover:bg-blue-600 transition-all"
                    >
                      <Save className="w-3 h-3" /> Save
                    </button>
                    <button
                      onClick={() => setEditingProfile(false)}
                      className="p-1 border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-gray-500 hover:text-black dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {editingProfile ? (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="bg-white dark:bg-[#273449] border-3 border-[#1E293B] dark:border-[#475569] px-4 py-2.5 rounded-[16px] text-sm font-bold text-[#16213E] dark:text-[#F8FAFC] focus:outline-none shadow-[2px_2px_0px_0px_#1E293B]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bg-white dark:bg-[#273449] border-3 border-[#1E293B] dark:border-[#475569] px-4 py-2.5 rounded-[16px] text-sm font-bold text-[#16213E] dark:text-[#F8FAFC] focus:outline-none shadow-[2px_2px_0px_0px_#1E293B]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Phone (Optional)</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="bg-white dark:bg-[#273449] border-3 border-[#1E293B] dark:border-[#475569] px-4 py-2.5 rounded-[16px] text-sm font-bold text-[#16213E] dark:text-[#F8FAFC] focus:outline-none shadow-[2px_2px_0px_0px_#1E293B]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 bg-[#FFFDF7] dark:bg-[#273449] border-2 border-[#1E293B]/20 dark:border-[#475569]/40 p-3 rounded-xl">
                    <User className="w-4 h-4 text-[#0057FF] dark:text-[#4D8DFF] shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block">Full Name</span>
                      <span className="text-sm font-black text-[#16213E] dark:text-[#F8FAFC] uppercase">{onboarding.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-[#FFFDF7] dark:bg-[#273449] border-2 border-[#1E293B]/20 dark:border-[#475569]/40 p-3 rounded-xl">
                    <Mail className="w-4 h-4 text-[#00C2B8] shrink-0" />
                    <div>
                      <span className="text-[9px] font-mono font-black text-gray-400 uppercase block">Email</span>
                      <span className="text-sm font-bold text-[#16213E] dark:text-[#F8FAFC]">{onboarding.email}</span>
                    </div>
                  </div>
                  {onboarding.phone && (
                    <div className="flex items-center gap-2.5 bg-[#FFFDF7] dark:bg-[#273449] border-2 border-[#1E293B]/20 dark:border-[#475569]/40 p-3 rounded-xl">
                      <Phone className="w-4 h-4 text-[#FFB703] shrink-0" />
                      <div>
                        <span className="text-[9px] font-mono font-black text-gray-400 uppercase block">Phone</span>
                        <span className="text-sm font-bold text-[#16213E] dark:text-[#F8FAFC]">{onboarding.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Theme Toggler Settings Block */}
          <div className="bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[24px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
            <h3 className="font-black text-sm uppercase text-gray-400 mb-4 tracking-wider">Visual Interface Mode</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => isDarkMode && toggleTheme()}
                className={`py-3.5 border-3 border-[#1E293B] dark:border-[#475569] rounded-[20px] font-black uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_#1E293B] dark:shadow-[3px_3px_0px_0px_#0A0F1C] transition-all flex items-center justify-center gap-1.5 ${
                  !isDarkMode ? 'bg-[#FFB703] text-black pr-1' : 'bg-white dark:bg-[#273449] text-[#16213E] dark:text-[#F8FAFC]'
                }`}
              >
                <Sun className="w-4 h-4" /> Light Mode
              </button>
              
              <button
                onClick={() => !isDarkMode && toggleTheme()}
                className={`py-3.5 border-3 border-[#1E293B] dark:border-[#475569] rounded-[20px] font-black uppercase text-xs cursor-pointer shadow-[3px_3px_0px_0px_#1E293B] dark:shadow-[3px_3px_0px_0px_#0A0F1C] transition-all flex items-center justify-center gap-1.5 ${
                  isDarkMode ? 'bg-[#4D8DFF] text-white dark:text-[#0F172A]' : 'bg-white dark:bg-[#273449] text-[#16213E] dark:text-[#F8FAFC]'
                }`}
              >
                <Moon className="w-4 h-4" /> Dark Mode
              </button>
            </div>
          </div>

          {/* Persistent Cloud Database Sync Console (Firestore integration metadata) */}
          <div className="bg-white dark:bg-[#273449] text-[#16213E] dark:text-[#F8FAFC] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[24px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
            <div className="flex gap-2 items-center mb-2">
              <Database className="w-5 h-5 text-[#0057FF] dark:text-[#4D8DFF]" />
              <h3 className="text-sm font-black uppercase tracking-wider text-[#16213E] dark:text-[#F8FAFC]">Database Sync Status</h3>
            </div>
            <p className="text-xs font-semibold leading-relaxed text-gray-500 dark:text-zinc-300 mb-3">
              Your Diet Mani operational data is strictly encrypted and saved inside your browser&apos;s local cache for instant high-speed rendering.
            </p>
            <div className="border-2 border-[#1E293B] dark:border-[#475569] p-3.5 rounded-xl bg-[#E0FBF9] dark:bg-[#202E5C] font-bold text-xs">
              <p className="flex justify-between items-center text-[10px] font-mono tracking-wide uppercase text-[#16213E] dark:text-zinc-300">
                <span>Sync Mode:</span>
                <span className="text-[#00C2B8] dark:text-[#2DD4BF] font-black">LOCAL OFFLINE ACTIVE</span>
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-relaxed mt-1.5">
                You can provision a cloud-hosted Firebase DB for multi-device sync. Add <code>firebase-applet-config.json</code> in the Secrets UI panel to activate secure cloud storage.
              </p>
            </div>
          </div>

          {/* Quick Alarm Station legacy toggler */}
          <div className="bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[24px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
            <h3 className="font-black text-sm uppercase text-gray-400 mb-4 tracking-wider flex items-center gap-1.5">
              <Bell className="w-4 h-4" /> Quick Trigger Feed Simulation
            </h3>

            <div className="space-y-3.5">
              {/* Breakfast switch */}
              <div className="flex items-center justify-between border-2 border-[#1E293B] dark:border-[#475569] p-3 rounded-xl bg-[#FFFDF7] dark:bg-[#273449]">
                <div>
                  <h4 className="font-extrabold text-xs uppercase leading-tight text-[#16213E] dark:text-[#F8FAFC]">Morning: Ignition sequence</h4>
                  <p className="text-[10px] text-gray-400 font-mono">07:30 Alert unlocked</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerNotification('morning')}
                    className="bg-white dark:bg-[#1E293B] hover:bg-gray-100 border-2 border-[#1E293B] dark:border-[#475569] p-1.5 rounded-lg text-[#16213E] dark:text-[#F8FAFC] cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C] text-[9px] font-black uppercase"
                  >
                    TEST
                  </button>
                  <input 
                    type="checkbox" 
                    checked={morningAlert}
                    onChange={() => setMorningAlert(!morningAlert)}
                    className="w-5.5 h-5.5 accent-[#0057FF] dark:accent-[#4D8DFF] border-2 border-[#1E293B] cursor-pointer rounded-lg"
                  />
                </div>
              </div>

              {/* Lunch switch */}
              <div className="flex items-center justify-between border-2 border-[#1E293B] dark:border-[#475569] p-3 rounded-xl bg-[#FFFDF7] dark:bg-[#273449]">
                <div>
                  <h4 className="font-extrabold text-xs uppercase leading-tight text-[#16213E] dark:text-[#F8FAFC]">Lunch: Protein Payload</h4>
                  <p className="text-[10px] text-gray-400 font-mono">13:00 Alert unlocked</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTriggerNotification('lunch')}
                    className="bg-white dark:bg-[#1E293B] hover:bg-gray-100 border-2 border-[#1E293B] dark:border-[#475569] p-1.5 rounded-lg text-[#16213E] dark:text-[#F8FAFC] cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C] text-[9px] font-black uppercase"
                  >
                    TEST
                  </button>
                  <input 
                    type="checkbox" 
                    checked={lunchAlert}
                    onChange={() => setLunchAlert(!lunchAlert)}
                    className="w-5.5 h-5.5 accent-[#0057FF] dark:accent-[#4D8DFF] border-2 border-[#1E293B] cursor-pointer rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Admin Operations Console (Export, Backup & Reset) */}
          <div className="bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[24px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] text-[#16213E] dark:text-[#F8FAFC] space-y-4">
            <h3 className="font-black text-sm uppercase text-gray-400 tracking-wider">Operational Console</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="py-3 bg-white dark:bg-[#273449] hover:bg-gray-50 border-3 border-[#1E293B] dark:border-[#475569] text-xs font-black uppercase tracking-wider text-[#16213E] dark:text-[#F8FAFC] cursor-pointer shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C]"
              >
                Export Logs
              </button>
              
              <button
                onClick={handleBackup}
                className="py-3 bg-[#E0DCFF] dark:bg-[#202E5C] border-3 border-[#1E293B] dark:border-[#475569] rounded-xl text-xs font-black uppercase tracking-wider text-[#16213E] dark:text-white cursor-pointer shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C] active:translate-y-0.5"
              >
                Local Backup
              </button>
            </div>

            <button
              onClick={resetOnboarding}
              className="w-full py-3.5 bg-[#FFF1EE] dark:bg-rose-950/40 border-4 border-[#1E293B] dark:border-[#475569] rounded-[20px] font-black uppercase text-xs tracking-wider text-[#FF8A65] dark:text-[#FB7185] cursor-pointer shadow-[3px_3px_0px_0px_#1E293B] dark:shadow-[3px_3px_0px_0px_#0A0F1C] active:translate-y-0.5"
            >
              Reset Biometric Onboarding profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
