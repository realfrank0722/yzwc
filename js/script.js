(() => {
  const startBtn = document.getElementById("startBtn");
  const statusText = document.getElementById("statusText");
  const homePage = document.getElementById("home-page");
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
  const rewardBtn = document.getElementById("reward-btn");
  const rewardModal = document.getElementById("reward-modal");
  const closeRewardModalBtn = document.getElementById("close-reward-modal");
  const chartCanvas = document.getElementById("ability-chart");
  const questions = Array.isArray(window.questions) ? window.questions : [];
  const characterMap = window.characterMap || {};
  const BASE_SCORES = [50, 50, 50, 50, 50];
  const SCORE_CENTER = 50;
  const MATCH_DIMENSION_WEIGHTS = [1.05, 1.15, 1.1, 1.0, 1.15];
  const MATCH_EPSILON = 0.0001;

  let currentQuestionIndex = 0;
  let userScores = [...BASE_SCORES];
  const selectedAnswers = new Array(questions.length).fill(null);
  let abilityChartInstance = null;
  /** 当前结果人物名，用于海报下载文件名 */
  let posterDownloadCharacterName = "未知";

  if (
    !startBtn ||
    !statusText ||
    !homePage ||
    !quizPage ||
    !progressText ||
    !progressBarFill ||
    !questionText ||
    !optionsContainer ||
    !prevBtn ||
    !nextBtn ||
    !resultPage ||
    !resultAvatarImg ||
    !resultAvatarText ||
    !resultQuote ||
    !resultName ||
    !resultTitle ||
    !resultTraits ||
    !resultDesc ||
    !savePosterBtn ||
    !restartBtn ||
    !rewardBtn ||
    !rewardModal ||
    !closeRewardModalBtn ||
    !chartCanvas
  ) {
    return;
  }

  function openRewardModal() {
    rewardModal.style.display = "grid";
    requestAnimationFrame(() => {
      rewardModal.classList.add("show");
    });
  }

  function closeRewardModal() {
    rewardModal.classList.remove("show");
    setTimeout(() => {
      if (!rewardModal.classList.contains("show")) {
        rewardModal.style.display = "none";
      }
    }, 240);
  }

  function clampScore(value) {
    return Math.max(0, Math.min(100, value));
  }

  function sanitizePosterFilenameBase(name) {
    const raw = typeof name === "string" ? name.trim() : "";
    if (!raw) return "未知";
    const cleaned = raw.replace(/[\\/:*?"<>|]/g, "").replace(/\s+/g, " ");
    const clipped = cleaned.slice(0, 80);
    return clipped || "未知";
  }

  function buildPosterDownloadFilename() {
    const base = sanitizePosterFilenameBase(posterDownloadCharacterName);
    return `九子夺嫡-${base}.jpg`;
  }

  function waitForImageReady(img) {
    if (!(img instanceof HTMLImageElement)) return Promise.resolve();
    if (!img.getAttribute("src")) return Promise.resolve();
    if (img.complete && img.naturalWidth > 0) {
      return img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
    }

    return new Promise((resolve) => {
      const timer = window.setTimeout(resolve, 4200);
      const done = () => {
        window.clearTimeout(timer);
        resolve();
      };
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    }).then(() => (img.decode ? img.decode().catch(() => undefined) : undefined));
  }

  function loadImageFromUrl(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`图片加载失败: ${src}`));
      img.src = src;
    });
  }

  async function loadAvatarImageForCanvas(src) {
    if (!src) return { image: null, revoke: null };
    try {
      const response = await fetch(src, { cache: "force-cache" });
      if (!response.ok) {
        throw new Error(`fetch头像失败: ${response.status}`);
      }
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const img = await loadImageFromUrl(blobUrl);
      return {
        image: img,
        revoke: () => URL.revokeObjectURL(blobUrl)
      };
    } catch (error) {
      return { image: null, revoke: null };
    }
  }

  function canvasToPngBlob(canvas) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("无法导出 PNG（画布可能被跨域或未解码图片污染）"));
      }, "image/png");
    });
  }

  function canvasToJpegBlob(canvas, quality = 0.92) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("无法导出 JPG"));
      }, "image/jpeg", quality);
    });
  }

  function downloadCanvasAsImage(canvas, filename) {
    return canvasToJpegBlob(canvas)
      .then((blob) => {
        triggerBlobDownload(blob, filename);
      })
      .catch(() => {
        try {
          triggerDataUrlDownload(canvas.toDataURL("image/jpeg", 0.92), filename);
        } catch (error) {
          throw new Error("导出图片被浏览器安全策略拦截");
        }
      });
  }

  function splitTextLines(ctx, text, maxWidth) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return [];
    const lines = [];
    let current = "";
    for (const ch of normalized) {
      const trial = current + ch;
      if (current && ctx.measureText(trial).width > maxWidth) {
        lines.push(current);
        current = ch;
      } else {
        current = trial;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function splitTextLinesPreferPunctuation(ctx, text, maxWidth) {
    const normalized = String(text || "").replace(/\s+/g, " ").trim();
    if (!normalized) return [];

    const preferredBreakAfter = new Set(["，", "、", "；", "：", "。", "！", "？", ",", ";", ":", "!", "?"]);
    const lines = [];
    let rest = normalized;

    while (rest.length > 0) {
      if (ctx.measureText(rest).width <= maxWidth) {
        lines.push(rest);
        break;
      }

      let safeCut = 1;
      let preferredCut = -1;
      for (let i = 1; i <= rest.length; i += 1) {
        const chunk = rest.slice(0, i);
        if (ctx.measureText(chunk).width > maxWidth) {
          break;
        }
        safeCut = i;
        const ch = rest[i - 1];
        if (preferredBreakAfter.has(ch)) {
          preferredCut = i;
        }
      }

      let cut = safeCut;
      if (preferredCut > 0 && preferredCut >= Math.floor(safeCut * 0.55)) {
        cut = preferredCut;
      }
      if (cut <= 0) cut = 1;

      lines.push(rest.slice(0, cut));
      rest = rest.slice(cut);
    }

    return lines.filter(Boolean);
  }

  function rebalanceLastLine(lines, minLastLen = 4) {
    const nextLines = [...lines];
    if (nextLines.length < 2) return nextLines;
    const last = nextLines[nextLines.length - 1];
    const prev = nextLines[nextLines.length - 2];
    if (!last || !prev) return nextLines;
    if (last.length >= minLastLen) return nextLines;

    const moveCount = Math.min(minLastLen - last.length, Math.max(0, prev.length - minLastLen));
    if (moveCount <= 0) return nextLines;
    const moved = prev.slice(prev.length - moveCount);
    nextLines[nextLines.length - 2] = prev.slice(0, prev.length - moveCount);
    nextLines[nextLines.length - 1] = moved + last;
    return nextLines.filter(Boolean);
  }

  function optimizeQuoteLines(lines, ctx, maxWidth) {
    let next = [...lines].filter(Boolean);
    if (next.length < 2) return next;

    // 行首避让：虚词与右标点不应作为新行开头；行尾避让：左标点不应挂在行尾。
    const badLineStart = new Set([
      "的", "了", "着", "地", "得", "吗", "嘛", "吧", "呢", "啊", "呀", "么",
      "，", "。", "、", "！", "？", "：", "；", "）", "】", "》", "」", "』", "”", "’"
    ]);
    const badLineEnd = new Set(["（", "【", "《", "「", "『", "“", "‘"]);

    for (let pass = 0; pass < 8; pass += 1) {
      let changed = false;

      for (let i = 1; i < next.length; i += 1) {
        let prev = next[i - 1];
        let curr = next[i];
        if (!prev || !curr) continue;

        // 1) 如果下一行以不宜起行字符开头，尽量把该字符并入上一行。
        while (curr && badLineStart.has(curr[0]) && prev.length > 2) {
          const starter = curr[0];
          const mergedPrev = prev + starter;
          if (ctx.measureText(mergedPrev).width <= maxWidth) {
            prev = mergedPrev;
            curr = curr.slice(1);
            changed = true;
            continue;
          }

          // 上一行塞不下时，从上一行借1个字到下一行前面，打破“弱起行”。
          if (prev.length > 4) {
            const borrow = prev.slice(-1);
            const nextPrev = prev.slice(0, -1);
            const nextCurr = borrow + curr;
            if (
              !badLineStart.has(nextCurr[0]) &&
              ctx.measureText(nextPrev).width <= maxWidth &&
              ctx.measureText(nextCurr).width <= maxWidth
            ) {
              prev = nextPrev;
              curr = nextCurr;
              changed = true;
              continue;
            }
          }
          break;
        }

        // 2) 如果上一行以左标点结尾，把下一行首字并回上一行。
        while (prev && badLineEnd.has(prev.slice(-1)) && curr) {
          const mergedPrev = prev + curr[0];
          if (ctx.measureText(mergedPrev).width > maxWidth) break;
          prev = mergedPrev;
          curr = curr.slice(1);
          changed = true;
        }

        next[i - 1] = prev;
        next[i] = curr;
      }

      next = next.filter(Boolean);
      if (!changed) break;
    }

    // 3) 两行时再做一次“末行过短”平衡，避免视觉突兀。
    if (next.length === 2) {
      while (next[1].length < 6 && next[0].length > 6) {
        const moved = next[0].slice(-1);
        const candidate = moved + next[1];
        if (ctx.measureText(candidate).width > maxWidth) break;
        next[0] = next[0].slice(0, -1);
        next[1] = candidate;
      }
    }

    return next.filter(Boolean);
  }

  function ensurePosterAvatarReady() {
    if (!resultAvatarImg.classList.contains("is-visible") || !resultAvatarImg.src) {
      return Promise.reject(new Error("未找到可用头像"));
    }
    return waitForImageReady(resultAvatarImg).then(() => {
      if (resultAvatarImg.naturalWidth <= 0) {
        throw new Error("头像加载失败");
      }
    });
  }

  async function paintFallbackPosterCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    const measureCtx = canvas.getContext("2d");
    if (!measureCtx) throw new Error("无法创建导出画布");

    const label = resultPage.querySelector(".result-label-text")?.textContent?.trim() || "测试结果";
    const edict = resultPage.querySelector(".edict-line")?.textContent?.trim() || "狗儿的，让我看看你到底是谁";
    const roleName = (resultName.textContent || "").trim() || "未知";
    const roleTitle = (resultTitle.textContent || "").trim() || "";
    const quote = (resultQuote.textContent || "").trim() || "";
    const desc = (resultDesc.textContent || "").trim() || "";
    const traits = Array.from(resultTraits.querySelectorAll(".result-trait"))
      .map((n) => n.textContent?.trim())
      .filter(Boolean);
    const author = resultPage.querySelector(".result-author")?.textContent?.trim() || "作者：36";
    const social = resultPage.querySelector(".result-social-row")?.textContent?.replace(/\s+/g, " ").trim() || "";
    const pageStyles = window.getComputedStyle(resultPage);
    const accentColor = pageStyles.getPropertyValue("--role-accent").trim() || "#d5b347";
    const accentRgbRaw = pageStyles.getPropertyValue("--role-accent-rgb").trim() || "213,179,71";
    const [ar = 213, ag = 179, ab = 71] = accentRgbRaw
      .split(",")
      .map((v) => Number.parseFloat(v.trim()))
      .map((v) => (Number.isFinite(v) ? v : 0));

    const centerX = canvas.width / 2;
    const contentX = 96;
    const contentW = canvas.width - contentX * 2;
    const titleNameY = 656;
    const titleBottomY = 758;
    const traitsStartY = 816;
    const pillH = 58;
    const traitGap = 14;
    const traitRowGap = 12;
    const traitSidePadding = 26;
    const traitMaxW = contentW - 120;

    measureCtx.font = '500 29px "Microsoft YaHei", serif';
    const rows = [];
    let row = [];
    let rowW = 0;
    for (const trait of traits.slice(0, 8)) {
      const w = Math.ceil(measureCtx.measureText(trait).width + traitSidePadding * 2);
      const withGap = row.length === 0 ? w : w + traitGap;
      if (row.length > 0 && rowW + withGap > traitMaxW) {
        rows.push({ items: row, width: rowW });
        row = [{ text: trait, width: w }];
        rowW = w;
      } else {
        row.push({ text: trait, width: w });
        rowW += withGap;
      }
    }
    if (row.length > 0) rows.push({ items: row, width: rowW });

    measureCtx.font = 'italic 500 46px "STSong", serif';
    const quoteText = quote.replace(/[“”"'`]/g, "");
    const quoteRawLines = splitTextLinesPreferPunctuation(
      measureCtx,
      quoteText,
      contentW - 140
    ).slice(0, 4);
    const quoteAdjustedLines = optimizeQuoteLines(quoteRawLines, measureCtx, contentW - 140);
    const quoteLines = rebalanceLastLine(quoteAdjustedLines, 4);

    measureCtx.font = '500 34px "Microsoft YaHei", serif';
    const descLines = splitTextLines(measureCtx, desc, contentW - 118);

    const traitsBlockH = rows.length > 0 ? rows.length * pillH + (rows.length - 1) * traitRowGap + 28 : 0;
    const quoteBoxY = traitsStartY + traitsBlockH + 34;
    const quoteBoxH = 54 + Math.max(1, quoteLines.length) * 58 + 36;
    const quoteStartY = quoteBoxY + 78;
    const descBoxY = quoteBoxY + quoteBoxH + 26;
    const descBoxH = 20 + Math.max(1, descLines.length) * 50 + 24;
    const descStartY = descBoxY + 48;
    const infoY = descBoxY + descBoxH + 52;
    const infoH = 220;
    const finalHeight = Math.max(1920, infoY + infoH + 96);
    canvas.height = finalHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("无法创建导出画布");
    ctx.textAlign = "center";

    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#2c0b0b");
    bgGrad.addColorStop(0.45, "#190707");
    bgGrad.addColorStop(1, "#120404");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const halo = ctx.createRadialGradient(centerX, 200, 120, centerX, 200, 760);
    halo.addColorStop(0, `rgba(${ar}, ${ag}, ${ab}, 0.16)`);
    halo.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, canvas.width, 980);

    ctx.fillStyle = "rgba(232,201,99,0.72)";
    ctx.font = '600 42px "Microsoft YaHei", serif';
    ctx.fillText(label, centerX, 132);

    ctx.fillStyle = "rgba(244,228,188,0.98)";
    ctx.font = '700 56px "Microsoft YaHei", serif';
    ctx.fillText(edict, centerX, 204);

    const avatarX = centerX;
    const avatarY = 420;
    const avatarR = 96;
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.42)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "rgba(50,12,12,0.95)";
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ctx.lineWidth = 10;
    ctx.strokeStyle = "rgba(18, 6, 6, 0.75)";
    ctx.stroke();
    ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, 0.92)`;
    ctx.lineWidth = 5;
    ctx.stroke();

    await ensurePosterAvatarReady();
    const avatarSrc = resultAvatarImg.currentSrc || resultAvatarImg.src;
    const fetchedAvatar = await loadAvatarImageForCanvas(avatarSrc);
    const avatarForCanvas = fetchedAvatar.image || resultAvatarImg;
    const sw = avatarForCanvas.naturalWidth;
    const sh = avatarForCanvas.naturalHeight;
    const sourceSize = Math.min(sw, sh);
    const sx = Math.floor((sw - sourceSize) / 2);
    const sy = Math.floor((sh - sourceSize) / 2);
    const destR = avatarR - 8;
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, destR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(
      avatarForCanvas,
      sx,
      sy,
      sourceSize,
      sourceSize,
      avatarX - destR,
      avatarY - destR,
      destR * 2,
      destR * 2
    );
    ctx.restore();
    if (typeof fetchedAvatar.revoke === "function") {
      fetchedAvatar.revoke();
    }

    try {
      ctx.getImageData(0, 0, 1, 1);
    } catch (error) {
      throw new Error("头像受浏览器安全策略限制，暂时无法导出");
    }

    ctx.fillStyle = accentColor;
    ctx.font = '700 90px "Microsoft YaHei", serif';
    ctx.fillText(roleName, centerX, titleNameY);

    ctx.fillStyle = "rgba(232,201,99,0.92)";
    ctx.font = '500 38px "Microsoft YaHei", serif';
    ctx.fillText(roleTitle, centerX, titleBottomY);

    if (rows.length > 0) {
      let rowY = traitsStartY;
      ctx.font = '500 29px "Microsoft YaHei", serif';
      for (const r of rows) {
        let x = centerX - r.width / 2;
        for (const item of r.items) {
          ctx.fillStyle = `rgba(${ar}, ${ag}, ${ab}, 0.24)`;
          ctx.fillRect(x, rowY - 36, item.width, pillH);
          ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, 0.62)`;
          ctx.lineWidth = 1.4;
          ctx.strokeRect(x, rowY - 36, item.width, pillH);
          ctx.fillStyle = "rgba(247,232,196,0.98)";
          ctx.fillText(item.text, x + item.width / 2, rowY + 3);
          x += item.width + traitGap;
        }
        rowY += pillH + traitRowGap;
      }
    }

    ctx.fillStyle = "rgba(26, 8, 8, 0.88)";
    ctx.fillRect(contentX, quoteBoxY, contentW, quoteBoxH);
    ctx.strokeStyle = `rgba(${ar}, ${ag}, ${ab}, 0.52)`;
    ctx.lineWidth = 1.6;
    ctx.strokeRect(contentX, quoteBoxY, contentW, quoteBoxH);

    ctx.fillStyle = "rgba(244,228,188,0.96)";
    ctx.font = 'italic 500 46px "STSong", serif';
    let quoteY = quoteStartY;
    for (let i = 0; i < quoteLines.length; i += 1) {
      const prefix = i === 0 ? "“" : "";
      const suffix = i === quoteLines.length - 1 ? "”" : "";
      const line = `${prefix}${quoteLines[i]}${suffix}`;
      ctx.fillText(line, centerX, quoteY);
      quoteY += 58;
    }

    ctx.fillStyle = "rgba(223,197,144,0.96)";
    ctx.font = '500 34px "Microsoft YaHei", serif';
    let descY = descStartY;
    for (const line of descLines) {
      ctx.fillText(line, centerX, descY);
      descY += 50;
    }

    ctx.fillStyle = "rgba(20,7,7,0.9)";
    ctx.fillRect(contentX, infoY, contentW, infoH);
    ctx.strokeStyle = "rgba(184,148,62,0.66)";
    ctx.strokeRect(contentX, infoY, contentW, infoH);

    const dividerGrad = ctx.createLinearGradient(contentX + 70, 0, contentX + contentW - 70, 0);
    dividerGrad.addColorStop(0, "rgba(35,24,24,0)");
    dividerGrad.addColorStop(0.5, "rgba(12,8,8,0.9)");
    dividerGrad.addColorStop(1, "rgba(35,24,24,0)");
    ctx.strokeStyle = dividerGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(contentX + 70, infoY + 24);
    ctx.lineTo(contentX + contentW - 70, infoY + 24);
    ctx.stroke();

    ctx.fillStyle = "rgba(247,232,196,0.98)";
    ctx.font = '600 48px "Microsoft YaHei", serif';
    ctx.fillText(author, centerX, infoY + 92);
    ctx.fillStyle = "rgba(232,201,99,0.92)";
    ctx.font = '500 36px "Microsoft YaHei", serif';
    ctx.fillText(social, centerX, infoY + 156);

    return canvas;
  }

  function triggerBlobDownload(blob, filename) {
    if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === "function") {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return;
    }

    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    }, 400);
  }

  function triggerDataUrlDownload(dataUrl, filename) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    window.setTimeout(() => {
      document.body.removeChild(link);
    }, 200);
  }

  function withTimeout(promise, timeoutMs, timeoutMessage) {
    let timer = null;
    const timeoutPromise = new Promise((_, reject) => {
      timer = window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => {
      if (timer) window.clearTimeout(timer);
    });
  }

  function hexToRgb(hex) {
    if (typeof hex !== "string") return null;
    const normalized = hex.trim().replace("#", "");
    if (!/^[\da-fA-F]{3}$|^[\da-fA-F]{6}$/.test(normalized)) return null;
    const full = normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
    const intValue = Number.parseInt(full, 16);
    return {
      r: (intValue >> 16) & 255,
      g: (intValue >> 8) & 255,
      b: intValue & 255
    };
  }

  function applyRoleTheme(roleKey, profile) {
    const roleColorMap = {
      yongzheng: "#b70f0f",
      kangxi: "#d5b347",
      baye: "#4d86d9",
      shisanye: "#4fae5e"
    };
    const accentColor = profile?.themeColor || profile?.nameColor || roleColorMap[roleKey] || "#d5b347";
    const rgb = hexToRgb(accentColor) || { r: 213, g: 179, b: 71 };
    const inkColor = `rgba(${Math.min(rgb.r + 80, 255)}, ${Math.min(rgb.g + 70, 255)}, ${Math.min(
      rgb.b + 70,
      255
    )}, 0.95)`;

    resultPage.style.setProperty("--role-accent", accentColor);
    resultPage.style.setProperty("--role-accent-rgb", `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    resultPage.style.setProperty("--role-accent-ink", inkColor);
  }

  function calculateUserScores() {
    const nextScores = [...BASE_SCORES];

    selectedAnswers.forEach((answer) => {
      if (!answer || !Array.isArray(answer.scoreChanges)) return;
      for (let i = 0; i < nextScores.length; i += 1) {
        const delta = Number(answer.scoreChanges[i] || 0);
        nextScores[i] += delta;
      }
    });

    userScores = nextScores.map(clampScore);
    return userScores;
  }

  function calculateDistance(candidateStats, targetStats) {
    let total = 0;
    for (let i = 0; i < 5; i += 1) {
      const weight = MATCH_DIMENSION_WEIGHTS[i] || 1;
      total += Math.abs((candidateStats[i] || 0) - (targetStats[i] || 0)) * weight;
    }
    return total;
  }

  function calculateShapeSimilarity(candidateStats, targetStats) {
    let dot = 0;
    let candidateNorm = 0;
    let targetNorm = 0;

    for (let i = 0; i < 5; i += 1) {
      const candidateCentered = (candidateStats[i] || 0) - SCORE_CENTER;
      const targetCentered = (targetStats[i] || 0) - SCORE_CENTER;
      dot += candidateCentered * targetCentered;
      candidateNorm += candidateCentered ** 2;
      targetNorm += targetCentered ** 2;
    }

    if (candidateNorm === 0 || targetNorm === 0) {
      return 0;
    }

    return dot / Math.sqrt(candidateNorm * targetNorm);
  }

  function calculateMaxDifference(candidateStats, targetStats) {
    let maxDiff = 0;
    for (let i = 0; i < 5; i += 1) {
      maxDiff = Math.max(maxDiff, Math.abs((candidateStats[i] || 0) - (targetStats[i] || 0)));
    }
    return maxDiff;
  }

  function buildCandidateMatch(key, profile, finalScores) {
    const stats = Array.isArray(profile?.stats) ? profile.stats : [];
    return {
      key,
      profile,
      distance: calculateDistance(stats, finalScores),
      shapeSimilarity: calculateShapeSimilarity(stats, finalScores),
      maxDifference: calculateMaxDifference(stats, finalScores)
    };
  }

  function compareCandidateMatches(a, b) {
    if (Math.abs(a.shapeSimilarity - b.shapeSimilarity) > MATCH_EPSILON) {
      return b.shapeSimilarity - a.shapeSimilarity;
    }

    if (Math.abs(a.distance - b.distance) > MATCH_EPSILON) {
      return a.distance - b.distance;
    }

    if (Math.abs(a.maxDifference - b.maxDifference) > MATCH_EPSILON) {
      return a.maxDifference - b.maxDifference;
    }

    return a.key.localeCompare(b.key);
  }

  function matchClosestCharacter(finalScores) {
    const entries = Object.entries(characterMap).filter(([, profile]) => {
      return profile && Array.isArray(profile.stats) && profile.stats.length === 5;
    });

    if (entries.length === 0) {
      return { key: "unknown", profile: null };
    }

    const ranked = entries
      .map(([key, profile]) => buildCandidateMatch(key, profile, finalScores))
      .sort(compareCandidateMatches);

    return { key: ranked[0].key, profile: ranked[0].profile };
  }

  function hideAllPages() {
    homePage.style.display = "none";
    quizPage.style.display = "none";
    resultPage.style.display = "none";
    homePage.classList.remove("screen-active", "screen-fade-out");
    quizPage.classList.remove("screen-active");
    resultPage.classList.remove("screen-active");
  }

  function renderAbilityChart(stats) {
    if (!window.Chart) return;
    const ctx = chartCanvas.getContext("2d");
    if (!ctx) return;

    if (abilityChartInstance) {
      abilityChartInstance.destroy();
    }

    const dimNames = ["人味", "做事", "权谋", "心态", "野心"];
    const labels = dimNames.map((name, index) => {
      const value = Math.round(Number(stats[index] ?? 0));
      return `${name}\n${value}分`;
    });

    abilityChartInstance = new Chart(ctx, {
      type: "radar",
      data: {
        labels,
        datasets: [
          {
            label: "",
            data: stats,
            borderColor: "rgba(236, 199, 90, 0.92)",
            backgroundColor: "rgba(184, 148, 62, 0.24)",
            pointBackgroundColor: "rgba(244, 228, 188, 1)",
            pointBorderColor: "rgba(98, 22, 22, 0.95)",
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: {
              display: false,
              stepSize: 20,
              color: "rgba(232, 201, 99, 0.85)",
              backdropColor: "transparent"
            },
            grid: {
              color: "rgba(143, 107, 40, 0.32)"
            },
            angleLines: {
              color: "rgba(184, 148, 62, 0.38)"
            },
            pointLabels: {
              color: "rgba(247, 232, 196, 0.98)",
              font: {
                size: 12,
                family: '"Noto Serif SC", "STSong", "SimSun", serif',
                lineHeight: 1.35
              }
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  function showResultPage() {
    const finalScores = calculateUserScores();
    const { key: roleKey, profile } = matchClosestCharacter(finalScores);
    const fallbackProfile = characterMap.liwei || null;
    const finalProfile = profile || fallbackProfile;
    if (!finalProfile) return;

    console.log("用户五维分数：", finalScores);
    console.log("匹配角色：", roleKey);

    hideAllPages();
    resultPage.style.display = "block";
    requestAnimationFrame(() => {
      resultPage.classList.add("screen-active");
    });

    applyRoleTheme(roleKey, finalProfile);
    const dynamicNameColor =
      finalProfile.themeColor ||
      finalProfile.nameColor ||
      getComputedStyle(resultPage).getPropertyValue("--role-accent").trim();

    const avatarUrl = finalProfile.avatarUrl || finalProfile.avatarImage || "";
    if (avatarUrl) {
      resultAvatarImg.src = avatarUrl;
      resultAvatarImg.alt = finalProfile.name || "角色头像";
      resultAvatarImg.classList.add("is-visible");
      resultAvatarText.classList.add("is-hidden");
    } else {
      resultAvatarImg.removeAttribute("src");
      resultAvatarImg.classList.remove("is-visible");
      resultAvatarText.classList.remove("is-hidden");
      resultAvatarText.textContent = finalProfile.avatar || finalProfile.name?.slice(0, 1) || "朕";
    }
    resultQuote.textContent = finalProfile.quote || "“谋定而后动，知止而有得。”";
    posterDownloadCharacterName = finalProfile.name || "未知";
    resultName.textContent = finalProfile.name;
    resultName.style.color = dynamicNameColor;
    resultTitle.textContent = finalProfile.title;
    resultDesc.textContent = finalProfile.desc;

    const traits = Array.isArray(finalProfile.traits) ? finalProfile.traits : [];
    resultTraits.innerHTML = "";
    traits.forEach((trait) => {
      const tag = document.createElement("span");
      tag.className = "result-trait";
      tag.textContent = trait;
      resultTraits.appendChild(tag);
    });
    renderAbilityChart(finalScores);
  }

  function updateNavButtons() {
    prevBtn.disabled = currentQuestionIndex === 0;
    nextBtn.textContent =
      currentQuestionIndex === questions.length - 1 ? "宣读圣旨" : "下一题";

    const hasAnswer = Boolean(selectedAnswers[currentQuestionIndex]);
    nextBtn.disabled = !hasAnswer;
  }

  function showQuizPage() {
    homePage.classList.remove("screen-active");
    homePage.classList.add("screen-fade-out");
    statusText.textContent = "圣旨已下，正在入局...";

    setTimeout(() => {
      homePage.style.display = "none";
      quizPage.style.display = "block";
      requestAnimationFrame(() => {
        quizPage.classList.add("screen-active");
      });
    }, 260);
  }

  function renderQuestion() {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    progressText.textContent = `${currentQuestionIndex + 1}/${questions.length}`;
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100;
    progressBarFill.style.width = `${progressPercent}%`;
    questionText.textContent = currentQuestion.question;
    optionsContainer.innerHTML = "";

    currentQuestion.options.forEach((option) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "option-btn";
      button.textContent = `${option.key}. ${option.text}`;
      button.dataset.key = option.key;

      const currentAnswer = selectedAnswers[currentQuestionIndex];
      if (currentAnswer && currentAnswer.key === option.key) {
        button.classList.add("selected");
      }

      button.addEventListener("click", () => {
        const optionButtons = optionsContainer.querySelectorAll(".option-btn");
        optionButtons.forEach((btn) => {
          btn.classList.remove("selected");
        });
        button.classList.add("selected");

        selectedAnswers[currentQuestionIndex] = {
          key: option.key,
          scoreChanges: Array.isArray(option.scoreChanges)
            ? option.scoreChanges
            : [0, 0, 0, 0, 0]
        };

        calculateUserScores();
        nextBtn.disabled = false;

        const canAutoNext = currentQuestionIndex < questions.length - 1;
        if (canAutoNext) {
          currentQuestionIndex += 1;
          renderQuestion();
        }
      });

      optionsContainer.appendChild(button);
    });

    updateNavButtons();
  }

  prevBtn.addEventListener("click", () => {
    if (currentQuestionIndex === 0) return;
    currentQuestionIndex -= 1;
    renderQuestion();
  });

  nextBtn.addEventListener("click", () => {
    const hasAnswer = Boolean(selectedAnswers[currentQuestionIndex]);
    if (!hasAnswer) return;

    if (currentQuestionIndex === questions.length - 1) {
      showResultPage();
      return;
    }

    currentQuestionIndex += 1;
    renderQuestion();
  });

  startBtn.addEventListener("click", () => {
    if (questions.length === 0) {
      statusText.textContent = "题库为空，请先补充题目。";
      return;
    }

    currentQuestionIndex = 0;
    userScores = [...BASE_SCORES];
    selectedAnswers.fill(null);
    showQuizPage();
    renderQuestion();
  });

  savePosterBtn.addEventListener("click", async () => {
    const originalText = savePosterBtn.textContent.trim();
    const downloadName = buildPosterDownloadFilename();

    savePosterBtn.disabled = true;
    savePosterBtn.textContent = "正在生成海报...";

    try {
      const richCanvas = await withTimeout(
        paintFallbackPosterCanvas(),
        3200,
        "生成超时"
      );
      await downloadCanvasAsImage(richCanvas, downloadName);

      savePosterBtn.textContent = "已下载";
      window.setTimeout(() => {
        if (savePosterBtn.textContent === "已下载") {
          savePosterBtn.textContent = originalText;
        }
      }, 1800);
    } catch (error) {
      console.error("生成海报失败：", error);
      const errMessage = String(error?.message || "");
      savePosterBtn.textContent = errMessage.includes("安全策略")
        ? "浏览器限制本地图片导出，请用本地服务打开"
        : "头像未加载成功，请稍后重试";
      window.setTimeout(() => {
        savePosterBtn.textContent = originalText;
      }, 2600);
    } finally {
      savePosterBtn.disabled = false;
      if (savePosterBtn.textContent === "正在生成海报...") {
        savePosterBtn.textContent = originalText;
      }
    }
  });

  rewardBtn.addEventListener("click", () => {
    openRewardModal();
  });

  closeRewardModalBtn.addEventListener("click", () => {
    closeRewardModal();
  });

  rewardModal.addEventListener("click", (event) => {
    if (event.target === rewardModal) {
      closeRewardModal();
    }
  });

  restartBtn.addEventListener("click", () => {
    currentQuestionIndex = 0;
    userScores = [...BASE_SCORES];
    selectedAnswers.fill(null);
    statusText.textContent = "";
    closeRewardModal();

    if (abilityChartInstance) {
      abilityChartInstance.destroy();
      abilityChartInstance = null;
    }

    hideAllPages();
    homePage.style.display = "block";
    requestAnimationFrame(() => {
      homePage.classList.add("screen-active");
    });
  });
})();
