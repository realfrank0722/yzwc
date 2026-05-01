const SCORE_CENTER = 50;
const MATCH_DIMENSION_WEIGHTS = [1.05, 1.15, 1.1, 1.0, 1.15];
const MATCH_EPSILON = 0.0001;

function resolveWeight(weights, index) {
  if (Array.isArray(weights) && Number.isFinite(Number(weights[index]))) {
    return Number(weights[index]);
  }
  return MATCH_DIMENSION_WEIGHTS[index] || 1;
}

function calculateDistance(candidateStats, targetStats, dimensionCount, weights) {
  let total = 0;
  for (let i = 0; i < dimensionCount; i += 1) {
    const weight = resolveWeight(weights, i);
    total += Math.abs((candidateStats[i] || 0) - (targetStats[i] || 0)) * weight;
  }
  return total;
}

function calculateShapeSimilarity(candidateStats, targetStats, dimensionCount) {
  let dot = 0;
  let candidateNorm = 0;
  let targetNorm = 0;
  for (let i = 0; i < dimensionCount; i += 1) {
    const candidateCentered = (candidateStats[i] || 0) - SCORE_CENTER;
    const targetCentered = (targetStats[i] || 0) - SCORE_CENTER;
    dot += candidateCentered * targetCentered;
    candidateNorm += candidateCentered ** 2;
    targetNorm += targetCentered ** 2;
  }
  if (candidateNorm === 0 || targetNorm === 0) return 0;
  return dot / Math.sqrt(candidateNorm * targetNorm);
}

function calculateMaxDifference(candidateStats, targetStats, dimensionCount) {
  let maxDiff = 0;
  for (let i = 0; i < dimensionCount; i += 1) {
    maxDiff = Math.max(maxDiff, Math.abs((candidateStats[i] || 0) - (targetStats[i] || 0)));
  }
  return maxDiff;
}

function buildCandidateMatch(key, profile, finalScores, dimensionCount, weights) {
  const stats = Array.isArray(profile?.stats) ? profile.stats : [];
  return {
    key,
    profile,
    distance: calculateDistance(stats, finalScores, dimensionCount, weights),
    shapeSimilarity: calculateShapeSimilarity(stats, finalScores, dimensionCount),
    maxDifference: calculateMaxDifference(stats, finalScores, dimensionCount)
  };
}

function compareCandidateMatches(a, b) {
  if (Math.abs(a.distance - b.distance) > MATCH_EPSILON) {
    return a.distance - b.distance;
  }
  if (Math.abs(a.shapeSimilarity - b.shapeSimilarity) > MATCH_EPSILON) {
    return b.shapeSimilarity - a.shapeSimilarity;
  }
  if (Math.abs(a.maxDifference - b.maxDifference) > MATCH_EPSILON) {
    return a.maxDifference - b.maxDifference;
  }
  return a.key.localeCompare(b.key);
}

/**
 * @param {Record<string, any>} characterMap
 * @param {number[]} finalScores
 */
export function matchClosestCharacter(characterMap, finalScores) {
  const dimensionCount = Array.isArray(finalScores) ? finalScores.length : 0;
  const entries = Object.entries(characterMap || {}).filter(([, profile]) => {
    return profile && Array.isArray(profile.stats) && profile.stats.length === dimensionCount;
  });
  if (entries.length === 0) {
    return { key: "unknown", profile: null };
  }
  const weights = Array.isArray(window.currentScreenplay?.dimensions)
    ? window.currentScreenplay.dimensions.map((item) => Number(item?.weight || 1))
    : null;
  const ranked = entries
    .map(([key, profile]) => buildCandidateMatch(key, profile, finalScores, dimensionCount, weights))
    .sort(compareCandidateMatches);
  return { key: ranked[0].key, profile: ranked[0].profile };
}

