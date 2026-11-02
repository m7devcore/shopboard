import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { products as catalogProducts } from "./src/data.js";
import {
  filterProducts,
  sortProducts,
  calculateTotalItems,
  calculateTotalPrice,
  calculateLineTotal,
  groupProductsByCategory,
} from "./src/logic.js";

const sampleProducts = [
  { id: "p1", name: "CV Template", category: "Templates", price: 29 },
  { id: "p2", name: "Study Planner", category: "Education", price: 19 },
  { id: "p3", name: "Budget Tracker", category: "Finance", price: 24 },
  { id: "p4", name: "Executive Resume", category: "Templates", price: 39 },
  { id: "p5", name: "Digital Notebook", category: "Education", price: 14 },
];

describe("Logic Module — filterProducts", () => {
  test('returns all products when search is empty and category is "all"', () => {
    const result = filterProducts(sampleProducts, { searchTerm: "", category: "all" });
    assert.strictEqual(result.length, 5);
  });

  test("filters by search term case-insensitively", () => {
    const result = filterProducts(sampleProducts, { searchTerm: "template" });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].name, "CV Template");

    const upperResult = filterProducts(sampleProducts, { searchTerm: "PLANNER" });
    assert.strictEqual(upperResult.length, 1);
    assert.strictEqual(upperResult[0].name, "Study Planner");
  });

  test("filters by category case-insensitively", () => {
    const result = filterProducts(sampleProducts, { category: "education" });
    assert.strictEqual(result.length, 2);
    assert.ok(result.every((p) => p.category.toLowerCase() === "education"));
  });

  test("filters by search term and category together", () => {
    const result = filterProducts(sampleProducts, {
      searchTerm: "resume",
      category: "Templates",
    });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, "p4");

    const noMatch = filterProducts(sampleProducts, {
      searchTerm: "resume",
      category: "Education",
    });
    assert.strictEqual(noMatch.length, 0);
  });

  test("returns empty array when search matches nothing", () => {
    const result = filterProducts(sampleProducts, { searchTerm: "Nonexistent" });
    assert.strictEqual(result.length, 0);
  });

  test("search query with leading/trailing whitespace is trimmed properly", () => {
    const result = filterProducts(sampleProducts, { searchTerm: "   template   " });
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, "p1");
  });

  test('homework scenario: search "template", category "Templates", sort "desc" on full catalog', () => {
    const filtered = filterProducts(catalogProducts, {
      searchTerm: "template",
      category: "Templates",
    });
    const sorted = sortProducts(filtered, "desc");

    assert.strictEqual(sorted.length, 4);
    assert.strictEqual(sorted[0].name, "Pitch Deck Template");
    assert.strictEqual(sorted[0].price, 18);
    assert.strictEqual(sorted[1].name, "Portfolio Template");
    assert.strictEqual(sorted[1].price, 15);
    assert.strictEqual(sorted[2].name, "CV Template");
    assert.strictEqual(sorted[2].price, 12);
    assert.strictEqual(sorted[3].name, "Invoice Template");
    assert.strictEqual(sorted[3].price, 9);
  });

  test("restoring default sort after ascending or descending restores original order", () => {
    const asc = sortProducts(catalogProducts, "asc");
    assert.notDeepStrictEqual(asc, catalogProducts);

    const desc = sortProducts(catalogProducts, "desc");
    assert.notDeepStrictEqual(desc, catalogProducts);

    const restoredFromDefault = sortProducts(catalogProducts, "default");
    assert.deepStrictEqual(restoredFromDefault, catalogProducts);
  });
});

describe("Logic Module — sortProducts", () => {
  test("sorts products by price ascending without mutating the source array", () => {
    const originalSnapshot = JSON.parse(JSON.stringify(sampleProducts));
    const sorted = sortProducts(sampleProducts, "asc");

    assert.strictEqual(sorted[0].price, 14);
    assert.strictEqual(sorted[sorted.length - 1].price, 39);

    // Verify source array is not mutated
    assert.deepStrictEqual(
      sampleProducts,
      originalSnapshot,
      'Source array must not be mutated by sortProducts(..., "asc")',
    );
  });

  test("sorts products by price descending without mutating the source array", () => {
    const originalSnapshot = JSON.parse(JSON.stringify(sampleProducts));
    const sorted = sortProducts(sampleProducts, "desc");

    assert.strictEqual(sorted[0].price, 39);
    assert.strictEqual(sorted[sorted.length - 1].price, 14);

    // Verify source array is not mutated
    assert.deepStrictEqual(
      sampleProducts,
      originalSnapshot,
      'Source array must not be mutated by sortProducts(..., "desc")',
    );
  });

  test("returns original order for default sort order", () => {
    const sorted = sortProducts(sampleProducts, "default");
    assert.deepStrictEqual(sorted, sampleProducts);
    assert.notStrictEqual(sorted, sampleProducts, "Should return a shallow copy");
  });
});

describe("Logic Module — groupProductsByCategory", () => {
  test("groups by category in order of first appearance without mutating the source", () => {
    const originalSnapshot = JSON.parse(JSON.stringify(sampleProducts));
    const groups = groupProductsByCategory(sampleProducts);

    assert.deepStrictEqual(
      groups.map((group) => group.category),
      ["Templates", "Education", "Finance"],
    );
    assert.deepStrictEqual(
      groups[0].items.map((item) => item.id),
      ["p1", "p4"],
    );
    assert.deepStrictEqual(
      groups[1].items.map((item) => item.id),
      ["p2", "p5"],
    );
    assert.deepStrictEqual(sampleProducts, originalSnapshot);
  });

  test("returns an empty array for an empty product list", () => {
    assert.deepStrictEqual(groupProductsByCategory([]), []);
  });
});

describe("Logic Module — Cart Calculations", () => {
  test("calculateLineTotal computes product price multiplied by quantity", () => {
    assert.strictEqual(calculateLineTotal(29, 3), 87);
    assert.strictEqual(calculateLineTotal(19, 1), 19);
    assert.strictEqual(calculateLineTotal(24, 0), 0);
    assert.strictEqual(calculateLineTotal("25", "2"), 50);
  });

  test("calculateTotalItems counts total units across cart items", () => {
    const cart = [
      { id: "p1", price: 29, quantity: 2 },
      { id: "p2", price: 19, quantity: 3 },
      { id: "p3", price: 14, quantity: 1 },
    ];
    assert.strictEqual(calculateTotalItems(cart), 6);
    assert.strictEqual(calculateTotalItems([]), 0);
  });

  test("calculateTotalPrice sums line totals for all cart items", () => {
    const cart = [
      { id: "p1", price: 29, quantity: 2 }, // 58
      { id: "p2", price: 19, quantity: 3 }, // 57
      { id: "p3", price: 14, quantity: 1 }, // 14
    ];
    // 58 + 57 + 14 = 129
    assert.strictEqual(calculateTotalPrice(cart), 129);
    assert.strictEqual(calculateTotalPrice([]), 0);
  });
});
