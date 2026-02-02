// retrieveMerch.js
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let c of cookies) {
    const [key, val] = c.split("=");
    if (key === name) return decodeURIComponent(val);
  }
  return null;
}

// Read ccaId from query string (if present)
const urlParams = new URLSearchParams(window.location.search);
const ccaUrlId = urlParams.get("ccaId");

// Cache of merch currently loaded (for all tiers the user can access)
let allMerch = [];
let limitedDeals = [];

const limitedDealsCookie = getCookie("limitedDeals");
if (limitedDealsCookie) {
  limitedDeals = JSON.parse(limitedDealsCookie);
}

function getLimitedDeal(merchId) {
  return limitedDeals.find((d) => d.merchId === merchId);
}

// User's tier level (1=Bronze, 2=Silver, 3=Gold)
let userTierLevel = null;

// Grid container
const merchGrid = document.getElementById("merchGrid");

// Key in localStorage for suggested merch (view click frequency)
const MERCH_VIEW_COUNTS_KEY = "merchViewCounts";

// Load counts
function getMerchViewCounts() {
  try {
    const raw = localStorage.getItem(MERCH_VIEW_COUNTS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (e) {
    console.error("Failed to parse merch view counts:", e);
    return {};
  }
}

// Save counts
function saveMerchViewCounts(counts) {
  try {
    localStorage.setItem(MERCH_VIEW_COUNTS_KEY, JSON.stringify(counts));
  } catch (e) {
    console.error("Failed to save merch view counts:", e);
  }
}

// Increment count for merchId
function trackMerchViewClick(merch) {
  if (!merch || merch.merchId == null) return;

  const counts = getMerchViewCounts();
  const id = String(merch.merchId);

  counts[id] = (counts[id] || 0) + 1;
  saveMerchViewCounts(counts);

  // Optional: keep a lightweight catalog so homepage can render
  // even if it doesn't fetch merch list
  cacheMerchSummaryForSuggested(merch);
}

// Optional helper: store merch summaries by id (so homepage can render top4)
const MERCH_SUGGESTED_CATALOG_KEY = "merchSuggestedCatalog";

function getSuggestedCatalog() {
  try {
    const raw = localStorage.getItem(MERCH_SUGGESTED_CATALOG_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveSuggestedCatalog(cat) {
  try {
    localStorage.setItem(MERCH_SUGGESTED_CATALOG_KEY, JSON.stringify(cat));
  } catch (e) {
    console.error("Failed to save suggested catalog:", e);
  }
}

function cacheMerchSummaryForSuggested(merch) {
  const cat = getSuggestedCatalog();
  cat[String(merch.merchId)] = {
    merchId: merch.merchId,
    name: merch.name,
    imageUrl: merch.imageUrl,
    price: merch.price,
    tierId: merch.tierId,
    description: merch.description || null,
  };
  saveSuggestedCatalog(cat);
}


document.addEventListener("DOMContentLoaded", async function () {
  showLoader(); // show loader

  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.userId) throw new Error("Invalid token");

    const userId = decodedToken.userId;

    // Fetch user tier
    userTierLevel = await fetchUserTierLevel(userId);
    if (!userTierLevel) throw new Error("Could not determine user tier");

    // Show correct tier pills
    displayTierOptions(userTierLevel);

    // Fetch merch
    if (ccaUrlId) {
      await loadMerchForCcaAndUserTiers(ccaUrlId, userTierLevel);
    } else {
      await loadAllMerchForUserTiers(userTierLevel);
    }
  } catch (err) {
    console.error(err);
    alert(err.message || "Error loading merch");
  } finally {
    console.log("hide")
    hideLoader(); // always hide loader
  }
});


//
// Get the user's tier level from backend
//
async function fetchUserTierLevel(userId) {
  try {
    const response = await fetch("/api/users/getUserTier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    const data = await response.json();
    const tier = Number(data);
    if (Number.isNaN(tier)) {
      console.error("getUserTier did not return a numeric tier:", data);
      return 0;
    }
    return tier;
  } catch (err) {
    console.error("Error fetching user tier:", err);
    return 0;
  }
}

//
// Load ALL merch, but only for tiers <= user's tier
//
async function loadAllMerchForUserTiers(userTier) {
  try {
    const response = await fetch("/api/merch/all");
    const data = await response.json();

    // 🔧 Be robust to different response shapes
    const all =
      data.result ||
      data.data ||
      data.rows ||
      data.merch ||
      (Array.isArray(data) ? data : []);

    // Keep items where:
    // - merch is active (not archived)
    // - tierId <= userTier
    allMerch = all.filter(
      (item) =>
        item.isActive !== false &&          // 🔴 NEW: hide archived ones
        typeof item.tierId === "number" &&
        item.tierId >= 1 &&
        item.tierId <= userTier
    );

    renderMerch(allMerch);
  } catch (err) {
    console.error("Error fetching all merch:", err);
  }
}

//
// Load merch for specific CCA and all tiers <= user's tier
//
async function loadMerchForCcaAndUserTiers(ccaId, userTier) {
  try {
    let merchArr = [];

    // Fetch tier 1..userTier and merge the results
    for (let tier = 1; tier <= userTier; tier++) {
      const response = await fetch(
        `/api/merch/getMerchByTier?ccaId=${encodeURIComponent(ccaId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tier }),
        }
      );

      const data = await response.json();
      const items =
        data.result ||
        data.data ||
        data.rows ||
        data.merch ||
        (Array.isArray(data) ? data : []);

      if (Array.isArray(items)) {
        merchArr.push(...items);
      }
    }

    // Filter out archived merch
    merchArr = merchArr.filter((item) => item.isActive !== false);

    allMerch = merchArr;
    renderMerch(allMerch);
  } catch (err) {
    console.error("Error fetching CCA merch:", err);
  }
}

//
// Show radios up to user's tier
// - Tier 3: show Bronze, Silver, Gold
// - Tier 2: show Bronze, Silver
// - Tier 1: show Bronze
//
function displayTierOptions(userTierLevel) {
  const tiers = [
    { id: "tierBronze", level: 1 },
    { id: "tierSilver", level: 2 },
    { id: "tierGold", level: 3 },
  ];

  tiers.forEach((t) => {
    const radio = document.getElementById(t.id);
    if (!radio) return;

    const pill = radio.parentElement; // the .tier-pill div

    if (t.level <= userTierLevel) {
      pill.style.display = "flex";
    } else {
      pill.style.display = "none";
    }
  });
}

function renderMerch(result) {
  merchGrid.innerHTML = "";

  result.forEach((item) => {
    // Check if this merch is in limited deals
    const deal = getLimitedDeal(item.merchId);

    // Build price HTML
    const priceHTML = deal
      ? `
        <span class="price-text" style="color:#b40000; font-weight:700;">S$${deal.newPrice}</span>
        <span style="text-decoration: line-through; color:gray; margin-left:6px;">
            S$${item.price}
        </span>
        <span style="color:#ff7b00; margin-left:6px; font-weight:600;">
            (${deal.discount}% OFF)
        </span>
      `
      : `<span class="price-text">S$${item.price}</span>`;

    // Tier info
    const tierName =
      item.tierId === 1
        ? "Bronze Tier"
        : item.tierId === 2
          ? "Silver Tier"
          : item.tierId === 3
            ? "Gold Tier"
            : "Unknown Tier";

    const tierClass =
      item.tierId === 1
        ? "bg-secondary"
        : item.tierId === 2
          ? "bg-info"
          : item.tierId === 3
            ? "bg-warning"
            : "bg-dark";

    const div = document.createElement("div");
    div.classList.add(
      "col-12",
      "col-sm-6",
      "col-md-4",
      "col-lg-3",
      "merch-card"
    );

    // 🔧 Use full imageUrl (Cloudinary) instead of ./assets/images/...
    const imageSrc = item.imageUrl || "";

    div.innerHTML = `
      <div class="card h-100 d-flex flex-column">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h6 class="card-title mb-1">${item.name}</h6>
            ${imageSrc
        ? `<img src="${imageSrc}" alt="merch image" class="img-fluid mb-2">`
        : `<div class="text-muted small mb-2">No image</div>`
      }
          </div>

          <div class="d-flex justify-content-between align-items-center mt-2">
            <div>${priceHTML}</div>
            <p class="badge ${tierClass} merch-tier-pill mb-0">${tierName}</p>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-2">
            <button 
              class="btn btn-sm btn-outline-secondary view-merch-btn" 
              data-merch-id="${item.merchId}">
              View
            </button>

            <button 
              class="btn btn-sm btn-outline-danger" 
              onclick="window.location.href='order.html?merch_id=${item.merchId}'">
              Buy
            </button>
          </div>
        </div>
      </div>
    `;

    merchGrid.appendChild(div);
  });

  // Attach modal view buttons
  attachViewButtons(result);
}

function attachViewButtons(currentList) {
  const buttons = document.querySelectorAll(".view-merch-btn");

  buttons.forEach((btn) => {
    const merchId = Number(btn.dataset.merchId);
    const merch = currentList.find((m) => m.merchId === merchId);

    if (!merch) return;

    btn.addEventListener("click", () => {
      trackMerchViewClick(merch);   // ✅ NEW
      openMerchModal(merch);
    });
  });
}

function openMerchModal(merch) {
  // Modal elements
  const titleEl = document.getElementById("merchModalLabel");
  const nameEl = document.getElementById("merchModalName");
  const imgEl = document.getElementById("merchModalImage");
  const priceEl = document.getElementById("merchModalPrice");
  const tierEl = document.getElementById("merchModalTier");
  const descEl = document.getElementById("merchModalDescription");
  const buyBtn = document.getElementById("merchModalBuyBtn");

  // Tier display
  const tierName =
    merch.tierId === 1
      ? "Bronze Tier"
      : merch.tierId === 2
        ? "Silver Tier"
        : merch.tierId === 3
          ? "Gold Tier"
          : "Unknown Tier";

  const tierClass =
    merch.tierId === 1
      ? "bg-secondary"
      : merch.tierId === 2
        ? "bg-info"
        : merch.tierId === 3
          ? "bg-warning"
          : "bg-dark";

  // Fill modal base info
  titleEl.textContent = merch.name;
  nameEl.textContent = merch.name;

  // 🔧 Use full URL from DB (Cloudinary)
  const imageSrc = merch.imageUrl || "";
  imgEl.src = imageSrc;
  imgEl.alt = merch.name;

  // ⭐ Check if this merch is a limited deal
  const deal = getLimitedDeal(merch.merchId);

  if (deal) {
    priceEl.innerHTML = `
      <span style="color:#b40000; font-weight:700; font-size:1.2rem;">S$${deal.newPrice}</span>
      <span style="text-decoration: line-through; color:gray; margin-left:8px;">
        S$${merch.price}
      </span>
      <span style="color:#ff7b00; margin-left:10px; font-weight:600;">
        (${deal.discount}% OFF)
      </span>
    `;
  } else {
    // Normal price
    priceEl.textContent = `S$${merch.price}`;
  }

  // Tier badge
  tierEl.textContent = tierName;
  tierEl.className = `badge ${tierClass}`;

  // Description
  descEl.textContent = merch.description || "No description available.";

  // Buy button
  buyBtn.onclick = () => {
    window.location.href = `order.html?merch_id=${merch.merchId}`;
  };

  // Track recently viewed
  trackRecentlyViewedMerch(merch);

  // Show modal
  const modalEl = document.getElementById("merchDetailsModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
  modal.show();
}

// Key in localStorage for recently viewed merch
const RECENTLY_VIEWED_KEY = "recentlyViewedMerch";

// Load from localStorage
function getRecentlyViewedFromStorage() {
  try {
    const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to parse recently viewed from storage:", e);
    return [];
  }
}

// Save to localStorage
function saveRecentlyViewedToStorage(list) {
  try {
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(list));
  } catch (e) {
    console.error("Failed to save recently viewed to storage:", e);
  }
}

// Track a merch item as recently viewed
function trackRecentlyViewedMerch(merch) {
  const summary = {
    merchId: merch.merchId,
    name: merch.name,
    imageUrl: merch.imageUrl,
    price: merch.price,
    tierId: merch.tierId,
    description: merch.description || null,
  };

  let list = getRecentlyViewedFromStorage();

  // Remove if already exists
  list = list.filter((m) => m.merchId !== summary.merchId);

  // Add to front
  list.unshift(summary);

  // Limit to last 10 items
  list = list.slice(0, 10);

  saveRecentlyViewedToStorage(list);
}

// loader functions
function showLoader() {
  document.getElementById("merchLoader").style.display = "flex";
  document.getElementById("merchGrid").style.display = "none";
}

function hideLoader() {
  document.getElementById("merchLoader").style.display = "none";
  document.getElementById("merchGrid").style.display = "flex";
}



// Decode JWT function (unchanged)
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}
