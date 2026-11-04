/**
 * ShopBoard & AEVUM — Products UI Module
 *
 * Handles product card rendering, curatorial gallery cards, async LoadState views,
 * department tab filtering, toolbar controls, and delegated card/modal events.
 */

import { showToast } from "../../shared/ui/toast.ts";
import { addToCart } from "../cart/cart.state.ts";
import { openCartSidebar, renderCartUI } from "../cart/cart.ui.ts";
import { openArtworkModal } from "../artworks/artworks.ui.ts";
import { renderGalleryShowcase } from "../artworks/artworks.showcase.ts";
import { isGalleryMode } from "../catalog/catalog.mode.ts";
import { filterProducts, sortProducts } from "./products.logic.ts";
import type { LoadState, Product } from "./products.types.ts";
import { escapeHtml } from "../../shared/utils/format.ts";

let activeCatalogProducts: Product[] = [];
let currentLoadStatus: LoadState["status"] = "loading";
let retryCallback: (() => void) | null = null;
let toolbarEventsBound = false;
let productCardEventsBound = false;

const GALLERY_DEPARTMENTS: readonly { id: string; label: string; count: number }[] = [
  { id: "all", label: "All Departments", count: 16 },
  { id: "Paintings", label: "Paintings", count: 6 },
  { id: "Sculptures", label: "Sculptures", count: 3 },
  { id: "Decorative Antiques", label: "Decorative Antiques", count: 4 },
  { id: "Ceramics & Glass", label: "Ceramics & Glass", count: 3 },
  { id: "Prints & Editions", label: "Prints & Editions", count: 0 },
  { id: "Curiosities", label: "Curiosities", count: 0 },
];

/**
 * Generates card header preview markup for digital products (Course Mode).
 */
function getProductPreviewHtml(product: Product): string {
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

  return `
    <div class="specimen-sheet product-category-backdrop" aria-hidden="true">
      <div class="category-emblem">
        ${product.icon ?? ""}
      </div>
    </div>
  `;
}

/**
 * Updates the visual active state of the horizontal gallery department tabs.
 */
export function updateActiveDepartmentTab(selectedCategory: string): void {
  const tabs = document.querySelectorAll<HTMLButtonElement>(
    "#gallery-department-tabs .dept-tab-btn",
  );
  tabs.forEach((tab) => {
    const tabCat = tab.dataset.category;
    const isActive = tabCat === selectedCategory;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

/**
 * Renders the horizontal curatorial department tabs in Gallery Mode.
 */
export function renderDepartmentTabs(activeCategory = "all"): void {
  const container = document.querySelector("#gallery-department-tabs");
  if (!container) return;

  container.innerHTML = `
    <div class="dept-tabs-scroll-wrap" role="tablist" aria-label="Curatorial Departments">
      ${GALLERY_DEPARTMENTS.map((dept) => {
        const isActive = dept.id === activeCategory;
        const countBadge = dept.count > 0 ? ` (${dept.count})` : " (0)";
        return `
          <button
            type="button"
            role="tab"
            class="dept-tab-btn${isActive ? " is-active" : ""}"
            data-category="${escapeHtml(dept.id)}"
            aria-selected="${isActive ? "true" : "false"}"
          >
            <span class="dept-tab-label">${escapeHtml(dept.label)}</span>
            <span class="dept-tab-count">${countBadge}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;
}

/**
 * Renders filtered/sorted product cards dynamically into `#products-grid`.
 */
export function renderProducts(productsToRender: readonly Product[]): void {
  const container = document.querySelector("#products-grid");
  const announcer = document.querySelector("#product-results-announcer");
  const inGalleryMode = isGalleryMode();

  if (!container) return;

  // Empty search/filter state handling
  if (productsToRender.length === 0) {
    const categorySelect = document.querySelector("#category-filter");
    const currentCategory =
      categorySelect instanceof HTMLSelectElement ? categorySelect.value : "all";

    if (
      inGalleryMode &&
      (currentCategory === "Prints & Editions" || currentCategory === "Curiosities")
    ) {
      container.innerHTML = `
        <div class="products-empty catalog-state-empty-filter coming-soon-placard" role="status">
          <div class="placard-ornament" aria-hidden="true">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <span class="placard-dept-tag">${escapeHtml(currentCategory)}</span>
          <h3 class="products-empty-title">Department in Preparation</h3>
          <p class="products-empty-desc">
            The ${escapeHtml(currentCategory)} curatorial holdings are currently undergoing archival cataloging and provenance verification for upcoming salon openings. Private viewing inquiries remain available.
          </p>
          <button type="button" id="reset-filters-btn" class="btn btn-sm btn-outline">
            View All Departments
          </button>
        </div>
      `;
      if (announcer) {
        announcer.textContent = `${currentCategory} department is in preparation. Zero items currently displayed.`;
      }
      return;
    }

    if (inGalleryMode) {
      container.innerHTML = `
        <div class="products-empty catalog-state-empty-filter" role="status">
          <p class="products-empty-title">No artworks match your search</p>
          <p class="products-empty-desc">Try adjusting your curatorial query or selecting a different department.</p>
          <button type="button" id="reset-filters-btn" class="btn btn-sm btn-outline">Reset Filters</button>
        </div>
      `;
      if (announcer) {
        announcer.textContent = "No artworks found matching the selected filters.";
      }
      return;
    }

    // Default Course Mode empty filter state
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

  // Gallery Mode: Burgundy Private Gallery single-artwork showcase
  if (inGalleryMode) {
    renderGalleryShowcase(productsToRender);
    return;
  }

  // Course Mode: Original specimen/API product cards
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

  if (isGalleryMode()) {
    updateActiveDepartmentTab(category);
  }

  const filtered = filterProducts(activeCatalogProducts, {
    searchTerm,
    category,
  });
  const sorted = sortProducts(filtered, sortOrder);

  renderProducts(sorted);
}

/**
 * Updates the `#category-filter` select options to match the active catalog.
 */
export function updateCategoryFilterOptions(products: readonly Product[]): void {
  const categorySelect = document.querySelector("#category-filter");
  if (!(categorySelect instanceof HTMLSelectElement)) return;

  if (isGalleryMode()) {
    const currentSelection = categorySelect.value;
    categorySelect.innerHTML = [
      `<option value="all">All Departments (${products.length})</option>`,
      ...GALLERY_DEPARTMENTS.filter((d) => d.id !== "all").map(
        (dept) => `<option value="${escapeHtml(dept.id)}">${escapeHtml(dept.label)}</option>`,
      ),
    ].join("");

    const isStillValid =
      currentSelection === "all" || GALLERY_DEPARTMENTS.some((d) => d.id === currentSelection);
    categorySelect.value = isStillValid ? currentSelection : "all";

    renderDepartmentTabs(categorySelect.value);
    return;
  }

  // Course Mode
  const currentSelection = categorySelect.value;
  const categories = Array.from(new Set(products.map((p) => p.category)));

  if (categories.length === 0) return;

  categorySelect.innerHTML = [
    `<option value="all">All Categories (${products.length})</option>`,
    ...categories.map((cat) => `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`),
  ].join("");

  const isStillValid = categories.some((c) => c === currentSelection);
  categorySelect.value = isStillValid ? currentSelection : "all";
}

/**
 * Renders the async `LoadState` inside `#products-grid`.
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
          <p class="products-empty-title">Loading catalog...</p>
          <p class="products-empty-desc">Fetching curated works from the collection.</p>
        </div>
      `;
      if (announcer) {
        announcer.textContent = "Loading catalog items...";
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
 * Initializes toolbar inputs, select listeners, and category tab delegation.
 */
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
  const departmentTabs = document.querySelector("#gallery-department-tabs");

  if (searchInput) {
    searchInput.addEventListener("input", applyToolbarFilters);
  }

  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      if (isGalleryMode() && categorySelect instanceof HTMLSelectElement) {
        updateActiveDepartmentTab(categorySelect.value);
      }
      applyToolbarFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", applyToolbarFilters);
  }

  // Delegated horizontal tabs listener
  if (departmentTabs) {
    departmentTabs.addEventListener("click", (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const tabBtn = target.closest<HTMLButtonElement>(".dept-tab-btn");
      if (!tabBtn) return;

      const category = tabBtn.dataset.category;
      if (!category) return;

      if (categorySelect instanceof HTMLSelectElement) {
        categorySelect.value = category;
      }
      updateActiveDepartmentTab(category);
      applyToolbarFilters();
    });
  }

  if (productsContainer) {
    productsContainer.addEventListener("click", (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.id === "reset-filters-btn") {
        if (searchInput instanceof HTMLInputElement) searchInput.value = "";
        if (categorySelect instanceof HTMLSelectElement) categorySelect.value = "all";
        if (sortSelect instanceof HTMLSelectElement) sortSelect.value = "default";
        if (isGalleryMode()) {
          updateActiveDepartmentTab("all");
        }
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
 * Attaches event delegation once to `#products-grid` for "Add to Cart" and "View Artwork" clicks.
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

    // 1. Delegated "View Artwork" button (Modal trigger)
    const viewBtn = target.closest<HTMLElement>(".view-artwork-btn");
    if (viewBtn) {
      const artworkId = viewBtn.dataset.artworkId;
      if (artworkId) {
        openArtworkModal(artworkId);
        return;
      }
    }

    // 2. Delegated "Add to Cart" / "Acquire Piece" button
    const addBtn = target.closest<HTMLElement>(".add-to-cart-btn");
    if (!addBtn) return;

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
