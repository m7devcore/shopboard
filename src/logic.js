/**
 * ShopBoard — Logic Module
 *
 * Contains pure functions for filtering, searching, sorting, and calculations.
 * Strict constraint: No DOM, document, window, or localStorage access.
 */

/**
 * Filters products by name (case-insensitive) and category.
 *
 * @param {Array<Object>} products - List of product objects.
 * @param {Object} criteria - Search and filter criteria.
 * @param {string} [criteria.searchTerm=''] - Text to match against product name.
 * @param {string} [criteria.category='all'] - Category to match, or 'all'.
 * @returns {Array<Object>} Filtered list of products.
 */
export function filterProducts(products, { searchTerm = "", category = "all" } = {}) {
  const normalizedSearch = searchTerm.trim().toLowerCase();
  const normalizedCategory = category.trim().toLowerCase();

  return products.filter((product) => {
    const matchesSearch =
      normalizedSearch === "" || product.name.toLowerCase().includes(normalizedSearch);

    const matchesCategory =
      normalizedCategory === "all" || product.category.toLowerCase() === normalizedCategory;

    return matchesSearch && matchesCategory;
  });
}

/**
 * Sorts products by price without mutating the source array.
 *
 * @param {Array<Object>} products - List of product objects.
 * @param {string} [sortOrder='default'] - 'asc' (low to high), 'desc' (high to low), or 'default'.
 * @returns {Array<Object>} Newly sorted array of products.
 */
export function sortProducts(products, sortOrder = "default") {
  const sortedCopy = [...products];

  if (sortOrder === "asc") {
    return sortedCopy.sort((a, b) => a.price - b.price);
  }

  if (sortOrder === "desc") {
    return sortedCopy.sort((a, b) => b.price - a.price);
  }

  return sortedCopy;
}

/**
 * Groups products by category, keeping categories in order of first appearance
 * and products in their incoming order. Does not mutate the source array.
 *
 * @param {Array<Object>} products - List of product objects.
 * @returns {Array<{category: string, items: Array<Object>}>} Ordered category groups.
 */
export function groupProductsByCategory(products) {
  return products.reduce((groups, product) => {
    const existingGroup = groups.find((group) => group.category === product.category);
    if (existingGroup) {
      existingGroup.items.push(product);
    } else {
      groups.push({ category: product.category, items: [product] });
    }
    return groups;
  }, []);
}

/**
 * Calculates total number of items across all cart entries using Array.reduce.
 *
 * @param {Array<Object>} cart - Array of cart entries with quantity.
 * @returns {number} Total count of items.
 */
export function calculateTotalItems(cart) {
  return cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0);
}

/**
 * Calculates overall cart monetary total using Array.reduce.
 *
 * @param {Array<Object>} cart - Array of cart entries with price and quantity.
 * @returns {number} Sum total of all items.
 */
export function calculateTotalPrice(cart) {
  return cart.reduce(
    (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
}

/**
 * Calculates a single line item total.
 *
 * @param {number} price
 * @param {number} quantity
 * @returns {number}
 */
export function calculateLineTotal(price, quantity) {
  return (Number(price) || 0) * (Number(quantity) || 0);
}
