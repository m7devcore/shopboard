/**
 * ShopBoard — Cart State & Persistence Module
 *
 * Manages in-memory shopping cart state and synchronizes with localStorage.
 * Handles missing or invalid saved storage data safely with defensive fallbacks.
 */

const STORAGE_KEY = "shopboard_cart";

let cartState = [];

/**
 * Safely loads stored cart data from localStorage.
 *
 * @returns {Array<Object>} Restored cart items or empty array if missing/invalid.
 */
export function loadCartFromStorage() {
  try {
    const rawData = localStorage.getItem(STORAGE_KEY);
    if (!rawData) {
      return [];
    }

    const parsed = JSON.parse(rawData);

    // Validate that parsed output is an array of valid cart item objects
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Filter and sanitize entries to ensure expected schema
    return parsed.filter(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.name === "string" &&
        typeof item.price === "number" &&
        typeof item.quantity === "number" &&
        item.quantity > 0,
    );
  } catch (error) {
    console.warn("ShopBoard: Failed to parse stored cart data, resetting.", error);
    return [];
  }
}

/**
 * Safely writes cart data to localStorage.
 *
 * @param {Array<Object>} cart - Current cart array.
 */
export function saveCartToStorage(cart) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("ShopBoard: Failed to save cart to localStorage.", error);
  }
}

/**
 * Initializes the in-memory cart from persistent storage.
 *
 * @returns {Array<Object>} Current cart state.
 */
export function initializeCartState() {
  cartState = loadCartFromStorage();
  return [...cartState];
}

/**
 * Returns a shallow copy of the current cart state.
 *
 * @returns {Array<Object>}
 */
export function getCartState() {
  return [...cartState];
}

/**
 * Adds a product to the cart. If already present, increments its quantity.
 * Uses Array.find to detect existing cart entry.
 *
 * @param {Object} product - Product object with id, name, and price.
 * @returns {Array<Object>} Updated cart state.
 */
export function addToCart(product) {
  if (!product || !product.id) {
    return [...cartState];
  }

  const existingEntry = cartState.find((entry) => entry.id === product.id);

  if (existingEntry) {
    existingEntry.quantity += 1;
  } else {
    cartState.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });
  }

  saveCartToStorage(cartState);
  return [...cartState];
}

/**
 * Increases the quantity of a cart item by 1.
 *
 * @param {string} productId - ID of the product to increase.
 * @returns {Array<Object>} Updated cart state.
 */
export function increaseQuantity(productId) {
  const item = cartState.find((entry) => entry.id === productId);
  if (item) {
    item.quantity += 1;
    saveCartToStorage(cartState);
  }
  return [...cartState];
}

/**
 * Decreases the quantity of a cart item by 1.
 * If quantity reaches 0, removes the item from the cart.
 *
 * @param {string} productId - ID of the product to decrease.
 * @returns {Array<Object>} Updated cart state.
 */
export function decreaseQuantity(productId) {
  const index = cartState.findIndex((entry) => entry.id === productId);
  if (index !== -1) {
    cartState[index].quantity -= 1;
    if (cartState[index].quantity <= 0) {
      cartState.splice(index, 1);
    }
    saveCartToStorage(cartState);
  }
  return [...cartState];
}

/**
 * Removes an item from the cart by its id.
 *
 * @param {string} productId - ID of the product to remove.
 * @returns {Array<Object>} Updated cart state.
 */
export function removeFromCart(productId) {
  const index = cartState.findIndex((entry) => entry.id === productId);
  if (index !== -1) {
    cartState.splice(index, 1);
    saveCartToStorage(cartState);
  }
  return [...cartState];
}

/**
 * Clears all items from the cart and removes them from localStorage.
 *
 * @returns {Array<Object>} Empty cart state.
 */
export function clearCart() {
  cartState = [];
  saveCartToStorage(cartState);
  return [...cartState];
}
