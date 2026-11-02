# ShopBoard — Claude / AI Agent Architecture Guide

## 1. Project Overview

ShopBoard is an educational digital products storefront built as part of the CorePro Software Development Using AI program (Days 2 & 3). It showcases clean, accessible, and responsive frontend architecture using strict TypeScript, feature-based modular architecture, live REST API integration, and modern web standards without external UI frameworks.

## 2. Tech Stack

- **Bundler & Dev Server**: Vite (TypeScript + Vanilla Web Standards)
- **Language**: Strict TypeScript (`"strict": true`, `"noUnusedLocals": true`, `"noEmit": true`)
- **Markup**: Semantic HTML5
- **Styles**: Mobile-first CSS3 (Strictly no `!important`)
- **Quality Tools**: TypeScript (`tsc --noEmit`), Prettier, ESLint, Husky, lint-staged, Node.js Test Runner

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
- **Enforceable rule**: Always wrap `JSON.parse()` in a `try...catch` block. Validate that the parsed result is an array with `Array.isArray()`, and sanitize each item via `isValidCartItem()` (verifying valid `id`, `name`, numeric `price`, and positive `quantity > 0`). Fall back safely to `[]`.

### Rule 4: Strict Separation of Concerns (UI Modules Own the DOM)

- **Mistake observed**: Mixing `document.querySelector` or `innerHTML` inside logic, API, state, or bootstrap modules breaks modularity and makes unit testing impossible in Node.js.
- **Enforceable rule**: Only UI modules (`src/ui.ts`, `src/modules/products/products.ui.ts`, `src/modules/cart/cart.ui.ts`, `src/shared/ui/toast.ts`) touch the page DOM. `src/logic.ts` and `src/modules/**/*.logic.ts` must remain 100% pure (no `window`, `document`, `fetch`, or `localStorage`). `src/shared/api/client.ts` and `src/modules/products/products.api.ts` handle HTTP and mapping only. `src/main.ts` only coordinates module initialization.

### Rule 5: Empirical Verification Integrity

- **Mistake observed**: Claiming features or tests passed based on assumptions or code inspection rather than execution.
- **Enforceable rule**: Never claim a test, typecheck, build, lint, or UI check passed without executing the command and verifying the actual terminal/browser output. Distinguish pure logic unit tests from real browser interaction verification.

---

## 4. Core Day 3 Engineering Rules (TypeScript & REST APIs)

### Rule 6: Strict TypeScript Hygiene — Zero `any`, Zero Unsafe `as`, Zero `!`

- **Mistake observed**: AI-generated TypeScript frequently uses `as any`, `as Product[]`, or non-null assertions (`document.querySelector(...)!`) to silence compiler errors, erasing runtime safety.
- **Enforceable rule**: Never use `any`, unsafe `as` type assertions, or `!` non-null assertions in `src/**/*.ts`. Narrow DOM elements with `if (!el) return` or `instanceof HTMLElement`, and narrow external data with runtime type guards.

### Rule 7: Runtime Validation at External Boundaries (`fetch` & `localStorage`)

- **Mistake observed**: Treating `await res.json()` or `JSON.parse()` as trusted TypeScript types causes runtime crashes when an API returns an unexpected payload or error shape.
- **Enforceable rule**: Treat all external JSON (`res.json()` and `localStorage`) as `unknown`. Pass API payloads through runtime validators (`isApiProduct`, `parseApiProduct`, `parseApiProductList`) inside `fetchJson<T>(path, validate)`.

### Rule 8: Separate API Wire Types from Internal Domain Types (`toProduct` Mapper)

- **Mistake observed**: Leaking backend wire field names (`title`, `category_name`, `price_cents`, `in_stock`) into UI templates or business logic causes `$8900` cent-pricing bugs and couples the UI to backend naming.
- **Enforceable rule**: Keep `ApiProduct` and `ApiProductList` strictly inside `src/modules/products/products.api.ts`. Convert `price_cents` to dollars (`Math.round(api.price_cents) / 100`) and map wire fields to `Product` exclusively inside `toProduct(api: ApiProduct): Product`.

### Rule 9: Complete Async UI State Coverage (`LoadState`)

- **Mistake observed**: Only coding the happy path for `fetch()` leaves users with blank screens during loading, uncaught errors on HTTP 500, or ambiguous empty messages.
- **Enforceable rule**: Model async data fetching with the `LoadState` discriminated union (`loading`, `error`, `success`). Always render distinct UI states for:
  1. Loading state (`.catalog-state-loading`)
  2. Error state (`.catalog-state-error`) with a working Retry (`#retry-fetch-btn`) button
  3. Empty API catalog state (`.catalog-state-empty-api`) when the API returns `items: []`
  4. Empty search/filter state (`.catalog-state-empty-filter`) with a Reset Filters (`#reset-filters-btn`) button
  5. Success state rendering product cards

### Rule 10: Centralized Toast Notifications (`showToast`)

- **Mistake observed**: Scattering ad-hoc alert boxes or silent failures across modules.
- **Enforceable rule**: Route transient user notifications (such as "Added to cart" confirmation and API error alerts) through `showToast(message, type)` in `src/shared/ui/toast.ts`, rendering into the accessible `#toasts` (`aria-live="polite"`) container.

---

## 5. Day 3 Modular Architecture

```
src/
├── shared/
│   ├── api/
│   │   └── client.ts            ← BASE_URL, ApiError, fetchJson<T>() with runtime validation
│   └── ui/
│       └── toast.ts             ← showToast(), ToastType ('success' | 'error' | 'info')
├── modules/
│   ├── products/
│   │   ├── products.types.ts    ← Category, Product, CategoryFilter, SortOrder, LoadState
│   │   ├── products.api.ts      ← ApiProduct, ApiProductList, toProduct(), getProducts(), getProduct()
│   │   ├── products.logic.ts    ← Pure filterProducts, sortProducts, groupProductsByCategory
│   │   └── products.ui.ts       ← renderProducts, renderCatalogState, setupToolbar, setupProductCardEvents
│   └── cart/
│       ├── cart.types.ts        ← CartItem, Cart, AddableProduct
│       ├── cart.logic.ts        ← Pure calculateLineTotal, calculateTotalItems, calculateTotalPrice
│       ├── cart.state.ts        ← Cart state & defensive localStorage sync (isValidCartItem)
│       └── cart.ui.ts           ← renderCartUI, openCartSidebar, closeCartSidebar, setupCartEvents
├── data.ts                      ← Preserved original 12 digital products dataset (Day 2 baseline)
├── logic.ts                     ← Barrel re-exporting pure functions from products.logic & cart.logic
├── state.ts                     ← Barrel re-exporting cart state functions from cart.state
├── ui.ts                        ← UI coordinator (setupViewfinder, setupRegistrationForm, initUI)
└── main.ts                      ← Bootstrap entry point (connects state, getProducts(), LoadState, toasts)
```

---

## 6. Verification Protocol

- Run `npm run typecheck` — verify zero TypeScript compiler errors (`tsc --noEmit`).
- Run `npm run lint` — verify zero ESLint errors or warnings.
- Run `npm run format:check` — verify Prettier compliance.
- Run `npm test` — verify Node native test suite (`test-logic.mjs`, `test-state.mjs`, `test-api.mjs`) passes completely.
- Run `npm run build` — verify zero production build errors.
- Run `npm run test:browser` — verify browser interactions, cart persistence, empty states, error + retry recovery, and zero console errors.
- Run `npm run test:responsive` — verify zero horizontal overflow across all 6 viewports (`320px` to `1440px`).
