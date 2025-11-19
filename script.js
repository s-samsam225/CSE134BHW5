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
