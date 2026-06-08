/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MealPhase } from '../types';

export const mealPhases: MealPhase[] = [
  {
    id: 'phase_1',
    title: 'THE IGNITION SEQUENCE',
    timeSlot: '07:30–08:30',
    goal: 'Protein Iron Biotin',
    options: [
      {
        id: 'egg_protocol',
        name: 'Egg Protocol',
        nutritionLabel: 'Protein Biotin Vitamin D Iron',
        ingredients: ['4 Eggs', 'Murungai Keerai (Moringa Leaf)', 'Black Pepper'],
        nutrition: {
          protein: 26,
          carbs: 2,
          fat: 20,
          fiber: 3,
          iron: 8.5,
          zinc: 6.2,
          biotin: 45,
          vitaminD: 180,
          vitaminC: 15,
          magnesium: 40,
          calories: 290,
          hairGrowthScore: 9.5,
          inflammationScore: 8.8,
          glycemicImpact: 'Low',
          recoveryImpact: 'Follicular Proliferation & Stem Cell Activation'
        }
      },
      {
        id: 'pesarattu',
        name: 'Pesarattu (Green Gram Dosa)',
        nutritionLabel: 'Protein Fiber Iron',
        ingredients: ['Sprouted Green Gram', 'Sesame Oil', 'Peanut Garlic Chutney'],
        nutrition: {
          protein: 18,
          carbs: 38,
          fat: 12,
          fiber: 9,
          iron: 6.2,
          zinc: 4.1,
          biotin: 22,
          vitaminD: 0,
          vitaminC: 8,
          magnesium: 95,
          calories: 330,
          hairGrowthScore: 8.4,
          inflammationScore: 7.9,
          glycemicImpact: 'Low',
          recoveryImpact: 'Keratinogenesis Support & Scalp Microcirculation'
        }
      },
      {
        id: 'millet_infra',
        name: 'Millet Infrastructure',
        nutritionLabel: 'Calcium Fiber Antioxidants',
        ingredients: ['Kambu (Pearl Millet) Dosa', 'Ragi (Finger Millet) Dosa', 'Mint Chutney', 'Coriander Chutney'],
        nutrition: {
          protein: 14,
          carbs: 45,
          fat: 8,
          fiber: 12,
          iron: 7.8,
          zinc: 5.0,
          biotin: 15,
          vitaminD: 0,
          vitaminC: 22,
          magnesium: 160,
          calories: 310,
          hairGrowthScore: 8.9,
          inflammationScore: 9.0,
          glycemicImpact: 'Low',
          recoveryImpact: 'Calcified Elasticity & Follicle Defense'
        }
      },
      {
        id: 'sprout_bowl',
        name: 'Sprout Bowl',
        nutritionLabel: 'Vitamin C Iron Fiber',
        ingredients: ['Green Gram Sprouts', 'Fresh Lemon Juice', 'Mustard Tempering'],
        nutrition: {
          protein: 15,
          carbs: 30,
          fat: 4,
          fiber: 10,
          iron: 5.8,
          zinc: 3.5,
          biotin: 18,
          vitaminD: 0,
          vitaminC: 45,
          magnesium: 80,
          calories: 210,
          hairGrowthScore: 8.0,
          inflammationScore: 8.5,
          glycemicImpact: 'Low',
          recoveryImpact: 'Free-Radical Quenching & Collagen Integration'
        }
      }
    ]
  },
  {
    id: 'phase_2',
    title: 'SUSTAINED PAYLOAD',
    timeSlot: '13:00–14:00',
    goal: 'Zinc Carbs Glycemic Guard',
    options: [
      {
        id: 'payload_chicken',
        name: 'Country Chicken & Matta Rice',
        nutritionLabel: 'Premium Iron Protein Zinc Complex',
        ingredients: ['Country Chicken Curry', 'Red Matta Rice', 'Keerai (Amaranth Spinach)', 'Kothavarangai (Cluster Beans)'],
        nutrition: {
          protein: 42,
          carbs: 48,
          fat: 14,
          fiber: 8,
          iron: 9.5,
          zinc: 8.2,
          biotin: 25,
          vitaminD: 50,
          vitaminC: 35,
          magnesium: 110,
          calories: 490,
          hairGrowthScore: 9.8,
          inflammationScore: 8.2,
          glycemicImpact: 'Medium',
          recoveryImpact: 'Anagen Elongation & Cellular Reconstruction'
        }
      },
      {
        id: 'payload_fish',
        name: 'Vessel-Seared Fish & Kavuni Rice',
        nutritionLabel: 'Omega-3 Collagen Peptide Booster',
        ingredients: ['Seared Salmon/Seer Fish', 'Karuppu Kavuni (Black Rice)', 'Avarakkai (Broad Beans)', 'Pavakkai (Bitter gourd fry)'],
        nutrition: {
          protein: 38,
          carbs: 40,
          fat: 18,
          fiber: 11,
          iron: 8.8,
          zinc: 7.5,
          biotin: 32,
          vitaminD: 240,
          vitaminC: 28,
          magnesium: 140,
          calories: 470,
          hairGrowthScore: 9.9,
          inflammationScore: 9.6,
          glycemicImpact: 'Low',
          recoveryImpact: 'Dermal Papilla Regeneration & Sebum Balance'
        }
      },
      {
        id: 'payload_soy_rajma',
        name: 'Zesty Rajma-Soya & Thinai Pilaf',
        nutritionLabel: 'Vegetarian Riboflavin & Biotin Guard',
        ingredients: ['Rajma Curry', 'Soya Chunks', 'Thinai (Foxtail Millet)', 'Keerai Kootu'],
        nutrition: {
          protein: 32,
          carbs: 52,
          fat: 6,
          fiber: 14,
          iron: 10.5,
          zinc: 6.8,
          biotin: 30,
          vitaminD: 0,
          vitaminC: 30,
          magnesium: 125,
          calories: 390,
          hairGrowthScore: 9.2,
          inflammationScore: 8.9,
          glycemicImpact: 'Low',
          recoveryImpact: 'Fibrous Anchor Reconstruction & Scalp Calming'
        }
      },
      {
        id: 'payload_veggie_karamani',
        name: 'Varagu-Karamani Core Plate',
        nutritionLabel: 'Manganese & Folate Rich Nourish',
        ingredients: ['Varagu (Kodo Millet)', 'Karamani (Black-eyed peas Masala)', 'Pavakkai (Bitter Gourd)', 'Kothavarangai'],
        nutrition: {
          protein: 24,
          carbs: 58,
          fat: 5,
          fiber: 15,
          iron: 8.2,
          zinc: 5.9,
          biotin: 20,
          vitaminD: 0,
          vitaminC: 40,
          magnesium: 135,
          calories: 375,
          hairGrowthScore: 8.7,
          inflammationScore: 8.6,
          glycemicImpact: 'Low',
          recoveryImpact: 'Microbiome Optimization & Antioxidant Blast'
        }
      }
    ]
  },
  {
    id: 'phase_3',
    title: 'CIRCULATORY BRIDGE',
    timeSlot: '17:00–17:30',
    goal: 'DHT-Support Snacks & Hydration',
    options: [
      {
        id: 'sundal_seed_mix',
        name: 'Black Chickpea Sundal & Pumpkin Power-Mix',
        nutritionLabel: 'Natural DHT Blockers & Plant Sterols',
        ingredients: ['Black Chickpea Sundal', 'Mochai Sundal', 'Pumpkin Seeds', 'Sunflower Seeds'],
        nutrition: {
          protein: 16,
          carbs: 22,
          fat: 14,
          fiber: 8,
          iron: 5.4,
          zinc: 9.8,
          biotin: 12,
          vitaminD: 0,
          vitaminC: 5,
          magnesium: 190,
          calories: 270,
          hairGrowthScore: 9.7,
          inflammationScore: 9.2,
          glycemicImpact: 'Low',
          recoveryImpact: '5-Alpha-Reductase Enzyme Inhibition & Root Strength'
        }
      },
      {
        id: 'almond_makhana',
        name: 'Omega Almonds & Roasted Makhana',
        nutritionLabel: 'Vitamin E & Magnesium Shield',
        ingredients: ['Soaked Almonds', 'Roasted Makhana (Fox Nuts) in Ghee', 'Flaxseed Dust'],
        nutrition: {
          protein: 10,
          carbs: 18,
          fat: 16,
          fiber: 6,
          iron: 3.2,
          zinc: 4.8,
          biotin: 15,
          vitaminD: 0,
          vitaminC: 2,
          magnesium: 150,
          calories: 250,
          hairGrowthScore: 9.1,
          inflammationScore: 9.4,
          glycemicImpact: 'Low',
          recoveryImpact: 'Oxidative Stress Abatement & Hair Shaft Polishing'
        }
      }
    ]
  },
  {
    id: 'phase_4',
    title: 'METABOLIC SHUTDOWN',
    timeSlot: '19:30–20:30',
    goal: 'Overnight Healing Amino Acids',
    options: [
      {
        id: 'bone_mutton_rib',
        name: 'Mutton Rib Soup & Bone Broth',
        nutritionLabel: 'Pure Collagen, Zinc & Recovery Aminos',
        ingredients: ['Mutton Rib Soup', 'Slow-Simmered Bone Broth', 'Murungai (Moringa) Leaves'],
        nutrition: {
          protein: 34,
          carbs: 4,
          fat: 12,
          fiber: 2,
          iron: 11.2,
          zinc: 10.5,
          biotin: 8,
          vitaminD: 120,
          vitaminC: 24,
          magnesium: 75,
          calories: 260,
          hairGrowthScore: 9.9,
          inflammationScore: 9.5,
          glycemicImpact: 'Low',
          recoveryImpact: 'Follicular Matrix Reconstruction & Growth Hormone Boost'
        }
      },
      {
        id: 'egg_salad_shredded',
        name: 'Egg Salad & Shredded Chicken Soup',
        nutritionLabel: 'Sulphur-Rich Biotin Guard',
        ingredients: ['Shredded Chicken Breast', '2 Soft-Boiled Eggs', 'Mushroom broth'],
        nutrition: {
          protein: 38,
          carbs: 3,
          fat: 11,
          fiber: 1,
          iron: 7.2,
          zinc: 6.9,
          biotin: 28,
          vitaminD: 80,
          vitaminC: 3,
          magnesium: 45,
          calories: 270,
          hairGrowthScore: 9.3,
          inflammationScore: 8.7,
          glycemicImpact: 'Low',
          recoveryImpact: 'Keratin Sulfide Bond Construction'
        }
      },
      {
        id: 'paneer_tofu_mush',
        name: 'Gilded Paneer/Tofu Mushroom Broth',
        nutritionLabel: 'Zinc-Rich Plant Protein Sleep Shield',
        ingredients: ['Pan-seared Tofu or Paneer', 'Mushroom Soup', 'Murungai Soup', 'Spices'],
        nutrition: {
          protein: 28,
          carbs: 8,
          fat: 16,
          fiber: 4,
          iron: 6.8,
          zinc: 7.2,
          biotin: 14,
          vitaminD: 150,
          vitaminC: 18,
          magnesium: 90,
          calories: 290,
          hairGrowthScore: 9.2,
          inflammationScore: 9.1,
          glycemicImpact: 'Low',
          recoveryImpact: 'Melatonin Synergy & Nighttime Scalp Detoxification'
        }
      }
    ]
  }
];

export const mockInitialDailyLogs = (todayStr: string): { [date: string]: any } => {
  // Let's seed a few days of history so our calendar heatmaps and charts look breathtaking instantly!
  const offsetDateStr = (days: number) => {
    const d = new Date(todayStr);
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
  };

  const db: { [date: string]: any } = {};

  // Completed Perfect Days (Completed all meals, great scores)
  for (let i = 1; i <= 10; i++) {
    const dStr = offsetDateStr(i);
    // Let's skip some days or make some partially completed
    if (i === 3) {
      // Missed completely (Red)
      db[dStr] = {
        date: dStr,
        meals: {
          phase_1: { completed: false, skipped: true, replaced: false, replacedWithId: null, notes: 'Traveling', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_2: { completed: false, skipped: true, replaced: false, replacedWithId: null, notes: 'No clean options found', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_3: { completed: false, skipped: true, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_4: { completed: false, skipped: true, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null }
        },
        waterIntake: 800,
        sleepDuration: 5.5
      };
    } else if (i === 6 || i === 7) {
      // Partially completed (Yellow)
      db[dStr] = {
        date: dStr,
        meals: {
          phase_1: { completed: true, skipped: false, replaced: false, replacedWithId: 'egg_protocol', notes: 'Energized morning', photo: null, moodAfterMeal: 4, energyAfterMeal: 5, scalpCondition: 'Normal', hairSheddingLevel: 'Low' },
          phase_2: { completed: true, skipped: false, replaced: false, replacedWithId: 'payload_chicken', notes: 'Great lunch', photo: null, moodAfterMeal: 4, energyAfterMeal: 4, scalpCondition: 'Normal', hairSheddingLevel: 'Low' },
          phase_3: { completed: false, skipped: true, replaced: false, replacedWithId: null, notes: 'Missed snack', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
          phase_4: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null }
        },
        waterIntake: 1800,
        sleepDuration: 6.5
      };
    } else {
      // Full perfect days (Blue or Green)
      db[dStr] = {
        date: dStr,
        meals: {
          phase_1: { completed: true, skipped: false, replaced: false, replacedWithId: 'egg_protocol', notes: 'Perfect egg sequence', photo: null, moodAfterMeal: 5, energyAfterMeal: 5, scalpCondition: 'Normal', hairSheddingLevel: 'None' },
          phase_2: { completed: true, skipped: false, replaced: false, replacedWithId: 'payload_fish', notes: 'Loving black Kavuni rice', photo: null, moodAfterMeal: 5, energyAfterMeal: 5, scalpCondition: 'Normal', hairSheddingLevel: 'None' },
          phase_3: { completed: true, skipped: false, replaced: false, replacedWithId: 'sundal_seed_mix', notes: 'Crunchy seeds are satisfying', photo: null, moodAfterMeal: 4, energyAfterMeal: 5, scalpCondition: 'Normal', hairSheddingLevel: 'Normal' },
          phase_4: { completed: true, skipped: false, replaced: false, replacedWithId: 'bone_mutton_rib', notes: 'Healing mutton soup', photo: null, moodAfterMeal: 5, energyAfterMeal: 5, scalpCondition: 'Normal', hairSheddingLevel: 'None' }
        },
        waterIntake: 3200,
        sleepDuration: 8.0
      };
    }
  }

  // Active today starts blank or partially finished!
  db[todayStr] = {
    date: todayStr,
    meals: {
      phase_1: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
      phase_2: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
      phase_3: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null },
      phase_4: { completed: false, skipped: false, replaced: false, replacedWithId: null, notes: '', photo: null, moodAfterMeal: null, energyAfterMeal: null, scalpCondition: null, hairSheddingLevel: null }
    },
    waterIntake: 500, // already had a glass
    sleepDuration: 7.5
  };

  return db;
};
