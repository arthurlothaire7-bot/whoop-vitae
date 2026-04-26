'use client';

import { useState } from 'react';
import type { Recipe } from '@/lib/nutrition';
import RecipeModal from './RecipeModal';

interface RecipeCardProps {
  recipe: Recipe;
}

const CATEGORY_ICONS: Record<string, string> = {
  breakfast: 'B',
  lunch: 'L',
  dinner: 'D',
  snack: 'S',
  'pre-workout': 'P',
  'post-workout': 'W',
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="bg-whoop-card rounded-xl p-5 cursor-pointer hover:bg-opacity-80 transition-all border border-transparent hover:border-whoop-accent/20"
        onClick={() => setShowModal(true)}
      >
        <div className="flex items-start justify-between mb-3">
          <span className="text-2xl">{CATEGORY_ICONS[recipe.category] ?? 'D'}</span>
          <span className="text-whoop-muted text-xs">{recipe.prepTime} min</span>
        </div>

        <h3 className="font-semibold text-white text-sm mb-2 leading-snug">{recipe.name}</h3>
        <p className="text-whoop-muted text-xs mb-4 leading-relaxed line-clamp-2">{recipe.description}</p>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-whoop-accent font-bold text-sm">{recipe.protein}g</p>
            <p className="text-whoop-muted text-xs">Protein</p>
          </div>
          <div>
            <p className="text-whoop-yellow font-bold text-sm">{recipe.carbs}g</p>
            <p className="text-whoop-muted text-xs">Carbs</p>
          </div>
          <div>
            <p className="text-white font-bold text-sm">{recipe.calories}</p>
            <p className="text-whoop-muted text-xs">kcal</p>
          </div>
        </div>
      </div>

      {showModal && (
        <RecipeModal recipe={recipe} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}
