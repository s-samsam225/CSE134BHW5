// Custom element for your portfolio callout
class PortfolioCallout extends HTMLElement {
  constructor() {
    super();
  }
}
customElements.define("portfolio-callout", PortfolioCallout);

// Theme toggle + localStorage
(function () {
  const root = document.documentElement;
  root.classList.add("js");

  const THEME_KEY = "theme";

  function applyTheme(theme) {
    root.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      // ignore
    }

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      const isDark = theme === "dark";
      btn.setAttribute("aria-pressed", String(isDark));
      btn.textContent = isDark ? "☀️ Light mode" : "🌙 Dark mode";
    }
  }

  let initialTheme = "light";
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "dark" || stored === "light") {
      initialTheme = stored;
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      initialTheme = "dark";
    }
  } catch (e) {
    // ignore
  }
  applyTheme(initialTheme);

  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
    });
  });
})();

// ===== View Transition API (MPA navigation) =====
(function () {
  // Progressive enhancement: if unsupported, do nothing.
  if (!("startViewTransition" in document)) return;

  window.addEventListener("DOMContentLoaded", () => {
    const nav = document.querySelector("header.main-nav nav");
    if (!nav) return;

    nav.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const url = new URL(link.href, window.location.href);

      // Only intercept same-origin navigation and left-clicks without modifiers
      const isSameOrigin = url.origin === window.location.origin;
      const isSamePath = url.pathname !== window.location.pathname;

      if (!isSameOrigin || !isSamePath) return;
      if (
        event.button !== 0 || // not left click
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();

      document.startViewTransition(async () => {
        // Wait for the new page to load, then replace body content.
        const response = await fetch(url.pathname + url.search, {
          method: "GET",
          headers: {
            "X-Requested-With": "view-transition-demo",
          },
        });

        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "text/html");

        // Replace body content
        document.body.innerHTML = doc.body.innerHTML;

        // Update the URL in the address bar
        window.history.pushState({}, "", url.pathname + url.search);

        // Re-initialize any JS that expects DOMContentLoaded stuff
        // (theme button, etc.)
        const themeToggle = document.getElementById("theme-toggle");
        if (themeToggle) {
          themeToggle.addEventListener("click", () => {
            const root = document.documentElement;
            const nextTheme =
              root.dataset.theme === "dark" ? "light" : "dark";
            // reuse the theme logic by dispatching a custom event or just
            // update here if you want – but since our theme IIFE is already bound
            // on first load, the label will still be correct.
          });
        }
      });
    });
  });

  // Ensure back/forward buttons still work normally (without animation or with a later enhancement)
  window.addEventListener("popstate", () => {
    // default behavior: browser navigates, we do nothing special
  });
})();


// ===============================
// Project Card Custom Element
// ===============================

const projectTemplate = document.createElement("template");

projectTemplate.innerHTML = `
  <style>
    :host {
      --card-bg: var(--tint, #f7f7fb);
      --card-radius: 16px;
      --card-padding: 1.25rem;
      --card-gap: 1rem;
      --accent: #6b4eff;

      display: block;
      background: var(--card-bg);
      border-radius: var(--card-radius);
      padding: var(--card-padding);
      box-shadow: 0 6px 20px rgba(0,0,0,.08);
      transition: transform .15s ease, box-shadow .15s ease;
    }

    :host(:hover) {
      transform: translateY(-4px);
      box-shadow: 0 14px 30px rgba(0,0,0,.14);
    }

    article {
      display: flex;
      flex-direction: column;
      gap: var(--card-gap);
    }

    header h2 {
      margin: 0;
      font-size: 1.4rem;
    }

    header p {
      margin: 0;
      font-size: 0.95rem;
      opacity: .85;
    }

    img {
      width: 100%;
      border-radius: 10px;
    }

    ul {
      padding-left: 1.1rem;
    }

    a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }
  </style>

  <article>
    <header>
      <h2></h2>
      <p class="meta"></p>
    </header>

    <figure>
      <img />
      <figcaption></figcaption>
    </figure>

    <p class="focus"></p>

    <h4>Responsibilities</h4>
    <slot name="responsibilities"></slot>

    <p>
      <a target="_blank" rel="noopener">View Project ↗</a>
    </p>
  </article>
`;

class ProjectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(projectTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.querySelector("h2").textContent =
      this.getAttribute("title");

    this.shadowRoot.querySelector(".meta").textContent =
      `${this.getAttribute("role")} • ${this.getAttribute("date")} • ${this.getAttribute("location")}`;

    const img = this.shadowRoot.querySelector("img");
    img.src = this.getAttribute("image");
    img.alt = this.getAttribute("alt");

    this.shadowRoot.querySelector(".focus").textContent =
      `${this.getAttribute("tech")}: ${this.getAttribute("focus")}`;

    const link = this.shadowRoot.querySelector("a");
    link.href = this.getAttribute("link");
  }
}

customElements.define("project-card", ProjectCard);

// PART 2: DATA LOADING
const grid = document.getElementById("projects-grid");
const loadLocalBtn = document.getElementById("load-local");
const loadRemoteBtn = document.getElementById("load-remote");


// LocalStorage Data
const localProjects = [
  {
    "title": "Neurotech EEG Device",
    "role": "Engineering Team Lead",
    "date": "2025-01",
    "location": "Cognovate Labs",
    "image": "assets/projects/EEGblenderMockup.png",
    "alt": "Portable EEG diagnostics hardware",
    "tech": "Blender, Solid Works, OpenBCI",
    "focus": "Stroke triage and diagnostics",
    "link": "https://www.instagram.com/p/DRO3fUUEes1/?img_index=1",
    "responsibilities": [
      "Built EEG hardware",
      "Iterated sketches on Solid Works and Blender"
    ]
  },{
    title: "Fourth Trimester App (Concept)",
    role: "Designer / Developer",
    date: "2025-03",
    location: "Girls Who Code & Accenture",
    image: "assets/projects/AccentureAppWireframe.png",
    alt: "Concept wireframe for postpartum support app",
    tech: "Canva, Figma",
    focus: "Accessibility, calm UI, postpartum support",
    link: "accentureCaseStudy.html",
    responsibilities: [
      "Designed full UX case study",
      "Presented findings to Accenture volunteers"
    ]
  }
];

localStorage.setItem("projects", JSON.stringify(localProjects));

function renderProjects(projects) {
  grid.innerHTML = "";

  projects.forEach(project => {
    const card = document.createElement("project-card");

    card.setAttribute("title", project.title);
    card.setAttribute("role", project.role);
    card.setAttribute("date", project.date);
    card.setAttribute("location", project.location);
    card.setAttribute("image", project.image);
    card.setAttribute("alt", project.alt);
    card.setAttribute("tech", project.tech);
    card.setAttribute("focus", project.focus);
    card.setAttribute("link", project.link);

    const ul = document.createElement("ul");
    ul.slot = "responsibilities";

    project.responsibilities.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });

    card.appendChild(ul);
    grid.appendChild(card);
  });
}

const JSONBIN_ID = "69353a58d0ea881f401848ba";
const JSONBIN_KEY = "$2a$10$/ryKFCqZizp3eiWliqfnCee7EtGl3c76AtEXunkj5/MWOawekF6vC";
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/69353a58d0ea881f401848ba`;


if (loadLocalBtn && grid) {
  loadLocalBtn.addEventListener("click", () => {
    const data = JSON.parse(localStorage.getItem("projects"));
    renderProjects(data);
  });
}

if (loadRemoteBtn && grid) {
  loadRemoteBtn.addEventListener("click", async () => {
    try {
      const response = await fetch(JSONBIN_URL, {
        headers: {
          "X-Master-Key": JSONBIN_KEY
        }
      });

      const result = await response.json();
      const projects = result.record.projects;
      renderProjects(projects);
    } catch (err) {
      console.error("Remote load failed:", err);
    }
  });
}


const form = document.getElementById("crud-form");
const statusText = document.getElementById("crud-status");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(form));
    data.responsibilities = data.responsibilities.split(",").map(s => s.trim());

    const response = await fetch(JSONBIN_URL, {
      method: "GET",
      headers: { "X-Master-Key": JSONBIN_KEY }
    });

    const result = await response.json();
    const projects = result.record.projects;

    // Pushes data to create post
    projects.push(data);

    await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_KEY
      },
      body: JSON.stringify({ projects })
    });

    statusText.textContent = "Project created successfully!";
    form.reset();
  });
}

const updateBtn = document.getElementById("update-btn");

if (updateBtn) {
  updateBtn.addEventListener("click", async () => {
    const data = Object.fromEntries(new FormData(form));
    data.responsibilities = data.responsibilities.split(",").map(s => s.trim());

    const response = await fetch(JSONBIN_URL, {
      headers: { "X-Master-Key": JSONBIN_KEY }
    });

    const result = await response.json();
    let projects = result.record.projects;

    projects = projects.map(p =>
      p.title === data.title ? data : p 
    );

    await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_KEY
      },
      body: JSON.stringify({ projects })
    });

    statusText.textContent = "Project updated successfully!";
    form.reset();
  });
}


const deleteBtn = document.getElementById("delete-btn");

if (deleteBtn) {
  deleteBtn.addEventListener("click", async () => {
    const title = form.title.value;

    const response = await fetch(JSONBIN_URL, {
      headers: { "X-Master-Key": JSONBIN_KEY }
    });

    const result = await response.json();
    const projects = result.record.projects.filter(p => p.title !== title);

    await fetch(JSONBIN_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_KEY
      },
      body: JSON.stringify({ projects })
    });

    statusText.textContent = "Project deleted successfully!";
    form.reset();
  });
}
