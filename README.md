# ShopBoard — Digital Systems & Production Storefront (Days 2 & 3)

ShopBoard is a modern, responsive, and accessible storefront built as part of the **CorePro Software Development Using AI** program (Day 2 & Day 3 Assignments).

The project demonstrates production-grade vanilla web architecture, **Strict TypeScript** (`"strict": true`, zero `any`, zero unsafe `as`, zero `!`), feature-based modular architecture (`src/shared/`, `src/modules/products/`, `src/modules/cart/`), runtime-validated REST API integration (`https://shopboard-api.vercel.app/api/products`), complete async UI state management (`LoadState`), centralized accessible toast notifications, safe client-side `localStorage` persistence, and the frozen **Obsidian & Liquid Glass** visual identity without external UI frameworks.

---

## 1. Project Overview & Context

- **Course**: CorePro Software Development Using AI
- **Modules**:
  - **Day 2**: Interactive Frontend Architecture, Pure Logic, Event Delegation & Safe LocalStorage Persistence
  - **Day 3**: Strict TypeScript Migration, Feature Modules, Live REST API Integration, Async UI States & AI Code Review
- **Repository**: [https://github.com/m7devcore/shopboard](https://github.com/m7devcore/shopboard)
- **Design Identity**: Obsidian & Liquid Glass (dark mode, glassmorphism, fluid typography, responsive layout)

---

## 2. Technology Stack

- **Bundler & Dev Server**: [Vite](https://vitejs.dev/) v8
- **Language**: [TypeScript](https://www.typescriptlang.org/) v7 (`"strict": true`, `"noUnusedLocals": true`, `"noEmit": true`)
- **Markup**: Semantic HTML5 (Single `<h1>`, accessible `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, linked `<label>`s, native HTML validation, ARIA live regions)
- **Styling**: Mobile-first CSS3 with CSS Custom Properties, glassmorphism filters, and full `@media (min-width: ...)` responsiveness
- **Quality & Guardrails**:
  - `tsc --noEmit` for strict static type checking
  - [Prettier](https://prettier.io/) for automated formatting
  - [ESLint](https://eslint.org/) (Flat config) for linting and code quality
  - [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/lint-staged/lint-staged) for Git pre-commit hooks
  - Built-in [Node.js Test Runner](https://nodejs.org/api/test.html) (`node:test`, `node:assert/strict`)

---

## 3. Getting Started

### Prerequisites

- **Node.js**: v22.6+ or v26+ (supports native TypeScript execution for unit tests and native `WebSocket` for CDP browser tests)
- **npm**: v10+
- **Git**

### Installation

```bash
git clone https://github.com/m7devcore/shopboard.git
cd shopboard
npm install
```

### Running the Development Server

```bash
npm run dev
```

Open the printed URL (typically `http://localhost:5173`) in your browser.

---

## 4. Available NPM Scripts

| Command                   | Description                                                                                   |
| :------------------------ | :-------------------------------------------------------------------------------------------- |
| `npm run dev`             | Starts Vite local development server with HMR.                                                |
| `npm run typecheck`       | Runs `tsc --noEmit` to verify zero TypeScript errors under strict mode.                       |
| `npm run build`           | Builds optimized production assets into the `dist/` directory.                                |
| `npm run preview`         | Serves the local production build preview.                                                    |
| `npm test`                | Runs the fast Node.js native unit tests (`test-logic.mjs`, `test-state.mjs`, `test-api.mjs`). |
| `npm run test:browser`    | Runs real browser interaction tests via CDP (`test-browser-interaction.mjs`).                 |
| `npm run test:responsive` | Runs multi-viewport responsive overflow audit (`test-mobile-responsive.mjs`).                 |
| `npm run lint`            | Runs ESLint across JavaScript modules and test suites.                                        |
| `npm run format`          | Formats all source files (TS, HTML, CSS, JS, JSON, MD) with Prettier.                         |
| `npm run format:check`    | Checks formatting without modifying files.                                                    |

---

## 5. Day 3 Modular Architecture & Responsibilities

```
shopboard/
├── index.html                   ← Semantic HTML entry point + #toasts live region
├── tsconfig.json                ← Strict TypeScript compiler configuration
├── package.json                 ← Scripts, metadata, and devDependencies
├── eslint.config.js             ← Modern flat ESLint configuration
├── CLAUDE.md                    ← AI agent instructions and Day 2 + Day 3 rules
├── AGENTS.md                    ← Course agent rules and workflow specifications
├── ai-review-log.md             ← Day 3 AI code review audit of ai-products.ts
├── debugging-log.md             ← Day 2 structured log of bugs and edge-case validations
├── test-logic.mjs               ← Pure logic unit tests (search, filter, sort, calculations)
├── test-state.mjs               ← Cart state and localStorage persistence tests
├── test-api.mjs                 ← API client, runtime validation, and toProduct() mapper tests
├── test-browser-interaction.mjs ← Headless browser interaction, async state & retry CDP test
├── test-mobile-responsive.mjs   ← Multi-viewport responsive & overflow audit
├── tests/
│   └── cdp.mjs                  ← Portable zero-dependency Chrome DevTools Protocol client
└── src/
    ├── style.css                ← Frozen Day 2 Obsidian & Liquid Glass styling + toast/async states
    ├── shared/
    │   ├── api/
    │   │   └── client.ts        ← BASE_URL, ApiError, fetchJson<T>() with runtime validation
    │   └── ui/
    │       └── toast.ts         ← Centralized accessible toast notifications (showToast)
    ├── modules/
    │   ├── products/
    │   │   ├── products.types.ts ← Category, Product, CategoryFilter, SortOrder, LoadState
    │   │   ├── products.api.ts   ← ApiProduct, ApiProductList, toProduct(), getProducts(), getProduct()
    │   │   ├── products.logic.ts ← Pure filterProducts, sortProducts, groupProductsByCategory
    │   │   └── products.ui.ts    ← renderProducts, renderCatalogState, setupToolbar, setupProductCardEvents
    │   └── cart/
    │       ├── cart.types.ts     ← CartItem, Cart, AddableProduct
    │       ├── cart.logic.ts     ← Pure calculateLineTotal, calculateTotalItems, calculateTotalPrice
    │       ├── cart.state.ts     ← Cart state & defensive localStorage sync (isValidCartItem)
    │       └── cart.ui.ts        ← renderCartUI, openCartSidebar, closeCartSidebar, setupCartEvents
    ├── data.ts                  ← Preserved Day 2 local dataset of 12 digital products
    ├── logic.ts                 ← Pure logic barrel re-exporting product and cart logic
    ├── state.ts                 ← Cart state barrel re-exporting state functions
    ├── ui.ts                    ← Main UI coordinator (initUI, setupViewfinder, setupRegistrationForm)
    └── main.ts                  ← Bootstrap entry point (connects state, getProducts(), LoadState, toasts)
```

---

## 6. Documented Comparison: Course REST API Catalog vs. Preserved Day 2 Local Dataset

In Day 3, the live storefront fetches its catalog from the official course REST API (`https://shopboard-api.vercel.app/api/products`), while the original Day 2 dataset (`src/data.ts`) is preserved intact for unit testing and reference.

| Attribute                | Course REST API (`products.api.ts`)                                     | Preserved Day 2 Local Dataset (`src/data.ts`)                           |
| :----------------------- | :---------------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Source**               | `GET https://shopboard-api.vercel.app/api/products`                     | Local ES module export `products` in `src/data.ts`                      |
| **Item Count**           | 12 products (`total: 12`)                                               | 12 products                                                             |
| **Wire ID Format**       | Numeric IDs (`1`–`12`), mapped to `string` (`"1"`–`"12"`)               | Slug IDs (`"cv-template"`, `"study-planner"`, etc.)                     |
| **Name Field**           | `title` (mapped to `name` in `toProduct()`)                             | `name`                                                                  |
| **Category Field**       | `category_name`: `"Bags"`, `"Shoes"`, `"Accessories"`                   | `category`: `"Templates"`, `"Planners"`, `"Productivity"`               |
| **Price Representation** | `price_cents` (integer cents, e.g., `8900`), converted to `$89`         | `price` (numeric dollars, `$7`–`$18`)                                   |
| **Stock Status**         | `in_stock: boolean` (IDs `3` and `9` are `false`; others `true`)        | `inStock: true` on all 12 items                                         |
| **Product Examples**     | Leather Tote Bag (`$89`), White Sneakers (`$79`), Silver Watch (`$149`) | CV Template (`$12`), Study Planner (`$10`), Pitch Deck Template (`$18`) |

---

## 7. Async UI States & Simulation Switches

ShopBoard handles all 5 async UI states via `LoadState` in `src/modules/products/products.ui.ts`:

1. **Loading State (`.catalog-state-loading`)**: Displayed while `getProducts()` is in flight.
2. **Error State (`.catalog-state-error`)**: Displayed on network or HTTP failures (`404`/`500`), accompanied by an error toast (`showToast(message, "error")`) and a working **Try Again** (`#retry-fetch-btn`) button that re-invokes `loadCatalog()`.
3. **Empty API State (`.catalog-state-empty-api`)**: Displayed when the API returns `{ items: [], total: 0 }`.
4. **Empty Search/Filter State (`.catalog-state-empty-filter`)**: Displayed when user search or category filters match zero items in a non-empty catalog, featuring a **Reset Filters** (`#reset-filters-btn`) button.
5. **Success State**: Renders the 12 product cards with specimen previews and interactive Add-to-Cart buttons.

You can test the async simulation modes in the browser using query parameters:

- `?api_mode=delay` — Routes to `/delay/1500/api/products` to inspect the loading state.
- `?api_mode=fail` — Routes to `/fail/500/api/products` to inspect the error state and error toast.
- `?api_mode=fail_once` — Fails on initial load (`500`) and succeeds when clicking **Try Again**.
- `?api_mode=empty` — Routes to `/empty/api/products` to inspect the empty API catalog state.
