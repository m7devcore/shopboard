# ShopBoard — Debugging & Test Verification Log

This document records technical issue resolutions, test automation repairs, preventive engineering validations, and two verified manual browser debugging experiments for the ShopBoard application.

---

## 1. Overview & Classification of Records

To maintain technical accuracy, the entries in this log are categorized into distinct engineering domains rather than grouping all issues as application bugs:

- **Application Defects:** Flaws in runtime application logic, rendering, or user state management that affect end-user behavior.
- **Test Automation Defects:** Issues in automated test scripts or headless test runners where the test harness itself was faulty while application behavior remained sound.
- **Development Tooling Issues:** Linter configuration, global scope declarations, and local environment resolution rules.
- **Preventive Engineering Validations:** Proactive defensive coding patterns implemented upfront to prevent known failure modes.
- **Manual Debugging Verification:** Deliberate DevTools breakpoint inspections and reload checks performed to verify expected runtime state transitions and persistence.

The Git commit history for Day 2 development consists of an initial repository commit (`e3b1c9e`) followed by a single complete implementation commit (`d0ce265`). The absence of earlier intermediate defect commits in Git does not prove that no code bugs occurred during private iterative development; rather, the available repository records do not establish or preserve specific user-facing Day 2 application bugs prior to commit `d0ce265`.

---

## 2. Verified Historical Issues

### Issue 1: Detached DOM Element Reference in Automated Cart Test

- **What the available records show:** In prior project documentation, it is recorded that during early headless browser interaction testing (`node test-browser-interaction.mjs`), Test 3 (testing quantity decrease and item removal at zero) failed with the assertion result `{ q1: 1, empty: false }`. The second decrease click failed to remove the item from the cart.
- **Type:** Test Automation Defect (test harness interaction failure).
- **How it was found:** Historically documented as observed from the Chrome DevTools Protocol (CDP) test runner output during early test execution.
- **Cause:** In `test-browser-interaction.mjs`, the test queried the `.cart-qty-decrease` button once and called `.click()` twice consecutively. Because `src/ui.js` re-renders `cartItemsContainer.innerHTML` on every cart mutation, the first click replaced the DOM element with new markup. The second click was dispatched against a detached DOM element that was no longer connected to the active document tree, so the event never reached the delegated event listener on `#cart-items-container`. The application's cart logic was functional; the test script was targeting a detached element.
- **Fix:** The test script was updated in commit `d0ce265` to re-query the active `.cart-qty-decrease` element from the DOM before dispatching the second click, ensuring the click bubbled to the container's event delegation handler.
- **Did I use AI? For what?** Historically documented as using an AI assistant to analyze why the event did not bubble and update the element query in the test script.
- **Evidence / commit:** Documented in commit [`d0ce265`](https://github.com/m7devcore/shopboard/commit/d0ce2659a906198ff0a8c4592e2b8b00a8538d28) in `test-browser-interaction.mjs`.
- **What cannot be verified:** The original failure message is recorded only in the prior debugging log, rather than in an independent test log artifact or intermediate commit. The Git metadata does not record whether a human student or an automated tool first observed the failure.

---

### Issue 2: Machine-Specific Absolute Import Path in Browser Test Harness

- **What the available records show:** In commit `d0ce265`, both `test-browser-interaction.mjs` and `test-mobile-responsive.mjs` imported the CDP test helper via an absolute Windows file URL pointing to a specific developer profile path (`file:///C:/Users/minaw/.../cdp.mjs`). This path was machine-specific and could fail on other computers or CI environments lacking that directory.
- **Type:** Test Automation Portability Defect.
- **How it was found:** Identified during codebase review of committed test scripts.
- **Cause:** The test harness relied on an external, machine-specific tool path rather than a self-contained, in-repo module.
- **Fix:** The zero-dependency Chrome DevTools Protocol helper was vendored directly into the repository at `tests/cdp.mjs`. Both test scripts were updated to import relatively from `./tests/cdp.mjs`. In addition, prerequisite detection was added to exit with code 1 with diagnostic instructions if Chromium is not available, preventing missing browser environments from reporting false passes.
- **Did I use AI? For what?** Historically documented as using an AI assistant to vendor the CDP client into `tests/cdp.mjs`, update the relative import paths across test scripts, and adjust `package.json` scripts.
- **Evidence / commit:** Commit [`bcfc2e3`](https://github.com/m7devcore/shopboard/commit/bcfc2e358ca25b641b24e4265c9cad3f47aef330) and commit [`5dfe363`](https://github.com/m7devcore/shopboard/commit/5dfe3637bd988891b2e75fb7fe86361216bffe84).
- **What cannot be verified:** The Git history shows that the absolute path was replaced; it does not record an observed execution failure on a secondary machine prior to the fix.

---

### Issue 3: ESLint Environment Scope and Unused Import Warnings in Test Files

- **What the available records show:** In prior project documentation, it is recorded that running `npm run lint` emitted 11 warnings and errors. In `test-mobile-responsive.mjs`, browser globals (`document`, `window`) were flagged as undefined because the test script ran in Node while evaluating browser expressions via CDP. In `test-state.mjs`, `saveCartToStorage` was flagged as imported without being referenced in an assertion.
- **Type:** Development Tooling & Linter Configuration.
- **How it was found:** Historically documented as observed from `npm run lint` terminal output.
- **Cause:** `eslint.config.js` only defined `globals.browser` for `src/**/*.js`, without defining appropriate mixed Node and Browser global environments for test automation scripts. In `test-state.mjs`, `saveCartToStorage` was exercised indirectly through cart operations but lacked a dedicated direct unit test.
- **Fix:** Configured `eslint.config.js` with separate environment scopes for application code (`src/`) and test scripts (`*.mjs`, `tests/**/*.mjs`). Added a dedicated unit test in `test-state.mjs` asserting direct serialization into `localStorage`.
- **Did I use AI? For what?** Historically documented as using an AI assistant to structure the ESLint flat config environments and add the direct unit test for `saveCartToStorage`.
- **Evidence / commit:** Commit [`d0ce265`](https://github.com/m7devcore/shopboard/commit/d0ce2659a906198ff0a8c4592e2b8b00a8538d28) in `eslint.config.js` and `test-state.mjs`.
- **What cannot be verified:** The exact count of 11 warnings is preserved from the original log; independent terminal logs from that initial run were not committed to Git.

---

## 3. Day 3 Application Bug: Out-of-Stock Product Addition Guard

> **Classification:** This was a genuine runtime application defect, but it occurred during **Day 3** REST API integration, not during Day 2 static development.

- **What the available records show:** When integrating the live course REST API (`https://shopboard-api.vercel.app/api/products`), products with `"in_stock": false` were returned by the backend. The initial Day 3 TypeScript migration (`f1eefbc`) allowed users to click "Add to Cart" on out-of-stock items, incrementing cart quantities for unavailable inventory.
- **Type:** Application Defect (business logic and UI state).
- **How it was found:** Integration testing of the live REST catalog and API schema mapping.
- **Cause:** `addToCart()` in `src/modules/cart/cart.state.ts` only verified that the product ID existed, without inspecting the `inStock` property. Concurrently, `src/modules/products/products.ui.ts` rendered active "Add to Cart" buttons regardless of inventory status.
- **Fix:**
  1. In `src/modules/cart/cart.state.ts`, added a defensive guard to `addToCart`:
     ```typescript
     // Guard against adding out-of-stock items
     if ("inStock" in product && product.inStock === false) {
       return [...cartState];
     }
     ```
  2. In `src/modules/products/products.ui.ts`, updated product card rendering to disable the button, apply an `out-of-stock` class, and display "Out of Stock" for unavailable items.
  3. Added regression assertions in `test-api.mjs` and `test-browser-interaction.mjs` verifying that clicking out-of-stock buttons does not alter cart count.
- **Did I use AI? For what?** Yes, an AI assistant was used to update the state module guard, modify the UI button state, and write the regression test.
- **Evidence / commit:** Commit [`128731b`](https://github.com/m7devcore/shopboard/commit/128731bb9e9e84bb832aa2835465105ea62fc085) (`fix(day3): handle out-of-stock items, dynamic category filter, and card presentation`).
- **What cannot be verified:** The Git history documents the defect and its fix in commit `128731b`; the exact manual or automated prompt that first identified the missing check is not recorded.

---

## 4. Manual Debugging Verification — Cart Quantity and Persistence

> **Classification:** This section documents two confirmed manual verification procedures performed by the student in Brave DevTools (Chromium) on November 4, 2026. These represent **successful verifications of runtime state and persistence**, rather than bug fixes.

### Experiment A — Persistence Across Page Reload

- **Objective:** Verify that cart items and monetary totals persist across a browser page reload.
- **Preconditions:** The cart sidebar drawer was open with a populated cart state containing 7 total units across 2 distinct products:
  - Leather Tote Bag: quantity 4 × $89 = $356.
  - Leather Belt: quantity 3 × $30 = $90.
  - Cart Total: $446.00 ($356 + $90).
- **Procedure:**
  1. Observed the open cart drawer displaying the 7 units across the 2 products and a total of $446.00.
  2. Reloaded the browser tab (`Ctrl + R`).
  3. Reopened the cart drawer and inspected the interface.
  4. Inspected Brave DevTools (Chromium) under **Application → Storage → Local Storage → `http://localhost:5173`**.
- **Observation:**
  - The rendered cart UI retained the exact same 7 units across both products and identical total of $446.00.
  - The `shopboard_cart` entry in Local Storage remained intact with the serialized items payload.
  - This confirmed that `initializeCartState()` correctly restored persistent data upon page reload.

---

### Experiment B — Breakpoint-Based Cart Quantity Tracing

- **Objective:** Trace execution through the event delegation listener into cart state mutation and verify Local Storage synchronization upon clicking the quantity increase button.
- **Target Item:** Product ID `"10"`, **Travel Duffel Bag** (Base Price: $120.00).
- **Initial State:** Quantity = 2, Line Total = $240.00, Cart Total = $240.00.
- **DevTools Setup:**
  1. Opened Brave DevTools (Chromium) to the **Sources** panel.
  2. In the right sidebar, navigated to **Event Listener Breakpoints → Mouse** and enabled the **click** checkbox.
- **Step-by-Step Execution Trace:**
  1. Clicked the `+` (`.cart-qty-increase`) button for the Travel Duffel Bag in the open cart drawer.
  2. The browser automatically paused execution at the beginning of the container's click handler in `src/modules/cart/cart.ui.ts` around line 218:
     ```typescript
     const target = event.target;
     ```
  3. Used `F10` (Step Over) to advance through target identification to line 236:
     ```typescript
     const increaseBtn = target.closest(".cart-qty-increase");
     ```
     The expression evaluated to the active button element containing `data-id="10"`.
  4. Advanced to line 240:
     ```typescript
     increaseQuantity(id);
     ```
  5. Used `F11` (Step Into) to enter `increaseQuantity(productId)` in `src/modules/cart/cart.state.ts` at line 141.
  6. Traced lines 142–145:
     ```typescript
     const item = cartState.find((entry) => entry.id === String(productId));
     if (item) {
       item.quantity += 1;
       saveCartToStorage(cartState);
     }
     ```
  7. In the **Scope** pane under Local variables, observed `item.quantity` increment from `2` to `3`.
  8. Advanced over line 145 to execute the `saveCartToStorage(cartState)` call.
  9. Without resuming script execution, switched to **Application → Storage → Local Storage → `http://localhost:5173`**. Inspected the `shopboard_cart` key and confirmed the serialized JSON reflected the updated quantity:
     ```json
     [
       {
         "id": "10",
         "name": "Travel Duffel Bag",
         "price": 120,
         "quantity": 3
       }
     ]
     ```
  10. Switched back to the Sources panel and pressed `F8` (Resume script execution).
  11. Visually verified the rendered cart interface:
      - The item quantity badge updated to `3`.
      - The line total updated to `$360.00` ($120 × 3).
      - The cart summary total updated from `$240.00` to `$360.00`.

---

## 5. Preventive Engineering Practices

The following patterns were built into the codebase from the initial implementation commit (`d0ce265`). They represent proactive engineering practices derived from established course rules, rather than responses to observed bugs:

1. **Defensive LocalStorage Deserialization (`src/modules/cart/cart.state.ts`):**
   - Wrapped `localStorage.getItem()` and `JSON.parse()` in a `try...catch` block.
   - Used `Array.isArray()` and a custom type guard (`isValidCartItem`) to filter out corrupted strings, non-array objects, or malformed entries, defaulting safely to `[]`.
2. **Array Immutability in Sorting (`src/modules/products/products.logic.ts`):**
   - JavaScript's native `Array.prototype.sort()` mutates arrays in place.
   - To prevent destructive sorting that would permanently alter catalog sequence, `sortProducts()` always shallow-copies the product array (`[...products]`) before applying sort comparators.
3. **Event Delegation on Stable Containers (`src/modules/products/products.ui.ts`, `src/modules/cart/cart.ui.ts`):**
   - Avoided registering click listeners inside rendering functions, which would attach duplicate listeners on every filter change.
   - Registered click listeners once at startup on stable parent containers (`#products-grid`, `#cart-items-container`) and resolved actions dynamically using `event.target.closest()`.
