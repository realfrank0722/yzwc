export function executeRestartQuiz({ baseScores, selectedAnswers }) {
  selectedAnswers.fill(null);
  return {
    currentQuestionIndex: 0,
    userScores: [...baseScores]
  };
}

