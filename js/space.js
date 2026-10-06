/*
  You don't need to edit this file.
  It draws the space background when  spaceBackground: true  is set in js/config.js:
  - planets from Earth to Pluto down the left side
  - a rocket that stays mid-screen as you scroll, leaving a dashed trail
    and showing its distance from Earth each time it passes a planet
  - space objects on the right side that visitors can drag around
  It only appears when the screen is wide enough to fit beside your content.
*/

(function () {
  if (typeof SITE === "undefined" || SITE.spaceBackground !== true) return;

  const root = document.documentElement;
  const main = document.querySelector("main");
  if (!main) return;

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  // Always produces the same "random" numbers, so the stars and asteroids don't jump around
  function seeded(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const OUTLINE = "#232a33";

  // ---------- Artwork ----------
  // Each planet lists its viewBox size and where its round body sits (cx, cy, r),
  // so it can be tucked partly off the left edge of the screen.
  const PLANETS = [
    {
      name: "Earth", distance: "Liftoff", diameter: 170,
      vb: { w: 200, h: 200 }, disc: { cx: 100, cy: 100, r: 96 },
      svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-earth"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#1e9be0"/>
        <g clip-path="url(#sp-earth)">
          <g fill="#2fb34f">
            <path d="M40 30c18-14 50-12 58 6 6 14-10 22-6 36 4 14-14 22-28 16-16-7-10-26-26-30C24 54 26 40 40 30z"/>
            <path d="M120 70c16-8 40 0 52 18 12 18 6 44-10 52-14 8-16 30-34 32-14 1-18-14-14-28 4-14-10-22-8-38 2-14 4-30 14-36z"/>
            <path d="M20 110c12 0 22 12 18 26-4 12 4 26-8 32-12 4-24-20-24-36 0-12 4-22 14-22z"/>
          </g>
          <g fill="#ffffff"><ellipse cx="70" cy="14" rx="34" ry="11"/><ellipse cx="128" cy="186" rx="40" ry="12"/><ellipse cx="160" cy="50" rx="18" ry="6"/></g>
        </g></svg>`,
    },
    {
      // Distances are roughly how close each planet gets to Earth
      // (its average distance from the Sun minus Earth's). Fun, not exact.
      name: "Mars", distance: "78 million km", diameter: 120,
      vb: { w: 200, h: 200 }, disc: { cx: 100, cy: 100, r: 96 },
      svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-mars"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#f07a2a"/>
        <g clip-path="url(#sp-mars)">
          <ellipse cx="100" cy="6" rx="46" ry="16" fill="#fff4ea"/>
          <path d="M60 52c14-8 34-2 38 12 3 12-12 14-10 26 2 10-12 16-22 8-10-8-2-20-12-28-8-6-4-14 6-18z" fill="#d6372b"/>
          <path d="M118 120c16-10 40-6 46 8 5 12-14 16-24 24-12 10-28 14-34 4-6-12 2-28 12-36z" fill="#d6372b"/>
          <circle cx="150" cy="70" r="9" fill="#c43226"/><circle cx="56" cy="140" r="12" fill="#de5a2c"/>
        </g></svg>`,
    },
    {
      name: "Jupiter", distance: "629 million km", diameter: 300,
      vb: { w: 200, h: 200 }, disc: { cx: 100, cy: 100, r: 96 },
      svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-jupiter"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#f39a4c"/>
        <g clip-path="url(#sp-jupiter)" fill="none" stroke-linecap="round">
          <path d="M0 40c30-10 60 8 100 0s70-10 100 0" stroke="#f7c95c" stroke-width="12"/>
          <path d="M0 72c40 8 70-8 110 0s60 6 90-2" stroke="#e2622f" stroke-width="10"/>
          <path d="M0 104c30-6 70 6 100 0s70-8 100 2" stroke="#f7c95c" stroke-width="8"/>
          <path d="M0 150c40-8 60 8 100 2s70-8 100 0" stroke="#e2622f" stroke-width="12"/>
          <path d="M10 176c40 6 80-6 180 0" stroke="#f7c95c" stroke-width="8"/>
        </g>
        <ellipse cx="72" cy="126" rx="30" ry="18" fill="#d9302a"/><ellipse cx="78" cy="128" rx="13" ry="9" fill="#8f0f16"/>
        </svg>`,
    },
    {
      name: "Saturn", distance: "1.28 billion km", diameter: 220,
      vb: { w: 340, h: 200 }, disc: { cx: 170, cy: 100, r: 80 },
      svg: `<svg viewBox="0 0 340 200"><defs>
          <clipPath id="sp-saturn-front"><rect x="0" y="100" width="340" height="100"/></clipPath>
          <clipPath id="sp-saturn-disc"><circle cx="170" cy="100" r="80"/></clipPath></defs>
        <g transform="rotate(-14 170 100)">
          <ellipse cx="170" cy="100" rx="160" ry="34" fill="none" stroke="#b97b55" stroke-width="18"/>
          <circle cx="170" cy="100" r="80" fill="#f6c431"/>
          <g clip-path="url(#sp-saturn-disc)" fill="none" stroke="#e8a82a" stroke-width="9" stroke-linecap="round"><path d="M80 62h180M80 134h180"/></g>
          <ellipse cx="170" cy="100" rx="160" ry="34" fill="none" stroke="#b97b55" stroke-width="18" clip-path="url(#sp-saturn-front)"/>
        </g></svg>`,
    },
    {
      name: "Uranus", distance: "2.72 billion km", diameter: 170,
      vb: { w: 200, h: 240 }, disc: { cx: 100, cy: 120, r: 80 },
      svg: `<svg viewBox="0 0 200 240"><defs><clipPath id="sp-uranus-front"><rect x="0" y="0" width="100" height="240"/></clipPath></defs>
        <g transform="rotate(12 100 120)">
          <ellipse cx="100" cy="120" rx="24" ry="112" fill="none" stroke="#d6f3f7" stroke-width="5"/>
          <circle cx="100" cy="120" r="80" fill="#86d3e3"/>
          <path d="M32 92h136M34 150h132" stroke="#a6e2ee" stroke-width="10" stroke-linecap="round"/>
          <ellipse cx="100" cy="120" rx="24" ry="112" fill="none" stroke="#d6f3f7" stroke-width="5" clip-path="url(#sp-uranus-front)"/>
        </g></svg>`,
    },
    {
      name: "Neptune", distance: "4.35 billion km", diameter: 165,
      vb: { w: 200, h: 200 }, disc: { cx: 100, cy: 100, r: 96 },
      svg: `<svg viewBox="0 0 200 200"><defs><clipPath id="sp-neptune"><circle cx="100" cy="100" r="96"/></clipPath></defs>
        <circle cx="100" cy="100" r="96" fill="#2d6be0"/>
        <g clip-path="url(#sp-neptune)" fill="none" stroke-linecap="round" stroke-width="8">
          <path d="M20 50c30-8 60-6 90-12" stroke="#7aa2f5"/><path d="M40 82c34-6 70-4 120-12" stroke="#4a3fc4"/>
          <path d="M14 124c40-6 90-8 160-4" stroke="#7aa2f5"/><path d="M50 160c30-4 60-4 100-10" stroke="#4a3fc4"/>
        </g>
        <ellipse cx="130" cy="108" rx="18" ry="10" fill="#183d9e"/></svg>`,
    },
    {
      name: "Pluto", distance: "5.76 billion km", diameter: 72,
      vb: { w: 200, h: 200 }, disc: { cx: 100, cy: 100, r: 96 },
      svg: `<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="96" fill="#c9a07a"/>
        <path d="M112 150C84 132 66 116 66 96c0-14 10-24 22-24 10 0 18 6 24 14 6-8 14-14 24-14 12 0 22 10 22 24 0 20-18 36-46 54z" fill="#f4e2cc"/>
        <circle cx="48" cy="70" r="10" fill="#a87e5a"/><circle cx="58" cy="142" r="7" fill="#a87e5a"/></svg>`,
    },
  ];

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

  // Where each object starts: fx = left-to-right within the right margin (0 to 1),
  // fy = how far down the page (0 = top, 1 = bottom), size = base width in pixels
  const OBJECTS = [
    { art: "iss",       size: 210, fx: 0.5,  fy: 0.05 },
    { art: "star",      size: 52,  fx: 0.75, fy: 0.16 },
    { art: "astronaut", size: 90,  fx: 0.3,  fy: 0.24 },
    { art: "sparkle",   size: 40,  fx: 0.15, fy: 0.36 },
    { art: "satellite", size: 150, fx: 0.55, fy: 0.44 },
    { art: "sparkle",   size: 58,  fx: 0.85, fy: 0.55 },
    { art: "ufo",       size: 130, fx: 0.35, fy: 0.63 },
    { art: "comet",     size: 180, fx: 0.5,  fy: 0.74 },
    { art: "star",      size: 40,  fx: 0.2,  fy: 0.85 },
    { art: "sparkle",   size: 46,  fx: 0.7,  fy: 0.93 },
  ];

  const ROCKET_SVG = `<svg class="rocket-ship" viewBox="0 -14 60 144">
    <g class="rocket-flame"><path d="M20 16Q30 -14 40 16Z" fill="#ff8a1e"/><path d="M25 16Q30 -2 35 16Z" fill="#ffe56b"/></g>
    <rect x="21" y="14" width="18" height="10" rx="2" fill="#8a94a0" stroke="${OUTLINE}" stroke-width="2.5"/>
    <path d="M16 28L4 16V50L16 58Z" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M44 28L56 16V50L44 58Z" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M16 24H44V90Q44 110 30 126Q16 110 16 90Z" fill="#f4f6f8" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M16 92Q16 110 30 126Q44 110 44 92Z" fill="#e8453c" stroke="${OUTLINE}" stroke-width="2.5" stroke-linejoin="round"/>
    <circle cx="30" cy="62" r="8" fill="#5fc3e8" stroke="${OUTLINE}" stroke-width="2.5"/></svg>`;

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

  PLANETS.forEach((p) => {
    p.el = document.createElement("div");
    p.el.className = "space-planet";
    p.el.innerHTML = p.svg;
    layer.append(p.el);
  });

  OBJECTS.forEach((o) => {
    o.vb = OBJECT_ART[o.art].vb;
    o.el = document.createElement("div");
    o.el.className = "space-object";
    o.el.innerHTML = OBJECT_ART[o.art].svg;
    layer.append(o.el);
  });

  const rocket = document.createElement("div");
  rocket.className = "rocket";
  rocket.setAttribute("aria-hidden", "true");
  rocket.innerHTML = ROCKET_SVG +
    `<div class="rocket-label"><span class="rocket-label-name"></span><span class="rocket-label-distance"></span></div>`;
  const label = rocket.querySelector(".rocket-label");

  document.body.prepend(layer);
  document.body.append(rocket);

  // ---------- Layout: runs on load and whenever the window or page size changes ----------
  const G = { enabled: false };   // current measurements

  function layout() {
    const vw = root.clientWidth;
    const box = main.getBoundingClientRect();
    const gutter = parseFloat(getComputedStyle(main).paddingLeft) || 0;
    const contentStart = box.left + gutter;

    G.enabled = contentStart >= 190;
    root.classList.toggle("has-space", G.enabled);
    if (!G.enabled) return;

    G.vw = vw;
    G.H = document.body.offsetHeight;
    G.mainLeft = box.left;
    G.mainRight = box.right;
    layer.style.height = G.H + "px";
    trailSvg.setAttribute("width", vw);
    trailSvg.setAttribute("height", G.H);

    // Planets: Earth at the top, then the rest spread out so the rocket (which sits
    // mid-screen) reaches Mars after a little scrolling and Pluto at the very bottom
    const scale = clamp(contentStart / 450, 0.55, 1.4);
    const vh = window.innerHeight;
    const earthY = 150;
    const marsY = Math.max(earthY + 260, vh / 2 + 160);
    const plutoY = Math.max(marsY + 5 * 160, G.H - vh / 2);
    // On short pages, shrink the planets so they don't overlap (Jupiter is the biggest, 300px)
    const gap = (plutoY - marsY) / (PLANETS.length - 2);
    const planetScale = clamp(Math.min(scale, (gap - 30) / 300), 0.35, 1.4);
    PLANETS.forEach((p, i) => {
      const s = (p.diameter * planetScale) / (2 * p.disc.r);   // pixels per artwork unit
      const visibleRight = Math.min(p.disc.r * 2 * s * 0.62, contentStart * 0.42);
      p.y = i === 0 ? earthY : marsY + ((i - 1) * (plutoY - marsY)) / (PLANETS.length - 2);
      p.rightEdge = visibleRight;
      Object.assign(p.el.style, {
        width: p.vb.w * s + "px",
        height: p.vb.h * s + "px",
        left: visibleRight - (p.disc.cx + p.disc.r) * s + "px",
        top: p.y - p.disc.cy * s + "px",
      });
    });

    // Rocket
    const rw = clamp(56 * scale, 40, 84);
    G.rocketX = contentStart * 0.66;
    rocket.style.left = G.rocketX - rw / 2 + "px";
    const ship = rocket.querySelector(".rocket-ship");
    ship.style.width = rw + "px";
    ship.style.height = (rw * 144) / 60 + "px";
    const roomForLabel = contentStart - (G.rocketX + rw / 2) > 200;
    rocket.classList.toggle("rocket--label-right", roomForLabel);
    rocket.classList.toggle("rocket--label-below", !roomForLabel);

    // Draggable objects in the right margin
    const rightMargin = vw - G.mainRight;
    const os = clamp(rightMargin / 320, 0.45, 1.3);
    OBJECTS.forEach((o) => {
      o.w = Math.max(24, Math.min(o.size * os, rightMargin - 24));
      o.h = (o.w * o.vb.h) / o.vb.w;
      placeObject(o);
    });

    drawBackdrop(planetScale);
    update();
  }

  function objectBounds(o) {
    const minX = G.mainRight + 8;
    const maxX = Math.max(minX, G.vw - o.w - 8);
    return { minX, maxX, minY: 80, maxY: Math.max(80, G.H - o.h - 10) };
  }

  function placeObject(o) {
    const b = objectBounds(o);
    Object.assign(o.el.style, {
      width: o.w + "px",
      height: o.h + "px",
      left: b.minX + o.fx * (b.maxX - b.minX) + "px",
      top: clamp(o.fy * G.H, b.minY, b.maxY) + "px",
    });
  }

  // Background stars, plus an asteroid belt between Mars and Jupiter
  function drawBackdrop(scale) {
    const rand = seeded(7);
    const leftEnd = G.mainLeft - 6;
    const rightStart = G.mainRight + 6;
    const strips = [[0, leftEnd], [rightStart, G.vw]].filter(([a, b]) => b - a > 20);
    let shapes = "";

    strips.forEach(([a, b]) => {
      const count = Math.round(((b - a) * G.H) / 9000);
      for (let i = 0; i < count; i++) {
        const x = a + rand() * (b - a);
        const y = rand() * G.H;
        shapes += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + rand() * 1.2).toFixed(2)}" fill="var(--space-dot)"/>`;
      }
    });

    const beltY = (PLANETS[1].y + PLANETS[2].y) / 2;
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

    backdrop.innerHTML = `<svg width="${G.vw}" height="${G.H}">${shapes}</svg>`;
  }

  // ---------- Scrolling: move the trail, turn the rocket, update the distance ----------
  let lastScroll = window.scrollY;
  let currentPlanet = -1;
  let movingTimer;

  function update() {
    if (!G.enabled) return;
    const rocketY = window.scrollY + window.innerHeight / 2;   // rocket's position on the page

    // Dashed trail: leaves Earth sideways, curves down, then follows the rocket
    const earth = PLANETS[0];
    const ex = earth.rightEdge + 6;
    const ey = earth.y;
    const rx = G.rocketX;
    const turn = Math.max(0, rx - ex);
    const endY = Math.max(rocketY, ey + turn);
    trailPath.setAttribute("d", turn > 10
      ? `M${ex} ${ey}Q${rx} ${ey} ${rx} ${ey + turn}L${rx} ${endY}`
      : `M${rx} ${ey}L${rx} ${endY}`);

    // The last planet the rocket has passed
    let passed = 0;
    PLANETS.forEach((p, i) => { if (rocketY >= p.y) passed = i; });
    if (passed !== currentPlanet) {
      currentPlanet = passed;
      const p = PLANETS[passed];
      label.querySelector(".rocket-label-name").textContent = passed === 0 ? "Leaving Earth" : `Passing ${p.name}`;
      label.querySelector(".rocket-label-distance").textContent = p.distance;
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

  let layoutFrame = 0;
  const scheduleLayout = () => {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(() => { layoutFrame = 0; layout(); });
  };
  window.addEventListener("resize", scheduleLayout);
  window.addEventListener("load", scheduleLayout);
  if ("ResizeObserver" in window) new ResizeObserver(scheduleLayout).observe(document.body);

  // ---------- Dragging objects (mouse, pen, or finger) ----------
  let drag = null;
  OBJECTS.forEach((o) => {
    o.el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      o.el.setPointerCapture(e.pointerId);
      const r = o.el.getBoundingClientRect();
      drag = { o, dx: e.clientX - r.left, dy: e.clientY - r.top };
      o.el.classList.add("is-dragging");
    });
    o.el.addEventListener("pointermove", (e) => {
      if (!drag || drag.o !== o) return;
      const b = objectBounds(o);
      const x = clamp(e.clientX - drag.dx, b.minX, b.maxX);
      const y = clamp(e.clientY - drag.dy + window.scrollY, b.minY, b.maxY);
      o.fx = b.maxX > b.minX ? (x - b.minX) / (b.maxX - b.minX) : 0;
      o.fy = y / G.H;
      placeObject(o);
    });
    const drop = () => {
      if (drag && drag.o === o) drag = null;
      o.el.classList.remove("is-dragging");
    };
    o.el.addEventListener("pointerup", drop);
    o.el.addEventListener("pointercancel", drop);
  });

  layout();
})();
