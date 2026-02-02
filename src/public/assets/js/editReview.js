document.addEventListener("DOMContentLoaded", function () {
    const merchDropdown = document.getElementById("merchDropdown");
    const merchNameInput = document.getElementById("merchName");
    const ratingSelect = document.getElementById("rating");
    const commentsTextarea = document.getElementById("comments");
    const editReviewForm = document.getElementById("editReviewForm");

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to edit reviews!");
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
    let currentReviewId = null;

    const urlParams = new URLSearchParams(window.location.search);
    const urlReviewId = urlParams.get("reviewId");

    // all review made by user
    fetch(`${currentUrl}/api/reviews/user?userId=${userId}`)
    .then(res => res.json())
    .then(result => {
        if (!result.success || !result.reviews.rows.length) {
            merchDropdown.innerHTML = '<option value="">No reviews found</option>';
            return;
        }

        const allReviews = result.reviews.rows;
        allReviews.forEach((review, idx) => {
            const option = document.createElement("option");
            option.value = review.reviewId; // store reviewId
            option.textContent = review.merchname;

            // Select URL reviewId if present, otherwise first
            if (urlReviewId && review.reviewId == urlReviewId) {
                option.selected = true;
            } else if (!urlReviewId && idx === 0) {
                option.selected = true;
            }

            merchDropdown.appendChild(option);
        });

        // load the review details
        loadReview(merchDropdown.value);
    })
    .catch(err => {
        console.error("Error fetching user reviews:", err);
        alert("Could not load your reviews.");
    });

    // load by rid
    function loadReview(reviewId) {
        if (!reviewId) return;

        fetch(`${currentUrl}/api/reviews/get?reviewId=${reviewId}`)
        .then(res => res.json())
        .then(result => {
            console.log(result)
            if (result.success && result.review) {
                const review = result.review;
                currentReviewId = review.reviewId;
                merchNameInput.value = review.merchname;
                ratingSelect.value = review.rating;
                commentsTextarea.value = review.comments || "";

                // --- Update Preview Section ---
                const previewImage = document.getElementById("previewImage");
                const previewMerchName = document.getElementById("previewMerchName");
                const previewRating = document.getElementById("previewRating");
                const previewComments = document.getElementById("previewComments");
                const previewPostedDate = document.getElementById("previewPostedDate");
                const previewUpdatedDate = document.getElementById("previewUpdatedDate");

                previewImage.src = `./assets/images/${review.merchimage}`;
                previewMerchName.textContent = review.merchname;
                previewRating.textContent = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
                previewComments.textContent = review.comments || "No comments";
                previewPostedDate.textContent = `Posted On: ${new Date(review.createdAt).toLocaleString()}`;
                previewUpdatedDate.textContent = review.updatedAt ? `Last Updated: ${new Date(review.updatedAt).toLocaleString()}` : "";
            }
        })
        .catch(err => {
            console.error("Error fetching review:", err);
            alert("An error occurred while fetching the review.");
        });
    }

    // on change re load
    merchDropdown.addEventListener("change", function () {
        const reviewId = this.value;
        loadReview(reviewId);
    });

    // go update
    editReviewForm.addEventListener("submit", function (e) {
        e.preventDefault();
        if (!currentReviewId) return alert("No review selected!");

        const updatedReview = {
            userId: userId,
            rating: parseInt(ratingSelect.value),
            comments: commentsTextarea.value
        };

        // send put rq
        fetch(`${currentUrl}/api/reviews/edit?reviewId=${currentReviewId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedReview)
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                alert("Review updated successfully!");
                window.location.href = `${currentUrl}/userReviews.html`;
            } else {
                alert(result.message || "Failed to update review.");
            }
        })
        .catch(err => {
            console.error("Error updating review:", err);
            alert("Error updating review. Try again.");
        });
    });
});
