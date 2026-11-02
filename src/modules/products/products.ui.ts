/**
 * ShopBoard — Products UI Module
 *
 * Handles product card rendering, async LoadState views (loading, error with Retry,
 * empty API catalog, empty search/filter results), toolbar filtering/sorting,
 * and delegated product card events.
 */

import { showToast } from "../../shared/ui/toast.ts";
import { addToCart } from "../cart/cart.state.ts";
import { openCartSidebar, renderCartUI } from "../cart/cart.ui.ts";
import { filterProducts, sortProducts } from "./products.logic.ts";
import type { LoadState, Product } from "./products.types.ts";

let activeCatalogProducts: Product[] = [];
let currentLoadStatus: LoadState["status"] = "loading";
let retryCallback: (() => void) | null = null;
let toolbarEventsBound = false;
let productCardEventsBound = false;

/**
 * Escapes characters for safe HTML injection to prevent XSS.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Generates card header preview markup for each product.
 * Displays accurate category visual representation for physical catalog items,
 * or original miniature specimen sheets when displaying the digital dataset.
 */
function getProductPreviewHtml(product: Product): string {
  // If product is from digital templates catalog (e.g. cv-template, study-planner)
  if (product.id === "cv-template") {
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
  }
  if (product.id === "study-planner") {
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
  }
  if (product.id === "portfolio-template") {
    return `
      <div class="specimen-sheet specimen-web" aria-hidden="true">
        <div class="sheet-browser-dots"><span></span><span></span><span></span></div>
        <div class="sheet-web-hero">
          <span class="web-hero-title"></span>
          <div class="web-case-card"></div>
        </div>
      </div>
    `;
  }
  if (product.id === "budget-tracker") {
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
  }
  if (product.id === "task-manager") {
    return `
      <div class="specimen-sheet specimen-kanban" aria-hidden="true">
        <div class="kanban-col-mock"><div class="kanban-card"></div><div class="kanban-card"></div></div>
        <div class="kanban-col-mock"><div class="kanban-card is-active"></div></div>
        <div class="kanban-col-mock"><div class="kanban-card"></div></div>
      </div>
    `;
  }
  if (product.id === "digital-notebook") {
    return `
      <div class="specimen-sheet specimen-notebook" aria-hidden="true">
        <div class="notebook-index"><span></span><span></span><span></span></div>
        <div class="notebook-ruled-lines">
          <span class="n-line"></span><span class="n-line"></span><span class="n-line"></span>
        </div>
      </div>
    `;
  }
  if (product.id === "invoice-template") {
    return `
      <div class="specimen-sheet specimen-invoice" aria-hidden="true">
        <div class="invoice-table-mock">
          <div class="inv-head-row"><span></span><span></span></div>
          <div class="inv-data-row"><span></span><span></span></div>
          <div class="inv-total-row"><span></span></div>
        </div>
      </div>
    `;
  }
  if (product.id === "fitness-planner") {
    return `
      <div class="specimen-sheet specimen-fitness" aria-hidden="true">
        <div class="fitness-streak-row">
          <span class="f-dot on"></span><span class="f-dot on"></span><span class="f-dot on"></span><span class="f-dot"></span>
        </div>
        <div class="fitness-bars"><span style="width: 65%"></span><span style="width: 80%"></span></div>
      </div>
    `;
  }
  if (product.id === "pitch-deck") {
    return `
      <div class="specimen-sheet specimen-pitch" aria-hidden="true">
        <div class="pitch-slide-mock">
          <span class="pitch-badge">Slide</span>
          <span class="pitch-headline"></span>
          <div class="pitch-chart-stubs"><span style="height: 12px"></span><span style="height: 20px"></span><span style="height: 16px"></span></div>
        </div>
      </div>
    `;
  }
  if (product.id === "habit-tracker") {
    return `
      <div class="specimen-sheet specimen-habit" aria-hidden="true">
        <div class="habit-matrix">
          <span class="h-dot on"></span><span class="h-dot on"></span><span class="h-dot on"></span><span class="h-dot on"></span>
          <span class="h-dot on"></span><span class="h-dot on"></span><span class="h-dot"></span><span class="h-dot"></span>
        </div>
      </div>
    `;
  }
  if (product.id === "student-dashboard") {
    return `
      <div class="specimen-sheet specimen-student" aria-hidden="true">
        <div class="student-hub-mock">
          <div class="s-slot"><span class="s-bar"></span></div>
          <div class="s-slot"><span class="s-bar accent"></span></div>
        </div>
      </div>
    `;
  }
  if (product.id === "project-planner") {
    return `
      <div class="specimen-sheet specimen-roadmap" aria-hidden="true">
        <div class="roadmap-track-mock">
          <div class="roadmap-milestone is-done"><span class="m-point"></span><span class="m-bar"></span></div>
          <div class="roadmap-milestone is-active"><span class="m-point"></span><span class="m-bar"></span></div>
          <div class="roadmap-milestone"><span class="m-point"></span><span class="m-bar"></span></div>
        </div>
      </div>
    `;
  }

  // Neutral visual card representation for API physical products (Bags, Shoes, Accessories)
  return `
    <div class="specimen-sheet product-category-backdrop" aria-hidden="true">
      <div class="category-emblem">
        ${product.icon ?? ""}
      </div>
    </div>
  `;
}

/**
 * Renders filtered/sorted product cards dynamically into `#products-grid`.
 * When `productsToRender` is empty (due to active search/category filters),
 * renders the empty search-result state with a "Reset Filters" action.
 */
export function renderProducts(productsToRender: readonly Product[]): void {
  const container = document.querySelector("#products-grid");
  const announcer = document.querySelector("#product-results-announcer");

  if (!container) return;

  if (productsToRender.length === 0) {
    container.innerHTML = `
      <div class="products-empty catalog-state-empty-filter" role="status">
        <p class="products-empty-title">No products match your filter</p>
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
    .map((product) => {
      const isAvailable = product.inStock;
      const buttonText = isAvailable ? "Add to Cart" : "Out of Stock";
      const disabledAttr = isAvailable ? "" : "disabled";
      const outOfStockCardClass = isAvailable ? "" : " is-out-of-stock";
      const outOfStockBadge = isAvailable
        ? ""
        : `<span class="stock-badge out-of-stock" aria-label="Unavailable">Out of Stock</span>`;

      return `
        <article class="product-card${outOfStockCardClass}" data-product-id="${escapeHtml(product.id)}">
          <div class="product-tile">
            ${getProductPreviewHtml(product)}
            <div class="product-tile-header">
              <div class="product-icon-wrap" aria-hidden="true">
                ${product.icon ?? ""}
              </div>
              <div class="product-tags-wrap">
                ${outOfStockBadge}
                <span class="product-category-tag">${escapeHtml(product.category)}</span>
              </div>
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
                aria-label="${isAvailable ? `Add ${escapeHtml(product.name)} to Cart` : `${escapeHtml(product.name)} is currently out of stock`}"
                ${disabledAttr}
              >
                ${buttonText}
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
 * Applies current search, category, and sort toolbar values to `activeCatalogProducts`
 * and re-renders the product grid.
 */
export function applyToolbarFilters(): void {
  if (currentLoadStatus !== "success") {
    return;
  }
  const searchInput = document.querySelector("#product-search");
  const categorySelect = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#price-sort");

  const searchTerm = searchInput instanceof HTMLInputElement ? searchInput.value : "";
  const category =
    categorySelect instanceof HTMLSelectElement && categorySelect.value
      ? categorySelect.value
      : "all";
  const sortOrder =
    sortSelect instanceof HTMLSelectElement && sortSelect.value ? sortSelect.value : "default";

  const filtered = filterProducts(activeCatalogProducts, {
    searchTerm,
    category,
  });
  const sorted = sortProducts(filtered, sortOrder);

  renderProducts(sorted);
}

/**
 * Renders the async `LoadState` (loading, error with Retry, empty API response,
 * or success catalog) inside `#products-grid`.
 */
export function renderCatalogState(state: LoadState, onRetry?: () => void): void {
  currentLoadStatus = state.status;
  if (onRetry) {
    retryCallback = onRetry;
  }

  const container = document.querySelector("#products-grid");
  const announcer = document.querySelector("#product-results-announcer");
  if (!container) return;

  switch (state.status) {
    case "loading": {
      container.innerHTML = `
        <div class="products-empty catalog-state-loading" role="status">
          <div class="catalog-loading-spinner" aria-hidden="true"></div>
          <p class="products-empty-title">Loading products...</p>
          <p class="products-empty-desc">Fetching live catalog from ShopBoard API.</p>
        </div>
      `;
      if (announcer) {
        announcer.textContent = "Loading products from API...";
      }
      return;
    }

    case "error": {
      container.innerHTML = `
        <div class="products-empty catalog-state-error" role="alert">
          <p class="products-empty-title">Couldn't load products</p>
          <p class="products-empty-desc">${escapeHtml(state.message)}</p>
          <button type="button" id="retry-fetch-btn" class="btn btn-sm btn-action">Try Again</button>
        </div>
      `;
      if (announcer) {
        announcer.textContent = `Failed to load products: ${state.message}`;
      }
      return;
    }

    case "success": {
      activeCatalogProducts = [...state.products];
      updateCategoryFilterOptions(state.products);

      // Distinct empty API state when the server returns 0 items
      if (state.products.length === 0) {
        container.innerHTML = `
          <div class="products-empty catalog-state-empty-api" role="status">
            <p class="products-empty-title">No products available right now</p>
            <p class="products-empty-desc">The store catalog returned zero items. Please try refreshing the catalog.</p>
            <button type="button" id="retry-fetch-btn" class="btn btn-sm btn-outline">Refresh Catalog</button>
          </div>
        `;
        if (announcer) {
          announcer.textContent = "No products available right now.";
        }
        return;
      }

      applyToolbarFilters();
      return;
    }
  }
}

/**
 * Updates the `#category-filter` select options to match the distinct categories
 * present in the active catalog, preserving the "All Categories" option.
 */
export function updateCategoryFilterOptions(products: readonly Product[]): void {
  const categorySelect = document.querySelector("#category-filter");
  if (!(categorySelect instanceof HTMLSelectElement)) return;

  const currentSelection = categorySelect.value;
  const categories = Array.from(new Set(products.map((p) => p.category)));

  // If no products, leave standard default
  if (categories.length === 0) return;

  categorySelect.innerHTML = [
    `<option value="all">All Categories (${products.length})</option>`,
    ...categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`),
  ].join("");

  // Restore selection if still valid, otherwise reset to 'all'
  const isStillValid = categories.some((c) => c === currentSelection);
  if (isStillValid) {
    categorySelect.value = currentSelection;
  } else {
    categorySelect.value = "all";
  }
}
export function setupToolbar(allProducts?: readonly Product[]): void {
  if (allProducts) {
    activeCatalogProducts = [...allProducts];
    currentLoadStatus = "success";
    updateCategoryFilterOptions(allProducts);
  }

  if (toolbarEventsBound) {
    return;
  }
  toolbarEventsBound = true;

  const searchInput = document.querySelector("#product-search");
  const categorySelect = document.querySelector("#category-filter");
  const sortSelect = document.querySelector("#price-sort");
  const productsContainer = document.querySelector("#products-grid");

  if (searchInput) {
    searchInput.addEventListener("input", applyToolbarFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", applyToolbarFilters);
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", applyToolbarFilters);
  }

  if (productsContainer) {
    productsContainer.addEventListener("click", (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.id === "reset-filters-btn") {
        if (searchInput instanceof HTMLInputElement) searchInput.value = "";
        if (categorySelect instanceof HTMLSelectElement) categorySelect.value = "all";
        if (sortSelect instanceof HTMLSelectElement) sortSelect.value = "default";
        applyToolbarFilters();
        return;
      }

      if (target.id === "retry-fetch-btn") {
        if (retryCallback) {
          retryCallback();
        }
      }
    });
  }
}

/**
 * Attaches event delegation once to `#products-grid` for "Add to Cart" clicks.
 */
export function setupProductCardEvents(allProducts?: readonly Product[]): void {
  if (allProducts) {
    activeCatalogProducts = [...allProducts];
  }

  if (productCardEventsBound) {
    return;
  }
  productCardEventsBound = true;

  const productsContainer = document.querySelector("#products-grid");
  const cartAnnouncer = document.querySelector("#cart-announcer");

  if (!productsContainer) return;

  productsContainer.addEventListener("click", (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const addBtn = target.closest(".add-to-cart-btn");
    if (!(addBtn instanceof HTMLElement)) return;

    const productId = addBtn.dataset.id;
    if (!productId) return;

    const product = activeCatalogProducts.find((entry) => entry.id === productId);
    if (!product || !product.inStock) return;

    addToCart(product);
    renderCartUI();
    showToast(`Added "${product.name}" to cart`, "success");

    if (cartAnnouncer) {
      cartAnnouncer.textContent = `${product.name} added to cart.`;
    }

    openCartSidebar();
  });
}
