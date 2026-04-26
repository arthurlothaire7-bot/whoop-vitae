import type { WhoopMetrics } from './whoop';

export interface Recipe {
    id: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    prepTime: number;
    tags: string[];
    category: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre-workout' | 'post-workout';
}

export interface NutritionPlan {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    recommendation: string;
    recipes: Recipe[];
}

const RECIPE_DATABASE: Recipe[] = [
  {
        id: 'r1',
        name: 'High-Protein Recovery Bowl',
        description: 'Quinoa, grilled chicken, and anti-inflammatory vegetables for optimal recovery.',
        calories: 520,
        protein: 45,
        carbs: 48,
        fats: 12,
        prepTime: 25,
        tags: ['high-protein', 'anti-inflammatory', 'recovery'],
        category: 'lunch',
  },
  {
        id: 'r2',
        name: 'Greek Yogurt Power Parfait',
        description: 'Greek yogurt with berries, granola, and honey for a balanced breakfast.',
        calories: 380,
        protein: 28,
        carbs: 52,
        fats: 6,
        prepTime: 5,
        tags: ['quick', 'high-protein', 'breakfast'],
        category: 'breakfast',
  },
  {
        id: 'r3',
        name: 'Salmon & Sweet Potato',
        description: 'Omega-3 rich salmon with roasted sweet potato for recovery and energy.',
        calories: 580,
        protein: 42,
        carbs: 55,
        fats: 18,
        prepTime: 35,
        tags: ['omega-3', 'recovery', 'high-protein'],
        category: 'dinner',
  },
  {
        id: 'r4',
        name: 'Pre-Workout Energy Smoothie',
        description: 'Banana, oats, and almond butter for sustained energy before training.',
        calories: 420,
        protein: 15,
        carbs: 68,
        fats: 11,
        prepTime: 5,
        tags: ['pre-workout', 'energy', 'quick'],
        category: 'pre-workout',
  },
  {
        id: 'r5',
        name: 'Post-Workout Protein Shake',
        description: 'Whey protein, banana, and spinach for rapid muscle recovery.',
        calories: 310,
        protein: 35,
        carbs: 32,
        fats: 4,
        prepTime: 3,
        tags: ['post-workout', 'high-protein', 'quick'],
        category: 'post-workout',
  },
  {
        id: 'r6',
        name: 'Sleep-Enhancing Tart Cherry Bowl',
        description: 'Tart cherries, walnuts, and cottage cheese to boost melatonin and sleep quality.',
        calories: 290,
        protein: 18,
        carbs: 35,
        fats: 10,
        prepTime: 5,
        tags: ['sleep', 'recovery', 'anti-inflammatory'],
        category: 'snack',
  },
  ];

export function getNutritionPlan(metrics: WhoopMetrics): NutritionPlan {
    const { recoveryScore, strain, sleepPerformance, caloriesBurned } = metrics;

    const baseCals = 2000;
    const activityMultiplier = 1 + strain / 21;
    const targetCalories = Math.round((baseCals + caloriesBurned * 0.3) * activityMultiplier);

    let proteinRatio = 0.30;
    let carbRatio = 0.45;
    let fatRatio = 0.25;

    if (recoveryScore >= 67) {
          carbRatio = 0.50;
          proteinRatio = 0.25;
    } else if (recoveryScore < 34) {
          proteinRatio = 0.35;
          carbRatio = 0.40;
    }

    const protein = Math.round((targetCalories * proteinRatio) / 4);
    const carbs = Math.round((targetCalories * carbRatio) / 4);
    const fats = Math.round((targetCalories * fatRatio) / 9);

    let recommendation = '';
    if (recoveryScore >= 67) {
          recommendation = `Great recovery (${recoveryScore}%)! Your body is primed for performance. Prioritize carbohydrates to fuel training and replenish glycogen.`;
    } else if (recoveryScore >= 34) {
          recommendation = `Moderate recovery (${recoveryScore}%). Balance carbs and protein to support ongoing adaptation while managing fatigue.`;
    } else {
          recommendation = `Low recovery (${recoveryScore}%). Focus on anti-inflammatory foods, high protein intake, and sleep-enhancing nutrients to bounce back.`;
    }

    if (sleepPerformance < 70) {
          recommendation += ' Add sleep-enhancing foods like tart cherries, walnuts, and magnesium-rich greens tonight.';
    }

    const tagPriority: string[] = [];
    if (recoveryScore < 34) tagPriority.push('recovery', 'anti-inflammatory');
    if (strain > 14) tagPriority.push('post-workout', 'high-protein');
    if (sleepPerformance < 70) tagPriority.push('sleep');
    if (recoveryScore >= 67) tagPriority.push('energy', 'pre-workout');

    const scored = RECIPE_DATABASE.map((r) => ({
          ...r,
          score: r.tags.filter((t) => tagPriority.includes(t)).length,
    })).sort((a, b) => b.score - a.score);

    const recipes = scored.slice(0, 3);

    return { calories: targetCalories, protein, carbs, fats, recommendation, recipes };
}
