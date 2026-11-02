/**
 * ShopBoard — UI Module
 *
 * Handles all DOM queries, rendering, interactive Viewfinder, and UI event listeners.
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
 * Generates miniature architectural specimen sheet layout markup for each product.
 *
 * @param {Object} product
 * @returns {string} HTML snippet
 */
function getSpecimenPreviewHtml(product) {
  switch (product.id) {
    case "cv-template":
      return `
        <div class="specimen-sheet specimen-cv" aria-hidden="true">
          <div class="sheet-header-mock">
            <span class="sheet-bar-heavy"></span>
            <span class="sheet-bar-sub"></span>
          </div>
          <div class="sheet-split-mock">
            <div class="sheet-col-main">
              <span class="sheet-line-bold"></span>
              <span class="sheet-line-text"></span>
              <span class="sheet-line-text"></span>
              <span class="sheet-line-bold"></span>
              <span class="sheet-line-text"></span>
            </div>
            <div class="sheet-col-side">
              <span class="sheet-tag-pill"></span>
              <span class="sheet-tag-pill"></span>
              <span class="sheet-tag-pill"></span>
            </div>
          </div>
        </div>
      `;
    case "study-planner":
      return `
        <div class="specimen-sheet specimen-planner" aria-hidden="true">
          <div class="sheet-grid-mock">
            <div class="grid-cell-day">Mon</div>
            <div class="grid-cell-day">Tue</div>
            <div class="grid-cell-day">Wed</div>
            <div class="grid-cell-day">Thu</div>
            <div class="grid-slot is-filled"></div>
            <div class="grid-slot"></div>
            <div class="grid-slot is-accent"></div>
            <div class="grid-slot"></div>
          </div>
        </div>
      `;
    case "portfolio-template":
      return `
        <div class="specimen-sheet specimen-web" aria-hidden="true">
          <div class="sheet-browser-dots"><span></span><span></span><span></span></div>
          <div class="sheet-web-hero">
            <span class="web-hero-title"></span>
            <div class="web-case-card"></div>
          </div>
        </div>
      `;
    case "budget-tracker":
      return `
        <div class="specimen-sheet specimen-finance" aria-hidden="true">
          <div class="sheet-stat-row">
            <div class="sheet-metric-card"><span class="m-val"></span></div>
            <div class="sheet-metric-card"><span class="m-val"></span></div>
          </div>
          <div class="sheet-bars-mock">
            <div class="bar-fill" style="width: 78%"></div>
            <div class="bar-fill is-accent" style="width: 52%"></div>
          </div>
        </div>
      `;
    case "task-manager":
      return `
        <div class="specimen-sheet specimen-kanban" aria-hidden="true">
          <div class="kanban-col-mock"><div class="kanban-card"></div><div class="kanban-card"></div></div>
          <div class="kanban-col-mock"><div class="kanban-card is-active"></div></div>
          <div class="kanban-col-mock"><div class="kanban-card"></div></div>
        </div>
      `;
    case "digital-notebook":
      return `
        <div class="specimen-sheet specimen-notebook" aria-hidden="true">
          <div class="notebook-index"><span></span><span></span><span></span></div>
          <div class="notebook-ruled-lines">
            <span class="n-line"></span><span class="n-line"></span><span class="n-line"></span>
          </div>
        </div>
      `;
    case "invoice-template":
      return `
        <div class="specimen-sheet specimen-invoice" aria-hidden="true">
          <div class="invoice-table-mock">
            <div class="inv-head-row"><span></span><span></span></div>
            <div class="inv-data-row"><span></span><span></span></div>
            <div class="inv-total-row"><span></span></div>
          </div>
        </div>
      `;
    case "fitness-planner":
      return `
        <div class="specimen-sheet specimen-fitness" aria-hidden="true">
          <div class="fitness-streak-row">
            <span class="f-dot on"></span><span class="f-dot on"></span><span class="f-dot on"></span><span class="f-dot"></span>
          </div>
          <div class="fitness-bars"><span style="width: 65%"></span><span style="width: 80%"></span></div>
        </div>
      `;
    case "pitch-deck":
      return `
        <div class="specimen-sheet specimen-pitch" aria-hidden="true">
          <div class="pitch-slide-mock">
            <span class="pitch-badge">Slide</span>
            <span class="pitch-headline"></span>
            <div class="pitch-chart-stubs"><span style="height: 12px"></span><span style="height: 20px"></span><span style="height: 16px"></span></div>
          </div>
        </div>
      `;
    case "habit-tracker":
      return `
        <div class="specimen-sheet specimen-habit" aria-hidden="true">
          <div class="habit-matrix">
            <span class="h-dot on"></span><span class="h-dot on"></span><span class="h-dot on"></span><span class="h-dot on"></span>
            <span class="h-dot on"></span><span class="h-dot on"></span><span class="h-dot"></span><span class="h-dot"></span>
          </div>
        </div>
      `;
    case "student-dashboard":
      return `
        <div class="specimen-sheet specimen-student" aria-hidden="true">
          <div class="student-hub-mock">
            <div class="s-slot"><span class="s-bar"></span></div>
            <div class="s-slot"><span class="s-bar accent"></span></div>
          </div>
        </div>
      `;
    case "project-planner":
      return `
        <div class="specimen-sheet specimen-roadmap" aria-hidden="true">
          <div class="roadmap-track-mock">
            <div class="roadmap-milestone is-done"><span class="m-point"></span><span class="m-bar"></span></div>
            <div class="roadmap-milestone is-active"><span class="m-point"></span><span class="m-bar"></span></div>
            <div class="roadmap-milestone"><span class="m-point"></span><span class="m-bar"></span></div>
          </div>
        </div>
      `;
    default:
      return `
        <div class="specimen-sheet specimen-generic" aria-hidden="true">
          <div class="generic-tile-inner">
            <span class="sheet-line-bold"></span>
            <span class="sheet-line-text"></span>
            <span class="sheet-line-text"></span>
          </div>
        </div>
      `;
  }
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
        <p class="products-empty-title">No products found</p>
        <p class="products-empty-desc">Try adjusting your search query or selecting a different category.</p>
        <button type="button" id="reset-filters-btn" class="btn btn-sm btn-outline">Reset Filters</button>
      </div>
    `;
    if (announcer) {
      announcer.textContent = "No products found matching the selected filters.";
    }
    return;
  }

  container.innerHTML = productsToRender
    .map(
      (product) => `
        <article class="product-card" data-product-id="${escapeHtml(product.id)}">
          <div class="product-tile">
            ${getSpecimenPreviewHtml(product)}
            <div class="product-tile-header">
              <div class="product-icon-wrap" aria-hidden="true">
                ${product.icon || ""}
              </div>
              <span class="product-category-tag">${escapeHtml(product.category)}</span>
            </div>
          </div>
          <div class="product-body">
            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            <p class="product-description">${escapeHtml(product.description)}</p>
            <div class="product-footer">
              <div class="product-price-info">
                <span class="product-price">$${product.price}</span>
                <span class="price-demo-tag">(Demo)</span>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-action add-to-cart-btn"
                data-id="${escapeHtml(product.id)}"
                aria-label="Add ${escapeHtml(product.name)} to Cart"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");

  if (announcer) {
    announcer.textContent = `Showing ${productsToRender.length} ${
      productsToRender.length === 1 ? "product" : "products"
    }.`;
  }
}

/**
 * Initializes the Interactive Specimen Viewfinder in the Hero (The Live Thing).
 */
export function setupViewfinder() {
  const display = document.querySelector("#viewfinder-display");
  const tabs = document.querySelectorAll(".viewfinder-tabs .tab-btn");
  if (!display || !tabs.length) return;

  const views = {
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
        <p class="cart-empty-title">Your cart is empty</p>
        <p class="cart-empty-subtitle">Explore the digital products catalog and add items to your cart.</p>
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
              <p class="cart-item-unit-price">$${item.price} each (Demo)</p>
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
            <span class="cart-item-line-total">Line Total: $${lineTotal}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

/**
 * Sets up search, category filter, and sort event listeners.
 *
 * @param {Array<Object>} allProducts - Full dataset of products.
 */
export function setupToolbar(allProducts) {
  const searchInput = document.querySelector("#product-search");
  const categorySelect = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#price-sort");
  const productsContainer = document.querySelector("#products-grid");

  function updateProducts() {
    const searchTerm = searchInput ? searchInput.value : "";
    const category = categorySelect ? categorySelect.value : "all";
    const sortOrder = sortSelect ? sortSelect.value : "default";

    const filtered = filterProducts(allProducts, { searchTerm, category });
    const sorted = sortProducts(filtered, sortOrder);

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
    feedbackElement.className = "form-feedback";
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
      "Registration successful! Note: This is an educational demonstration only. No account has been created and no personal data or passwords have been stored.";
    feedbackElement.className = "form-feedback is-visible is-success";

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
