import { Browser, sleep } from "./tests/cdp.mjs";
import { createServer } from "node:http";
import { resolve, join, extname } from "node:path";
import { statSync, createReadStream, mkdirSync } from "node:fs";

const outDir = resolve(".taste-skill/mobile-audit");
mkdirSync(outDir, { recursive: true });

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

const viewports = [
  { name: "iphone-se-320", width: 320, height: 640 },
  { name: "iphone-se2-375", width: 375, height: 667 },
  { name: "iphone-14-390", width: 390, height: 844 },
  { name: "iphone-promax-430", width: 430, height: 932 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1440", width: 1440, height: 900 },
];

console.log(`Starting Mobile & Responsive Audit at ${url}...`);

let browser;
try {
  browser = await Browser.launch();
} catch (launchError) {
  console.error(
    `❌ Mobile responsive audit failed: Could not launch Chromium: ${launchError.message}`,
  );
  console.error(
    "Prerequisite: To run responsive audit tests, install Google Chrome / Edge or set the CHROME_PATH environment variable.",
  );
  server.close();
  process.exit(1);
}

let allPass = true;

try {
  for (const vp of viewports) {
    const page = await browser.newPage({
      width: vp.width,
      height: vp.height,
      dsf: 1,
      mobile: vp.width < 768,
    });

    await page.goto(url, { settleMs: 800 });

    // Check for horizontal overflow
    const overflowInfo = await page.eval(() => {
      const docW = document.documentElement.scrollWidth;
      const winW = window.innerWidth;
      const isOverflowing = docW > winW;
      const offenders = [];
      if (isOverflowing) {
        document.querySelectorAll("*").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.right > winW + 1) {
            offenders.push({
              tag: el.tagName,
              cls: el.className,
              right: Math.round(r.right),
              width: Math.round(r.width),
            });
          }
        });
      }
      return { isOverflowing, docW, winW, offenders: offenders.slice(0, 5) };
    });

    if (overflowInfo.isOverflowing) {
      allPass = false;
      console.error(
        `❌ [OVERFLOW] @${vp.width}px (${vp.name}): docW=${overflowInfo.docW} > winW=${overflowInfo.winW}`,
      );
      console.error("Offenders:", overflowInfo.offenders);
    } else {
      console.log(`✅ [NO OVERFLOW] @${vp.width}px (${vp.name})`);
    }

    // Capture Fold
    const foldPath = join(outDir, `${vp.name}-fold.jpg`);
    await page.screenshot({ path: foldPath, quality: 80 });

    // If mobile 390px, capture interactive states (Cart drawer, tab switching)
    if (vp.width === 390) {
      // Test Tab Switch to Planner
      await page.eval(() => {
        const btn = document.querySelector('[data-view="planner"]');
        if (btn) btn.click();
      });
      await sleep(350);
      await page.screenshot({ path: join(outDir, "mobile-specimen-planner.jpg"), quality: 80 });

      // Test Opening Cart
      await page.eval(() => {
        const btn = document.getElementById("cart-toggle-btn");
        if (btn) btn.click();
      });
      await sleep(400);
      await page.screenshot({ path: join(outDir, "mobile-cart-drawer-open.jpg"), quality: 80 });

      // Close Cart
      await page.eval(() => {
        const closeBtn = document.getElementById("cart-close-btn");
        if (closeBtn) closeBtn.click();
      });
      await sleep(300);

      // Scroll to Heritage section
      await page.eval(() => {
        const h = document.getElementById("heritage");
        if (h) h.scrollIntoView();
      });
      await sleep(400);
      await page.screenshot({ path: join(outDir, "mobile-heritage-carousel.jpg"), quality: 80 });

      // Scroll to Products section
      await page.eval(() => {
        const p = document.getElementById("products");
        if (p) p.scrollIntoView();
      });
      await sleep(400);
      await page.screenshot({ path: join(outDir, "mobile-products-grid.jpg"), quality: 80 });

      // Scroll to Registration section
      await page.eval(() => {
        const r = document.getElementById("register");
        if (r) r.scrollIntoView();
      });
      await sleep(400);
      await page.screenshot({ path: join(outDir, "mobile-register-box.jpg"), quality: 80 });
    }

    await page.close();
  }
} finally {
  await browser.close();
  server.close();
}

if (!allPass) {
  process.exit(1);
} else {
  console.log("🎉 ALL VIEWPORTS PASSED WITH ZERO OVERFLOW!");
  process.exit(0);
}
