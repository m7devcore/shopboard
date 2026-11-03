import "./style.css";
import { getArtworks } from "./modules/artworks/artworks.data.ts";
import { artworkToProduct } from "./modules/artworks/artworks.types.ts";
import { detectCatalogMode } from "./modules/catalog/catalog.mode.ts";
import { getProducts } from "./modules/products/products.api.ts";
import { ApiError } from "./shared/api/client.ts";
import { showToast } from "./shared/ui/toast.ts";
import { initializeCartState } from "./state.ts";
import { initUI, renderCatalogState } from "./ui.ts";

/**
 * Fetches the product catalog from the REST API and updates the UI LoadState.
 * Used in Course Compatibility mode (?mode=course or ?api_mode=*).
 */
async function loadCourseCatalog(): Promise<void> {
  const retry = (): void => {
    void loadCourseCatalog();
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
 * Initializes the primary AEVUM Fine Art Gallery collection from local curated datasets.
 */
function loadGalleryCatalog(): void {
  const artworks = getArtworks();
  const products = artworks.map(artworkToProduct);
  renderCatalogState({ status: "success", products });
}

/**
 * Bootstraps the ShopBoard & AEVUM application.
 * Connects state, API loading, and delegates all DOM lifecycle to ui.ts.
 */
function initApp(): void {
  initializeCartState();
  const mode = detectCatalogMode();
  if (mode === "course") {
    initUI(loadCourseCatalog);
  } else {
    initUI(loadGalleryCatalog);
  }
}

initApp();
