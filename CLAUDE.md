# AEVUM / ShopBoard — AI Developer Guide (Claude)

This document provides a concise operational reference for AI agents working in this repository. Detailed engineering specifications and historical evidence are maintained in [`AGENTS.md`](./AGENTS.md) and [`debugging-log.md`](./debugging-log.md).

---

## 1. Project Identity & Operating Modes

AEVUM / ShopBoard is an educational fine art gallery and digital exhibition storefront built with strict TypeScript, Vite 8, and vanilla web standards with zero UI frameworks. It operates in two isolated catalog modes:

1. **Default Gallery Mode (`/`):**
   - The primary exhibition experience featuring the AEVUM Burgundy Private Gallery single-artwork showcase, curatorial dossiers, minimal chevrons, drag/swipe navigation, and acquisitions drawer.
   - Self-contained and 100% local: loads strictly from `src/modules/artworks/artworks.data.ts` (16 canonical artworks). Zero external network calls.
2. **Course Mode (`/index.html?mode=course`):**
   - The preserved CorePro Day 2/Day 3 ShopBoard digital products storefront.
   - Integrates with the live REST API (`https://shopboard-api.vercel.app/api/products`), category dropdown filter, search, sort toolbar, and cart operations.

---

## 2. Essential Engineering Rules (Cross-Reference to AGENTS.md)

All engineering rules in this repository originate from verified project defects and lessons learned. For full rationales, code examples, and historical citations, see [`AGENTS.md` Section 6](./AGENTS.md#6-engineering-rules-grounded-in-real-project-mistakes) and [`debugging-log.md`](./debugging-log.md):

| Rule                                                        | Summary & Action Required                                                                                                                                                                  | Canonical Reference                                                                                                                                                                                                                          |
| :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Rule 1: Re-Query DOM in Tests**                           | Never reuse DOM element references across actions that re-render markup (`innerHTML`). Always re-query elements from the active document tree before dispatching events.                   | [`AGENTS.md` Rule 1](./AGENTS.md#rule-1-always-re-query-dom-elements-in-test-harnesses-after-state-changes) & [`debugging-log.md` Sec 2.1](./debugging-log.md#issue-1-detached-dom-element-reference-in-automated-cart-test)                 |
| **Rule 2: Relative Test Imports**                           | Keep test harnesses portable and vendored directly in the repo (`tests/cdp.mjs`). Never use machine-specific absolute file paths in test imports.                                          | [`AGENTS.md` Rule 2](./AGENTS.md#rule-2-keep-test-harnesses-self-contained-with-relative-imports) & [`debugging-log.md` Sec 2.2](./debugging-log.md#issue-2-machine-specific-absolute-import-path-in-browser-test-harness)                   |
| **Rule 3: Scoped ESLint Environments**                      | Define separate environment scopes in `eslint.config.js`: browser globals for application code (`src/`), and mixed Node plus browser globals for test scripts (`*.mjs`, `tests/**/*.mjs`). | [`AGENTS.md` Rule 3](./AGENTS.md#rule-3-configure-separate-eslint-scopes-for-application-and-test-environments) & [`debugging-log.md` Sec 2.3](./debugging-log.md#issue-3-eslint-environment-scope-and-unused-import-warnings-in-test-files) |
| **Rule 4: Never Ignore Source TypeScript**                  | Never exclude application source code from linters to bypass CLI issues. Run `@typescript/typescript6` for ESLint AST compatibility alongside native `tsc`.                                | [`AGENTS.md` Rule 4](./AGENTS.md#rule-4-never-exclude-application-code-from-linters-to-hide-compatibility-hurdles) (Fix 01, commit `8cbb5cc`)                                                                                                |
| **Rule 5: Guard Out-of-Stock REST Inventory**               | During Day 3 live REST integration, guard against adding unavailable items (`in_stock: false`) at both state (`addToCart`) and UI (disabled button) layers.                                | [`AGENTS.md` Rule 5](./AGENTS.md#rule-5-guard-business-logic-against-out-of-stock-rest-inventory-day-3-defect) & [`debugging-log.md` Sec 3](./debugging-log.md#3-day-3-application-bug-out-of-stock-product-addition-guard)                  |
| **Rule 6: Mobile-First CSS Architecture**                   | Base styles must be mobile-first without media queries. Use `@media (min-width: ...)` for progressive enhancement. Strictly zero `max-width` media queries permitted.                      | [`AGENTS.md` Rule 6](./AGENTS.md#rule-6-convert-all-responsive-overrides-to-mobile-first-min-width-rules) (Fix 03, commit `10a470d`)                                                                                                         |
| **Rule 7: Isolate Modes & Preserve Gallery Data**           | Keep all 16 canonical gallery artworks active (`inStock: true`, `saleStatus: "In Exhibition"`). Keep Gallery Mode 100% local; the course REST API belongs strictly to Course Mode.         | [`AGENTS.md` Rule 7](./AGENTS.md#rule-7-preserve-ground-truth-canonical-data-and-isolate-application-modes)                                                                                                                                  |
| **Rule 8: Verify Source & Live DOM (Preventive Safeguard)** | Proactive verification safeguard: always inspect active source files, run tests, and check live browser DOM before reporting findings or diagnosing issues.                                | [`AGENTS.md` Rule 8](./AGENTS.md#rule-8-reconcile-source-code-and-running-dom-before-reporting-findings-preventive-safeguard)                                                                                                                |

---

## 3. Preventive Engineering Safeguards

The following defensive coding conventions are proactively enforced across the codebase (see [`AGENTS.md` Section 5](./AGENTS.md#5-preventive-engineering-safeguards)):

- **Array Immutability:** Never mutate input arrays in pure logic. Always shallow-copy (`[...products]`) before sorting or filtering.
- **Defensive Storage Deserialization:** Always wrap `localStorage.getItem()` and `JSON.parse()` in `try...catch`, check `Array.isArray()`, filter through schema type guards (`isValidCartItem`), and fall back safely to `[]`.
- **Event Delegation on Stable Containers:** Never bind click listeners inside render functions. Attach listeners once on stable parent containers (`#products-grid`, `#cart-items-container`, `#gallery-department-tabs`) and resolve targets with `event.target.closest()`.
- **Strict DOM Isolation & Logic Purity:** Only presentation modules (`*.ui.ts`, `artworks.showcase.ts`, `src/ui.ts`, `src/shared/ui/toast.ts`) touch the DOM. Pure logic modules (`*.logic.ts`) must remain 100% deterministic and free of browser DOM APIs.
- **Strict TypeScript Hygiene:** Prohibited: `any`, unsafe `as` type assertions, and postfix `!` non-null assertions. Use runtime type guards and discriminated unions.
- **Scope Discipline:** Never modify unrelated files, redesign unrequested sections, or alter verified artwork data.

---

## 4. Verification Commands

Before completing any task, execute the full quality verification suite as defined in [`AGENTS.md` Section 7](./AGENTS.md#7-testing--quality-verification-suite):

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
