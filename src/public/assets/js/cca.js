// ============================================================
// SECTION REFERENCES — each category block
// ============================================================
const sportsBlock = document.querySelector("#sports .card-container");
const artsBlock = document.querySelector("#arts .card-container");
const clubsBlock = document.querySelector("#clubs .card-container");

// Global array storing all CCA data (used for search/filter)
let allCcas = [];

// ============================================================
// LOAD ALL CCAS FROM BACKEND
// ============================================================
async function loadCCA() {
  const res = await fetch("/api/cca/");
  const data = await res.json();

  // Store the full list for filtering & modal lookup
  allCcas = data.data;

  renderCCAs(allCcas);
}

// ============================================================
// RENDER CCA CARDS INTO THEIR CATEGORY SECTIONS
// ============================================================
function renderCCAs(ccas) {
  // Clear all containers before re-rendering
  sportsBlock.innerHTML = "";
  artsBlock.innerHTML = "";
  clubsBlock.innerHTML = "";

  // Section elements
  const sportsSection = document.getElementById("sports");
  const artsSection = document.getElementById("arts");
  const clubsSection = document.getElementById("clubs");

  // Remove animations + hide sections (so fade-in looks clean)
  sportsSection.classList.remove("show");
  artsSection.classList.remove("show");
  clubsSection.classList.remove("show");

  sportsSection.style.display = "none";
  artsSection.style.display = "none";
  clubsSection.style.display = "none";

  // Loop through CCAs and render into correct category
  ccas.forEach((cca) => {
    const html = `  
      <div class="cca-card" data-id="${cca.ccaId}" style="cursor:pointer;">
        <img src="${cca.imageUrl}" class="cca-img" alt="${cca.name}">
        <h3>${cca.name}</h3>
        <p>${cca.description}</p>
      </div>
    `;

    // Append based on category + trigger fade-in animation
    if (cca.category === "Sports") {
      sportsBlock.innerHTML += html;
      sportsSection.style.display = "block";
      requestAnimationFrame(() => sportsSection.classList.add("show"));

    } else if (cca.category === "Performing Arts") {
      artsBlock.innerHTML += html;
      artsSection.style.display = "block";
      requestAnimationFrame(() => artsSection.classList.add("show"));

    } else if (cca.category === "Clubs") {
      clubsBlock.innerHTML += html;
      clubsSection.style.display = "block";
      requestAnimationFrame(() => clubsSection.classList.add("show"));
    }
  });

  // Re-attach modal click events to newly rendered cards
  attachModalClicks();
}

// ============================================================
// SEARCH + CATEGORY FILTER + SORTING
// ============================================================
function filterAndRender() {
  // User search input (case-insensitive)
  const searchValue = document
    .getElementById("searchInput")
    .value.toLowerCase();

  // Category dropdown (default = "all")
  const categoryValue =
    document.getElementById("categoryFilter")?.value || "all";

  // Sort dropdown (none, A–Z, Z–A)
  const sortValue = document.getElementById("sortSelect")?.value || "none";

  // Filter CCAs by search + category
  let filtered = allCcas.filter((cca) => {
    const matchesSearch = cca.name.toLowerCase().includes(searchValue);
    const matchesCategory =
      categoryValue === "all" || cca.category === categoryValue;

    return matchesSearch && matchesCategory;
  });

  // Apply sorting rules
  if (sortValue === "az") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortValue === "za") {
    filtered.sort((a, b) => b.name.localeCompare(a.name));
  }

  // Re-render based on final filtered/sorted list
  renderCCAs(filtered);
}

// ============================================================
// ATTACH CLICK HANDLERS TO OPEN MODALS
// ============================================================
function attachModalClicks() {
  const cards = document.querySelectorAll(".cca-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      // Each card stores data-id for modal lookup
      openCCAModal(card.dataset.id);
    });
  });
}

// ============================================================
// OPEN MODAL + LOAD DETAILS + LOAD RECOMMENDATIONS
// ============================================================
async function openCCAModal(ccaId) {
  // Find CCA object from global array
  const cca = allCcas.find((c) => c.ccaId == ccaId);

  // Track user click on the CCA (for popularity ranking)
  try {
    await fetch(`/api/cca/${ccaId}/click`, { method: "POST" });
  } catch (err) {
    console.error("Click tracking failed:", err);
  }

  // Fill modal UI with selected CCA data
  document.getElementById("modalTitle").innerText = cca.name;
  document.getElementById("modalCategory").innerText = cca.category;
  document.getElementById("modalDesc").innerText = cca.description;
  document.getElementById("modalImage").src = `${cca.imageUrl}`;

  // Link to merch page for this CCA
  document.getElementById(
    "modalLink"
  ).href = `http://localhost:3001/merch.html?ccaId=${cca.ccaId}`;

  // ============================================================
  // FETCH RECOMMENDED CCAS
  // ============================================================
  let recHtml = "";
  try {
    const recRes = await fetch(`/api/cca/recommend/${ccaId}`);
    const recData = await recRes.json();
    const recs = recData.data;

    // Render recommended items
    recHtml = recs
      .map(
        (rec) => `
          <div class="recommended-card" data-id="${rec.ccaId}">
            <img src="${rec.imageUrl}" alt="${rec.name}">
            <h4>${rec.name}</h4>
            <p>${rec.category}</p>
          </div>
        `
      )
      .join("");
  } catch (err) {
    console.error("Failed to fetch recommendations:", err);
  }

  document.getElementById("recommendContainer").innerHTML = recHtml;

  // Reattach click events for recommended CCAs (recursive modal opening)
  document.querySelectorAll(".recommended-card").forEach((recCard) => {
    recCard.addEventListener("click", () => {
      openCCAModal(recCard.dataset.id);
    });
  });

  // Show Bootstrap modal
  const modalElement = document.getElementById("quickViewModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

// ============================================================
// EVENT LISTENERS — SEARCH, CATEGORY FILTER, SORT
// ============================================================
document
  .getElementById("searchInput")
  .addEventListener("input", filterAndRender);

document
  .getElementById("categoryFilter")
  .addEventListener("change", filterAndRender);

document
  .getElementById("sortSelect")
  .addEventListener("change", filterAndRender);

// Initial load
loadCCA();
