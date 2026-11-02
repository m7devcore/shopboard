import "./style.css";
import { getProducts } from "./modules/products/products.api.ts";
import { ApiError } from "./shared/api/client.ts";
import { showToast } from "./shared/ui/toast.ts";
import { initializeCartState } from "./state.ts";
import { initUI, renderCatalogState } from "./ui.ts";

/**
 * Fetches the product catalog from the REST API and updates the UI LoadState.
 * Supports retry callbacks on network or HTTP failures.
 */
async function loadCatalog(): Promise<void> {
  const retry = (): void => {
    void loadCatalog();
  };

  renderCatalogState({ status: "loading" }, retry);

  try {
    const apiProducts = await getProducts();
    renderCatalogState({ status: "success", products: apiProducts }, retry);
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Unable to reach the ShopBoard product service. Please try again.";
    renderCatalogState({ status: "error", message }, retry);
    showToast(message, "error");
  }
}

/**
 * Bootstraps the ShopBoard application.
 * Connects state, API loading, and delegates all DOM lifecycle to ui.ts.
 */
function initApp(): void {
  initializeCartState();
  initUI(loadCatalog);
}

initApp();
