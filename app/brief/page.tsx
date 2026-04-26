import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { getWhoopMetrics } from '@/lib/whoop';
import { getNutritionPlan } from '@/lib/nutrition';
import RecipeCard from '@/components/RecipeCard';

export default async function BriefPage() {
  const session = await getSession();

  if (!session?.accessToken) {
    redirect('/onboarding');
  }

  const metrics = await getWhoopMetrics(session.accessToken);
  const plan = getNutritionPlan(metrics);

  return (
    <div className="min-h-screen bg-whoop-black">
      <header className="border-b border-whoop-card px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Whoop Vitae</h1>
          <a href="/api/auth/logout" className="text-whoop-muted text-sm hover:text-white transition-colors">
            Disconnect
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-whoop-card rounded-xl p-4">
            <p className="text-whoop-muted text-xs uppercase tracking-wider mb-1">Recovery</p>
            <p className="text-2xl font-bold" style={{ color: metrics.recoveryColor }}>
              {metrics.recoveryScore}%
            </p>
          </div>
          <div className="bg-whoop-card rounded-xl p-4">
            <p className="text-whoop-muted text-xs uppercase tracking-wider mb-1">Strain</p>
            <p className="text-2xl font-bold text-white">{metrics.strain}</p>
          </div>
          <div className="bg-whoop-card rounded-xl p-4">
            <p className="text-whoop-muted text-xs uppercase tracking-wider mb-1">Sleep</p>
            <p className="text-2xl font-bold text-white">{metrics.sleepPerformance}%</p>
          </div>
          <div className="bg-whoop-card rounded-xl p-4">
            <p className="text-whoop-muted text-xs uppercase tracking-wider mb-1">HRV</p>
            <p className="text-2xl font-bold text-white">{metrics.hrv} ms</p>
          </div>
        </div>

        <div className="bg-whoop-card rounded-xl p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Nutrition Targets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-whoop-muted text-xs mb-1">Calories</p>
              <p className="text-xl font-bold text-white">{plan.calories}</p>
            </div>
            <div>
              <p className="text-whoop-muted text-xs mb-1">Protein</p>
              <p className="text-xl font-bold text-whoop-accent">{plan.protein}g</p>
            </div>
            <div>
              <p className="text-whoop-muted text-xs mb-1">Carbs</p>
              <p className="text-xl font-bold text-whoop-yellow">{plan.carbs}g</p>
            </div>
            <div>
              <p className="text-whoop-muted text-xs mb-1">Fats</p>
              <p className="text-xl font-bold text-white">{plan.fats}g</p>
            </div>
          </div>
          <p className="text-whoop-muted text-sm mt-4">{plan.recommendation}</p>
        </div>

        <h2 className="text-lg font-semibold text-white mb-4">Recommended Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </main>
    </div>
  );
}
