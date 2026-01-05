/* ============================================================
   CONFIG + API WRAPPER
============================================================ */
const AUTH_BASE = "http://localhost:5000";
const API_BASE = "http://localhost:5000/api";

/* Ensure user is logged in */
function ensureAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/auth.html";
  }
  return token;
}

/* Generic API wrapper (for /api endpoints) */
async function api(endpoint, method = "GET", body = null) {
  const token = ensureAuth();

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, options);

  if (!res.ok) {
    let errMsg = "Request failed";
    try {
      const errData = await res.json();
      errMsg = errData.error || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  return res.json();
}

/* ============================================================
   UI HELPERS
============================================================ */

// Safe text setter
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerText = value ?? "";
}

// Safe HTML setter
function setHTML(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value ?? "";
}

// Create element helper
function createEl(tag, className = "", text = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.innerText = text;
  return el;
}

// Date/time formatters
function formatDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleDateString();
}

function formatTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// Show/hide by id
function show(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("hidden");
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("hidden");
}

/* ============================================================
   HAMBURGER MENU TOGGLE
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");

  if (menuBtn && sidebar) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
    });
  }
});

/* ============================================================
   LOAD CURRENT USER + DASHBOARD
============================================================ */
async function loadCurrentUser() {
  try {
    const token = ensureAuth();

    // auth/me is NOT under /api
    const res = await fetch(`${AUTH_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      throw new Error("Failed to load user");
    }

    const user = await res.json();

    setText("studentName", user.name || "Student");
    setText("studentEmail", user.email || "");

    // Referral link
    const referralLink = `${window.location.origin}/auth.html?ref=${encodeURIComponent(
      user.id
    )}`;
    const referralInput = document.getElementById("referralLink");
    if (referralInput) referralInput.value = referralLink;

    await loadDashboard(user.id);
    await loadBadges(user.id);
    await loadNotifications();
  } catch (err) {
    console.error(err);
    localStorage.removeItem("token");
    window.location.href = "/auth.html";
  }
}

/* ============================================================
   UNIFIED DASHBOARD LOADER
============================================================ */
async function loadDashboard(uid) {
  try {
    const data = await api(`/students/${uid}/dashboard`);

    loadBilling(data);
    loadCredits(data);
    loadDownloads(data);
    loadOrders(data);
    loadSubscriptions(data);
    loadAchievementBadges(data);
    loadInstructorNotes(data);
    loadStudentNotes(data);
    loadSessionLinks(data);
    loadNextSession(data);
  } catch (err) {
    console.error("Dashboard load error:", err);
  }
}

/* ============================================================
   BILLING
============================================================ */
function loadBilling(data) {
  const sub = data.subscriptions?.[0];
  setText("billingPlan", sub?.planType || "No active plan");
  setText("billingNext", sub?.nextBillingDate || "Not scheduled");
}

/* ============================================================
   CREDITS
============================================================ */
function loadCredits(data) {
  const remaining = data.remainingCredits || {};
  const total = remaining.total ?? 0;

  setText("creditsCount", total);

  const byType = remaining.byType || {};

  const creditMap = {
    Dance: "danceCredits",
    Vocal: "vocalCredits",
    Guitar: "guitarCredits",
    Any: "anyCredits",
    Healing: "healingCredits",
    Coaching: "coachingCredits"
  };

  Object.entries(creditMap).forEach(([type, elementId]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerText = byType[type] ?? 0;
    }
  });

  // Healing & Coaching multipliers (if present)
  if (remaining.multipliers) {
    const { Healing: healMult, Coaching: coachMult } = remaining.multipliers;

    const healVal = document.getElementById("healingValue");
    if (healVal && healMult !== undefined) healVal.innerText = healMult;

    const coachVal = document.getElementById("coachingValue");
    if (coachVal && coachMult !== undefined) coachVal.innerText = coachMult;
  }

  // Active subscription plan (optional)
  const activePlan = document.getElementById("activePlan");
  if (activePlan) {
    const sub = data.subscriptions?.[0];
    activePlan.innerText = sub?.planType || "None";
  }

  // Purchased bundles (optional)
  const bundleList = document.getElementById("bundleList");
  if (bundleList) {
    bundleList.innerHTML = "";

    const bundles = data.orders?.filter(o => o.status === "completed") || [];

    if (!bundles.length) {
      bundleList.innerHTML = "<li>No bundles purchased yet.</li>";
      return;
    }

    bundles.forEach(order => {
      const li = document.createElement("li");
      li.textContent = `Order #${order.id} — ${
        order.cart?.length || order.items?.length || 0
      } items`;
      bundleList.appendChild(li);
    });
  }
}

/* ============================================================
   DOWNLOADS
============================================================ */
function loadDownloads(data) {
  const downloads = data.downloads || [];
  const list = document.getElementById("downloadsList");
  if (!list) return;

  list.innerHTML = "";

  if (!downloads.length) {
    list.innerHTML = "<li>No downloads yet.</li>";
    return;
  }

  downloads.forEach(d => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = d.url || "#";
    a.textContent = d.productId || "Download";
    a.target = "_blank";

    li.appendChild(a);
    list.appendChild(li);
  });
}

/* ============================================================
   ORDERS
============================================================ */
function loadOrders(data) {
  const orders = data.orders || [];
  const list = document.getElementById("ordersList");
  if (!list) return;

  list.innerHTML = "";

  if (!orders.length) {
    list.innerHTML = "<li>No orders yet.</li>";
    return;
  }

  orders.forEach(o => {
    const li = document.createElement("li");
    li.textContent = `Order #${o.id} — ${o.status}`;
    list.appendChild(li);
  });
}

/* ============================================================
   SUBSCRIPTIONS
============================================================ */
function loadSubscriptions(data) {
  const subs = data.subscriptions || [];
  const list = document.getElementById("subscriptionsList");
  if (!list) return;

  list.innerHTML = "";

  if (!subs.length) {
    list.innerHTML = "<li>No subscriptions yet.</li>";
    return;
  }

  subs.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.planType} — ${s.status}`;
    list.appendChild(li);
  });
}

/* ============================================================
   ACHIEVEMENT BADGES (from dashboard data.achievements)
============================================================ */
function loadAchievementBadges(data) {
  const list = document.getElementById("achievementBadgesList");
  if (!list) return;

  list.innerHTML = "";

  const achievements = data.achievements || [];

  if (!achievements.length) {
    list.innerHTML = "<li>No achievement badges yet. Keep practicing!</li>";
    return;
  }

  achievements.forEach(a => {
    const li = document.createElement("li");

    const icon = document.createElement("div");
    icon.className = "badge-icon";
    icon.textContent = "★";

    const label = document.createElement("span");
    label.className = "badge-label";
    label.textContent = a.badge_name || "Badge";

    li.appendChild(icon);
    li.appendChild(label);
    list.appendChild(li);
  });
}

/* ============================================================
   BADGE RENDER HELPERS (from /students/:uid/badges)
============================================================ */
function renderAchievementBadgesWithProgress(progress) {
  const list = document.getElementById("achievementBadgesList");
  if (!list) return;

  list.innerHTML = "";

  const entries = Object.entries(progress || {}).filter(
    ([key]) => !key.toLowerCase().includes("referral")
  );

  if (!entries.length) {
    list.innerHTML = "<li>No achievement badges yet. Keep going!</li>";
    return;
  }

  entries.forEach(([key, value]) => {
    const li = createEl("li", "badge-item");
    li.innerHTML = `
      <div class="badge-icon">★</div>
      <div class="badge-info">
        <span class="badge-name">${key}</span>
        <span class="badge-progress">${value}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

function renderReferralBadgesWithProgress(progress) {
  const list = document.getElementById("referralBadgesList");
  if (!list) return;

  list.innerHTML = "";

  const entries = Object.entries(progress || {}).filter(([key]) =>
    key.toLowerCase().includes("referral")
  );

  if (!entries.length) {
    list.innerHTML = "<li>No referral badges yet. Share your link!</li>";
    return;
  }

  entries.forEach(([key, value]) => {
    const li = createEl("li", "badge-item");
    li.innerHTML = `
      <div class="badge-icon">👥</div>
      <div class="badge-info">
        <span class="badge-name">${key}</span>
        <span class="badge-progress">${value}</span>
      </div>
    `;
    list.appendChild(li);
  });
}

/* ============================================================
   LOAD BADGES (from badge API)
============================================================ */
async function loadBadges(uid) {
  try {
    const data = await api(`/students/${uid}/badges`);
    renderAchievementBadgesWithProgress(data.progress);
    renderReferralBadgesWithProgress(data.progress);
  } catch (err) {
    console.error("Error loading badges:", err);
  }
}

/* ============================================================
   INSTRUCTOR NOTES
============================================================ */
function loadInstructorNotes(data) {
  const notes = data.instructorNotes || [];
  const box = document.getElementById("instructorNotes");
  if (!box) return;

  box.innerHTML = "";

  if (!notes.length) {
    box.innerHTML = "<p>No notes from your instructor yet.</p>";
    return;
  }

  notes.forEach(n => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${formatDate(n.created_at)}:</strong> ${n.note}`;
    box.appendChild(p);
  });
}

/* ============================================================
   STUDENT NOTES
============================================================ */
function loadStudentNotes(data) {
  const note = data.studentNotes?.note || "";
  const input = document.getElementById("studentNotesInput");
  if (input) input.value = note;
}

async function saveStudentNotes() {
  const notesInput = document.getElementById("studentNotesInput");
  const status = document.getElementById("notesStatus");
  if (!notesInput) return;

  const note = notesInput.value;

  try {
    await api("/students/me/student-notes", "POST", { note });
    if (status) status.textContent = "Notes saved.";
  } catch (err) {
    if (status) status.textContent = "Error saving notes.";
  }

  setTimeout(() => {
    if (status) status.textContent = "";
  }, 2000);
}

/* ============================================================
   SESSION LINKS
============================================================ */
function loadSessionLinks(data) {
  const links = data.sessionLinks || {};

  const calendlyEl = document.getElementById("calendlyLink");
  const googleMeetEl = document.getElementById("googleMeetLink");
  const zoomEl = document.getElementById("zoomLink");

  if (calendlyEl) calendlyEl.value = links.calendly || "";
  if (googleMeetEl) googleMeetEl.value = links.googleMeet || "";
  if (zoomEl) zoomEl.value = links.zoom || "";
}

async function saveSessionLinks() {
  const calendly = document.getElementById("calendlyLink")?.value || "";
  const googleMeet = document.getElementById("googleMeetLink")?.value || "";
  const zoom = document.getElementById("zoomLink")?.value || "";

  try {
    await api("/students/me/session-links", "POST", {
      calendly,
      googleMeet,
      zoom
    });
    alert("Session links saved.");
  } catch (err) {
    alert("Error saving session links: " + err.message);
  }
}

/* ============================================================
   NEXT SESSION
============================================================ */
function loadNextSession(data) {
  const infoEl = document.getElementById("nextSessionInfo");
  const joinBtn = document.getElementById("joinSessionBtn");

  const next = data.nextSession;

  if (!infoEl || !joinBtn) return;

  if (!next || !next.dateTime) {
    infoEl.textContent = "No upcoming session scheduled.";
    joinBtn.classList.add("hidden");
    return;
  }

  infoEl.textContent = `${formatDate(next.dateTime)} at ${formatTime(
    next.dateTime
  )}`;

  if (next.joinUrl) {
    joinBtn.href = next.joinUrl;
    joinBtn.classList.remove("hidden");
  } else {
    joinBtn.classList.add("hidden");
  }
}

/* ============================================================
   REFERRAL LINK COPY
============================================================ */
function setupReferralCopy() {
  const btn = document.getElementById("copyReferralBtn");
  const input = document.getElementById("referralLink");
  if (!btn || !input) return;

  btn.addEventListener("click", () => {
    input.select();
    input.setSelectionRange(0, 99999);
    navigator.clipboard
      .writeText(input.value)
      .then(() => alert("Referral link copied!"))
      .catch(() => alert("Unable to copy referral link."));
  });
}

/* ============================================================
   LOGOUT
============================================================ */
function setupLogout() {
  const btn = document.getElementById("logoutBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    localStorage.removeItem("token");
    window.location.href = "/auth.html";
  });
}

/* ============================================================
   BUY CREDITS BUTTON
============================================================ */
function setupBuyCredits() {
  const btn = document.getElementById("buyCreditsBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    window.location.href = "/buy-credits.html";
  });
}

/* ============================================================
   NOTIFICATIONS
============================================================ */
async function loadNotifications() {
  try {
    const token = ensureAuth();
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to load notifications");
    const data = await res.json();
    renderNotifications(data.notifications || []);
  } catch (err) {
    console.error("Error loading notifications:", err);
  }
}

function renderNotifications(notifications) {
  const box = document.getElementById("notificationsBox");
  if (!box) return;

  box.innerHTML = "";

  if (!notifications.length) {
    box.innerHTML = "<p>No notifications yet.</p>";
    return;
  }

  notifications.forEach(n => {
    const div = document.createElement("div");
    div.className = n.read ? "notif read" : "notif unread";
    div.innerText = n.message;
    div.addEventListener("click", () => markNotificationRead(n.id));
    box.appendChild(div);
  });
}

async function markNotificationRead(id) {
  try {
    const token = ensureAuth();
    await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` }
    });
    await loadNotifications();
  } catch (err) {
    console.error("Error marking notification read:", err);
  }
}

/* ============================================================
   INIT
============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  loadCurrentUser();

  // Student notes save button
  const saveNotesBtn = document.getElementById("saveNotesBtn");
  if (saveNotesBtn) {
    saveNotesBtn.addEventListener("click", saveStudentNotes);
  }

  // Session links save button
  const saveSessionLinksBtn = document.getElementById("saveSessionLinksBtn");
  if (saveSessionLinksBtn) {
    saveSessionLinksBtn.addEventListener("click", saveSessionLinks);
  }

  setupReferralCopy();
  setupLogout();
  setupBuyCredits();
});
