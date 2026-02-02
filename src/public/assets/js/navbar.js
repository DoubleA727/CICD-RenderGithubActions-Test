// navbar.js
document.addEventListener("DOMContentLoaded", () => {
  const navbar = `
  <nav class="navbar navbar-expand-xxl bg-body-dark">
    <div class="container-fluid m-4">
      <a class="navbar-brand" href="index.html">
        <h3 class="nav-title">SP MERCH</h3>
      </a>
      <button class="navbar-toggler collapsed" type="button" data-bs-toggle="collapse"
        data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup"
        aria-expanded="false" aria-label="Toggle navigation">
        <span class="toggler-icon top-bar"></span>
        <span class="toggler-icon middle-bar"></span>
        <span class="toggler-icon bottom-bar"></span>
      </button>
      <div class="collapse navbar-collapse justify-content-end" id="navbarNavAltMarkup">
        <div class="navbar-nav text-center">
          <!-- Navigators -->
          <a class="nav-button nav-link fs-5" href="./leaderboard.html">LEADERBOARD</a>
          <a class="nav-button nav-link fs-5" href="./cart.html">VIEW CART</a>
          <a class="nav-button nav-link fs-5" href="./merch.html">MERCH</a>
          <a class="nav-button nav-link fs-5" href="./cca.html">CCA</a>
          <a class="nav-button nav-link fs-5" href="./review.html">REVIEW</a>

          
          <a class="nav-button nav-link d-none" id="adminButton" href="./admin.html">ADMIN</a>

          <!-- Auth-related buttons -->
          <a class="nav-button nav-link fs-5" id="loginButton" href="./login.html">LOGIN</a>
          <a class="nav-button nav-link fs-5" id="registerButton" href="./register.html">REGISTER</a>

          <a class="nav-button nav-link d-none" id="profileButton" href="./profile.html">PROFILE</a>
          <a class="nav-button nav-link d-none" id="logoutButton" href="#">LOGOUT</a>
        </div>
      </div>
    </div>
  </nav>
  `;

  // Insert the navbar HTML at the top of the body
  document.body.insertAdjacentHTML("afterbegin", navbar);

  // Let listeners know the navbar is ready
  document.dispatchEvent(new CustomEvent("navbar:ready"));
});
