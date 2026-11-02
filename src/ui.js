/**
 * ShopBoard — UI Module
 *
 * Implements Concept A: Editorial Minimalism (The Architectural Ledger).
 * Strictly manages DOM queries, rendering, interactive Viewfinder, and UI event listeners.
 * Interacts with pure logic from logic.js and persistent cart state from state.js.
 */

import {
  filterProducts,
  sortProducts,
  calculateTotalPrice,
  calculateTotalItems,
  calculateLineTotal,
} from "./logic.js";

import {
  getCartState,
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "./state.js";

/**
 * Escapes characters for safe HTML injection to prevent XSS.
 *
 * @param {string} str
 * @returns {string} Sanitized string
 */
function escapeHtml(str) {
  if (typeof str !== "string") return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Formats a two-digit reference number for editorial ledger styling.
 *
 * @param {number} num
 * @returns {string} e.g. "01"
 */
function formatTwoDigit(num) {
  return String(num).padStart(2, "0");
}

/**
 * Generates an authentic Swiss architectural miniature sheet preview for each product card.
 *
 * @param {Object} product
 * @returns {string} HTML snippet
 */
function getSpecimenPreviewHtml(product) {
  const specs = {
    "cv-template": {
      code: "ATS-DOC // A4",
      meta: "2-COL • TYPOGRAPHIC",
      cells: ["EXPERIENCE LOG", "SKILL MATRIX", "99% PARSE"],
    },
    "study-planner": {
      code: "SEM-II // GRID",
      meta: "16-WK • ACADEMIC",
      cells: ["MON–FRI BLOCKS", "EXAM CADENCE", "REVISION"],
    },
    "portfolio-template": {
      code: "WEB-SYS // FLUID",
      meta: "12-COL • EDITORIAL",
      cells: ["CASE INDEX", "SPECIMEN VIEW", "COLOPHON"],
    },
    "budget-tracker": {
      code: "FIN-LEDGER // Q1",
      meta: "DOUBLE-ENTRY • USD",
      cells: ["INFLOW +28%", "OPEX CAP", "RESERVE"],
    },
    "task-manager": {
      code: "KANBAN // SPRINT",
      meta: "3-STAGE • PRIORITY",
      cells: ["BACKLOG [04]", "ACTIVE [02]", "DONE [14]"],
    },
    "digital-notebook": {
      code: "INDEX-NB // 5MM",
      meta: "HYPERLINKED • DOT",
      cells: ["SEC 01–08", "CROSS-REF", "ARCHIVE"],
    },
    "invoice-template": {
      code: "INV-BILL // NET15",
      meta: "AUTO-CALC • LEDGER",
      cells: ["LINE ITEMS", "TAX MATRIX", "REMITTANCE"],
    },
    "fitness-planner": {
      code: "CYCLE-LOG // WK04",
      meta: "PROGRESSIVE • LOAD",
      cells: ["SPLIT A/B", "VOLUME BAR", "RECOVERY"],
    },
    "pitch-deck": {
      code: "DECK-16:9 // SEED",
      meta: "24-SLIDE • NARRATIVE",
      cells: ["THESIS 01", "UNIT ECON", "ROADMAP"],
    },
    "habit-tracker": {
      code: "CADENCE // 30-DAY",
      meta: "STREAK • MATRIX",
      cells: ["DAILY CHECK", "94% RATE", "MILESTONE"],
    },
    "student-dashboard": {
      code: "ACAD-HUB // CORE",
      meta: "MULTI-COURSE • SYNC",
      cells: ["SYLLABUS", "DEADLINES", "GPA 3.94"],
    },
    "project-planner": {
      code: "GANTT-SYS // Q1–Q4",
      meta: "CRITICAL PATH • AGILE",
      cells: ["PHASE 01", "DELIVERABLES", "SHIPPED"],
    },
  };

  const spec = specs[product.id] || {
    code: "SYS-SPEC // 01",
    meta: "MODULAR • STANDARD",
    cells: ["STRUCTURE", "PERSISTENCE", "VERIFIED"],
  };

  return `
    <div class="plate-specimen-mini" aria-hidden="true">
      <div class="mini-sheet-top">
        <span class="mini-sheet-code">${spec.code}</span>
        <span class="mini-sheet-meta">${spec.meta}</span>
      </div>
      <div class="mini-sheet-Rule"></div>
      <div class="mini-sheet-cells">
        <span class="mini-cell is-accent">${spec.cells[0]}</span>
        <span class="mini-cell">${spec.cells[1]}</span>
        <span class="mini-cell">${spec.cells[2]}</span>
      </div>
    </div>
  `;
}

/**
 * Renders product cards dynamically into the products container.
 * Uses Array.map and join for rendering.
 *
 * @param {Array<Object>} productsToRender - Product items to render.
 */
export function renderProducts(productsToRender) {
  const container = document.querySelector("#products-grid");
  const announcer = document.querySelector("#product-results-announcer");

  if (!container) return;

  if (productsToRender.length === 0) {
    container.innerHTML = `
      <div class="products-empty" role="status">
        <h3 class="products-empty-title">No Catalog Entries Match Selection</h3>
        <p class="products-empty-desc">
          No templates or operating sheets match your current search query or active category filter.
        </p>
        <button type="button" id="reset-filters-btn" class="btn btn-outline-hairline">
          Reset All Filters
        </button>
      </div>
    `;
    if (announcer) {
      announcer.textContent = "No products found matching the selected filters.";
    }
    return;
  }

  container.innerHTML = productsToRender
    .map((product, index) => {
      const refNum = formatTwoDigit(index + 1);
      return `
        <article class="product-card" data-product-id="${escapeHtml(product.id)}">
          <div class="product-plate-mast">
            <span class="product-ref-code">REF. SB-${refNum}</span>
            <span class="product-category-stamp">${escapeHtml(product.category.toUpperCase())}</span>
          </div>

          <div class="product-graphic-plate" aria-hidden="true">
            <div class="plate-icon-stamp">
              ${product.icon || ""}
            </div>
            ${getSpecimenPreviewHtml(product)}
          </div>

          <div class="product-content">
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <p class="product-description">${escapeHtml(product.description)}</p>

            <div class="product-footer-bar">
              <div class="product-price-lockup">
                <span class="product-price">$${product.price}</span>
                <span class="product-currency">USD</span>
              </div>
              <button
                type="button"
                class="btn-add-cart add-to-cart-btn"
                data-id="${escapeHtml(product.id)}"
                aria-label="Add ${escapeHtml(product.name)} to Cart"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  if (announcer) {
    announcer.textContent = `Showing ${productsToRender.length} ${
      productsToRender.length === 1 ? "product" : "products"
    }.`;
  }
}

/**
 * Initializes the Interactive Specimen Viewfinder in the Hero section.
 * Renders authentic editorial sheets for CV, Academic Planner, Operating Ledger, and Sprint Board.
 */
export function setupViewfinder() {
  const display = document.querySelector("#viewfinder-display");
  const tabs = document.querySelectorAll(".specimen-tabs-bar .tab-btn");
  if (!display || !tabs.length) return;

  const views = {
    cv: `
      <div class="specimen-sheet-layout">
        <div class="specimen-sheet-mast">
          <div>
            <h3 class="specimen-subject-name">ELENA ROSTOVA</h3>
            <span class="specimen-subject-sub">SYSTEMS ARCHITECT &bull; ZÜRICH, CH</span>
          </div>
          <span class="specimen-pill">REF: ATS-CH-99</span>
        </div>
        <div class="specimen-columns-split">
          <div>
            <div class="specimen-subhead">EXPERIENCE RECORD</div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">Principal Systems Engineer &bull; Helvetica Foundry</div>
              <div class="specimen-item-detail">Architected zero-dependency frontend runtime serving 4.8M monthly requests.</div>
            </div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">Staff Interface Designer &bull; Basel Digital</div>
              <div class="specimen-item-detail">Standardized mathematical design tokens and accessible typography matrix.</div>
            </div>
          </div>
          <div>
            <div class="specimen-subhead">CORE DISCIPLINES</div>
            <div class="specimen-tag-matrix">
              <span class="specimen-pill">Vanilla JS</span>
              <span class="specimen-pill">Web Standards</span>
              <span class="specimen-pill">Modular CSS</span>
              <span class="specimen-pill">WCAG 2.1 AAA</span>
              <span class="specimen-pill">State Machines</span>
              <span class="specimen-pill">Data Integrity</span>
            </div>
          </div>
        </div>
      </div>
    `,
    planner: `
      <div class="specimen-sheet-layout">
        <div class="specimen-sheet-mast">
          <div>
            <h3 class="specimen-subject-name">2026 ACADEMIC PLANNER</h3>
            <span class="specimen-subject-sub">SEMESTER II CURRICULUM MATRIX &bull; COREPRO SD-AI</span>
          </div>
          <span class="specimen-pill">WEEK 08 / 16</span>
        </div>
        <div class="specimen-columns-split">
          <div>
            <div class="specimen-subhead">CRITICAL MILESTONES</div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">Day 2: Architecture &amp; Cart Persistence</div>
              <div class="specimen-item-detail">Passed empirical audit with 30 automated unit tests &amp; zero regressions.</div>
            </div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">Day 3: State Machines &amp; Async Handlers</div>
              <div class="specimen-item-detail">Preparation of modular payment workflows and receipt generation.</div>
            </div>
          </div>
          <div>
            <div class="specimen-subhead">ALLOCATION SCHEDULE</div>
            <div class="specimen-tag-matrix">
              <span class="specimen-pill">08:00 Architectural Audit</span>
              <span class="specimen-pill">11:00 Test Execution</span>
              <span class="specimen-pill">14:00 Typographic Polish</span>
              <span class="specimen-pill">17:00 Artifact Verification</span>
            </div>
          </div>
        </div>
      </div>
    `,
    budget: `
      <div class="specimen-sheet-layout">
        <div class="specimen-sheet-mast">
          <div>
            <h3 class="specimen-subject-name">OPERATING LEDGER</h3>
            <span class="specimen-subject-sub">INDEPENDENT STUDIO Q1 FINANCIAL SUMMARY</span>
          </div>
          <span class="specimen-pill">AUDITED &bull; BALANCED</span>
        </div>
        <div class="specimen-columns-split">
          <div>
            <div class="specimen-subhead">LINE ITEM ACCOUNTS</div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">Digital Software &amp; Assets Revenue</div>
              <div class="specimen-item-detail">Net inflow: $48,240.00 &bull; +28% over prior quarter ledger.</div>
            </div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">Infrastructure &amp; Tooling OPEX</div>
              <div class="specimen-item-detail">Net outflow: $3,120.00 &bull; 93.5% operating margin.</div>
            </div>
          </div>
          <div>
            <div class="specimen-subhead">RESERVE STATUS</div>
            <div class="specimen-tag-matrix">
              <span class="specimen-pill">Cash: $142,500</span>
              <span class="specimen-pill">Runway: 28 Mo</span>
              <span class="specimen-pill">Tax Escrow: 100%</span>
              <span class="specimen-pill">Zero Debt</span>
            </div>
          </div>
        </div>
      </div>
    `,
    kanban: `
      <div class="specimen-sheet-layout">
        <div class="specimen-sheet-mast">
          <div>
            <h3 class="specimen-subject-name">SYSTEMS EXECUTION BOARD</h3>
            <span class="specimen-subject-sub">HIGH-PRECISION QUEUE &bull; SPRINT 14</span>
          </div>
          <span class="specimen-pill">VELOCITY: 42 PTS</span>
        </div>
        <div class="specimen-columns-split">
          <div>
            <div class="specimen-subhead">IN-FLIGHT WORKSTREAM</div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">[ACTIVE] Architectural Ledger System</div>
              <div class="specimen-item-detail">Swiss editorial hierarchy: limestone ground, carbon ink, tabular math.</div>
            </div>
            <div class="specimen-record-item">
              <div class="specimen-item-role">[QUEUED] Responsive Viewport Verification</div>
              <div class="specimen-item-detail">Empirical headless Chromium audit across 320px to 1440px viewports.</div>
            </div>
          </div>
          <div>
            <div class="specimen-subhead">COMPLETED ITEMS</div>
            <div class="specimen-tag-matrix">
              <span class="specimen-pill">✓ Clean Unit Tests</span>
              <span class="specimen-pill">✓ Strict ESLint</span>
              <span class="specimen-pill">✓ Mobile Overflows 0px</span>
              <span class="specimen-pill">✓ Zero !important</span>
            </div>
          </div>
        </div>
      </div>
    `,
  };

  function setView(viewKey) {
    display.innerHTML = views[viewKey] || views.cv;
    tabs.forEach((tab) => {
      const active = tab.dataset.view === viewKey;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const viewKey = tab.dataset.view;
      if (viewKey) {
        setView(viewKey);
      }
    });
  });

  // Default to CV view
  setView("cv");
}

/**
 * Opens the cart slide-over sidebar.
 */
export function openCartSidebar() {
  const cartSidebar = document.querySelector("#cart-sidebar");
  const cartBackdrop = document.querySelector("#cart-backdrop");
  const cartToggleBtn = document.querySelector("#cart-toggle-btn");
  const cartCloseBtn = document.querySelector("#cart-close-btn");

  if (cartSidebar && cartBackdrop && cartToggleBtn) {
    cartSidebar.classList.add("is-open");
    cartBackdrop.classList.add("is-open");
    cartSidebar.setAttribute("aria-hidden", "false");
    cartBackdrop.setAttribute("aria-hidden", "false");
    cartToggleBtn.setAttribute("aria-expanded", "true");
    if (cartCloseBtn) {
      cartCloseBtn.focus();
    }
  }
}

/**
 * Closes the cart slide-over sidebar.
 */
export function closeCartSidebar() {
  const cartSidebar = document.querySelector("#cart-sidebar");
  const cartBackdrop = document.querySelector("#cart-backdrop");
  const cartToggleBtn = document.querySelector("#cart-toggle-btn");

  if (cartSidebar && cartBackdrop && cartToggleBtn) {
    cartSidebar.classList.remove("is-open");
    cartBackdrop.classList.remove("is-open");
    cartSidebar.setAttribute("aria-hidden", "true");
    cartBackdrop.setAttribute("aria-hidden", "true");
    cartToggleBtn.setAttribute("aria-expanded", "false");
    cartToggleBtn.focus();
  }
}

/**
 * Renders the shopping cart view and synchronizes all cart UI elements.
 */
export function renderCartUI() {
  const cart = getCartState();
  const totalItems = calculateTotalItems(cart);
  const totalPrice = calculateTotalPrice(cart);

  const cartCountBadge = document.querySelector("#cart-count");
  const cartHeaderCount = document.querySelector("#cart-header-count");
  const cartToggleBtn = document.querySelector("#cart-toggle-btn");
  const cartItemsContainer = document.querySelector("#cart-items-container");
  const cartTotalAmount = document.querySelector("#cart-total-amount");
  const clearCartBtn = document.querySelector("#clear-cart-btn");

  if (cartCountBadge) {
    cartCountBadge.textContent = String(totalItems);
  }
  if (cartHeaderCount) {
    cartHeaderCount.textContent = `${totalItems} ${totalItems === 1 ? "item" : "items"}`;
  }
  if (cartToggleBtn) {
    cartToggleBtn.setAttribute(
      "aria-label",
      `Shopping Cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`,
    );
  }
  if (cartTotalAmount) {
    cartTotalAmount.textContent = `$${totalPrice}`;
  }
  if (clearCartBtn) {
    clearCartBtn.disabled = cart.length === 0;
  }

  if (!cartItemsContainer) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty">
        <p class="cart-empty-title">Cart Ledger Is Empty</p>
        <p class="cart-empty-subtitle">
          Select digital operating sheets or templates from the catalog to add items.
        </p>
      </div>
    `;
    return;
  }

  cartItemsContainer.innerHTML = cart
    .map((item) => {
      const lineTotal = calculateLineTotal(item.price, item.quantity);
      return `
        <div class="cart-item-card" data-item-id="${escapeHtml(item.id)}">
          <div class="cart-item-main">
            <div class="cart-item-info">
              <h3 class="cart-item-name">${escapeHtml(item.name)}</h3>
              <p class="cart-item-unit-price">$${item.price} USD each</p>
            </div>
            <button
              type="button"
              class="cart-item-remove-btn"
              data-remove-id="${escapeHtml(item.id)}"
              aria-label="Remove ${escapeHtml(item.name)} from cart"
            >
              Remove
            </button>
          </div>
          <div class="cart-item-footer">
            <div class="cart-item-qty-control" role="group" aria-label="Quantity controls for ${escapeHtml(item.name)}">
              <button
                type="button"
                class="cart-qty-btn cart-qty-decrease"
                data-id="${escapeHtml(item.id)}"
                aria-label="Decrease quantity of ${escapeHtml(item.name)}"
              >
                &minus;
              </button>
              <span class="cart-qty-value" aria-label="Current quantity: ${item.quantity}">${item.quantity}</span>
              <button
                type="button"
                class="cart-qty-btn cart-qty-increase"
                data-id="${escapeHtml(item.id)}"
                aria-label="Increase quantity of ${escapeHtml(item.name)}"
              >
                +
              </button>
            </div>
            <span class="cart-item-line-total">$${lineTotal} USD</span>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Sets up toolbar controls (search, category filter, price sort).
 *
 * @param {Array<Object>} allProducts - Catalog of all products.
 */
export function setupToolbar(allProducts) {
  const searchInput = document.querySelector("#product-search");
  const categorySelect = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#price-sort");
  const productsContainer = document.querySelector("#products-grid");

  function updateProducts() {
    const query = searchInput ? searchInput.value : "";
    const category = categorySelect ? categorySelect.value : "all";
    const sortBy = sortSelect ? sortSelect.value : "default";

    const filtered = filterProducts(allProducts, query, category);
    const sorted = sortProducts(filtered, sortBy);
    renderProducts(sorted);
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateProducts);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", updateProducts);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", updateProducts);
  }

  if (productsContainer) {
    productsContainer.addEventListener("click", (event) => {
      if (event.target.id === "reset-filters-btn") {
        if (searchInput) searchInput.value = "";
        if (categorySelect) categorySelect.value = "all";
        if (sortSelect) sortSelect.value = "default";
        updateProducts();
      }
    });
  }
}

/**
 * Attaches event delegation to the products container for "Add to Cart" clicks.
 *
 * @param {Array<Object>} allProducts - Full dataset of products.
 */
export function setupProductCardEvents(allProducts) {
  const productsContainer = document.querySelector("#products-grid");
  const cartAnnouncer = document.querySelector("#cart-announcer");

  if (!productsContainer) return;

  productsContainer.addEventListener("click", (event) => {
    const addBtn = event.target.closest(".add-to-cart-btn");
    if (!addBtn) return;

    const productId = addBtn.dataset.id;
    if (!productId) return;

    const product = allProducts.find((entry) => entry.id === productId);
    if (!product) return;

    addToCart(product);
    renderCartUI();

    if (cartAnnouncer) {
      cartAnnouncer.textContent = `${product.name} added to cart.`;
    }

    openCartSidebar();
  });
}

/**
 * Sets up cart sidebar UI event listeners.
 */
export function setupCartEvents() {
  const cartToggleBtn = document.querySelector("#cart-toggle-btn");
  const cartCloseBtn = document.querySelector("#cart-close-btn");
  const cartBackdrop = document.querySelector("#cart-backdrop");
  const cartSidebar = document.querySelector("#cart-sidebar");
  const cartItemsContainer = document.querySelector("#cart-items-container");
  const clearCartBtn = document.querySelector("#clear-cart-btn");
  const cartAnnouncer = document.querySelector("#cart-announcer");

  if (cartToggleBtn) {
    cartToggleBtn.addEventListener("click", () => {
      const isOpen = cartSidebar && cartSidebar.classList.contains("is-open");
      if (isOpen) {
        closeCartSidebar();
      } else {
        openCartSidebar();
      }
    });
  }

  if (cartCloseBtn) {
    cartCloseBtn.addEventListener("click", closeCartSidebar);
  }

  if (cartBackdrop) {
    cartBackdrop.addEventListener("click", closeCartSidebar);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cartSidebar && cartSidebar.classList.contains("is-open")) {
      closeCartSidebar();
    }
  });

  if (window.location.hash === "#cart") {
    openCartSidebar();
  }
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#cart") {
      openCartSidebar();
    }
  });

  if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
      // Decrease quantity button
      const decreaseBtn = event.target.closest(".cart-qty-decrease");
      if (decreaseBtn) {
        const id = decreaseBtn.dataset.id;
        if (id) {
          decreaseQuantity(id);
          renderCartUI();
          if (cartAnnouncer) {
            cartAnnouncer.textContent = "Item quantity decreased.";
          }
        }
        return;
      }

      // Increase quantity button
      const increaseBtn = event.target.closest(".cart-qty-increase");
      if (increaseBtn) {
        const id = increaseBtn.dataset.id;
        if (id) {
          increaseQuantity(id);
          renderCartUI();
          if (cartAnnouncer) {
            cartAnnouncer.textContent = "Item quantity increased.";
          }
        }
        return;
      }

      // Remove item button
      const removeBtn = event.target.closest(".cart-item-remove-btn");
      if (!removeBtn) return;

      const removeId = removeBtn.dataset.removeId;
      if (removeId) {
        removeFromCart(removeId);
        renderCartUI();
        if (cartAnnouncer) {
          cartAnnouncer.textContent = "Item removed from cart.";
        }
      }
    });
  }

  if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
      clearCart();
      renderCartUI();
      if (cartAnnouncer) {
        cartAnnouncer.textContent = "Shopping cart has been cleared.";
      }
    });
  }
}

/**
 * Sets up accessible registration form validation and submission.
 */
export function setupRegistrationForm() {
  const form = document.querySelector("#register-form");
  const feedbackElement = document.querySelector("#register-feedback");

  if (!form || !feedbackElement) return;

  const clearFeedback = () => {
    feedbackElement.textContent = "";
    feedbackElement.className = "form-feedback-message";
  };

  form.addEventListener("input", clearFeedback);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      clearFeedback();
      form.reportValidity();
      return;
    }

    feedbackElement.textContent =
      "Studio access registered. Note: This is an educational demonstration only. No account has been created and no personal data or passwords have been stored.";
    feedbackElement.className = "form-feedback-message is-visible is-success";

    form.reset();
  });
}

/**
 * Initializes and mounts all UI components and event listeners.
 * Confines all DOM lifecycle checks and interactions strictly to ui.js.
 *
 * @param {Array<Object>} products - Catalog of products to render.
 */
export function initUI(products) {
  const mount = () => {
    renderProducts(products);
    renderCartUI();
    setupViewfinder();
    setupToolbar(products);
    setupProductCardEvents(products);
    setupCartEvents();
    setupRegistrationForm();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
}
