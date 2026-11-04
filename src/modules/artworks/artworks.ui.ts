/**
 * AEVUM — Curatorial Artwork Modal UI Module
 *
 * Implements the Nocturne Pavilion artwork details modal dialog.
 * Adheres strictly to curatorial truthfulness, accessible modal interaction
 * (focus trap, Escape key, backdrop dismissal, return focus), and zero commercial fabrication.
 */

import { addToCart } from "../cart/cart.state.ts";
import { openCartSidebar, renderCartUI } from "../cart/cart.ui.ts";
import { showToast } from "../../shared/ui/toast.ts";
import { getArtworkById } from "./artworks.data.ts";
import type { Artwork } from "./artworks.types.ts";
import { escapeHtml } from "../../shared/utils/format.ts";

let lastFocusedElement: HTMLElement | null = null;
let modalEventsBound = false;

/**
 * Formats a curatorial table row. If the value is null or empty,
 * clearly marks it as "Pending Historical Verification".
 */
function formatDossierRow(label: string, value: string | null): string {
  const isPending = !value || value.trim().length === 0;
  const displayValue = isPending
    ? `<span class="dossier-pending">Pending Verification</span>`
    : escapeHtml(value);

  return `
    <div class="dossier-row">
      <dt class="dossier-label">${escapeHtml(label)}</dt>
      <dd class="dossier-value">${displayValue}</dd>
    </div>
  `;
}

/**
 * Generates the rich curatorial dossier markup for the artwork modal.
 */
function renderArtworkModalContent(artwork: Artwork): string {
  const formattedPrice = artwork.price.toLocaleString("en-US");
  const isAvailable = artwork.inStock;

  const watermarkHtml = artwork.license.watermarkNote
    ? `
      <div class="modal-watermark-notice" role="note">
        <svg class="watermark-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span><strong>Reproduction Notice:</strong> ${escapeHtml(artwork.license.watermarkNote)}</span>
      </div>
    `
    : "";

  const attributionBadge =
    artwork.artist === null
      ? `<span class="curatorial-badge-pending">Attribution Pending Verification</span>`
      : "";

  const actionButtonHtml = isAvailable
    ? `
      <button
        type="button"
        id="modal-acquire-btn"
        class="btn btn-action modal-action-btn add-to-cart-btn"
        data-id="${escapeHtml(artwork.id)}"
      >
        Acquire Piece &bull; $${formattedPrice}
      </button>
    `
    : `
      <button
        type="button"
        id="modal-acquire-btn"
        class="btn btn-outline modal-action-btn"
        disabled
      >
        Acquired &bull; Private Viewing Only
      </button>
    `;

  return `
    <div class="artwork-modal-grid">
      <!-- Left Column: Visual Artwork Presentation -->
      <div class="artwork-modal-visual">
        <div class="artwork-modal-frame">
          <img
            src="${artwork.imageSrc}"
            alt="${escapeHtml(artwork.altText)}"
            class="artwork-modal-img"
            width="${artwork.imageWidth}"
            height="${artwork.imageHeight}"
          />
        </div>
        ${watermarkHtml}
        <div class="artwork-modal-caption">
          <span>${escapeHtml(artwork.title)}</span>
          <span class="artwork-modal-dim">${escapeHtml(artwork.dimensions?.raw ?? "Dimensions on curatorial file")}</span>
        </div>
      </div>

      <!-- Right Column: Curatorial Dossier & Acquisition Demo -->
      <div class="artwork-modal-dossier">
        <div class="dossier-header">
          <div class="dossier-tags">
            <span class="product-category-tag artwork-category-tag">${escapeHtml(artwork.category)}</span>
            ${attributionBadge}
          </div>
          <h2 id="artwork-modal-title" class="artwork-modal-heading">${escapeHtml(artwork.title)}</h2>
        </div>

        <p class="artwork-modal-summary">${escapeHtml(artwork.description)}</p>

        <!-- Curatorial Metadata Table -->
        <dl class="artwork-dossier-list">
          ${formatDossierRow("Artist / Attribution", artwork.artist)}
          ${formatDossierRow("Historical Period", artwork.period)}
          ${formatDossierRow("Medium & Support", artwork.medium)}
          ${formatDossierRow("Geographic Origin", artwork.origin)}
          ${formatDossierRow("Object Classification", artwork.classification)}
          ${formatDossierRow("Rights & License", artwork.license.status)}
        </dl>

        ${
          artwork.curatorialSummary
            ? `
            <div class="curatorial-research-note">
              <h4 class="research-note-title">Curatorial Research Record</h4>
              <p class="research-note-body">${escapeHtml(artwork.curatorialSummary)}</p>
            </div>
          `
            : ""
        }

        <!-- Acquisition Demo & Integrity Notice -->
        <div class="artwork-modal-commerce">
          <div class="modal-price-lockup">
            <span class="modal-price-label">Fictional Acquisition Value</span>
            <div class="modal-price-row">
              <span class="modal-price-value">$${formattedPrice}</span>
              <span class="modal-price-unit">USD</span>
              <span class="price-demo-tag">(Portfolio Demo)</span>
            </div>
          </div>

          <div class="modal-actions-wrap">
            ${actionButtonHtml}
          </div>

          <p class="modal-portfolio-disclosure">
            <strong>Portfolio Demonstration:</strong> Fictional educational pricing. Zero commercial transactions or payment processing. Inquiries simulated through local acquisition state.
          </p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Traps Tab and Shift+Tab keyboard navigation inside the open modal.
 */
function trapFocus(modal: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== "Tab") return;

  const focusableSelectors = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");

  const focusableElements = Array.from(
    modal.querySelectorAll<HTMLElement>(focusableSelectors),
  ).filter((el) => el.offsetParent !== null);

  if (focusableElements.length === 0) {
    event.preventDefault();
    modal.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === firstElement || document.activeElement === modal) {
      event.preventDefault();
      lastElement?.focus();
    }
  } else {
    if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement?.focus();
    }
  }
}

/**
 * Opens the Artwork Details Modal for a specific artwork ID.
 */
export function openArtworkModal(artworkId: string): void {
  const artwork = getArtworkById(artworkId);
  if (!artwork) return;

  const modal = document.querySelector<HTMLElement>("#artwork-modal");
  const backdrop = document.querySelector<HTMLElement>("#artwork-modal-backdrop");
  const content = document.querySelector<HTMLElement>("#artwork-modal-content");
  const closeBtn = document.querySelector<HTMLButtonElement>("#artwork-modal-close");

  if (!modal || !backdrop || !content) return;

  if (document.activeElement instanceof HTMLElement) {
    lastFocusedElement = document.activeElement;
  }

  content.innerHTML = renderArtworkModalContent(artwork);

  modal.classList.add("is-open");
  backdrop.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  backdrop.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  // Focus close button initially for accessibility
  if (closeBtn) {
    closeBtn.focus();
  } else {
    modal.focus();
  }
}

/**
 * Closes the Artwork Details Modal and returns focus to the triggering element.
 */
export function closeArtworkModal(): void {
  const modal = document.querySelector<HTMLElement>("#artwork-modal");
  const backdrop = document.querySelector<HTMLElement>("#artwork-modal-backdrop");

  if (!modal || !backdrop) return;

  modal.classList.remove("is-open");
  backdrop.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  backdrop.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");

  if (lastFocusedElement) {
    lastFocusedElement.focus();
    lastFocusedElement = null;
  }
}

/**
 * Sets up event listeners for the Artwork Details Modal.
 * Called once during application initialization.
 */
export function setupArtworkModalEvents(): void {
  if (modalEventsBound) return;
  modalEventsBound = true;

  const modal = document.querySelector<HTMLElement>("#artwork-modal");
  const backdrop = document.querySelector<HTMLElement>("#artwork-modal-backdrop");
  const closeBtn = document.querySelector<HTMLButtonElement>("#artwork-modal-close");

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      closeArtworkModal();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      closeArtworkModal();
    });
  }

  if (modal) {
    // Backdrop click when clicking outside modal dialog
    modal.addEventListener("click", (event: MouseEvent) => {
      if (event.target === modal) {
        closeArtworkModal();
      }
    });

    // Keyboard navigation: Escape to close, Tab to trap focus
    modal.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeArtworkModal();
        return;
      }
      trapFocus(modal, event);
    });

    // Handle delegated Acquire button click inside modal
    modal.addEventListener("click", (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const acquireBtn = target.closest<HTMLElement>("#modal-acquire-btn.add-to-cart-btn");
      if (!acquireBtn) return;

      const artworkId = acquireBtn.dataset.id;
      if (!artworkId) return;

      const artwork = getArtworkById(artworkId);
      if (!artwork || !artwork.inStock) return;

      addToCart({
        id: artwork.id,
        name: artwork.title,
        price: artwork.price,
        inStock: artwork.inStock,
      });
      renderCartUI();
      showToast(`Added "${artwork.title}" to Acquisitions`, "success");

      closeArtworkModal();
      openCartSidebar();
    });
  }

  // Global escape listener when modal is open
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      const openModal = document.querySelector<HTMLElement>("#artwork-modal.is-open");
      if (openModal) {
        closeArtworkModal();
      }
    }
  });
}
