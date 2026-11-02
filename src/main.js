import "./style.css";
import { products } from "./data.js";
import { initializeCartState } from "./state.js";
import { initUI } from "./ui.js";

/**
 * Bootstraps the ShopBoard application.
 * Connects data, state, pure logic, and delegates all DOM lifecycle to ui.js.
 */
function initApp() {
  // 1. Initialize persistent cart state from localStorage
  initializeCartState();

  // 2. Delegate all DOM rendering and event bindings to ui.js (the sole DOM owner)
  initUI(products);
}

initApp();
