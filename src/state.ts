/**
 * ShopBoard — State Barrel Module
 *
 * Re-exports shopping cart state management and safe localStorage persistence.
 */

export {
  addToCart,
  clearCart,
  decreaseQuantity,
  getCartState,
  increaseQuantity,
  initializeCartState,
  isValidCartItem,
  loadCartFromStorage,
  removeFromCart,
  saveCartToStorage,
} from "./modules/cart/cart.state.ts";
