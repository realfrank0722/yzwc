export function renderResultProfileView({
  finalProfile,
  dynamicNameColor,
  refs,
  renderResultDesc
}) {
  const {
    resultAvatarImg,
    resultAvatarText,
    resultQuote,
    resultName,
    resultTitle,
    resultTraits
  } = refs;

  const rawAvatarUrl = String(finalProfile.avatarUrl || finalProfile.avatarImage || "").trim();
  const resolveAsset = window.currentScreenplay?.resolveAsset || ((value) => value);
  const avatarUrl = rawAvatarUrl ? resolveAsset(rawAvatarUrl) : "";
  if (avatarUrl) {
    const extensionMatch = avatarUrl.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    const currentExt = extensionMatch ? extensionMatch[1].toLowerCase() : "";
    const fallbackExts = ["jpg", "png", "jpeg", "webp"];
    const candidateUrls = [avatarUrl];

    if (currentExt) {
      const replaceExt = (ext) => avatarUrl.replace(new RegExp(`\\.${currentExt}(\\?.*)?$`, "i"), `.${ext}$1`);
      fallbackExts
        .filter((ext) => ext !== currentExt)
        .forEach((ext) => candidateUrls.push(replaceExt(ext)));
    }

    let avatarLoadIndex = 0;
    const applyTextFallback = () => {
      resultAvatarImg.removeAttribute("src");
      resultAvatarImg.classList.remove("is-visible");
      resultAvatarText.classList.remove("is-hidden");
      resultAvatarText.textContent = finalProfile.avatar || finalProfile.name?.slice(0, 1) || "朕";
      resultAvatarImg.onerror = null;
    };

    resultAvatarImg.alt = finalProfile.name || "角色头像";
    resultAvatarImg.onerror = () => {
      avatarLoadIndex += 1;
      if (avatarLoadIndex >= candidateUrls.length) {
        applyTextFallback();
        return;
      }
      resultAvatarImg.src = candidateUrls[avatarLoadIndex];
    };
    resultAvatarImg.src = candidateUrls[avatarLoadIndex];
    resultAvatarImg.classList.add("is-visible");
    resultAvatarText.classList.add("is-hidden");
  } else {
    resultAvatarImg.removeAttribute("src");
    resultAvatarImg.classList.remove("is-visible");
    resultAvatarText.classList.remove("is-hidden");
    resultAvatarText.textContent = finalProfile.avatar || finalProfile.name?.slice(0, 1) || "朕";
    resultAvatarImg.onerror = null;
  }

  resultQuote.textContent = finalProfile.quote || "“谋定而后动，知止而有得。”";
  resultName.textContent = finalProfile.name;
  resultName.style.color = dynamicNameColor;
  resultTitle.textContent = finalProfile.title;
  renderResultDesc(finalProfile.desc);

  const traits = Array.isArray(finalProfile.traits) ? finalProfile.traits : [];
  resultTraits.innerHTML = "";
  traits.forEach((trait) => {
    const tag = document.createElement("span");
    tag.className = "result-trait";
    tag.textContent = trait;
    resultTraits.appendChild(tag);
  });
}

export function renderAbilityRadarChart({ chartCanvas, stats, dimensions = [], previousChartInstance }) {
  if (!window.Chart) return previousChartInstance || null;
  const ctx = chartCanvas.getContext("2d");
  if (!ctx) return previousChartInstance || null;

  if (previousChartInstance) {
    previousChartInstance.destroy();
  }

  const dimNames = Array.isArray(dimensions) && dimensions.length
    ? dimensions.map((item, index) => item?.label || item?.shortLabel || `维度${index + 1}`)
    : ["人味", "做事", "权谋", "心态", "野心"];
  const labels = dimNames.map((name, index) => {
    const value = Math.round(Number(stats[index] ?? 0));
    return `${name}\n${value}分`;
  });

  return new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "",
          data: stats,
          borderColor: "rgba(139, 104, 150, 0.92)",
          backgroundColor: "rgba(139, 104, 150, 0.24)",
          pointBackgroundColor: "rgba(239, 229, 243, 1)",
          pointBorderColor: "rgba(139, 104, 150, 0.95)",
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
            color: "rgba(139, 104, 150, 0.85)",
            backdropColor: "transparent"
          },
          grid: {
            color: "rgba(139, 104, 150, 0.32)"
          },
          angleLines: {
            color: "rgba(139, 104, 150, 0.38)"
          },
          pointLabels: {
            color: "rgba(75, 56, 82, 0.98)",
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

