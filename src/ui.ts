/**
 * ShopBoard — UI Coordinator Module
 *
 * Centralizes DOM initialization, Interactive Specimen Viewfinder,
 * Studio Registration form validation, and re-exports feature UI modules.
 */

import {
  closeCartSidebar,
  openCartSidebar,
  renderCartUI,
  setupCartEvents,
} from "./modules/cart/cart.ui.ts";
import type { LoadState, Product } from "./modules/products/products.types.ts";
import {
  renderCatalogState,
  renderProducts,
  setupProductCardEvents,
  setupToolbar,
} from "./modules/products/products.ui.ts";

export {
  closeCartSidebar,
  openCartSidebar,
  renderCartUI,
  renderCatalogState,
  renderProducts,
  setupCartEvents,
  setupProductCardEvents,
  setupToolbar,
};

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

/**
 * Initializes and mounts all UI components and event listeners.
 */
export function initUI(
  catalogInitializer?: readonly Product[] | (() => void | Promise<void>),
): void {
  const mount = (): void => {
    renderCartUI();
    setupViewfinder();
    setupToolbar();
    setupProductCardEvents();
    setupCartEvents();
    setupRegistrationForm();

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
