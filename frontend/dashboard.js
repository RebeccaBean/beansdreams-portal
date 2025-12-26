/* ============================================================
   ✅ CONFIG + API WRAPPER
============================================================ */
const API_BASE = "http://localhost:5000";

/* Ensure user is logged in */
function ensureAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "/auth.html";
  }
  return token;
}

/* Generic API wrapper */
async function api(endpoint, method = "GET", body = null, isFormData = false) {
  const token = ensureAuth();

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  if (body && !isFormData) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  if (body && isFormData) {
    options.body = body;
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
   ✅ LOAD CURRENT USER + DASHBOARD
============================================================ */
async function loadCurrentUser() {
  try {
    const user = await api("/auth/me");

    document.getElementById("studentName").innerText = user.name || "Student";
    document.getElementById("studentEmail").innerText = user.email || "";

    // Referral link
    const referralLink = `${window.location.origin}/auth.html?ref=${encodeURIComponent(
      user.id
    )}`;
    document.getElementById("referralLink").value = referralLink;

    await loadDashboard(user.id);
  } catch (err) {
    console.error(err);
    localStorage.removeItem("token");
    window.location.href = "/auth.html";
  }
}

/* ============================================================
   ✅ UNIFIED DASHBOARD LOADER
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
   ✅ BILLING
============================================================ */
function loadBilling(data) {
  const sub = data.subscriptions?.[0];

  document.getElementById("billingPlan").innerText =
    sub?.planType || "No active plan";

  document.getElementById("billingNext").innerText =
    sub?.nextBillingDate || "Not scheduled";
}

/* ============================================================
   ✅ CREDITS
============================================================ */
function loadCredits(data) {
  const total = data.remainingCredits?.total ?? 0;
  document.getElementById("creditsCount").innerText = total;
}
function loadCredits(data) {
  const byType = data.remainingCredits?.byType || {};

  // Map backend credit keys → DOM element IDs
  const creditMap = {
    Dance: "danceCredits",
    Vocal: "vocalCredits",
    Guitar: "guitarCredits",
    Any: "anyCredits",
    Healing: "healingCredits",
    Coaching: "coachingCredits"
  };

  // Update each credit type
  Object.entries(creditMap).forEach(([type, elementId]) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerText = byType[type] ?? 0;
    }
  });

  // ✅ Healing & Coaching multipliers (if included in backend)
  if (data.remainingCredits?.multipliers) {
    const { Healing: healMult, Coaching: coachMult } =
      data.remainingCredits.multipliers;

    if (healMult !== undefined) {
      const healVal = document.getElementById("healingValue");
      if (healVal) healVal.innerText = healMult;
    }

    if (coachMult !== undefined) {
      const coachVal = document.getElementById("coachingValue");
      if (coachVal) coachVal.innerText = coachMult;
    }
  }

  // ✅ Active subscription plan (optional)
  const activePlan = document.getElementById("activePlan");
  if (activePlan) {
    const sub = data.subscriptions?.[0];
    activePlan.innerText = sub?.planType || "None";
  }

  // ✅ Purchased bundles (optional)
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
      li.textContent = `Order #${order.id} — ${order.cart?.length || 0} items`;
      bundleList.appendChild(li);
    });
  }
}

/* ============================================================
   ✅ DOWNLOADS
============================================================ */
function loadDownloads(data) {
  const downloads = data.downloads || [];
  const list = document.getElementById("downloadsList");
  list.innerHTML = "";

  if (!downloads.length) {
    list.innerHTML = "<li>No downloads yet.</li>";
    return;
  }

  downloads.forEach((d) => {
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
   ✅ ORDERS
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

  orders.forEach((o) => {
    const li = document.createElement("li");
    li.textContent = `Order #${o.id} — ${o.status}`;
    list.appendChild(li);
  });
}

/* ============================================================
   ✅ SUBSCRIPTIONS
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

  subs.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.planType} — ${s.status}`;
    list.appendChild(li);
  });
}

/* ============================================================
   ✅ ACHIEVEMENT BADGES
============================================================ */
function loadAchievementBadges(data) {
  const list = document.getElementById("achievementBadgesList");
  list.innerHTML = "";

  const achievements = data.achievements || [];

  if (!achievements.length) {
    list.innerHTML = "<li>No achievement badges yet. Keep practicing!</li>";
    return;
  }

  achievements.forEach((a) => {
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
   ✅ INSTRUCTOR NOTES
============================================================ */
function loadInstructorNotes(data) {
  const notes = data.instructorNotes || [];
  const box = document.getElementById("instructorNotes");
  box.innerHTML = "";

  if (!notes.length) {
    box.innerHTML = "<p>No notes from your instructor yet.</p>";
    return;
  }

  notes.forEach((n) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${new Date(n.created_at).toLocaleDateString()}:</strong> ${
      n.note
    }`;
    box.appendChild(p);
  });
}

/* ============================================================
   ✅ STUDENT NOTES
============================================================ */
function loadStudentNotes(data) {
  const note = data.studentNotes?.note || "";
  document.getElementById("studentNotesInput").value = note;
}

document.getElementById("saveNotesBtn").addEventListener("click", async () => {
  const notes = document.getElementById("studentNotesInput").value;
  const status = document.getElementById("notesStatus");

  try {
    await api("/students/me/student-notes", "POST", { note: notes });
    status.textContent = "Notes saved.";
  } catch (err) {
    status.textContent = "Error saving notes.";
  }

  setTimeout(() => (status.textContent = ""), 2000);
});

/* ============================================================
   ✅ SESSION LINKS
============================================================ */
function loadSessionLinks(data) {
  const links = data.sessionLinks || {};

  document.getElementById("calendlyLink").value = links.calendly || "";
  document.getElementById("googleMeetLink").value = links.googleMeet || "";
  document.getElementById("zoomLink").value = links.zoom || "";
}

document.getElementById("saveSessionLinksBtn").addEventListener("click", async () => {
  const calendly = document.getElementById("calendlyLink").value;
  const googleMeet = document.getElementById("googleMeetLink").value;
  const zoom = document.getElementById("zoomLink").value;

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
});

/* ============================================================
   ✅ NEXT SESSION
============================================================ */
function loadNextSession(data) {
  const infoEl = document.getElementById("nextSessionInfo");
  const joinBtn = document.getElementById("joinSessionBtn");

  const next = data.nextSession;

  if (!next || !next.dateTime) {
    infoEl.textContent = "No upcoming session scheduled.";
    joinBtn.classList.add("hidden");
    return;
  }

  const dt = new Date(next.dateTime);
  infoEl.textContent = `${dt.toLocaleDateString()} at ${dt.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;

  if (next.joinUrl) {
    joinBtn.href = next.joinUrl;
    joinBtn.classList.remove("hidden");
  } else {
    joinBtn.classList.add("hidden");
  }
}

/* ============================================================
   ✅ REFERRAL LINK COPY
============================================================ */
document.getElementById("copyReferralBtn").addEventListener("click", () => {
  const input = document.getElementById("referralLink");
  input.select();
  input.setSelectionRange(0, 99999);
  navigator.clipboard
    .writeText(input.value)
    .then(() => alert("Referral link copied!"))
    .catch(() => alert("Unable to copy referral link."));
});

/* ============================================================
   ✅ LOGOUT
============================================================ */
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/auth.html";
});

/* ============================================================
   ✅ INIT
============================================================ */
document.addEventListener("DOMContentLoaded", loadCurrentUser);
