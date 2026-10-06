/*
  You don't need to edit this file.
  It reads your content from js/config.js and builds both pages:
  index.html (home) and project.html (one page per project).
*/

(function () {
  const root = document.documentElement;

  // ---------- Light / dark toggle (works even if config has a typo) ----------
  document.querySelector(".theme-toggle").addEventListener("click", () => {
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

  // "My Cool App!" -> "my-cool-app" (used in each project's page address)
  const slugify = (text) =>
    text.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  // Photos can be written as "path.png" or { image: "path.png", caption: "..." }
  const toPhoto = (item) => (typeof item === "string" ? { image: item, caption: "" } : item || {});

  function linkList(links, className) {
    const list = el("p", { class: className });
    (links || []).filter((l) => l && has(l.url)).forEach((l) => {
      list.append(el("a", { href: l.url, text: l.label || l.url }));
    });
    return list.children.length ? list : null;
  }

  function techList(tech) {
    if (!has(tech)) return null;
    const list = el("ul", { class: "tech", "aria-label": "Technologies" });
    tech.forEach((t) => list.append(el("li", { text: t })));
    return list;
  }

  // ---------- Shared data ----------
  const name = has(SITE.name) ? SITE.name : "Your Name";
  const projects = (SITE.projects || [])
    .filter((p) => p && has(p.name))
    .map((p) => ({ ...p, slug: slugify(p.name) }));
  const jobs = (SITE.experience || []).filter((j) => j && (has(j.title) || has(j.place)));
  const photos = (SITE.gallery || []).map(toPhoto).filter((g) => has(g.image));
  const onProjectPage = document.body.dataset.page === "project";
  const home = onProjectPage ? "./" : "";   // project pages link back to the home page

  // ---------- Photo viewer (lightbox) ----------
  const lightbox = $("lightbox");
  let viewerPhotos = [];
  let viewerIndex = 0;

  function showPhoto(i) {
    viewerIndex = (i + viewerPhotos.length) % viewerPhotos.length;
    const photo = viewerPhotos[viewerIndex];
    $("lightbox-img").src = photo.image;
    $("lightbox-img").alt = photo.caption || "";
    $("lightbox-caption").textContent = photo.caption || "";
    const multiple = viewerPhotos.length > 1;
    $("lightbox-prev").hidden = !multiple;
    $("lightbox-next").hidden = !multiple;
  }

  function openViewer(list, i) {
    viewerPhotos = list;
    showPhoto(i);
    lightbox.showModal();
  }

  lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
  $("lightbox-prev").addEventListener("click", () => showPhoto(viewerIndex - 1));
  $("lightbox-next").addEventListener("click", () => showPhoto(viewerIndex + 1));
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("keydown", (e) => {
    if (viewerPhotos.length < 2) return;
    if (e.key === "ArrowLeft") showPhoto(viewerIndex - 1);
    if (e.key === "ArrowRight") showPhoto(viewerIndex + 1);
  });

  // A grid of photos where clicking one opens it in the viewer
  function photoGrid(list, className) {
    const grid = el("div", { class: className });
    list.forEach((photo, i) => {
      const button = el("button", {
        class: "photo",
        type: "button",
        "aria-label": photo.caption ? `Open photo: ${photo.caption}` : `Open photo ${i + 1}`,
      }, el("img", { src: photo.image, alt: photo.caption || "", loading: "lazy" }));
      button.addEventListener("click", () => openViewer(list, i));
      grid.append(button);
    });
    return grid;
  }

  // ---------- Header and footer (both pages) ----------
  $("nav-home").textContent = name.split(/\s+/).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  $("nav-home").href = onProjectPage ? "./" : "#top";

  const navItems = [];
  if (projects.length) navItems.push(["Projects", home + "#projects"]);
  if (jobs.length) navItems.push(["Experience", home + "#experience"]);
  if (photos.length) navItems.push([has(SITE.galleryTitle) ? SITE.galleryTitle : "Gallery", home + "#gallery"]);
  if (has(SITE.email)) navItems.push(["Contact", home + "#contact"]);
  if (has(SITE.resume)) navItems.push(["Resume", SITE.resume]);
  navItems.forEach(([label, href]) =>
    $("nav-links").append(el("li", {}, el("a", { href, text: label })))
  );

  $("footer-text").textContent = `© ${new Date().getFullYear()} ${name}`;

  if (onProjectPage) renderProjectPage();
  else renderHomePage();

  // =========================================================
  // Home page
  // =========================================================
  function renderHomePage() {
    document.title = has(SITE.role) ? `${name} — ${SITE.role}` : name;
    if (has(SITE.intro)) {
      document.querySelector('meta[name="description"]').setAttribute("content", SITE.intro);
    }

    // Hero
    $("hero-name").textContent = name;
    if (has(SITE.intro)) $("hero-intro").textContent = SITE.intro;
    else $("hero-intro").remove();

    const heroLinks = $("hero-links");
    (SITE.links || []).filter((l) => l && has(l.url)).forEach((l) => {
      heroLinks.append(el("li", {}, el("a", { href: l.url, text: l.label || l.url })));
    });
    if (has(SITE.email)) {
      heroLinks.append(el("li", {}, el("a", { href: `mailto:${SITE.email}`, text: SITE.email })));
    }

    // Project grid: each card opens that project's own page
    if (projects.length) {
      projects.forEach((p, i) => {
        const summary = has(p.summary) ? p.summary : p.description;
        const image = has(p.image)
          ? el("img", { class: "card-img", src: p.image, alt: "", loading: "lazy" })
          : el("div", { class: "card-img card-img--empty", "aria-hidden": "true" },
              el("span", { text: p.name }));
        $("project-list").append(
          el("a", { class: i === 0 ? "card card--wide" : "card", href: `project.html?p=${p.slug}` },
            image,
            el("div", { class: "card-text" },
              el("h3", { text: p.name }),
              has(summary) ? el("p", { text: summary }) : null
            )
          )
        );
      });
      $("projects").hidden = false;
    }

    // Experience
    if (jobs.length) {
      jobs.forEach((j) => {
        $("timeline").append(
          el("li", { class: "timeline-item" },
            has(j.dates) ? el("p", { class: "timeline-date", text: j.dates }) : null,
            el("h3", { text: [j.title, j.place].filter(has).join(", ") }),
            has(j.description) ? el("p", { text: j.description }) : null
          )
        );
      });
      $("experience").hidden = false;
    }

    // Gallery
    if (photos.length) {
      if (has(SITE.galleryTitle)) $("gallery-heading").textContent = SITE.galleryTitle;
      $("gallery-list").append(photoGrid(photos, "gallery-grid"));
      $("gallery").hidden = false;
    }

    // Contact
    if (has(SITE.email)) {
      if (has(SITE.contactNote)) $("contact-note").textContent = SITE.contactNote;
      else $("contact-note").remove();
      $("contact-button").href = `mailto:${SITE.email}`;
      $("contact").hidden = false;
    }
  }

  // =========================================================
  // Project page (project.html?p=project-name)
  // =========================================================
  function renderProjectPage() {
    const page = $("project");
    const slug = new URLSearchParams(location.search).get("p");
    const index = projects.findIndex((p) => p.slug === slug);
    const back = el("p", { class: "back" }, el("a", { href: "./#projects", text: "All projects" }));

    if (index === -1) {
      document.title = `Project not found — ${name}`;
      page.append(
        back,
        el("h1", { class: "project-title", text: "Project not found" }),
        el("p", { text: "This link doesn't match any project. The project may have been renamed or removed." })
      );
      return;
    }

    const p = projects[index];
    document.title = `${p.name} — ${name}`;
    if (has(p.summary) || has(p.description)) {
      document.querySelector('meta[name="description"]')
        .setAttribute("content", has(p.summary) ? p.summary : p.description);
    }

    page.append(
      back,
      el("h1", { class: "project-title", text: p.name }),
      has(p.description) ? el("p", { class: "project-lede", text: p.description }) : null,
      techList(p.tech),
      linkList(p.links, "project-links")
    );

    if (has(p.image)) {
      page.append(el("img", { class: "project-cover", src: p.image, alt: p.imageAlt || `Screenshot of ${p.name}` }));
    }

    // details can be a list of paragraphs, or one block of text with blank lines between paragraphs
    const paragraphs = Array.isArray(p.details)
      ? p.details
      : has(p.details) ? p.details.split(/\n\s*\n/) : [];
    if (paragraphs.some(has)) {
      const body = el("div", { class: "project-details" });
      paragraphs.filter(has).forEach((text) => body.append(el("p", { text: text.trim() })));
      page.append(body);
    }

    const extra = (p.images || []).map(toPhoto).filter((g) => has(g.image));
    if (extra.length) page.append(photoGrid(extra, "project-photos"));

    // Previous / next project
    if (projects.length > 1) {
      const prev = projects[(index - 1 + projects.length) % projects.length];
      const next = projects[(index + 1) % projects.length];
      const pager = el("nav", { class: "pager", "aria-label": "More projects" });
      const pagerLink = (project, label, className) =>
        el("a", { class: className, href: `project.html?p=${project.slug}` },
          el("span", { class: "pager-label", text: label }), el("span", { text: project.name }));
      // With only two projects, previous and next would be the same one
      if (projects.length > 2) pager.append(pagerLink(prev, "Previous project", "pager-prev"));
      pager.append(pagerLink(next, "Next project", "pager-next"));
      page.append(pager);
    }
  }
})();
