// ===============================
// CONFIG
// ===============================

const BACKEND_URL = "https://beansdreams.org"; 
const PORTAL_API = "https://portal.beansdreams.org/api";

function getToken() {
  return localStorage.getItem("token");
}

// left-nav.js (include after DOM load)
document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("left-nav");
  const toggle = document.getElementById("left-nav-toggle");
  const navLinks = Array.from(document.querySelectorAll(".left-nav-item"));
  const sectionIds = navLinks.map(a => a.getAttribute("href")).filter(Boolean);
  const sections = sectionIds.map(id => document.querySelector(id)).filter(Boolean);

  // Smooth scroll on click
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;

      if (nav.classList.contains("open")) {
        nav.classList.remove("open");
        if (toggle) toggle.setAttribute("aria-expanded", "false");
      }

      const rect = target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const top = rect.top + scrollTop - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // IntersectionObserver for active state
  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = document.querySelector(`.left-nav-item[href="#${id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          document.querySelectorAll(".left-nav-item.active").forEach(n => n.classList.remove("active"));
          link.classList.add("active");
        }
      });
    }, {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    });
    sections.forEach(s => observer.observe(s));
  } else {
    window.addEventListener("scroll", () => {
      let current = null;
      sections.forEach(section => {
        const top = section.getBoundingClientRect().top;
        if (top <= 120) current = section;
      });
      if (current) {
        document.querySelectorAll(".left-nav-item.active").forEach(n => n.classList.remove("active"));
        const link = document.querySelector(`.left-nav-item[href="#${current.id}"]`);
        if (link) link.classList.add("active");
      }
    });
  }

  // Toggle for mobile
  if (toggle) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Close nav when clicking outside on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth > 980) return;
    if (!nav.classList.contains("open")) return;
    if (nav.contains(e.target) || (toggle && toggle.contains(e.target))) return;
    nav.classList.remove("open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
  });
});


// ===============================
// SUBSCRIPTIONS
// ===============================

document.querySelectorAll("[data-sub]").forEach(button => {
  button.addEventListener("click", async () => {
    const type = button.dataset.sub; // "classPass" or "coachingPass"
    const token = getToken();

    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/create-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ type })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Unable to start subscription.");
        return;
      }

      const approvalUrl = data?.links?.find(l => l.rel === "approve")?.href;
      if (!approvalUrl) {
        alert("Unable to connect to PayPal.");
        return;
      }

      window.location.href = approvalUrl;

    } catch (err) {
      console.error(err);
      alert("Subscription failed.");
    }
  });
});



// ===============================
// BUNDLE PURCHASES
// ===============================

document.querySelectorAll(".bundle-card .add-cart-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const bundleKey = btn.dataset.bundleKey;
  // now matches backend keys
    const price = Number(btn.dataset.price);
    const name = btn.dataset.name;

    const token = getToken();
    if (!token) {
      alert("Please log in first.");
      return;
    }

    try {
      const resp = await fetch(`${BACKEND_URL}/paypal/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ bundleKey, amount: price, name })
      });

      const data = await resp.json();

      if (!resp.ok) {
        alert(data.error || "Unable to create PayPal order.");
        return;
      }

      const approvalUrl = data?.links?.find(l => l.rel === "approve")?.href;
      if (!approvalUrl) {
        alert("Unable to connect to PayPal.");
        return;
      }

      window.location.href = approvalUrl;

    } catch (err) {
      console.error(err);
      alert("Bundle purchase failed.");
    }
  });
});



// ===============================
// SINGLE CLASS PURCHASES
// ===============================

document.querySelectorAll(".single-class .add-cart-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    const token = getToken();
    if (!token) {
      alert("Please log in first.");
      return;
    }

    const className = btn.dataset.name;
    const classType = JSON.parse(btn.dataset.type)[0];
    const amount = Number(btn.dataset.price);

    try {
      const orderResp = await fetch(`${BACKEND_URL}/paypal/create-order-single`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          className,
          classType,
          amount
        })
      });

      const orderData = await orderResp.json();

      if (!orderResp.ok) {
        alert(orderData.error || "Unable to create PayPal order.");
        return;
      }

      const approvalUrl = orderData?.links?.find(l => l.rel === "approve")?.href;
      if (!approvalUrl) {
        alert("Unable to connect to PayPal.");
        return;
      }

      window.location.href = approvalUrl;

    } catch (err) {
      console.error(err);
      alert("Single class purchase failed.");
    }
  });
});
