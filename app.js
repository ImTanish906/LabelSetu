/* =========================================================
   app.js — shared logic across all pages
   Everything using localStorage here is a MOCK for demo purposes.
   Replace with real API calls to your backend when it's ready.
   ========================================================= */

/* ---------- Theme (dark/light) ---------- */
function initTheme() {
  const saved = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  const btn = document.getElementById("themeToggleBtn");
  if (btn) btn.textContent = next === "dark" ? "☀ Light" : "🌙 Dark";
}

/* ---------- Mock auth ----------
   Real version: replace with calls to your backend's /signup and /login
   endpoints, and store a real session token instead of a flag. */
function mockSignup(name, email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  if (users.find(u => u.email === email)) {
    return { ok: false, error: "An account with this email already exists." };
  }
  users.push({ name, email, password }); // demo only — never store plain passwords for real
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify({ name, email }));
  return { ok: true };
}

function mockLogin(email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return { ok: false, error: "Incorrect email or password." };
  localStorage.setItem("currentUser", JSON.stringify({ name: user.name, email: user.email }));
  return { ok: true };
}

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  return raw ? JSON.parse(raw) : null;
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

/* Redirect to login if not authenticated — call at top of protected pages */
function requireAuth() {
  if (!getCurrentUser()) {
    window.location.href = "login.html";
  }
}

/* ---------- Mock rule data ----------
   Real version: this table becomes rows in your rule engine's database,
   versioned by effective date. Keeping it as data (not hardcoded logic)
   is the whole point — updating a rule should not require redeploying code. */
const RULES = {
  food: ["MRP", "Net quantity", "Consumer care contact"],
  cosmetics: ["Manufacturer name & address", "MRP", "Net quantity", "Country of origin", "Consumer care contact", "Manufacturing date"],
  general: ["Manufacturer name & address", "MRP", "Net quantity", "Country of origin", "Consumer care contact", "Manufacturing date", "Generic name"]
};

/* ---------- Mock OCR + rule check ----------
   Real version: send the uploaded image + category to your backend,
   which runs OCR, extracts fields, and returns a verdict like this. */
function mockRunCheck(category, imageDataUrl) {
  const requiredFields = RULES[category] || RULES.general;
  const results = requiredFields.map(field => {
    const present = Math.random() > 0.3; // fake pass/fail for demo
    return {
      field,
      present,
      value: present ? mockFakeValue(field) : null
    };
  });
  const scan = {
    id: Date.now(),
    category,
    image: imageDataUrl,
    results,
    missingCount: results.filter(r => !r.present).length,
    timestamp: new Date().toISOString()
  };

  const scans = JSON.parse(localStorage.getItem("scans") || "[]");
  scans.unshift(scan);
  localStorage.setItem("scans", JSON.stringify(scans));
  localStorage.setItem("lastScanId", scan.id);
  return scan;
}

function mockFakeValue(field) {
  const samples = {
    "MRP": "₹149",
    "Net quantity": "250 g",
    "Consumer care contact": "1800-XXX-XXXX",
    "Manufacturer name & address": "Acme Foods Pvt Ltd, Mumbai",
    "Country of origin": "India",
    "Manufacturing date": "07/2026",
    "Generic name": "Namkeen mixture"
  };
  return samples[field] || "Detected";
}

function getScanById(id) {
  const scans = JSON.parse(localStorage.getItem("scans") || "[]");
  return scans.find(s => String(s.id) === String(id));
}

function getAllScans() {
  return JSON.parse(localStorage.getItem("scans") || "[]");
}

/* ---------- Nav highlight ---------- */
function highlightActiveNav() {
  const page = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.getAttribute("href") === page) a.classList.add("active");
  });
}

/* ---------- Run on every page load ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  highlightActiveNav();
  const themeBtn = document.getElementById("themeToggleBtn");
  if (themeBtn) {
    themeBtn.textContent = document.documentElement.getAttribute("data-theme") === "dark" ? "☀ Light" : "🌙 Dark";
    themeBtn.addEventListener("click", toggleTheme);
  }
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
