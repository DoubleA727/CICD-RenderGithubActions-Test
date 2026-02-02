document.addEventListener("DOMContentLoaded", function () {
    const merchDropdown = document.getElementById("merchDropdown");
    const currentlyReviewing = document.getElementById("currentlyReviewing");
    const currentMerchDiv = document.getElementById("currentMerch");
    const boughtOnDiv = document.getElementById("boughtOn");
    const reviewForm = document.querySelector("form");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to make a review!");
        window.location.href = "login.html"
        return;
    }

    let userId;
    try {
        const decoded = jwt_decode(token);
        userId = parseInt(decoded.userId);
        if (!userId) throw new Error("Invalid userId in token");
    } catch (err) {
        console.error("Invalid token", err);
        alert("Invalid token! Please log in again.");
        return;
    }

    fetch(`/api/reviews/UM?userId=${userId}`)
    .then(function(res) {
        return res.json();
    })
    .then(function(data) {
        const uniqueMerch = [];
        const seenNames = new Set();

        data.userMerch.rows.forEach(function(item) {
            if (!seenNames.has(item.merchname)) {
                seenNames.add(item.merchname);
                uniqueMerch.push(item);
            }
        });
        
        uniqueMerch.forEach(function(item) {
            const option = document.createElement("option");
            option.value = item.merchId;
            option.dataset.collectedAt = item.collectedAt;
            option.textContent = item.merchname;
            merchDropdown.appendChild(option);
        });

        // default value
        if (merchDropdown.options.length > 0) {
            merchDropdown.selectedIndex = 0;
            const selectedOption = merchDropdown.selectedOptions[0];

            currentMerchDiv.textContent = "Current Merch: " + selectedOption.textContent;

            const collectedAt = new Date(selectedOption.dataset.collectedAt);
            boughtOnDiv.textContent = "Bought On: " + collectedAt.toLocaleDateString();
            currentlyReviewing.textContent = selectedOption.textContent;
        }
    })
    .catch(function(err) {
        console.error("Failed to load merch:", err);
    });

    // change
    merchDropdown.addEventListener("change", function () {
        const selectedOption = merchDropdown.selectedOptions[0];
        currentMerchDiv.textContent = "Current Merch: " + selectedOption.textContent;

        const collectedAt = new Date(selectedOption.dataset.collectedAt);
        boughtOnDiv.textContent = "Bought On: " + collectedAt.toLocaleDateString();
        currentlyReviewing.textContent = selectedOption.textContent;
    });

    reviewForm.addEventListener("submit", function(e) {
        e.preventDefault();

        const merchId = merchDropdown.value;
        const rating = document.querySelector('input[name="optradio"]:checked')?.value;
        const comments = document.getElementById("comments").value;

        if (!merchId || !rating) {
            alert("Please select a merch item and a rating.");
            return;
        }

        fetch("/api/reviews?merchId=" + merchId, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: userId,
                merchId: parseInt(merchId),
                rating: parseInt(rating),
                comments: comments
            })
        })
        .then(function(res) {
            return res.json();
        })
        .then(function(data) {
            if (data.message && data.message.includes("alreadly")) {
                alert("You already have a review for this merch!");
            } else {
                alert("Review submitted successfully!");
                window.location.href = "userReviews.html";
            }
        })
        .catch(function(err) {
            console.error("Failed to submit review:", err);
            alert("Failed to submit review.");
        });
    });
});
