document.addEventListener("DOMContentLoaded", function () {
    const reviewFor = document.getElementById("ReviewFor");
    const merchDropdown = document.getElementById("merchDropdown");
    const reviewsDiv = document.getElementById("reviewsRows");
    const makeReviewBtn = document.getElementById("makeReview");

    const token = localStorage.getItem("token");
    if(!token){
        alert("You must be logged in to view your reviews!");
        window.location.href = "login.html"
        return;
    }
    let decoded;
    try {
        decoded = jwt_decode(token);
    } catch (err) {
        console.error("Invalid token", err);
        alert("Invalid token! Please log in again.");
        return;
    }
    const userId = decoded.userId;
    // console.log("userId:" + userId)

    function formatToUTC8(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        const utc8Time = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return utc8Time.toLocaleString();
    }

    function createReviewCard(review) {
        const postedDate = formatToUTC8(review.createdAt);
        const updatedDate = review.updatedAt ? formatToUTC8(review.updatedAt) : null;
        const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

        // Check if current user can edit/delete
        let canEdit = false;
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwt_decode(token);
                if (decoded.userId === review.userId) {
                    canEdit = true;
                }
            } catch (err) {
                console.error("Invalid token", err);
            }
        }

        return `
            <div class="card mb-2 pt-2 px-4 mx-4">
                <div class="d-flex align-items-start mb-2">
                    <img src="./assets/images/${review.merchimage}" alt="${review.merchname}"
                        style="height:262px; width:auto; object-fit:cover; border-radius:6px;" class="me-3">

                    <div>
                        <h4>${review.username} (${review.userfirstname} ${review.userlastname})</h4>
                        <h5 class="mt-2">${review.merchname}</h5>

                        <p>Rating: <span style="color: gold;">${stars}</span></p>
                        <p>Comments: ${review.comments || "No comments"}</p>
                        <p><small>Posted On: ${postedDate}</small></p>
                        ${updatedDate ? `<p><small>Last Updated: ${updatedDate}</small></p>` : ""}

                        ${canEdit ? `
                            <button class="btn btn-warning btn-sm me-2" onclick="window.location.href='editReview.html?reviewId=${review.reviewId}'">
                                Edit Review
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteReview(${review.merchId})">
                                Delete Review
                            </button>
                        ` : ""}
                    </div>
                </div>
            </div>
        `;
    }

    window.deleteReview = function(merchId) {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You must be logged in to delete a review!");
            return;
        }

        const decoded = jwt_decode(token);
        const userId = decoded.userId;

        if (!confirm("Are you sure you want to delete this review?")) return;

        fetch(`${currentUrl}/api/reviews?merchId=${merchId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ userId: userId })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("Review deleted successfully!");
                location.reload();
            } else {
                alert(result.message || "Failed to delete review.");
            }
        })
        .catch(err => {
            console.error("Error deleting review:", err);
            alert("An error occurred. Please try again.");
        });
    };

    // first row all revews
    let myReviewsOption = document.createElement("option");
    myReviewsOption.value = "myReviews";
    myReviewsOption.textContent = "All My Reviews";
    myReviewsOption.selected = true;
    merchDropdown.appendChild(myReviewsOption);

    // Populate merch dropdown
    fetch(currentUrl + "/api/reviews/UM?userId=" + userId)
    .then(res => res.json())
    .then(result => {
        const allMerch = result.userMerch.rows;
        allMerch.forEach(merch => {
            const option = document.createElement("option");
            option.value = merch.merchId;
            option.textContent = merch.merchname;
            merchDropdown.appendChild(option);
        });

        // Load all reviews initially
        fetch(currentUrl + "/api/reviews/user?userId=" + userId)
        .then(res => res.json())
        .then(result => {
            reviewsDiv.innerHTML = "";
            if(result.success && result.reviews.rows.length > 0){
                const rows = result.reviews.rows;
                rows.forEach(review => {
                    reviewsDiv.innerHTML += createReviewCard(review);
                });
                reviewFor.innerHTML = "<h2>All My Reviews</h2>";
            } else {
                reviewsDiv.innerHTML = `<div class="text-center text-light fs-2">You have not made any reviews yet.</div>`;
                reviewFor.innerHTML = "<h2>All My Reviews</h2>";
            }
        });
    });

    // When dropdown changes
    merchDropdown.addEventListener("change", function() {
        const selectedValue = this.value;
        reviewsDiv.innerHTML = "";

        if(selectedValue === "myReviews") {
            fetch(currentUrl + "/api/reviews/user?userId=" + userId)
            .then(res => res.json())
            .then(result => {
                const rows = result.reviews.rows;
                if(result.success && rows.length > 0){
                    rows.forEach(review => {
                        reviewsDiv.innerHTML += createReviewCard(review);
                    });
                    reviewFor.innerHTML = "<h2>All My Reviews</h2>";
                } else {
                    reviewsDiv.innerHTML = `<div class="text-center text-light fs-2">You have not made any reviews yet.</div>`;
                    reviewFor.innerHTML = "<h2>All My Reviews</h2>";
                }
            });
        } else {
            const merchName = merchDropdown.selectedOptions[0].textContent;
            reviewFor.innerHTML = `<h2>Your review for: ${merchName}</h2>`;
            fetch(currentUrl + "/api/reviews?merchId=" + selectedValue)
            .then(res => res.json())
            .then(result => {
                const reviews = result.merch.rows;
                if(reviews.length){
                    reviews.forEach(review => {
                        reviewsDiv.innerHTML += createReviewCard(review);
                    });
                } else {
                    reviewsDiv.innerHTML = `<div class="text-center text-light fs-2">No reviews for this merch yet.</div>`;
                }
            });
        }
    });

    // Make Review Button
    makeReviewBtn.addEventListener('click', function(e){
        e.preventDefault();
        window.location.href = currentUrl + "/makeReview.html";
    });
});
