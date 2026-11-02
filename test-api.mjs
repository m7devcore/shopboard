import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import {
  ApiError,
  fetchJson,
  setApiBaseUrl,
  getApiBaseUrl,
  BASE_URL,
} from "./src/shared/api/client.ts";
import {
  isApiProduct,
  parseApiProduct,
  parseApiProductList,
  toProduct,
  getProducts,
  getProduct,
} from "./src/modules/products/products.api.ts";

const sampleApiProducts = [
  {
    id: 1,
    title: "Leather Tote Bag",
    category_name: "Bags",
    price_cents: 8900,
    in_stock: true,
  },
  {
    id: 3,
    title: "Mini Crossbody Bag",
    category_name: "Bags",
    price_cents: 4900,
    in_stock: false,
  },
  {
    id: 4,
    title: "White Sneakers",
    category_name: "Shoes",
    price_cents: 7900,
    in_stock: true,
  },
];

let server;
let mockBaseUrl = "";

describe("API Client, Runtime Validation & Product Mapper (Day 3)", () => {
  before(async () => {
    server = createServer((req, res) => {
      const url = new URL(req.url || "/", "http://127.0.0.1");

      if (url.pathname === "/api/products") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            items: sampleApiProducts,
            total: sampleApiProducts.length,
          }),
        );
        return;
      }

      if (url.pathname === "/empty/api/products") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify({ items: [], total: 0 }));
        return;
      }

      if (url.pathname === "/api/products/1") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(JSON.stringify(sampleApiProducts[0]));
        return;
      }

      if (url.pathname === "/api/products/999") {
        res.writeHead(404, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Product 999 not found" }));
        return;
      }

      if (url.pathname === "/fail/500/api/products") {
        res.writeHead(500, { "content-type": "application/json" });
        res.end(JSON.stringify({ error: "Simulated 500 server error" }));
        return;
      }

      if (url.pathname === "/malformed-json") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end("{not_valid_json");
        return;
      }

      if (url.pathname === "/invalid-schema") {
        res.writeHead(200, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            items: [{ id: "wrong-type", title: 123 }],
            total: 1,
          }),
        );
        return;
      }

      res.writeHead(404, { "content-type": "application/json" });
      res.end(JSON.stringify({ error: "Endpoint not found" }));
    });

    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const address = server.address();
    mockBaseUrl = `http://127.0.0.1:${address.port}`;
    setApiBaseUrl(mockBaseUrl);
  });

  after(() => {
    setApiBaseUrl(BASE_URL);
    if (server) {
      server.close();
    }
  });

  test("BASE_URL points to the official course ShopBoard API", () => {
    assert.strictEqual(BASE_URL, "https://shopboard-api.vercel.app");
    assert.strictEqual(getApiBaseUrl(), mockBaseUrl);
  });

  test("toProduct() maps ApiProduct wire fields and converts price_cents to dollars", () => {
    const mapped = toProduct(sampleApiProducts[0]);
    assert.strictEqual(mapped.id, "1");
    assert.strictEqual(mapped.name, "Leather Tote Bag");
    assert.strictEqual(mapped.category, "Bags");
    assert.strictEqual(mapped.price, 89);
    assert.strictEqual(mapped.inStock, true);
    assert.ok(mapped.description.length > 0);
    assert.ok(mapped.icon && mapped.icon.includes("<svg"));

    const outOfStockMapped = toProduct(sampleApiProducts[1]);
    assert.strictEqual(outOfStockMapped.id, "3");
    assert.strictEqual(outOfStockMapped.price, 49);
    assert.strictEqual(outOfStockMapped.inStock, false);
  });

  test("runtime validation accepts valid ApiProduct and rejects malformed objects", () => {
    assert.strictEqual(isApiProduct(sampleApiProducts[0]), true);
    assert.strictEqual(isApiProduct(null), false);
    assert.strictEqual(isApiProduct("string"), false);
    assert.strictEqual(
      isApiProduct({
        id: 1,
        title: "Bag",
        category_name: "Bags",
        price_cents: "8900",
        in_stock: true,
      }),
      false,
    );
    assert.strictEqual(
      isApiProduct({
        id: 1,
        title: "Bag",
        category_name: "Bags",
        price_cents: -100,
        in_stock: true,
      }),
      false,
    );

    assert.throws(
      () => parseApiProduct({ id: "bad" }),
      (err) => err instanceof ApiError && err.status === 500,
    );

    assert.throws(
      () => parseApiProductList({ items: "not-an-array", total: 0 }),
      (err) => err instanceof ApiError && err.status === 500,
    );
  });

  test("getProducts() fetches, validates, and maps product list from API", async () => {
    const products = await getProducts();
    assert.strictEqual(products.length, 3);
    assert.strictEqual(products[0].id, "1");
    assert.strictEqual(products[0].name, "Leather Tote Bag");
    assert.strictEqual(products[0].price, 89);
    assert.strictEqual(products[2].category, "Shoes");
    assert.strictEqual(products[2].price, 79);
  });

  test("getProducts() handles empty API response cleanly", async () => {
    const products = await getProducts({ endpointPath: "/empty/api/products" });
    assert.deepStrictEqual(products, []);
  });

  test("getProduct(id) fetches a single product and throws ApiError(404) when missing", async () => {
    const item = await getProduct(1);
    assert.strictEqual(item.id, "1");
    assert.strictEqual(item.name, "Leather Tote Bag");
    assert.strictEqual(item.price, 89);

    await assert.rejects(
      () => getProduct(999),
      (err) =>
        err instanceof ApiError &&
        err.status === 404 &&
        err.message.includes("Product 999 not found"),
    );
  });

  test("fetchJson throws ApiError(500) on server 500 error and on invalid schema", async () => {
    await assert.rejects(
      () => getProducts({ endpointPath: "/fail/500/api/products" }),
      (err) =>
        err instanceof ApiError &&
        err.status === 500 &&
        err.message.includes("Simulated 500 server error"),
    );

    await assert.rejects(
      () => fetchJson("/malformed-json", parseApiProductList),
      (err) => err instanceof ApiError && err.status === 200,
    );

    await assert.rejects(
      () => fetchJson("/invalid-schema", parseApiProductList),
      (err) => err instanceof ApiError && err.status === 500,
    );
  });

  test("addToCart prevents adding out-of-stock products", async () => {
    const { addToCart, clearCart, getCartState } = await import("./src/state.ts");
    clearCart();

    // Unavailable product (inStock: false)
    const outOfStockItem = { id: "p-out", name: "Out Item", price: 50, inStock: false };
    const cartAfterBlockedAdd = addToCart(outOfStockItem);
    assert.strictEqual(cartAfterBlockedAdd.length, 0);
    assert.strictEqual(getCartState().length, 0);

    // Available product (inStock: true)
    const availableItem = { id: "p-avail", name: "Avail Item", price: 50, inStock: true };
    const cartAfterValidAdd = addToCart(availableItem);
    assert.strictEqual(cartAfterValidAdd.length, 1);
    assert.strictEqual(cartAfterValidAdd[0].id, "p-avail");
    clearCart();
  });
});
