/**
 * ShopBoard — Cart UI Module
 *
 * Renders the off-canvas shopping cart drawer, synchronizes cart badges/totals,
 * and handles cart event delegation.
 */

import { calculateLineTotal, calculateTotalItems, calculateTotalPrice } from "./cart.logic.ts";
import {
  clearCart,
  decreaseQuantity,
  getCartState,
  increaseQuantity,
  removeFromCart,
} from "./cart.state.ts";
import { escapeHtml } from "../../shared/utils/format.ts";

/**
 * Opens the cart slide-over sidebar.
 */
export function openCartSidebar(): void {
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
    if (cartCloseBtn instanceof HTMLElement) {
      cartCloseBtn.focus();
    }
  }
}

/**
 * Closes the cart slide-over sidebar.
 */
export function closeCartSidebar(): void {
  const cartSidebar = document.querySelector("#cart-sidebar");
  const cartBackdrop = document.querySelector("#cart-backdrop");
  const cartToggleBtn = document.querySelector("#cart-toggle-btn");

  if (cartSidebar && cartBackdrop && cartToggleBtn) {
    cartSidebar.classList.remove("is-open");
    cartBackdrop.classList.remove("is-open");
    cartSidebar.setAttribute("aria-hidden", "true");
    cartBackdrop.setAttribute("aria-hidden", "true");
    cartToggleBtn.setAttribute("aria-expanded", "false");
    if (cartToggleBtn instanceof HTMLElement) {
      cartToggleBtn.focus();
    }
  }
}

/**
 * Renders the shopping cart view and synchronizes all cart UI elements.
 */
export function renderCartUI(): void {
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
  if (clearCartBtn instanceof HTMLButtonElement) {
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

let cartEventsBound = false;

/**
 * Sets up cart sidebar UI event listeners once via event delegation.
 */
export function setupCartEvents(): void {
  if (cartEventsBound) {
    return;
  }
  cartEventsBound = true;

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

  document.addEventListener("keydown", (event: KeyboardEvent) => {
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
    cartItemsContainer.addEventListener("click", (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      // Decrease quantity button
      const decreaseBtn = target.closest(".cart-qty-decrease");
      if (decreaseBtn instanceof HTMLElement) {
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
      const increaseBtn = target.closest(".cart-qty-increase");
      if (increaseBtn instanceof HTMLElement) {
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
      const removeBtn = target.closest(".cart-item-remove-btn");
      if (!(removeBtn instanceof HTMLElement)) return;

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
