// Toggle forms
function showForm(id) {
  document.querySelectorAll('.form-container').forEach(div => div.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// Base API URL
const API = "https://beansdreams-backend.onrender.com";

// SIGN IN
document.getElementById('signinForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('signinEmail').value;
  const password = document.getElementById('signinPassword').value;

  const res = await fetch(`${API}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    window.location.href = "/dashboard/student.html";
  } else {
    document.getElementById("signinMessage").innerText = data.error || "Error signing in";
  }
});

// SIGN UP
document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  const res = await fetch(`${API}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  document.getElementById("signupMessage").innerText =
    res.ok ? `Signed up: ${data.email}` : data.error || "Error signing up";
});

// FORGOT PASSWORD
document.getElementById('forgotForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('forgotEmail').value;

  const res = await fetch(`${API}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  document.getElementById("forgotMessage").innerText = data.message || data.error;
});

// RESET PASSWORD
document.getElementById('resetForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = document.getElementById('resetToken').value;
  const newPassword = document.getElementById('newPassword').value;

  const res = await fetch(`${API}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword })
  });

  const data = await res.json();
  document.getElementById("resetMessage").innerText = data.message || data.error;
});
