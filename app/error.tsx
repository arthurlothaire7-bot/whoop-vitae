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
                                <div className="text-6xl mb-6">⚠️</div>
                                        <h2 className="text-2xl font-bold text-white mb-3">Something went wrong</h2>
                                                <p className="text-whoop-muted mb-2 text-sm">
                                                          {error.message || 'An unexpected error occurred.'}
                                                                  </p>
                                                                          {error.digest && (
                                                                                    <p className="text-whoop-muted text-xs mb-6 font-mono">Error ID: {error.digest}</p>
                                                                                            )}
                                                                                                    <div className="flex gap-3 justify-center">
                                                                                                              <button
                                                                                                                          onClick={reset}
                                                                                                                                      className="bg-whoop-accent text-black font-bold py-3 px-6 rounded-xl hover:opacity-90 transition-opacity"
                                                                                                                                                >
                                                                                                                                                            Try again
                                                                                                                                                                      </button>
                                                                                                                                                                                <a
                                                                                                                                                                                            href="/onboarding"
                                                                                                                                                                                                        className="bg-whoop-card text-whoop-text font-medium py-3 px-6 rounded-xl hover:bg-opacity-80 transition-opacity"
                                                                                                                                                                                                                  >
                                                                                                                                                                                                                              Go home
                                                                                                                                                                                                                                        </a>
                                                                                                                                                                                                                                                </div>
                                                                                                                                                                                                                                                      </div>
                                                                                                                                                                                                                                                          </div>
                                                                                                                                                                                                                                                            );
                                                                                                                                                                                                                                                            }
