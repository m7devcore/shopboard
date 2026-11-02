/**
 * ShopBoard — Logic Barrel Module
 *
 * Re-exports pure functions for product filtering/sorting/grouping and cart
 * calculations. Strict constraint: No DOM, document, window, or localStorage access.
 */

export {
  filterProducts,
  groupProductsByCategory,
  sortProducts,
} from "./modules/products/products.logic.ts";

export {
  calculateLineTotal,
  calculateTotalItems,
  calculateTotalPrice,
} from "./modules/cart/cart.logic.ts";
