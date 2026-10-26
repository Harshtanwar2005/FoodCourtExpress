
"use strict";

/* =========================================================
   FOOD COURT EXPRESS — COMPLETE FRONTEND APPLICATION
   APIs:
     GET  /api/menu
     POST /api/orders
     GET  /api/orders/track
   ========================================================= */

const API = Object.freeze({
  menu: "/api/menu",
  orders: "/api/orders",
  trackOrder: "/api/orders/track"
});

const CURRENCY = "INR";
const CART_STORAGE_KEY = "foodCourtExpressCart";

/* =========================================================
   1. LOCAL FOOD IMAGES
   Files should be stored in:
   src/main/resources/static/images/
   ========================================================= */

const localFoodImages = Object.freeze({
  "cheeseburger": "/images/cheeseburger.jpg",
  "veggie pizza": "/images/veggie-pizza.jpg",
  "cold coffee": "/images/cold-coffee.jpg",
  "masala dosa": "/images/masala-dosa.jpg",
  "chocolate brownie": "/images/chocolate-brownie.jpg"
});

function getFoodImage(item) {
  const name = String(item?.name || "").trim().toLowerCase();

  // Prefer a valid image URL supplied by the backend.
  const backendImage = String(item?.imageUrl || "").trim();

  if (backendImage) {
    return backendImage;
  }

  // Otherwise use the project's local image.
  return localFoodImages[name] || "";
}

/* =========================================================
   2. SHARED APPLICATION STATE
   ========================================================= */

let menuItems = [];
let cart = loadSavedCart();
let activeCategory = "All Items";
let searchQuery = "";
let menuLoadError = false;

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return replacements[character];
  });
}

function formatPrice(value) {
  const amount = Number(value);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CURRENCY,
    maximumFractionDigits: 2
  }).format(Number.isFinite(amount) ? amount : 0);
}

function showToast(message, type = "info") {
  const toast = $("#app-toast");

  if (!toast) {
    console.log(`[Food Court Express] ${message}`);
    return;
  }

  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add("is-visible");
  toast.setAttribute("role", "status");

  if (showToast.timeout) {
    clearTimeout(showToast.timeout);
  }

  showToast.timeout = setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3000);
}

/* =========================================================
   3. MENU FETCHING
   ========================================================= */

async function loadMenu() {
  const status = $("#menu-status");
  const grid = $("#menu-grid");

  if (status) {
    status.textContent = "Loading today's menu...";
  }

  try {
    const response = await fetch(API.menu, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-cache"
    });

    if (!response.ok) {
      throw new Error(`Menu request failed: HTTP ${response.status}`);
    }

    const data = await response.json();

    // Supports a regular JSON array and Spring Page responses.
    if (Array.isArray(data)) {
      menuItems = data;
    } else if (Array.isArray(data.content)) {
      menuItems = data.content;
    } else if (Array.isArray(data.items)) {
      menuItems = data.items;
    } else {
      throw new Error("The menu API returned an unexpected response.");
    }

    menuLoadError = false;

    renderMenu(menuItems);
    updateCategoryCounts();

    if (status) {
      status.textContent = menuItems.length
        ? `${menuItems.length} delicious items available`
        : "No food items are available right now.";
    }
  } catch (error) {
    menuLoadError = true;
    console.error("Food Court Express menu error:", error);

    if (grid) {
      grid.innerHTML = `
        <div class="menu-error">
          <h3>We couldn't load the menu</h3>
          <p>Please check your connection and try again.</p>
          <button type="button" id="retry-menu" class="retry-menu">
            Try Again
          </button>
        </div>
      `;

      $("#retry-menu", grid)?.addEventListener("click", loadMenu);
    }

    if (status) {
      status.textContent = "Menu loading failed.";
    }
  }
}

/* =========================================================
   4. MENU RENDERING
   ========================================================= */

function renderMenu(items = menuItems) {
  const grid = $("#menu-grid");

  if (!grid) {
    console.error(
      'Missing #menu-grid in index.html. Add this element inside the menu section.'
    );
    return;
  }

  const filteredItems = filterMenuItems(items);

  if (!filteredItems.length) {
    grid.innerHTML = `
      <div class="menu-empty">
        <h3>${menuLoadError ? "Menu unavailable" : "No dishes found"}</h3>
        <p>${
          menuLoadError
            ? "Please try loading the menu again."
            : "Try another search or category."
        }</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filteredItems.map((item) => {
    const id = escapeHTML(item.id);
    const name = escapeHTML(item.name || "Food item");
    const description = escapeHTML(
      item.description || "Freshly prepared and delicious."
    );
    const category = escapeHTML(item.category || "Food");
    const price = formatPrice(item.price);
    const imageUrl = getFoodImage(item);
    const available = item.available !== false;

    const imageHTML = imageUrl
      ? `
        <div class="menu-card-image">
          <img
            src="${escapeHTML(imageUrl)}"
            alt="${name}"
            loading="lazy"
            data-food-image="${id}"
          >
        </div>
      `
      : `
        <div class="menu-card-image image-placeholder" aria-label="${name}">
          <span>🍽️</span>
        </div>
      `;

    return `
      <article class="menu-card" data-menu-id="${id}">
        ${imageHTML}
        <div class="menu-card-content">
          <span class="menu-category">${category}</span>
          <h3>${name}</h3>
          <p class="menu-description">${description}</p>

          <div class="menu-card-footer">
            <strong class="menu-price">${price}</strong>
            <button
              type="button"
              class="add-to-cart"
              data-add-item="${id}"
              ${available ? "" : "disabled"}
              aria-label="Add ${name} to basket"
            >
              ${available ? "Add +" : "Unavailable"}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  // If a local image is missing, show a graceful placeholder.
  $$("img[data-food-image]", grid).forEach((image) => {
    image.addEventListener("error", () => {
      const placeholder = document.createElement("div");
      placeholder.className = "menu-card-image image-placeholder";
      placeholder.setAttribute("aria-label", image.alt);
      placeholder.innerHTML = "<span>🍽️</span>";

      image.replaceWith(placeholder);

      console.warn("Could not load food image:", image.src);
    }, { once: true });
  });
}

function filterMenuItems(items) {
  const query = searchQuery.trim().toLowerCase();
  const selected = String(activeCategory || "all").trim().toLowerCase();

  return items.filter((item) => {
    const name = String(item.name || "").toLowerCase();
    const category = String(item.category || "").toLowerCase();

    const categoryMatches =
      !selected || selected === "all" || selected === "all items" ||
      (selected === "burger" || selected === "burgers"
        ? /burger/.test(name) || /burger/.test(category)
        : selected === "pizza"
          ? /pizza/.test(name) || /pizza/.test(category)
          : selected === "drink" || selected === "drinks"
            ? /beverage|drink|coffee|tea|juice/.test(category + " " + name)
            : selected === "indian"
              ? /indian|dosa|idli|paneer|biryani|masala/.test(category + " " + name)
              : selected === "dessert" || selected === "desserts"
                ? /dessert|brownie|cake|ice cream|sweet/.test(category + " " + name)
                : category === selected || name.includes(selected));

    const searchMatches =
      !query ||
      name.includes(query) ||
      String(item.description || "").toLowerCase().includes(query) ||
      category.includes(query);

    return categoryMatches && searchMatches;
  });
}

function updateCategoryCounts() {
  const status = $("#menu-status");

  if (status && !menuLoadError) {
    const count = filterMenuItems(menuItems).length;
    status.textContent = `${count} ${count === 1 ? "item" : "items"} found`;
  }
}

/* =========================================================
   5. BASKET STORAGE AND MANAGEMENT
   ========================================================= */

function loadSavedCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || "[]");

    if (!Array.isArray(saved)) {
      return [];
    }

    return saved
      .filter((item) => item && item.id != null)
      .map((item) => ({
        id: String(item.id),
        name: String(item.name || "Food item"),
        price: Math.max(0, Number(item.price) || 0),
        imageUrl: String(item.imageUrl || ""),
        quantity: Math.max(1, Math.floor(Number(item.quantity) || 1))
      }));
  } catch (error) {
    console.warn("Could not restore saved basket:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.warn("Could not save basket:", error);
  }
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

function getCartTotal() {
  return cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
}

function addToCart(item) {
  if (!item || item.id == null) {
    showToast("This food item cannot be added.", "error");
    return;
  }

  if (item.available === false) {
    showToast("This item is currently unavailable.", "error");
    return;
  }

  const existing = cart.find(
    (cartItem) => String(cartItem.id) === String(item.id)
  );

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: String(item.id),
      name: String(item.name || "Food item"),
      price: Math.max(0, Number(item.price) || 0),
      imageUrl: getFoodImage(item),
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast(`${item.name || "Item"} added to your basket.`, "success");
}

function changeCartQuantity(id, change) {
  const item = cart.find((cartItem) => cartItem.id === String(id));

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter((cartItem) => cartItem.id !== String(id));
  }

  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== String(id));
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function renderCart() {
  const cartItems = $("#cart-items");
  const total = getCartTotal();
  const count = getCartCount();

  // Update all basket counters.
  ["#cart-count", "#drawer-count"].forEach((selector) => {
    const element = $(selector);

    if (element) {
      element.textContent = String(count);
      element.setAttribute("aria-label", `${count} items in basket`);
    }
  });

  if ($("#cart-total")) {
    $("#cart-total").textContent = formatPrice(total);
  }

  if (!cartItems) return;

  if (!cart.length) {
    cartItems.innerHTML = `
      <div class="cart-empty">
        <p>Your basket is empty.</p>
        <p>Add something delicious from our menu!</p>
      </div>
    `;
    return;
  }

  cartItems.innerHTML = cart.map((item) => `
    <article class="cart-item" data-cart-id="${escapeHTML(item.id)}">
      <div class="cart-item-info">
        <h4>${escapeHTML(item.name)}</h4>
        <p>${formatPrice(item.price)} each</p>
      </div>

      <div class="cart-item-controls">
        <button
          type="button"
          data-cart-decrease="${escapeHTML(item.id)}"
          aria-label="Decrease ${escapeHTML(item.name)} quantity"
        >−</button>

        <span>${item.quantity}</span>

        <button
          type="button"
          data-cart-increase="${escapeHTML(item.id)}"
          aria-label="Increase ${escapeHTML(item.name)} quantity"
        >+</button>

        <button
          type="button"
          data-cart-remove="${escapeHTML(item.id)}"
          aria-label="Remove ${escapeHTML(item.name)}"
        >Remove</button>
      </div>

      <strong>${formatPrice(item.price * item.quantity)}</strong>
    </article>
  `).join("");
}

/* =========================================================
   6. BASKET DRAWER
   ========================================================= */

function openCart() {
  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");

  drawer?.classList.add("is-open");
  backdrop?.classList.add("is-visible");

  drawer?.setAttribute("aria-hidden", "false");
  $("#cart-toggle")?.setAttribute("aria-expanded", "true");

  document.body.classList.add("drawer-open");
}

function closeCart() {
  const drawer = $("#cart-drawer");
  const backdrop = $("#drawer-backdrop");

  drawer?.classList.remove("is-open");
  backdrop?.classList.remove("is-visible");

  drawer?.setAttribute("aria-hidden", "true");
  $("#cart-toggle")?.setAttribute("aria-expanded", "false");

  document.body.classList.remove("drawer-open");
}

/* =========================================================
   7. CHECKOUT — DINE-IN AND DELIVERY
   ========================================================= */

function getOrderType() {
  const selected = $('input[name="orderType"]:checked');

  if (selected) {
    return selected.value.trim().toLowerCase().replace(/_/g, "-");
  }

  const select = $("#order-type");

  if (select?.value) {
    return select.value.trim().toLowerCase().replace(/_/g, "-");
  }

  return "delivery";
}

function updateCheckoutFields() {
  const orderType = getOrderType();
  const isDineIn = orderType === "dine-in" || orderType === "dinein";

  const addressField = $("#delivery-address-field");
  const tableField = $("#table-number-field");
  const address = $("#delivery-address");
  const tableNumber = $("#table-number");

  if (addressField) {
    addressField.hidden = isDineIn;
  }

  if (tableField) {
    tableField.hidden = !isDineIn;
  }

  if (address) {
    address.required = !isDineIn;
  }

  if (tableNumber) {
    tableNumber.required = isDineIn;
  }
}

function setCheckoutMessage(message, type = "info") {
  const element = $("#checkout-message");

  if (element) {
    element.textContent = message;
    element.dataset.type = type;
    element.setAttribute("role", type === "error" ? "alert" : "status");
  }
}

async function submitCheckout(event) {
  event.preventDefault();

  const form = $("#checkout-form");

  if (!form) return;

  if (!cart.length) {
    setCheckoutMessage("Your basket is empty. Add food before checkout.", "error");
    return;
  }

  if (!form.reportValidity()) {
    return;
  }

  const customerName = $("#customer-name")?.value.trim() || "";
  const customerEmail = $("#customer-email")?.value.trim() || "";
  const customerPhone = $("#customer-phone")?.value.trim() || "";
  const orderType = getOrderType();
  const isDineIn = orderType === "dine-in" || orderType === "dinein";

  const deliveryAddress = $("#delivery-address")?.value.trim() || "";
  const tableNumber = $("#table-number")?.value.trim() || "";

  if (isDineIn && !tableNumber) {
    setCheckoutMessage("Please enter your table number.", "error");
    return;
  }

  if (!isDineIn && !deliveryAddress) {
    setCheckoutMessage("Please enter your delivery address.", "error");
    return;
  }

  const payload = {
    customerName,
    customerEmail,
    customerPhone,
    orderType: isDineIn ? "DINE_IN" : "DELIVERY",
    tableNumber: isDineIn ? tableNumber : null,
    deliveryAddress: isDineIn ? "Dine-in" : deliveryAddress,
    items: cart.map((item) => ({
      menuItemId: Number(item.id),
      quantity: item.quantity
    }))
  };

  const submitButton = $("#checkout-submit");
  const originalButtonText = submitButton?.textContent;

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.textContent = "Placing order...";
  }

  setCheckoutMessage("Submitting your order...");

  try {
    const response = await fetch(API.orders, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let result = {};

    try {
      result = responseText ? JSON.parse(responseText) : {};
    } catch {
      result = { message: responseText };
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
        result.error ||
        `Order failed with HTTP ${response.status}`
      );
    }

    const orderReference =
      result.orderNumber ||
      result.orderId ||
      result.orderReference ||
      result.id ||
      "";

    // Do not clear the basket until the server confirms success.
    clearCart();
    closeCart();

    setCheckoutMessage(
      orderReference
        ? `Order placed successfully! Your order number is ${orderReference}.`
        : "Your order was placed successfully!",
      "success"
    );

    showToast("Your order has been placed!", "success");

    if (orderReference && $("#tracking-order-id")) {
      $("#tracking-order-id").value = String(orderReference);
    }
    if ($("#tracking-phone")) {
      $("#tracking-phone").value = customerPhone;
    }

    form.reset();
    updateCheckoutFields();

    if (orderReference) {
      const trackingSection = $("#tracking-form");

      if (trackingSection) {
        trackingSection.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  } catch (error) {
    console.error("Checkout error:", error);

    setCheckoutMessage(
      error.message || "Could not place your order. Please try again.",
      "error"
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText || "Place Order";
    }
  }
}

/* =========================================================
   8. ORDER TRACKING
   ========================================================= */

function displayTrackingResult(order) {
  const resultElement = $("#tracking-result");

  if (!resultElement) return;

  if (!order || typeof order !== "object") {
    resultElement.hidden = false;
    resultElement.textContent = "No order details were returned.";
    return;
  }

  const orderNumber =
    order.orderNumber ||
    order.orderId ||
    order.orderReference ||
    order.id ||
    "Your order";

  const status = order.status || "Status unavailable";
  const paymentStatus = order.paymentStatus || "Not provided";
  const total = order.totalAmount ?? order.total ?? order.totalPrice;

  resultElement.hidden = false;
  resultElement.classList.remove("error");
  resultElement.innerHTML = `
    <div class="tracking-details">
      <h3>Order ${escapeHTML(orderNumber)}</h3>
      <p>
        <strong>Order status:</strong>
        <span class="tracking-status">${escapeHTML(status)}</span>
      </p>
      <p>
        <strong>Payment:</strong>
        ${escapeHTML(paymentStatus)}
      </p>
      ${
        total != null
          ? `<p><strong>Total:</strong> ${formatPrice(total)}</p>`
          : ""
      }
    </div>
  `;
}

async function trackOrder(event) {
  event.preventDefault();

  const input = $("#tracking-order-id");
  const resultElement = $("#tracking-result");
  const phoneInput = $("#tracking-phone");
  const orderNumber = input?.value.trim();
  const phone = phoneInput?.value.trim();

  if (!orderNumber || !phone) {
    if (resultElement) {
      resultElement.textContent = "Please enter your order number and phone number.";
    }
    return;
  }

  if (resultElement) {
    resultElement.textContent = "Looking up your order...";
  }

  try {
    // The order number is encoded to safely support special characters.
    const url = new URL(API.trackOrder, window.location.origin);
    url.searchParams.set("orderNumber", orderNumber);
    url.searchParams.set("phone", phone);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-cache"
    });

    const responseText = await response.text();
    let data = {};

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      data = { message: responseText };
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
        data.error ||
        `Tracking failed with HTTP ${response.status}`
      );
    }

    if (data && data.found === false) {
      throw new Error(data.message || "Order not found.");
    }

    // Some endpoints return { order: {...} }.
    const order = data.order || data.data || data;

    displayTrackingResult(order);
  } catch (error) {
    console.error("Order tracking error:", error);

    if (resultElement) {
      resultElement.hidden = false;
      resultElement.classList.add("error");
      resultElement.textContent =
        error.message || "Could not track your order. Please try again.";
    }
  }
}

/* =========================================================
   9. EVENT LISTENERS
   ========================================================= */

function bindEvents() {
  // Add items to the basket.
  $("#menu-grid")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-item]");

    if (!button) return;

    const item = menuItems.find(
      (menuItem) => String(menuItem.id) === button.dataset.addItem
    );

    if (item) {
      addToCart(item);
    }
  });

  // Basket drawer controls.
  $("#cart-toggle")?.addEventListener("click", openCart);
  $("#close-cart")?.addEventListener("click", closeCart);
  $("#drawer-backdrop")?.addEventListener("click", closeCart);

  // Basket quantity and removal controls.
  $("#cart-items")?.addEventListener("click", (event) => {
    const increase = event.target.closest("[data-cart-increase]");
    const decrease = event.target.closest("[data-cart-decrease]");
    const remove = event.target.closest("[data-cart-remove]");

    if (increase) {
      changeCartQuantity(increase.dataset.cartIncrease, 1);
    } else if (decrease) {
      changeCartQuantity(decrease.dataset.cartDecrease, -1);
    } else if (remove) {
      removeFromCart(remove.dataset.cartRemove);
    }
  });

  // Search menu items.
  $("#menu-search")?.addEventListener("input", (event) => {
    searchQuery = event.target.value || "";
    renderMenu();
    updateCategoryCounts();
  });

  // Category buttons.
  $("#category-filters")?.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) return;

    activeCategory =
      button.dataset.category ||
      button.textContent.trim() ||
      "All Items";

    $$("#category-filters button").forEach((categoryButton) => {
      const selected =
        categoryButton === button ||
        categoryButton.dataset.category === activeCategory;

      categoryButton.classList.toggle("active", selected);
      categoryButton.setAttribute("aria-pressed", String(selected));
    });

    renderMenu();
    updateCategoryCounts();
  });

  // Support either radio buttons or a select for order type.
  $$('input[name="orderType"], #order-type').forEach((element) => {
    element.addEventListener("change", updateCheckoutFields);
  });

  // Checkout form.
  $("#checkout-form")?.addEventListener("submit", submitCheckout);

  // Order tracking form.
  $("#tracking-form")?.addEventListener("submit", trackOrder);

  // Escape closes the basket drawer.
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeCart();
    }
  });
}

/* =========================================================
   10. APPLICATION INITIALIZATION
   ========================================================= */

function initializeFoodCourtExpress() {
  bindEvents();
  renderCart();
  updateCheckoutFields();

  const initialFilter = $("#category-filters button[data-category='all']");
  if (initialFilter) {
    initialFilter.classList.add("active");
    initialFilter.setAttribute("aria-pressed", "true");
  }

  loadMenu();
}


if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializeFoodCourtExpress,
    { once: true }
  );
} else {
  initializeFoodCourtExpress();
}




