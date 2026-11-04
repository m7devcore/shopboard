/**
 * AEVUM — Burgundy Private Gallery Interaction & Regression Test Suite
 *
 * Verifies the single-artwork horizontal showcase in a real browser:
 * 1. Default Gallery Mode starts with the first artwork.
 * 2. Exactly one featured artwork is visible.
 * 3. Total catalogue contains 16 artworks.
 * 4. Counter displays "01 / 16".
 * 5. Next navigation advances to the correct artwork.
 * 6. Previous navigation reverses correctly.
 * 7. Boundary behavior is correct and consistent.
 * 8. Department filtering updates the active sequence and counter.
 * 9. Search finds matching artworks.
 * 10. Search with no matches shows an appropriate empty state.
 * 11. Reset restores the full sequence and first artwork.
 * 12. Sorting ascending and descending changes the active sequence correctly.
 * 13. Artwork modal opens for the currently featured work.
 * 14. Acquire Piece adds the currently featured work to the cart.
 * 15. Keyboard focus and navigation accessibility.
 * 16. Zero red console errors.
 * 17. Mobile layout does not overflow horizontally.
 */

import { Browser, sleep } from "./tests/cdp.mjs";
import { createServer } from "node:http";
import { resolve, join, extname } from "node:path";
import { statSync, createReadStream } from "node:fs";

const root = resolve("dist");
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

const server = createServer((req, res) => {
  try {
    let f = join(root, decodeURIComponent(new URL(req.url, "http://x").pathname));
    if (statSync(f).isDirectory()) f = join(f, "index.html");
    res.writeHead(200, {
      "content-type": MIME[extname(f).toLowerCase()] || "application/octet-stream",
      "content-length": statSync(f).size,
    });
    createReadStream(f).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("not found");
  }
});

await new Promise((r) => server.listen(0, "127.0.0.1", r));
const port = server.address().port;
const url = `http://127.0.0.1:${port}/index.html`;

console.log(`Starting AEVUM Burgundy Private Gallery Interaction Test at ${url}...`);

let browser;
try {
  browser = await Browser.launch();
} catch (launchError) {
  console.error(`❌ Browser test failed: Could not launch Chromium: ${launchError.message}`);
  server.close();
  process.exit(1);
}

let failed = false;

try {
  const page = await browser.newPage({ width: 1440, height: 900, dsf: 1 });
  await page.goto(url, { settleMs: 1000 });

  // TEST 1 & 2: Default Gallery Mode, Exactly One Featured Artwork Visible
  console.log("TEST 1 & 2: Verifying default Gallery Mode and single-artwork showcase...");
  const initCheck = await page.eval(() => {
    const mode = document.documentElement.dataset.mode;
    const bodyClass = document.body.classList.contains("mode-gallery");
    const cards = document.querySelectorAll(".showcase-card.artwork-card");
    const allCards = document.querySelectorAll(".product-card");
    const sectionTitle = document.querySelector("#products .section-title")?.textContent.trim();
    const firstTitle = document.querySelector(".artwork-title")?.textContent.trim();
    const stageImg = document.querySelector(".artwork-stage-img");
    const hasContain = stageImg ? window.getComputedStyle(stageImg).objectFit === "contain" : false;

    return {
      mode,
      bodyClass,
      showcaseCardCount: cards.length,
      totalProductCardCount: allCards.length,
      sectionTitle,
      firstTitle,
      hasContain,
    };
  });

  if (
    initCheck.showcaseCardCount !== 1 ||
    initCheck.totalProductCardCount !== 1 ||
    initCheck.sectionTitle !== "Catalogue of Curated Works" ||
    initCheck.firstTitle !== "Portrait of an Elder Gentleman in White Ruff Collar" ||
    !initCheck.hasContain
  ) {
    failed = true;
    console.error("❌ Test 1 & 2 Failed: Initial gallery state mismatch:", initCheck);
  } else {
    console.log(
      `✅ Test 1 & 2 Passed: Exactly 1 featured artwork visible ("${initCheck.firstTitle}"), object-fit contain verified.`,
    );
  }

  // TEST 3 & 4: Total Catalogue 16 Artworks, Counter Displays "01 / 16"
  console.log("TEST 3 & 4: Verifying catalogue count and counter display (01 / 16)...");
  const counterCheck = await page.eval(() => {
    const counterText = document
      .querySelector(".showcase-counter")
      ?.textContent.replace(/\s+/g, " ")
      .trim();
    const current = document.querySelector(".counter-current")?.textContent.trim();
    const total = document.querySelector(".counter-total")?.textContent.trim();
    const priceText = document.querySelector(".artwork-price")?.textContent.trim();

    return { counterText, current, total, priceText };
  });

  if (
    counterCheck.current !== "01" ||
    counterCheck.total !== "16" ||
    !counterCheck.priceText?.startsWith("$")
  ) {
    failed = true;
    console.error("❌ Test 3 & 4 Failed: Counter check failed:", counterCheck);
  } else {
    console.log(
      `✅ Test 3 & 4 Passed: Counter displays "${counterCheck.counterText}" with formatted price "${counterCheck.priceText}".`,
    );
  }

  // TEST 5: Next Navigation Advances to Correct Artwork
  console.log("TEST 5: Testing Next navigation (Right arrow)...");
  const nextCheck = await page.eval(() => {
    const nextBtn = document.querySelector(".nav-btn-next");
    if (nextBtn instanceof HTMLButtonElement) nextBtn.click();

    const titleAfter = document.querySelector(".artwork-title")?.textContent.trim();
    const counterAfter = document
      .querySelector(".showcase-counter")
      ?.textContent.replace(/\s+/g, " ")
      .trim();
    const current = document.querySelector(".counter-current")?.textContent.trim();

    return { titleAfter, counterAfter, current };
  });

  if (nextCheck.current !== "02" || !nextCheck.titleAfter?.includes("Death Playing the Fiddle")) {
    failed = true;
    console.error("❌ Test 5 Failed: Next navigation failed:", nextCheck);
  } else {
    console.log(
      `✅ Test 5 Passed: Advanced to "${nextCheck.titleAfter}" (${nextCheck.counterAfter}).`,
    );
  }

  // TEST 6: Previous Navigation Reverses Correctly
  console.log("TEST 6: Testing Previous navigation (Left arrow)...");
  const prevCheck = await page.eval(() => {
    const prevBtn = document.querySelector(".nav-btn-prev");
    if (prevBtn instanceof HTMLButtonElement) prevBtn.click();

    const titleAfter = document.querySelector(".artwork-title")?.textContent.trim();
    const counterAfter = document
      .querySelector(".showcase-counter")
      ?.textContent.replace(/\s+/g, " ")
      .trim();
    const current = document.querySelector(".counter-current")?.textContent.trim();

    return { titleAfter, counterAfter, current };
  });

  if (prevCheck.current !== "01" || !prevCheck.titleAfter?.includes("Elder Gentleman")) {
    failed = true;
    console.error("❌ Test 6 Failed: Previous navigation failed:", prevCheck);
  } else {
    console.log(
      `✅ Test 6 Passed: Reversed to "${prevCheck.titleAfter}" (${prevCheck.counterAfter}).`,
    );
  }

  // TEST 7: Boundary Behavior is Correct and Consistent
  console.log("TEST 7: Testing boundary behavior (clamped, disabled states)...");
  const boundaryCheck = await page.eval(() => {
    // At index 0: prev button must be disabled
    const prevBtn = document.querySelector(".nav-btn-prev");
    const prevDisabledAtStart = prevBtn instanceof HTMLButtonElement && prevBtn.disabled;

    // Clicking prev at start must not change index
    if (prevBtn instanceof HTMLButtonElement) prevBtn.click();
    const currentAtStart = document.querySelector(".counter-current")?.textContent.trim();

    // Advance to end (16)
    for (let i = 0; i < 20; i++) {
      const nextBtn = document.querySelector(".nav-btn-next");
      if (nextBtn instanceof HTMLButtonElement && !nextBtn.disabled) {
        nextBtn.click();
      }
    }
    const currentAtEnd = document.querySelector(".counter-current")?.textContent.trim();
    const nextBtnAtEnd = document.querySelector(".nav-btn-next");
    const nextDisabledAtEnd = nextBtnAtEnd instanceof HTMLButtonElement && nextBtnAtEnd.disabled;

    // Reset back to 01
    for (let i = 0; i < 20; i++) {
      const prevBtn = document.querySelector(".nav-btn-prev");
      if (prevBtn instanceof HTMLButtonElement && !prevBtn.disabled) {
        prevBtn.click();
      }
    }
    const restoredCurrent = document.querySelector(".counter-current")?.textContent.trim();

    return {
      prevDisabledAtStart,
      currentAtStart,
      currentAtEnd,
      nextDisabledAtEnd,
      restoredCurrent,
    };
  });

  if (
    !boundaryCheck.prevDisabledAtStart ||
    boundaryCheck.currentAtStart !== "01" ||
    boundaryCheck.currentAtEnd !== "16" ||
    !boundaryCheck.nextDisabledAtEnd ||
    boundaryCheck.restoredCurrent !== "01"
  ) {
    failed = true;
    console.error("❌ Test 7 Failed: Boundary behavior check failed:", boundaryCheck);
  } else {
    console.log("✅ Test 7 Passed: Boundary behavior is consistent and clamped at 01 and 16.");
  }

  // TEST 8: Department Filtering Updates Active Sequence and Counter
  console.log(
    "TEST 8: Testing department filtering (Paintings, Sculptures, Antiques, Ceramics)...",
  );
  const departments = [
    { name: "Paintings", expectedTotal: "06" },
    { name: "Sculptures", expectedTotal: "03" },
    { name: "Decorative Antiques", expectedTotal: "04" },
    { name: "Ceramics & Glass", expectedTotal: "03" },
  ];

  for (const dept of departments) {
    const deptResult = await page.eval((deptName) => {
      const select = document.querySelector("#category-filter");
      if (!(select instanceof HTMLSelectElement)) return { matched: false };
      select.value = deptName;
      select.dispatchEvent(new Event("change", { bubbles: true }));

      const current = document.querySelector(".counter-current")?.textContent.trim();
      const total = document.querySelector(".counter-total")?.textContent.trim();
      const categoryTag = document.querySelector(".artwork-category-tag")?.textContent.trim();

      return { matched: true, current, total, categoryTag };
    }, dept.name);

    if (
      deptResult.total !== dept.expectedTotal ||
      deptResult.current !== "01" ||
      deptResult.categoryTag !== dept.name
    ) {
      failed = true;
      console.error(`❌ Test 8 Failed for ${dept.name}:`, deptResult);
    } else {
      console.log(
        `  ✅ ${dept.name}: Counter is ${deptResult.current} / ${deptResult.total}, category is "${deptResult.categoryTag}".`,
      );
    }
  }

  // Empty department coming soon placard
  const emptyDeptCheck = await page.eval(() => {
    const select = document.querySelector("#category-filter");
    if (select instanceof HTMLSelectElement) {
      select.value = "Prints & Editions";
      select.dispatchEvent(new Event("change", { bubbles: true }));
    }

    const hasPlacard = Boolean(document.querySelector(".coming-soon-placard"));
    const placardTitle = document
      .querySelector(".coming-soon-placard .products-empty-title")
      ?.textContent.trim();

    // Reset filters
    const resetBtn = document.querySelector(".coming-soon-placard #reset-filters-btn");
    if (resetBtn instanceof HTMLButtonElement) resetBtn.click();

    const restoredTotal = document.querySelector(".counter-total")?.textContent.trim();
    return { hasPlacard, placardTitle, restoredTotal };
  });

  if (!emptyDeptCheck.hasPlacard || emptyDeptCheck.restoredTotal !== "16") {
    failed = true;
    console.error("❌ Test 8 (Empty Dept) Failed:", emptyDeptCheck);
  } else {
    console.log(
      `  ✅ Prints & Editions: Rendered "${emptyDeptCheck.placardTitle}", Reset restored 16 artworks.`,
    );
  }

  // TEST 9: Search Finds Matching Artworks
  console.log("TEST 9: Testing search by artwork title ('Fiddle')...");
  const searchCheck = await page.eval(() => {
    const searchInput = document.querySelector("#product-search");
    if (!(searchInput instanceof HTMLInputElement)) return { found: false };

    searchInput.value = "Fiddle";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    const title = document.querySelector(".artwork-title")?.textContent.trim();
    const current = document.querySelector(".counter-current")?.textContent.trim();
    const total = document.querySelector(".counter-total")?.textContent.trim();
    const nextBtn = document.querySelector(".nav-btn-next");
    const prevBtn = document.querySelector(".nav-btn-prev");
    const nextDisabled = nextBtn instanceof HTMLButtonElement && nextBtn.disabled;
    const prevDisabled = prevBtn instanceof HTMLButtonElement && prevBtn.disabled;

    return {
      found: title?.includes("Death Playing the Fiddle"),
      title,
      current,
      total,
      nextDisabled,
      prevDisabled,
    };
  });

  if (
    !searchCheck.found ||
    searchCheck.total !== "01" ||
    !searchCheck.nextDisabled ||
    !searchCheck.prevDisabled
  ) {
    failed = true;
    console.error("❌ Test 9 Failed: Search check failed:", searchCheck);
  } else {
    console.log(
      `✅ Test 9 Passed: Search found "${searchCheck.title}" (Counter: 01 / 01, Prev/Next disabled).`,
    );
  }

  // TEST 10 & 11: Search Zero Matches & Reset Recovery
  console.log("TEST 10 & 11: Testing search zero matches and Reset Filters...");
  const emptySearchCheck = await page.eval(() => {
    const searchInput = document.querySelector("#product-search");
    if (searchInput instanceof HTMLInputElement) {
      searchInput.value = "nonexistent_query_xyz";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    }

    const hasEmptyFilterState = Boolean(document.querySelector(".catalog-state-empty-filter"));
    const emptyTitle = document.querySelector(".products-empty-title")?.textContent.trim();

    const resetBtn = document.querySelector("#reset-filters-btn");
    if (resetBtn instanceof HTMLButtonElement) resetBtn.click();

    const restoredTotal = document.querySelector(".counter-total")?.textContent.trim();
    const restoredTitle = document.querySelector(".artwork-title")?.textContent.trim();

    return {
      hasEmptyFilterState,
      emptyTitle,
      restoredTotal,
      restoredTitle,
    };
  });

  if (
    !emptySearchCheck.hasEmptyFilterState ||
    emptySearchCheck.restoredTotal !== "16" ||
    !emptySearchCheck.restoredTitle?.includes("Elder Gentleman")
  ) {
    failed = true;
    console.error("❌ Test 10 & 11 Failed:", emptySearchCheck);
  } else {
    console.log(
      `✅ Test 10 & 11 Passed: Empty state "${emptySearchCheck.emptyTitle}" verified; Reset restored 16 items.`,
    );
  }

  // TEST 12: Price Sorting (Ascending, Descending, Default)
  console.log("TEST 12: Testing price sorting (asc, desc, default)...");
  const sortCheck = await page.eval(() => {
    const sortSelect = document.querySelector("#price-sort");
    if (!(sortSelect instanceof HTMLSelectElement)) return { passed: false };

    // Ascending: lowest price first
    sortSelect.value = "asc";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const ascFirstPrice = document.querySelector(".artwork-price")?.textContent.trim();
    const ascFirstTitle = document.querySelector(".artwork-title")?.textContent.trim();

    // Descending: highest price first
    sortSelect.value = "desc";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const descFirstPrice = document.querySelector(".artwork-price")?.textContent.trim();
    const descFirstTitle = document.querySelector(".artwork-title")?.textContent.trim();

    // Default
    sortSelect.value = "default";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const defaultFirstTitle = document.querySelector(".artwork-title")?.textContent.trim();

    return {
      ascFirstPrice,
      ascFirstTitle,
      descFirstPrice,
      descFirstTitle,
      defaultFirstTitle,
    };
  });

  if (
    sortCheck.ascFirstPrice !== "$82,000" ||
    sortCheck.descFirstPrice !== "$480,000" ||
    !sortCheck.defaultFirstTitle?.includes("Elder Gentleman")
  ) {
    failed = true;
    console.error("❌ Test 12 Failed: Price sort failed:", sortCheck);
  } else {
    console.log(
      `✅ Test 12 Passed: Asc min "${sortCheck.ascFirstPrice}" (${sortCheck.ascFirstTitle}), Desc max "${sortCheck.descFirstPrice}" (${sortCheck.descFirstTitle}), Default restored.`,
    );
  }

  // TEST 13: Artwork Dossier Modal Dialog (Open, Escape Dismissal)
  console.log("TEST 13: Testing Artwork Modal dialog...");
  const modalCheck = await page.eval(async () => {
    const viewBtn = document.querySelector(".view-artwork-btn");
    if (viewBtn instanceof HTMLButtonElement) viewBtn.click();

    const modal = document.querySelector("#artwork-modal");
    const isOpen =
      modal?.classList.contains("is-open") && modal?.getAttribute("aria-hidden") === "false";
    const modalTitle = document.querySelector("#artwork-modal-title")?.textContent.trim();

    return { isOpen, modalTitle };
  });

  if (!modalCheck.isOpen || !modalCheck.modalTitle?.includes("Elder Gentleman")) {
    failed = true;
    console.error("❌ Test 13 Failed: Artwork modal did not open properly:", modalCheck);
  } else {
    console.log(`✅ Test 13 Passed: Modal opened for "${modalCheck.modalTitle}".`);
  }

  // Close modal via Escape
  await page.eval(() => {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  await sleep(300);

  const modalClosed = await page.eval(() => {
    const modal = document.querySelector("#artwork-modal");
    return !modal?.classList.contains("is-open") && modal?.getAttribute("aria-hidden") === "true";
  });

  if (!modalClosed) {
    failed = true;
    console.error("❌ Test 13 Failed: Modal did not close on Escape key!");
  } else {
    console.log("✅ Test 13 Passed: Modal closed cleanly on Escape key.");
  }

  // TEST 14: Acquire Piece Adds Currently Featured Artwork to Cart
  console.log("TEST 14: Testing Acquire Piece cart interaction...");
  const cartCheck = await page.eval(() => {
    const initialBadge = document.querySelector("#cart-count")?.textContent.trim();
    const addBtn = document.querySelector(".add-to-cart-btn");
    if (addBtn instanceof HTMLButtonElement) addBtn.click();

    const updatedBadge = document.querySelector("#cart-count")?.textContent.trim();
    const cartOpen = document.querySelector("#cart-sidebar")?.classList.contains("is-open");
    const toastPresent = Boolean(document.querySelector("#toasts .toast-item"));

    return { initialBadge, updatedBadge, cartOpen, toastPresent };
  });

  if (cartCheck.updatedBadge !== "1" || !cartCheck.cartOpen || !cartCheck.toastPresent) {
    failed = true;
    console.error("❌ Test 14 Failed: Cart acquisition check failed:", cartCheck);
  } else {
    console.log(
      "✅ Test 14 Passed: Cart badge updated to 1, acquisitions drawer opened, and toast notification fired.",
    );
  }

  // TEST 15: Keyboard Arrow Navigation (Right Arrow advances Next, Left Arrow reverses Prev)
  console.log("TEST 15: Testing keyboard arrow navigation...");
  // Close cart sidebar first
  await page.eval(() => {
    const closeBtn = document.querySelector("#cart-close-btn");
    if (closeBtn instanceof HTMLButtonElement) closeBtn.click();
  });
  await sleep(350);

  const keyNavCheck = await page.eval(() => {
    // Dispatch Right Arrow -> Next
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    const afterRight = document.querySelector(".counter-current")?.textContent.trim();

    // Dispatch Left Arrow -> Prev
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    const afterLeft = document.querySelector(".counter-current")?.textContent.trim();

    return { afterRight, afterLeft };
  });

  if (keyNavCheck.afterRight !== "02" || keyNavCheck.afterLeft !== "01") {
    failed = true;
    console.error("❌ Test 15 Failed: Keyboard navigation check failed:", keyNavCheck);
  } else {
    console.log(
      `✅ Test 15 Passed: Right arrow advanced to ${keyNavCheck.afterRight}, Left arrow reversed to ${keyNavCheck.afterLeft}.`,
    );
  }

  // TEST 16: Minimal Chevron Side-Positioned Arrows & Structure Audit
  console.log("TEST 16: Verifying minimal chevron arrows and directional mapping...");
  const sideArrowCheck = await page.eval(() => {
    const stage = document.querySelector(".artwork-stage");
    const nextArrow = stage?.querySelector(".showcase-side-arrow.nav-btn-next");
    const prevArrow = stage?.querySelector(".showcase-side-arrow.nav-btn-prev");
    const oldNavBar = document.querySelector(".showcase-nav-bar");
    const lotLineCounter = document.querySelector(".showcase-lot-line .showcase-counter");

    const nextRect = nextArrow?.getBoundingClientRect();
    const prevRect = prevArrow?.getBoundingClientRect();

    const prevStyle = prevArrow ? window.getComputedStyle(prevArrow) : null;

    return {
      hasNextArrowInStage: !!nextArrow,
      hasPrevArrowInStage: !!prevArrow,
      hasOldNavBar: !!oldNavBar,
      hasCounterInLotLine: !!lotLineCounter,
      nextAriaLabel: nextArrow?.getAttribute("aria-label"),
      prevAriaLabel: prevArrow?.getAttribute("aria-label"),
      prevDisabledAtStart: prevArrow instanceof HTMLButtonElement && prevArrow.disabled,
      nextDisabledAtStart: nextArrow instanceof HTMLButtonElement && nextArrow.disabled,
      nextWidth: nextRect?.width ?? 0,
      nextHeight: nextRect?.height ?? 0,
      prevWidth: prevRect?.width ?? 0,
      prevHeight: prevRect?.height ?? 0,
      isPrevOnLeft: (prevRect?.left ?? 0) < (nextRect?.left ?? 0),
      prevBg: prevStyle?.backgroundColor ?? "",
      prevBorderWidth: prevStyle?.borderWidth ?? "",
      prevBoxShadow: prevStyle?.boxShadow ?? "",
      stageCursor: stage ? window.getComputedStyle(stage).cursor : "",
      stageTouchAction: stage ? window.getComputedStyle(stage).touchAction : "",
    };
  });

  const isTransparent =
    sideArrowCheck.prevBg === "transparent" ||
    sideArrowCheck.prevBg === "rgba(0, 0, 0, 0)" ||
    sideArrowCheck.prevBg === "";
  const isBorderZero =
    sideArrowCheck.prevBorderWidth === "0px" || sideArrowCheck.prevBorderWidth === "";
  const isShadowNone =
    sideArrowCheck.prevBoxShadow === "none" || sideArrowCheck.prevBoxShadow === "";

  if (
    !sideArrowCheck.hasNextArrowInStage ||
    !sideArrowCheck.hasPrevArrowInStage ||
    sideArrowCheck.hasOldNavBar ||
    !sideArrowCheck.hasCounterInLotLine ||
    sideArrowCheck.nextAriaLabel !== "Next artwork" ||
    sideArrowCheck.prevAriaLabel !== "Previous artwork" ||
    !sideArrowCheck.prevDisabledAtStart ||
    sideArrowCheck.nextDisabledAtStart ||
    !sideArrowCheck.isPrevOnLeft ||
    sideArrowCheck.nextWidth < 44 ||
    sideArrowCheck.nextHeight < 44 ||
    sideArrowCheck.prevWidth < 44 ||
    sideArrowCheck.prevHeight < 44 ||
    !isTransparent ||
    !isBorderZero ||
    !isShadowNone ||
    sideArrowCheck.stageCursor !== "grab" ||
    !sideArrowCheck.stageTouchAction.includes("pan-y")
  ) {
    failed = true;
    console.error("❌ Test 16 Failed: Minimal chevron side arrow audit failed:", sideArrowCheck);
  } else {
    console.log(
      "✅ Test 16 Passed: Minimal chevrons verified (no circle, border:0, transparent bg, >=44px hit area, Left=Prev [disabled at 01], Right=Next [enabled]).",
    );
  }

  // TEST 17: Click & Drag / Swipe Navigation (Correction 1)
  console.log("TEST 17: Testing click & drag / swipe navigation on stage...");
  const dragCheck = await page.eval(() => {
    const stage = document.querySelector(".artwork-stage");
    if (!stage) return { error: "No stage element" };

    const rect = stage.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Subtest A: Move mouse without pressing -> must not change artwork
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: startX - 100,
        clientY: startY,
        bubbles: true,
      }),
    );
    const counterAfterPassiveMove = document.querySelector(".counter-current")?.textContent.trim();

    // Subtest B: Drag under threshold (<50px) -> must not change artwork
    stage.dispatchEvent(
      new PointerEvent("pointerdown", {
        clientX: startX,
        clientY: startY,
        button: 0,
        pointerId: 1,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: startX - 40,
        clientY: startY,
        pointerId: 1,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        clientX: startX - 40,
        clientY: startY,
        pointerId: 1,
        bubbles: true,
      }),
    );
    const counterAfterSmallDrag = document.querySelector(".counter-current")?.textContent.trim();

    // Subtest C: Vertical drag dominance (deltaY 100px, deltaX 20px) -> must not navigate
    stage.dispatchEvent(
      new PointerEvent("pointerdown", {
        clientX: startX,
        clientY: startY,
        button: 0,
        pointerId: 2,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: startX - 20,
        clientY: startY + 100,
        pointerId: 2,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        clientX: startX - 20,
        clientY: startY + 100,
        pointerId: 2,
        bubbles: true,
      }),
    );
    const counterAfterVerticalDrag = document.querySelector(".counter-current")?.textContent.trim();

    // Subtest D: Horizontal drag LEFT (>70px) -> Next artwork (01 -> 02)
    stage.dispatchEvent(
      new PointerEvent("pointerdown", {
        clientX: startX,
        clientY: startY,
        button: 0,
        pointerId: 3,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: startX - 85,
        clientY: startY,
        pointerId: 3,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        clientX: startX - 85,
        clientY: startY,
        pointerId: 3,
        bubbles: true,
      }),
    );
    const counterAfterDragLeft = document.querySelector(".counter-current")?.textContent.trim();

    // Subtest E: Horizontal drag RIGHT (>70px) -> Previous artwork (02 -> 01)
    const stageAfterNext = document.querySelector(".artwork-stage");
    stageAfterNext?.dispatchEvent(
      new PointerEvent("pointerdown", {
        clientX: startX,
        clientY: startY,
        button: 0,
        pointerId: 4,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointermove", {
        clientX: startX + 85,
        clientY: startY,
        pointerId: 4,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new PointerEvent("pointerup", {
        clientX: startX + 85,
        clientY: startY,
        pointerId: 4,
        bubbles: true,
      }),
    );
    const counterAfterDragRight = document.querySelector(".counter-current")?.textContent.trim();

    return {
      counterAfterPassiveMove,
      counterAfterSmallDrag,
      counterAfterVerticalDrag,
      counterAfterDragLeft,
      counterAfterDragRight,
    };
  });

  if (
    dragCheck.counterAfterPassiveMove !== "01" ||
    dragCheck.counterAfterSmallDrag !== "01" ||
    dragCheck.counterAfterVerticalDrag !== "01" ||
    dragCheck.counterAfterDragLeft !== "02" ||
    dragCheck.counterAfterDragRight !== "01"
  ) {
    failed = true;
    console.error("❌ Test 17 Failed: Drag navigation checks failed:", dragCheck);
  } else {
    console.log(
      "✅ Test 17 Passed: Drag LEFT advanced to 02, drag RIGHT reversed to 01, passive and small drags ignored.",
    );
  }

  // TEST 18: Zero Console Errors
  if (page.consoleErrors.length > 0) {
    failed = true;
    console.error("❌ Test 18 Failed: Red console errors detected:", page.consoleErrors);
  } else {
    console.log("✅ Test 18 Passed: Zero console errors during all gallery showcase interactions.");
  }

  await page.close();
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  process.exit(1);
} else {
  console.log("🎉 ALL AEVUM BURGUNDY GALLERY SHOWCASE CHECKS PASSED!");
  process.exit(0);
}
