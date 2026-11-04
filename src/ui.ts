/**
 * ShopBoard — UI Coordinator Module
 *
 * Centralizes DOM initialization, Interactive Specimen Viewfinder,
 * Studio Registration form validation, and re-exports feature UI modules.
 */

import { setupArtworkModalEvents } from "./modules/artworks/artworks.ui.ts";
import { renderCartUI, setupCartEvents } from "./modules/cart/cart.ui.ts";
import { detectCatalogMode } from "./modules/catalog/catalog.mode.ts";
import type { LoadState, Product } from "./modules/products/products.types.ts";
import {
  renderCatalogState,
  setupProductCardEvents,
  setupToolbar,
} from "./modules/products/products.ui.ts";

export { renderCatalogState };

type ViewfinderKey = "cv" | "planner" | "budget" | "kanban";

function isViewfinderKey(value: string | undefined): value is ViewfinderKey {
  return value === "cv" || value === "planner" || value === "budget" || value === "kanban";
}

let viewfinderBound = false;

/**
 * Initializes the Interactive Specimen Viewfinder in the Hero (The Live Thing).
 */
export function setupViewfinder(): void {
  const display = document.querySelector("#viewfinder-display");
  const tabs = document.querySelectorAll(".viewfinder-tabs .tab-btn");
  if (!display || !tabs.length) return;

  const views: Readonly<Record<ViewfinderKey, string>> = {
    cv: `
      <div class="vf-document vf-doc-cv">
        <div class="vf-doc-top">
          <div class="vf-doc-identity">
            <div class="vf-doc-name">SARAH CHEN</div>
            <div class="vf-doc-role">Systems Architect &bull; San Francisco, CA</div>
          </div>
          <span class="vf-badge-verified">ATS Format &bull; 98% Match</span>
        </div>
        <div class="vf-doc-columns">
          <div class="vf-doc-left">
            <h4 class="vf-heading-compact">EXPERIENCE RECORD</h4>
            <div class="vf-item">
              <div class="vf-item-title">Principal Engineer &bull; HyperScale Inc.</div>
              <div class="vf-item-desc">Architected micro-frontend pipeline reducing build latency by 42%.</div>
            </div>
            <div class="vf-item">
              <div class="vf-item-title">Staff Developer &bull; Core Labs</div>
              <div class="vf-item-desc">Spearheaded accessible design token library serving 1.2M daily users.</div>
            </div>
          </div>
          <div class="vf-doc-right">
            <h4 class="vf-heading-compact">STACK</h4>
            <div class="vf-pill-cloud">
              <span class="vf-pill">TypeScript</span>
              <span class="vf-pill">Web Standards</span>
              <span class="vf-pill">State Sync</span>
              <span class="vf-pill">Micro-arch</span>
            </div>
          </div>
        </div>
      </div>
    `,
    planner: `
      <div class="vf-document vf-doc-planner">
        <div class="vf-doc-top">
          <div class="vf-doc-identity">
            <div class="vf-doc-name">SEMESTER MASTER PLAN</div>
            <div class="vf-doc-role">Week 08 Sprint &bull; Computational Theory &amp; Systems</div>
          </div>
          <span class="vf-badge-verified">3 Checkpoints Due</span>
        </div>
        <div class="vf-planner-grid">
          <div class="vf-day-box"><span class="day-h">MON</span><div class="task-badge">Graph Theory HW</div></div>
          <div class="vf-day-box"><span class="day-h">TUE</span><div class="task-badge is-active">Lab Checkpoint</div></div>
          <div class="vf-day-box"><span class="day-h">WED</span><div class="task-badge">Study Group</div></div>
          <div class="vf-day-box"><span class="day-h">THU</span><div class="task-badge">Architecture Exam</div></div>
        </div>
      </div>
    `,
    budget: `
      <div class="vf-document vf-doc-budget">
        <div class="vf-doc-top">
          <div class="vf-doc-identity">
            <div class="vf-doc-name">OPERATING BALANCE LEDGER</div>
            <div class="vf-doc-role">Monthly Runway &amp; Tooling Subscriptions</div>
          </div>
          <span class="vf-badge-verified">Active Tracker</span>
        </div>
        <div class="vf-budget-metrics">
          <div class="vf-stat-tile"><span class="st-lbl">Monthly Target</span><span class="st-val">$2,400.00</span></div>
          <div class="vf-stat-tile"><span class="st-lbl">Current Spend</span><span class="st-val">$1,680.00</span></div>
          <div class="vf-stat-tile"><span class="st-lbl">Net Buffer</span><span class="st-val">$720.00</span></div>
        </div>
      </div>
    `,
    kanban: `
      <div class="vf-document vf-doc-kanban">
        <div class="vf-doc-top">
          <div class="vf-doc-identity">
            <div class="vf-doc-name">ENGINEERING ROADMAP</div>
            <div class="vf-doc-role">CorePro Release 2.0 &bull; High Priority Queue</div>
          </div>
          <span class="vf-badge-verified">3 In Flight</span>
        </div>
        <div class="vf-kanban-board">
          <div class="vf-board-col">
            <span class="col-title">BACKLOG (4)</span>
            <div class="b-card">API Spec Definition</div>
            <div class="b-card">Cache Invalidation</div>
          </div>
          <div class="vf-board-col">
            <span class="col-title">IN FLIGHT (2)</span>
            <div class="b-card is-active">Specimen Catalogue UI</div>
          </div>
          <div class="vf-board-col">
            <span class="col-title">SHIPPED (14)</span>
            <div class="b-card">Storage Schema Sync</div>
          </div>
        </div>
      </div>
    `,
  };

  function setView(viewKey: ViewfinderKey): void {
    if (!display) return;
    display.innerHTML = views[viewKey];
    tabs.forEach((tab) => {
      if (tab instanceof HTMLElement) {
        const active = tab.dataset.view === viewKey;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-selected", active ? "true" : "false");
      }
    });
  }

  if (!viewfinderBound) {
    viewfinderBound = true;
    tabs.forEach((tab) => {
      if (tab instanceof HTMLElement) {
        tab.addEventListener("click", () => {
          const viewKey = tab.dataset.view;
          if (isViewfinderKey(viewKey)) {
            setView(viewKey);
          }
        });
      }
    });
  }

  // Default to CV view
  setView("cv");
}

let registrationFormBound = false;

/**
 * Sets up accessible registration form validation and submission.
 */
export function setupRegistrationForm(): void {
  if (registrationFormBound) {
    return;
  }

  const form = document.querySelector("#register-form");
  const feedbackElement = document.querySelector("#register-feedback");

  if (!(form instanceof HTMLFormElement) || !feedbackElement) return;
  registrationFormBound = true;

  const clearFeedback = (): void => {
    feedbackElement.textContent = "";
    feedbackElement.className = "form-feedback";
  };

  form.addEventListener("input", clearFeedback);

  form.addEventListener("submit", (event: SubmitEvent) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      clearFeedback();
      form.reportValidity();
      return;
    }

    feedbackElement.textContent =
      "Registration successful! Note: This is an educational demonstration only. No account has been created and no personal data or passwords have been stored.";
    feedbackElement.className = "form-feedback is-visible is-success";

    form.reset();
  });
}

let mobileNavBound = false;

/**
 * Initializes responsive mobile navigation drawer and collections dropdown.
 */
export function setupMobileNav(): void {
  if (mobileNavBound) {
    return;
  }
  mobileNavBound = true;

  const mobileNavToggle = document.querySelector("#mobile-nav-toggle");
  const mobileNavClose = document.querySelector("#mobile-nav-close");
  const mobileNavDrawer = document.querySelector("#mobile-nav-drawer");
  const mobileNavBackdrop = document.querySelector("#mobile-nav-backdrop");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  const openMobileNav = (): void => {
    if (mobileNavDrawer && mobileNavBackdrop && mobileNavToggle) {
      mobileNavDrawer.classList.add("is-open");
      mobileNavBackdrop.classList.add("is-open");
      mobileNavDrawer.setAttribute("aria-hidden", "false");
      mobileNavBackdrop.setAttribute("aria-hidden", "false");
      mobileNavToggle.setAttribute("aria-expanded", "true");
      if (mobileNavClose instanceof HTMLElement) {
        mobileNavClose.focus();
      }
    }
  };

  const closeMobileNav = (): void => {
    if (mobileNavDrawer && mobileNavBackdrop && mobileNavToggle) {
      mobileNavDrawer.classList.remove("is-open");
      mobileNavBackdrop.classList.remove("is-open");
      mobileNavDrawer.setAttribute("aria-hidden", "true");
      mobileNavBackdrop.setAttribute("aria-hidden", "true");
      mobileNavToggle.setAttribute("aria-expanded", "false");
      if (mobileNavToggle instanceof HTMLElement) {
        mobileNavToggle.focus();
      }
    }
  };

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener("click", () => {
      const isOpen = mobileNavDrawer?.classList.contains("is-open");
      if (isOpen) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener("click", closeMobileNav);
  }

  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener("click", closeMobileNav);
  }

  mobileLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  document.addEventListener("keydown", (e: KeyboardEvent) => {
    if (e.key === "Escape" && mobileNavDrawer?.classList.contains("is-open")) {
      closeMobileNav();
    }
  });

  document.querySelectorAll<HTMLElement>(".nav-dept-link").forEach((link) => {
    link.addEventListener("click", () => {
      const dept = link.dataset.dept;
      if (dept) {
        const categorySelect = document.querySelector("#category-filter");
        if (categorySelect instanceof HTMLSelectElement) {
          categorySelect.value = dept;
          categorySelect.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      closeMobileNav();
      const collectionsTrigger = document.querySelector("#collections-trigger");
      const collectionsDropdown = document.querySelector("#collections-dropdown");
      if (collectionsTrigger && collectionsDropdown) {
        collectionsTrigger.setAttribute("aria-expanded", "false");
        collectionsDropdown.classList.remove("is-active");
      }
    });
  });

  const collectionsTrigger = document.querySelector("#collections-trigger");
  const collectionsDropdown = document.querySelector("#collections-dropdown");
  if (collectionsTrigger && collectionsDropdown) {
    collectionsTrigger.addEventListener("click", () => {
      const isExpanded = collectionsTrigger.getAttribute("aria-expanded") === "true";
      collectionsTrigger.setAttribute("aria-expanded", String(!isExpanded));
      collectionsDropdown.classList.toggle("is-active", !isExpanded);
    });

    document.addEventListener("click", (e: MouseEvent) => {
      const target = e.target;
      if (target instanceof Node) {
        if (!collectionsTrigger.contains(target) && !collectionsDropdown.contains(target)) {
          collectionsTrigger.setAttribute("aria-expanded", "false");
          collectionsDropdown.classList.remove("is-active");
        }
      }
    });

    document.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape" && collectionsTrigger.getAttribute("aria-expanded") === "true") {
        collectionsTrigger.setAttribute("aria-expanded", "false");
        collectionsDropdown.classList.remove("is-active");
        if (collectionsTrigger instanceof HTMLElement) {
          collectionsTrigger.focus();
        }
      }
    });
  }
}

/**
 * Sets up the AEVUM Royal Salon Hero Primary CTA handler.
 * Provides accessible, truthful feedback without misleading links.
 */
export function setupHeroCTA(): void {
  const ctaBtn = document.querySelector("#hero-enter-gallery-btn");
  if (!ctaBtn) return;
  ctaBtn.addEventListener("click", () => {
    const productsSection = document.querySelector("#products");
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

/**
 * Living gallery subtle ambient parallax depth on desktop.
 * Respects prefers-reduced-motion, applies slow damping (lerp), and restricts motion to max ±6px.
 */
export function setupHeroParallax(): void {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(min-width: 960px)").matches) return;

  const heroSection = document.querySelector<HTMLElement>(".aevum-hero-section");
  const canvas = document.querySelector<HTMLElement>(".hero-artwork-canvas");
  if (!heroSection || !canvas) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isMoving = false;

  const tick = (): void => {
    currentX += (targetX - currentX) * 0.05;
    currentY += (targetY - currentY) * 0.05;

    canvas.style.transform = `scale(1.03) translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;

    if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
      requestAnimationFrame(tick);
    } else {
      isMoving = false;
    }
  };

  const onMouseMove = (e: MouseEvent): void => {
    const rect = heroSection.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width - 0.5;
    const yRatio = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = -xRatio * 10;
    targetY = -yRatio * 8;

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(tick);
    }
  };

  const onMouseLeave = (): void => {
    targetX = 0;
    targetY = 0;
  };

  heroSection.addEventListener("mousemove", onMouseMove);
  heroSection.addEventListener("mouseleave", onMouseLeave);
}

/**
 * Sets up a restrained single-trigger scroll entrance animation for the Art Journal section.
 * Respects prefers-reduced-motion and fails safe (content remains visible if JS fails).
 */
export function setupArtJournalObserver(): void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const spread = document.querySelector<HTMLElement>(".art-journal-spread");
  if (!spread) return;

  spread.classList.add("is-scroll-ready");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          spread.classList.add("is-in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.05 },
  );

  observer.observe(spread);
}

/**
 * Initializes and mounts all UI components and event listeners.
 */
export function initUI(
  catalogInitializer?: readonly Product[] | (() => void | Promise<void>),
): void {
  const mount = (): void => {
    const mode = detectCatalogMode();
    if (typeof document !== "undefined") {
      document.documentElement.dataset.mode = mode;
      document.body.classList.remove("mode-gallery", "mode-course");
      document.body.classList.add(`mode-${mode}`);

      if (mode === "gallery") {
        const topicTag = document.querySelector("#products .studio-topic-tag");
        const sectionTitle = document.querySelector("#products .section-title");
        const sectionSubtitle = document.querySelector("#products .section-subtitle");

        if (topicTag) topicTag.textContent = "PRIVATE COLLECTION";
        if (sectionTitle) sectionTitle.textContent = "Catalogue of Curated Works";
        if (sectionSubtitle) {
          sectionSubtitle.textContent = "An intimate study of art, craftsmanship and time.";
        }

        const searchLabel = document.querySelector('label[for="product-search"]');
        const searchField = document.querySelector("#product-search");
        const categoryLabel = document.querySelector('label[for="category-filter"]');
        const sortLabel = document.querySelector('label[for="price-sort"]');
        const sortField = document.querySelector("#price-sort");
        if (searchLabel) searchLabel.textContent = "Search the catalogue";
        if (searchField instanceof HTMLInputElement) {
          searchField.placeholder = "Title, department or medium...";
        }
        if (categoryLabel) categoryLabel.textContent = "Department";
        if (sortLabel) sortLabel.textContent = "Order by value";
        if (sortField instanceof HTMLSelectElement) {
          const [defaultOpt, ascOpt, descOpt] = Array.from(sortField.options);
          if (defaultOpt) defaultOpt.textContent = "Catalogue order";
          if (ascOpt) ascOpt.textContent = "Estimated value: ascending";
          if (descOpt) descOpt.textContent = "Estimated value: descending";
        }

        const regTopic = document.querySelector("#register .studio-topic-tag");
        const regTitle = document.querySelector("#register .section-title");
        const regSubtitle = document.querySelector("#register .section-subtitle");
        if (regTopic) regTopic.textContent = "Curatorial Salons";
        if (regTitle) regTitle.textContent = "Private Viewing Inquiries";
        if (regSubtitle) {
          regSubtitle.textContent =
            "Request private viewing appointments or submit curatorial acquisition inquiries. Educational portfolio demonstration.";
        }

        const footerBrand = document.querySelector(".footer-brand .brand-text");
        if (footerBrand) {
          footerBrand.innerHTML = 'AEVUM<span class="brand-accent-dot">.</span>';
        }
        const footerTagline = document.querySelector(".footer-tagline");
        if (footerTagline) {
          footerTagline.textContent =
            "Art Across Ages — An educational fine art exhibition and digital storefront designed for the CorePro program.";
        }
        const footerWatermark = document.querySelector(".footer-watermark");
        if (footerWatermark) {
          footerWatermark.textContent = "AEVUM";
        }
      }
    }

    renderCartUI();
    setupViewfinder();
    setupToolbar();
    setupProductCardEvents();
    setupArtworkModalEvents();
    setupCartEvents();
    setupRegistrationForm();
    setupMobileNav();
    setupHeroCTA();
    setupHeroParallax();
    setupArtJournalObserver();

    if (typeof catalogInitializer === "function") {
      void catalogInitializer();
    } else if (Array.isArray(catalogInitializer)) {
      const state: LoadState = {
        status: "success",
        products: [...catalogInitializer],
      };
      renderCatalogState(state);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}
