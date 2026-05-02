import { DEFAULT_DIMENSIONS, buildBaseScores } from "../domain/scoring/score-calculator.js";
import { executeSubmitQuiz } from "./usecases/submit-quiz.js";
import { executeStartQuiz } from "./usecases/start-quiz.js";
import { executeAnswerQuestion } from "./usecases/answer-question.js";
import { executePrevQuestion, executeNextQuestion } from "./usecases/navigate-quiz.js";
import { executeRestartQuiz } from "./usecases/restart-quiz.js";
import { EngineState, setEngineState } from "./runtime/engine.js";
import { setFlowState } from "./runtime/store.js";
import {
  hideAllScreens,
  showQuizPageTransition,
  updateNavButtonsView,
  renderQuestionView
} from "../ui/pages/quiz/quiz-view.js";
import {
  renderAbilityRadarChart,
  renderResultProfileView
} from "../ui/pages/result/result-view.js";
import { loadScreenplayRuntime } from "../scripts/loader.js";

(() => {
  const pickScreenplayBtn = document.getElementById("pickScreenplayBtn") || document.getElementById("startBtn");
  const introModal = document.getElementById("intro-modal");
  const introOverlay = document.getElementById("introOverlay");
  const closeIntroModalBtn = document.getElementById("closeIntroModalBtn");
  const introTrack = document.getElementById("introTrack");
  const screenplayEnterBtns = Array.from(document.querySelectorAll(".screenplay-enter-btn"));
  const showcaseTrack = document.getElementById("showcaseTrack");
  const showcaseDotsWrap = document.getElementById("showcaseDots");
  const showcasePrevBtn = document.getElementById("showcasePrevBtn");
  const showcaseNextBtn = document.getElementById("showcaseNextBtn");
  const menuPairs = [
    { button: document.getElementById("lobbyMenuBtn"), menu: document.getElementById("lobbyMenu") },
    { button: document.getElementById("quizMenuBtn"), menu: document.getElementById("quizMenu") },
    { button: document.getElementById("resultMenuBtn"), menu: document.getElementById("resultMenu") },
    { button: document.getElementById("aboutMenuBtn"), menu: document.getElementById("aboutMenu") }
  ].filter((pair) => pair.button && pair.menu);
  const aboutNavLinks = Array.from(document.querySelectorAll('a[href="#about"]'));
  const homeNavLinks = Array.from(document.querySelectorAll('a[href="#home"]'));

  const statusText = document.getElementById("statusText");
  const homePage = document.getElementById("lobby-page");
  const quizPage = document.getElementById("quiz-page");
  const progressText = document.getElementById("progressText");
  const progressBarFill = document.getElementById("progressBarFill");
  const questionText = document.getElementById("questionText");
  const optionsContainer = document.getElementById("optionsContainer");
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const resultPage = document.getElementById("result-page");
  const resultAvatarImg = document.getElementById("resultAvatarImg");
  const resultAvatarText = document.getElementById("resultAvatarText");
  const resultQuote = document.getElementById("resultQuote");
  const resultName = document.getElementById("resultName");
  const resultTitle = document.getElementById("resultTitle");
  const resultTraits = document.getElementById("resultTraits");
  const resultDesc = document.getElementById("resultDesc");
  const savePosterBtn = document.getElementById("save-poster-btn");
  const restartBtn = document.getElementById("restart-btn");
  const chartCanvas = document.getElementById("ability-chart");
  const aboutPage = document.getElementById("about-page");

  let questions = Array.isArray(window.questions) ? window.questions : [];
  let characterMap = window.characterMap || {};
  let activeDimensions = Array.isArray(window.currentScreenplay?.dimensions) && window.currentScreenplay.dimensions.length
    ? window.currentScreenplay.dimensions
    : DEFAULT_DIMENSIONS;
  let activeBaseScores = buildBaseScores(activeDimensions);
  let currentQuestionIndex = 0;
  let userScores = [...activeBaseScores];
  let selectedAnswers = new Array(questions.length).fill(null);
  let abilityChartInstance = null;
  let posterDownloadCharacterName = "未知";
  let posterDownloadRoleKey = "unknown";

  if (!pickScreenplayBtn || !introModal || !introOverlay || !introTrack) {
    return;
  }

  // 初始化时强制收口，避免弹窗误显示或状态残留。
  introModal.classList.add("hidden");
  introModal.hidden = true;

  function openIntroModal() {
    introModal.classList.remove("hidden");
    introModal.hidden = false;
    introModal.removeAttribute("hidden");
    document.body.style.overflow = "hidden";
    if (statusText) statusText.textContent = "";
  }

  function closeIntroModal() {
    introModal.classList.add("hidden");
    introModal.hidden = true;
    introModal.setAttribute("hidden", "");
    document.body.style.overflow = "";
  }

  function closeAllMenus() {
    menuPairs.forEach(({ button, menu }) => {
      menu.hidden = true;
      button.setAttribute("aria-expanded", "false");
    });
  }

  function syncShowcaseDots() {
    if (!showcaseTrack || !showcaseDotsWrap) return;
    const cards = getShowcaseCards();
    const dots = Array.from(showcaseDotsWrap.querySelectorAll(".showcase-dot"));
    if (!cards.length || !dots.length) return;
    const activeIndex = getActiveShowcaseCardIndex(cards);
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  function getShowcaseCards() {
    if (!showcaseTrack) return [];
    return Array.from(showcaseTrack.querySelectorAll(".showcase-card"));
  }

  function getActiveShowcaseCardIndex(cards = getShowcaseCards()) {
    if (!showcaseTrack || !cards.length) return 0;
    const viewportCenter = showcaseTrack.scrollLeft + showcaseTrack.clientWidth / 2;
    let activeIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;
    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.clientWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < minDistance) {
        minDistance = distance;
        activeIndex = index;
      }
    });
    return activeIndex;
  }

  function scrollShowcaseToIndex(targetIndex) {
    if (!showcaseTrack) return;
    const cards = getShowcaseCards();
    if (!cards.length) return;
    const normalizedIndex = Math.max(0, Math.min(targetIndex, cards.length - 1));
    const targetCard = cards[normalizedIndex];
    if (!targetCard) return;
    showcaseTrack.scrollTo({ left: targetCard.offsetLeft - 10, behavior: "smooth" });
  }

  function scrollShowcaseByStep(step) {
    if (!showcaseTrack) return;
    const cards = getShowcaseCards();
    if (!cards.length) return;
    const cardWidth = cards[0].clientWidth || 300;
    const computedStyle = window.getComputedStyle(showcaseTrack);
    const gap = Number.parseFloat(computedStyle.columnGap || computedStyle.gap || "20") || 20;
    showcaseTrack.scrollBy({
      left: (cardWidth + gap) * step,
      behavior: "smooth"
    });
  }

  function sanitizePosterFilenameBase(name) {
    const raw = typeof name === "string" ? name.trim() : "";
    if (!raw) return "未知";
    const cleaned = raw.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ");
    return cleaned.slice(0, 80) || "未知";
  }

  function buildPosterDownloadFilename(resourceUrl = "") {
    const fallbackExt = String(window.currentScreenplay?.poster?.ext || ".jpg").trim() || ".jpg";
    const extMatch = String(resourceUrl || "").match(/\.([a-zA-Z0-9]+)(?:[?#].*)?$/);
    const ext = extMatch ? `.${extMatch[1].toLowerCase()}` : fallbackExt;
    return `${sanitizePosterFilenameBase(posterDownloadCharacterName)}${ext}`;
  }

  function resolveStaticPosterDownloadUrl() {
    const posterConfig = window.currentScreenplay?.poster || {};
    if (posterConfig.mode !== "static-image") return "";
    const resolveAsset = window.currentScreenplay?.resolveAsset || ((v) => v);
    const basePath = String(posterConfig.basePath || "").trim();
    const ext = String(posterConfig.ext || ".jpg").trim() || ".jpg";
    const roleKey = String(posterDownloadRoleKey || "").trim();
    const fallback = String(posterConfig.fallback || "").trim();
    if (basePath && roleKey) return resolveAsset(`${basePath}/${roleKey}${ext}`);
    if (basePath && fallback) return resolveAsset(`${basePath}/${fallback}`);
    return "";
  }

  function triggerDataUrlDownload(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => document.body.removeChild(link), 200);
  }

  function hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const normalized = hex.trim().replace("#", "");
    if (!/^[\da-fA-F]{3}$|^[\da-fA-F]{6}$/.test(normalized)) return null;
    const full = normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized;
    const intValue = Number.parseInt(full, 16);
    return { r: (intValue >> 16) & 255, g: (intValue >> 8) & 255, b: intValue & 255 };
  }

  function normalizeChinesePunctuation(text) {
    return String(text || "")
      .replace(/\s+/g, " ")
      .replace(/:/g, "：")
      .replace(/;/g, "；")
      .replace(/,/g, "，")
      .replace(/\?/g, "？")
      .replace(/!/g, "！")
      .replace(/\.\.\./g, "…")
      .replace(/\s*([，。！？：；、])/g, "$1")
      .trim();
  }

  function renderResultDesc(descText) {
    const paragraphText = normalizeChinesePunctuation(descText) || "暂无判词。";
    resultDesc.innerHTML = "";
    const p = document.createElement("p");
    p.className = "result-desc-paragraph";
    p.textContent = paragraphText;
    resultDesc.appendChild(p);
  }

  function applyRoleTheme(roleKey, profile) {
    const roleColorMap = { yongzheng: "#2d5a45", kangxi: "#3d9e74", baye: "#4f7f9c", shisanye: "#738f6a" };
    const accentColor = profile?.themeColor || profile?.nameColor || roleColorMap[roleKey] || "#3d9e74";
    const rgb = hexToRgb(accentColor) || { r: 61, g: 158, b: 116 };
    const inkColor = `rgba(${Math.min(rgb.r + 40, 255)}, ${Math.min(rgb.g + 35, 255)}, ${Math.min(rgb.b + 35, 255)}, 0.95)`;
    resultPage.style.setProperty("--role-accent", accentColor);
    resultPage.style.setProperty("--role-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    resultPage.style.setProperty("--role-accent-ink", inkColor);
  }

  function hideAllPages() {
    hideAllScreens({ homePage, quizPage, resultPage });
    if (aboutPage) {
      aboutPage.style.display = "none";
      aboutPage.classList.remove("screen-active");
    }
  }

  function scrollAboutMainToReadingStart() {
    const aboutMain = aboutPage?.querySelector(".about-main");
    if (!aboutMain) return;
    const maxLeft = aboutMain.scrollWidth - aboutMain.clientWidth;
    if (maxLeft > 0) aboutMain.scrollLeft = maxLeft;
  }

  function showAboutPage() {
    if (!aboutPage) return;
    closeIntroModal();
    closeAllMenus();
    hideAllPages();
    aboutPage.classList.remove("hidden");
    aboutPage.style.display = "block";
    requestAnimationFrame(() => {
      aboutPage.classList.add("screen-active");
      requestAnimationFrame(() => scrollAboutMainToReadingStart());
    });
  }

  function showHomePage() {
    hideAllPages();
    homePage.classList.remove("hidden");
    homePage.style.display = "block";
    requestAnimationFrame(() => homePage.classList.add("screen-active"));
  }

  function renderAbilityChart(stats) {
    abilityChartInstance = renderAbilityRadarChart({
      chartCanvas,
      stats,
      dimensions: activeDimensions,
      previousChartInstance: abilityChartInstance
    });
  }

  function showResultPage() {
    const { finalScores, roleKey, finalProfile } = executeSubmitQuiz({
      selectedAnswers,
      baseScores: activeBaseScores,
      characterMap,
      fallbackKey: "liwei"
    });
    userScores = finalScores;
    if (!finalProfile) return;
    hideAllPages();
    resultPage.classList.remove("hidden");
    resultPage.style.display = "block";
    requestAnimationFrame(() => resultPage.classList.add("screen-active"));
    setEngineState(EngineState.RESULT_READY);
    setFlowState(EngineState.RESULT_READY);
    const screenplayKey = String(window.currentScreenplay?.key || "").trim();
    resultPage.classList.toggle("result-screenplay-zhenhuan", screenplayKey === "zhenhuan");
    applyRoleTheme(roleKey, finalProfile);
    const dynamicNameColor =
      finalProfile.themeColor ||
      finalProfile.nameColor ||
      getComputedStyle(resultPage).getPropertyValue("--role-accent").trim();
    posterDownloadCharacterName = finalProfile.name || "未知";
    posterDownloadRoleKey = roleKey || finalProfile.key || "unknown";
    renderResultProfileView({
      finalProfile,
      dynamicNameColor,
      renderResultDesc,
      refs: { resultAvatarImg, resultAvatarText, resultQuote, resultName, resultTitle, resultTraits }
    });
    renderAbilityChart(finalScores);
  }

  function updateNavButtons() {
    const hasAnswer = Boolean(selectedAnswers[currentQuestionIndex]);
    updateNavButtonsView({
      prevBtn,
      nextBtn,
      currentQuestionIndex,
      totalQuestions: questions.length,
      hasAnswer
    });
  }

  function showQuizPage() {
    setEngineState(EngineState.QUIZ_RUNNING);
    setFlowState(EngineState.QUIZ_RUNNING);
    quizPage.classList.remove("hidden");
    showQuizPageTransition({ homePage, quizPage, statusText });
  }

  function renderQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    renderQuestionView({
      progressText,
      progressBarFill,
      questionText,
      optionsContainer,
      currentQuestion,
      currentQuestionIndex,
      totalQuestions: questions.length,
      selectedAnswerKey: selectedAnswers[currentQuestionIndex]?.key,
      onOptionSelected: (option) => {
        const result = executeAnswerQuestion({
          option,
          currentQuestionIndex,
          selectedAnswers,
          baseScores: activeBaseScores,
          questionsLength: questions.length
        });
        userScores = result.userScores;
        nextBtn.disabled = false;
        if (result.canAutoNext) {
          currentQuestionIndex = result.nextQuestionIndex;
          renderQuestion();
        }
      }
    });
    updateNavButtons();
  }

  async function startQuizFromScreenplay(screenplayKey) {
    const key = String(screenplayKey || "").trim();
    if (!key) return;
    try {
      const { manifest, dataset } = await loadScreenplayRuntime(key);
      questions = Array.isArray(dataset?.questions) ? dataset.questions : [];
      characterMap = dataset?.characterMap || {};
      activeDimensions = Array.isArray(manifest?.dimensions) && manifest.dimensions.length
        ? manifest.dimensions
        : DEFAULT_DIMENSIONS;
      activeBaseScores = buildBaseScores(activeDimensions);
      selectedAnswers = new Array(questions.length).fill(null);
      const startResult = executeStartQuiz({
        questionsLength: questions.length,
        baseScores: activeBaseScores,
        selectedAnswers
      });
      if (!startResult.ok) {
        statusText.textContent = "题库为空，请先补充题目。";
        closeIntroModal();
        return;
      }
      currentQuestionIndex = startResult.nextState.currentQuestionIndex;
      userScores = startResult.nextState.userScores;
      closeIntroModal();
      showQuizPage();
      renderQuestion();
    } catch (error) {
      console.error("加载剧本失败：", error);
      statusText.textContent = "剧本加载失败，请稍后重试。";
      closeIntroModal();
    }
  }

  pickScreenplayBtn.addEventListener("click", openIntroModal);
  if (closeIntroModalBtn) {
    closeIntroModalBtn.addEventListener("click", closeIntroModal);
  }
  introModal.addEventListener("click", (event) => {
    if (!event.target.closest(".intro-panel")) closeIntroModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !introModal.classList.contains("hidden")) closeIntroModal();
    if (event.key === "Escape") closeAllMenus();
  });
  if (menuPairs.length) {
    menuPairs.forEach(({ button, menu }) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const isOpening = menu.hidden;
        closeAllMenus();
        menu.hidden = !isOpening;
        button.setAttribute("aria-expanded", String(isOpening));
      });
    });
    document.addEventListener("click", (event) => {
      const clickedInsideMenu = menuPairs.some(({ button, menu }) =>
        event.target === button || button.contains(event.target) || menu.contains(event.target)
      );
      if (clickedInsideMenu) return;
      closeAllMenus();
    });
  }
  if (aboutNavLinks.length) {
    aboutNavLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showAboutPage();
      });
    });
  }
  if (homeNavLinks.length) {
    homeNavLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        showHomePage();
      });
    });
  }
  if (showcaseTrack) {
    let showcaseTicking = false;
    showcaseTrack.addEventListener("scroll", () => {
      if (showcaseTicking) return;
      showcaseTicking = true;
      window.requestAnimationFrame(() => {
        syncShowcaseDots();
        showcaseTicking = false;
      });
    }, { passive: true });
    if (showcasePrevBtn) {
      showcasePrevBtn.addEventListener("click", () => scrollShowcaseByStep(-1));
    }
    if (showcaseNextBtn) {
      showcaseNextBtn.addEventListener("click", () => scrollShowcaseByStep(1));
    }
    syncShowcaseDots();
  }
  if (
    !statusText || !homePage || !quizPage || !progressText || !progressBarFill ||
    !questionText || !optionsContainer || !prevBtn || !nextBtn || !resultPage ||
    !resultAvatarImg || !resultAvatarText || !resultQuote || !resultName || !resultTitle ||
    !resultTraits || !resultDesc || !savePosterBtn || !restartBtn || !chartCanvas
  ) {
    return;
  }

  quizPage.classList.add("hidden");
  resultPage.classList.add("hidden");
  setEngineState(EngineState.SELECT_SCREENPLAY);
  setFlowState(EngineState.SELECT_SCREENPLAY);

  screenplayEnterBtns.forEach((button) => {
    button.addEventListener("click", async () => {
      await startQuizFromScreenplay(button.dataset.screenplay || "");
    });
  });

  prevBtn.addEventListener("click", () => {
    currentQuestionIndex = executePrevQuestion(currentQuestionIndex);
    renderQuestion();
  });

  nextBtn.addEventListener("click", () => {
    const navResult = executeNextQuestion({
      currentQuestionIndex,
      questionsLength: questions.length,
      hasAnswer: Boolean(selectedAnswers[currentQuestionIndex])
    });
    if (navResult.action === "blocked") return;
    if (navResult.action === "submit") return showResultPage();
    currentQuestionIndex = navResult.nextQuestionIndex;
    renderQuestion();
  });

  savePosterBtn.addEventListener("click", async () => {
    const originalText = savePosterBtn.textContent.trim();
    savePosterBtn.disabled = true;
    savePosterBtn.textContent = "正在生成海报...";
    try {
      setEngineState(EngineState.POSTER_RENDERING);
      setFlowState(EngineState.POSTER_RENDERING);
      const staticPosterUrl = resolveStaticPosterDownloadUrl();
      if (!staticPosterUrl) throw new Error("未配置静态海报资源");
      const downloadName = buildPosterDownloadFilename(staticPosterUrl);
      triggerDataUrlDownload(staticPosterUrl, downloadName);
      savePosterBtn.textContent = "已下载";
      window.setTimeout(() => {
        if (savePosterBtn.textContent === "已下载") savePosterBtn.textContent = originalText;
      }, 1800);
    } catch (error) {
      console.error("生成海报失败：", error);
      savePosterBtn.textContent = "海报资源缺失，请联系管理员";
      window.setTimeout(() => {
        savePosterBtn.textContent = originalText;
      }, 2600);
    } finally {
      savePosterBtn.disabled = false;
      if (savePosterBtn.textContent === "正在生成海报...") savePosterBtn.textContent = originalText;
      setEngineState(EngineState.RESULT_READY);
      setFlowState(EngineState.RESULT_READY);
    }
  });

  restartBtn.addEventListener("click", () => {
    const restartResult = executeRestartQuiz({ baseScores: activeBaseScores, selectedAnswers });
    currentQuestionIndex = restartResult.currentQuestionIndex;
    userScores = restartResult.userScores;
    statusText.textContent = "";
    closeIntroModal();
    if (abilityChartInstance) {
      abilityChartInstance.destroy();
      abilityChartInstance = null;
    }
    showHomePage();
    setEngineState(EngineState.SELECT_SCREENPLAY);
    setFlowState(EngineState.SELECT_SCREENPLAY);
  });
})();
