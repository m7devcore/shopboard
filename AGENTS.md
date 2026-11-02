# ShopBoard — AI Agent Instructions

## 1. Project Overview

ShopBoard is an educational frontend web application built as part of the CorePro Software Development Using AI program (Days 2 & 3).

The project focuses on building a clean, responsive, accessible web interface using Vite, strict TypeScript, feature-based modules, and live REST API integration.

Follow the requirements provided in each development task. Do not assume or implement additional features unless explicitly requested or approved.

## 2. Tech Stack

- Vite (Vanilla TypeScript)
- Strict TypeScript (`"strict": true`, `"noUnusedLocals": true`, `"noEmit": true`)
- HTML5
- CSS3 (Mobile-first, zero `!important`)
- ES Modules
- Quality & Guardrail Tools: TypeScript (`tsc`), Prettier, ESLint, Husky, lint-staged

Use the existing project setup and dependencies. Do not introduce additional frameworks or runtime dependencies without prior approval.

## 3. Core Day 2 & Day 3 Engineering Rules

1. **Rule 1 — Array Immutability in Sorting & Filtering**:
   Never mutate the input product array in-place. Always create a shallow copy (`[...products]`) before sorting so that choosing "Default Order" cleanly restores the original catalog sequence.
2. **Rule 2 — Event Delegation Over Repeated Registration**:
   Never register event listeners inside rendering functions (`renderProducts()`, `renderCartUI()`, `renderCatalogState()`). Register event listeners once on stable container elements (`#products-grid`, `#cart-items-container`) using event delegation (`event.target.closest()`). Changing category filters 5 times and clicking "Add to Cart" once must add exactly 1 unit.
3. **Rule 3 — Defensive Storage & API Parsing**:
   Never trust `localStorage` or `fetch` JSON data blindly. Wrap `JSON.parse()` in a `try...catch` block, validate schemas at runtime (`isValidCartItem`, `isApiProduct`, `parseApiProductList`), and fall back or throw `ApiError` safely.
4. **Rule 4 — Strict DOM Ownership**:
   Only UI modules (`src/ui.ts`, `src/modules/products/products.ui.ts`, `src/modules/cart/cart.ui.ts`, `src/shared/ui/toast.ts`) touch the page DOM (`document`, `window`, `querySelector`, `innerHTML`, `addEventListener`). Pure logic modules (`src/logic.ts`, `src/modules/**/*.logic.ts`) must remain 100% deterministic, side-effect free, and runnable in any environment.
5. **Rule 5 — Strict TypeScript Hygiene**:
   Never use `any`, unsafe `as` type assertions, or `!` non-null assertions in `src/**/*.ts`.
6. **Rule 6 — API Wire vs. Domain Separation (`toProduct`)**:
   Keep `ApiProduct` (`title`, `category_name`, `price_cents`, `in_stock`) separate from `Product` (`name`, `category`, `price`, `inStock`). Convert `price_cents` to dollars exclusively in `toProduct()`.
7. **Rule 7 — Complete Async `LoadState` Handling**:
   Always support Loading, Error (with working Retry button), Empty API catalog, Empty search/filter results, and Success states.
8. **Rule 8 — Empirical Verification Integrity**:
   Never claim a test, typecheck, build, lint, or feature passed without executing the command and inspecting the actual results. Distinguish logic/API unit tests from browser interaction tests.

## 4. Coding Standards

### HTML

- Use semantic HTML first (`header`, `nav`, `main`, `section`, `article`, `form`, `footer`, `aside`).
- Only one `h1` per page.
- Every input must have an associated `<label>` linked via `for` and `id`.
- Use native HTML validation whenever appropriate (`required`, `type="email"`, `minlength`).
- Maintain accessible markup with visible focus rings (`:focus-visible`) and ARIA live regions (`#product-results-announcer`, `#cart-announcer`, `#toasts`) for dynamic announcements.

### CSS

- Follow a mobile-first approach using `min-width` media queries.
- Never use `!important`.
- Keep CSS clean, readable, organized, and free of unnecessary duplication.
- Ensure zero horizontal page overflow across all viewport widths (320px to 1440px).

### TypeScript

- Use strict TypeScript and ES Modules.
- Avoid `any`, unsafe `as` assertions, and `!` non-null assertions.
- Keep functions simple and focused with single responsibilities.
- Prefer array methods (`map`, `filter`, `reduce`, `find`) over manual loop counters.

## 5. Modular Architecture & Project Structure

- `index.html` — Main HTML entry point containing semantic landmarks, controls, and `#toasts` container (zero hardcoded product cards).
- `tsconfig.json` — Strict TypeScript configuration.
- `src/shared/api/client.ts` — `BASE_URL`, `ApiError`, and generic `fetchJson<T>()` with runtime validation.
- `src/shared/ui/toast.ts` — Accessible toast notification renderer (`showToast()`).
- `src/modules/products/products.types.ts` — `Category`, `Product`, `CategoryFilter`, `SortOrder`, `LoadState`.
- `src/modules/products/products.api.ts` — `ApiProduct`, `ApiProductList`, runtime validators, `toProduct()` mapper, `getProducts()`, `getProduct()`.
- `src/modules/products/products.logic.ts` — Pure product search, filter, sort, and grouping functions.
- `src/modules/products/products.ui.ts` — Product card rendering, `renderCatalogState()`, toolbar & card event delegation.
- `src/modules/cart/cart.types.ts` — `CartItem`, `Cart`, `AddableProduct`.
- `src/modules/cart/cart.logic.ts` — Pure cart calculation functions (`calculateLineTotal`, `calculateTotalItems`, `calculateTotalPrice`).
- `src/modules/cart/cart.state.ts` — Shopping cart state management and safe `localStorage` persistence.
- `src/modules/cart/cart.ui.ts` — Cart sidebar drawer rendering and delegated cart event handlers.
- `src/data.ts` — Preserved original 12 digital products catalog from Day 2.
- `src/logic.ts` — Pure logic barrel re-exporting product and cart logic.
- `src/state.ts` — Cart state barrel re-exporting state functions.
- `src/ui.ts` — Main UI coordinator (`initUI`, `setupViewfinder`, `setupRegistrationForm`).
- `src/main.ts` — Application bootstrap connecting state, `getProducts()`, `LoadState`, Retry, and error toasts.
- `src/style.css` — Application styling following the frozen Day 2 Obsidian & Liquid Glass visual identity.
- `ai-review-log.md` — Technical review of `ai-products.ts` (Day 3 Review Lab).
- `debugging-log.md` — Record of Day 2 bugs, root causes, and fixes.

## 6. Testing & Verification

After every significant implementation or modification:

1. Run `npm run typecheck` — verify 0 TypeScript errors.
2. Run `npm run lint` — verify 0 ESLint errors and 0 warnings.
3. Run `npm run format:check` — verify Prettier formatting.
4. Run `npm test` — verify Node.js automated test runner tests (`test-logic.mjs`, `test-state.mjs`, `test-api.mjs`) pass.
5. Run `npm run build` — verify production build succeeds without errors.
6. Verify browser interactions (`npm run test:browser`) and zero console errors.
7. Verify responsive behavior (`npm run test:responsive`) without horizontal overflow on 320px, 375px, 390px, 430px, 768px, 1440px.
8. Explain verification results truthfully.
