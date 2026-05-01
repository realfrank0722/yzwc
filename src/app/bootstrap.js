import { loadScreenplayRuntime } from "../scripts/loader.js";

function injectFooterBrand() {
  const navBrand = document.querySelector(".lobby-navbar .lobby-brand-wrap");
  if (!navBrand) {
    return;
  }

  const footers = document.querySelectorAll(".lobby-footer");
  footers.forEach((footer) => {
    if (footer.querySelector(".lobby-footer-brand")) {
      return;
    }

    const footerBrand = document.createElement("div");
    footerBrand.className = "lobby-footer-brand";
    footerBrand.appendChild(navBrand.cloneNode(true));
    footer.prepend(footerBrand);
  });
}

async function startLegacyApp() {
  injectFooterBrand();

  let runtimeLoadError = null;
  try {
    await loadScreenplayRuntime("yongzheng");
  } catch (error) {
    runtimeLoadError = error;
    console.error("[bootstrap] 剧本运行时加载失败：", error);
  }

  await import("./main.js");

  if (runtimeLoadError) {
    const status = document.getElementById("statusText");
    if (status) {
      status.textContent = "题库加载异常：弹窗可用，但入局后可能无法正常答题。";
    }
  }
}

startLegacyApp().catch((error) => {
  console.error("[bootstrap] 启动失败：", error);
  const status = document.getElementById("statusText");
  if (status) {
    status.textContent = "初始化失败，请刷新重试。";
  }
});

