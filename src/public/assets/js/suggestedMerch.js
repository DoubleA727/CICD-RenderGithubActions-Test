// ./assets/js/suggestedMerch.js

const MERCH_VIEW_COUNTS_KEY = "merchViewCounts";
const MERCH_SUGGESTED_CATALOG_KEY = "merchSuggestedCatalog";

function getCounts() {
  try {
    return JSON.parse(localStorage.getItem(MERCH_VIEW_COUNTS_KEY) || "{}");
  } catch {
    return {};
  }
}

function getCatalog() {
  try {
    return JSON.parse(localStorage.getItem(MERCH_SUGGESTED_CATALOG_KEY) || "{}");
  } catch {
    return {};
  }
}

function getTopMerchIds(limit = 4) {
  const counts = getCounts();
  return Object.entries(counts)
    .sort((a, b) => Number(b[1]) - Number(a[1])) // most -> least
    .slice(0, limit)
    .map(([id]) => id);
}

function renderSuggested() {
  const grid = document.getElementById("suggestedMerchGrid");
  if (!grid) return;

  const topIds = getTopMerchIds(4);
  const catalog = getCatalog();

  if (topIds.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center text-muted">
        No suggestions yet — click “View” on some merch first!
      </div>
    `;
    return;
  }

  const items = topIds.map(id => catalog[id]).filter(Boolean);

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center text-muted">
        Suggestions not available yet — view some merch again.
      </div>
    `;
    return;
  }

  grid.innerHTML = items.map((m) => `
    <div class="col-12 col-sm-6 col-lg-3">
      <div class="card h-100">
        ${m.imageUrl ? `<img src="${m.imageUrl}" class="card-img-top" style="height:220px; object-fit:cover;" />` : ""}
        <div class="card-body d-flex flex-column">
          <h6 class="card-title mb-1">${m.name || "Merch"}</h6>
          <div class="text-muted mb-3">S$${m.price ?? "-"}</div>

          <button class="btn btn-dark mt-auto w-100"
            onclick="window.location.href='order.html?merch_id=${m.merchId}'">
            Buy
          </button>
        </div>
      </div>
    </div>
  `).join("");
}

document.addEventListener("DOMContentLoaded", renderSuggested);
