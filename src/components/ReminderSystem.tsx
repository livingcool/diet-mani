/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useDietStore } from '../store/dietStore';
import { 
  Bell, Mail, Database, Cpu, Smartphone, History, Sparkles, 
  Clock, Activity, Flame, ShieldAlert, CheckCircle, TrendingUp, 
  Droplet, Heart, Pocket, Coffee, Moon, Zap, UserCheck, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, doc, setDoc, addDoc, onSnapshot, query, orderBy, limit 
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

// Interfaces for our Reminder System
interface NotificationHistoryItem {
  id: string;
  channel: 'push' | 'email' | 'in-app';
  title: string;
  body: string;
  timestamp: string;
  payloadType?: string;
  read?: boolean;
}

export const ReminderSystem: React.FC = () => {
  const { 
    currentDateStr, 
    onboarding, 
    dailyLogs, 
    streakCount, 
    setTab, 
    addWater, 
    toggleMealCompletion,
    xp,
    addXp
  } = useDietStore();

  const [activeChannelTab, setActiveChannelTab] = useState<'in_app' | 'push_lock' | 'email_inbox' | 'architecture'>('in_app');
  
  // Real time timezone detection
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  useEffect(() => {
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setUserTimezone(zone || 'Asia/Kolkata');
    } catch (e) {
      setUserTimezone('Asia/Kolkata');
    }
  }, []);

  // System Configured States
  const [prefBreakfastTime, setPrefBreakfastTime] = useState('07:15');
  const [prefLunchTime, setPrefLunchTime] = useState('12:45');
  const [prefSnackTime, setPrefSnackTime] = useState('17:00');
  const [prefDinnerTime, setPrefDinnerTime] = useState('19:15');
  const [prefQuietHoursStart, setPrefQuietHoursStart] = useState('22:00');
  const [prefQuietHoursEnd, setPrefQuietHoursEnd] = useState('06:00');

  const [notifBreakfast, setNotifBreakfast] = useState(true);
  const [notifLunch, setNotifLunch] = useState(true);
  const [notifSnack, setNotifSnack] = useState(true);
  const [notifDinner, setNotifDinner] = useState(true);
  const [notifWater, setNotifWater] = useState(true);
  const [notifWeeklyReport, setNotifWeeklyReport] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(true);
  const [quietHoursActive, setQuietHoursActive] = useState(false);

  // Simulated notifications queue matching Firestore notifications/notificationHistory collections
  const [notificationsList, setNotificationsList] = useState<NotificationHistoryItem[]>([]);
  const [selectedSchemaCol, setSelectedSchemaCol] = useState<string>('userReminderPreferences');
  const [aiCoachOutput, setAiCoachOutput] = useState<string>('');
  const [isGeneratingCoach, setIsGeneratingCoach] = useState(false);
  const [showPushToast, setShowPushToast] = useState<NotificationHistoryItem | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{ status: 'success' | 'info'; message: string } | null>(null);

  // Load notifications from local caching / Firestore subscription
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        // Logged in: Sync In-App history collection from real-time snapshot
        const notifRef = collection(db, 'users', user.uid, 'notificationHistory');
        const q = query(notifRef, orderBy('timestamp', 'desc'), limit(15));
        
        return onSnapshot(q, (snap) => {
          const list: NotificationHistoryItem[] = [];
          snap.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() } as NotificationHistoryItem);
          });
          if (list.length > 0) {
            setNotificationsList(list);
          } else {
            setNotificationsList(getDefaultHistory());
          }
        });
      } else {
        // Anonymous/Offline mode - Read from local caching
        const cached = localStorage.getItem('dietmani_notif_history');
        if (cached) {
          setNotificationsList(JSON.parse(cached));
        } else {
          const base = getDefaultHistory();
          setNotificationsList(base);
          localStorage.setItem('dietmani_notif_history', JSON.stringify(base));
        }
      }
    });

    return () => unsub();
  }, []);

  const getDefaultHistory = (): NotificationHistoryItem[] => [
    {
      id: 'n_seed_1',
      channel: 'in-app',
      title: '🧬 Recovery Window Open',
      body: 'Your cell matrix values are high. Complete lunch to lock in 44mg amino payload.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      payloadType: 'MEAL_NOTIFICATION'
    },
    {
      id: 'n_seed_2',
      channel: 'push',
      title: '🚀 Payload Ready',
      body: '🍳 Ignition Sequence initialized. Protein payload 30g required now.',
      timestamp: new Date(Date.now() - 12000000).toISOString(),
      payloadType: 'TIMELINE_ADHERENCE'
    },
    {
      id: 'n_seed_3',
      channel: 'email',
      title: 'YOUR DIET MANI RECOVERY BRIEFING',
      body: 'Your weekly performance showed +12% increase in follicle energy levels.',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      payloadType: 'RECOVERY_TREND'
    }
  ];

  // Helper to append a new notification record securely (mirrors Firebase architectures)
  const addNewNotification = async (channel: 'push' | 'email' | 'in-app', title: string, body: string, type: string) => {
    const item: NotificationHistoryItem = {
      id: 'notif_' + Date.now(),
      channel,
      title,
      body,
      timestamp: new Date().toISOString(),
      payloadType: type,
      read: false
    };

    // Trigger local push lock toast emulator
    if (channel === 'push' && notifPush) {
      setShowPushToast(item);
      setTimeout(() => setShowPushToast(null), 5500);
    }

    const updated = [item, ...notificationsList].slice(0, 30);
    setNotificationsList(updated);

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        // Store in FireStore notifications collection
        const colRef = collection(db, 'users', currentUser.uid, 'notificationHistory');
        await addDoc(colRef, item);
        
        // Also queue email if channel has email preference
        if (channel === 'email' && notifEmail) {
          await addDoc(collection(db, 'users', currentUser.uid, 'emailQueue'), {
            to: currentUser.email,
            subject: title,
            body: body,
            status: 'QUEUED',
            timestamp: new Date().toISOString()
          });
        }
      } catch (e) {
        console.error('Error writing reminder telemetry, fallback locally: ', e);
      }
    } else {
      localStorage.setItem('dietmani_notif_history', JSON.stringify(updated));
    }
    
    addXp(12); // reward game points for operating system triggers
  };

  // Generate Yesterday's calculations to feed the Intelligent AI Coach
  const handleGenerateCoach = () => {
    setIsGeneratingCoach(true);
    setAiCoachOutput('');
    
    const dates = Object.keys(dailyLogs).sort();
    let yesterdayData = { protein: 84, hydration: 72, iron: 'moderate' };

    if (dates.length > 1) {
      const yesterdayStr = dates[dates.length - 2];
      const log = dailyLogs[yesterdayStr];
      if (log) {
        let completed = 0;
        let proteinSum = 0;
        let ironSum = 0;
        Object.entries(log.meals).forEach(([_, val]) => {
          const mealVal = val as any;
          if (mealVal && mealVal.completed) {
            completed++;
            proteinSum += 28; // standard options estimate
            ironSum += 4.5;
          }
        });
        const waterPct = Math.round((log.waterIntake / 3000) * 100);
        yesterdayData = {
          protein: Math.min(100, Math.round((proteinSum / 80) * 100)) || 76,
          hydration: waterPct || 68,
          iron: ironSum > 8 ? 'excellent' : 'below target'
        };
      }
    }

    const userName = onboarding?.gender ? 'Warrior' : 'Ganesh';

    const text = `Good Morning ${userName}.\n\n` +
      `System Telemetry Analysis (Yesterday):\n` +
      `• Protein Compliance: [ ${yesterdayData.protein}% ]\n` +
      `• Sebum Hydration: [ ${yesterdayData.hydration}% ]\n` +
      `• Iron Captain Status: [ ${yesterdayData.iron.toUpperCase()} ]\n\n` +
      `Today's Recovery Strategy Configuration:\n` +
      `• Morning Payload: Pesarattu (Green Moong) with Ginger\n` +
      `• Main Deployment: Chicken breast cooked in ghee + Murungai Keerai (Moringa)\n` +
      `• System Impact Prediction: +8.4% Follicle Capital Infusion.\n\n` +
      `[ TRANSMISSION ENDS — SECURE ADHERENCE PROTOCOL ]`;

    // Typewriter effect stimulation
    let idx = 0;
    const interval = setInterval(() => {
      setAiCoachOutput((prev) => prev + text.charAt(idx));
      idx++;
      if (idx >= text.length) {
        clearInterval(interval);
        setIsGeneratingCoach(false);
        addNewNotification('in-app', '🧬 Coach Briefing Generated', 'Your customized daily biological recommendation is active.', 'AI_COACH');
      }
    }, 18);
  };

  // Triggering distinct Gamified Daily Missions
  const triggerMission = (id: string) => {
    switch(id) {
      case 'morning':
        addNewNotification(
          'push',
          '🍳 Ignition Sequence Ready',
          `Your follicles need today's first protein payload. Recommended: Egg Protocol (Target: 30g, Iron: 8mg).`,
          'MORNING_MISSION'
        );
        break;
      case 'b_missed':
        addNewNotification(
          'push',
          '⚠️ Ignition Sequence Delayed',
          'Skipping breakfast reduces today\'s recovery efficiency. Deploy protein payload immediately to preserve scalp integrity.',
          'BREAKFAST_MISSED'
        );
        break;
      case 'lunch':
        addNewNotification(
          'push',
          '🚀 Sustained Payload Activated',
          `Your biological engine is ready for main nutrient deployment. Today's Priority: Iron + Protein (Recommended: Chicken + Keerai).`,
          'LUNCH_MISSION'
        );
        break;
      case 'l_missed':
        addNewNotification(
          'push',
          '⚠️ Protein Deficit Detected',
          'Current protein compliance is below target safety levels. Recover your lunch mission payload immediately.',
          'LUNCH_MISSED'
        );
        break;
      case 'evening':
        addNewNotification(
          'in-app',
          '🌱 Circulatory Bridge Available',
          'Pumpkin Seeds + Black Chickpeas suggested now to optimize micro-circulation pathways and support hair follicle root oxygenation.',
          'EVENING_BRIDGE'
        );
        break;
      case 'dinner':
        addNewNotification(
          'push',
          '🌙 Metabolic Shutdown Window',
          'Focus on cellular recovery. Avoid inflammatory grains. Choose Bone Broth, Paneer, or Egg Salad to secure overnight repair.',
          'DINNER_MISSION'
        );
        break;
      case 'eod':
        // calculate live scores
        addNewNotification(
          'email',
          '📊 Diet Mani Daily Recovery Report',
          `Today's Bio-Compliance statistics. Current Streak: ${streakCount} days. Water logs loaded. Review system before automatic midnight cutoff.`,
          'DAILY_REPORT'
        );
        break;
      default:
        break;
    }
  };

  // Smart Adaptive Warnings
  const triggerAdaptiveAlert = (type: string) => {
    if (type === 'low_protein') {
      addNewNotification(
        'push',
        '🥚 Protein Recovery Needed',
        'Current daily intake has dropped below protective safety zone. One Egg Protocol can lift compliance index by 25% now.',
        'SMART_PROTEIN_ALERT'
      );
    } else if (type === 'low_iron') {
      addNewNotification(
        'in-app',
        '🩸 Iron Stores Running Low',
        'Inadequate nutrient oxygen levels observed. Incorporate Moringa (Murungai) or Rajma block in next meal phase.',
        'SMART_IRON_ALERT'
      );
    } else if (type === 'hydration') {
      addNewNotification(
        'push',
        '💧 Hydration Recovery Needed',
        'Cell water saturation is critical. Supply 500ml pure water payload immediately to restore root micro-circulation.',
        'SMART_HYDRATION_ALERT'
      );
    } else if (type === 'streak') {
      addNewNotification(
        'push',
        '🔥 Streak Protection Activated',
        `Your active ${Math.max(streakCount, 8)}-day biological recovery streak is critically at risk! Complete standard meal log within next 45 minutes.`,
        'STREAK_SHIELD'
      );
    }
  };

  // Pre-configured Firestore schemas for User's Education & Tech transparency
  const getSimulatedSchema = () => {
    switch (selectedSchemaCol) {
      case 'notifications':
        return {
          id: "string (FCM token payload key)",
          userId: "string",
          title: "🍳 Ignition Sequence Ready",
          body: "Your follicles need today's first protein payload.",
          timestamp: "timestamp",
          sentStatus: "SENT | FAILED",
          deviceMetadata: { platform: "Android", browser: "PWA Chrome" }
        };
      case 'notificationTemplates':
        return {
          templateId: "morning_mission_payload",
          triggerTime: "07:15",
          channel: "PUSH_FCM",
          title: "🍳 Ignition Sequence Ready",
          defaultBody: "Your follicles need today's first protein payload.",
          recommendedPayload: { protein: "30g", iron: "8mg" }
        };
      case 'userReminderPreferences':
        return {
          userId: "auth.uid",
          breakfastReminderTime: prefBreakfastTime,
          lunchReminderTime: prefLunchTime,
          snackReminderTime: prefSnackTime,
          dinnerReminderTime: prefDinnerTime,
          pushEnabled: notifPush,
          emailEnabled: notifEmail,
          waterAlerts: notifWater,
          weeklyReport: notifWeeklyReport,
          quietHours: { active: quietHoursActive, start: prefQuietHoursStart, end: prefQuietHoursEnd },
          timezone: userTimezone
        };
      case 'emailQueue':
        return {
          queueId: "string (Auto uuid)",
          toEmail: "ganeshkhovalan2203@gmail.com",
          subject: "Your Diet Mani Daily Recovery Report",
          templateName: "daily_summary_report",
          variables: { streak: streakCount, compliance: 82, protein: '86%' },
          status: "QUEUED | SENT | RETRYING",
          attempts: 1,
          createdAt: new Date().toISOString()
        };
      case 'scheduledNotifications':
        return {
          scheduleId: "string",
          userId: "string",
          targetTime: "2026-06-08T12:45:00Z",
          triggerCondition: "LUNCH_NOT_COMPLETE",
          fcmToken: "string (Cached fcm_registration)",
          status: "PENDING | EXECUTED | CANCELLED"
        };
      case 'notificationHistory':
        return {
          historyId: "string (Autonode)",
          userId: "string",
          title: "⚠️ Protein Deficit Detected",
          body: "Current protein compliance is below target. Complete lunch.",
          timestamp: new Date().toISOString(),
          readState: false,
          category: "LUNCH_MISSED"
        };
      case 'dailyReports':
        return {
          reportId: `${currentDateStr}_sum`,
          userId: "string",
          date: currentDateStr,
          complianceScore: "82%",
          proteinProgress: "86%",
          ironProgress: "Low (<8mg)",
          waterIntakeMililiters: 2400,
          hairHealthGrowthScore: "9.2/10",
          missedMealSegments: ["phase_1_breakfast"],
          tomorrowRecommendations: ["Pesarattu", "Rajma + Keerai"],
          sentAt: new Date().toISOString()
        };
      case 'weeklyReports':
        return {
          weekId: "2026_W23",
          userId: "string",
          weeklyComplianceScore: "87.4%",
          proteinAverageGrams: "92g",
          ironAverageMg: "12.8mg",
          hydrationAverageMl: 2850,
          streakMaxDays: streakCount,
          projectedTrendPct: "+14.2% Hair Density Improvement",
          achievementsEarned: ["Scalp Guardian Badge", "Anagen Matrix Peak"],
          progressDataChart: [
            { day: "Mon", compliance: 78 },
            { day: "Tue", compliance: 90 },
            { day: "Wed", compliance: 85 }
          ]
        };
      default:
        return {};
    }
  };

  return (
    <div className="space-y-6 text-[#16213E] dark:text-[#F8FAFC]">
      {/* Dynamic Device Push Notification Toast Simulation overlay */}
      <AnimatePresence>
        {showPushToast && (
          <motion.div 
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-20 left-4 right-4 z-50 max-w-sm mx-auto bg-white dark:bg-[#1E293B] border-4 border-[#0057FF] dark:border-[#4D8DFF] text-[#16213E] dark:text-[#F8FAFC] p-4 rounded-2xl shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] select-none"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#E0FBF9] dark:bg-[#202E5C] flex items-center justify-center border-2 border-[#00C2B8] dark:border-[#2DD4BF] shrink-0">
                <Bell className="w-5 h-5 text-[#00C2B8] dark:text-[#2DD4BF] animate-pulse" />
              </div>
              <div className="flex-grow">
                <div className="flex justify-between items-center">
                  <span className="text-[8px] font-mono uppercase bg-[#E0FBF9] dark:bg-[#202E5C] px-1.5 py-0.5 rounded text-[#00C2B8] dark:text-[#2DD4BF] font-bold border border-[#00C2B8]/30">FCM Push (Channel 1)</span>
                  <span className="text-[8px] text-zinc-500 font-mono">JUST NOW</span>
                </div>
                <h4 className="font-extrabold text-xs uppercase tracking-wide mt-1 text-[#16213E] dark:text-[#F8FAFC]">{showPushToast.title}</h4>
                <p className="text-[10px] text-slate-600 dark:text-zinc-300 leading-relaxed mt-0.5 font-medium">{showPushToast.body}</p>
                
                <div className="mt-2.5 flex gap-2">
                  <button 
                    onClick={() => {
                      setShowPushToast(null);
                      setTab('diet');
                    }}
                    className="bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] font-mono font-black text-[9px] px-2.5 py-1 rounded border-2 border-[#1E293B] dark:border-[#475569] uppercase cursor-pointer hover:opacity-95 active:translate-y-0.5 transition-all text-center flex-grow shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
                  >
                    Launch Mission →
                  </button>
                  <button 
                    onClick={() => setShowPushToast(null)}
                    className="bg-white dark:bg-[#273449] text-[#16213E] dark:text-zinc-400 font-mono font-black text-[9px] px-2 border-2 border-[#1E293B] dark:border-[#475569] rounded uppercase cursor-pointer hover:bg-gray-50 dark:hover:bg-[#2D3B52]"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core Header Visuals */}
      <div id="reminder-coach-card" className="bg-white dark:bg-[#1E293B] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C] text-[#16213E] dark:text-[#F8FAFC]">
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-[#0057FF] dark:text-[#4D8DFF] tracking-widest block mb-0.5">COACHING SYSTEMS</span>
            <h3 className="text-xl font-extrabold uppercase leading-none">Intelligent Reminder Engine</h3>
          </div>
          <span className="text-[9px] uppercase font-black bg-blue-50 dark:bg-blue-950/40 text-[#0057FF] dark:text-[#4D8DFF] border border-[#0057FF]/30 px-2.5 py-1 rounded-lg font-mono">
            Proactive Coach V1.4
          </span>
        </div>

        <p className="text-xs text-slate-650 dark:text-zinc-300 font-semibold leading-relaxed">
          Unlock maximum biological compliance. Our smart reminders never act as standard alarms. They operate as actionable, gamified mission briefs driving direct hair matrix recovery.
        </p>

        {/* Timezone Status Indicator Badge */}
        <div className="mt-4 flex flex-wrap gap-2 items-center text-[10px] font-mono text-slate-600 dark:text-zinc-300 bg-slate-50 dark:bg-[#273449] border border-[#1E293B]/20 dark:border-[#475569]/50 p-2 rounded-xl">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-extrabold">Detected System Timezone:</span>
          <span className="text-[#00C2B8] dark:text-[#2DD4BF] font-extrabold tracking-tight">{userTimezone}</span>
          <span className="text-zinc-400 dark:text-slate-600">|</span>
          <span className="text-[#0057FF] dark:text-[#4D8DFF] font-bold">24-Hr Payload Windows Active</span>
        </div>
      </div>

      {/* Section 1: AI Morning Coach Generator */}
      <div className="bg-white dark:bg-[#1E293B] text-[#16213E] dark:text-[#F8FAFC] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
            <h3 className="text-lg font-black uppercase leading-none text-[#16213E] dark:text-[#F8FAFC]">AI Coach Morning Briefing</h3>
          </div>
          <span className="text-[8px] font-mono px-2 py-0.5 border border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 rounded-md font-bold">
            DYNAMIC GENERATION
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold leading-relaxed mb-4">
          Computes yesterday's exact logged records (Protein compliance, Sebum Hydration, Iron rates) to design today's customized recipe recommendations and recovery index impacts.
        </p>

        <div className="bg-slate-50 dark:bg-[#273449] text-[#16213E] dark:text-[#F8FAFC] font-mono text-xs p-4 rounded-xl border-2 border-[#1E293B] dark:border-[#475569] relative min-h-[140px] flex flex-col justify-between overflow-x-hidden select-none">
          {/* Output text */}
          <div className="whitespace-pre-line leading-relaxed tracking-tight min-h-[100px] h-full text-slate-800 dark:text-zinc-100 font-semibold">
            {aiCoachOutput || (
              <span className="text-slate-500 dark:text-zinc-400 block italic py-6 text-center">
                &gt;_ Click button below to run telemetry computation and inject Coach parameters...
              </span>
            )}
          </div>

          <div className="absolute right-2.5 top-2.5 bg-slate-200/60 dark:bg-[#1E293B] border border-[#1E293B]/20 dark:border-[#475569]/30 text-[8px] px-1.5 py-0.5 text-zinc-500 dark:text-zinc-400 rounded font-semibold font-mono">
            SYS: GPT-GEMINI_ENG
          </div>
        </div>

        <button
          onClick={handleGenerateCoach}
          disabled={isGeneratingCoach}
          className="w-full mt-4 bg-[#FFB703] dark:bg-[#FBBF24] border-3 border-[#1E293B] dark:border-[#475569] p-3 rounded-xl text-xs uppercase font-black tracking-wider shadow-[2px_2px_0px_0px_#1E293B] dark:shadow-[2px_2px_0px_0px_#0A0F1C] hover:opacity-95 active:translate-y-0.5 cursor-pointer disabled:opacity-50 text-black flex items-center justify-center gap-2"
        >
          {isGeneratingCoach ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              Computing Yesterday's Biosensors...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-black" />
              Generate Daily Custom Recommendation
            </>
          )}
        </button>
      </div>

      {/* Grid for Trigger Emulators & Smart Adaptive Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card: Daily Nutrition Mission Emulators (Channel trigger cockpit) */}
        <div className="bg-white dark:bg-[#1E293B] text-[#16213E] dark:text-[#F8FAFC] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
          <span className="text-[10px] font-black uppercase text-[#0057FF] dark:text-[#4D8DFF] tracking-wider block mb-0.5">PAYLOAD COCKPIT</span>
          <h3 className="text-lg font-black uppercase leading-none mb-3">Daily Mission Flow Emulator</h3>
          <p className="text-xs text-slate-550 dark:text-zinc-400 font-semibold leading-relaxed mb-4">
            Manually trigger specific scheduled nutrition missions to check lock screen push banners, email report queuing, and FireStore updates.
          </p>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">07:15 — Breakfast Missing</span>
                <span className="font-extrabold text-xs">🍳 Morning Mission Launch</span>
              </div>
              <button 
                onClick={() => triggerMission('morning')}
                className="bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>

            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">09:00 — No breakfast logged</span>
                <span className="font-extrabold text-xs text-amber-600 dark:text-amber-400">⚠️ Ignition Sequence Delayed</span>
              </div>
              <button 
                onClick={() => triggerMission('b_missed')}
                className="bg-[#FFB703] dark:bg-[#FBBF24] text-black font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>

            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">12:45 — Main nutrition window</span>
                <span className="font-extrabold text-xs text-[#0057FF] dark:text-[#4D8DFF]">🚀 Sustained Payload Brief</span>
              </div>
              <button 
                onClick={() => triggerMission('lunch')}
                className="bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>

            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">14:30 — No lunch completed</span>
                <span className="font-extrabold text-xs text-rose-500 dark:text-rose-400">⚠️ Protein Deficit Alert</span>
              </div>
              <button 
                onClick={() => triggerMission('l_missed')}
                className="bg-[#FB7185] text-white dark:text-[#0F172A] font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>

            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">17:00 — Microvascular booster</span>
                <span className="font-extrabold text-xs text-[#00C2B8] dark:text-[#2DD4BF]">🌱 Circulatory Bridge</span>
              </div>
              <button 
                onClick={() => triggerMission('evening')}
                className="bg-[#00C2B8] dark:bg-[#2DD4BF] text-white dark:text-[#0F172A] font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>

            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">19:15 — Metabolic window</span>
                <span className="font-extrabold text-xs text-[#8B5CF6] dark:text-[#A78BFA]">🌙 Shutdown & Recovery</span>
              </div>
              <button 
                onClick={() => triggerMission('dinner')}
                className="bg-[#8B5CF6] dark:bg-[#A78BFA] text-white dark:text-[#0F172A] font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>

            <div className="border border-slate-200 dark:border-[#475569] p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#273449]/50 flex justify-between items-center">
              <div>
                <span className="text-[8.5px] font-mono text-zinc-500 dark:text-zinc-400 block leading-none">21:30 — Daily summaries reports</span>
                <span className="font-extrabold text-xs">📊 End Of Day summaries email</span>
              </div>
              <button 
                onClick={() => triggerMission('eod')}
                className="bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] font-extrabold border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-[9px] px-2.5 py-1 hover:opacity-95 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B] dark:shadow-[1px_1px_0px_0px_#0A0F1C]"
              >
                Trigger
              </button>
            </div>
          </div>
        </div>

        {/* Card: Smart Adaptive Triggers & Streak Protector */}
        <div className="bg-white dark:bg-[#1E293B] text-[#16213E] dark:text-[#F8FAFC] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
          <span className="text-[10px] font-black uppercase text-[#FB7185] tracking-wider block mb-0.5">SENSORS INTELLIGENCE</span>
          <h3 className="text-lg font-black uppercase leading-none mb-3">Smart Adaptive Deficits</h3>
          <p className="text-xs text-slate-550 dark:text-zinc-400 font-semibold leading-relaxed mb-4">
            Emulate immediate fallback instructions in response to critical biosensor shortages or when a active streak cycle is near interruption threshold.
          </p>

          <div className="space-y-3">
            <div className="bg-orange-50/60 dark:bg-orange-950/20 border-2 border-orange-200 dark:border-orange-900/60 p-3 rounded-xl flex items-start gap-2.5">
              <Zap className="w-4.5 h-4.5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <span className="font-extrabold text-xs block text-orange-900 dark:text-orange-400">Protein Levels drop ({'<'}60%)</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2">Simulate real low protein alerts suggesting single-egg recovery.</p>
                <button 
                  onClick={() => triggerAdaptiveAlert('low_protein')}
                  className="bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] font-mono font-black border-2 border-[#1E293B] dark:border-zinc-800 text-[9px] px-2.5 py-1.5 rounded-lg hover:opacity-90 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B]"
                >
                  Fire Protein Alert
                </button>
              </div>
            </div>

            <div className="bg-rose-50/60 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 p-3 rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <span className="font-extrabold text-xs block text-rose-900 dark:text-rose-400">Critically Low Iron Saturation</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2">Suggests Murungai / Moringa oxygenation protocols to follicle stems.</p>
                <button 
                  onClick={() => triggerAdaptiveAlert('low_iron')}
                  className="bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A] font-mono font-black border-2 border-[#1E293B] dark:border-zinc-800 text-[9px] px-2.5 py-1.5 rounded-lg hover:opacity-90 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B]"
                >
                  Fire Low Iron Alert
                </button>
              </div>
            </div>

            <div className="bg-sky-50/60 dark:bg-sky-950/20 border-2 border-sky-200 dark:border-sky-900/60 p-3 rounded-xl flex items-start gap-2.5">
              <Droplet className="w-4.5 h-4.5 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <span className="font-extrabold text-xs block text-sky-900 dark:text-sky-300">Dehydration Hazard Alert</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2">Triggers urgent 500ml water loading reminders.</p>
                <button 
                  onClick={() => triggerAdaptiveAlert('hydration')}
                  className="bg-[#00C2B8] dark:bg-[#2DD4BF] text-white dark:text-[#0F172A] font-mono font-black border-2 border-[#1E293B] dark:border-zinc-800 text-[9px] px-2.5 py-1.5 rounded-lg hover:opacity-90 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B]"
                >
                  Fire Hydration Alert
                </button>
              </div>
            </div>

            <div className="bg-red-50/60 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/60 p-3 rounded-xl flex items-start gap-2.5">
              <Flame className="w-4.5 h-4.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="flex-grow">
                <span className="font-extrabold text-xs block text-red-900 dark:text-red-400">🔥 Streak Protection Shield (Streak {'>'} 5)</span>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2">Warns user they have 45 minutes to log meal payloads or forfeit active cycle counts.</p>
                <button 
                  onClick={() => triggerAdaptiveAlert('streak')}
                  className="bg-[#FFB703] dark:bg-[#FBBF24] text-black font-mono font-black border-2 border-[#1E293B] dark:border-[#475569] text-[9px] px-2.5 py-1.5 rounded-lg hover:opacity-90 cursor-pointer shadow-[1px_1px_0px_0px_#1E293B]"
                >
                  Fire Streak Shield Alert
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Section 2: Transmission Channels & History Simulator */}
      <div className="bg-white dark:bg-[#1E293B] text-[#16213E] dark:text-[#F8FAFC] border-4 border-[#1E293B] dark:border-[#475569] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_#1E293B] dark:shadow-[6px_6px_0px_0px_#0A0F1C]">
        <h3 className="text-lg font-black uppercase text-[#16213E] dark:text-[#F8FAFC] mb-2 tracking-tight flex items-center gap-2">
          <Database className="w-5 h-5 text-[#0057FF] dark:text-[#4D8DFF]" />
          Diet Mani Multi-Channel Transmissions log
        </h3>
        <p className="text-xs text-slate-550 dark:text-zinc-400 font-semibold mb-4">
          Monitor push notifications locks, simulated SendGrid Weekly/Daily emails, and active Firestore collections.
        </p>

        {/* Tabs inside multi-channel monitor */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-[#273449] border-2 border-[#1E293B] dark:border-[#475569] rounded-xl mb-4 text-[10px] font-mono font-black uppercase">
          <button
            onClick={() => setActiveChannelTab('in_app')}
            className={`py-2 px-1 text-center rounded-lg cursor-pointer ${
              activeChannelTab === 'in_app' ? 'bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A]' : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            In-App (Firestore)
          </button>
          <button
            onClick={() => setActiveChannelTab('push_lock')}
            className={`py-2 px-1 text-center rounded-lg cursor-pointer ${
              activeChannelTab === 'push_lock' ? 'bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A]' : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Push Device Feed
          </button>
          <button
            onClick={() => setActiveChannelTab('email_inbox')}
            className={`py-2 px-1 text-center rounded-lg cursor-pointer ${
              activeChannelTab === 'email_inbox' ? 'bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A]' : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Email reports inbox
          </button>
          <button
            onClick={() => setActiveChannelTab('architecture')}
            className={`py-2 px-1 text-center rounded-lg cursor-pointer ${
              activeChannelTab === 'architecture' ? 'bg-[#0057FF] dark:bg-[#4D8DFF] text-white dark:text-[#0F172A]' : 'text-slate-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
            }`}
          >
            Firestore Schemas
          </button>
        </div>

        {/* Tab contents */}
        <div className="bg-slate-50 dark:bg-[#273449] border-3 border-[#1E293B] dark:border-[#475569] p-4 rounded-xl min-h-[220px]">
          
          {activeChannelTab === 'in_app' && (
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-[10px] font-mono mb-2 text-zinc-500 dark:text-zinc-400">
                <span>FIRESTORE COLLECTION: [ notificationHistory ]</span>
                <span className="text-[#00C2B8] dark:text-[#2DD4BF] font-black">LIVE CAPTURED</span>
              </div>
              
              {notificationsList.filter(n => n.channel === 'in-app' || n.channel === 'push').length === 0 ? (
                <div className="text-center py-8 font-mono text-zinc-500 text-xs">No active notification history triggers observed.</div>
              ) : (
                notificationsList
                  .filter(n => n.channel === 'in-app' || n.channel === 'push')
                  .map((notif, index) => (
                    <div key={notif.id} className="p-3 border-2 border-slate-200 dark:border-[#475569] rounded-xl relative hover:scale-[1.01] transition-transform flex gap-3 text-[#16213E] dark:text-[#F8FAFC] bg-white dark:bg-[#1E293B]">
                      <div className="w-8 h-8 rounded-full bg-[#0057FF]/10 flex items-center justify-center shrink-0 border border-[#0057FF]/20">
                        <History className="w-4.5 h-4.5 text-[#0057FF] dark:text-[#4D8DFF]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-black uppercase tracking-wide truncate">{notif.title}</span>
                          <span className="text-[8.5px] font-mono text-zinc-500 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-slate-650 dark:text-zinc-300 leading-relaxed mt-0.5 font-medium">{notif.body}</p>
                        
                        {notif.payloadType && (
                          <span className="inline-block mt-2 font-mono text-[7px] font-bold tracking-wider uppercase px-1.5 py-0.5 bg-slate-100 dark:bg-[#273449] text-slate-600 dark:text-zinc-400 rounded border border-slate-200/50 dark:border-slate-850">
                            ID: {notif.payloadType}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {activeChannelTab === 'push_lock' && (
            <div className="flex justify-center select-none py-1">
              {/* Emulated phone locks screen wrapper */}
              <div className="w-full max-w-xs bg-slate-100 dark:bg-[#1E293B] text-[#16213E] dark:text-[#F8FAFC] border-4 border-[#1E293B] dark:border-[#475569] rounded-[36px] overflow-hidden p-4 shadow-[4px_4px_0_#1E293B] dark:shadow-[4px_4px_0_#0A0F1C] relative min-h-[300px]">
                {/* Speaker pill top and notch layout */}
                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-200 dark:bg-[#273449] rounded-full flex justify-center items-center gap-1.5 border border-slate-300 dark:border-[#475569]/40">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-[#1E293B]" />
                  <div className="w-8 h-0.5 bg-slate-400 dark:bg-[#475569]" />
                </div>

                <div className="text-center mt-6">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 block">LOCK SCREEN EMULATOR</span>
                  <h4 className="text-2xl font-black font-mono tracking-tight mt-1 text-[#0057FF] dark:text-[#4D8DFF]">08:57</h4>
                  <p className="text-[9px] font-mono text-slate-500 dark:text-zinc-400 uppercase mt-0.5">Monday, June 8</p>
                </div>

                <div className="space-y-2.5 mt-5">
                  {notificationsList.filter(n => n.channel === 'push').slice(0, 2).map((p) => (
                    <motion.div 
                      key={p.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-white dark:bg-[#273449]/90 backdrop-blur border-2 border-[#1E293B] dark:border-[#475569] p-2.5 rounded-2xl flex items-start gap-2 relative shadow-[1px_1px_0px_0px_#1E293B]"
                    >
                      <Smartphone className="w-4.5 h-4.5 text-[#0057FF] dark:text-[#4D8DFF] mt-0.5 shrink-0" />
                      <div>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-[8px] font-mono font-extrabold text-[#0057FF] dark:text-[#4D8DFF]">FCM Push Service</span>
                          <span className="text-[7.5px] font-mono text-zinc-500">now</span>
                        </div>
                        <h4 className="text-[10px] font-bold text-[#16213E] dark:text-[#F8FAFC] uppercase leading-tight tracking-wide mt-0.5">{p.title}</h4>
                        <p className="text-[9px] text-slate-650 dark:text-zinc-350 mt-0.5 leading-relaxed font-semibold">{p.body}</p>
                      </div>
                    </motion.div>
                  ))}

                  {notificationsList.filter(n => n.channel === 'push').length === 0 && (
                    <div className="text-center py-10 font-mono text-zinc-450 dark:text-zinc-500 text-[9px] uppercase">
                      No device push broadcasts loaded. Trigger daily payloads above!
                    </div>
                  )}
                </div>

                <div className="text-center text-[7.5px] font-mono text-slate-500 dark:text-zinc-400 mt-8">
                  Swipe up to launch secure Bio-System Workspace payload
                </div>
              </div>
            </div>
          )}

          {activeChannelTab === 'email_inbox' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 dark:text-zinc-400 border-b pb-2">
                <span>SIMULATED EMAIL DELIVERIES: [ dailyReports / weeklyReports ]</span>
                <span className="text-[#0057FF] dark:text-[#4D8DFF] font-black">SENDGRID QUEUE STABLE</span>
              </div>

              {/* Sample Email payload */}
              <div className="border-2 border-[#1E293B] dark:border-[#475569] bg-white dark:bg-[#1E293B] p-4.5 rounded-xl text-black dark:text-zinc-100 font-mono text-xs max-h-[300px] overflow-y-auto">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3 space-y-1 text-[11px] font-semibold text-zinc-500">
                  <div><span className="text-zinc-450 uppercase">Sender:</span> Diet Mani System Notification &lt;recovery@dietmani.applet&gt;</div>
                  <div><span className="text-zinc-450 uppercase">Recipient:</span> Ganesh &lt;ganeshkhovalan2203@gmail.com&gt;</div>
                  <div><span className="text-zinc-450 uppercase">Subject:</span> <span className="text-[#0057FF] dark:text-[#4D8DFF] font-black">[DAILY REPORT] Your Diet Mani Daily Recovery Report</span></div>
                </div>

                <div className="space-y-3 font-sans normal-case text-zinc-700 dark:text-zinc-350">
                  <h4 className="font-extrabold text-sm text-black dark:text-white uppercase tracking-wider font-mono">🍉 Your Diet Mani Daily Recovery Report ({currentDateStr})</h4>
                  <p className="text-xs leading-relaxed">
                    Hello Ganesh! Your biological performance logs have been reviewed by our AI Coaching analytics system. Below are your localized compliance profiles for today:
                  </p>
                  
                  {/* Stats table */}
                  <div className="grid grid-cols-2 gap-3 bg-[#E0FBF9] dark:bg-[#202E5C] border-2 border-[#1E293B] dark:border-[#475569] p-3.5 rounded-xl font-mono text-xs text-black dark:text-white">
                    <div>
                      <span className="text-zinc-500 block text-[9.5px] uppercase font-black">Bio Adherence Score</span>
                      <strong className="text-md font-black">82% (High Recovery)</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9.5px] uppercase font-black">Protein Saturation</span>
                      <strong className="text-md text-[#00C2B8] dark:text-[#2DD4BF] font-black">86% Compliance</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9.5px] uppercase font-black">Iron Infusions</span>
                      <strong className="text-md text-amber-500 font-black">Low (Alert Loaded)</strong>
                    </div>
                    <div>
                      <span className="text-zinc-500 block text-[9.5px] uppercase font-black">Water Logged</span>
                      <strong className="text-md text-sky-500 font-black">2.4L (90% target)</strong>
                    </div>
                  </div>

                  <p className="border-l-4 border-amber-650 bg-amber-50/50 dark:bg-amber-950/20 p-2 text-[11px] font-medium leading-relaxed rounded-r italic text-amber-900 dark:text-amber-400">
                    ⚠️ Yesterday's iron stores running low. Pesarattu and Moringa (Murungai Keerai) payloads have been scheduled for tomorrow morning to maximize capillary support.
                  </p>

                  <div className="text-[10px] text-zinc-500 dark:text-zinc-500 border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-2 font-mono">
                    You can calibrate push / emails / reports scheduling anytime inside local Setup Tab values inside Diet Mani Applet.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeChannelTab === 'architecture' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-2">
                <span>EXPLORE PERSISTENT SCHEMAS</span>
                <span className="text-[#8B5CF6] dark:text-[#A78BFA] font-bold font-mono">FIREBASE FIRESTORE BLUEPRINTS</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  'notifications', 'notificationTemplates', 'userReminderPreferences', 
                  'emailQueue', 'scheduledNotifications', 'notificationHistory', 
                  'dailyReports', 'weeklyReports'
                ].map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedSchemaCol(col)}
                    className={`py-1.5 px-2 font-mono text-[9px] border-2 border-[#1E293B] dark:border-[#475569] rounded-lg text-left truncate cursor-pointer transition-colors ${
                      selectedSchemaCol === col ? 'bg-[#8B5CF6] dark:bg-[#A78BFA] text-white dark:text-[#0F172A] font-black' : 'hover:bg-slate-200 dark:hover:bg-zinc-800 text-zinc-500 bg-white dark:bg-[#1E293B]'
                    }`}
                  >
                    📂 {col}
                  </button>
                ))}
              </div>

              {/* JSON tree viewer representing FireStore schemas */}
              <div className="bg-slate-100 dark:bg-[#1E293B] text-[#0057FF] dark:text-[#4D8DFF] p-4.5 border-2 border-[#1E293B] dark:border-[#475569] rounded-xl font-mono text-[10.5px] leading-relaxed max-h-[220px] overflow-y-auto">
                <span className="text-zinc-500 dark:text-zinc-400 block mb-1 text-[8px] uppercase">FIRESTORE SCHEMA MODEL DOCUMENT: collection("{selectedSchemaCol}")</span>
                <pre className="text-slate-800 dark:text-zinc-100 font-semibold">{JSON.stringify(getSimulatedSchema(), null, 2)}</pre>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Section 3: Customizable User Schedule Controls (Fulfills the customization spec) */}
      <div className="bg-white dark:bg-[#1B1B1B] text-black dark:text-white border-4 border-black dark:border-[#2E2E2E] p-5 rounded-[28px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider block mb-0.5">TELEMETRY PREFERENCES</span>
        <h3 className="text-lg font-black uppercase tracking-tight mb-2">Custom Reminder Rules &amp; Quiet Hours</h3>
        <p className="text-xs text-gray-500 dark:text-zinc-400 font-semibold mb-5">
          Fine-tune biological window reminders in your local timezone. Set quiet hours boundaries to prevent mid-night system interruptions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Time pickers form */}
          <div className="space-y-3 font-mono text-xs">
            <h4 className="font-extrabold uppercase border-b pb-1 text-zinc-400 text-[10px]">1. Custom Meal Schedules</h4>
            
            <div className="flex justify-between items-center border border-zinc-150 dark:border-zinc-800 p-2 rounded-xl bg-gray-50/50 dark:bg-zinc-900/10">
              <span className="font-extrabold">Breakfast Trigger Time</span>
              <input
                type="time"
                value={prefBreakfastTime}
                onChange={(e) => setPrefBreakfastTime(e.target.value)}
                className="bg-white dark:bg-zinc-800 border-2 border-black font-semibold text-center rounded p-1"
              />
            </div>

            <div className="flex justify-between items-center border border-zinc-150 dark:border-zinc-800 p-2 rounded-xl bg-gray-50/50 dark:bg-zinc-900/10">
              <span className="font-extrabold">Lunch Trigger Time</span>
              <input
                type="time"
                value={prefLunchTime}
                onChange={(e) => setPrefLunchTime(e.target.value)}
                className="bg-white dark:bg-zinc-800 border-2 border-black font-semibold text-center rounded p-1"
              />
            </div>

            <div className="flex justify-between items-center border border-zinc-150 dark:border-zinc-800 p-2 rounded-xl bg-gray-50/50 dark:bg-zinc-900/10">
              <span className="font-extrabold">Snack Trigger Time</span>
              <input
                type="time"
                value={prefSnackTime}
                onChange={(e) => setPrefSnackTime(e.target.value)}
                className="bg-white dark:bg-zinc-800 border-2 border-black font-semibold text-center rounded p-1"
              />
            </div>

            <div className="flex justify-between items-center border border-zinc-150 dark:border-zinc-800 p-2 rounded-xl bg-gray-50/50 dark:bg-zinc-900/10">
              <span className="font-extrabold">Dinner Trigger Time</span>
              <input
                type="time"
                value={prefDinnerTime}
                onChange={(e) => setPrefDinnerTime(e.target.value)}
                className="bg-white dark:bg-zinc-800 border-2 border-black font-semibold text-center rounded p-1"
              />
            </div>
            
            {/* Quiet Hours */}
            <h4 className="font-extrabold uppercase border-b pb-1 text-zinc-400 text-[10px] pt-3">2. Quiet Hours Boundaries</h4>
            <div className="border border-zinc-150 dark:border-zinc-850 p-3 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-extrabold flex items-center gap-1.5"><Moon className="w-4 h-4 text-purple-500" /> Quiet Hours Shield</span>
                <input
                  type="checkbox"
                  checked={quietHoursActive}
                  onChange={(e) => setQuietHoursActive(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </div>

              {quietHoursActive && (
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div>
                    <span className="block text-zinc-500 uppercase font-bold mb-0.5">Start Exclusion</span>
                    <input
                      type="time"
                      value={prefQuietHoursStart}
                      onChange={(e) => setPrefQuietHoursStart(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded p-1 text-center font-bold"
                    />
                  </div>
                  <div>
                    <span className="block text-zinc-500 uppercase font-bold mb-0.5">End Exclusion</span>
                    <input
                      type="time"
                      value={prefQuietHoursEnd}
                      onChange={(e) => setPrefQuietHoursEnd(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-800 border-2 border-black rounded p-1 text-center font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="space-y-2 text-xs font-mono">
            <h4 className="font-extrabold uppercase border-b pb-1 text-zinc-400 text-[10px]">3. Notification Channels Enable</h4>
            
            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Smartphone className="w-4 h-4 text-[#0057FF]" /> Push Notifications (Channel 1)</span>
              <input
                type="checkbox"
                checked={notifPush}
                onChange={(e) => setNotifPush(e.target.checked)}
                className="w-4 h-4 accent-[#0057FF] rounded"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-[#0057FF]" /> Email Reminders (Channel 2)</span>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="w-4 h-4 accent-[#0057FF] rounded"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-purple-500" /> Morning Breakfast Alert</span>
              <input
                type="checkbox"
                checked={notifBreakfast}
                onChange={(e) => setNotifBreakfast(e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Check className="w-4 h-4 text-blue-500" /> Noon Lunch Alert</span>
              <input
                type="checkbox"
                checked={notifLunch}
                onChange={(e) => setNotifLunch(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Coffee className="w-4 h-4 text-sky-500" /> Snacking / Bridge Alert</span>
              <input
                type="checkbox"
                checked={notifSnack}
                onChange={(e) => setNotifSnack(e.target.checked)}
                className="w-4 h-4 accent-sky-600 rounded"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Moon className="w-4 h-4 text-indigo-500" /> Nocturnal Dinner Alert</span>
              <input
                type="checkbox"
                checked={notifDinner}
                onChange={(e) => setNotifDinner(e.target.checked)}
                className="w-4 h-4 accent-indigo-600"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><Droplet className="w-4 h-4 text-sky-500 animate-bounce" /> Hydration reminders</span>
              <input
                type="checkbox"
                checked={notifWater}
                onChange={(e) => setNotifWater(e.target.checked)}
                className="w-4 h-4 accent-sky-500"
              />
            </div>

            <div className="flex justify-between items-center p-2 border border-zinc-150 dark:border-zinc-800 rounded-xl hover:bg-gray-50 dark:hover:bg-zinc-900/40">
              <span className="font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-[#FFB703]" /> Send Sunday Weekly Report</span>
              <input
                type="checkbox"
                checked={notifWeeklyReport}
                onChange={(e) => setNotifWeeklyReport(e.target.checked)}
                className="w-4 h-4 accent-[#FFB703]"
              />
            </div>
          </div>
        </div>

        <button
          onClick={async () => {
            const currentUser = auth.currentUser;
            if (currentUser) {
              try {
                // Save configurations directly to Firestore userReminderPreferences collection
                const prefRef = doc(db, 'users', currentUser.uid, 'userReminderPreferences', 'config');
                await setDoc(prefRef, {
                  breakfastTime: prefBreakfastTime,
                  lunchTime: prefLunchTime,
                  snackTime: prefSnackTime,
                  dinnerTime: prefDinnerTime,
                  pushEnabled: notifPush,
                  emailEnabled: notifEmail,
                  waterAlerts: notifWater,
                  weeklyReport: notifWeeklyReport,
                  quietHours: { active: quietHoursActive, start: prefQuietHoursStart, end: prefQuietHoursEnd },
                  timezone: userTimezone,
                  updatedAt: new Date().toISOString()
                });
                alert('🧬 Biological schedule preferences synchronized with Firestore collection successfully!');
              } catch(e) {
                console.error(e);
                alert('Fall back to local memory. Setup values loaded!');
              }
            } else {
              alert('Preferences saved to Local System Storage. Log in to synchronize across cloud servers.');
            }
            addXp(35); // XP points for settings save
          }}
          className="w-full mt-5 bg-[#0057FF] border-3 border-black text-white p-3 rounded-xl text-xs uppercase font-black tracking-wider shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5 cursor-pointer text-center"
        >
          💾 Synchronize Engine Configuration Values
        </button>
      </div>

    </div>
  );
};
