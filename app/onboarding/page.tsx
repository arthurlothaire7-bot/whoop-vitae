'use client';

import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();

  const handleConnect = () => {
    router.push('/api/auth/login');
  };

  return (
    <div className="min-h-screen bg-whoop-black flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Whoop Vitae</h1>
          <p className="text-whoop-accent text-sm font-medium tracking-widest uppercase">
            Nutrition & Recovery
          </p>
        </div>

        <div className="bg-whoop-card rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Connect your WHOOP
          </h2>
          <p className="text-whoop-muted mb-6 leading-relaxed">
            Get personalized nutrition recommendations based on your recovery score,
            strain, sleep performance, and HRV data.
          </p>

          <div className="space-y-3 text-left mb-6">
            {['Recovery-based macro targets', 'HRV-optimized meal timing', 'Strain-adjusted calorie needs', 'Sleep-enhancing food choices'].map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="text-whoop-accent">checkmark</span>
                <span className="text-whoop-text text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleConnect}
          className="w-full bg-whoop-accent text-black font-bold py-4 px-8 rounded-xl hover:opacity-90 transition-opacity text-lg"
        >
          Connect with WHOOP
        </button>
      </div>
    </div>
  );
}
