'use client';

import { useEffect } from 'react';
import type { Recipe } from '@/lib/nutrition';

interface RecipeModalProps {
  recipe: Recipe;
  onClose: () => void;
}

export default function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-whoop-dark rounded-2xl max-w-md w-full p-6 border border-whoop-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white">{recipe.name}</h2>
            <p className="text-whoop-muted text-sm capitalize mt-1">{recipe.category} - {recipe.prepTime} min</p>
          </div>
          <button
            onClick={onClose}
            className="text-whoop-muted hover:text-white transition-colors text-xl leading-none"
          >
            X
          </button>
        </div>

        <p className="text-whoop-text text-sm leading-relaxed mb-6">{recipe.description}</p>

        <div className="grid grid-cols-4 gap-3 mb-6">
          <div className="bg-whoop-card rounded-xl p-3 text-center">
            <p className="text-white font-bold">{recipe.calories}</p>
            <p className="text-whoop-muted text-xs">kcal</p>
          </div>
          <div className="bg-whoop-card rounded-xl p-3 text-center">
            <p className="text-whoop-accent font-bold">{recipe.protein}g</p>
            <p className="text-whoop-muted text-xs">Protein</p>
          </div>
          <div className="bg-whoop-card rounded-xl p-3 text-center">
            <p className="text-whoop-yellow font-bold">{recipe.carbs}g</p>
            <p className="text-whoop-muted text-xs">Carbs</p>
          </div>
          <div className="bg-whoop-card rounded-xl p-3 text-center">
            <p className="text-white font-bold">{recipe.fats}g</p>
            <p className="text-whoop-muted text-xs">Fats</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag) => (
            <span
              key={tag}
              className="bg-whoop-card text-whoop-muted text-xs px-3 py-1 rounded-full capitalize"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
