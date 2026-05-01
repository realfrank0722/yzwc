function getCarouselProfiles(characterMap) {
  return Object.values(characterMap || {}).filter((profile) => {
    return profile && profile.name && profile.avatarUrl;
  });
}

function buildRoleTag(profile) {
  const raw = String(profile.title || "").trim();
  if (!raw) return "YONGZHENG";
  return raw.replace(/[，。、“”《》]/g, " ").split(/\s+/).filter(Boolean).slice(0, 2).join(" ").toUpperCase();
}

function buildRoleShort(profile) {
  const key = String(profile.key || "").trim();
  return key ? key.slice(0, 3).toUpperCase() : "YZW";
}

function createCard(profile) {
  const card = document.createElement("article");
  card.className = "p16-card";
  const accentColor = profile.themeColor || profile.nameColor || "#4298b4";
  card.style.setProperty("--card-accent", accentColor);

  const topBar = document.createElement("div");
  topBar.className = "p16-card-top";
  topBar.style.background = accentColor;

  const head = document.createElement("div");
  head.className = "p16-card-head";

  const avatarWrap = document.createElement("div");
  avatarWrap.className = "p16-avatar-wrap";

  const img = document.createElement("img");
  img.className = "p16-avatar";
  img.src = profile.avatarUrl;
  img.alt = profile.name;
  img.loading = "lazy";
  img.decoding = "async";

  const badge = document.createElement("span");
  badge.className = "p16-avatar-badge";
  badge.textContent = "“";
  avatarWrap.append(img, badge);

  const info = document.createElement("div");
  info.className = "p16-role";

  const name = document.createElement("h3");
  name.className = "p16-role-name";
  name.textContent = profile.name;

  const title = document.createElement("p");
  title.className = "p16-role-title";
  title.style.color = accentColor;
  title.textContent = buildRoleTag(profile);

  const short = document.createElement("p");
  short.className = "p16-role-short";
  short.textContent = `(${buildRoleShort(profile)})`;

  info.append(name, title, short);
  head.append(avatarWrap, info);

  const quote = document.createElement("p");
  quote.className = "p16-quote";
  quote.textContent = profile.quote || profile.title || "人物判词加载中";

  card.append(topBar, head, quote);
  return card;
}

function syncActiveDot(carousel, dots) {
  const cards = Array.from(carousel.querySelectorAll(".p16-card"));
  if (!cards.length) return;
  const viewportCenter = carousel.scrollLeft + carousel.clientWidth / 2;
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
  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
}

function bindMenuInteractions() {
  const menuBtn = document.getElementById("screenplayMenuBtn");
  const menu = document.getElementById("screenplayMenu");
  if (!menuBtn || !menu) return;

  function closeMenu() {
    menu.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  }

  menuBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    const nextExpanded = menuBtn.getAttribute("aria-expanded") !== "true";
    menuBtn.setAttribute("aria-expanded", String(nextExpanded));
    menu.hidden = !nextExpanded;
  });

  document.addEventListener("click", (event) => {
    if (!menu.contains(event.target) && event.target !== menuBtn) {
      closeMenu();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

export function initHomeView({ characterMap, screenplayKey }) {
  const carousel = document.getElementById("homeCarousel");
  const dotsWrap = document.getElementById("homeCarouselDots");
  const prevBtn = document.getElementById("homeCarouselPrev");
  const nextBtn = document.getElementById("homeCarouselNext");
  if (!carousel || !dotsWrap || !prevBtn || !nextBtn) return;

  const body = document.body;
  body.classList.add("theme-lobby");
  body.classList.remove("theme-yzwc");
  bindMenuInteractions();
  if (screenplayKey === "yongzheng") {
    body.classList.remove("theme-lobby");
    body.classList.add("theme-yzwc");
  }

  const profiles = getCarouselProfiles(characterMap).slice(0, 10);
  carousel.innerHTML = "";
  dotsWrap.innerHTML = "";
  if (!profiles.length) return;

  const dots = profiles.map((profile, index) => {
    carousel.appendChild(createCard(profile));
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "p16-dot";
    dot.setAttribute("aria-label", `跳转到第 ${index + 1} 张角色卡`);
    dot.addEventListener("click", () => {
      const card = carousel.children[index];
      if (!card) return;
      carousel.scrollTo({ left: card.offsetLeft - 12, behavior: "smooth" });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      syncActiveDot(carousel, dots);
      ticking = false;
    });
  };

  carousel.addEventListener("scroll", onScroll, { passive: true });
  const step = () => Math.max(260, Math.floor(carousel.clientWidth * 0.86));
  prevBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: -step(), behavior: "smooth" });
  });
  nextBtn.addEventListener("click", () => {
    carousel.scrollBy({ left: step(), behavior: "smooth" });
  });
  syncActiveDot(carousel, dots);
}

