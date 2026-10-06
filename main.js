/*
  You don't need to edit this file.
  It reads your content from js/config.js and builds the page.
*/

(function () {
  const root = document.documentElement;

  // ---------- Light / dark toggle (works even if config has a typo) ----------
  const toggle = document.querySelector(".theme-toggle");
  toggle.addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  // ---------- Stop with a clear message if config.js didn't load ----------
  if (typeof SITE === "undefined") {
    const banner = document.getElementById("config-error");
    banner.textContent =
      "The page couldn't read js/config.js. Check that file for a missing comma, " +
      "quote, or bracket near the last thing you changed, then save and refresh.";
    banner.hidden = false;
    return;
  }

  // ---------- Helpers ----------
  const has = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" && v.trim() !== "");
  const $ = (id) => document.getElementById(id);

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props || {})) {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    }
    children.forEach((child) => child && node.append(child));
    return node;
  }

  function linkList(links, className) {
    const list = el("p", { class: className });
    (links || []).filter((l) => has(l.url)).forEach((l) => {
      list.append(el("a", { href: l.url, text: l.label || l.url }));
    });
    return list.children.length ? list : null;
  }

  const name = has(SITE.name) ? SITE.name : "Your Name";

  // ---------- Page title, description, initials ----------
  document.title = has(SITE.role) ? `${name} — ${SITE.role}` : name;
  if (has(SITE.intro)) {
    document.querySelector('meta[name="description"]').setAttribute("content", SITE.intro);
  }
  $("nav-home").textContent = name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  // ---------- Hero ----------
  $("hero-name").textContent = name;
  if (has(SITE.intro)) $("hero-intro").textContent = SITE.intro;
  else $("hero-intro").remove();

  const heroLinks = $("hero-links");
  (SITE.links || []).filter((l) => has(l.url)).forEach((l) => {
    heroLinks.append(el("li", {}, el("a", { href: l.url, text: l.label || l.url })));
  });
  if (has(SITE.email)) {
    heroLinks.append(el("li", {}, el("a", { href: `mailto:${SITE.email}`, text: SITE.email })));
  }

  // ---------- Projects ----------
  const navItems = [];
  const projects = (SITE.projects || []).filter((p) => has(p.name));
  if (projects.length) {
    const list = $("project-list");
    projects.forEach((p, i) => {
      const featured = i === 0 && has(p.image);
      const body = el("div", { class: "project-body" },
        el("h3", { text: p.name }),
        has(p.description) ? el("p", { text: p.description }) : null
      );
      if (has(p.tech)) {
        const tech = el("ul", { class: "tech", "aria-label": "Technologies" });
        p.tech.forEach((t) => tech.append(el("li", { text: t })));
        body.append(tech);
      }
      body.append(linkList(p.links, "project-links"));

      const article = el("article", { class: featured ? "project project--featured" : "project" });
      if (featured) {
        article.append(
          el("div", { class: "project-media" },
            el("img", { src: p.image, alt: p.imageAlt || `Screenshot of ${p.name}`, loading: "lazy" })
          )
        );
      } else if (has(p.image)) {
        body.prepend(
          el("img", { class: "project-thumb", src: p.image, alt: p.imageAlt || `Screenshot of ${p.name}`, loading: "lazy" })
        );
      }
      article.append(body);
      list.append(article);
    });
    $("projects").hidden = false;
    navItems.push(["Projects", "#projects"]);
  }

  // ---------- Experience ----------
  const jobs = (SITE.experience || []).filter((j) => has(j.title) || has(j.place));
  if (jobs.length) {
    const timeline = $("timeline");
    jobs.forEach((j) => {
      const heading = [j.title, j.place].filter(has).join(", ");
      timeline.append(
        el("li", { class: "timeline-item" },
          has(j.dates) ? el("p", { class: "timeline-date", text: j.dates }) : null,
          el("h3", { text: heading }),
          has(j.description) ? el("p", { text: j.description }) : null
        )
      );
    });
    $("experience").hidden = false;
    navItems.push(["Experience", "#experience"]);
  }

  // ---------- Contact ----------
  if (has(SITE.email)) {
    if (has(SITE.contactNote)) $("contact-note").textContent = SITE.contactNote;
    else $("contact-note").remove();
    $("contact-button").href = `mailto:${SITE.email}`;
    $("contact").hidden = false;
    navItems.push(["Contact", "#contact"]);
  }

  // ---------- Nav ----------
  if (has(SITE.resume)) navItems.push(["Resume", SITE.resume]);
  const nav = $("nav-links");
  navItems.forEach(([label, href]) => nav.append(el("li", {}, el("a", { href, text: label }))));

  // ---------- Footer ----------
  $("footer-text").textContent = `© ${new Date().getFullYear()} ${name}`;
})();
