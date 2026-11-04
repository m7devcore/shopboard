# AEVUM / ShopBoard — Canonical Agent Instructions & Engineering Rules

## 1. Project Overview

AEVUM — Art Across Ages (built on the CorePro ShopBoard architecture) is an educational fine art gallery and digital exhibition storefront. It demonstrates clean, accessible, and responsive frontend architecture using strict TypeScript, feature-based modular design, dual-mode catalog architecture, and modern web standards with zero external UI frameworks.

### Dual-Mode Catalog Architecture

- **Default Gallery Mode (`/`):** The primary production experience showcasing the AEVUM Burgundy Private Gallery single-artwork exhibition, curatorial dossiers, click & drag / swipe navigation, and acquisitions drawer. Loads 100% locally from curated artwork data with zero external API dependencies.
- **Course Mode (`/index.html?mode=course`):** Preserves the complete original CorePro Day 2/Day 3 ShopBoard digital products storefront, integrating with the live REST API (`https://shopboard-api.vercel.app/api/products`), category dropdown filters, and search/sorting toolbar.

---

## 2. Technology Stack

- **Bundler & Dev Server:** Vite 8 (TypeScript + Vanilla Web Standards)
- **Language:** Strict TypeScript 7 (`"strict": true`, `"noUnusedLocals": true`, `"noEmit": true`)
- **Compatibility Compiler:** TypeScript 6 API (`@typescript/typescript6`) providing the programmatic compiler AST required by `typescript-eslint` alongside native `tsc`
- **Markup:** Semantic HTML5 (Single `<h1>`, accessible landmarks, linked `<label>`s, ARIA live regions)
- **Styles:** Mobile-first CSS3 (Strictly zero `!important`, CSS custom properties design tokens, zero `max-width` media queries)
- **Quality & Guardrail Tools:** TypeScript (`tsc`), Prettier, ESLint, Husky, lint-staged, Node.js Test Runner

---

## 3. Folder Structure & Architectural Blueprint

```text
├── index.html                           # Single HTML entry point (semantic landmarks, accessible regions)
├── tsconfig.json                        # Strict TypeScript configuration
├── package.json                         # Scripts, dependencies, lint-staged config
├── eslint.config.js                     # ESLint flat configuration (typescript-eslint + browser/node globals)
├── .prettierrc                          # Prettier code style configuration
├── .husky/                              # Git hooks (pre-commit invokes lint-staged)
├── DESIGN.md                            # Comprehensive design system & specification
├── README.md                            # Project documentation, setup, and mode guide
├── AGENTS.md                            # Canonical AI agent instructions (this document)
├── CLAUDE.md                            # AI developer guide and lessons-learned reference
├── debugging-log.md                     # Structured log of verified debugging and historical issues
├── public/
│   ├── assets/
│   │   ├── catalog/                     # Curated exhibition artwork images (antiques, ceramics, paintings, sculptures)
│   │   ├── hero/                        # Royal Salon hero imagery (WebP responsive assets)
│   │   └── journal/                     # Art Journal editorial assets (Winged Victory WebP)
│   ├── favicon.svg                      # AEVUM monogram favicon
│   └── icons.svg                        # SVG symbol sprite definitions
├── styles/
│   └── style.css                        # Mobile-first design tokens & visual styles (zero max-width media queries)
├── src/                                 # Strictly TypeScript (.ts) source modules only
│   ├── main.ts                          # Application bootstrap & catalog mode routing
│   ├── ui.ts                            # UI coordinator (event delegation, viewfinder, parallax, observer)
│   ├── logic.ts                         # Logic barrel re-exporting product and cart calculation logic
│   ├── state.ts                         # State barrel re-exporting cart state operations
│   ├── data.ts                          # Preserved 12 digital products catalog for Course Mode reference
│   ├── shared/
│   │   ├── api/client.ts                # Generic fetchJson<T> client, ApiError, and API base URL resolution
│   │   └── ui/toast.ts                  # Centralized accessible toast notification system
│   └── modules/
│       ├── artworks/                    # AEVUM Fine Art Gallery domain
│       │   ├── artworks.data.ts         # 16 canonical artwork records with curatorial research metadata
│       │   ├── artworks.showcase.ts     # Burgundy Private Gallery single-artwork showcase & navigation
│       │   ├── artworks.types.ts        # Artwork, ArtworkCategory, CuratorialLicense, SaleStatus types
│       │   └── artworks.ui.ts           # Curatorial Artwork Details modal dialog & dossier renderer
│       ├── catalog/                     # Application mode management
│       │   └── catalog.mode.ts          # Mode detection (Default Gallery vs Course Mode via query params)
│       ├── products/                    # Course ShopBoard catalog & REST API domain
│       │   ├── products.api.ts          # ApiProduct wire types, runtime validators, toProduct() mapper
│       │   ├── products.logic.ts        # Pure search, filter, sort, and grouping functions
│       │   ├── products.types.ts        # Product, Category, LoadState types
│       │   └── products.ui.ts           # ShopBoard card grid, department tabs, toolbar delegation
│       └── cart/                        # Shopping cart & acquisition state
│           ├── cart.logic.ts            # Pure cart math (line total, total items, line sum)
│           ├── cart.state.ts            # LocalStorage persistence, safe deserialization, cart operations
│           ├── cart.types.ts            # CartItem, Cart, AddableProduct types
│           └── cart.ui.ts               # Acquisitions sidebar drawer renderer and event handlers
├── tests/
│   └── cdp.mjs                          # Zero-dependency, vendored Chrome DevTools Protocol test harness
├── test-logic.mjs                       # Unit tests: pure filtering, sorting, and cart calculations
├── test-state.mjs                       # Unit tests: cart state operations and defensive localStorage handling
├── test-api.mjs                         # Unit tests: API client, schema validation, and toProduct mapper
├── test-browser-interaction.mjs         # Browser tests: Course Mode compatibility and interaction flows
├── test-gallery-interaction.mjs         # Browser tests: Burgundy Private Gallery showcase interaction suite
└── test-mobile-responsive.mjs           # Responsive tests: zero horizontal overflow audit across 6 viewports
```

---

## 4. Where to Add New Features

1. **Fine Art Gallery Domain (Artworks, Showcases, Curatorial Dossiers):**
   - Add data schemas and artwork records to `src/modules/artworks/artworks.data.ts` and `artworks.types.ts`.
   - Add stage controls and showcase interactions to `src/modules/artworks/artworks.showcase.ts`.
   - Add modal and curatorial presentations to `src/modules/artworks/artworks.ui.ts`.
2. **Course REST API & Product Storefront Domain:**
   - Add API endpoints, schemas, and mappers to `src/modules/products/products.api.ts`.
   - Add pure filtering, sorting, and calculation logic to `src/modules/products/products.logic.ts`.
   - Add catalog card and toolbar interaction handlers to `src/modules/products/products.ui.ts`.
3. **Cart & Acquisitions Domain:**
   - Add pure calculation math to `src/modules/cart/cart.logic.ts`.
   - Add state mutations and safe storage handlers to `src/modules/cart/cart.state.ts`.
   - Add drawer rendering and interactive controls to `src/modules/cart/cart.ui.ts`.
4. **Application Mode & Routing:**
   - Configure query parameters and runtime mode selection in `src/modules/catalog/catalog.mode.ts`.
   - Bootstrap mode initialization in `src/main.ts`.
5. **Cross-Cutting Utilities:**
   - Shared network logic belongs in `src/shared/api/`.
   - Centralized accessible notifications belong in `src/shared/ui/`.

---

## 5. Preventive Engineering Safeguards

These safeguards are proactive defensive engineering patterns built into the codebase from the initial implementation. They represent established standards to prevent common failure modes:

1. **Array Immutability in Pure Logic:**
   - Never mutate input arrays in pure functions (`sortProducts`, `filterProducts`).
   - JavaScript's `Array.prototype.sort()` sorts in-place. Always create a shallow copy (`[...products]`) before sorting or filtering.
2. **Defensive LocalStorage Deserialization:**
   - Wrap all `localStorage.getItem()` and `JSON.parse()` calls in `try...catch`.
   - Verify that the parsed output is an array using `Array.isArray()`, and validate each item through schema type guards before updating application state. Fall back safely to `[]`.
3. **Event Delegation on Stable Containers:**
   - Never register event listeners inside rendering functions.
   - Attach click listeners once at startup on stable parent containers (`#products-grid`, `#cart-items-container`, `#gallery-department-tabs`) and resolve click targets dynamically using `event.target.closest()`.
4. **Strict DOM Isolation & Logic Purity:**
   - Presentation modules (`*.ui.ts`, `artworks.showcase.ts`, `src/ui.ts`, `src/shared/ui/toast.ts`) manage DOM interaction and event handling.
   - Pure logic modules (`*.logic.ts`) must remain 100% deterministic and completely free of browser DOM APIs (`window`, `document`, `HTMLElement`), runnable directly in bare Node.js without a browser environment.
5. **Mobile-First CSS Architecture:**
   - Write mobile styling as the default baseline.
   - Use `min-width` progressive enhancement for tablet and desktop viewports. Strictly zero `max-width` media queries permitted.
6. **Strict TypeScript Hygiene:**
   - Prohibited in authored TypeScript: `any`, unsafe `as` type assertions, and postfix `!` non-null assertions.
   - Use type guards (`isRecord`, `isValidCartItem`), proper DOM narrowing (`instanceof HTMLElement`), and discriminated unions (`LoadState`).
7. **Semantic HTML & Accessibility:**
   - Maintain a single `<h1>` per page, semantic landmark elements, linked `<label>`s, ARIA live regions for cart and toasts, and minimum 44px touch targets.
8. **Scope Integrity & No Unrelated Changes:**
   - When asked to make a specific targeted correction, do not modify unrelated features, redesign sections, or alter verified data.

---

## 6. Engineering Rules Grounded in Real Project Mistakes

This section documents real mistakes and defects encountered during project development, explaining what went wrong, why it happened, what AI agents must do differently, and where each issue is documented.

### Rule 1: Always Re-Query DOM Elements in Test Harnesses After State Changes

- **What went wrong:** In `test-browser-interaction.mjs`, Test 3 (testing quantity decrease and item removal at zero) failed with `{ q1: 1, empty: false }`. The second decrease click had no effect.
- **Why it happened:** The test script queried the decrease button once and called `.click()` twice consecutively. Because `ui.js` re-renders `cartItemsContainer.innerHTML` on every state change, the first click replaced the DOM element. The second click was dispatched on a detached node that was no longer in the document tree.
- **What to do differently:** When authoring automated browser tests, never reuse element references across actions that trigger DOM re-rendering. Always re-query the target element from the active document tree before dispatching events.
- **Documented in:** Historically documented in prior project records; resolved in commit [`d0ce265`](https://github.com/m7devcore/shopboard/commit/d0ce2659a906198ff0a8c4592e2b8b00a8538d28) in `test-browser-interaction.mjs` (see `debugging-log.md` Section 2, Issue 1).

### Rule 2: Keep Test Harnesses Self-Contained with Relative Imports

- **What went wrong:** Browser test scripts imported the CDP browser automation helper using a hardcoded Windows machine path (`file:///C:/Users/minaw/.../cdp.mjs`), which was machine-specific and had the potential to fail in other environments or CI pipelines lacking that directory.
- **Why it happened:** Helper code was copied from an external local directory without converting the import to an in-repository relative path.
- **What to do differently:** Always vendor shared helper utilities directly into the repository (e.g. `tests/cdp.mjs`) and use relative project imports (`./tests/cdp.mjs`). Never commit machine-specific paths.
- **Documented in:** Commit [`bcfc2e3`](https://github.com/m7devcore/shopboard/commit/bcfc2e358ca25b641b24e4265c9cad3f47aef330) and commit [`5dfe363`](https://github.com/m7devcore/shopboard/commit/5dfe3637bd988891b2e75fb7fe86361216bffe84) (see `debugging-log.md` Section 2, Issue 2).

### Rule 3: Configure Separate ESLint Scopes for Application and Test Environments

- **What went wrong:** Running `npm run lint` emitted 11 warnings (as recorded in historical project documentation) because browser globals (`document`, `window`) were flagged as undefined in Node-based test scripts evaluating browser expressions via CDP, and an import in `test-state.mjs` lacked a direct assertion.
- **Why it happened:** `eslint.config.js` only defined `globals.browser` for `src/`, leaving test automation scripts running under default Node rules without browser globals.
- **What to do differently:** In ESLint flat configs, define dedicated configuration objects for test automation scripts (`*.mjs`, `tests/**/*.mjs`) that combine both `globals.node` and `globals.browser`.
- **Documented in:** Commit [`d0ce265`](https://github.com/m7devcore/shopboard/commit/d0ce2659a906198ff0a8c4592e2b8b00a8538d28) in `eslint.config.js` (see `debugging-log.md` Section 2, Issue 3).

### Rule 4: Never Exclude Application Code from Linters to Hide Compatibility Hurdles

- **What went wrong:** `eslint.config.js` had `ignores: [..., "src/**/*.ts"]` and only matched `files: ["src/**/*.js"]`, allowing `npm run lint` to pass without actually linting any TypeScript application files.
- **Why it happened:** When `typescript-eslint` threw a runtime error against TypeScript 7.0 CLI, the entire TypeScript source folder was ignored instead of configuring the necessary compatibility bridge.
- **What to do differently:** Never ignore active source code to make a linter pass. Use Microsoft's official side-by-side compatibility configuration: run `@typescript/typescript6` for AST/linter compatibility while preserving `@typescript/native` for native `tsc` type checking.
- **Documented in:** Local commit `8cbb5cc` (Instructor Feedback Fix 01).

### Rule 5: Guard Business Logic Against Out-of-Stock REST Inventory (Day 3 Defect)

- **What went wrong:** During Day 3 REST API integration, clicking "Add to Cart" on out-of-stock products (`in_stock: false`) still added them to the cart state.
- **Why it happened:** `addToCart()` only checked whether the product ID was truthy, without checking `product.inStock`, and the UI did not disable buttons for unavailable products.
- **What to do differently:** Enforce inventory constraints at both the state and UI layers. In state modules, guard `addToCart` with `if ("inStock" in product && product.inStock === false) return [...cartState]`. In UI modules, disable out-of-stock buttons and render clear status labels.
- **Documented in:** Commit [`128731b`](https://github.com/m7devcore/shopboard/commit/128731bb9e9e84bb832aa2835465105ea62fc085) (see `debugging-log.md` Section 3).

### Rule 6: Convert All Responsive Overrides to Mobile-First `min-width` Rules

- **What went wrong:** In earlier styling, 9 media query blocks used `max-width` to shrink desktop layouts down for mobile viewports, violating the required mobile-first standard.
- **Why it happened:** Styles were written desktop-down (defining large desktop dimensions as defaults and using `max-width: 480px` to hide labels or shrink paddings).
- **What to do differently:** Always write compact mobile styles as base rules without media queries (e.g. `.cart-toggle-text { display: none; }`). Use `@media (min-width: ...)` to progressively enhance layouts for larger screens (e.g. `@media (min-width: 481px) { .cart-toggle-text { display: inline; } }`).
- **Documented in:** Local commit `10a470d` (Instructor Feedback Fix 03).

### Rule 7: Preserve Ground-Truth Canonical Data and Isolate Application Modes

- **What went wrong:** An earlier AI pass marked two gallery artworks as unavailable without instruction, and mixed Course REST API dependencies into local Gallery Mode.
- **Why it happened:** The AI conflated Gallery Mode with Course Mode and invented availability states not present in canonical project data.
- **What to do differently:**
  - All 16 canonical gallery artworks must remain active (`inStock: true`, `saleStatus: "In Exhibition"`). Never invent acquisitions or sales.
  - Default Gallery Mode (`/`) must remain 100% autonomous, local, and resilient against network outages. The external course REST API belongs strictly to Course Mode (`?mode=course`).
- **Documented in:** Commit [`b562de1`](https://github.com/m7devcore/shopboard/commit/b562de1e5dc422d7658797b5e408544d6db3a388) and commit [`24f854a`](https://github.com/m7devcore/shopboard/commit/24f854acfb5b17acfff4624afb93ca2d038eac16).

### Rule 8: Reconcile Source Code and Running DOM Before Reporting Findings (Preventive Safeguard)

- **Classification:** Preventive Verification Safeguard (proactive engineering practice; not recorded as a committed Git defect).
- **Core Principle:** Never report findings, assert defects, or describe system state based on assumptions or model inferences.
- **Mandatory Practice:** Always read active source files directly, execute relevant test scripts, and inspect live browser DOM output before reporting test results or formulating technical diagnoses.
- **Application in AEVUM / ShopBoard:** All catalog artwork counts (16 canonical items), mode routing (`?mode=course`), and responsive styling behavior must be reconciled directly against actual file contents and runtime state rather than inferred from conversational context.

---

## 7. Testing & Quality Verification Suite

Always run the full verification suite before concluding any task:

```bash
npm run typecheck         # Verify 0 TypeScript errors (tsc --noEmit)
npm run lint              # Verify 0 ESLint errors and warnings across all files
npm run format:check      # Verify Prettier code style compliance
npm test                  # Run Node.js native unit tests (test-logic, test-state, test-api)
npm run build             # Verify Vite production client build succeeds
npm run test:browser      # Verify Course Mode compatibility and interaction flows
npm run test:gallery      # Verify Burgundy Private Gallery showcase interactions
npm run test:responsive   # Verify zero horizontal overflow across 6 viewports (320px, 375px, 390px, 430px, 768px, 1440px)
```
