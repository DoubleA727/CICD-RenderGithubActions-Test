(function () {
  // Example hash: #token=xxx&role=user
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.substring(1)
    : "";

  const params = new URLSearchParams(hash);
  const token = params.get("token");
  const role = params.get("role");

  if (!token) {
    window.location.href = "login.html#oauthError=missing_token";
    return;
  }

  localStorage.setItem("token", token);
  if (role) localStorage.setItem("role", role);

  // Go to profile
  window.location.href = "profile.html";
})();
