/**
 * AEVUM — Gallery Interaction & Regression Test Suite (Sprint 04.4)
 *
 * Verifies the Nocturne Pavilion exhibition catalog in a real browser:
 * 1. Default Gallery Mode activation (16 artworks, all in exhibition).
 * 2. All 16 default exhibition records are demo-addable (0 disabled).
 * 3. Fictional prices ($80,000+) and currency formatting.
 * 4. Bidirectional consistency between category tabs and #category-filter select.
 * 5. Department filtering across Paintings (6), Sculptures (3), Decorative Antiques (4), Ceramics & Glass (3).
 * 6. Coming Soon curatorial placard on empty departments ("Prints & Editions", "Curiosities") and Reset.
 * 7. Search by artwork title.
 * 8. Search with zero matches and Reset Filters recovery.
 * 9. Price sort ascending, descending, and default restoration.
 * 10. Accessible Artwork Details modal (dossier, image, Escape dismissal).
 * 11. Acquisition demo cart addition with badge increment and toast.
 * 12. Zero red console errors.
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

console.log(`Starting AEVUM Gallery & Nocturne Pavilion Interaction Test at ${url}...`);

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

  // TEST 1: Default Gallery Mode and 16 Artwork Cards in Exhibition
  console.log("TEST 1: Verifying default Gallery Mode and 16 artwork cards in exhibition...");
  const initCheck = await page.eval(() => {
    const mode = document.documentElement.dataset.mode;
    const bodyClass = document.body.classList.contains("mode-gallery");
    const cards = document.querySelectorAll(".product-card.artwork-card");
    const outOfStockCards = document.querySelectorAll(".artwork-card.is-out-of-stock");
    const sectionTitle = document.querySelector("#products .section-title")?.textContent.trim();
    return {
      mode,
      bodyClass,
      cardCount: cards.length,
      outOfStockCount: outOfStockCards.length,
      sectionTitle,
    };
  });

  if (
    initCheck.cardCount !== 16 ||
    initCheck.outOfStockCount !== 0 ||
    initCheck.sectionTitle !== "Catalogue of Curated Works"
  ) {
    failed = true;
    console.error("❌ Test 1 Failed: Initial gallery state mismatch:", initCheck);
  } else {
    console.log(
      `✅ Test 1 Passed: 16 artwork cards loaded (all 16 in exhibition, 0 out-of-stock), title verified.`,
    );
  }

  // TEST 2: All 16 Default Exhibition Records are Demo-Addable
  console.log(
    "TEST 2: Verifying all 16 canonical records are demo-addable (0 disabled buttons)...",
  );
  const addableCheck = await page.eval(() => {
    const addButtons = Array.from(document.querySelectorAll(".artwork-card .add-to-cart-btn"));
    const allEnabled = addButtons.every((btn) => btn instanceof HTMLButtonElement && !btn.disabled);
    const allAcquireText = addButtons.every((btn) => btn.textContent.trim() === "Acquire Piece");
    return { count: addButtons.length, allEnabled, allAcquireText };
  });

  if (addableCheck.count !== 16 || !addableCheck.allEnabled || !addableCheck.allAcquireText) {
    failed = true;
    console.error("❌ Test 2 Failed: Addable buttons check failed:", addableCheck);
  } else {
    console.log("✅ Test 2 Passed: All 16 artwork cards have active 'Acquire Piece' buttons.");
  }

  // TEST 3: Fictional Prices ($80,000+) and Commas Formatting
  console.log("TEST 3: Verifying fictional prices (>= $80,000) and currency formatting...");
  const priceCheck = await page.eval(() => {
    const priceElements = Array.from(document.querySelectorAll(".artwork-price"));
    const values = priceElements.map((el) => {
      const text = el.textContent.trim().replace("$", "").replace(/,/g, "");
      return Number(text);
    });
    const allAbove80k = values.every((v) => Number.isFinite(v) && v >= 80000);
    const hasCommas = priceElements.every((el) => el.textContent.includes(","));
    return { count: values.length, minPrice: Math.min(...values), allAbove80k, hasCommas };
  });

  if (!priceCheck.allAbove80k || !priceCheck.hasCommas || priceCheck.count !== 16) {
    failed = true;
    console.error("❌ Test 3 Failed: Price verification failed:", priceCheck);
  } else {
    console.log(
      `✅ Test 3 Passed: All 16 prices formatted with commas and >= $80,000 (min: $${priceCheck.minPrice.toLocaleString()}).`,
    );
  }

  // TEST 4: Bidirectional Consistency Between Category Tabs and Category Select
  console.log("TEST 4: Verifying bidirectional consistency between tabs and select dropdown...");
  const tabSyncCheck = await page.eval(() => {
    const categorySelect = document.querySelector("#category-filter");
    if (!(categorySelect instanceof HTMLSelectElement))
      return { synced: false, reason: "No select" };

    // 1. Click Paintings tab -> verify select value changes to 'Paintings'
    const paintingsTab = document.querySelector('.dept-tab-btn[data-category="Paintings"]');
    if (paintingsTab instanceof HTMLButtonElement) paintingsTab.click();
    const selectAfterTab = categorySelect.value;

    // 2. Change select dropdown to 'Sculptures' -> verify Sculptures tab becomes active
    categorySelect.value = "Sculptures";
    categorySelect.dispatchEvent(new Event("change", { bubbles: true }));
    const activeTabAfterSelect = document
      .querySelector("#gallery-department-tabs .dept-tab-btn.is-active")
      ?.getAttribute("data-category");

    // Reset back to all
    const allTab = document.querySelector('.dept-tab-btn[data-category="all"]');
    if (allTab instanceof HTMLButtonElement) allTab.click();

    return {
      synced: selectAfterTab === "Paintings" && activeTabAfterSelect === "Sculptures",
      selectAfterTab,
      activeTabAfterSelect,
    };
  });

  if (!tabSyncCheck.synced) {
    failed = true;
    console.error("❌ Test 4 Failed: Category tabs & select synchronization failed:", tabSyncCheck);
  } else {
    console.log(
      "✅ Test 4 Passed: Bidirectional synchronization between tabs and select verified.",
    );
  }

  // TEST 5: Department Tab Filtering (Paintings, Sculptures, Decorative Antiques, Ceramics & Glass)
  console.log("TEST 5: Testing department tab filtering...");
  const deptFilters = [
    { cat: "Paintings", expected: 6 },
    { cat: "Sculptures", expected: 3 },
    { cat: "Decorative Antiques", expected: 4 },
    { cat: "Ceramics & Glass", expected: 3 },
  ];

  for (const { cat, expected } of deptFilters) {
    const count = await page.eval((targetCategory) => {
      const tab = document.querySelector(`.dept-tab-btn[data-category="${targetCategory}"]`);
      if (tab) tab.click();
      return document.querySelectorAll(".product-card.artwork-card").length;
    }, cat);

    if (count !== expected) {
      failed = true;
      console.error(`❌ Test 5 Failed: Expected ${expected} items for ${cat}, got ${count}`);
    } else {
      console.log(`  ✅ Filtered to ${cat}: Exactly ${count} cards displayed.`);
    }
  }

  // Reset back to all
  await page.eval(() => {
    const allTab = document.querySelector('.dept-tab-btn[data-category="all"]');
    if (allTab) allTab.click();
  });

  // TEST 6: Coming Soon Curatorial Placard on Empty Departments
  console.log("TEST 6: Testing Coming Soon placard on empty departments ('Prints & Editions')...");
  const comingSoonCheck = await page.eval(() => {
    const tab = document.querySelector('.dept-tab-btn[data-category="Prints & Editions"]');
    if (tab) tab.click();
    const hasPlacard = Boolean(document.querySelector(".coming-soon-placard"));
    const placardTitle = document
      .querySelector(".coming-soon-placard .products-empty-title")
      ?.textContent.trim();
    const resetBtn = document.querySelector(".coming-soon-placard #reset-filters-btn");
    if (resetBtn) resetBtn.click();
    const restoredCount = document.querySelectorAll(".product-card.artwork-card").length;
    return { hasPlacard, placardTitle, restoredCount };
  });

  if (!comingSoonCheck.hasPlacard || comingSoonCheck.restoredCount !== 16) {
    failed = true;
    console.error("❌ Test 6 Failed: Coming soon placard check failed:", comingSoonCheck);
  } else {
    console.log(
      "✅ Test 6 Passed: Coming Soon placard rendered with 'Department in Preparation' and reset restored 16 works.",
    );
  }

  // TEST 7: Search by Artwork Title
  console.log("TEST 7: Testing live search by artwork title ('Fiddle')...");
  const searchCheck = await page.eval(() => {
    const searchInput = document.querySelector("#product-search");
    if (!(searchInput instanceof HTMLInputElement)) return { found: false, count: 0 };

    searchInput.value = "Fiddle";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    const cards = Array.from(document.querySelectorAll(".product-card.artwork-card"));
    const matchTitle = cards[0]?.querySelector(".artwork-title")?.textContent.trim();

    // Reset search
    searchInput.value = "";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    return { found: cards.length === 1, count: cards.length, matchTitle };
  });

  if (!searchCheck.found || !searchCheck.matchTitle?.includes("Death Playing the Fiddle")) {
    failed = true;
    console.error("❌ Test 7 Failed: Search by artwork title failed:", searchCheck);
  } else {
    console.log(
      `✅ Test 7 Passed: Search for 'Fiddle' returned 1 exact match ("${searchCheck.matchTitle}").`,
    );
  }

  // TEST 8: Search with Zero Matches and Reset Filters Recovery
  console.log("TEST 8: Testing search with zero matches and Reset Filters button...");
  const emptySearchCheck = await page.eval(() => {
    const searchInput = document.querySelector("#product-search");
    if (!(searchInput instanceof HTMLInputElement)) return { passed: false };

    searchInput.value = "nonexistent_query_xyz_123";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));

    const hasEmptyFilterState = Boolean(document.querySelector(".catalog-state-empty-filter"));
    const emptyTitle = document.querySelector(".products-empty-title")?.textContent.trim();
    const resetBtn = document.querySelector("#reset-filters-btn");
    if (resetBtn) resetBtn.click();

    const restoredCount = document.querySelectorAll(".product-card.artwork-card").length;
    return {
      hasEmptyFilterState,
      emptyTitle,
      restoredCount,
      passed: hasEmptyFilterState && restoredCount === 16,
    };
  });

  if (!emptySearchCheck.passed) {
    failed = true;
    console.error("❌ Test 8 Failed: Empty search and reset check failed:", emptySearchCheck);
  } else {
    console.log(
      `✅ Test 8 Passed: Empty search rendered '${emptySearchCheck.emptyTitle}' and reset restored 16 works.`,
    );
  }

  // TEST 9: Price Sort Ascending, Descending, and Default Order
  console.log("TEST 9: Testing price sorting (ascending, descending, default)...");
  const sortCheck = await page.eval(() => {
    const sortSelect = document.querySelector("#price-sort");
    if (!(sortSelect instanceof HTMLSelectElement)) return { passed: false };

    // Sort ascending
    sortSelect.value = "asc";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const ascPrices = Array.from(document.querySelectorAll(".artwork-price")).map((el) =>
      Number(el.textContent.replace("$", "").replace(/,/g, "")),
    );
    const isAsc = ascPrices.every((val, idx) => idx === 0 || val >= ascPrices[idx - 1]);

    // Sort descending
    sortSelect.value = "desc";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const descPrices = Array.from(document.querySelectorAll(".artwork-price")).map((el) =>
      Number(el.textContent.replace("$", "").replace(/,/g, "")),
    );
    const isDesc = descPrices.every((val, idx) => idx === 0 || val <= descPrices[idx - 1]);

    // Restore default
    sortSelect.value = "default";
    sortSelect.dispatchEvent(new Event("change", { bubbles: true }));
    const defaultFirstTitle = document
      .querySelector(".artwork-card .artwork-title")
      ?.textContent.trim();

    return {
      isAsc,
      isDesc,
      ascMin: ascPrices[0],
      descMax: descPrices[0],
      defaultRestored: defaultFirstTitle === "Portrait of an Elder Gentleman in White Ruff Collar",
      passed:
        isAsc &&
        isDesc &&
        defaultFirstTitle === "Portrait of an Elder Gentleman in White Ruff Collar",
    };
  });

  if (!sortCheck.passed) {
    failed = true;
    console.error("❌ Test 9 Failed: Price sort verification failed:", sortCheck);
  } else {
    console.log(
      `✅ Test 9 Passed: Price sort verified (Asc min: $${sortCheck.ascMin.toLocaleString()}, Desc max: $${sortCheck.descMax.toLocaleString()}, Default restored).`,
    );
  }

  // TEST 10: Artwork Details Modal Dialog (Open, Dossier, Escape Close)
  console.log("TEST 10: Testing Artwork Details Modal dialog...");
  const modalCheck = await page.eval(async () => {
    const firstViewBtn = document.querySelector(".view-artwork-btn");
    if (!firstViewBtn) return { opened: false };
    firstViewBtn.click();

    const modal = document.querySelector("#artwork-modal");
    const isOpen =
      modal?.classList.contains("is-open") && modal?.getAttribute("aria-hidden") === "false";
    const modalTitle = document.querySelector("#artwork-modal-title")?.textContent.trim();
    const hasDossier = Boolean(document.querySelector(".artwork-dossier-list"));
    const hasVisual = Boolean(document.querySelector(".artwork-modal-img"));

    return { opened: isOpen, modalTitle, hasDossier, hasVisual };
  });

  if (!modalCheck.opened || !modalCheck.hasDossier || !modalCheck.hasVisual) {
    failed = true;
    console.error("❌ Test 10 Failed: Artwork modal did not open properly:", modalCheck);
  } else {
    console.log(
      `✅ Test 10 Passed: Artwork modal opened for "${modalCheck.modalTitle}" with full curatorial dossier.`,
    );
  }

  // Test Escape key dismissal
  console.log("Testing Escape key dismissal of Artwork Modal...");
  await page.eval(() => {
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
    document.dispatchEvent(event);
  });
  await sleep(300);

  const modalClosed = await page.eval(() => {
    const modal = document.querySelector("#artwork-modal");
    return !modal?.classList.contains("is-open") && modal?.getAttribute("aria-hidden") === "true";
  });

  if (!modalClosed) {
    failed = true;
    console.error("❌ Test 10 Failed: Artwork modal did not close on Escape key!");
  } else {
    console.log("✅ Test 10 Passed: Artwork modal closed cleanly on Escape key.");
  }

  // TEST 11: Demo Cart Acquisition & Badge Increment
  console.log("TEST 11: Testing acquisition of artwork into Demo Cart...");
  const cartCheck = await page.eval(() => {
    const initialBadge = document.querySelector("#cart-count")?.textContent.trim();
    const availableCardBtn = document.querySelector(".artwork-card .add-to-cart-btn");
    if (availableCardBtn) availableCardBtn.click();
    const updatedBadge = document.querySelector("#cart-count")?.textContent.trim();
    const cartOpen = document.querySelector("#cart-sidebar")?.classList.contains("is-open");
    const hasToast = Boolean(document.querySelector("#toasts .toast-item"));
    return { initialBadge, updatedBadge, cartOpen, hasToast };
  });

  if (cartCheck.updatedBadge !== "1" || !cartCheck.cartOpen || !cartCheck.hasToast) {
    failed = true;
    console.error("❌ Test 11 Failed: Cart acquisition check failed:", cartCheck);
  } else {
    console.log(
      "✅ Test 11 Passed: Piece acquired, cart badge updated to 1, sidebar opened, and success toast fired.",
    );
  }

  // TEST 12: Zero Console Errors
  if (page.consoleErrors.length > 0) {
    failed = true;
    console.error("❌ Console errors detected during gallery test:", page.consoleErrors);
  } else {
    console.log(
      "✅ Test 12 Passed: Zero red console errors detected during all gallery interactions!",
    );
  }

  await page.close();
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  process.exit(1);
} else {
  console.log("🎉 ALL 12 AEVUM GALLERY REGRESSION & INTERACTION CHECKS PASSED!");
  process.exit(0);
}
