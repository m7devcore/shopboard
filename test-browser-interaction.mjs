import {
  Browser,
  sleep,
} from "file:///C:/Users/minaw/.gemini/config/skills/design-taste-frontend/scripts/lib/cdp.mjs";
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
const browser = await Browser.launch();

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

  // TEST 6: Check for red console exceptions
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
