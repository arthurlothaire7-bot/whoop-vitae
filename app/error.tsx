'use client';

import { useEffect } from 'react';

interface ErrorProps {
      error: Error & { digest?: string };
      reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
      useEffect(() => {
              console.error(error);
      }, [error]);

  return (
          <div className="min-h-screen bg-whoop-black flex flex-col items-center justify-center px-4">
                <div className="max-w-md w-full text-center">
                        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>h2>
                        <p className="text-whoop-muted mb-2 text-sm">
                            {error.message || 'An unexpected error occurred.'}
                        </p>p>
                        <div className="flex gap-3 justify-center mt-6">
                                  <button
                                                  onClick={reset}
                                                  className="bg-whoop-accent text-black font-bold py-3 px-6 rounded-xl"
                                                >
                                              Try again
                                  </button>button>
                                  <a
                                                  href="/onboarding"
                                                  className="bg-whoop-card text-whoop-text font-medium py-3 px-6 rounded-xl"
                                                >
                                              Go home
                                  </a>a>
                        </div>div>
                </div>div>
          </div>div>
        );
}</div>
