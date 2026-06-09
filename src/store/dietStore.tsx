/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  OnboardingData, DailyLog, HairPhotoRecord, Badge, 
  Gender, HairConcern, Lifestyle, StressLevel, ExerciseFrequency,
  ScalpCondition, HairSheddingLevel, HairProtocolState
} from '../types';
import { mealPhases, mockInitialDailyLogs } from '../data/protocol';
import { 
  db, 
  auth, 
  initAuth, 
  googleSignIn as firebaseSignIn, 
  logout as firebaseLogout, 
  getAccessToken,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface Challenge {
  id: string;
  name: string;
  description: string;
  target: number;
  current: number;
  rewardXp: number;
  completed: boolean;
  type: 'iron' | 'hydration' | 'protein' | 'perfect_day';
}

interface ScoreCalculation {
  proteinCompliance: number;
  ironCompliance: number;
  hydrationCompliance: number;
  hairHealthCompliance: number;
  dietAdherence: number;
  dailyScore: number;
}

interface DietContextType {
  onboarding: OnboardingData | null;
  dailyLogs: { [date: string]: DailyLog };
  hairPhotos: HairPhotoRecord[];
  badges: Badge[];
  currentDateStr: string;
  isDarkMode: boolean;
  streakCount: number;
  activeTab: string;
  isOnboarded: boolean;
  
  // Firebase Auth Connection State
  user: User | null;
  accessToken: string | null;
  authLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;

  // Gamified XP / Challenges System
  xp: number;
  addXp: (amount: number) => void;
  challenges: Challenge[];
  completeChallenge: (challengeId: string) => void;
  getLevelInfo: () => { level: number; title: string; minXp: number; maxXp: number; progressPercent: number };
  
  // Setters/mutations
  setOnboarded: (data: OnboardingData) => void;
  resetOnboarding: () => void;
  setCurrentDate: (dateStr: string) => void;
  setTab: (tab: string) => void;
  toggleTheme: () => void;
  
  // Hydration tracking
  addWater: (amount: number) => void;
  setWater: (amount: number) => void;
  
  // Meal Tracking
  toggleMealCompletion: (phaseId: string, mealId: string) => void;
  skipMeal: (phaseId: string) => void;
  replaceMeal: (phaseId: string, newMealId: string) => void;
  updateMealNotes: (phaseId: string, notes: string) => void;
  updateMealReview: (
    phaseId: string, 
    mood: number, 
    energy: number, 
    scalp: ScalpCondition, 
    shedding: HairSheddingLevel
  ) => void;
  
  // Hair Dashboard
  updateHairProtocol: (protocol: Partial<HairProtocolState>) => void;
  addHairPhoto: (photoBase64: string, hairFall: number, density: number, dandruff: 'None'|'Light'|'Medium'|'Severe', growth: number, itching: 'None'|'Light'|'High') => void;
  deleteHairPhoto: (id: string) => void;
  
  // Live analytics getters
  calculateScoresForDate: (dateStr: string) => ScoreCalculation;
  getWeeklyAverage: () => number;
  getMonthlyAverage: () => number;
  getOverallRating: (score: number) => string;
}

const DietContext = createContext<DietContextType | undefined>(undefined);

const INITIAL_BADGES: Badge[] = [
  { id: 'apprentice', name: 'Hair Apprentice', requirement: 'Complete a 3-Day streak', unlockedAt: null },
  { id: 'guardian', name: 'Scalp Guardian', requirement: 'Complete a 7-Day streak', unlockedAt: null },
  { id: 'warrior', name: 'Follicle Warrior', requirement: 'Complete a 15-Day streak', unlockedAt: null },
  { id: 'architect', name: 'Hair Architect', requirement: 'Complete a 30-Day streak', unlockedAt: null },
  { id: 'commander', name: 'Growth Commander', requirement: 'Complete a 60-Day streak', unlockedAt: null },
  { id: 'legend', name: 'Follicle Legend', requirement: 'Complete a 90-Day streak', unlockedAt: null },
];

export const DietProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDateStr, setCurrentDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [isOnboarded, setIsOnboardedState] = useState<boolean>(false);
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null);
  const [dailyLogs, setDailyLogs] = useState<{ [date: string]: DailyLog }>({});
  const [hairPhotos, setHairPhotos] = useState<HairPhotoRecord[]>([]);
  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [activeTab, setTab] = useState<string>('dashboard');

  // Firebase auth & token mapping
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Gamified Engine state
  const [xp, setXp] = useState<number>(1250); 
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: 'iron_warrior',
      name: 'Iron Warrior',
      description: 'Consume Iron target (15mg) 15 Days',
      target: 15,
      current: 4,
      rewardXp: 500,
      completed: false,
      type: 'iron'
    },
    {
      id: 'hydration_commander',
      name: 'Hydration Commander',
      description: 'Meet 3L hydration target 7 Days straight',
      target: 7,
      current: 3,
      rewardXp: 300,
      completed: false,
      type: 'hydration'
    },
    {
      id: 'protein_titan',
      name: 'Protein Titan',
      description: 'Meet full daily amino acid needs 10 Days',
      target: 10,
      current: 5,
      rewardXp: 400,
      completed: false,
      type: 'protein'
    },
    {
      id: 'perfect_mission',
      name: 'Perfect Mission',
      description: 'Hit perfect 90%+ compliance day',
      target: 1,
      current: 0,
      rewardXp: 250,
      completed: false,
      type: 'perfect_day'
    }
  ]);

  // Auth subscriber on load
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, token) => {
        setUser(currentUser);
        setToken(token);
        setAuthLoading(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setAuthLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Offline or Anonymous Load Stage
  useEffect(() => {
    if (user) return; // Managed exclusively by real-time snapshot listener when online

    try {
      const storedOnboarding = localStorage.getItem('dietmani_onboarding');
      const storedLogs = localStorage.getItem('dietmani_logs');
      const storedPhotos = localStorage.getItem('dietmani_photos');
      const storedBadges = localStorage.getItem('dietmani_badges');
      const storedDarkMode = localStorage.getItem('dietmani_darkmode');
      const storedXp = localStorage.getItem('dietmani_xp');
      const storedChallenges = localStorage.getItem('dietmani_challenges');

      if (storedOnboarding) {
        setOnboarding(JSON.parse(storedOnboarding));
        setIsOnboardedState(true);
      } else {
        setOnboarding(null);
        setIsOnboardedState(false);
      }

      if (storedXp) {
        setXp(parseInt(storedXp));
      } else {
        setXp(1250);
      }

      if (storedChallenges) {
        setChallenges(JSON.parse(storedChallenges));
      }
      
      if (storedLogs) {
        setDailyLogs(JSON.parse(storedLogs));
      } else {
        const initial = mockInitialDailyLogs(currentDateStr);
        setDailyLogs(initial);
        localStorage.setItem('dietmani_logs', JSON.stringify(initial));
      }

      if (storedPhotos) {
        setHairPhotos(JSON.parse(storedPhotos));
      } else {
        const seededPhotos: HairPhotoRecord[] = [
          {
            id: 'seeded_1',
            date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            photoUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=85',
            metrics: { hairFall: 4, density: 2, dandruffStatus: 'Severe', growthRate: 1, scalpItching: 'High' }
          },
          {
            id: 'seeded_2',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            photoUrl: 'https://images.unsplash.com/photo-1522337060762-efb37f7822b8?w=400&q=85',
            metrics: { hairFall: 2, density: 3, dandruffStatus: 'Light', growthRate: 3, scalpItching: 'Light' }
          }
        ];
        setHairPhotos(seededPhotos);
        localStorage.setItem('dietmani_photos', JSON.stringify(seededPhotos));
      }

      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      } else {
        setBadges(INITIAL_BADGES);
      }

      if (storedDarkMode) {
        setIsDarkMode(storedDarkMode === 'true');
      }
    } catch (e) {
      console.error('Error reading localStorage', e);
    }
  }, [user, currentDateStr]);

  // Online Cloud Connection & Real-time Mirroring
  useEffect(() => {
    if (!user) return;

    // Test server-side availability on startup
    async function testConnectionOnLoad() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if(error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration or network status.");
        }
      }
    }
    testConnectionOnLoad();

    const syncExistingData = async () => {
      const userDocRef = doc(db, 'users', user.uid);
      try {
        const userSnap = await getDoc(userDocRef);
        if (!userSnap.exists()) {
          // Initialize user profile document on cloud with local cached state
          await setDoc(userDocRef, {
            uid: user.uid,
            xp,
            challenges,
            badges,
            onboarding,
            updatedAt: new Date().toISOString()
          });

          // Upload all dailyLogs to Cloud subcollections
          for (const [date, log] of Object.entries(dailyLogs)) {
            await setDoc(doc(db, 'users', user.uid, 'dailyLogs', date), {
              ...(log as any),
              updatedAt: new Date().toISOString()
            });
          }

          // Upload any custom hair photo progress metrics to Cloud
          for (const photo of hairPhotos) {
            await setDoc(doc(db, 'users', user.uid, 'hairPhotos', photo.id), {
              ...(photo as any),
              updatedAt: new Date().toISOString()
            });
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
      }
    };

    syncExistingData();

    // Attach listeners to synchronize Firestore with React state
    const unsubscribeUser = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.onboarding) {
          setOnboarding(data.onboarding);
          setIsOnboardedState(true);
        } else {
          setOnboarding(null);
          setIsOnboardedState(false);
        }
        if (typeof data.xp === 'number') setXp(data.xp);
        if (data.challenges) setChallenges(data.challenges);
        if (data.badges) setBadges(data.badges);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    const unsubscribeLogs = onSnapshot(collection(db, 'users', user.uid, 'dailyLogs'), (snapshot) => {
      const fetchedLogs: { [date: string]: DailyLog } = {};
      snapshot.forEach((doc) => {
        fetchedLogs[doc.id] = doc.data() as DailyLog;
      });
      setDailyLogs(fetchedLogs);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/dailyLogs`);
    });

    const unsubscribePhotos = onSnapshot(collection(db, 'users', user.uid, 'hairPhotos'), (snapshot) => {
      const fetchedPhotos: HairPhotoRecord[] = [];
      snapshot.forEach((doc) => {
        fetchedPhotos.push(doc.data() as HairPhotoRecord);
      });
      fetchedPhotos.sort((a, b) => b.date.localeCompare(a.date));
      setHairPhotos(fetchedPhotos);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/hairPhotos`);
    });

    return () => {
      unsubscribeUser();
      unsubscribeLogs();
      unsubscribePhotos();
    };
  }, [user]);

  // Recalculate streak and badges whenever logs update
  useEffect(() => {
    if (Object.keys(dailyLogs).length === 0) return;

    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const log = dailyLogs[dateStr];
      if (!log) {
        if (dateStr === new Date().toISOString().split('T')[0]) {
          checkDate.setDate(checkDate.getDate() - 1);
          continue;
        }
        break;
      }
      
      const scores = calculateScoresForDate(dateStr);
      if (scores.dailyScore >= 75) {
        streak++;
      } else {
        if (dateStr !== new Date().toISOString().split('T')[0]) {
          break;
        }
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }
    setStreakCount(streak);

    // Badge achievements engine
    let badgesUpdated = false;
    const newBadges = badges.map(badge => {
      if (badge.unlockedAt) return badge;
      
      let eligible = false;
      if (badge.id === 'apprentice' && streak >= 3) eligible = true;
      if (badge.id === 'guardian' && streak >= 7) eligible = true;
      if (badge.id === 'warrior' && streak >= 15) eligible = true;
      if (badge.id === 'architect' && streak >= 30) eligible = true;
      if (badge.id === 'commander' && streak >= 60) eligible = true;
      if (badge.id === 'legend' && streak >= 90) eligible = true;
      
      if (eligible) {
        badgesUpdated = true;
        return { ...badge, unlockedAt: new Date().toLocaleDateString() };
      }
      return badge;
    });

    if (badgesUpdated) {
      setBadges(newBadges);
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          badges: newBadges,
          updatedAt: new Date().toISOString()
        }, { merge: true }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        });
      } else {
        localStorage.setItem('dietmani_badges', JSON.stringify(newBadges));
      }
    }
  }, [dailyLogs]);

  // Handle SignIn authentication event
  const signIn = async () => {
    try {
      const result = await firebaseSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
      }
    } catch (err) {
      console.error('Workspace Signin failed:', err);
    }
  };

  // Handle Logout event
  const signOut = async () => {
    try {
      await firebaseLogout();
      setUser(null);
      setToken(null);
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  // Setters/mutations
  const setOnboarded = async (data: OnboardingData) => {
    setOnboarding(data);
    setIsOnboardedState(true);
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          xp,
          challenges,
          badges,
          onboarding: data,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      localStorage.setItem('dietmani_onboarding', JSON.stringify(data));
    }
  };

  const resetOnboarding = async () => {
    // ── 1. Wipe every localStorage key the app uses ──
    const KEYS = [
      'dietmani_onboarding',
      'dietmani_logs',
      'dietmani_photos',
      'dietmani_badges',
      'dietmani_xp',
      'dietmani_challenges',
    ];
    KEYS.forEach(k => localStorage.removeItem(k));
    // Keep dark mode preference — only data reset

    // ── 2. Reset ALL in-memory React state to factory defaults ──
    setOnboarding(null);
    setIsOnboardedState(false);
    setDailyLogs({});
    setHairPhotos([]);
    setBadges(INITIAL_BADGES);
    setXp(0);
    setStreakCount(0);
    setChallenges([
      { id: 'iron_warrior',       name: 'Iron Warrior',       description: 'Consume Iron target (15mg) 15 Days',    target: 15, current: 0, rewardXp: 500, completed: false, type: 'iron'       },
      { id: 'hydration_commander',name: 'Hydration Commander', description: 'Meet 3L hydration target 7 Days straight',target: 7, current: 0, rewardXp: 300, completed: false, type: 'hydration'  },
      { id: 'protein_titan',      name: 'Protein Titan',      description: 'Meet full daily amino acid needs 10 Days', target: 10, current: 0, rewardXp: 400, completed: false, type: 'protein'   },
      { id: 'perfect_mission',    name: 'Perfect Mission',    description: 'Hit perfect 90%+ compliance day',         target: 1,  current: 0, rewardXp: 250, completed: false, type: 'perfect_day'},
    ]);

    // ── 3. If signed in: wipe Firestore user doc + all dailyLogs ──
    if (user) {
      try {
        // Overwrite root user document with blank slate
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          onboarding: null,
          xp: 0,
          challenges: [],
          badges: [],
          updatedAt: new Date().toISOString(),
          resetAt: new Date().toISOString(),
        });

        // Delete all logs in dailyLogs subcollection via snapshot
        const { getDocs } = await import('firebase/firestore');
        const logsSnap = await getDocs(collection(db, 'users', user.uid, 'dailyLogs'));
        const deletes = logsSnap.docs.map(d => deleteDoc(d.ref));
        await Promise.all(deletes);

        console.log(`[Factory Reset] Wiped ${logsSnap.size} Firestore log documents.`);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    }

    console.log('[Factory Reset] ✅ All data wiped. App returning to onboarding.');
  };


  const setCurrentDate = (dateStr: string) => {
    setCurrentDateStr(dateStr);
    
    if (!dailyLogs[dateStr]) {
      const newLog: DailyLog = {
        date: dateStr,
        meals: {
          phase_1: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_2: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_3: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_4: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null }
        },
        waterIntake: 0,
        sleepDuration: 8.0
      };
      saveOrUpdateDailyLog(dateStr, newLog, 0);
    }
  };

  const toggleTheme = () => {
    const val = !isDarkMode;
    setIsDarkMode(val);
    localStorage.setItem('dietmani_darkmode', String(val));
  };

  const saveOrUpdateDailyLog = async (dateStr: string, log: DailyLog, xpEarned: number = 0) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'dailyLogs', dateStr), {
          ...log,
          updatedAt: new Date().toISOString()
        });
        if (xpEarned > 0) {
          await setDoc(doc(db, 'users', user.uid), {
            xp: xp + xpEarned,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/dailyLogs/${dateStr}`);
      }
    } else {
      const updated = { ...dailyLogs, [dateStr]: log };
      setDailyLogs(updated);
      localStorage.setItem('dietmani_logs', JSON.stringify(updated));
      if (xpEarned > 0) {
        addXp(xpEarned);
      }
    }
  };

  const getOrCreateActiveLog = (): DailyLog => {
    if (dailyLogs[currentDateStr]) {
      return dailyLogs[currentDateStr];
    }
    return {
      date: currentDateStr,
      meals: {
        phase_1: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
        phase_2: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
        phase_3: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
        phase_4: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null }
      },
      waterIntake: 0,
      sleepDuration: 8.0
    };
  };

  const addWater = async (amount: number) => {
    const log = getOrCreateActiveLog();
    const updated = {
      ...log,
      waterIntake: Math.max(0, log.waterIntake + amount)
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, amount > 0 ? 10 : 0);
  };

  const setWater = async (amount: number) => {
    const log = getOrCreateActiveLog();
    const updated = {
      ...log,
      waterIntake: Math.max(0, amount)
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, 0);
  };

  const toggleMealCompletion = async (phaseId: string, mealId: string) => {
    const log = getOrCreateActiveLog();
    const phaseLog = log.meals[phaseId];
    const becameCompleted = !phaseLog.completed;
    
    const updated = {
      ...log,
      meals: {
        ...log.meals,
        [phaseId]: {
          ...phaseLog,
          completed: becameCompleted,
          skipped: false,
          replacedWithId: phaseLog.replacedWithId || mealId
        }
      }
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, becameCompleted ? 25 : 0);
  };

  const skipMeal = async (phaseId: string) => {
    const log = getOrCreateActiveLog();
    const phaseLog = log.meals[phaseId];
    
    const updated = {
      ...log,
      meals: {
        ...log.meals,
        [phaseId]: {
          ...phaseLog,
          skipped: !phaseLog.skipped,
          completed: false
        }
      }
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, 0);
  };

  const replaceMeal = async (phaseId: string, newMealId: string) => {
    const log = getOrCreateActiveLog();
    const phaseLog = log.meals[phaseId];
    
    const updated = {
      ...log,
      meals: {
        ...log.meals,
        [phaseId]: {
          ...phaseLog,
          replaced: true,
          replacedWithId: newMealId
        }
      }
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, 0);
  };

  const updateMealNotes = async (phaseId: string, notes: string) => {
    const log = getOrCreateActiveLog();
    const phaseLog = log.meals[phaseId];
    
    const updated = {
      ...log,
      meals: {
        ...log.meals,
        [phaseId]: {
          ...phaseLog,
          notes
        }
      }
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, 0);
  };

  const updateMealReview = async (
    phaseId: string, 
    mood: number, 
    energy: number, 
    scalp: ScalpCondition, 
    shedding: HairSheddingLevel
  ) => {
    const log = getOrCreateActiveLog();
    const phaseLog = log.meals[phaseId];
    
    const updated = {
      ...log,
      meals: {
        ...log.meals,
        [phaseId]: {
          ...phaseLog,
          moodAfterMeal: mood,
          energyAfterMeal: energy,
          scalpCondition: scalp,
          hairSheddingLevel: shedding
        }
      }
    };
    await saveOrUpdateDailyLog(currentDateStr, updated, 0);
  };
  
  const updateHairProtocol = async (protocolUpdate: Partial<HairProtocolState>) => {
    const log = getOrCreateActiveLog();
    const existingProtocol = log.hairProtocol || {};
    const updatedProtocol = {
      ...existingProtocol,
      ...protocolUpdate
    };
    const updatedLog = {
      ...log,
      hairProtocol: updatedProtocol
    };
    
    let xpReward = 0;
    // Award 20 XP for each new habit checked off
    Object.keys(protocolUpdate).forEach(key => {
      const k = key as keyof HairProtocolState;
      if (protocolUpdate[k] === true && existingProtocol[k] !== true) {
        xpReward += 20;
      }
    });

    await saveOrUpdateDailyLog(currentDateStr, updatedLog, xpReward);
  };

  const addHairPhoto = async (photoBase64: string, hairFall: number, density: number, dandruff: 'None'|'Light'|'Medium'|'Severe', growth: number, itching: 'None'|'Light'|'High') => {
    const photoId = 'hair_' + Date.now();
    const newRecord: HairPhotoRecord = {
      id: photoId,
      date: new Date().toISOString().split('T')[0],
      photoUrl: photoBase64,
      metrics: {
        hairFall,
        density,
        dandruffStatus: dandruff,
        growthRate: growth,
        scalpItching: itching
      }
    };
    
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid, 'hairPhotos', photoId), {
          ...newRecord,
          updatedAt: new Date().toISOString()
        });
        await setDoc(doc(db, 'users', user.uid), {
          xp: xp + 100,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}/hairPhotos/${photoId}`);
      }
    } else {
      const updated = [newRecord, ...hairPhotos];
      setHairPhotos(updated);
      localStorage.setItem('dietmani_photos', JSON.stringify(updated));
      addXp(100);
    }
  };

  const deleteHairPhoto = async (id: string) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'hairPhotos', id));
      } catch (e) {
        handleFirestoreError(e, OperationType.DELETE, `users/${user.uid}/hairPhotos/${id}`);
      }
    } else {
      const updated = hairPhotos.filter(p => p.id !== id);
      setHairPhotos(updated);
      localStorage.setItem('dietmani_photos', JSON.stringify(updated));
    }
  };

  const calculateScoresForDate = (dateStr: string): ScoreCalculation => {
    const log = dailyLogs[dateStr];
    if (!log) {
      return {
        proteinCompliance: 0,
        ironCompliance: 0,
        hydrationCompliance: 0,
        hairHealthCompliance: 0,
        dietAdherence: 0,
        dailyScore: 0,
      };
    }

    const targetProtein = onboarding?.weight ? onboarding.weight * 1.5 : 85; 
    const targetIron = 15; 
    const targetWater = onboarding?.waterIntakeTarget || 3000;
    const targetBiotin = 30; 
    const targetZinc = 8; 
    const targetVitaminD = 400; 

    let consumedProtein = 0;
    let consumedIron = 0;
    let consumedBiotin = 0;
    let consumedZinc = 0;
    let consumedVitaminD = 0;
    
    let loggedPhases = 0;
    let completedPhases = 0;

    mealPhases.forEach(phase => {
      const pLog = log.meals[phase.id];
      if (pLog) {
        if (!pLog.skipped) {
          loggedPhases++;
          if (pLog.completed) {
            completedPhases++;
            const selectedMealId = pLog.replacedWithId || phase.options[0].id;
            const mealOpt = phase.options.find(o => o.id === selectedMealId) || phase.options[0];
            
            consumedProtein += mealOpt.nutrition.protein;
            consumedIron += mealOpt.nutrition.iron;
            consumedBiotin += mealOpt.nutrition.biotin;
            consumedZinc += mealOpt.nutrition.zinc;
            consumedVitaminD += mealOpt.nutrition.vitaminD;
          }
        }
      }
    });

    const proteinComp = Math.min(100, Math.round((consumedProtein / targetProtein) * 100));
    const ironComp = Math.min(100, Math.round((consumedIron / targetIron) * 100));
    const hydComp = Math.min(100, Math.round((log.waterIntake / targetWater) * 100));
    
    const biotinScore = Math.min(100, (consumedBiotin / targetBiotin) * 100);
    const zincScore = Math.min(100, (consumedZinc / targetZinc) * 100);
    const dScore = Math.min(100, (consumedVitaminD / targetVitaminD) * 100);
    const hairHealthComp = Math.round((biotinScore + zincScore + dScore) / 3);

    const dietAdhere = loggedPhases > 0 ? Math.round((completedPhases / loggedPhases) * 100) : 0;

    const dailyScore = Math.round(
      (proteinComp * 0.3) + 
      (ironComp * 0.2) + 
      (hydComp * 0.25) + 
      (hairHealthComp * 0.25)
    );

    return {
      proteinCompliance: proteinComp,
      ironCompliance: ironComp,
      hydrationCompliance: hydComp,
      hairHealthCompliance: hairHealthComp,
      dietAdherence: dietAdhere,
      dailyScore
    };
  };

  const getWeeklyAverage = (): number => {
    const dates = Object.keys(dailyLogs).sort();
    if (dates.length === 0) return 0;
    
    const last7 = dates.slice(-7);
    const sum = last7.reduce((acc, d) => {
      const scores = calculateScoresForDate(d);
      return acc + scores.dailyScore;
    }, 0);
    return Math.round(sum / last7.length);
  };

  const getMonthlyAverage = (): number => {
    const dates = Object.keys(dailyLogs).sort();
    if (dates.length === 0) return 0;
    
    const last30 = dates.slice(-30);
    const sum = last30.reduce((acc, d) => {
      const scores = calculateScoresForDate(d);
      return acc + scores.dailyScore;
    }, 0);
    return Math.round(sum / last30.length);
  };

  const getOverallRating = (score: number): string => {
    if (score >= 90) return 'Excellent Follicle Support';
    if (score >= 70) return 'Optimized Met-Growth';
    if (score >= 50) return 'Moderate Cellular Build';
    return 'Needs Scalp Nourishment';
  };

  const addXp = async (amount: number) => {
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          xp: xp + amount,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      setXp((prev) => {
        const next = prev + amount;
        localStorage.setItem('dietmani_xp', String(next));
        return next;
      });
    }
  };

  const completeChallenge = async (challengeId: string) => {
    const updated = challenges.map(ch => {
      if (ch.id === challengeId && !ch.completed) {
        return { ...ch, completed: true, current: ch.target };
      }
      return ch;
    });

    const rewardXp = challenges.find(ch => ch.id === challengeId)?.rewardXp || 0;

    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          xp: xp + rewardXp,
          challenges: updated,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }
    } else {
      setChallenges(updated);
      localStorage.setItem('dietmani_challenges', JSON.stringify(updated));
      if (rewardXp > 0) {
        addXp(rewardXp);
      }
    }
  };

  const getLevelInfo = () => {
    const level = Math.floor(xp / 100) + 1;
    const minXp = (level - 1) * 100;
    const maxXp = level * 100;
    const progressPercent = Math.min(100, Math.floor(((xp - minXp) / 100) * 100));

    let title = 'Hair Apprentice';
    if (level >= 100) title = 'Follicle Legend';
    else if (level >= 50) title = 'Growth Commander';
    else if (level >= 20) title = 'Hair Architect';
    else if (level >= 10) title = 'Follicle Warrior';
    else if (level >= 5) title = 'Scalp Guardian';

    return {
      level,
      title,
      minXp,
      maxXp,
      progressPercent
    };
  };

  return (
    <DietContext.Provider value={{
      onboarding,
      dailyLogs,
      hairPhotos,
      badges,
      currentDateStr,
      isDarkMode,
      streakCount,
      activeTab,
      isOnboarded,
      xp,
      addXp,
      challenges,
      completeChallenge,
      getLevelInfo,
      setOnboarded,
      resetOnboarding,
      setCurrentDate,
      setTab,
      toggleTheme,
      addWater,
      setWater,
      toggleMealCompletion,
      skipMeal,
      replaceMeal,
      updateMealNotes,
      updateMealReview,
      updateHairProtocol,
      addHairPhoto,
      deleteHairPhoto,
      calculateScoresForDate,
      getWeeklyAverage,
      getMonthlyAverage,
      getOverallRating,
      user,
      accessToken,
      authLoading,
      signIn,
      signOut
    }}>
      {children}
    </DietContext.Provider>
  );
};

export const useDietStore = () => {
  const context = useContext(DietContext);
  if (!context) {
    throw new Error('useDietStore must be used within a DietProvider');
  }
  return context;
};
