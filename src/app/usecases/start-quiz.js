export function executeStartQuiz({ questionsLength, baseScores, selectedAnswers }) {
  if (!questionsLength || questionsLength <= 0) {
    return { ok: false, reason: "empty_questions" };
  }
  selectedAnswers.fill(null);
  return {
    ok: true,
    nextState: {
      currentQuestionIndex: 0,
      userScores: [...baseScores]
    }
  };
}

