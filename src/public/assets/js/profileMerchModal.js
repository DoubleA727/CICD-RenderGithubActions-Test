function openMerchModal(merch) {
    // Fill modal fields
    document.getElementById("merchModalName").textContent = merch.name;
    document.getElementById("merchModalImage").src = `./assets/images/${merch.imageUrl}`;
    document.getElementById("merchModalPrice").textContent = `S$${merch.price}`;
    document.getElementById("merchModalDescription").textContent = merch.description || "No description available.";

    const tierName =
        merch.tierId === 1 ? "Bronze Tier" :
        merch.tierId === 2 ? "Silver Tier" :
        merch.tierId === 3 ? "Gold Tier" : "Unknown Tier";

    const tierClass =
        merch.tierId === 1 ? "bg-secondary" :
        merch.tierId === 2 ? "bg-info" :
        merch.tierId === 3 ? "bg-warning" : "bg-dark";

    const tierEl = document.getElementById("merchModalTier");
    tierEl.textContent = tierName;
    tierEl.className = `badge ${tierClass}`;

    document.getElementById("merchModalBuyBtn").onclick = () => {
        window.location.href = `order.html?merch_id=${merch.merchId}`;
    };

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById("merchDetailsModal"));
    modal.show();
}
