# ShopBoard — Claude / AI Agent Architecture Guide

## 1. Project Overview

ShopBoard is an educational digital products storefront built as part of the CorePro Software Development Using AI program. It showcases clean, accessible, and responsive frontend architecture using modern web standards without external libraries.

## 2. Tech Stack

- **Bundler & Dev Server**: Vite (Vanilla JavaScript)
- **Markup**: Semantic HTML5
- **Styles**: Mobile-first CSS3 (Strictly no `!important`)
- **Scripting**: Vanilla JavaScript (ES Modules)
- **Quality Tools**: Prettier, ESLint, Husky, lint-staged

Do not introduce frameworks or runtime dependencies without prior approval.

---

## 3. Core Day 2 Engineering Rules (Lessons from Real Day 2 AI Pitfalls)

These rules address the specific failure modes observed when AI agents generate interactive storefront code:

### Rule 1: Array Immutability in Sorting & Filtering

- **Mistake observed**: Calling `products.sort(...)` directly mutates the catalog array in-place, permanently destroying original order so picking "Default Order" cannot restore the initial catalog.
- **Enforceable rule**: Pure logic functions (`sortProducts`, `filterProducts`) must never mutate input arguments. Always create a shallow copy `[...products]` before sorting.

### Rule 2: Event Delegation Over Repeated Listener Registration

- **Mistake observed**: Attaching event listeners inside `renderProducts()` causes new listeners to stack on every filter change or search keystroke. Changing filters 5 times and clicking "Add to Cart" once results in 5 units added instead of 1.
- **Enforceable rule**: Attach click listeners ONCE at application startup on stable container elements (`#products-grid`, `#cart-items-container`) using event delegation (`event.target.closest()`). Re-rendering functions must strictly update innerHTML and NEVER register event listeners.

### Rule 3: Defensive LocalStorage Deserialization

- **Mistake observed**: Blindly calling `JSON.parse(localStorage.getItem(...))` crashes the entire application if the storage key is missing, corrupted, or tampered with.
- **Enforceable rule**: Always wrap `JSON.parse()` in a `try...catch` block. Validate that the parsed result is an array with `Array.isArray()`, and sanitize each item (verifying valid `id`, `name`, numeric `price`, and positive `quantity > 0`). Fall back safely to `[]`.

### Rule 4: Strict Separation of Concerns (Sole DOM Ownership)

- **Mistake observed**: Mixing `document.querySelector` or `innerHTML` inside logic or bootstrap modules breaks modularity and makes unit testing impossible in Node.js.
- **Enforceable rule**: Only ONE file touches the page DOM: `src/ui.js`. `src/logic.js` must remain 100% pure (no `window`, `document`, or `localStorage`). `src/state.js` manages state and storage only. `src/main.js` only coordinates module initialization.

### Rule 5: Empirical Verification Integrity

- **Mistake observed**: Claiming features or tests passed based on assumptions or code inspection rather than execution.
- **Enforceable rule**: Never claim a test, build, lint, or UI check passed without executing the command and verifying the actual terminal/browser output. Distinguish pure logic unit tests from real browser interaction verification.

---

## 4. Day 2 Modular Architecture

The application strictly adheres to the following separation of concerns:

### `src/data.js`

- Contains product catalog data only.
- Exports an array of 12 digital products.
- Each product defines: `id`, `name`, `category`, `description`, `price` (numeric), and visual SVG icon.
- No UI logic, DOM manipulation, or calculations.

### `src/logic.js`

- Contains pure utility functions for searching, filtering, sorting, and monetary calculations.
- Functions must be deterministic with zero side-effects.
- **Strict Rule**: Zero access to `window`, `document`, DOM nodes, or `localStorage`.
- Never mutates the original product array (creates a shallow copy before sorting).
- Exports: `filterProducts`, `sortProducts`, `calculateTotalItems`, `calculateTotalPrice`, `calculateLineTotal`, `groupProductsByCategory`.

### `src/state.js`

- Manages in-memory application cart state.
- Handles reading from and writing to `localStorage` using `JSON.stringify` and `JSON.parse`.
- Defensively guards against missing, corrupted, or non-array stored data with try/catch fallbacks.
- Exports: `initializeCartState`, `getCartState`, `addToCart`, `increaseQuantity`, `decreaseQuantity`, `removeFromCart`, `clearCart`, `saveCartToStorage`, `loadCartFromStorage`.

### `src/ui.js`

- Centralizes all DOM querying, rendering, and event listener attachments (Sole DOM owner).
- Renders product cards dynamically using `Array.prototype.map()` and `Array.prototype.join('')`.
- Implements event delegation on `#products-grid` for "Add to Cart" button clicks using `event.target.closest()` and `data-id`.
- Manages search, filter, and sort toolbar event bindings.
- Handles shopping cart sidebar toggling, backdrop dismiss, Esc key dismiss, item removal, and clearing.
- Manages accessible registration demo form validation and non-persisting status feedback.
- Exports: `initUI`, `renderProducts`, `renderCartUI`, `setupToolbar`, `setupProductCardEvents`, `setupCartEvents`, `setupRegistrationForm`, `setupViewfinder`, `openCartSidebar`, `closeCartSidebar`.

### `src/main.js`

- Lightweight application entry point.
- Imports styles, product data, state initializer, and `initUI`.
- Calls `initializeCartState()` and `initUI(products)`.
- Contains zero direct DOM interactions.

---

## 5. Where Future Features Belong

- **Wishlist Feature**:
  - `src/state.js`: Add `wishlistState`, `addToWishlist()`, `removeFromWishlist()`, `getWishlistState()`, with localStorage persistence under key `shopboard_wishlist`.
  - `src/logic.js`: Pure functions if needed (e.g., checking if product is wishlisted, counting wishlist items).
  - `src/ui.js`: Render wishlist heart icon/button on product cards, attach delegated click listener, and render wishlist drawer/panel.
  - `src/main.js`: Remains unchanged, simply bootstrapping through `initUI`.

---

## 6. Verification Protocol

- Run `npm run lint` — verify zero ESLint errors or warnings.
- Run `npm run format:check` — verify Prettier compliance.
- Run `npm test` — verify Node native test suite passes completely.
- Run `npm run build` — verify zero build errors.
- Confirm all 12 products render dynamically with zero hardcoded cards in `index.html`.
- Confirm search (case-insensitive), category filter, and price sort work cooperatively.
- Verify cart persistence across page reloads.
- Verify native form validation and feedback behavior.
- Document only real test outcomes without fabricating pass states.
