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

console.log(`Starting Browser & UI Interaction Test at ${url}...`);

let browser;
try {
  browser = await Browser.launch();
} catch (launchError) {
  console.error(`❌ Browser test failed: Could not launch Chromium: ${launchError.message}`);
  console.error(
    "Prerequisite: To run browser interaction tests, install Google Chrome / Edge or set the CHROME_PATH environment variable.",
  );
  server.close();
  process.exit(1);
}

let failed = false;

try {
  const page = await browser.newPage({ width: 1280, height: 800, dsf: 1 });

  await page.goto(url, { settleMs: 800 });

  // TEST 1: Change category filter 5 times, click Add to Cart once, verify exactly ONE unit is added
  console.log("Testing 5 category filter changes followed by 1 Add-to-Cart click...");
  const addCount = await page.eval(async () => {
    const categorySelect = document.querySelector("#category-filter");
    const categories = ["Templates", "Planners", "Productivity", "Templates", "all"];

    for (const cat of categories) {
      categorySelect.value = cat;
      categorySelect.dispatchEvent(new Event("change", { bubbles: true }));
    }

    // Now click Add to Cart on the first card
    const firstAddBtn = document.querySelector(".add-to-cart-btn");
    if (!firstAddBtn) throw new Error("No add to cart button found");
    firstAddBtn.click();

    // Read cart badge and cart items
    const badge = document.querySelector("#cart-count").textContent.trim();
    const cartItems = JSON.parse(localStorage.getItem("shopboard_cart") || "[]");
    return { badge, cartItems };
  });

  if (
    addCount.badge !== "1" ||
    addCount.cartItems.length !== 1 ||
    addCount.cartItems[0].quantity !== 1
  ) {
    failed = true;
    console.error(
      `❌ Event listener duplication detected! Expected quantity 1, got badge=${addCount.badge}, items=`,
      addCount.cartItems,
    );
  } else {
    console.log("✅ Exactly 1 unit added after 5 filter changes!");
  }

  // TEST 2: Add same item again -> quantity increments to 2
  console.log("Testing adding same item again (quantity increment)...");
  const qtyAfterSecondAdd = await page.eval(() => {
    const firstAddBtn = document.querySelector(".add-to-cart-btn");
    firstAddBtn.click();
    const cartItems = JSON.parse(localStorage.getItem("shopboard_cart") || "[]");
    return cartItems[0].quantity;
  });

  if (qtyAfterSecondAdd !== 2) {
    failed = true;
    console.error(`❌ Expected quantity 2 after second add, got ${qtyAfterSecondAdd}`);
  } else {
    console.log("✅ Quantity incremented to 2 for same product!");
  }

  // TEST 3: Decrease quantity, test zero removal
  console.log("Testing decrease quantity and removal at zero...");
  const qtyAfterDecrease = await page.eval(() => {
    const btn1 = document.querySelector(".cart-qty-decrease");
    btn1.click(); // 2 -> 1
    const q1 = JSON.parse(localStorage.getItem("shopboard_cart") || "[]")[0].quantity;
    const btn2 = document.querySelector(".cart-qty-decrease");
    btn2.click(); // 1 -> 0 (removed)
    const cartAfterZero = JSON.parse(localStorage.getItem("shopboard_cart") || "[]");
    return { q1, empty: cartAfterZero.length === 0 };
  });

  if (qtyAfterDecrease.q1 !== 1 || !qtyAfterDecrease.empty) {
    failed = true;
    console.error(`❌ Decrease/removal failed:`, qtyAfterDecrease);
  } else {
    console.log("✅ Decrease to 1 and removal at zero passed!");
  }

  // TEST 4: Page refresh with cart item
  console.log("Testing cart survival across page reload...");
  await page.eval(() => {
    const firstAddBtn = document.querySelector(".add-to-cart-btn");
    firstAddBtn.click();
  });
  await sleep(100);
  await page.goto(url, { settleMs: 800 });
  const restoredCart = await page.eval(() => {
    const badge = document.querySelector("#cart-count").textContent.trim();
    const cartItems = JSON.parse(localStorage.getItem("shopboard_cart") || "[]");
    return { badge, count: cartItems.length, qty: cartItems[0]?.quantity };
  });

  if (restoredCart.badge !== "1" || restoredCart.count !== 1 || restoredCart.qty !== 1) {
    failed = true;
    console.error(`❌ Cart did not survive page reload!`, restoredCart);
  } else {
    console.log("✅ Cart survived page reload perfectly!");
  }

  // TEST 5: Clear Cart
  console.log("Testing Clear Cart button...");
  const afterClear = await page.eval(() => {
    const clearBtn = document.querySelector("#clear-cart-btn");
    clearBtn.click();
    const badge = document.querySelector("#cart-count").textContent.trim();
    const stored = JSON.parse(localStorage.getItem("shopboard_cart") || "[]");
    return { badge, storedCount: stored.length };
  });

  if (afterClear.badge !== "0" || afterClear.storedCount !== 0) {
    failed = true;
    console.error(`❌ Clear cart failed:`, afterClear);
  } else {
    console.log("✅ Clear cart emptied localStorage and reset count to 0!");
  }

  // TEST 6: Day 3 — Empty search/filter state & Reset Filters button
  console.log("Testing empty search-result state and Reset Filters button...");
  for (let i = 0; i < 15; i++) {
    const readyCount = await page.eval(() => document.querySelectorAll(".product-card").length);
    if (readyCount === 12) break;
    await sleep(200);
  }
  const filterEmptyCheck = await page.eval(() => {
    const searchInput = document.querySelector("#product-search");
    searchInput.value = "nonexistent_product_xyz";
    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    const hasEmptyFilterState = Boolean(document.querySelector(".catalog-state-empty-filter"));
    const resetBtn = document.querySelector("#reset-filters-btn");
    if (resetBtn) resetBtn.click();
    const cardCountAfterReset = document.querySelectorAll(".product-card").length;
    return { hasEmptyFilterState, cardCountAfterReset };
  });

  if (!filterEmptyCheck.hasEmptyFilterState || filterEmptyCheck.cardCountAfterReset !== 12) {
    failed = true;
    console.error("❌ Empty filter state or Reset Filters failed:", filterEmptyCheck);
  } else {
    console.log("✅ Empty search-result state and Reset Filters passed!");
  }

  // TEST 7: Day 3 — Empty API state (distinct from empty search state)
  console.log("Testing Empty API state (?api_mode=empty)...");
  await page.goto(`${url}?api_mode=empty`, { settleMs: 1000 });
  const emptyApiCheck = await page.eval(() => {
    return {
      hasEmptyApiState: Boolean(document.querySelector(".catalog-state-empty-api")),
      hasEmptyFilterState: Boolean(document.querySelector(".catalog-state-empty-filter")),
    };
  });

  if (!emptyApiCheck.hasEmptyApiState || emptyApiCheck.hasEmptyFilterState) {
    failed = true;
    console.error("❌ Empty API state check failed:", emptyApiCheck);
  } else {
    console.log("✅ Empty API state rendered distinctly from empty filter state!");
  }

  // TEST 8: Day 3 — Error state, Error Toast, and working Retry button (?api_mode=fail_once)
  console.log("Testing API Error state, Error Toast, and Retry recovery (?api_mode=fail_once)...");
  await page.goto(`${url}?api_mode=fail_once`, { settleMs: 1000 });
  const errorStateCheck = await page.eval(() => {
    const hasErrorCard = Boolean(document.querySelector(".catalog-state-error"));
    const hasErrorToast = Boolean(document.querySelector("#toasts .toast-error"));
    const retryBtn = document.querySelector("#retry-fetch-btn");
    if (retryBtn) retryBtn.click();
    return { hasErrorCard, hasErrorToast, clickedRetry: Boolean(retryBtn) };
  });

  await sleep(1000);
  const retryRecoveryCount = await page.eval(() => {
    return document.querySelectorAll(".product-card").length;
  });

  if (
    !errorStateCheck.hasErrorCard ||
    !errorStateCheck.hasErrorToast ||
    !errorStateCheck.clickedRetry ||
    retryRecoveryCount !== 12
  ) {
    failed = true;
    console.error("❌ Error state or Retry recovery failed:", {
      errorStateCheck,
      retryRecoveryCount,
    });
  } else {
    console.log("✅ Error state, Error Toast, and Retry recovery (12 products loaded) passed!");
  }

  // TEST 9: Check for red console exceptions
  if (page.consoleErrors.length > 0) {
    failed = true;
    console.error("❌ Console errors detected:", page.consoleErrors);
  } else {
    console.log("✅ Zero red console errors detected during all interactions!");
  }

  await page.close();
} finally {
  await browser.close();
  server.close();
}

if (failed) {
  process.exit(1);
} else {
  console.log("🎉 ALL BROWSER & UI INTERACTION CHECKS PASSED!");
  process.exit(0);
}
