// ============================================================
// GET STARTED BUTTON LOGIC — Redirect based on login status
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("getStartedBtn");

  btn.addEventListener("click", () => {
    const token = localStorage.getItem("token");

    // If user is logged in → go straight to CCA page
    if (token) {
      window.location.href = "./cca.html";
    } 
    // Otherwise → go register
    else {
      window.location.href = "./register.html";
    }
  });

  // Load limited-time merch deals on homepage load
  loadLimitedDeals();
});

// ============================================================
// LIMITED DEALS — 24-hour discount system using cookies
// ============================================================
function loadLimitedDeals() {
  // Check if deals already exist in cookies → prevents re-randomizing on refresh
  const storedDeals = getCookie("limitedDeals");
  const storedEnd = getCookie("limitedEndTime");

  // If deals exist and are still active → use them
  if (storedDeals && storedEnd) {
    renderLimitedCards(JSON.parse(storedDeals));
    startCountdown(Number(storedEnd));
    return;
  }

  // Otherwise → fetch fresh deals from backend
  fetch("/api/merch/limited")
    .then((res) => res.json())
    .then((data) => {
      const items = data.result;

      // Add random discounts BEFORE storing to cookie (20%–40%)
      const discountedItems = items.map((item) => {
        const discount = Math.floor(Math.random() * 21) + 20; // random 20–40%
        const newPrice = (item.price * (1 - discount / 100)).toFixed(2);

        return {
          ...item,
          discount,     // percentage discount
          newPrice,     // final discounted price
        };
      });

      // Generate 24-hour expiry timestamp
      const endTime = Date.now() + 24 * 60 * 60 * 1000;

      // Save deals + expiry to cookies to persist between page reloads
      setCookie("limitedDeals", JSON.stringify(discountedItems), 24);
      setCookie("limitedEndTime", endTime, 24);

      // Render UI and start countdown timer
      renderLimitedCards(discountedItems);
      startCountdown(endTime);
    })
    .catch((err) => console.error("Error loading limited merch:", err));
}

// ============================================================
// RENDER LIMITED-TIME MERCH CARDS
// ============================================================
function renderLimitedCards(items) {
  const container = document.getElementById("limitedCards");
  container.innerHTML = "";

  // Build card HTML for each discounted merch item
  items.forEach((item) => {
    container.innerHTML += `
      <div class="limited-card" onclick="viewMerch()">

        <img src="./assets/images/${item.imageUrl}" alt="Merch image">

        <h3>${item.name}</h3>
        <p>${item.description || "Special edition merch — limited time only!"}</p>

        <div class="price-wrapper">
          <span class="new-price">S$${item.newPrice}</span>
          <span class="old-price">S$${item.price}</span>
        </div>

        <button>View Deal (${item.discount}% OFF)</button>
      </div>
    `;
  });
}

// Sends the user to the merch page
function viewMerch() {
  window.location.href = "./merch.html";
}

// ============================================================
// 24-HOUR COUNTDOWN TIMER — Display remaining deal time
// ============================================================
function startCountdown(endTime) {
  const timerElement = document.getElementById("limitedTimer");

  const interval = setInterval(() => {
    const now = Date.now();
    let timeLeft = endTime - now;

    // If expired → clear cookie + stop timer
    if (timeLeft <= 0) {
      clearInterval(interval);
      timerElement.textContent = "EXPIRED";

      // Remove cached deals so new ones generate next page load
      deleteCookie("limitedDeals");
      deleteCookie("limitedEndTime");

      return;
    }

    // Convert milliseconds → H:M:S
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    timerElement.textContent = `ENDS IN ${hours}H ${minutes}M ${seconds}S`;
  }, 1000); // Update every second
}

// ============================================================
// COOKIE HELPERS — Used for persisting limited-deal state
// ============================================================

// Create cookie with expiry in HOURS
function setCookie(name, value, hours) {
  const d = new Date();
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

// Retrieve cookie value by name
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let c of cookies) {
    const [key, val] = c.split("=");
    if (key === name) return val;
  }
  return null;
}

// Delete cookie by setting old expiry date
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}
