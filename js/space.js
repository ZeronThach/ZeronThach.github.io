/*
  You don't need to edit this file.
  All of the space background's settings (pictures, sizes, gaps) are in js/config.js.

  What it draws when the space background is on:
  - planets down one side of the page
  - a rocket that travels down the screen as you scroll, leaving a dashed trail
    and showing its distance from Earth each time it passes a planet
  - space objects on the other side that visitors can drag and flick
  It only appears when the screen is wide enough to fit beside your content.
*/

(function () {
  if (typeof SITE === "undefined") return;

  // Older config files used  spaceBackground: true ; newer ones use a  space: { ... }  section
  const cfg = SITE.space || {};
  const isOn = SITE.space ? cfg.on !== false : SITE.spaceBackground === true;
  if (!isOn) return;

  const root = document.documentElement;
  const main = document.querySelector("main");
  if (!main) return;

  const has = (v) => typeof v === "string" && v.trim() !== "";
  const num = (v, fallback) => (typeof v === "number" && isFinite(v) ? v : fallback);
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Always produces the same "random" numbers, so the stars and asteroids don't jump around
  function seeded(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- Settings, with defaults for anything config.js leaves out ----------
  // Distances are roughly how close each planet gets to Earth
  // (its average distance from the Sun minus Earth's). Fun, not exact.
  const DEFAULT_PLANETS = [
    { name: "Earth",   distance: "Liftoff",         size: 170 },
    { name: "Mars",    distance: "78 million km",   size: 120 },
    { name: "Jupiter", distance: "629 million km",  size: 300 },
    { name: "Saturn",  distance: "1.28 billion km", size: 440 },
    { name: "Uranus",  distance: "2.72 billion km", size: 190 },
    { name: "Neptune", distance: "4.35 billion km", size: 170 },
    { name: "Pluto",   distance: "5.76 billion km", size: 75 },
  ];
  const DEFAULT_OBJECTS = [
    { drawing: "iss", size: 210 }, { drawing: "star", size: 52 }, { drawing: "astronaut", size: 90 },
    { drawing: "sparkle", size: 40 }, { drawing: "satellite", size: 150 }, { drawing: "sparkle", size: 58 },
    { drawing: "ufo", size: 130 }, { drawing: "comet", size: 180 }, { drawing: "star", size: 40 },
    { drawing: "sparkle", size: 46 },
  ];

  const mirrored = String(cfg.planetsSide || "left").toLowerCase() === "right";
  const peek = clamp(num(cfg.planetPeek, 0.6), 0.1, 1);
  const rocketCfg = cfg.rocket || {};
  const planetList = (Array.isArray(cfg.planets) && cfg.planets.length ? cfg.planets : DEFAULT_PLANETS)
    .filter((p) => p && (has(p.name) || has(p.image)));
  const objectList = (Array.isArray(cfg.objects) ? cfg.objects : DEFAULT_OBJECTS).filter(Boolean);
  if (!planetList.length) return;

  // Shows a red banner if a picture can't be found, so it's not a silent mystery
  function reportMissing(path) {
    const banner = document.getElementById("config-error");
    if (!banner) return;
    const line = document.createElement("div");
    line.textContent = `Couldn't load "${path}". Check that the file is uploaded and the name matches exactly, including capital letters.`;
    banner.append(line);
    banner.hidden = false;
  }

  const OUTLINE = "#232a33";

  // ---------- Built-in drawings (used when no image is set) ----------
  const DRAWN_PLANETS = {
    earth: { vb: { w: 200, h: 200 }, svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-earth"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#1e9be0"/>
        <g clip-path="url(#sp-earth)">
          <g fill="#2fb34f">
            <path d="M40 30c18-14 50-12 58 6 6 14-10 22-6 36 4 14-14 22-28 16-16-7-10-26-26-30C24 54 26 40 40 30z"/>
            <path d="M120 70c16-8 40 0 52 18 12 18 6 44-10 52-14 8-16 30-34 32-14 1-18-14-14-28 4-14-10-22-8-38 2-14 4-30 14-36z"/>
            <path d="M20 110c12 0 22 12 18 26-4 12 4 26-8 32-12 4-24-20-24-36 0-12 4-22 14-22z"/>
          </g>
          <g fill="#ffffff"><ellipse cx="70" cy="14" rx="34" ry="11"/><ellipse cx="128" cy="186" rx="40" ry="12"/><ellipse cx="160" cy="50" rx="18" ry="6"/></g>
        </g></svg>` },
    mars: { vb: { w: 200, h: 200 }, svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-mars"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#f07a2a"/>
        <g clip-path="url(#sp-mars)">
          <ellipse cx="100" cy="6" rx="46" ry="16" fill="#fff4ea"/>
          <path d="M60 52c14-8 34-2 38 12 3 12-12 14-10 26 2 10-12 16-22 8-10-8-2-20-12-28-8-6-4-14 6-18z" fill="#d6372b"/>
          <path d="M118 120c16-10 40-6 46 8 5 12-14 16-24 24-12 10-28 14-34 4-6-12 2-28 12-36z" fill="#d6372b"/>
          <circle cx="150" cy="70" r="9" fill="#c43226"/><circle cx="56" cy="140" r="12" fill="#de5a2c"/>
        </g></svg>` },
    jupiter: { vb: { w: 200, h: 200 }, svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-jupiter"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#f39a4c"/>
        <g clip-path="url(#sp-jupiter)" fill="none" stroke-linecap="round">
          <path d="M0 40c30-10 60 8 100 0s70-10 100 0" stroke="#f7c95c" stroke-width="12"/>
          <path d="M0 72c40 8 70-8 110 0s60 6 90-2" stroke="#e2622f" stroke-width="10"/>
          <path d="M0 104c30-6 70 6 100 0s70-8 100 2" stroke="#f7c95c" stroke-width="8"/>
          <path d="M0 150c40-8 60 8 100 2s70-8 100 0" stroke="#e2622f" stroke-width="12"/>
          <path d="M10 176c40 6 80-6 180 0" stroke="#f7c95c" stroke-width="8"/>
        </g>
        <ellipse cx="72" cy="126" rx="30" ry="18" fill="#d9302a"/><ellipse cx="78" cy="128" rx="13" ry="9" fill="#8f0f16"/>
        </svg>` },
    saturn: { vb: { w: 340, h: 200 }, svg: `<svg viewBox="0 0 340 200"><defs>
          <clipPath id="sp-saturn-front"><rect x="0" y="100" width="340" height="100"/></clipPath>
          <clipPath id="sp-saturn-disc"><circle cx="170" cy="100" r="80"/></clipPath></defs>
        <g transform="rotate(-14 170 100)">
          <ellipse cx="170" cy="100" rx="160" ry="34" fill="none" stroke="#b97b55" stroke-width="18"/>
          <circle cx="170" cy="100" r="80" fill="#f6c431"/>
          <g clip-path="url(#sp-saturn-disc)" fill="none" stroke="#e8a82a" stroke-width="9" stroke-linecap="round"><path d="M80 62h180M80 134h180"/></g>
          <ellipse cx="170" cy="100" rx="160" ry="34" fill="none" stroke="#b97b55" stroke-width="18" clip-path="url(#sp-saturn-front)"/>
        </g></svg>` },
    uranus: { vb: { w: 200, h: 240 }, svg: `<svg viewBox="0 0 200 240"><defs><clipPath id="sp-uranus-front"><rect x="0" y="0" width="100" height="240"/></clipPath></defs>
        <g transform="rotate(12 100 120)">
          <ellipse cx="100" cy="120" rx="24" ry="112" fill="none" stroke="#d6f3f7" stroke-width="5"/>
          <circle cx="100" cy="120" r="80" fill="#86d3e3"/>
          <path d="M32 92h136M34 150h132" stroke="#a6e2ee" stroke-width="10" stroke-linecap="round"/>
          <ellipse cx="100" cy="120" rx="24" ry="112" fill="none" stroke="#d6f3f7" stroke-width="5" clip-path="url(#sp-uranus-front)"/>
        </g></svg>` },
    neptune: { vb: { w: 200, h: 200 }, svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-neptune"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#2d6be0"/>
        <g clip-path="url(#sp-neptune)" fill="none" stroke-linecap="round" stroke-width="8">
          <path d="M20 50c30-8 60-6 90-12" stroke="#7aa2f5"/><path d="M40 82c34-6 70-4 120-12" stroke="#4a3fc4"/>
          <path d="M14 124c40-6 90-8 160-4" stroke="#7aa2f5"/><path d="M50 160c30-4 60-4 100-10" stroke="#4a3fc4"/>
        </g>
        <ellipse cx="130" cy="108" rx="18" ry="10" fill="#183d9e"/></svg>` },
   pluto: {
  vb: { w: 200, h: 200 },
  svg: `<svg viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="96" fill="#c9a07a"/>

    <circle cx="48" cy="70" r="10" fill="#a87e5a"/>
    <circle cx="58" cy="142" r="7" fill="#a87e5a"/>
    <circle cx="145" cy="52" r="8" fill="#a87e5a"/>
    <circle cx="165" cy="105" r="6" fill="#a87e5a"/>
    <circle cx="125" cy="155" r="9" fill="#a87e5a"/>
    <circle cx="85" cy="45" r="6" fill="#a87e5a"/>
    <circle cx="38" cy="115" r="5" fill="#a87e5a"/>
    <circle cx="105" cy="115" r="5" fill="#a87e5a"/>
    <circle cx="75" cy="170" r="5" fill="#a87e5a"/>
    <circle cx="155" cy="145" r="4" fill="#a87e5a"/>
  </svg>`
},
  };

  function issSvg() {
    const panel = (x, y) => {
      let s = `<rect x="${x}" y="${y}" width="40" height="38" fill="#2c5aa0" stroke="${OUTLINE}" stroke-width="2.5"/>`;
      s += `<path d="M${x + 13} ${y}v38M${x + 27} ${y}v38M${x} ${y + 13}h40M${x} ${y + 25}h40" stroke="#7fa3e0" stroke-width="1.5"/>`;
      return s;
    };
    return `<svg viewBox="0 0 240 110">
      <rect x="8" y="51" width="224" height="8" rx="2" fill="#9aa4ae" stroke="${OUTLINE}" stroke-width="2.5"/>
      ${panel(16, 8)}${panel(16, 64)}${panel(60, 8)}${panel(60, 64)}
      ${panel(140, 8)}${panel(140, 64)}${panel(184, 8)}${panel(184, 64)}
      <rect x="112" y="24" width="16" height="62" rx="6" fill="#e3e7eb" stroke="${OUTLINE}" stroke-width="2.5"/>
      <rect x="100" y="43" width="40" height="24" rx="9" fill="#f2f4f6" stroke="${OUTLINE}" stroke-width="2.5"/>
      <circle cx="120" cy="55" r="4" fill="#5fc3e8"/></svg>`;
  }

  const OBJECT_ART = {
    iss: { vb: { w: 240, h: 110 }, svg: issSvg() },
    astronaut: {
      vb: { w: 100, h: 130 },
      svg: `<svg viewBox="0 0 100 130">
        <rect x="22" y="38" width="56" height="56" rx="10" fill="#b9c2cc" stroke="${OUTLINE}" stroke-width="3"/>
        <g fill="none" stroke-linecap="round">
          <path d="M30 56Q10 62 12 84M70 56Q90 62 88 84M40 90V118M60 90V118" stroke="${OUTLINE}" stroke-width="18"/>
          <path d="M30 56Q10 62 12 84M70 56Q90 62 88 84M40 90V118M60 90V118" stroke="#f4f6f8" stroke-width="12"/>
        </g>
        <rect x="26" y="44" width="48" height="52" rx="16" fill="#f4f6f8" stroke="${OUTLINE}" stroke-width="3"/>
        <rect x="40" y="60" width="20" height="12" rx="3" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2"/>
        <circle cx="50" cy="30" r="24" fill="#f4f6f8" stroke="${OUTLINE}" stroke-width="3"/>
        <ellipse cx="50" cy="31" rx="16" ry="12" fill="#1f3b6e"/>
        <ellipse cx="44" cy="26" rx="5" ry="3" fill="#ffffff" opacity="0.7"/></svg>`,
    },
    satellite: {
      vb: { w: 160, h: 80 },
      svg: `<svg viewBox="0 0 160 80">
        <path d="M56 40H62M98 40H104M80 22V12" stroke="${OUTLINE}" stroke-width="3"/>
        <rect x="6" y="28" width="50" height="24" fill="#2c5aa0" stroke="${OUTLINE}" stroke-width="2.5"/>
        <rect x="104" y="28" width="50" height="24" fill="#2c5aa0" stroke="${OUTLINE}" stroke-width="2.5"/>
        <path d="M23 28v24M39 28v24M121 28v24M137 28v24" stroke="#7fa3e0" stroke-width="1.5"/>
        <rect x="62" y="22" width="36" height="36" rx="4" fill="#e3b23c" stroke="${OUTLINE}" stroke-width="2.5"/>
        <ellipse cx="80" cy="9" rx="14" ry="5" fill="#eef1f4" stroke="${OUTLINE}" stroke-width="2.5"/></svg>`,
    },
    ufo: {
      vb: { w: 140, h: 80 },
      svg: `<svg viewBox="0 0 140 80">
        <path d="M40 42Q70 0 100 42Z" fill="#8fe3f0" stroke="${OUTLINE}" stroke-width="2.5"/>
        <ellipse cx="70" cy="58" rx="26" ry="7" fill="#7d8893" stroke="${OUTLINE}" stroke-width="2.5"/>
        <ellipse cx="70" cy="46" rx="66" ry="16" fill="#b7c0c9" stroke="${OUTLINE}" stroke-width="2.5"/>
        <g fill="#ffd60a"><circle cx="28" cy="48" r="5"/><circle cx="50" cy="51" r="5"/><circle cx="70" cy="52" r="5"/><circle cx="90" cy="51" r="5"/><circle cx="112" cy="48" r="5"/></g></svg>`,
    },
    comet: {
      vb: { w: 200, h: 80 },
      svg: `<svg viewBox="0 0 200 80"><defs><linearGradient id="sp-comet" x1="0" x2="1">
          <stop offset="0" stop-color="#9fe7ff" stop-opacity="0"/><stop offset="1" stop-color="#9fe7ff" stop-opacity="0.9"/></linearGradient></defs>
        <path d="M6 40L166 20Q192 40 166 60Z" fill="url(#sp-comet)"/>
        <circle cx="170" cy="40" r="17" fill="#effcff" stroke="#9fe7ff" stroke-width="5"/></svg>`,
    },
    sparkle: {
      vb: { w: 100, h: 100 },
      svg: `<svg viewBox="0 0 100 100"><path d="M50 0Q56 44 100 50Q56 56 50 100Q44 56 0 50Q44 44 50 0Z" fill="#ffd60a"/></svg>`,
    },
    star: {
      vb: { w: 100, h: 100 },
      svg: `<svg viewBox="0 0 100 100"><polygon points="50,4 61,38 97,38 68,59 79,93 50,72 21,93 32,59 3,38 39,38" fill="#ffd60a" stroke-linejoin="round"/></svg>`,
    },
  };

  const ROCKET_SVG = `<svg class="rocket-ship" viewBox="0 -14 60 144">
    <g class="rocket-flame"><path d="M20 16Q30 -14 40 16Z" fill="#ff8a1e"/><path d="M25 16Q30 -2 35 16Z" fill="#ffe56b"/></g>
    <rect x="21" y="14" width="18" height="10" rx="2" fill="#8a94a0" stroke="${OUTLINE}" stroke-width="2.5"/>
    <path d="M16 28L4 16V50L16 58Z" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M44 28L56 16V50L44 58Z" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M16 24H44V90Q44 110 30 126Q16 110 16 90Z" fill="#f4f6f8" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M16 92Q16 110 30 126Q44 110 44 92Z" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="30" cy="62" r="8" fill="#5fc3e8" stroke="${OUTLINE}" stroke-width="2.5"/></svg>`;

  const GENERIC_PLANET = {
    vb: { w: 200, h: 200 },
    svg: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="#9aa4ae"/><circle cx="70" cy="70" r="14" fill="#7d8893"/><circle cx="128" cy="130" r="20" fill="#7d8893"/></svg>`,
  };

  // ---------- Build the elements ----------
  const layer = document.createElement("div");
  layer.className = "space";
  layer.setAttribute("aria-hidden", "true");

  const backdrop = document.createElement("div");
  backdrop.className = "space-backdrop";
  layer.append(backdrop);

  const trailSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  trailSvg.setAttribute("class", "space-trail");
  const trailPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  trailSvg.append(trailPath);
  layer.append(trailSvg);

  // Fills an element with a picture (if set) or a built-in drawing.
  // Returns a function that gives the artwork's height-to-width ratio.
  function fillArt(el, image, drawing) {
    const useDrawing = () => {
      el.innerHTML = drawing.svg;
      return () => drawing.vb.h / drawing.vb.w;
    };
    if (!has(image)) return useDrawing();
    const img = document.createElement("img");
    img.src = image;
    img.alt = "";
    img.draggable = false;
    el.append(img);
    let ratio = () => (img.naturalWidth ? img.naturalHeight / img.naturalWidth : 1);
    img.addEventListener("load", scheduleLayout);
    img.addEventListener("error", () => {
      reportMissing(image);
      img.remove();
      ratio = useDrawing();
      scheduleLayout();
    });
    return () => ratio();
  }

  const planets = planetList.map((p) => {
    const el = document.createElement("div");
    el.className = "space-planet";
    layer.append(el);
    const drawing = DRAWN_PLANETS[String(p.name || "").toLowerCase()] || GENERIC_PLANET;
    return {
      name: has(p.name) ? p.name : "",
      distance: has(p.distance) ? p.distance : "",
      size: num(p.size, 160),
      gap: Math.max(0, num(p.gap, 1)),
      el,
      ratio: fillArt(el, p.image, drawing),
    };
  });

  const START_X = [0.5, 0.75, 0.3, 0.15, 0.55, 0.85, 0.35, 0.5, 0.2, 0.7];
  const objects = objectList.map((o, i) => {
    const el = document.createElement("div");
    el.className = "space-object";
    layer.append(el);
    const drawing = OBJECT_ART[String(o.drawing || "").toLowerCase()] || OBJECT_ART.star;
    return {
      el,
      size: num(o.size, 80),
      ratio: fillArt(el, o.image, drawing),
      fx: START_X[i % START_X.length],
      fy: (i + 0.5) / objectList.length,
      angle: 0,
    };
  });

  const rocket = document.createElement("div");
  rocket.className = mirrored ? "rocket rocket--mirrored" : "rocket";
  rocket.setAttribute("aria-hidden", "true");
  if (has(rocketCfg.image)) {
    // Pictures of rockets usually point up, so turn it to face the direction of travel
    rocket.innerHTML = `<img class="rocket-ship" alt="" draggable="false">`;
    const img = rocket.querySelector("img");
    img.src = rocketCfg.image;
    rocket.style.setProperty("--rocket-turn", "180deg");
    img.addEventListener("load", scheduleLayout);
    img.addEventListener("error", () => {
      reportMissing(rocketCfg.image);
      img.outerHTML = ROCKET_SVG;
      rocket.style.removeProperty("--rocket-turn");
      scheduleLayout();
    });
  } else {
    rocket.innerHTML = ROCKET_SVG;
  }
  const label = document.createElement("div");
  label.className = "rocket-label";
  label.innerHTML = `<span class="rocket-label-name"></span><span class="rocket-label-distance"></span>`;
  rocket.append(label);

  document.body.prepend(layer);
  document.body.append(rocket);

  // ---------- Layout: runs on load and whenever the window or page size changes ----------
  const G = { enabled: false };

  // Positions are worked out as if the planets were on the left, then flipped if they're on the right
  const sideX = (x, w = 0) => (mirrored ? G.vw - x - w : x);

  function layout() {
    const vw = root.clientWidth;
    const box = main.getBoundingClientRect();
    const gutter = parseFloat(getComputedStyle(main).paddingLeft) || 0;
    const planetMargin = mirrored ? vw - box.right + gutter : box.left + gutter;

    G.enabled = planetMargin >= 190;
    root.classList.toggle("has-space", G.enabled);
    if (!G.enabled) return;

    G.vw = vw;
    G.vh = window.innerHeight;
    G.H = document.body.offsetHeight;
    G.mainLeft = box.left;
    G.mainRight = box.right;
    layer.style.height = G.H + "px";
    trailSvg.setAttribute("width", vw);
    trailSvg.setAttribute("height", G.H);

    const scale = clamp(planetMargin / 450, 0.5, 1.4);

    // Rocket size and side position
    const baseSize = num(rocketCfg.size, 56);
    const rw = clamp(baseSize * scale, 28, baseSize * 1.5);
    G.rocketX = planetMargin * 0.66;
    rocket.style.left = sideX(G.rocketX - rw / 2, rw) + "px";
    const ship = rocket.querySelector(".rocket-ship");
    ship.style.width = rw + "px";
    ship.style.height = ship.tagName === "IMG" ? "auto" : (rw * 144) / 60 + "px";
    const rh = ship.getBoundingClientRect().height || rw * 2.4;
    const roomForLabel = planetMargin - (G.rocketX + rw / 2) > 200;
    rocket.classList.toggle("rocket--label-side", roomForLabel);
    rocket.classList.toggle("rocket--label-below", !roomForLabel);

    // The rocket moves down the screen as you scroll down the page: beside the first
    // planet at the top, mid-screen halfway down, and at the bottom of the screen at the end.
    const firstY = 150;
    const header = document.querySelector(".site-header");
    const headerH = header ? header.offsetHeight : 64;
    G.rocketTop = Math.max(firstY, headerH + rh / 2 + 10);                 // on screen, at the top of the page
    G.rocketBottom = Math.max(G.rocketTop, G.vh - rh / 2 - (roomForLabel ? 24 : 64));   // at the bottom
    G.maxScroll = Math.max(0, G.H - G.vh);

    // Planet heights down the page. The first planet sits at the top. The rest are spread
    // along the rocket's path, with each planet's "gap" deciding how much space comes before it.
    const travelStart = G.rocketTop;
    const travelEnd = Math.max(G.maxScroll + G.rocketBottom, travelStart + 200 * Math.max(1, planets.length - 1));
    const weights = planets.slice(1).map((p) => p.gap);
    const total = weights.reduce((a, b) => a + b, 0) || 1;
    let used = 0;
    planets.forEach((p, i) => {
      if (i === 0) { p.y = firstY; return; }
      used += p.gap;
      p.y = travelStart + (used / total) * (travelEnd - travelStart);
    });

    // Shrink everything a little if neighbors would overlap (skipped for gap: 0, which is on purpose)
    let fit = 1;
    planets.forEach((p, i) => {
      if (i === 0 || p.gap === 0) return;
      const a = planets[i - 1];
      const needed = ((a.size * a.ratio() + p.size * p.ratio()) / 2) * scale * 0.85;
      if (needed > 0) fit = Math.min(fit, (p.y - a.y) / needed);
    });
    const planetScale = scale * clamp(fit, 0.3, 1);

    planets.forEach((p) => {
      const w = p.size * planetScale;
      const h = w * p.ratio();
      const visible = Math.min(w * peek, planetMargin * 0.45);
      p.rightEdge = visible;
      Object.assign(p.el.style, {
        width: w + "px",
        height: h + "px",
        left: sideX(visible - w, w) + "px",
        top: p.y - h / 2 + "px",
      });
    });

    // Draggable objects on the other side
    const objectMargin = mirrored ? box.left : vw - box.right;
    const os = clamp(objectMargin / 320, 0.45, 1.3);
    objects.forEach((o) => {
      o.w = Math.max(24, Math.min(o.size * os, objectMargin - 24));
      o.h = o.w * o.ratio();
      if (!o.flying && !o.dragging) placeFromFractions(o);
    });

    drawBackdrop(planetScale);
    update();
  }

  // ---------- Objects: positions, dragging, and flicking ----------
  function bounds(o) {
    const minX = mirrored ? 8 : G.mainRight + 8;
    const maxX = Math.max(minX, mirrored ? G.mainLeft - o.w - 8 : G.vw - o.w - 8);
    return { minX, maxX, minY: 80, maxY: Math.max(80, G.H - o.h - 10) };
  }

  // While flying, objects bounce off the top and bottom of the screen too
  function flightBounds(o) {
    const b = bounds(o);
    const top = window.scrollY + 70;
    const bottom = window.scrollY + G.vh - o.h - 10;
    return { ...b, minY: Math.max(b.minY, top), maxY: Math.max(Math.max(b.minY, top), Math.min(b.maxY, bottom)) };
  }

  function render(o) {
    o.el.style.width = o.w + "px";
    o.el.style.height = o.h + "px";
    o.el.style.left = o.x + "px";
    o.el.style.top = o.y + "px";
    o.el.style.setProperty("--angle", o.angle.toFixed(1) + "deg");
  }

  function placeFromFractions(o) {
    const b = bounds(o);
    o.x = b.minX + o.fx * (b.maxX - b.minX);
    o.y = clamp(o.fy * G.H, b.minY, b.maxY);
    render(o);
  }

  function saveFractions(o) {
    const b = bounds(o);
    o.fx = b.maxX > b.minX ? clamp((o.x - b.minX) / (b.maxX - b.minX), 0, 1) : 0;
    o.fy = o.y / G.H;
  }

  function stopFlying(o) {
    if (o.raf) cancelAnimationFrame(o.raf);
    o.raf = 0;
    o.flying = false;
    o.el.classList.remove("is-flying");
  }

  function fling(o, vx, vy) {
    if (reduceMotion) return;
    const speed = Math.hypot(vx, vy);           // pixels per millisecond
    if (speed < 0.2) return;
    const maxSpeed = 3;
    if (speed > maxSpeed) { vx *= maxSpeed / speed; vy *= maxSpeed / speed; }

    o.vx = vx;
    o.vy = vy;
    o.spin = vx * 0.25;                          // degrees per millisecond
    o.flying = true;
    o.el.classList.add("is-flying");
    let last = performance.now();

    const step = (now) => {
      const dt = Math.min(32, now - last);
      last = now;
      o.x += o.vx * dt;
      o.y += o.vy * dt;
      o.angle += o.spin * dt;

      const b = flightBounds(o);
      if (o.x < b.minX) { o.x = b.minX; o.vx = Math.abs(o.vx) * 0.8; o.spin *= -0.8; }
      if (o.x > b.maxX) { o.x = b.maxX; o.vx = -Math.abs(o.vx) * 0.8; o.spin *= -0.8; }
      if (o.y < b.minY) { o.y = b.minY; o.vy = Math.abs(o.vy) * 0.8; }
      if (o.y > b.maxY) { o.y = b.maxY; o.vy = -Math.abs(o.vy) * 0.8; }

      // Slow down smoothly: after about a second it's barely moving
      const drag = Math.exp(-dt / 200);
      o.vx *= drag;
      o.vy *= drag;
      o.spin *= drag;
      render(o);

      if (Math.hypot(o.vx, o.vy) > 0.02) {
        o.raf = requestAnimationFrame(step);
      } else {
        stopFlying(o);
        saveFractions(o);
      }
    };
    o.raf = requestAnimationFrame(step);
  }

  objects.forEach((o) => {
    let grab = null;
    let samples = [];

    o.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      stopFlying(o);
      o.el.setPointerCapture(e.pointerId);
      grab = { dx: e.clientX + window.scrollX - o.x, dy: e.clientY + window.scrollY - o.y };
      samples = [{ t: e.timeStamp, x: o.x, y: o.y }];
      o.dragging = true;
      o.el.classList.add("is-dragging");
    });

    o.el.addEventListener("pointermove", (e) => {
      if (!grab) return;
      const b = bounds(o);
      o.x = clamp(e.clientX + window.scrollX - grab.dx, b.minX, b.maxX);
      o.y = clamp(e.clientY + window.scrollY - grab.dy, b.minY, b.maxY);
      render(o);
      samples.push({ t: e.timeStamp, x: o.x, y: o.y });
      if (samples.length > 8) samples.shift();
    });

    const release = (e) => {
      if (!grab) return;
      grab = null;
      o.dragging = false;
      o.el.classList.remove("is-dragging");
      saveFractions(o);

      // How fast was it moving over the last ~100ms before letting go?
      const lastSample = samples[samples.length - 1];
      const recent = samples.filter((s) => lastSample.t - s.t <= 100);
      const first = recent[0];
      const held = e.timeStamp - lastSample.t > 80;   // paused before letting go = no flick
      const dt = lastSample.t - first.t;
      if (!held && dt > 0) fling(o, (lastSample.x - first.x) / dt, (lastSample.y - first.y) / dt);
    };
    o.el.addEventListener("pointerup", release);
    o.el.addEventListener("pointercancel", release);
  });

  // ---------- Background stars, plus an asteroid belt between Mars and Jupiter ----------
  function drawBackdrop(scale) {
    const rand = seeded(7);
    const strips = [[0, G.mainLeft - 6], [G.mainRight + 6, G.vw]].filter(([a, b]) => b - a > 20);
    let shapes = "";

    strips.forEach(([a, b]) => {
      const count = Math.round(((b - a) * G.H) / 9000);
      for (let i = 0; i < count; i++) {
        const x = a + rand() * (b - a);
        const y = rand() * G.H;
        shapes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + rand() * 1.2).toFixed(2)}" fill="var(--space-dot)"/>`;
      }
    });

    const find = (n) => planets.find((p) => p.name.toLowerCase() === n);
    const mars = find("mars");
    const jupiter = find("jupiter");
    if (mars && jupiter) {
      const beltY = (mars.y + jupiter.y) / 2;
      const beltH = 120 * scale;
      const rocks = ["#b97b55", "#a86a45", "#c98d66"];
      strips.forEach(([a, b]) => {
        const count = Math.round((b - a) / 9);
        for (let i = 0; i < count; i++) {
          const rx = 3 + rand() * 14 * scale;
          const ry = rx * (0.45 + rand() * 0.5);
          const x = a + rx + rand() * (b - a - rx * 2);
          const y = beltY - beltH / 2 + rand() * beltH;
          const color = rocks[Math.floor(rand() * rocks.length)];
          shapes += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" transform="rotate(${Math.round(rand() * 60 - 30)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="${color}"/>`;
        }
      });
    }

    backdrop.innerHTML = `<svg width="${G.vw}" height="${G.H}">${shapes}</svg>`;
  }

  // ---------- Scrolling: move the trail, turn the rocket, update the distance ----------
  let lastScroll = window.scrollY;
  let currentPlanet = -1;
  let movingTimer;

  function update() {
    if (!G.enabled) return;
    // How far down the page you are, from 0 (top) to 1 (bottom)
    const progress = G.maxScroll > 0 ? clamp(window.scrollY / G.maxScroll, 0, 1) : 0;
    const onScreenY = G.rocketTop + progress * (G.rocketBottom - G.rocketTop);
    rocket.style.top = onScreenY + "px";
    const rocketY = window.scrollY + onScreenY;   // rocket's position on the page

    // Dashed trail: leaves the first planet sideways, curves down, then follows the rocket
    const start = planets[0];
    const ex = start.rightEdge + 6;
    const ey = start.y;
    const rx = G.rocketX;
    const turn = Math.max(0, rx - ex);
    const X = (x) => (mirrored ? G.vw - x : x);
    const curveEnd = Math.max(ey, Math.min(ey + turn, rocketY));
    trailPath.setAttribute("d", turn > 10
      ? `M${X(ex)} ${ey}Q${X(rx)} ${ey} ${X(rx)} ${curveEnd}L${X(rx)} ${Math.max(curveEnd, rocketY)}`
      : `M${X(rx)} ${ey}L${X(rx)} ${Math.max(ey, rocketY)}`);

    // The last planet the rocket has passed
    let passed = 0;
    planets.forEach((p, i) => { if (rocketY >= p.y) passed = i; });
    if (passed !== currentPlanet) {
      currentPlanet = passed;
      const p = planets[passed];
      label.querySelector(".rocket-label-name").textContent =
        p.name ? (passed === 0 ? `Leaving ${p.name}` : `Passing ${p.name}`) : "";
      label.querySelector(".rocket-label-distance").textContent = p.distance;
      label.hidden = !p.name && !p.distance;
      label.classList.remove("is-new");
      void label.offsetWidth;   // restart the pop-in animation
      label.classList.add("is-new");
    }
  }

  let frame = 0;
  window.addEventListener("scroll", () => {
    const y = window.scrollY;
    if (Math.abs(y - lastScroll) > 2) {
      rocket.classList.toggle("is-up", y < lastScroll);   // point the rocket the way you're going
      lastScroll = y;
    }
    rocket.classList.add("is-moving");
    clearTimeout(movingTimer);
    movingTimer = setTimeout(() => rocket.classList.remove("is-moving"), 180);
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; update(); });
  }, { passive: true });

  var layoutFrame = 0;
  function scheduleLayout() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; layout(); });
  }
  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("load", scheduleLayout);
  if ("ResizeObserver" in window) new ResizeObserver(scheduleLayout).observe(document.body);

  layout();
})();
