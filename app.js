(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduceMotion = motionPreference.matches;
  const particlePhysics = window.AstraParticlePhysics;

  const reloadForMotionPreference = () => window.location.reload();
  if (motionPreference.addEventListener) motionPreference.addEventListener("change", reloadForMotionPreference);
  else motionPreference.addListener(reloadForMotionPreference);

  const benchmarkData = {
    frontier: {
      science: {
        title: "Terminal-Bench Science 0.1",
        score: "64.6%",
        description:
          "Astra reaches 64.6% on scientific research workflows, ahead of the compared models while using fewer output tokens.",
        xLabel: "Estimated API cost",
        yLabel: "Resolution rate",
        xMax: 80,
        yMin: 20,
        yMax: 70,
        series: [
          { name: "GPT-6 Astra", color: "#7eaeff", points: [[11, 54], [13, 57], [16, 61], [26, 64.6]] },
          { name: "GPT-5.6 Sol", color: "#274d89", points: [[20, 22.4]] },
          { name: "Claude Fable 5.1", color: "#9b654e", points: [[11, 26], [14, 36], [20, 40], [32, 50], [38, 52.6]] },
          { name: "Claude Fable 5", color: "#7d4835", points: [[67, 21.4]] },
          { name: "Claude Opus 5", color: "#b06442", points: [[33, 30]] },
        ],
      },
      arc: {
        title: "ARC-AGI-3",
        score: "99.9%",
        description:
          "Astra solves 99.9% of the comparison set and surpasses the human action-efficiency baseline on 96% of levels.",
        xLabel: "Attempts",
        yLabel: "Score",
        xMax: 4,
        yMin: 0,
        yMax: 100,
        series: [
          { name: "GPT-6 Astra", color: "#7eaeff", points: [[1, 91], [2, 97], [3, 99], [4, 99.9]] },
          { name: "GPT-5.6 Sol", color: "#274d89", points: [[1, 7.8]] },
          { name: "Claude Opus 5", color: "#b06442", points: [[1, 30.2]] },
        ],
      },
      math: {
        title: "FrontierMath Tier 4 (v2)",
        score: "97.6%",
        description:
          "Astra nearly saturates the hardest tier of FrontierMath, extending its performance as more inference effort is applied.",
        xLabel: "Inference effort",
        yLabel: "Accuracy",
        xMax: 4,
        yMin: 60,
        yMax: 100,
        series: [
          { name: "GPT-6 Astra", color: "#7eaeff", points: [[1, 85], [2, 91], [3, 95], [4, 97.6]] },
          { name: "GPT-5.6 Sol", color: "#274d89", points: [[1, 72], [2, 77], [3, 81], [4, 83]] },
          { name: "Claude Fable 5.1", color: "#9b654e", points: [[1, 74], [2, 81], [3, 85], [4, 87.8]] },
        ],
      },
      terminal: {
        title: "Terminal-Bench 4.0",
        score: "57.9%",
        description:
          "Across difficult terminal-based work, Astra reaches a new high while remaining more efficient than the closest comparison.",
        xLabel: "Estimated API cost",
        yLabel: "Resolution rate",
        xMax: 100,
        yMin: 10,
        yMax: 65,
        series: [
          { name: "GPT-6 Astra", color: "#7eaeff", points: [[35, 46], [51, 53], [69, 57.9]] },
          { name: "GPT-5.6 Sol", color: "#274d89", points: [[28, 30], [46, 37.3]] },
          { name: "Claude Fable 5.1", color: "#9b654e", points: [[48, 46], [73, 55.8]] },
        ],
      },
      automation: {
        title: "AutomationBench",
        score: "41.4%",
        description:
          "Astra more than doubles the previous OpenAI result on multi-application business automation tasks.",
        xLabel: "Output tokens (thousands)",
        yLabel: "Success rate",
        xMax: 50,
        yMin: 0,
        yMax: 50,
        series: [
          { name: "GPT-6 Astra", color: "#7eaeff", points: [[19, 34], [27, 39], [34, 41.4]] },
          { name: "GPT-5.6 Sol", color: "#274d89", points: [[23, 18.1]] },
          { name: "Claude Fable 5.1", color: "#9b654e", points: [[31, 31.4]] },
        ],
      },
    },
    computer: {
      ale: {
        title: "Agents’ Last Exam",
        score: "59.3%",
        description: "Complex professional tasks completed in real desktop software.",
        bars: [
          ["Astra", 59.3, "#82afff"],
          ["Opus 5", 55.5, "#b36a49"],
          ["Sol", 53.6, "#315282"],
        ],
      },
      screenspot: {
        title: "ScreenSpot-Pro",
        score: "92.7%",
        description: "Visual grounding accuracy on difficult interface targets, without extra tools.",
        bars: [
          ["Astra", 92.7, "#82afff"],
          ["Fable 5", 87.3, "#b36a49"],
          ["Sol", 76.9, "#315282"],
        ],
      },
      osworld: {
        title: "OSWorld 2.0",
        score: "72.6%",
        description: "Astra completes more computer tasks in roughly 47% less time than Sol.",
        bars: [
          ["Astra", 72.6, "#82afff"],
          ["Opus 5", 70.2, "#b36a49"],
          ["Sol", 65.7, "#315282"],
        ],
      },
    },
  };

  const demoData = {
    circuit: {
      title: "KiCad · PCB Editor",
      caption: "Astra turns an electronic schematic into a manufacturable printed circuit board.",
      note: "15 second condensed playback",
      url: "https://player.vimeo.com/video/1223245030?h=02ddfd452c&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2197212129-0583a46f759ca3b0df2b2c6be3c75071da2e1881d7423264e014c4bc5b537dac-d_1280x720?region=us",
    },
    excel: {
      title: "Microsoft Excel · Financial Model",
      caption: "Astra completes a timed spreadsheet modeling challenge and checks formula consistency.",
      note: "Real-time tool use",
      url: "https://player.vimeo.com/video/1223244513?h=36ddeb3405&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196412132-8dedb2c916622756e939e46c526ea0158202673d4d1fcfa6cf2d5d626135f76d-d_1280x720?region=us",
    },
    game: {
      title: "Unity · Game Development",
      caption: "Astra debugs movement, adjusts a scene, and verifies play behavior inside a game engine.",
      note: "Condensed playback",
      url: "https://player.vimeo.com/video/1223245272?h=a733ab0ddc&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196413198-f373f1199cda8f56828b47b7336130b03b884920c461935fba7ffee1bf592a31-d_1280x720?region=us",
    },
    form: {
      title: "Browser · Form 1040",
      caption: "Astra transfers information carefully through a long tax form while preserving user control.",
      note: "Demonstration workflow",
      url: "https://player.vimeo.com/video/1225421841?h=a2f0abffab&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2199136058-93f02ff6074cf68ef38509d5c6812e644df1a06ead118643d9814e9ba6dc7f83-d_1280x720?region=us",
    },
    qa: {
      title: "Browser · Frontend QA",
      caption: "Astra explores a site, catches visual and behavioral defects, then validates the repair.",
      note: "Autonomous QA loop",
      url: "https://player.vimeo.com/video/1223244489?h=2fb95c1683&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196412093-3896787141ffee7f15a1f1418244b79fdc63aa38b02f2d3e975339bd9878e211-d_1280x720?region=us",
    },
  };

  const artifactTemplates = {
    slides: `
      <div class="deck-window">
        <aside><i></i><i></i><i></i><i></i></aside>
        <div class="deck-slide"><p>OPENAI</p><h3>GPT-Gaia</h3><span>A multimodal frontier</span><div class="gaia-orb"></div></div>
      </div>`,
    sheet: `
      <div class="deck-window">
        <aside><i></i><i></i><i></i><i></i></aside>
        <div class="deck-slide sheet-artifact"><p>OPERATING MODEL · FY27</p><h3>Plan / Actual</h3><span>Scenario summary and forecast</span><div class="mini-bars"><i></i><i></i><i></i><i></i><i></i></div></div>
      </div>`,
    document: `
      <div class="deck-window">
        <aside><i></i><i></i><i></i><i></i></aside>
        <div class="deck-slide doc-artifact"><p>NORTHSTAR PARTNERS</p><h3>Market brief</h3><span>September 2026 · Confidential</span><div class="doc-lines"><i></i><i></i><i></i><i></i><i></i></div></div>
      </div>`,
  };

  const lifeData = {
    pediatrician: {
      title: "Pediatrician search",
      time: "2 min 54 sec",
      caption: "Astra researches local pediatricians, compares constraints, and leaves the final choice with the user.",
      url: "https://player.vimeo.com/video/1223356211?h=382415d2ce&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196552762-dc227ff844cdf943fcd1efe98f42cf893d1020bd71849b2d564974b0e5915308-d_1280x720?region=us",
    },
    apartment: {
      title: "Apartment hunting",
      time: "9 min 57 sec",
      caption: "Astra filters listings, checks commute tradeoffs, and organizes the strongest options for review.",
      url: "https://player.vimeo.com/video/1223356202?h=a5ef84da7a&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196552748-940b75771da8865849e2e0a364d67c1e0f86be7a8bf7d4213d73255832fd2766-d_1280x720?region=us",
    },
    dmv: {
      title: "DMV appointment",
      time: "5 min 10 sec",
      caption: "Astra navigates availability and prepares an appointment without crossing the final confirmation boundary.",
      url: "https://player.vimeo.com/video/1223356203?h=86de343691&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196552754-b9b48a996a2b26c974d2aff98eb8a65596e9a0708bd2fb67a9544e238ab2fa56-d_1280x720?region=us",
    },
    snacks: {
      title: "Low-carb snacks",
      time: "17 min 33 sec",
      caption: "Astra researches nutrition constraints across stores and builds a concise, practical shortlist.",
      url: "https://player.vimeo.com/video/1223356256?h=4ebe24e00c&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196552759-329673dc32e19e892d84178a558ac83ab6568d3ea0b8fa7fd0552fccb853031f-d_1280x720?region=us",
    },
    kindergarten: {
      title: "Kindergarten analysis",
      time: "8 min 6 sec",
      caption: "Astra compares school information while clearly separating source facts from judgment calls.",
      url: "https://player.vimeo.com/video/1223356287?h=8ce72318f6&badge=0&autopause=0&controls=1&autoplay=1&muted=1&loop=1",
      poster: "https://i.vimeocdn.com/video/2196552809-0d9b60da0f76c668c97e651cbb4107f12d5737b2bddb2ee721dc26f3ceadb4f7-d_1280x720?region=us",
    },
  };

  const careerData = {
    career: {
      src: "https://images.ctfassets.net/kftzwdyauwt9/6XttKhMddBzO6pT2IY2brG/841e9a215931057aeb578e1aa45f9bb4/career-website-dark-v3.png?w=1920&q=90&fm=webp",
      alt: "Side-by-side model collaboration comparison for a career website",
    },
    college: {
      src: "https://images.ctfassets.net/kftzwdyauwt9/4d6F9Qm6SO8jMmGTmvcu4z/946d6933964a568092edfaaa31139a78/college-search-dark-v3.png?w=1920&q=90&fm=webp",
      alt: "Side-by-side model collaboration comparison for a college search",
    },
    grocery: {
      src: "https://images.ctfassets.net/kftzwdyauwt9/5IMd0F5gAoupyhZ82J8FQL/8fb6f3c063e62b6fee18d78d7432061e/grocery-list-dark-v3.png?w=1920&q=90&fm=webp",
      alt: "Side-by-side model collaboration comparison for a grocery list",
    },
  };

  const gameData = {
    race: {
      title: "TIDAL RUSH",
      button: "Launch interactive game",
      caption: "A vivid, playable kart-racing game created from a prompt. Credit: Pietro Schirano.",
      url: "https://tidal-rush-paradise-gp.skirano.chatgpt.site/",
      className: "",
    },
    ship: {
      title: "VOID EXPLORER",
      button: "Open ship inspector",
      caption: "Explore a generated fleet, inspect modules, switch camera modes, and open blueprint views.",
      url: "https://voidexplorer-shipyard.openai.chatgpt.site/?fleetSeed=2692616455",
      className: "ship-mode",
    },
  };

  function initNavigation() {
    const header = $("[data-header]");
    const mobileButton = $("[data-mobile-menu]");
    const drawer = $("[data-mobile-drawer]");
    const searchOpen = $("[data-search-open]");
    const searchClose = $("[data-search-close]");
    const searchOverlay = $("[data-search-overlay]");
    const searchInput = $("#site-search");
    const main = $("main");
    const footer = $(".site-footer");
    let previousY = 0;
    let drawerWasOpen = false;
    let searchWasOpen = false;

    const syncModalState = () => {
      const drawerOpen = document.body.classList.contains("drawer-open");
      const searchIsOpen = document.body.classList.contains("search-open");
      main.inert = drawerOpen || searchIsOpen;
      footer.inert = drawerOpen || searchIsOpen;
      header.inert = searchIsOpen;
      drawer.inert = !drawerOpen;
      searchOverlay.inert = !searchIsOpen;
    };

    const setDrawer = (open) => {
      drawerWasOpen = document.body.classList.contains("drawer-open");
      if (open && document.body.classList.contains("search-open")) setSearch(false, false);
      document.body.classList.toggle("drawer-open", open);
      mobileButton.setAttribute("aria-expanded", String(open));
      mobileButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      drawer.setAttribute("aria-hidden", String(!open));
      syncModalState();
      if (open) window.setTimeout(() => $("a", drawer)?.focus(), 60);
      else if (drawerWasOpen) mobileButton.focus();
    };

    const setSearch = (open, restoreFocus = true) => {
      searchWasOpen = document.body.classList.contains("search-open");
      if (open && document.body.classList.contains("drawer-open")) setDrawer(false);
      document.body.classList.toggle("search-open", open);
      searchOverlay.setAttribute("aria-hidden", String(!open));
      syncModalState();
      if (open) window.setTimeout(() => searchInput.focus(), 200);
      else if (searchWasOpen && restoreFocus) searchOpen.focus();
    };

    mobileButton.addEventListener("click", () => setDrawer(!document.body.classList.contains("drawer-open")));
    $$("a", drawer).forEach((link) => link.addEventListener("click", () => setDrawer(false)));
    searchOpen.addEventListener("click", () => setSearch(true));
    searchClose.addEventListener("click", () => setSearch(false));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setDrawer(false);
        setSearch(false);
      }
      if (event.key !== "Tab") return;
      const activeModal = document.body.classList.contains("search-open")
        ? searchOverlay
        : document.body.classList.contains("drawer-open")
          ? drawer
          : null;
      if (!activeModal) return;
      const selector = "a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex='-1'])";
      const focusable = $$(selector, activeModal).filter((element) => element.offsetParent !== null);
      if (activeModal === drawer) focusable.unshift(mobileButton);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    $$(".nav-disclosure").forEach((button) => {
      button.addEventListener("click", () => {
        const item = button.closest(".nav-item");
        const open = !item.classList.contains("menu-open");
        $$(".nav-item").forEach((active) => {
          active.classList.remove("menu-open");
          $(".nav-disclosure", active)?.setAttribute("aria-expanded", "false");
        });
        item.classList.toggle("menu-open", open);
        button.setAttribute("aria-expanded", String(open));
      });
    });

    const updateScrollState = () => {
      const y = window.scrollY;
      header.classList.toggle("scrolled", y > 20);
      header.classList.toggle("nav-hidden", y > previousY + 8 && y > 420 && !document.body.classList.contains("drawer-open"));
      if (y < previousY - 6) header.classList.remove("nav-hidden");
      document.body.classList.toggle("entered", y > window.innerHeight * 0.55);
      previousY = y;
    };
    window.addEventListener("scroll", updateScrollState, { passive: true });
    updateScrollState();
    syncModalState();
    return { setSearch };
  }

  function initSearch(setSearch) {
    const form = $("[data-search-form]");
    const input = $("#site-search");
    const results = $("[data-search-results]");
    const entries = $$("main h2, main h3")
      .map((heading) => {
        const target = heading.closest("[id]") || heading;
        if (!target.id) target.id = `section-${Math.random().toString(36).slice(2, 8)}`;
        return { title: heading.textContent.trim(), id: target.id };
      })
      .filter((entry, index, all) => all.findIndex((candidate) => candidate.title === entry.title) === index);

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const query = input.value.trim().toLowerCase();
      const matches = entries.filter((entry) => entry.title.toLowerCase().includes(query)).slice(0, 6);
      results.innerHTML = matches.length
        ? matches.map((entry) => `<a class="search-result" href="#${entry.id}"><span>${entry.title}</span><span>↘</span></a>`).join("")
        : `<p>No matching section. Try “computer”, “coding”, or “availability”.</p>`;
      $$("a", results).forEach((link) =>
        link.addEventListener(
          "click",
          (clickEvent) => {
            clickEvent.preventDefault();
            const destination = document.getElementById(decodeURIComponent(link.hash.slice(1)));
            if (!destination) return;
            const focusTarget = destination.matches("h2, h3") ? destination : $("h2, h3", destination) || destination;
            setSearch(false, false);
            window.history.pushState(null, "", link.hash);
            destination.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            if (!focusTarget.hasAttribute("tabindex")) {
              focusTarget.tabIndex = -1;
              focusTarget.addEventListener("blur", () => focusTarget.removeAttribute("tabindex"), { once: true });
            }
            window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
          },
          { once: true },
        ),
      );
    });
  }

  function initReveal() {
    if (reduceMotion || !("IntersectionObserver" in window)) {
      $$(".reveal").forEach((element) => element.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -6%" },
    );
    $$(".reveal").forEach((element) => observer.observe(element));
  }

  function initLaunchFilm() {
    const container = $("[data-video-card]");
    const cover = $(".film-cover", container);
    cover.addEventListener("click", () => {
      const frame = document.createElement("iframe");
      frame.src = "https://player.vimeo.com/video/1222553704?h=ee86f55524&autoplay=1&title=0&byline=0&portrait=0";
      frame.title = "GPT-6 Astra launch film";
      frame.allow = "autoplay; fullscreen; picture-in-picture";
      frame.allowFullscreen = true;
      container.classList.add("is-playing");
      cover.replaceWith(frame);
    });
  }

  function svgNode(tag, attributes = {}, text = "") {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  }

  function renderLineChart(panel, data) {
    const svg = $("[data-chart]", panel);
    const legend = $("[data-chart-legend]", panel);
    const title = $("[data-chart-title]", panel);
    const description = $("[data-chart-description]", panel);
    if (!svg) return;

    const metricIndex = Number(panel.dataset.metricIndex || 0);
    const metric = [
      { name: "API cost", label: data.xLabel, factor: 1 },
      { name: "Simulated time", label: "Simulated time (minutes)", factor: 2.4 },
      { name: "Output tokens", label: "Output tokens (thousands)", factor: 0.72 },
    ][metricIndex];
    const displayData = {
      ...data,
      xLabel: metric.label,
      xMax: data.xMax * metric.factor,
      series: data.series.map((series) => ({
        ...series,
        points: series.points.map(([xValue, yValue]) => [xValue * metric.factor, yValue]),
      })),
    };
    $(".metric-chip", panel).firstChild.textContent = `${metric.name} `;
    title.textContent = displayData.title;
    description.textContent = displayData.description;
    legend.innerHTML = displayData.series
      .map((series, index) => `<span data-series="${index}"><i style="--legend-color:${series.color}"></i>${series.name}</span>`)
      .join("");
    svg.replaceChildren();

    const bounds = { left: 72, right: 724, top: 30, bottom: 355 };
    const x = (value) => bounds.left + (value / displayData.xMax) * (bounds.right - bounds.left);
    const y = (value) =>
      bounds.bottom - ((value - displayData.yMin) / (displayData.yMax - displayData.yMin)) * (bounds.bottom - bounds.top);

    for (let index = 0; index <= 5; index += 1) {
      const value = displayData.yMin + ((displayData.yMax - displayData.yMin) / 5) * index;
      const yPos = y(value);
      svg.append(svgNode("line", { x1: bounds.left, y1: yPos, x2: bounds.right, y2: yPos, class: "grid-line" }));
      svg.append(svgNode("text", { x: bounds.left - 13, y: yPos + 5, "text-anchor": "end" }, `${Math.round(value)}%`));
    }
    for (let index = 0; index <= 4; index += 1) {
      const value = (displayData.xMax / 4) * index;
      const xPos = x(value);
      svg.append(svgNode("text", { x: xPos, y: bounds.bottom + 27, "text-anchor": "middle" }, `${Math.round(value)}`));
    }
    svg.append(svgNode("line", { x1: bounds.left, y1: bounds.top, x2: bounds.left, y2: bounds.bottom, class: "axis-line" }));
    svg.append(svgNode("line", { x1: bounds.left, y1: bounds.bottom, x2: bounds.right, y2: bounds.bottom, class: "axis-line" }));
    svg.append(svgNode("text", { x: 398, y: 414, "text-anchor": "middle" }, displayData.xLabel));
    const yTitle = svgNode("text", { x: 17, y: 193, "text-anchor": "middle", transform: "rotate(-90 17 193)" }, displayData.yLabel);
    svg.append(yTitle);

    displayData.series.forEach((series, seriesIndex) => {
      if (series.points.length > 1) {
        const points = series.points.map(([xValue, yValue]) => `${x(xValue)},${y(yValue)}`).join(" ");
        svg.append(svgNode("polyline", { points, class: "series-line", stroke: series.color, "data-series": seriesIndex }));
      }
      series.points.forEach(([xValue, yValue], pointIndex) => {
        const point = svgNode(seriesIndex === 0 ? "path" : "circle", {
          class: "chart-point",
          fill: series.color,
          "data-series": seriesIndex,
          style: `animation-delay:${pointIndex * 75}ms`,
        });
        if (seriesIndex === 0) {
          const cx = x(xValue);
          const cy = y(yValue);
          point.setAttribute("d", `M${cx},${cy - 9} L${cx + 2.6},${cy - 2.7} L${cx + 9},${cy - 2.7} L${cx + 3.8},${cy + 1.2} L${cx + 5.7},${cy + 8} L${cx},${cy + 4.1} L${cx - 5.7},${cy + 8} L${cx - 3.8},${cy + 1.2} L${cx - 9},${cy - 2.7} L${cx - 2.6},${cy - 2.7} Z`);
        } else {
          point.setAttribute("cx", x(xValue));
          point.setAttribute("cy", y(yValue));
          point.setAttribute("r", "5.5");
        }
        const tooltip = svgNode("title", {}, `${series.name} · ${Math.round(yValue * 10) / 10}% · ${Math.round(xValue * 10) / 10} ${metric.name.toLowerCase()}`);
        point.append(tooltip);
        svg.append(point);
      });
    });

    $$("span[data-series]", legend).forEach((item) => {
      item.addEventListener("pointerenter", () => {
        const activeSeries = item.dataset.series;
        $$('[data-series]', legend).forEach((entry) => entry.classList.toggle("is-dimmed", entry.dataset.series !== activeSeries));
        $$('[data-series]', svg).forEach((entry) => entry.classList.toggle("is-dimmed", entry.dataset.series !== activeSeries));
      });
      item.addEventListener("pointerleave", () => {
        $$('[data-series]', legend).forEach((entry) => entry.classList.remove("is-dimmed"));
        $$('[data-series]', svg).forEach((entry) => entry.classList.remove("is-dimmed"));
      });
    });
  }

  function renderBars(panel, data) {
    $("[data-chart-title]", panel).textContent = data.title;
    $("[data-big-score]", panel).textContent = data.score;
    $("[data-chart-description]", panel).textContent = data.description;
    $("[data-bars]", panel).innerHTML = data.bars
      .map(
        ([name, value, color]) => `
          <div class="bar-row">
            <span>${name}</span>
            <div class="bar-track"><i style="--bar:${value}%;--bar-color:${color}"></i></div>
            <strong>${value}%</strong>
          </div>`,
      )
      .join("");
  }

  function initBenchmarks() {
    $$("[data-benchmark]").forEach((panel) => {
      const group = panel.dataset.benchmark;
      const tabs = $$("[role='tab'][data-tab]", panel);
      let activeIndex = 0;
      let interval;

      const select = (index, userInitiated = false) => {
        activeIndex = index;
        tabs.forEach((tab, tabIndex) => tab.setAttribute("aria-selected", String(tabIndex === index)));
        const data = benchmarkData[group][tabs[index].dataset.tab];
        if (group === "frontier") renderLineChart(panel, data);
        else renderBars(panel, data);
        if (userInitiated && interval) {
          window.clearInterval(interval);
          interval = window.setInterval(() => select((activeIndex + 1) % tabs.length), 7000);
        }
      };

      tabs.forEach((tab, index) => {
        tab.addEventListener("click", () => select(index, true));
        tab.addEventListener("keydown", (event) => {
          if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          const offset = event.key === "ArrowRight" ? 1 : -1;
          const next = (index + offset + tabs.length) % tabs.length;
          tabs[next].focus();
          select(next, true);
        });
      });

      select(0);
      const metricButton = $(".metric-chip", panel);
      if (metricButton) {
        panel.dataset.metricIndex = "0";
        metricButton.addEventListener("click", () => {
          panel.dataset.metricIndex = String((Number(panel.dataset.metricIndex) + 1) % 3);
          select(activeIndex, true);
        });
      }
      if (!reduceMotion) interval = window.setInterval(() => select((activeIndex + 1) % tabs.length), 7000);
    });

    $$(".download-button").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = button.closest("[data-benchmark]");
        const group = panel.dataset.benchmark;
        const active = $("[role='tab'][aria-selected='true']", panel).dataset.tab;
        const blob = new Blob([JSON.stringify(benchmarkData[group][active], null, 2)], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${active}-benchmark.json`;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      });
    });
  }

  function setupTabs(container, selector, panel, onSelect) {
    const tabs = $$(selector, container);
    const panelId = panel.id || `tabpanel-${Math.random().toString(36).slice(2, 8)}`;
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");

    const activate = (index, moveFocus = false, scrollTab = false) => {
      tabs.forEach((tab, tabIndex) => {
        const selected = tabIndex === index;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
      });
      const active = tabs[index];
      panel.setAttribute("aria-labelledby", active.id);
      onSelect(active, index);
      if (scrollTab) active.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest", inline: "center" });
      if (moveFocus) active.focus();
    };

    tabs.forEach((tab, index) => {
      tab.id ||= `tab-${Math.random().toString(36).slice(2, 8)}`;
      tab.setAttribute("aria-controls", panelId);
      tab.addEventListener("click", () => activate(index, false, true));
      tab.addEventListener("keydown", (event) => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activate(next, true, true);
      });
    });
    activate(Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true")));
    return { activate, tabs };
  }

  function initDemoTabs() {
    const container = $("[data-demo-tabs]");
    const visual = $("[data-demo-visual]", container);
    const title = $("[data-demo-title]", container);
    const caption = $("[data-demo-caption]", container);
    const note = $(".demo-caption span", container);

    setupTabs(container, "[data-demo]", visual, (button) => {
      const data = demoData[button.dataset.demo];
      title.textContent = data.title;
      caption.textContent = data.caption;
      note.textContent = data.note;
      visual.classList.remove("is-playing");
      visual.innerHTML = `
        <iframe src="${data.url}" title="${data.title} demonstration" allow="autoplay; fullscreen; picture-in-picture" loading="lazy"></iframe>
        <button class="media-cover" style="--poster:url('${data.poster}')" aria-label="Play the ${data.title} demonstration">
          <span class="play-disc"><i></i></span><small>View playback</small>
        </button>`;
      $(".media-cover", visual).addEventListener("click", () => visual.classList.add("is-playing"));
    });
  }

  function initArtifacts() {
    const container = $("[data-artifacts]");
    const stage = $("[data-artifact-stage]", container);
    stage.style.transition = "opacity 180ms ease";
    setupTabs(container, "[data-artifact]", stage, (button) => {
      stage.style.opacity = "0";
      window.setTimeout(() => {
        stage.innerHTML = artifactTemplates[button.dataset.artifact];
        stage.style.opacity = "1";
      }, 180);
    });
  }

  function initLifeTabs() {
    const container = $("[data-life-tabs]");
    const media = $(".life-media", container);
    const frame = $("[data-life-frame]", container);
    const cover = $("[data-life-cover]", container);
    const title = $("[data-life-title]", container);
    const time = $("[data-life-time]", container);
    const caption = $("[data-life-caption]", container);
    cover.addEventListener("click", () => media.classList.add("is-playing"));

    setupTabs(container, "[data-life]", media, (button) => {
      const data = lifeData[button.dataset.life];
      title.textContent = data.title;
      time.textContent = data.time;
      caption.textContent = data.caption;
      frame.title = `${data.title} demonstration`;
      frame.src = data.url;
      cover.style.setProperty("--poster", `url('${data.poster}')`);
      cover.setAttribute("aria-label", `Play the ${data.title} demonstration`);
      media.classList.remove("is-playing");
    });
  }

  function initCareerTabs() {
    const container = $("[data-career-tabs]");
    const panel = $(".career-image", container);
    const image = $("[data-career-image]", container);
    setupTabs(container, "[data-career]", panel, (button) => {
      const data = careerData[button.dataset.career];
      image.style.opacity = "0";
      window.setTimeout(() => {
        image.src = data.src;
        image.alt = data.alt;
        image.style.opacity = "1";
      }, 160);
    });
  }

  function initGame() {
    const container = $(".game-showcase");
    const frame = $(".game-frame", container);
    let iframe = $("iframe", frame);
    const placeholder = $("[data-game-placeholder]", frame);
    const heading = $("h3", placeholder);
    const button = $("[data-load-game]", placeholder);
    const fallback = $("[data-game-fallback]", placeholder);
    const caption = $(".media-caption", container);
    let activeGame = gameData.race;
    let fallbackTimer;
    let loadRequest = 0;

    setupTabs(container, "[data-game]", frame, (tab) => {
      activeGame = gameData[tab.dataset.game];
      loadRequest += 1;
      window.clearTimeout(fallbackTimer);
      const freshIframe = iframe.cloneNode(false);
      freshIframe.removeAttribute("src");
      iframe.replaceWith(freshIframe);
      iframe = freshIframe;
      iframe.title = `${activeGame.title} interactive demo`;
      frame.classList.remove("is-loaded");
      placeholder.className = `game-placeholder ${activeGame.className}`.trim();
      heading.textContent = activeGame.title;
      button.innerHTML = `${activeGame.button} <span>↗</span>`;
      button.disabled = false;
      fallback.href = activeGame.url;
      fallback.classList.remove("is-visible");
      caption.textContent = activeGame.caption;
    });

    button.addEventListener("click", () => {
      const request = ++loadRequest;
      const requestedGame = activeGame;
      const requestedFrame = iframe;
      button.disabled = true;
      button.firstChild.textContent = "Loading experience ";
      requestedFrame.addEventListener(
        "load",
        () => {
          if (request !== loadRequest || !requestedFrame.isConnected) return;
          window.clearTimeout(fallbackTimer);
          frame.classList.add("is-loaded");
          button.disabled = false;
        },
        { once: true },
      );
      requestedFrame.src = requestedGame.url;
      fallbackTimer = window.setTimeout(() => {
        if (request !== loadRequest) return;
        button.disabled = false;
        button.firstChild.textContent = "Try loading again ";
        fallback.classList.add("is-visible");
      }, 8000);
    });
  }

  function initAccordions() {
    $$(".table-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const section = button.closest(".table-section");
        const open = section.classList.toggle("is-open");
        button.setAttribute("aria-expanded", String(open));
        $("i", button).textContent = open ? "−" : "+";
      });
    });
  }

  function initCursorStage() {
    const stage = $("[data-cursor-stage]");
    const pointer = $(".cursor-pointer", stage);
    const glow = $(".cursor-glow", stage);
    const orbits = $$(".cursor-orbit", stage);
    let x = 0;
    let y = 0;
    let dragging = false;

    const update = () => {
      pointer.style.transform = `translate(${x}px, ${y}px) rotate(-7deg)`;
      glow.style.transform = `translate(${x}px, ${y}px)`;
      orbits[0].style.transform = `rotate(${-24 + x * 0.035}deg) translate(${x * 0.04}px, ${y * 0.04}px)`;
      orbits[1].style.transform = `rotate(${48 - y * 0.035}deg) translate(${x * -0.03}px, ${y * 0.03}px)`;
    };

    stage.addEventListener("pointerdown", (event) => {
      dragging = true;
      stage.setPointerCapture(event.pointerId);
    });
    stage.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      const rect = stage.getBoundingClientRect();
      x = Math.max(-rect.width * 0.3, Math.min(rect.width * 0.3, event.clientX - rect.left - rect.width / 2));
      y = Math.max(-rect.height * 0.3, Math.min(rect.height * 0.3, event.clientY - rect.top - rect.height / 2));
      update();
    });
    const stopDragging = () => (dragging = false);
    stage.addEventListener("pointerup", stopDragging);
    stage.addEventListener("pointercancel", stopDragging);
    stage.addEventListener("lostpointercapture", stopDragging);
    stage.addEventListener("keydown", (event) => {
      const directions = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] };
      if (!directions[event.key]) return;
      event.preventDefault();
      x = Math.max(-180, Math.min(180, x + directions[event.key][0]));
      y = Math.max(-150, Math.min(150, y + directions[event.key][1]));
      update();
    });
  }

  class Starfield {
    constructor(canvas, mode, density) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true });
      if (!this.context) throw new Error("Canvas rendering is unavailable.");
      this.mode = mode;
      this.density = density;
      this.count = 0;
      this.stars = [];
      this.width = 0;
      this.height = 0;
      this.rotationX = 0;
      this.rotationY = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.progress = 0;
      this.start = performance.now();
      this.last = this.start;
      this.pointer = {
        active: false,
        pressed: false,
        previousX: 0,
        previousY: 0,
        x: 0,
        y: 0,
        velocityX: 0,
        velocityY: 0,
        radius: 88,
        maximumSpeed: 70,
        lastMove: -Infinity,
      };
      this.sprites = {
        cool: this.createGlowSprite(false),
        warm: this.createGlowSprite(true),
      };
      this.ready = false;
      this.visible = true;
      this.frameRequest = null;
      this.resize = this.resize.bind(this);
      this.draw = this.draw.bind(this);
      this.resize();
      window.addEventListener("resize", this.resize, { passive: true });
      if (this.mode === "hero" && "IntersectionObserver" in window) {
        this.observer = new IntersectionObserver(([entry]) => {
          this.visible = entry.isIntersecting;
          this.schedule();
        }, { rootMargin: "120px" });
        this.observer.observe(this.canvas);
      }
      if (this.mode === "space") window.addEventListener("scroll", () => this.schedule(), { passive: true });
      document.addEventListener("visibilitychange", () => this.schedule());
      this.schedule();
    }

    createGlowSprite(warm) {
      const sprite = document.createElement("canvas");
      const size = 64;
      sprite.width = size;
      sprite.height = size;
      const context = sprite.getContext("2d");
      const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, "rgba(255,255,255,1)");
      gradient.addColorStop(0.1, warm ? "rgba(255,224,205,.98)" : "rgba(234,247,255,.98)");
      gradient.addColorStop(0.28, warm ? "rgba(239,161,117,.56)" : "rgba(163,211,255,.56)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, size, size);
      return sprite;
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      const pixelBudget = this.mode === "hero" ? 2000000 : 1500000;
      const budgetRatio = Math.sqrt(pixelBudget / Math.max(1, rect.width * rect.height));
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5, budgetRatio);
      this.width = rect.width;
      this.height = rect.height;
      this.count = window.innerWidth < 700 ? this.density.mobile : this.density.desktop;
      this.canvas.width = Math.max(1, Math.round(rect.width * ratio));
      this.canvas.height = Math.max(1, Math.round(rect.height * ratio));
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.build();
      this.schedule();
    }

    schedule() {
      if (!reduceMotion && this.frameRequest === null) this.frameRequest = requestAnimationFrame(this.draw);
    }

    seeded(index, offset = 0) {
      const value = Math.sin(index * 91.771 + offset * 37.117) * 43758.5453;
      return value - Math.floor(value);
    }

    build() {
      this.stars = [];
      const scale = Math.min(this.width, this.height) / 720;
      const galaxyCount = this.mode === "hero" ? Math.floor(this.count * 0.88) : 0;
      const outerCount = Math.floor(galaxyCount * 0.34);
      const spiralCount = Math.floor(galaxyCount * 0.34);
      const tailCount = Math.floor(galaxyCount * 0.24);
      for (let index = 0; index < this.count; index += 1) {
        const randomA = this.seeded(index, 1);
        const randomB = this.seeded(index, 2);
        const randomC = this.seeded(index, 3);
        const layer = this.mode === "hero" ? (index < galaxyCount ? "galaxy" : "ambient") : "space";
        let structure = layer;
        let x;
        let y;

        if (layer === "galaxy") {
          if (index < outerCount) {
            structure = "outer";
            const angle = randomA * Math.PI * 2;
            const thickness = (randomB - 0.5) * 46;
            x = Math.cos(angle) * (183 + thickness) * scale;
            y = (68 + Math.sin(angle) * (150 + thickness * 0.46)) * scale;
          } else if (index < outerCount + spiralCount) {
            structure = "spiral";
            const t = randomA;
            const angle = -0.35 + t * Math.PI * 2.85;
            const thickness = (randomB - 0.5) * (25 - t * 10);
            const radius = 139 * Math.pow(1 - t, 0.82) + 12 + thickness;
            x = Math.cos(angle) * radius * scale;
            y = (68 + Math.sin(angle) * radius * 0.84) * scale;
          } else if (index < outerCount + spiralCount + tailCount) {
            structure = "tail";
            const t = randomA;
            const one = 1 - t;
            x = (
              one * one * one * -142 +
              3 * one * one * t * -235 +
              3 * one * t * t * -120 +
              t * t * t * 190 +
              (randomB - 0.5) * 30
            ) * scale;
            y = (
              one * one * one * -27 +
              3 * one * one * t * -190 +
              3 * one * t * t * -285 +
              t * t * t * -242 +
              (randomC - 0.5) * 26
            ) * scale;
          } else {
            structure = "core";
            const angle = randomA * Math.PI * 2;
            const radius = Math.sqrt(randomB) * 27;
            x = Math.cos(angle) * radius * scale;
            y = (68 + Math.sin(angle) * radius * 0.8) * scale;
          }
        } else if (layer === "ambient") {
          x = randomA * this.width;
          y = randomB * this.height;
        } else {
          x = (randomA - 0.5) * this.width * 1.3;
          y = (randomB - 0.5) * this.height * 1.25;
        }
        this.stars.push({
          layer,
          structure,
          x,
          y,
          z: layer === "ambient" ? 0 : (randomC - 0.5) * (structure === "core" ? 80 : 260),
          radius:
            layer === "galaxy"
              ? 0.2 + Math.pow(this.seeded(index, 4), 3) * (structure === "core" ? 5.4 : 4.3)
              : 0.3 + this.seeded(index, 4) * 1.45,
          phase: this.seeded(index, 5) * Math.PI * 2,
          warm: this.seeded(index, 6) > 0.84,
          brightness: (structure === "core" ? 0.58 : 0.3) + this.seeded(index, 7) * (structure === "core" ? 0.42 : 0.7),
          mass: 0.65 + this.seeded(index, 10) * 1.75,
          offsetX: 0,
          offsetY: 0,
          velocityX: 0,
          velocityY: 0,
          screenX: 0,
          screenY: 0,
        });
      }
    }

    draw(time) {
      this.frameRequest = null;
      const delta = Math.min(250, time - this.last);
      const frameScale = Math.max(0.25, delta / (1000 / 60));
      this.last = time;
      const paused = document.hidden || (this.mode === "hero" && !this.visible) || (this.mode === "space" && !document.body.classList.contains("entered"));
      if (paused) return;
      this.context.clearRect(0, 0, this.width, this.height);
      const rotationEase = 1 - Math.exp((-5.5 * frameScale) / 60);
      this.rotationX += (this.targetX - this.rotationX) * rotationEase;
      this.rotationY += (this.targetY - this.rotationY) * rotationEase;
      if (this.mode === "hero") this.progress = Math.min(1, (time - this.start) / 1800);

      const scrollShift = this.mode === "space" ? (window.scrollY * 0.025) % this.height : 0;
      const coreCenter =
        this.mode === "hero"
          ? particlePhysics.projectLayerPoint(
              { layer: "galaxy", x: 0, y: 68 * (Math.min(this.width, this.height) / 720), z: 0 },
              this.rotationX * 0.5,
              this.rotationY * 0.5,
              this.width,
              this.height,
            )
          : null;
      const coreSpin = (time - this.start) * 0.000288;
      const render = (star, index) => {
        const rotationScale =
          star.structure === "tail" ? 0.7 : star.structure === "spiral" ? 0.82 : star.structure === "core" ? 0.5 : 1;
        const projected = particlePhysics.projectLayerPoint(
          star,
          this.rotationX * rotationScale,
          this.rotationY * rotationScale,
          this.width,
          this.height,
        );
        const intro = this.mode === "hero" && star.layer === "galaxy" ? 1 - Math.pow(1 - this.progress, 3) : 1;
        const scatter = star.layer === "galaxy" ? (1 - intro) * (220 + this.seeded(index, 8) * 380) : 0;
        const scatterAngle = this.seeded(index, 9) * Math.PI * 2;
        let anchorX = projected.screenX;
        let anchorY = projected.screenY;
        if (star.structure === "core") {
          const relativeX = anchorX - coreCenter.screenX;
          const relativeY = anchorY - coreCenter.screenY;
          anchorX = coreCenter.screenX + relativeX * Math.cos(coreSpin) - relativeY * Math.sin(coreSpin);
          anchorY = coreCenter.screenY + relativeX * Math.sin(coreSpin) + relativeY * Math.cos(coreSpin);
        } else if (star.layer === "galaxy") {
          const flowAmplitude = star.structure === "outer" ? 0.012 : star.structure === "spiral" ? 0.009 : 0.005;
          const flow = Math.sin((time - this.start) * 0.0011 + star.phase) * flowAmplitude;
          const relativeX = anchorX - coreCenter.screenX;
          const relativeY = anchorY - coreCenter.screenY;
          anchorX = coreCenter.screenX + relativeX * Math.cos(flow) - relativeY * Math.sin(flow);
          anchorY = coreCenter.screenY + relativeX * Math.sin(flow) + relativeY * Math.cos(flow);
        }
        star.screenX = anchorX + Math.cos(scatterAngle) * scatter;
        star.screenY = anchorY + Math.sin(scatterAngle) * scatter * 0.62;

        if (star.layer === "galaxy" || star.layer === "ambient") {
          particlePhysics.stepDisturbance(star, this.pointer, frameScale);
        }

        const screenX = star.screenX + star.offsetX;
        let screenY = star.screenY + star.offsetY + scrollShift;
        if (this.mode === "space" && screenY > this.height + 10) screenY -= this.height + 20;
        const pulse = 0.72 + Math.sin(time * 0.0013 + star.phase) * 0.28;
        const layerOpacity = star.layer === "ambient" ? 0.58 : 1;
        const fade = this.mode === "hero" ? (star.layer === "ambient" ? Math.min(1, this.progress * 2.4) : intro) : 0.7;
        const alpha = Math.max(0.03, star.brightness * pulse * layerOpacity * fade);
        const radiusScale = star.layer === "galaxy" ? 1.15 : 0.72;
        const radius = star.radius * projected.depth * radiusScale;
        const spriteSize = Math.max(1.4, radius * 7.5);
        this.context.globalAlpha = alpha;
        this.context.drawImage(
          star.warm ? this.sprites.warm : this.sprites.cool,
          screenX - spriteSize / 2,
          screenY - spriteSize / 2,
          spriteSize,
          spriteSize,
        );
      };

      if (this.mode === "hero") {
        this.context.globalCompositeOperation = "lighter";
        this.stars.forEach((star, index) => star.layer === "galaxy" && render(star, index));
        this.stars.forEach((star, index) => star.layer === "ambient" && render(star, index));
        this.context.globalCompositeOperation = "source-over";
      } else {
        this.stars.forEach(render);
      }
      this.pointer.active = false;
      this.pointer.velocityX = 0;
      this.pointer.velocityY = 0;
      this.context.globalAlpha = 1;
      if (this.mode === "hero" && !this.ready) {
        this.ready = true;
        const hero = this.canvas.closest(".hero");
        hero.classList.add("canvas-ready");
        this.canvas.setAttribute("role", "button");
        this.canvas.setAttribute(
          "aria-label",
          "Move your pointer to disturb the Astra star field. Drag or use arrow keys to rotate it.",
        );
        this.canvas.setAttribute("aria-hidden", "false");
        this.canvas.tabIndex = 0;
      }
      this.schedule();
    }

    trackPointer(clientX, clientY, pressed = false, time = performance.now()) {
      if (this.mode !== "hero") return;
      const rect = this.canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      const recent = time - this.pointer.lastMove < 160;
      const continuingSwipe = this.pointer.active && !pressed;
      const previousX = continuingSwipe ? this.pointer.previousX : recent ? this.pointer.x : x;
      const previousY = continuingSwipe ? this.pointer.previousY : recent ? this.pointer.y : y;
      const velocityX = recent ? x - previousX : 0;
      const velocityY = recent ? y - previousY : 0;

      this.pointer.previousX = previousX;
      this.pointer.previousY = previousY;
      this.pointer.x = x;
      this.pointer.y = y;
      this.pointer.velocityX = velocityX;
      this.pointer.velocityY = velocityY;
      this.pointer.radius = Math.max(70, Math.min(92, this.width * 0.075));
      this.pointer.pressed = pressed;
      this.pointer.lastMove = time;
      this.pointer.active = recent && !pressed && (velocityX !== 0 || velocityY !== 0);
    }

    releasePointer() {
      this.pointer.active = false;
      this.pointer.pressed = false;
      this.pointer.lastMove = -Infinity;
    }

    replay() {
      this.start = performance.now();
      this.progress = 0;
      this.rotationX = 0;
      this.rotationY = 0;
      this.targetX = 0;
      this.targetY = 0;
      this.releasePointer();
      this.stars.forEach((star) => {
        star.offsetX = 0;
        star.offsetY = 0;
        star.velocityX = 0;
        star.velocityY = 0;
      });
    }
  }

  function initCanvases() {
    if (reduceMotion) return;
    if (!particlePhysics) {
      return;
    }

    let hero;
    try {
      hero = new Starfield($("#hero-canvas"), "hero", { mobile: 1150, desktop: 2200 });
    } catch (error) {
      return;
    }
    let space = null;
    try {
      space = new Starfield($("#space-canvas"), "space", { mobile: 130, desktop: 260 });
    } catch (error) {
      space = null;
    }
    const canvas = $("#hero-canvas");
    let dragging = false;
    let activePointerId = null;
    let lastX = 0;
    let lastY = 0;
    const clampRotation = () => {
      hero.targetX = Math.max(-Math.PI * 4, Math.min(Math.PI * 4, hero.targetX));
      hero.targetY = Math.max(-Math.PI * 4, Math.min(Math.PI * 4, hero.targetY));
    };
    const faceForward = () => {
      hero.targetX = 0;
      hero.targetY = 0;
    };

    canvas.addEventListener("pointerdown", (event) => {
      if (!event.isPrimary || activePointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
      dragging = true;
      activePointerId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      hero.trackPointer(event.clientX, event.clientY, true);
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!event.isPrimary || (activePointerId !== null && event.pointerId !== activePointerId)) return;
      hero.trackPointer(event.clientX, event.clientY, dragging || event.buttons !== 0 || event.pointerType === "touch");
      if (!dragging) return;
      hero.targetY += (event.clientX - lastX) * 0.005;
      hero.targetX += (event.clientY - lastY) * 0.005;
      clampRotation();
      lastX = event.clientX;
      lastY = event.clientY;
    });
    const stopDragging = (event) => {
      if (activePointerId === null || event.pointerId !== activePointerId) return;
      dragging = false;
      activePointerId = null;
      faceForward();
      hero.releasePointer();
    };
    canvas.addEventListener("pointerup", stopDragging);
    canvas.addEventListener("pointercancel", stopDragging);
    canvas.addEventListener("lostpointercapture", stopDragging);
    canvas.addEventListener("pointerleave", () => {
      if (!dragging) hero.releasePointer();
    });
    canvas.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        hero.replay();
        return;
      }
      const changes = { ArrowLeft: [0, -0.08], ArrowRight: [0, 0.08], ArrowUp: [-0.08, 0], ArrowDown: [0.08, 0] };
      if (!changes[event.key]) return;
      event.preventDefault();
      hero.targetX += changes[event.key][0];
      hero.targetY += changes[event.key][1];
      clampRotation();
    });
    canvas.addEventListener("keyup", (event) => {
      if (event.key.startsWith("Arrow")) faceForward();
    });
    canvas.addEventListener("blur", faceForward);
    $("[data-replay]").addEventListener("click", () => hero.replay());

    window.addEventListener(
      "pointermove",
      (event) => {
        if (!space) return;
        space.targetY = ((event.clientX / window.innerWidth) - 0.5) * 0.08;
        space.targetX = ((event.clientY / window.innerHeight) - 0.5) * -0.05;
      },
      { passive: true },
    );
  }

  function init() {
    const navigation = initNavigation();
    initSearch(navigation.setSearch);
    initReveal();
    initLaunchFilm();
    initBenchmarks();
    initDemoTabs();
    initArtifacts();
    initLifeTabs();
    initCareerTabs();
    initGame();
    initAccordions();
    initCursorStage();
    initCanvases();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
