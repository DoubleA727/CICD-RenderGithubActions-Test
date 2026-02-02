document.addEventListener("DOMContentLoaded", function () {
  const googleBtn = document.getElementById("googleLoginBtn");

  if (googleBtn) {
    googleBtn.addEventListener("click", () => {
      window.location.href = currentUrl + "/api/auth/google";
    });
  }

});
