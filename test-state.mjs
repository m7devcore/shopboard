import { test, describe, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Mock browser localStorage for Node.js test environment
class LocalStorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

globalThis.localStorage = new LocalStorageMock();

// Import state module after mocking globalThis.localStorage
const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  getCartState,
  loadCartFromStorage,
  saveCartToStorage,
  initializeCartState,
} = await import("./src/state.js");

describe("State Module — Cart Operations", () => {
  beforeEach(() => {
    clearCart();
    globalThis.localStorage.clear();
  });

  test("adds a new product with initial quantity of 1", () => {
    const product = { id: "p1", name: "CV Template", price: 29 };
    const cart = addToCart(product);

    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].id, "p1");
    assert.strictEqual(cart[0].name, "CV Template");
    assert.strictEqual(cart[0].price, 29);
    assert.strictEqual(cart[0].quantity, 1);
  });

  test("adding an existing product increments its quantity", () => {
    const product = { id: "p1", name: "CV Template", price: 29 };
    addToCart(product);
    const cart = addToCart(product);

    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].quantity, 2);
  });

  test("increaseQuantity increments target item quantity by 1", () => {
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    const cart = increaseQuantity("p1");

    assert.strictEqual(cart[0].quantity, 2);
  });

  test("decreaseQuantity decrements target item quantity by 1", () => {
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    assert.strictEqual(getCartState()[0].quantity, 2);

    const cart = decreaseQuantity("p1");
    assert.strictEqual(cart[0].quantity, 1);
  });

  test("decreaseQuantity removes the item when quantity reaches zero", () => {
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    addToCart({ id: "p2", name: "Study Planner", price: 19 });

    assert.strictEqual(getCartState().length, 2);

    const cart = decreaseQuantity("p1");
    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].id, "p2");
    assert.strictEqual(
      cart.find((item) => item.id === "p1"),
      undefined,
    );
  });

  test("removeFromCart removes specified item regardless of quantity", () => {
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    addToCart({ id: "p2", name: "Study Planner", price: 19 });

    const cart = removeFromCart("p1");
    assert.strictEqual(cart.length, 1);
    assert.strictEqual(cart[0].id, "p2");
  });

  test("clearCart empties all items and persists empty state", () => {
    addToCart({ id: "p1", name: "CV Template", price: 29 });
    addToCart({ id: "p2", name: "Study Planner", price: 19 });

    const cart = clearCart();
    assert.strictEqual(cart.length, 0);
    assert.strictEqual(getCartState().length, 0);

    const stored = JSON.parse(globalThis.localStorage.getItem("shopboard_cart"));
    assert.deepStrictEqual(stored, []);
  });
});

describe("State Module — Persistence & LocalStorage Synchronization", () => {
  beforeEach(() => {
    clearCart();
    globalThis.localStorage.clear();
  });

  test("persists cart mutations immediately into localStorage", () => {
    addToCart({ id: "p1", name: "CV Template", price: 29 });

    const raw = globalThis.localStorage.getItem("shopboard_cart");
    assert.ok(raw, "localStorage must contain shopboard_cart key");

    const parsed = JSON.parse(raw);
    assert.strictEqual(parsed.length, 1);
    assert.strictEqual(parsed[0].id, "p1");
    assert.strictEqual(parsed[0].quantity, 1);

    increaseQuantity("p1");
    const updated = JSON.parse(globalThis.localStorage.getItem("shopboard_cart"));
    assert.strictEqual(updated[0].quantity, 2);
  });

  test("saveCartToStorage writes serialized cart items to localStorage", () => {
    const sample = [{ id: "p1", name: "CV Template", price: 29, quantity: 2 }];
    saveCartToStorage(sample);
    assert.strictEqual(globalThis.localStorage.getItem("shopboard_cart"), JSON.stringify(sample));
  });

  test("initializeCartState restores persisted cart items on page load", () => {
    const preExisting = [
      { id: "p1", name: "Saved CV", price: 29, quantity: 2 },
      { id: "p2", name: "Saved Planner", price: 19, quantity: 1 },
    ];
    globalThis.localStorage.setItem("shopboard_cart", JSON.stringify(preExisting));

    const restored = initializeCartState();
    assert.strictEqual(restored.length, 2);
    assert.strictEqual(restored[0].id, "p1");
    assert.strictEqual(restored[0].quantity, 2);
    assert.strictEqual(restored[1].id, "p2");
    assert.strictEqual(restored[1].quantity, 1);
  });
});

describe("State Module — Safe Handling of Malformed LocalStorage", () => {
  beforeEach(() => {
    clearCart();
    globalThis.localStorage.clear();
  });

  test("handles corrupted / non-JSON string gracefully without throwing", () => {
    globalThis.localStorage.setItem("shopboard_cart", 'CORRUPT_JSON_{["bad');

    assert.doesNotThrow(() => {
      const result = loadCartFromStorage();
      assert.deepStrictEqual(result, []);
    });
  });

  test("handles non-array JSON values gracefully by returning empty array", () => {
    globalThis.localStorage.setItem("shopboard_cart", JSON.stringify({ id: "p1", name: "Item" }));
    assert.deepStrictEqual(loadCartFromStorage(), []);

    globalThis.localStorage.setItem("shopboard_cart", JSON.stringify(42));
    assert.deepStrictEqual(loadCartFromStorage(), []);

    globalThis.localStorage.setItem("shopboard_cart", JSON.stringify("plain string"));
    assert.deepStrictEqual(loadCartFromStorage(), []);
  });

  test("filters out invalid or malformed schema entries from stored array", () => {
    const mixedEntries = [
      { id: "valid-1", name: "Valid Item", price: 25, quantity: 1 },
      { id: "bad-1", name: "Missing price and qty" },
      { id: "bad-2", name: "Negative qty", price: 10, quantity: -2 },
      { id: "bad-3", name: "Zero qty", price: 10, quantity: 0 },
      { id: "bad-4", name: "String price", price: "25", quantity: 1 },
      null,
      undefined,
      123,
    ];

    globalThis.localStorage.setItem("shopboard_cart", JSON.stringify(mixedEntries));

    const sanitized = loadCartFromStorage();
    assert.strictEqual(sanitized.length, 1);
    assert.strictEqual(sanitized[0].id, "valid-1");
  });

  test("returns empty array when localStorage key does not exist", () => {
    globalThis.localStorage.removeItem("shopboard_cart");
    assert.deepStrictEqual(loadCartFromStorage(), []);
  });
});
