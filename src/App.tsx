/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DietProvider, useDietStore } from './store/dietStore';
import { SplashScreen } from './components/SplashScreen';
import { Onboarding } from './components/Onboarding';
import { RootedLogo } from './components/RootedLogo';
import { BottomNavigation } from './components/BottomNavigation';
import { Dashboard } from './components/Dashboard';
import { DietEngine } from './components/DietEngine';
import { CalendarView } from './components/CalendarView';
import { AICopilot } from './components/AICopilot';
import { HairRecovery } from './components/HairRecovery';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import { ChevronLeft, ChevronRight, Calendar, Sparkles, Bell, X, Trash2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NotificationItem {
  id: string;
  channel: string;
  title: string;
  body: string;
  timestamp: string;
  read?: boolean;
}

function AppContent() {
  const {
    isOnboarded,
    setOnboarded,
    currentDateStr,
    setCurrentDate,
    activeTab,
    setTab,
    isDarkMode,
    streakCount,
    calculateScoresForDate
  } = useDietStore();

  const [hasStartedSplash, setHasStartedSplash] = useState<boolean>(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Sync index dark mode changes dynamically with HTML body node
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Synchronize system alerts from cache
  useEffect(() => {
    const handleLoadNotifications = () => {
      const cached = localStorage.getItem('dietmani_notif_history');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        // Safe default items
        const defaultAlerts: NotificationItem[] = [
          {
            id: 'n_seed_1',
            channel: 'in-app',
            title: '🧬 Recovery Window Open',
            body: 'Your cell matrix values are high. Complete lunch to lock in 44mg amino payload.',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            read: false
          },
          {
            id: 'n_seed_2',
            channel: 'push',
            title: '🚀 Payload Ready',
            body: '🍳 Ignition Sequence initialized. Protein payload 30g required now.',
            timestamp: new Date(Date.now() - 12000000).toISOString(),
            read: false
          },
          {
            id: 'n_seed_3',
            channel: 'email',
            title: 'YOUR DIET MANI RECOVERY BRIEFING',
            body: 'Your weekly performance showed +12% increase in follicle energy levels.',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            read: true
          }
        ];
        setNotifications(defaultAlerts);
        localStorage.setItem('dietmani_notif_history', JSON.stringify(defaultAlerts));
      }
    };

    handleLoadNotifications();
    window.addEventListener('storage', handleLoadNotifications);
    return () => window.removeEventListener('storage', handleLoadNotifications);
  }, [showNotifDropdown]);

  const markAllNotifAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('dietmani_notif_history', JSON.stringify(updated));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.setItem('dietmani_notif_history', JSON.stringify([]));
  };

  const toggleNotifReadState = (id: string) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return { ...n, read: !n.read };
      }
      return n;
    });
    setNotifications(updated);
    localStorage.setItem('dietmani_notif_history', JSON.stringify(updated));
  };

  const deleteNotificationItem = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem('dietmani_notif_history', JSON.stringify(updated));
  };

  // Handle previous day / next day navigation chevrons
  const handleShiftDate = (days: number) => {
    const d = new Date(currentDateStr);
    d.setDate(d.getDate() + days);
    const offsetStr = d.toISOString().split('T')[0];
    setCurrentDate(offsetStr);
  };

  const getFormattedHeaderDate = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentDateStr === todayStr) {
      return 'Today';
    }
    const d = new Date(currentDateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  };

  // Live score compliance calculations for quick status and header indicators
  const scores = calculateScoresForDate(currentDateStr);

  const getProtocolDay = () => {
    try {
      const baseDate = new Date('2026-04-28');
      const current = new Date(currentDateStr);
      const diff = current.getTime() - baseDate.getTime();
      const calculatedDays = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(1, calculatedDays);
    } catch {
      return 41;
    }
  };
  const protocolDay = getProtocolDay();

  const getFormattedHeaderDateCompact = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    if (currentDateStr === todayStr) {
      return 'TODAY';
    }
    const d = new Date(currentDateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toUpperCase();
  };

  const getStatusChip = () => {
    if (scores.hydrationCompliance < 70) {
      return { label: 'HYDRATION FOCUS', color: 'bg-sky-500/10 dark:bg-sky-950/40 text-[#0EA5E9] dark:text-[#38BDF8] border-[#0EA5E9]/20' };
    }
    if (scores.ironCompliance < 70) {
      return { label: 'IRON BOOST DAY', color: 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    }
    return { label: 'RECOVERY MODE', color: 'bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-600 dark:text-[#32D74B] border-emerald-600/20' };
  };
  const statusInfo = getStatusChip();
  const unreadCount = notifications.filter(n => !n.read).length;

  // 1. Splash check
  if (!hasStartedSplash) {
    return <SplashScreen onBegin={() => setHasStartedSplash(true)} />;
  }

  // 2. Onboarding check
  if (!isOnboarded) {
    return <Onboarding onComplete={(data) => setOnboarded(data)} />;
  }

  // 3. Render Main Integrated Shell View
  return (
    <div className="min-h-screen bg-[#FFFDF7] dark:bg-[#0F172A] font-sans transition-colors duration-200">
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(#475569_1px,transparent_1px)] opacity-10 pointer-events-none" />

      {/* Primary Mobile Header Bar - Re-crafted Compact Mission Control */}
      <header className="sticky top-0 bg-[#FFFDF7] dark:bg-[#0F172A] border-b-4 border-[#1E293B] dark:border-[#475569] py-1.5 px-3 z-30 shadow-[0_3px_0_0_#1E293B] dark:shadow-[0_3px_0_0_#0A0F1C] transition-all">
        <div className="max-w-2xl mx-auto flex justify-between items-center h-8">
          {/* LEFT: Branding */}
          <div className="flex items-center gap-1 cursor-pointer select-none" onClick={() => setTab('dashboard')}>
            <RootedLogo size={22} showWordmark={false} />
          </div>

          {/* CENTER: Status Chips Hub */}
          <div className="flex items-center gap-1 sm:gap-1.5 select-none scale-95 sm:scale-100">
            {/* Day Tag */}
            <span className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-950/45 text-[#0057FF] dark:text-[#4D8DFF] rounded-md font-mono font-black text-[9px] uppercase tracking-tight border border-blue-200 dark:border-blue-900/50">
              DAY {protocolDay}
            </span>
            {/* Streak */}
            <span className="px-1.5 py-0.5 bg-orange-100 dark:bg-orange-950/45 text-orange-600 dark:text-orange-400 rounded-md font-mono font-black text-[9px] flex items-center gap-0.5 border border-orange-205 dark:border-orange-900/40">
              🔥 {streakCount}
            </span>
            {/* Recovery Score */}
            <span className="px-1.5 py-0.5 bg-sky-100 dark:bg-sky-950/45 text-[#0EA5E9] dark:text-[#38BDF8] rounded-md font-mono font-black text-[9px] flex items-center gap-0.5 border border-sky-200 dark:border-sky-900/40">
              🧬 {scores.dailyScore}%
            </span>
          </div>

          {/* RIGHT: Compact Calendar & Notifications */}
          <div className="flex items-center gap-1.5">
            {/* Date Swapper */}
            <div className="flex items-center bg-white dark:bg-[#1E293B] border-2 border-[#1E293B] dark:border-[#475569] rounded-lg p-0.5 text-[10px] font-mono font-bold shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]">
              <button 
                onClick={() => handleShiftDate(-1)}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[#16213E] dark:text-[#F8FAFC] rounded cursor-pointer"
                title="Prev Day"
              >
                <ChevronLeft className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="px-1.5 uppercase font-black tracking-tight text-[8px] min-w-[42px] text-center select-none text-[#16213E] dark:text-[#F8FAFC]">
                {getFormattedHeaderDateCompact()}
              </span>
              <button 
                onClick={() => handleShiftDate(1)}
                className="p-0.5 hover:bg-gray-100 dark:hover:bg-zinc-800 text-[#16213E] dark:text-[#F8FAFC] rounded cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {/* Notification Bell Badge */}
            <div className="relative">
              <div 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className={`relative p-1.5 border-2 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C] ${
                  showNotifDropdown ? 'bg-indigo-50 dark:bg-zinc-800 border-[#0057FF] bg-blue-50/50' : 'bg-white dark:bg-[#1E293B] border-[#1E293B] dark:border-[#475569]'
                }`}
                title="View notifications"
              >
                <Bell className="w-3 h-3 text-[#16213E] dark:text-[#F8FAFC] stroke-[2.5]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-rose-500 text-white text-[8px] font-black px-1 rounded-full flex items-center justify-center animate-pulse border border-white">
                    {unreadCount}
                  </span>
                )}
              </div>

              {/* Neobrutalism dropdown menu */}
              <AnimatePresence>
                {showNotifDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 4, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-4 rounded-2xl shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] z-[9990]"
                  >
                    <div className="flex justify-between items-center pb-2 border-b-2 border-slate-100 dark:border-zinc-700/50 mb-2">
                      <span className="text-[10px] sm:text-[11px] font-black uppercase text-gray-700 dark:text-gray-200 flex items-center gap-1 select-none">
                        <Bell className="w-3.5 h-3.5 text-[#0057FF]" /> Activity Alerts
                      </span>
                      <div className="flex gap-1.5 items-center">
                        {notifications.length > 0 && (
                          <button 
                            onClick={markAllNotifAsRead}
                            className="text-[8px] sm:text-[9px] font-black bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-1.5 py-0.5 rounded border border-black/10 text-gray-700 dark:text-gray-300 select-none cursor-pointer"
                            title="Mark all items as read"
                          >
                            Mark Read
                          </button>
                        )}
                        <button 
                          onClick={() => setShowNotifDropdown(false)}
                          className="p-0.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center space-y-2">
                          <CheckCircle className="w-8 h-8 text-slate-300 dark:text-zinc-700 mx-auto" strokeWidth={1.5} />
                          <p className="text-[9px] font-mono font-bold text-gray-400 uppercase">Recovery inbox is empty</p>
                        </div>
                      ) : (
                        notifications.map((item) => (
                          <div 
                            key={item.id} 
                            onClick={() => toggleNotifReadState(item.id)}
                            className={`p-2.5 rounded-xl border-2 text-[10px] sm:text-[11px] leading-relaxed transition-all relative group cursor-pointer ${
                              item.read 
                                ? 'bg-slate-50/50 dark:bg-zinc-850/30 border-slate-200 dark:border-zinc-800 opacity-75' 
                                : 'bg-[#E0DCFF]/20 dark:bg-indigo-950/15 border-[#0057FF]/30 hover:border-[#0057FF]'
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className={`font-black uppercase tracking-tight block ${item.read ? 'text-gray-500' : 'text-indigo-600 dark:text-indigo-300'}`}>
                                {item.title}
                              </span>
                              <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteNotificationItem(item.id);
                                  }}
                                  className="p-0.5 text-gray-400 hover:text-rose-500 rounded cursor-pointer"
                                  title="Dismiss notification"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-350 font-mono text-[9px] leading-tight mt-0.5">{item.body}</p>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[7.5px] text-gray-400 font-mono">
                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!item.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0057FF] inline-block animate-pulse" />
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {notifications.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-zinc-700/50 flex justify-between items-center">
                        <span className="text-[8px] font-mono font-bold text-gray-400 select-none">
                          {unreadCount} UNREAD ALERTS
                        </span>
                        <button 
                          onClick={clearAllNotifications}
                          className="text-[9px] font-black uppercase text-rose-500 hover:text-rose-600 cursor-pointer flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Clear Inbox
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Core Stack */}
      <main className="max-w-2xl mx-auto px-4 pt-6 pb-20">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'diet' && <DietEngine />}
        {activeTab === 'calendar' && <CalendarView />}
        {activeTab === 'copilot' && <AICopilot />}
        {activeTab === 'hair' && <HairRecovery />}
        {activeTab === 'insights' && <Insights />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Bottom Nav Menus */}
      <BottomNavigation 
        currentTab={activeTab} 
        onChangeTab={setTab} 
        streak={streakCount} 
      />
    </div>
  );
}

export default function App() {
  return (
    <DietProvider>
      <AppContent />
    </DietProvider>
  );
}
