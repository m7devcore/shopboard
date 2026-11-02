/**
 * ShopBoard — Shared Toast Notification Module
 *
 * Centralizes transient user notifications for async operations and cart actions.
 * Renders accessible toast items inside the `#toasts` live region container.
 */

export type ToastType = "success" | "error" | "info";

const TOAST_DURATION_MS = 3200;

/**
 * Displays a transient toast notification in the `#toasts` container.
 *
 * @param message - Text message to announce and display.
 * @param type - Visual and semantic variant ('success' | 'error' | 'info').
 */
export function showToast(message: string, type: ToastType = "info"): void {
  if (typeof document === "undefined") {
    return;
  }

  const container = document.querySelector("#toasts");
  if (!container) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  toast.setAttribute("role", type === "error" ? "alert" : "status");

  const indicator = document.createElement("span");
  indicator.className = "toast-indicator";
  indicator.setAttribute("aria-hidden", "true");

  const text = document.createElement("span");
  text.className = "toast-message";
  text.textContent = message;

  const dismissBtn = document.createElement("button");
  dismissBtn.type = "button";
  dismissBtn.className = "toast-dismiss-btn";
  dismissBtn.setAttribute("aria-label", "Dismiss notification");
  dismissBtn.textContent = "×";

  const removeToast = (): void => {
    toast.classList.add("is-leaving");
    window.setTimeout(() => {
      toast.remove();
    }, 200);
  };

  dismissBtn.addEventListener("click", removeToast);

  toast.append(indicator, text, dismissBtn);
  container.appendChild(toast);

  window.setTimeout(removeToast, TOAST_DURATION_MS);
}
