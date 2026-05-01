export function executePrevQuestion(currentQuestionIndex) {
  if (currentQuestionIndex <= 0) return currentQuestionIndex;
  return currentQuestionIndex - 1;
}

export function executeNextQuestion({ currentQuestionIndex, questionsLength, hasAnswer }) {
  if (!hasAnswer) {
    return { action: "blocked", nextQuestionIndex: currentQuestionIndex };
  }
  if (currentQuestionIndex >= questionsLength - 1) {
    return { action: "submit", nextQuestionIndex: currentQuestionIndex };
  }
  return { action: "next", nextQuestionIndex: currentQuestionIndex + 1 };
}

