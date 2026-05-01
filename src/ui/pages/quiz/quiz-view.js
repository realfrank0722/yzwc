export function hideAllScreens({ homePage, quizPage, resultPage }) {
  homePage.style.display = "none";
  quizPage.style.display = "none";
  resultPage.style.display = "none";
  homePage.classList.remove("screen-active", "screen-fade-out");
  quizPage.classList.remove("screen-active");
  resultPage.classList.remove("screen-active");
}

export function showQuizPageTransition({ homePage, quizPage, statusText }) {
  homePage.classList.remove("screen-active");
  homePage.classList.add("screen-fade-out");
  if (statusText) statusText.textContent = "";

  setTimeout(() => {
    homePage.style.display = "none";
    quizPage.style.display = "block";
    requestAnimationFrame(() => {
      quizPage.classList.add("screen-active");
    });
  }, 260);
}

export function updateNavButtonsView({
  prevBtn,
  nextBtn,
  currentQuestionIndex,
  totalQuestions,
  hasAnswer
}) {
  prevBtn.disabled = currentQuestionIndex === 0;
  nextBtn.textContent = currentQuestionIndex === totalQuestions - 1 ? "宣读圣旨" : "下一题";
  nextBtn.disabled = !hasAnswer;
}

export function renderQuestionView({
  progressText,
  progressBarFill,
  questionText,
  optionsContainer,
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedAnswerKey,
  onOptionSelected
}) {
  if (!currentQuestion) return;

  progressText.textContent = `${currentQuestionIndex + 1}/${totalQuestions}`;
  const progressPercent = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  progressBarFill.style.width = `${progressPercent}%`;
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";

  currentQuestion.options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "option-btn";
    button.textContent = `${option.key}. ${option.text}`;
    button.dataset.key = option.key;
    if (selectedAnswerKey && selectedAnswerKey === option.key) {
      button.classList.add("selected");
    }

    button.addEventListener("click", () => {
      const optionButtons = optionsContainer.querySelectorAll(".option-btn");
      optionButtons.forEach((btn) => btn.classList.remove("selected"));
      button.classList.add("selected");
      onOptionSelected(option);
    });

    optionsContainer.appendChild(button);
  });
}

