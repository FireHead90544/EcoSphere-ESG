"use server";

import { prisma } from "../prisma";
import { getEnvironmentalFeatures, getSocialFeatures, computeGovernanceScore } from "../scoring/features";


const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";
const ML_TIMEOUT_MS = 2000;

/**
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = ML_TIMEOUT_MS } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

/**
 * Recomputes the ESG score for a given department.
 * Fetches Environmental and Social scores from the ML microservice.
 * Uses fallback heuristics if the service is down.
 */
export async function recomputeDepartmentScore(deptId: string) {
  // 1. Extract Features
  const envFeatures = await getEnvironmentalFeatures(deptId);
  const socialFeatures = await getSocialFeatures(deptId);
  const govScore = await computeGovernanceScore(deptId);

  let envScore = 0;
  let socialScore = 0;
  let isFallback = false;

  // 2. Try ML Service for Environmental
  try {
    const res = await fetchWithTimeout(`${ML_SERVICE_URL}/score/environmental`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(envFeatures)
    });
    
    if (res.ok) {
      const data = await res.json();
      envScore = data.score;
    } else {
      throw new Error(`ML Service responded with ${res.status}`);
    }
  } catch (error) {
    console.warn("ML Service unavailable for environmental score. Using fallback heuristic.", error);
    isFallback = true;
    
    // Fallback heuristic for Environmental
    const { totalCO2, co2Trend, goalsCompleted, goalsOnTrack } = envFeatures;
    let base = 70;
    base -= (totalCO2 / 1000); // Penalty for high absolute CO2
    base -= (co2Trend * 20);   // Penalty for increasing trend
    base += (goalsCompleted * 10) + (goalsOnTrack * 5); // Bonus for goals
    envScore = Math.max(0, Math.min(100, base));
  }

  // 3. Try ML Service for Social
  try {
    const res = await fetchWithTimeout(`${ML_SERVICE_URL}/score/social`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(socialFeatures)
    });
    
    if (res.ok) {
      const data = await res.json();
      socialScore = data.score;
      // If previous call was a fallback, overall we consider this a fallback scenario
      // (or we could track isFallback separately per pillar, but schema has one boolean)
    } else {
      throw new Error(`ML Service responded with ${res.status}`);
    }
  } catch (error) {
    console.warn("ML Service unavailable for social score. Using fallback heuristic.", error);
    isFallback = true;
    
    // Fallback heuristic for Social
    const { participationRate, diversityIndex, trainingCompletionRate, challengeRate } = socialFeatures;
    let base = 
      (participationRate * 40) + 
      (trainingCompletionRate * 30) + 
      (diversityIndex * 20) + 
      (Math.min(1.0, challengeRate) * 10);
      
    // base is out of ~100 assuming rates are 0-1.0
    // Scale up nicely for standard ranges
    socialScore = Math.max(0, Math.min(100, base * 100));
  }

  // 4. Compute overall score using weights from ESG Config
  const config = await prisma.eSGConfig.findFirst() || {
    envWeight: 0.4,
    socialWeight: 0.3,
    govWeight: 0.3,
  };
  
  const totalScore = (envScore * config.envWeight) + (socialScore * config.socialWeight) + (govScore * config.govWeight);

  // 5. Upsert DepartmentScore
  await prisma.departmentScore.upsert({
    where: { departmentId: deptId },
    update: {
      environmental: envScore,
      social: socialScore,
      governance: govScore,
      total: totalScore,
      isFallback,
      computedAt: new Date()
    },
    create: {
      departmentId: deptId,
      environmental: envScore,
      social: socialScore,
      governance: govScore,
      total: totalScore,
      isFallback,
      computedAt: new Date()
    }
  });

  // 6. Log to ScoreFeedback (for retraining)
  // Only log if we got a real ML prediction (or log fallback as well to see when it happened, 
  // but ML service predictions are what we want to correct later)
  if (!isFallback) {
    await prisma.scoreFeedback.createMany({
      data: [
        {
          departmentId: deptId,
          scoreType: "ENVIRONMENTAL",
          features: JSON.stringify(envFeatures),
          predictedScore: envScore,
        },
        {
          departmentId: deptId,
          scoreType: "SOCIAL",
          features: JSON.stringify(socialFeatures),
          predictedScore: socialScore,
        }
      ]
    });
  }

  return { envScore, socialScore, govScore, totalScore, isFallback };
}

export async function recomputeAllScores() {
  const depts = await prisma.department.findMany({ select: { id: true } });
  for (const dept of depts) {
    await recomputeDepartmentScore(dept.id);
  }
}

