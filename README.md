# ShopBoard — Digital Systems & Production Templates

ShopBoard is a modern, responsive, and accessible digital products storefront built as part of the **CorePro Software Development Using AI** program (Day 2 Homework).

The project demonstrates production-grade vanilla web architecture, strict modularity, pure calculation logic, safe client-side `localStorage` persistence, and the **Obsidian & Liquid Glass** visual identity without relying on external UI frameworks.

---

## 1. Project Overview & Context

- **Course**: CorePro Software Development Using AI
- **Module**: Day 2 — Interactive Frontend Architecture & AI-Assisted Development
- **Repository**: [https://github.com/m7devcore/shopboard](https://github.com/m7devcore/shopboard)
- **Design Identity**: Obsidian & Liquid Glass (dark mode, glassmorphism, fluid typography, responsive layout)

ShopBoard features a catalog of 12 realistic digital production systems (templates, planners, and productivity tools), an interactive specimen viewfinder, instant search, multi-category filtering, price sorting, and an off-canvas shopping cart drawer that persists safely across browser sessions.

---

## 2. Technology Stack

- **Bundler & Dev Server**: [Vite](https://vitejs.dev/) v8 (Vanilla JavaScript)
- **Markup**: Semantic HTML5 (Single `<h1>`, accessible `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, linked `<label>`s, native HTML validation)
- **Styling**: Mobile-first CSS3 with CSS Custom Properties, glassmorphism filters, zero `!important`, and full `@media (min-width: ...)` responsiveness
- **Scripting**: Vanilla JavaScript (Modern ES Modules)
- **Quality & Guardrails**:
  - [Prettier](https://prettier.io/) for automated formatting
  - [ESLint](https://eslint.org/) (Flat config) for linting and code quality
  - [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged) for Git pre-commit hooks
  - Built-in [Node.js Test Runner](https://nodejs.org/api/test.html) (`node:test`, `node:assert/strict`)

---

## 3. Getting Started

### Prerequisites

- **Node.js**: v20+ (v22+ or v26+ recommended)
- **npm**: v10+
- **Git**

### Installation

Clone the repository and install development dependencies:

```bash
git clone https://github.com/m7devcore/shopboard.git
cd shopboard
npm install
```

> **Note:** Running `npm install` automatically configures the Git pre-commit hook via Husky.

### Running the Development Server

Start Vite's fast local development server:

```bash
npm run dev
```

Open the printed URL (typically `http://localhost:5173`) in your browser.

---

## 4. Available NPM Scripts

| Command                   | Description                                                                   |
| :------------------------ | :---------------------------------------------------------------------------- |
| `npm run dev`             | Starts Vite local development server with HMR.                                |
| `npm run build`           | Builds optimized production assets into the `dist/` directory.                |
| `npm run preview`         | Serves the local production build preview.                                    |
| `npm test`                | Runs the fast Node.js native unit tests (`test-logic.mjs`, `test-state.mjs`). |
| `npm run test:browser`    | Runs real browser interaction tests via CDP (`test-browser-interaction.mjs`). |
| `npm run test:responsive` | Runs multi-viewport responsive overflow audit (`test-mobile-responsive.mjs`). |
| `npm run lint`            | Runs ESLint across all JavaScript modules and test suites.                    |
| `npm run format`          | Formats all source files (HTML, CSS, JS, JSON, MD) with Prettier.             |
| `npm run format:check`    | Checks formatting without modifying files.                                    |

### Browser Automation Testing Prerequisites

- **Unit Tests (`npm test`)**: 100% portable, zero dependencies, run in any Node.js environment without a browser.
- **Browser Automation (`npm run test:browser`, `npm run test:responsive`)**: Uses a zero-dependency Chrome DevTools Protocol helper (`tests/cdp.mjs`).
  - Requires **Node.js v22+** (for native `WebSocket` support).
  - Requires an installed Chromium-based browser (**Google Chrome**, **Microsoft Edge**, or **Chromium**) accessible in system paths or configured via the `CHROME_PATH` environment variable.
  - If a browser is not detected or fails to launch, the test script outputs a clear diagnostic error and exits with code 1 to ensure missing browser environments cannot falsely pass as successful test runs.

---

## 5. Modular Architecture & Responsibilities

ShopBoard adheres to a clean separation of concerns where each module has a single, well-defined responsibility:

```
shopboard/
├── index.html                   ← Semantic HTML entry point (zero hardcoded product cards)
├── package.json                 ← Scripts, metadata, and devDependencies
├── package-lock.json            ← Deterministic dependency lockfile
├── eslint.config.js             ← Modern flat ESLint configuration
├── .prettierrc                  ← Prettier formatting rules
├── .prettierignore              ← Files excluded from formatting
├── .husky/pre-commit            ← Active Git pre-commit hook running lint-staged
├── CLAUDE.md                    ← AI agent instructions and architectural rules
├── AGENTS.md                    ← Course agent rules and workflow specifications
├── debugging-log.md             ← Structured log of bugs and edge-case validations
├── test-logic.mjs               ← Pure logic unit tests (search, filter, sort, calculations)
├── test-state.mjs               ← Cart state and localStorage persistence tests
├── test-browser-interaction.mjs ← Headless browser interaction & CDP test
├── test-mobile-responsive.mjs   ← Multi-viewport responsive & overflow audit
├── tests/
│   └── cdp.mjs                  ← Portable zero-dependency Chrome DevTools Protocol client
├── public/                      ← Static assets, archival imagery, and license records
└── src/
    ├── style.css                ← Mobile-first styling, glassmorphism, responsive breakpoints
    ├── data.js                  ← Product catalog data (12 products with id, name, category, price, icon)
    ├── logic.js                 ← Pure deterministic functions (zero DOM, zero localStorage)
    ├── state.js                 ← Shopping cart state management & safe localStorage sync
    ├── ui.js                    ← Sole owner of DOM manipulation, rendering, and event listeners
    └── main.js                  ← Application bootstrap importing modules and delegating to ui.js
```

### Module Responsibilities

1. **`src/data.js` (Catalog Data)**:
   - Contains an array of 12 digital products.
   - Products include metadata: `id`, `name`, `category`, `price`, `description`, and SVG visual icons.
   - Zero side-effects, DOM, or calculations.

2. **`src/logic.js` (Pure Business Logic)**:
   - Contains pure functions: `filterProducts`, `sortProducts`, `calculateTotalItems`, `calculateTotalPrice`, `calculateLineTotal`, `groupProductsByCategory`.
   - **Strict Constraint**: Zero access to `document`, `window`, or `localStorage`.
   - Never mutates input arrays (creates shallow copies before sorting).

3. **`src/state.js` (Cart State & Persistence)**:
   - Manages in-memory cart state: `addToCart`, `increaseQuantity`, `decreaseQuantity`, `removeFromCart`, `clearCart`.
   - Handles serialization and deserialization via `localStorage` under the key `shopboard_cart`.
   - Employs defensive parsing (`try...catch`, `Array.isArray` check, schema filtering) to guard against corrupted or malformed saved data.

4. **`src/ui.js` (Primary DOM Interaction Module)**:
   - **Sole owner of direct page interactions**: All calls to `document`, `window`, `querySelector`, `innerHTML`, and `addEventListener` reside exclusively in this file.
   - Dynamic product card generation with HTML escaping to prevent XSS.
   - Event delegation on `#products-grid` for "Add to Cart" actions, preventing duplicate listener registration.
   - Off-canvas cart drawer toggling, escape key listeners, backdrop dismissal, and live ARIA announcements.
   - Accessible studio registration demo form handling.

5. **`src/main.js` (Bootstrap Coordinator)**:
   - Minimal entry point: imports CSS, data, state, and `initUI`.
   - Initializes stored state (`initializeCartState()`) and mounts the UI via `initUI(products)`.
   - Contains zero direct DOM manipulation.

---

## 6. Key Features & Acceptance Verification

### Dynamic Product Rendering

- All 12 digital products render dynamically from JavaScript data.
- Zero product cards are hardcoded in `index.html`.

### Cooperative Search, Category Filter, and Sorting

- **Search**: Case-insensitive partial matching by name. Empty or whitespace queries display all products in the selected category.
- **Filter**: Filter by "All Categories", "Templates", "Planners", or "Productivity".
- **Sort**: Sort by "Price: Low to High", "Price: High to Low", or "Default Order".
- **Default Restoration**: Selecting "Default Order" restores the original catalog sequence without mutating data.
- **Combined Operations**: All three controls work synchronously together (e.g. searching "template" in category "Templates" sorted High to Low produces: Pitch Deck Template $18, Portfolio Template $15, CV Template $12, Invoice Template $9).

### Shopping Cart Lifecycle

- Adding an existing product increments its quantity rather than creating duplicate lines.
- Increase (`+`) and decrease (`-`) controls dynamically adjust quantities and line totals.
- Decreasing quantity from 1 removes the item from the cart. Quantities never display as zero or negative.
- "Remove" deletes only the targeted product.
- "Clear Cart" empties all cart items and resets badge and total to 0.
- All totals are computed dynamically using `Array.prototype.reduce()`.

### Safe LocalStorage Persistence

- Cart data persists in `localStorage` under `shopboard_cart`.
- Restored seamlessly on page reload or fresh visits.
- Defensive fallback protects against missing keys, non-JSON strings, non-array objects, and invalid entities without crashing the page.

### Event Listener Safety (Preventing Duplicate Listeners)

- Event listeners are attached once using event delegation on `#products-grid`.
- Changing the category filter multiple times (e.g. 5 times) and clicking "Add to Cart" once adds **exactly one** unit to the cart.

---

## 7. Extending ShopBoard: Adding a Wishlist Feature

Thanks to the modular Day 2 architecture, introducing a new feature like a **Wishlist** has an obvious, predictable home:

1. **State (`src/state.js`)**:
   - Add `wishlistState` array.
   - Export `addToWishlist(product)`, `removeFromWishlist(productId)`, `getWishlistState()`, and persistence under `shopboard_wishlist`.
2. **Logic (`src/logic.js`)**:
   - Add pure helper functions (e.g. `isItemWishlisted(wishlist, productId)`).
3. **UI (`src/ui.js`)**:
   - Add a wishlist button/heart icon to the product card template in `renderProducts()`.
   - Add a delegated click handler on `#products-grid` for `.wishlist-btn`.
   - Render the wishlist drawer or count badge.
4. **Bootstrap (`src/main.js`)**:
   - Remains clean and unchanged.

---

## 8. Educational Demo Limitations & Disclaimers

ShopBoard is developed as an educational frontend learning demonstration:

- **No Real Checkout**: No payment gateway (Stripe, PayPal) or backend processing is integrated.
- **No User Database**: Studio registration is a simulated frontend demonstration; passwords and credentials are never transmitted or stored.
- **Client Persistence Only**: Cart persistence is confined to the client browser's `localStorage`.
- **Archival Imagery Attribution**: Historical ledger and almanac photographs featured in the heritage section are sourced from public domain and Creative Commons collections (The Metropolitan Museum of Art, Gutenberg Museum Mainz, Wikimedia Commons) with licensing documented in `public/archive/credits.json`.
