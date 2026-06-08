/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHER = 'Other',
}

export enum HairConcern {
  HAIR_FALL = 'Hair Fall',
  THINNING = 'Thinning',
  DANDRUFF = 'Dandruff',
  RECEDING_HAIRLINE = 'Receding Hairline',
  SLOW_GROWTH = 'Slow Growth',
  PREMATURE_GREYING = 'Premature Greying',
}

export enum Lifestyle {
  VEGETARIAN = 'Vegetarian',
  EGGETARIAN = 'Eggetarian',
  NON_VEGETARIAN = 'Non-Vegetarian',
}

export enum ScalpCondition {
  DRY = 'Dry',
  NORMAL = 'Normal',
  OILY = 'Oily',
  ITCHY = 'Itchy',
  FLAKY = 'Flaky',
}

export enum HairSheddingLevel {
  NONE = 'None',
  NORMAL = 'Normal',
  HIGH = 'High',
}

export enum StressLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum ExerciseFrequency {
  DAILY = 'Daily',
  THREE_TIMES_A_WEEK = '3x a week',
  RARELY = 'Rarely',
}

export interface OnboardingData {
  age: number;
  gender: Gender;
  height: number;
  weight: number;
  selectedConcerns: HairConcern[];
  lifestyle: Lifestyle;
  waterIntakeTarget: number; // in ml
  sleepTarget: number; // in hours
  stressLevel: StressLevel;
  exerciseFrequency: ExerciseFrequency;
}

export interface NutrientProfile {
  protein: number;       // grams
  carbs: number;         // grams
  fat: number;           // grams
  fiber: number;         // grams
  iron: number;          // mg
  zinc: number;          // mg
  biotin: number;        // mcg
  vitaminD: number;      // IU
  vitaminC: number;      // mg
  magnesium: number;     // mg
  calories: number;      // kcal
  hairGrowthScore: number; // 1-10
  inflammationScore: number; // 1-10 (lower is better, or higher is protective - let's treat as protective, or standard rating)
  glycemicImpact: 'Low' | 'Medium' | 'High';
  recoveryImpact: string; // e.g., "DHT Block", "Follicle Reactivation"
}

export interface MealOption {
  id: string;
  name: string;
  nutritionLabel: string; // e.g. "Protein Biotin Vitamin D Iron"
  ingredients: string[];
  nutrition: NutrientProfile;
}

export interface MealPhase {
  id: string;
  title: string;
  timeSlot: string;
  goal: string;
  options: MealOption[];
}

export interface MealLogState {
  completed: boolean;
  skipped: boolean;
  replaced: boolean;
  replacedWithId: string | null;
  notes: string;
  photo: string | null; // Base64 string or visual asset url
  moodAfterMeal: number | null; // 1-5 scale
  energyAfterMeal: number | null; // 1-5 scale
  scalpCondition: ScalpCondition | null;
  hairSheddingLevel: HairSheddingLevel | null;
}

export interface HairProtocolState {
  morningWater?: boolean;
  sunlight?: boolean;
  scalpMassage?: boolean;
  rosemaryOiling?: boolean;
  stressControl?: boolean;
  neckMobility?: boolean;
  silkPillowcase?: boolean;
  deepMassage?: boolean;
  scalpCheck?: 'Comfortable' | 'Oily' | 'Dry' | 'Itchy' | '';
  lastWashDate?: string;
  weeklyWashCount?: number;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  meals: { [phaseId: string]: MealLogState };
  waterIntake: number; // in ml
  sleepDuration: number; // in hours
  hairProtocol?: HairProtocolState;
}

export interface HairHealthMetrics {
  hairFall: number; // 1-5
  density: number; // 1-5
  dandruffStatus: 'None' | 'Light' | 'Medium' | 'Severe';
  growthRate: number; // 1-5
  scalpItching: 'None' | 'Light' | 'High';
}

export interface HairPhotoRecord {
  id: string;
  date: string;
  photoUrl: string;
  metrics: HairHealthMetrics;
}

export interface Badge {
  id: string;
  name: string;
  requirement: string;
  unlockedAt: string | null;
}
