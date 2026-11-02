# ShopBoard — Debugging & Test Verification Log

This document records real bugs encountered and resolved, preventive edge-case validations, and automated test outcomes during the Day 2 development of ShopBoard.

---

## Bug 1: Direct DOM Access in Bootstrap Module & Dead Boilerplate File

- **What I saw:** The Part 2 architectural requirement states: "Only one file touches the page (the DOM)". Searching the project revealed `document.readyState` and `document.addEventListener('DOMContentLoaded', initApp)` inside `src/main.js`, as well as a leftover Vite boilerplate file `src/counter.js` containing `innerHTML` and `addEventListener`.
- **Type:** logic / architecture
- **How I found it:** Automated workspace search running `Select-String -Pattern "document|window|querySelector|innerHTML|addEventListener"` across all `src/*.js` files.
- **Cause:** `src/main.js` (lines 44–45) performed DOM lifecycle checking, and unreferenced `src/counter.js` (lines 5 and 7) manipulated elements directly.
- **Fix:** Removed dead boilerplate `src/counter.js`. Added `initUI(products)` inside `src/ui.js` which encapsulates DOM readiness and coordinates mounting. Refactored `src/main.js` to strictly import `initUI` and call `initializeCartState()` and `initUI(products)` with zero direct DOM access.
- **Did I use AI? For what?** Yes, used AI to audit all JavaScript files for DOM references, delete the unreferenced counter file, and refactor the mounting lifecycle into `src/ui.js`.

---

## Bug 2: Stale Detached Button Reference in Browser Interaction Test

- **What I saw:** When executing the automated browser test (`node test-browser-interaction.mjs`), Test 3 (testing decrease quantity and zero removal) failed: `{ q1: 1, empty: false }`. The second decrease click did not trigger item removal.
- **Type:** state / logic (test harness interaction)
- **How I found it:** Terminal error output during CDP headless browser execution of `test-browser-interaction.mjs`.
- **Cause:** In `test-browser-interaction.mjs`, `const decreaseBtn` was queried once and then `.click()` was called twice consecutively. Because `src/ui.js` re-renders `cartItemsContainer.innerHTML` on every quantity update, the first click replaced the DOM element with new markup. The second click was dispatched on a detached DOM node that was no longer in the document tree, so the click never reached the event delegation listener on `#cart-items-container`.
- **Fix:** Updated the test script to re-query the active decrease button from the DOM before dispatching the second click, allowing the event delegation listener on the container to receive the second click and successfully remove the item at quantity 0.
- **Did I use AI? For what?** Yes, used AI to diagnose why the second click event did not bubble to the container and fix the element selection in the test script.

---

## Bug 3: ESLint Multi-Environment Configuration & Unused Import Warnings

- **What I saw:** Executing `npm run lint` threw 11 errors and warnings: `document` and `window` were flagged as undefined in `test-mobile-responsive.mjs`, and `saveCartToStorage` in `test-state.mjs` was flagged as assigned but never used.
- **Type:** runtime / linting configuration
- **How I found it:** Execution output of `npm run lint` in the terminal.
- **Cause:** `eslint.config.js` only defined `globals.browser` for browser files, without providing browser globals for test scripts that evaluate in-browser expressions via CDP. In `test-state.mjs`, `saveCartToStorage` was imported on line 36 but had no dedicated test assertion because it was only exercised indirectly by cart actions.
- **Fix:** Configured `eslint.config.js` with separate scopes for browser (`src/**/*.js`) and test scripts (`*.mjs`, `*.js`). Added a direct unit test for `saveCartToStorage` in `test-state.mjs` to verify serialization into `localStorage`. Re-ran `npm run lint` to confirm 0 errors and 0 warnings.
- **Did I use AI? For what?** Yes, used AI to structure the modern ESLint flat configuration and write the missing unit test for `saveCartToStorage`.

---

## Preventive Validation 1: Malformed & Corrupted LocalStorage Defensive Handling

- **What I saw (Preventive Edge-Case Scenario):** Injected corrupted non-JSON strings (`CORRUPT_JSON_{["bad`), non-array JSON structures (`{"id": "p1"}`), and malformed item schemas (negative quantity, string price, missing fields) into `localStorage`.
- **Type:** state (preventive edge case)
- **How I found it:** Automated test suite `test-state.mjs` -> `State Module — Safe Handling of Malformed LocalStorage`.
- **Cause:** Real users or browser extensions can tamper with or corrupt `localStorage` data, which would cause an unhandled `JSON.parse` to crash the entire application on startup.
- **Fix:** In `src/state.js`, wrapped `JSON.parse` in a `try...catch` block, verified `Array.isArray()`, and filtered every item through a strict schema validator (`typeof id === 'string'`, `quantity > 0`). Tested all 4 scenarios in `test-state.mjs`.
- **Did I use AI? For what?** Yes, used AI to design and automate test cases covering corrupted JSON, non-array structures, invalid schemas, and missing storage keys.

---

## Preventive Validation 2: Array Immutability in Price Sorting

- **What I saw (Preventive Edge-Case Scenario):** Validated that sorting products by price ('asc', 'desc') does not mutate the source product array in-place, and that switching back to 'default' restores the original catalog sequence.
- **Type:** logic (preventive edge case)
- **How I found it:** Automated test suite `test-logic.mjs` -> `Logic Module — sortProducts`.
- **Cause:** JavaScript's `Array.prototype.sort()` mutates arrays in-place. If called directly on `products`, the catalog's original order is permanently destroyed.
- **Fix:** In `src/logic.js`, created a shallow copy `const sortedCopy = [...products]` before sorting. Verified with `assert.deepStrictEqual` against pre-test snapshots in `test-logic.mjs`.
- **Did I use AI? For what?** Yes, used AI to write snapshot regression assertions ensuring input immutability.

---

## Preventive Validation 3: Event Delegation vs. Listener Duplication

- **What I saw (Preventive Edge-Case Scenario):** Validated the instructor's requirement: change the category filter 5 times, then click "Add to Cart" once, and verify that exactly 1 item is added to the cart.
- **Type:** state / logic (preventive regression verification)
- **How I found it:** Automated real-browser CDP test in `test-browser-interaction.mjs`.
- **Cause:** If click event listeners were registered inside `renderProducts()`, each filter change would attach another listener, resulting in 5 units added on a single click.
- **Fix:** Event listeners are attached once on `#products-grid` using event delegation (`event.target.closest('.add-to-cart-btn')`). `renderProducts()` only updates markup and never calls `addEventListener()`. Real browser test verified 1 unit was added.
- **Did I use AI? For what?** Yes, used AI to script the headless browser test simulating 5 category changes and a single click.

---

## Bug 4: Machine-Specific Absolute Import Paths in Browser Automation Scripts

- **What I saw:** Both `test-browser-interaction.mjs` and `test-mobile-responsive.mjs` imported the CDP browser helper via an absolute machine-specific path (`file:///C:/Users/minaw/.gemini/config/skills/design-taste-frontend/scripts/lib/cdp.mjs`), causing tests to fail with module resolution errors on any other machine.
- **Type:** runtime / portability
- **How I found it:** Code review and portability audit of committed browser test scripts.
- **Cause:** Hardcoded local path to the developer's user profile directory instead of a relative in-repo module path.
- **Fix:** Vendored the zero-dependency, multi-platform Chrome DevTools Protocol helper into `tests/cdp.mjs`. Updated both automation scripts to import from `./tests/cdp.mjs` using relative paths. Added graceful prerequisite detection that informs users if Chrome/Chromium is missing without crashing. Documented prerequisites in `README.md` and added `npm run test:browser` and `npm run test:responsive` to `package.json`.
- **Did I use AI? For what?** Yes, used AI to isolate the standalone helper, vendor it within the repository, and update the test harnesses and documentation.
