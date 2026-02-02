// profileRecentlyViewed.js

// Same key we used on merch page when tracking views
const RECENTLY_VIEWED_KEY = "recentlyViewedMerch";

document.addEventListener("DOMContentLoaded", () => {
    const grid = document.getElementById("recentlyViewedGrid");
    const emptyState = document.getElementById("recentlyViewedEmpty");

    if (!grid || !emptyState) return;

    const list = getRecentlyViewedFromStorage();

    if (!list || list.length === 0) {
        // Show "no merch" message
        emptyState.style.display = "block";
        grid.innerHTML = "";
        return;
    }

    // Hide empty state and render cards
    emptyState.style.display = "none";
    renderRecentlyViewed(list, grid);
});

// --- Helpers ---

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

function renderRecentlyViewed(list, container) {
    container.innerHTML = "";

    if (list.length === 0) {
    document.getElementById("recentlyViewedEmpty").style.display = "block";
    recentlyViewedGrid.innerHTML = "";
    return;
}
document.getElementById("recentlyViewedEmpty").style.display = "none";


    list.forEach((item) => {
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
        

        div.innerHTML = `
    <div class="card position-relative h-100 d-flex flex-column">

        <!-- ❌ Delete (Clear) Button -->
        <button 
            class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
            onclick="removeRecentlyViewed(${item.merchId})">
            ×
        </button>

        <div class="card-body d-flex flex-column justify-content-between">
            <div>
                <h6 class="card-title mb-1">${item.name}</h6>
                <img src="./assets/images/${item.imageUrl}" alt="merch image">
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2">
                <span class="price-text">S$${item.price}</span>
                <span class="badge ${tierClass} merch-tier-pill mb-0">${tierName}</span>
            </div>

            <div class="d-flex justify-content-end gap-2 mt-2">
                <button 
                    class="btn btn-sm btn-outline-secondary"
                    onclick='openMerchModal(${JSON.stringify(item)})'>
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



        container.appendChild(div);
    });
}

function removeRecentlyViewed(merchId) {
    if (!confirm("Remove this item from recently viewed?")) return;

    let list = JSON.parse(localStorage.getItem("recentlyViewedMerch")) || [];

    // Remove item
    list = list.filter(item => item.merchId !== merchId);

    // Save back into storage
    localStorage.setItem("recentlyViewedMerch", JSON.stringify(list));

    // Refresh the page
    location.reload();
}


