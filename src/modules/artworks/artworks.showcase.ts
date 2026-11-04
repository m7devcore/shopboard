/**
 * AEVUM — Burgundy Private Gallery Showcase Module
 *
 * Implements the horizontal, single-artwork exhibition showcase for Gallery Mode.
 * Features:
 * - Single featured artwork display at a time
 * - Centered exhibition stage with full aspect-ratio preservation (object-fit: contain)
 * - Restrained RTL progression (Left = Next, Right = Previous)
 * - Position counter (01 / 16)
 * - Boundary clamping and keyboard arrow navigation
 * - Reactive search, department filter, and sort synchronization
 */

import { getArtworkById } from "./artworks.data.ts";
import type { Artwork } from "./artworks.types.ts";
import type { Product } from "../products/products.types.ts";
import { escapeHtml } from "../../shared/utils/format.ts";

let activeSequence: Product[] = [];
let currentArtworkIndex = 0;
let showcaseEventsBound = false;
let keydownBound = false;

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  hasTriggered: boolean;
}

let activeDragSession: DragSession | null = null;
const DRAG_THRESHOLD_PX = 70;

/**
 * Generates the HTML markup for the active featured artwork showcase.
 */
function createShowcaseHtml(artwork: Artwork, index: number, total: number): string {
  const currentPadded = String(index + 1).padStart(2, "0");
  const totalPadded = String(total).padStart(2, "0");
  const isAvailable = artwork.inStock;
  const disabledAttr = isAvailable ? "" : "disabled";

  const outOfStockBadge = isAvailable
    ? ""
    : `<span class="showcase-status-badge out-of-stock" aria-label="Unavailable">Acquired / Private Viewing</span>`;

  const attributionBadge =
    artwork.artist === null
      ? `<span class="showcase-attribution-badge">Attribution Pending Verification</span>`
      : "";

  const mediumText = artwork.medium ?? "Historical Reference";
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return `
    <div class="gallery-showcase" role="region" aria-roledescription="artwork showcase" aria-label="Featured Artwork Exhibition">
      <article class="showcase-card product-card artwork-card" data-product-id="${escapeHtml(artwork.id)}">
        <!-- 1. Large Exhibition Stage with Minimal Chevron Navigation Arrows -->
        <div class="artwork-stage">
          <button
            type="button"
            class="showcase-side-arrow showcase-nav-btn nav-btn-prev"
            data-nav="prev"
            aria-label="Previous artwork"
            ${isFirst ? "disabled" : ""}
          >
            <svg class="nav-arrow-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="artwork-stage-inner">
            <img
              src="${escapeHtml(artwork.imageSrc)}"
              alt="${escapeHtml(artwork.altText)}"
              class="artwork-stage-img artwork-card-img"
              width="${artwork.imageWidth}"
              height="${artwork.imageHeight}"
              loading="eager"
              draggable="false"
            />
          </div>

          <button
            type="button"
            class="showcase-side-arrow showcase-nav-btn nav-btn-next"
            data-nav="next"
            aria-label="Next artwork"
            ${isLast ? "disabled" : ""}
          >
            <svg class="nav-arrow-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <!-- 2. Supporting Artwork Information & Curatorial Dossier -->
        <div class="showcase-info-bar product-body artwork-body">
          <div class="showcase-info-main">
            <div class="showcase-lot-line">
              <span class="showcase-seq-tag">LOT ${currentPadded}</span>
              <span class="showcase-lot-sep" aria-hidden="true">&bull;</span>
              <span class="showcase-dept-tag product-category-tag artwork-category-tag">${escapeHtml(artwork.category)}</span>
              ${attributionBadge}
              ${outOfStockBadge}
              <div class="showcase-counter" aria-live="polite" aria-atomic="true">
                <span class="counter-current">${currentPadded}</span>
                <span class="counter-sep">/</span>
                <span class="counter-total">${totalPadded}</span>
              </div>
            </div>

            <h3 class="showcase-title product-title artwork-title">${escapeHtml(artwork.title)}</h3>

            <p class="showcase-medium artwork-meta-row">
              <span class="artwork-medium-label">${escapeHtml(mediumText)}</span>
            </p>

            <p class="showcase-description product-description artwork-description">
              ${escapeHtml(artwork.description)}
            </p>
          </div>

          <div class="showcase-info-sidebar artwork-footer">
            <div class="showcase-valuation artwork-price-info">
              <span class="valuation-label">ESTIMATED VALUE</span>
              <span class="valuation-amount product-price artwork-price">$${artwork.price.toLocaleString("en-US")}</span>
            </div>

            <div class="showcase-actions artwork-card-actions">
              <button
                type="button"
                class="btn btn-showcase-primary view-artwork-btn"
                data-artwork-id="${escapeHtml(artwork.id)}"
                aria-label="View curatorial details for ${escapeHtml(artwork.title)}"
              >
                View Artwork
              </button>
              <button
                type="button"
                class="btn btn-showcase-secondary add-to-cart-btn"
                data-id="${escapeHtml(artwork.id)}"
                aria-label="${isAvailable ? `Acquire ${escapeHtml(artwork.title)}` : `${escapeHtml(artwork.title)} is acquired`}"
                ${disabledAttr}
              >
                ${isAvailable ? "Acquire Piece" : "Acquired"}
              </button>
            </div>
          </div>
        </div>
      </article>

      <!-- 3. Contextual Portfolio Disclosure -->
      <aside class="showcase-disclosure" aria-label="Curatorial note">
        <p class="disclosure-text">
          AEVUM Private Collection &mdash; Curated educational exhibition demonstration. Values represented are fictional valuations for portfolio study.
        </p>
      </aside>
    </div>
  `;
}

/**
 * Updates the showcase DOM to display the artwork at currentArtworkIndex.
 */
function updateShowcaseDOM(): void {
  const container = document.querySelector("#products-grid");
  const announcer = document.querySelector("#product-results-announcer");
  if (!container) return;

  if (activeSequence.length === 0) return;

  // Clamp current index within bounds
  if (currentArtworkIndex >= activeSequence.length) {
    currentArtworkIndex = Math.max(0, activeSequence.length - 1);
  } else if (currentArtworkIndex < 0) {
    currentArtworkIndex = 0;
  }

  const currentProduct = activeSequence[currentArtworkIndex];
  if (!currentProduct) return;

  const artwork = getArtworkById(currentProduct.id);
  if (!artwork) return;

  container.innerHTML = createShowcaseHtml(artwork, currentArtworkIndex, activeSequence.length);

  if (announcer) {
    announcer.textContent = `Displaying artwork ${currentArtworkIndex + 1} of ${activeSequence.length}: ${artwork.title}`;
  }
}

/**
 * Navigates the showcase in the specified direction.
 * RTL convention:
 * - "next": Advances forward (counter increases e.g. 01 -> 02), triggered by left arrow
 * - "prev": Reverses backward (counter decreases e.g. 02 -> 01), triggered by right arrow
 */
export function navigateShowcase(direction: "prev" | "next"): void {
  if (activeSequence.length <= 1) return;

  if (direction === "next") {
    if (currentArtworkIndex < activeSequence.length - 1) {
      currentArtworkIndex++;
      updateShowcaseDOM();
    }
  } else if (direction === "prev") {
    if (currentArtworkIndex > 0) {
      currentArtworkIndex--;
      updateShowcaseDOM();
    }
  }
}

/**
 * Binds global keyboard arrow navigation for the gallery showcase.
 * Only triggers if not focused inside input/select/textarea and no modal/drawer is open.
 */
function setupKeyboardNavigation(): void {
  if (keydownBound) return;
  keydownBound = true;

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    const activeEl = document.activeElement;
    if (
      activeEl instanceof HTMLInputElement ||
      activeEl instanceof HTMLSelectElement ||
      activeEl instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const modalOpen = document.querySelector("#artwork-modal.is-open");
    const cartOpen = document.querySelector("#cart-sidebar.is-open");
    const mobileNavOpen = document.querySelector("#mobile-nav-drawer.is-open");
    if (modalOpen || cartOpen || mobileNavOpen) {
      return;
    }

    // Left Arrow reverses to Previous artwork
    if (event.key === "ArrowLeft") {
      navigateShowcase("prev");
    }
    // Right Arrow advances to Next artwork
    else if (event.key === "ArrowRight") {
      navigateShowcase("next");
    }
  });
}

/**
 * Initializes delegated click listeners for Next and Previous navigation buttons
 * as well as pointer drag and touch swipe navigation.
 */
export function setupShowcaseEvents(): void {
  setupKeyboardNavigation();

  if (showcaseEventsBound) return;
  showcaseEventsBound = true;

  const container = document.querySelector("#products-grid");
  if (!container || !(container instanceof HTMLElement)) return;

  setupDragNavigation(container);

  container.addEventListener("click", (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const navBtn = target.closest<HTMLButtonElement>(".showcase-nav-btn");
    if (!navBtn) return;

    const navDir = navBtn.dataset.nav;
    if (navDir === "next" || navDir === "prev") {
      navigateShowcase(navDir);
    }
  });
}

/**
 * Initializes pointer drag and touch swipe navigation on the exhibition stage.
 * - Drag/swipe LEFT -> Next artwork (RTL progression)
 * - Drag/swipe RIGHT -> Previous artwork (RTL progression)
 * - Threshold: ~70px with horizontal dominance (abs(deltaX) > abs(deltaY))
 * - Single drag triggers at most one artwork navigation
 * - Moving mouse without pressing does not trigger navigation
 * - Interactive elements (buttons, links) do not initiate dragging
 */
function setupDragNavigation(container: HTMLElement): void {
  // Prevent native browser image dragging/ghosting
  container.addEventListener("dragstart", (event: DragEvent) => {
    event.preventDefault();
  });

  container.addEventListener("pointerdown", (event: PointerEvent) => {
    // Only primary button (left mouse) or touch/pen
    if (event.button !== 0) return;

    const target = event.target;
    if (!(target instanceof Element)) return;

    // Do not initiate dragging from buttons or interactive controls
    if (target.closest("button, a, input, select, textarea, .showcase-side-arrow")) {
      return;
    }

    const stage = target.closest<HTMLElement>(".artwork-stage");
    if (!stage) return;

    activeDragSession = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      hasTriggered: false,
    };

    stage.classList.add("is-dragging");
    try {
      stage.setPointerCapture(event.pointerId);
    } catch {
      // Safe fallback for testing or non-capture environments
    }
  });

  window.addEventListener("pointermove", (event: PointerEvent) => {
    if (!activeDragSession || activeDragSession.pointerId !== event.pointerId) return;
    if (activeDragSession.hasTriggered) return;

    const deltaX = event.clientX - activeDragSession.startX;
    const deltaY = event.clientY - activeDragSession.startY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX >= DRAG_THRESHOLD_PX && absX > absY) {
      activeDragSession.hasTriggered = true;

      const stage = container.querySelector<HTMLElement>(".artwork-stage");
      if (stage) {
        stage.classList.remove("is-dragging");
      }

      // Drag Left -> Next; Drag Right -> Previous (RTL convention)
      if (deltaX < 0) {
        navigateShowcase("next");
      } else {
        navigateShowcase("prev");
      }
    }
  });

  const endDragSession = (event: PointerEvent): void => {
    if (!activeDragSession || activeDragSession.pointerId !== event.pointerId) return;

    const stage = container.querySelector<HTMLElement>(".artwork-stage");
    if (stage) {
      stage.classList.remove("is-dragging");
      try {
        stage.releasePointerCapture(event.pointerId);
      } catch {
        // Safe fallback
      }
    }
    activeDragSession = null;
  };

  window.addEventListener("pointerup", endDragSession);
  window.addEventListener("pointercancel", endDragSession);
}

/**
 * Renders the gallery showcase for the given list of filtered/sorted products.
 * If the sequence changed or active index is out of bounds, resets to index 0.
 */
export function renderGalleryShowcase(productsToRender: readonly Product[]): void {
  setupShowcaseEvents();

  activeSequence = [...productsToRender];
  // Always reset to the first artwork when sequence changes via search/filter/sort
  currentArtworkIndex = 0;

  updateShowcaseDOM();
}

/**
 * Returns the currently active artwork product or null.
 */
export function getActiveShowcaseProduct(): Product | null {
  return activeSequence[currentArtworkIndex] ?? null;
}

/**
 * Returns current showcase sequence length and index.
 */
export function getShowcaseState(): { currentIndex: number; total: number } {
  return {
    currentIndex: currentArtworkIndex,
    total: activeSequence.length,
  };
}
