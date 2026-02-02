(function () {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // IF not logged in OR not admin → redirect
  if (!token || role !== "admin") {
    // redirect anywhere you want:
    window.location.href = "index.html";
  }
})();
