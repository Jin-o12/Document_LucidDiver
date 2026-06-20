/* ============================================================
   main.js — 침몽도시: 루시드 다이버 Portfolio GDD
   ============================================================ */

"use strict";

/* ── Scroll Spy ─────────────────────────────────────────────── */
function initScrollSpy() {
  const navLinks = document.querySelectorAll(".nav-link[href^='#']");
  const sections = [];

  navLinks.forEach(link => {
    const id = link.getAttribute("href").replace("#", "");
    const el = document.getElementById(id);
    if (el) sections.push({ id, el, link });
  });

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        const found = sections.find(s => s.id === entry.target.id);
        if (!found) return;
        if (entry.isIntersecting) {
          navLinks.forEach(l => l.classList.remove("active"));
          found.link.classList.add("active");
        }
      });
    },
    { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
  );

  sections.forEach(({ el }) => observer.observe(el));
}

/* ── Mobile Navigation ───────────────────────────────────────── */
function initMobileNav() {
  const hamburger  = document.getElementById("hamburger");
  const sideNav    = document.getElementById("side-nav");
  const navLinks   = document.querySelectorAll(".nav-link");
  const overlay    = document.getElementById("nav-overlay");

  if (!hamburger || !sideNav) return;

  function openNav() {
    sideNav.classList.add("open");
    hamburger.classList.add("open");
    if (overlay) overlay.style.display = "block";
    document.body.style.overflow = "hidden";
  }

  function closeNav() {
    sideNav.classList.remove("open");
    hamburger.classList.remove("open");
    if (overlay) overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", () => {
    if (sideNav.classList.contains("open")) closeNav();
    else openNav();
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 768) closeNav();
    });
  });

  if (overlay) overlay.addEventListener("click", closeNav);
}

/* ── Scroll-to-top ───────────────────────────────────────────── */
function initScrollTop() {
  const btn = document.getElementById("scroll-top");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) btn.classList.add("visible");
    else btn.classList.remove("visible");
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ── Lightbox ─────────────────────────────────────────────────── */
function initLightbox() {
  const lb     = document.getElementById("lightbox");
  const lbImg  = document.getElementById("lightbox-img");
  const lbClose = document.getElementById("lightbox-close");
  const triggers = document.querySelectorAll(".screen-card img, [data-lightbox]");

  if (!lb) return;

  function openLb(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  triggers.forEach(el => {
    el.style.cursor = "zoom-in";
    el.addEventListener("click", () => {
      openLb(el.src, el.alt);
    });
  });

  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLb();
  });

  if (lbClose) lbClose.addEventListener("click", closeLb);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLb();
  });
}

/* ── Smooth Nav link highlight on scroll ─────────────────────── */
function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  if (!sections.length) return;

  let ticking = false;

  function highlight() {
    const scrollY = window.scrollY;
    const navLinks = document.querySelectorAll(".nav-link[href^='#']");

    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      const href = link.getAttribute("href");
      if (href === `#${current}`) {
        link.classList.add("active");
        // auto-scroll nav to show active item
        const nav = document.getElementById("side-nav");
        if (nav) {
          const linkRect = link.getBoundingClientRect();
          const navRect  = nav.getBoundingClientRect();
          if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
            link.scrollIntoView({ block: "nearest", behavior: "smooth" });
          }
        }
      }
    });
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(highlight);
      ticking = true;
    }
  });

  // Initial call
  highlight();
}

/* ── Fade-in on scroll ───────────────────────────────────────── */
function initFadeIn() {
  const elements = document.querySelectorAll(
    ".card, .screen-card, .portfolio-card, .download-card, .feedback-item, .flow-step, .world-card"
  );

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("fade-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08 }
  );

  elements.forEach(el => {
    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    observer.observe(el);
  });

  document.querySelectorAll(".fade-visible").forEach(el => {
    el.style.opacity = "1";
    el.style.transform = "translateY(0)";
  });
}

// Apply fade-visible class
document.addEventListener("DOMContentLoaded", () => {
  // Small delay to allow layout
  requestAnimationFrame(() => {
    document.querySelectorAll(".card, .screen-card, .portfolio-card, .download-card, .feedback-item, .flow-step, .world-card").forEach(el => {
      if (el.classList.contains("fade-visible")) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }
    });
  });
});

// Override: add style when element becomes visible
const _observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
        _observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
);

/* ── Bootstrap All ───────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  initScrollSpy();
  initMobileNav();
  initScrollTop();
  initLightbox();
  initNavHighlight();
  initFadeIn();

  // Hook fade-in observer
  document.querySelectorAll(
    ".card, .screen-card, .portfolio-card, .download-card, .feedback-item, .flow-step, .world-card"
  ).forEach(el => _observer.observe(el));
});
