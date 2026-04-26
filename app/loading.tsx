export default function Loading() {
    return (
          <div className="min-h-screen bg-whoop-black">
            {/* Header skeleton */}
                <div className="border-b border-whoop-card px-6 py-4">
                        <div className="max-w-4xl mx-auto flex items-center justify-between">
                                  <div className="h-6 w-32 bg-whoop-card rounded-lg animate-pulse" />
                                  <div className="h-4 w-20 bg-whoop-card rounded-lg animate-pulse" />
                        </div>div>
                </div>div>
          
                <main className="max-w-4xl mx-auto px-6 py-8">
                  {/* Metrics skeleton */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          {[...Array(4)].map((_, i) => (
                        <div key={i} className="bg-whoop-card rounded-xl p-4">
                                      <div className="h-3 w-16 bg-whoop-dark rounded animate-pulse mb-3" />
                                      <div className="h-8 w-12 bg-whoop-dark rounded animate-pulse" />
                        </div>div>
                      ))}
                        </div>div>
                
                  {/* Nutrition targets skeleton */}
                        <div className="bg-whoop-card rounded-xl p-6 mb-8">
                                  <div className="h-5 w-48 bg-whoop-dark rounded animate-pulse mb-4" />
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                    {[...Array(4)].map((_, i) => (
                          <div key={i}>
                                          <div className="h-3 w-12 bg-whoop-dark rounded animate-pulse mb-2" />
                                          <div className="h-7 w-16 bg-whoop-dark rounded animate-pulse" />
                          </div>div>
                        ))}
                                  </div>div>
                                  <div className="h-4 w-full bg-whoop-dark rounded animate-pulse" />
                        </div>div>
                
                  {/* Recipes skeleton */}
                        <div className="h-5 w-40 bg-whoop-card rounded animate-pulse mb-4" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-whoop-card rounded-xl p-5">
                                      <div className="flex items-start justify-between mb-3">
                                                      <div className="h-8 w-8 bg-whoop-dark rounded animate-pulse" />
                                                      <div className="h-3 w-12 bg-whoop-dark rounded animate-pulse" />
                                      </div>div>
                                      <div className="h-4 w-3/4 bg-whoop-dark rounded animate-pulse mb-2" />
                                      <div className="h-3 w-full bg-whoop-dark rounded animate-pulse mb-1" />
                                      <div className="h-3 w-2/3 bg-whoop-dark rounded animate-pulse mb-4" />
                                      <div className="grid grid-cols-3 gap-2">
                                        {[...Array(3)].map((_, j) => (
                                            <div key={j} className="text-center">
                                                                <div className="h-5 w-10 bg-whoop-dark rounded animate-pulse mx-auto mb-1" />
                                                                <div className="h-3 w-8 bg-whoop-dark rounded animate-pulse mx-auto" />
                                            </div>div>
                                          ))}
                                      </div>div>
                        </div>div>
                      ))}
                        </div>div>
                </main>main>
          </div>div>
        );
}</div>
