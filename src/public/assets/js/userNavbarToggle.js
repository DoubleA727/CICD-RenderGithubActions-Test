// userNavbarToggle.js

// Helper: decode JWT payload (without verifying signature, just to read exp)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to parse JWT:", e);
    return null;
  }
}

// Helper: check if token is expired based on exp claim
function isTokenExpired(token) {
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    // if no exp, treat as expired / invalid
    return true;
  }

  const nowMs = Date.now();
  const expMs = payload.exp * 1000; // exp is in seconds

  return nowMs >= expMs;
}

function applyNavbarToggle() {
  const loginButton = document.getElementById("loginButton");
  const registerButton = document.getElementById("registerButton");
  const profileButton = document.getElementById("profileButton");
  const logoutButton = document.getElementById("logoutButton");
  const adminButton = document.getElementById("adminButton");

  let token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  // 🔐 If token exists but is expired/invalid -> clear it and treat as logged out
  if (token && isTokenExpired(token)) {
    console.warn("JWT expired – clearing token and role from localStorage");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    token = null;
    role = null;
  }

  if (token) {
    // logged in
    loginButton?.classList.add("d-none");
    registerButton?.classList.add("d-none");

    profileButton?.classList.remove("d-none");
    logoutButton?.classList.remove("d-none");

    // show admin button only if role === 'admin'
    if (adminButton) {
      if (role === "admin") {
        adminButton.classList.remove("d-none");
      } else {
        adminButton.classList.add("d-none");
      }
    }
  } else {
    // logged out
    loginButton?.classList.remove("d-none");
    registerButton?.classList.remove("d-none");

    profileButton?.classList.add("d-none");
    logoutButton?.classList.add("d-none");

    if (adminButton) {
      adminButton.classList.add("d-none");
    }
  }

  // (re)bind logout safely
  if (logoutButton) {
    logoutButton.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      window.location.href = "index.html";
    };
  }
}

// Run when the navbar is injected…
document.addEventListener("navbar:ready", applyNavbarToggle);
// …and also on DOMContentLoaded (in case navbar already added)
document.addEventListener("DOMContentLoaded", applyNavbarToggle);
