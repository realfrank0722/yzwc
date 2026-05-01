import { calculateScores } from "../../domain/scoring/score-calculator.js";

export function executeAnswerQuestion({
  option,
  currentQuestionIndex,
  selectedAnswers,
  baseScores,
  questionsLength
}) {
  selectedAnswers[currentQuestionIndex] = {
    key: option.key,
    scoreChanges: Array.isArray(option.scoreChanges)
      ? option.scoreChanges
      : Array.from({ length: baseScores.length }, () => 0)
  };
  const userScores = calculateScores(selectedAnswers, baseScores);
  const canAutoNext = currentQuestionIndex < questionsLength - 1;
  return {
    userScores,
    nextQuestionIndex: canAutoNext ? currentQuestionIndex + 1 : currentQuestionIndex,
    canAutoNext
  };
}

