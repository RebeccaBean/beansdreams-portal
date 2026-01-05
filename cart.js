// cart.js - Shared cart logic for Bean's Dreams
document.addEventListener("DOMContentLoaded", () => {
  const cartSidebar = document.getElementById("cart");
  const cartItemsList = document.getElementById("cart-items");
  const cartTotalEl = document.getElementById("cart-total");
  const cartCountEl = document.getElementById("cart-count");
  const checkoutBtn = document.getElementById("checkout-btn");
  const cartToggle = document.getElementById("cart-toggle");
  const closeCartBtn = document.getElementById("close-cart");

  // PROMO CODE (string only)
  let appliedPromoCode = localStorage.getItem("beansDreamsPromoCode") || "";

  function savePromo() {
    localStorage.setItem("beansDreamsPromoCode", appliedPromoCode);
  }

  let cart = JSON.parse(localStorage.getItem("beansDreamsCart")) || [];

  function saveCart() {
    localStorage.setItem("beansDreamsCart", JSON.stringify(cart));
  }

  // Update Cart UI (with promo applied visually)
  function updateCartUI() {
    if (!cartItemsList) return;
    cartItemsList.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      cartItemsList.innerHTML = "<li>Your cart is empty.</li>";
    } else {
      cart.forEach((item, index) => {
        total += item.price * item.quantity;
        const li = document.createElement("li");
        li.textContent = `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;

        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.classList.add("remove-item-btn");
        removeBtn.addEventListener("click", () => {
          cart.splice(index, 1);
          saveCart();
          updateCartUI();
        });

        li.appendChild(removeBtn);
        cartItemsList.appendChild(li);
      });
    }

    // VISUAL PROMO DISPLAY ONLY (backend does real validation)
    let discountedTotal = total;

    if (appliedPromoCode) {
      // Simple visual rules (backend will enforce real rules)
      if (appliedPromoCode === "DREAM10") {
        discountedTotal = total * 0.9;
      }
      if (appliedPromoCode === "DREAM25") {
        discountedTotal = total * 0.75;
      }
      if (appliedPromoCode === "WELCOME5") {
        discountedTotal = Math.max(0, total - 5);
      }
      // FIRSTDREAM gives free credit, not a discount — no price change
    }

    if (cartTotalEl) cartTotalEl.textContent = discountedTotal.toFixed(2);
    if (cartCountEl) cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  // Add to Cart
  function addToCart(item) {
    const existing = cart.find(ci =>
      ci.bundleKey === item.bundleKey &&
      ci.productId === item.productId &&
      ci.printifyProductId === item.printifyProductId &&
      ci.printifyVariantId === item.printifyVariantId
    );

    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push(item);
    }

    saveCart();
    updateCartUI();
    openCart();
  }

  // Add-to-cart button handler
  document.body.addEventListener("click", (e) => {
    if (!e.target.classList.contains("add-cart-btn")) return;
    const btn = e.target;
    const item = {
      name: btn.getAttribute("data-name"),
      price: parseFloat(btn.getAttribute("data-price")) || 0,
      quantity: 1,
      type: btn.getAttribute("data-type") || "physical",
      bundleKey: btn.getAttribute("data-bundle-key") || null,
      productId: btn.getAttribute("data-product-id") || null,
      printifyProductId: btn.getAttribute("data-printify-product-id") || null,
      printifyVariantId: btn.getAttribute("data-variant-id") || null
    };
    addToCart(item);
  });

  // Cart open/close
  function openCart() {
    cartSidebar.classList.add("open");
    cartSidebar.setAttribute("aria-hidden", "false");
    if (cartToggle) cartToggle.setAttribute("aria-expanded", "true");
    trapFocus(cartSidebar);
  }

  function closeCart() {
    cartSidebar.classList.remove("open");
    cartSidebar.setAttribute("aria-hidden", "true");
    if (cartToggle) cartToggle.setAttribute("aria-expanded", "false");
    releaseFocusTrap();
  }

  if (cartToggle && cartSidebar) {
    cartToggle.addEventListener("click", () => {
      const isOpen = cartSidebar.classList.contains("open");
      if (isOpen) closeCart();
      else openCart();
    });
  }

  if (closeCartBtn && cartSidebar) {
    closeCartBtn.addEventListener("click", () => closeCart());
  }

  // Checkout button (normal checkout)
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
      }
      try {
        let headers = { "Content-Type": "application/json" };
        if (window.firebase && firebase.auth().currentUser) {
          const idToken = await firebase.auth().currentUser.getIdToken();
          headers.Authorization = `Bearer ${idToken}`;
        }
        const resp = await fetch("/capture-order", {
          method: "POST",
          headers,
          body: JSON.stringify({ cart, promo: appliedPromoCode })
        });
        const data = await resp.json();
        if (data.success) {
          alert(`Order confirmed! ID: ${data.orderId}`);
          cart = [];
          saveCart();
          updateCartUI();
          closeCart();
        } else {
          alert("Error: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error("Checkout failed", err);
        alert("Checkout failed. Please try again.");
      }
    });
  }

  // PayPal Buttons (main)
  if (window.paypal && typeof window.paypal.Buttons === "function") {
    try {
      window.paypal.Buttons({
        createOrder: (_data, actions) => {
          let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

          // VISUAL PROMO ONLY
          if (appliedPromoCode === "DREAM10") total *= 0.9;
          if (appliedPromoCode === "DREAM25") total *= 0.75;
          if (appliedPromoCode === "WELCOME5") total = Math.max(0, total - 5);

          return actions.order.create({
            purchase_units: [{ amount: { value: total.toFixed(2) } }]
          });
        },
        onApprove: async (_data, actions) => {
          const details = await actions.order.capture();
          try {
            let headers = { "Content-Type": "application/json" };
            if (window.firebase && firebase.auth().currentUser) {
              const idToken = await firebase.auth().currentUser.getIdToken();
              headers.Authorization = `Bearer ${idToken}`;
            }
            await fetch("/capture-order", {
              method: "POST",
              headers,
              body: JSON.stringify({ cart, order: details, promo: appliedPromoCode })
            });
            alert(`Transaction completed by ${details?.payer?.name?.given_name || "customer"}.`);
            cart = [];
            saveCart();
            updateCartUI();
            closeCart();
          } catch (err) {
            console.error("Error sending PayPal order to backend:", err);
          }
        }
      }).render("#paypal-button-container");
    } catch (e) {
      console.error("PayPal Buttons initialization error:", e);
    }
  }

  // Focus trap logic
  let focusTrapHandler = null;
  function trapFocus(container) {
    const focusableSelectors = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableEls = Array.from(container.querySelectorAll(focusableSelectors));
    if (focusableEls.length === 0) return;
    const firstEl = focusableEls[0];
    const lastEl = focusableEls[focusableEls.length - 1];
    focusTrapHandler = (e) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener("keydown", focusTrapHandler);
    firstEl.focus();
  }

  function releaseFocusTrap() {
    if (focusTrapHandler) {
      document.removeEventListener("keydown", focusTrapHandler);
      focusTrapHandler = null;
    }
  }

  // PROMO INPUT HANDLER
  const promoInput = document.getElementById("promo-input");
  const promoBtn = document.getElementById("apply-promo-btn");
  const promoMessage = document.getElementById("promo-message");

  if (promoBtn) {
    promoBtn.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();
      appliedPromoCode = code;
      savePromo();

      promoMessage.textContent = `Promo applied: ${code}`;
      promoMessage.style.color = "var(--blue-deep)";

      updateCartUI();
    });
  }

  updateCartUI();
});

// --- Hidden PayPal integration at bottom of cart.js ---
if (window.paypal && typeof window.paypal.Buttons === "function") {
  try {
    window.paypal.Buttons({
      createOrder: (_data, actions) => {
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // VISUAL PROMO ONLY
        if (appliedPromoCode === "DREAM10") total *= 0.9;
        if (appliedPromoCode === "DREAM25") total *= 0.75;
        if (appliedPromoCode === "WELCOME5") total = Math.max(0, total - 5);

        return actions.order.create({
          purchase_units: [{ amount: { value: total.toFixed(2) } }]
        });
      },
      onApprove: async (_data, actions) => {
        const details = await actions.order.capture();
        try {
          let headers = { "Content-Type": "application/json" };
          if (window.firebase && firebase.auth().currentUser) {
            const idToken = await firebase.auth().currentUser.getIdToken();
            headers.Authorization = `Bearer ${idToken}`;
          }
          await fetch("/capture-order", {
            method: "POST",
            headers,
            body: JSON.stringify({ cart, order: details, promo: appliedPromoCode })
          });
          alert(`Transaction completed by ${details?.payer?.name?.given_name || "customer"}.`);
          cart = [];
          saveCart();
          updateCartUI();
          closeCart();
        } catch (err) {
          console.error("Error sending PayPal order to backend:", err);
        }
      }
    }).render("#hidden-paypal");
  } catch (e) {
    console.error("PayPal Buttons initialization error:", e);
  }
}
