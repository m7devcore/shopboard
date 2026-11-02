# ShopBoard — AI Agent Instructions

## 1. Project Overview

ShopBoard is an educational frontend web application built as part of the CorePro Software Development Using AI program.

The project focuses on building a clean, responsive, accessible web interface using Vite and vanilla web technologies.

Follow the requirements provided in each development task. Do not assume or implement additional features unless explicitly requested or approved.

## 2. Tech Stack

- Vite (Vanilla JavaScript)
- HTML5
- CSS3 (Mobile-first, zero `!important`)
- JavaScript (ES Modules)
- Quality & Guardrail Tools: Prettier, ESLint, Husky, lint-staged

Use the existing project setup and dependencies. Do not introduce additional frameworks or runtime dependencies without prior approval.

## 3. Core Day 2 Engineering Rules (Derived from Real Day 2 AI Risks)

1. **Rule 1 — Array Immutability in Sorting & Filtering**:
   Never mutate the input product array in-place. Always create a shallow copy (`[...products]`) before sorting so that choosing "Default Order" cleanly restores the original catalog sequence.
2. **Rule 2 — Event Delegation Over Repeated Registration**:
   Never register event listeners inside rendering functions (`renderProducts()`, `renderCartUI()`). Register event listeners once on stable container elements (`#products-grid`, `#cart-items-container`) using event delegation (`event.target.closest()`). Changing category filters 5 times and clicking "Add to Cart" once must add exactly 1 unit.
3. **Rule 3 — Defensive Storage Parsing & Validation**:
   Never trust `localStorage` data blindly. Wrap `JSON.parse()` in a `try...catch` block, verify `Array.isArray()`, sanitize objects (ensuring valid string `id`, valid `name`, numeric `price`, and `quantity > 0`), and fall back safely to `[]` when data is missing or corrupted.
4. **Rule 4 — Single DOM Interaction Owner**:
   Only `src/ui.js` touches the page DOM (`document`, `window`, `querySelector`, `innerHTML`, `addEventListener`). Pure modules like `src/logic.js` must remain 100% deterministic, side-effect free, and runnable in any environment.
5. **Rule 5 — Empirical Verification Integrity**:
   Never claim a test, build, lint, or feature passed without executing the command and inspecting the actual results. Distinguish logic tests from browser interaction tests.

## 4. Coding Standards

### HTML

- Use semantic HTML first (`header`, `nav`, `main`, `section`, `article`, `form`, `footer`, `aside`).
- Only one `h1` per page.
- Every input must have an associated `<label>` linked via `for` and `id`.
- Use native HTML validation whenever appropriate (`required`, `type="email"`, `minlength`).
- Maintain accessible markup with visible focus rings (`:focus-visible`) and ARIA live regions for dynamic announcements.

### CSS

- Follow a mobile-first approach using `min-width` media queries.
- Never use `!important`.
- Keep CSS clean, readable, organized, and free of unnecessary duplication.
- Ensure zero horizontal page overflow across all viewport widths (320px to 1440px).

### JavaScript

- Use vanilla JavaScript and ES Modules.
- Keep functions simple and focused with single responsibilities.
- Use meaningful variable and function names.
- Prefer array methods (`map`, `filter`, `reduce`, `find`) over manual loop counters.

## 5. Modular Architecture & Project Structure

- `index.html` — Main HTML entry point containing semantic landmarks and controls (zero hardcoded product cards).
- `src/data.js` — Product catalog data module only (exports 12 digital products with ID, name, category, price, description, icon).
- `src/logic.js` — Pure functions for searching, filtering, sorting, and calculations (no DOM, document, window, or localStorage access).
- `src/state.js` — Shopping cart state management and safe localStorage persistence.
- `src/ui.js` — All DOM access, dynamic rendering, and UI event handlers (the sole DOM owner).
- `src/main.js` — Application bootstrap importing modules and delegating DOM mounting to `ui.js`.
- `src/style.css` — Application styling following mobile-first CSS without `!important`.
- `public/` — Public static assets.
- `AGENTS.md` — AI development instructions and architectural guidelines.
- `CLAUDE.md` — Project architecture and course instructions for AI agents.
- `debugging-log.md` — Record of bugs, discovery methods, root causes, and fixes in official course format.
- `package.json` — Project configuration and dependencies.

## 6. Where Future Features Belong

- **Wishlist Feature**:
  - `src/state.js`: Wishlist state management and localStorage sync (`shopboard_wishlist`).
  - `src/logic.js`: Pure helpers if needed.
  - `src/ui.js`: Wishlist button rendering and delegated click handlers.
  - `src/main.js`: Stays unchanged.

## 7. Testing & Verification

After every significant implementation or modification:

1. Run `npm run lint` — verify 0 errors and 0 warnings.
2. Run `npm run format:check` — verify Prettier formatting.
3. Run `npm test` — verify Node.js automated test runner tests pass.
4. Run `npm run build` — verify production build succeeds without errors.
5. Verify browser interactions and zero console errors.
6. Verify responsive behavior without horizontal overflow on 320px, 375px, 390px, 430px, 768px, 1440px.
7. Explain verification results truthfully.
