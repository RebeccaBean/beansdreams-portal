const API = "http://localhost:5000/api/admin";
let token = localStorage.getItem("adminToken");

// Elements
const loginScreen = document.getElementById("login-screen");
const adminScreen = document.getElementById("admin-screen");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const loginError = document.getElementById("login-error");

// Login
loginBtn.onclick = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    token = data.token;
    localStorage.setItem("adminToken", token);

    showAdmin();
    loadDashboard();
  } catch (err) {
    loginError.textContent = err.message;
  }
};

// Logout
logoutBtn.onclick = () => {
  localStorage.removeItem("adminToken");
  token = null;
  showLogin();
};

// Show screens
function showLogin() {
  loginScreen.classList.remove("hidden");
  adminScreen.classList.add("hidden");
}

function showAdmin() {
  loginScreen.classList.add("hidden");
  adminScreen.classList.remove("hidden");
}

// Auto-login if token exists
if (token) {
  showAdmin();
  loadDashboard();
}

// Fetch helper
async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
}

/* ===========================
   DASHBOARD
=========================== */
async function loadDashboard() {
  try {
    const data = await api("/dashboard");

    document.getElementById("stat-students").textContent = data.stats.students;
    document.getElementById("stat-orders").textContent = data.stats.orders;
    document.getElementById("stat-subscriptions").textContent = data.stats.subscriptions;

    const pending =
      data.stats.pending.credits +
      data.stats.pending.downloads +
      data.stats.pending.orders +
      data.stats.pending.subscriptions;

    document.getElementById("stat-pending").textContent = pending;
  } catch (err) {
    console.error(err);
  }
}

/* ===========================
   STUDENTS
=========================== */
const studentsSection = document.getElementById("students-section");
const dashboardSection = document.getElementById("dashboard-section");
const studentTableBody = document.querySelector("#students-table tbody");
const studentDetail = document.getElementById("student-detail");

document.querySelector("nav").onclick = (e) => {
  if (!e.target.dataset.section) return;

  document.querySelectorAll(".section").forEach(s => s.classList.add("hidden"));
  document.getElementById(`${e.target.dataset.section}-section`).classList.remove("hidden");

  if (e.target.dataset.section === "students") loadStudents();
};

async function loadStudents() {
  const search = document.getElementById("student-search").value;
  const data = await api(`/students?search=${encodeURIComponent(search)}`);

  studentTableBody.innerHTML = "";
  data.students.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${s.name || ""}</td>
      <td>${s.email}</td>
      <td>${s.role}</td>
      <td><button data-id="${s.id}" class="view-btn">View</button></td>
    `;
    studentTableBody.appendChild(row);
  });
}

document.getElementById("search-btn").onclick = loadStudents;

studentTableBody.onclick = (e) => {
  if (e.target.classList.contains("view-btn")) {
    loadStudentDetail(e.target.dataset.id);
  }
};

async function loadStudentDetail(id) {
  const data = await api(`/students/${id}`);

  studentDetail.classList.remove("hidden");
  studentDetail.dataset.id = id;

  document.getElementById("student-name").textContent = data.student.name;
  document.getElementById("student-email").textContent = data.student.email;
}

/* ===========================
   STUDENT ACTIONS
=========================== */

// Add credits
document.getElementById("add-credit-btn").onclick = async () => {
  const id = studentDetail.dataset.id;
  const delta = document.getElementById("credit-amount").value;

  await api(`/students/${id}/credits`, {
    method: "POST",
    body: JSON.stringify({ delta: Number(delta) })
  });

  alert("Credits added");
};

// Add note
document.getElementById("add-note-btn").onclick = async () => {
  const id = studentDetail.dataset.id;
  const note = document.getElementById("note-text").value;

  await api(`/students/${id}/notes`, {
    method: "POST",
    body: JSON.stringify({ note })
  });

  alert("Note added");
};

// Assign download
document.getElementById("assign-download-btn").onclick = async () => {
  const id = studentDetail.dataset.id;
  const productId = document.getElementById("download-product").value;

  await api(`/students/${id}/downloads`, {
    method: "POST",
    body: JSON.stringify({ productId })
  });

  alert("Download assigned");
};

// Assign custom file
document.getElementById("assign-custom-btn").onclick = async () => {
  const id = studentDetail.dataset.id;
  const fileId = document.getElementById("custom-file-id").value;
  const label = document.getElementById("custom-label").value;

  await api(`/students/${id}/downloads/custom`, {
    method: "POST",
    body: JSON.stringify({ fileId, label })
  });

  alert("Custom file assigned");
};
