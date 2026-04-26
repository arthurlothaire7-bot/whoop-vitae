const WHOOP_API_BASE = 'https://api.prod.whoop.com/developer/v1';

export interface WhoopMetrics {
    recoveryScore: number;
    recoveryColor: string;
    strain: number;
    sleepPerformance: number;
    hrv: number;
    restingHeartRate: number;
    caloriesBurned: number;
}

async function whoopFetch(endpoint: string, accessToken: string) {
    const response = await fetch(`${WHOOP_API_BASE}${endpoint}`, {
          headers: {
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
          },
    });

  if (!response.ok) {
        throw new Error(`WHOOP API error: ${response.status}`);
  }

  return response.json();
}

export async function getWhoopMetrics(accessToken: string): Promise<WhoopMetrics> {
    const [recoveryData, cycleData, sleepData] = await Promise.all([
          whoopFetch('/recovery?limit=1', accessToken),
          whoopFetch('/cycle?limit=1', accessToken),
          whoopFetch('/activity/sleep?limit=1', accessToken),
        ]);

  const recovery = recoveryData.records?.[0];
    const cycle = cycleData.records?.[0];
    const sleep = sleepData.records?.[0];

  const recoveryScore = Math.round(recovery?.score?.recovery_score ?? 0);
    const strain = Number((cycle?.score?.strain ?? 0).toFixed(1));
    const sleepPerformance = Math.round(sleep?.score?.sleep_performance_percentage ?? 0);
    const hrv = Math.round(recovery?.score?.hrv_rmssd_milli ?? 0);
    const restingHeartRate = Math.round(recovery?.score?.resting_heart_rate ?? 0);
    const caloriesBurned = Math.round(cycle?.score?.kilojoule ? cycle.score.kilojoule / 4.184 : 0);

  let recoveryColor = '#ff3b5c';
    if (recoveryScore >= 67) recoveryColor = '#00ff87';
    else if (recoveryScore >= 34) recoveryColor = '#ffd60a';

  return {
        recoveryScore,
        recoveryColor,
        strain,
        sleepPerformance,
        hrv,
        restingHeartRate,
        caloriesBurned,
  };
}
