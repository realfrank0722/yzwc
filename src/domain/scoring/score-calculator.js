export const DEFAULT_DIMENSIONS = [
  { key: "renwei", label: "人味" },
  { key: "zuoshi", label: "做事" },
  { key: "quanmou", label: "权谋" },
  { key: "xintai", label: "心态" },
  { key: "yexin", label: "野心" }
];

export function buildBaseScores(dimensions = DEFAULT_DIMENSIONS) {
  const count = Math.max(1, Array.isArray(dimensions) ? dimensions.length : 0);
  return Array.from({ length: count }, () => 50);
}

// 兼容旧调用方：默认导出仍保留五维基准分
export const BASE_SCORES = buildBaseScores(DEFAULT_DIMENSIONS);

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

/**
 * 根据答案列表计算最终五维分。
 * @param {Array<{scoreChanges:number[]}|null>} selectedAnswers
 * @param {number[]} baseScores
 */
export function calculateScores(selectedAnswers, baseScores = BASE_SCORES) {
  const nextScores = [...baseScores];
  (selectedAnswers || []).forEach((answer) => {
    if (!answer || !Array.isArray(answer.scoreChanges)) return;
    for (let i = 0; i < nextScores.length; i += 1) {
      const delta = Number(answer.scoreChanges[i] || 0);
      nextScores[i] += delta;
    }
  });
  return nextScores.map(clampScore);
}

