import { calculateScores } from "../../domain/scoring/score-calculator.js";
import { matchClosestCharacter } from "../../domain/matching/character-matcher.js";

/**
 * 提交答题并产出结果（纯业务流程，不直接操作 DOM）。
 */
export function executeSubmitQuiz({
  selectedAnswers,
  baseScores,
  characterMap,
  fallbackKey = "liwei"
}) {
  const finalScores = calculateScores(selectedAnswers, baseScores);
  const { key: roleKey, profile } = matchClosestCharacter(characterMap, finalScores);
  const fallbackProfile = characterMap?.[fallbackKey] || null;
  const finalProfile = profile || fallbackProfile;
  return {
    finalScores,
    roleKey,
    finalProfile
  };
}

