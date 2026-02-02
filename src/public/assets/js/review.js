// Get AI elements
const aiBtn = document.getElementById("aiSummaryBtn");
const aiBox = document.getElementById("aiSummaryBox");
const aiText = document.getElementById("aiSummaryText");

aiBtn.addEventListener("click", async () => {
    const comments = Array.from(
        document.querySelectorAll("#reviewsRows .card p:nth-of-type(2)")
    ).map(p => p.textContent.replace("Comments: ", ""));

    if (comments.length === 0) {
        alert("No reviews available to summarise.");
        return;
    }

    // Get merch name from the page
    const merchNameElement = document.getElementById("ReviewFor");
    let merchName = "the product";
    if (merchNameElement && merchNameElement.textContent) {
        // Extract merch name from "Reviews for: Product Name"
        merchName = merchNameElement.textContent.replace("Reviews for: ", "").trim();
    }

    // send to backend AI summariser route
    const res = await fetch("/api/ai/summariseReviews", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ 
            reviews: comments,
            merchName: merchName 
        })
    });

    const data = await res.json();

    aiText.textContent = data.summary || "No summary available.";
    aiBox.style.display = "block";
});

document.addEventListener("DOMContentLoaded", function () {
    let reviewFor = document.getElementById("ReviewFor");
    let merchDropdown = document.getElementById("merchDropdown");

    const params = new URLSearchParams(window.location.search);
    let merchId = params.get("merchId");

    let viewReviewsBtn = document.getElementById("viewReviews");
    let makeReviewBtn = document.getElementById("makeReview");
    let viewUserReviewsBtn = document.getElementById("viewUserReviews");
    
    let reviewsDiv = document.getElementById("reviewsRows");

    function formatToUTC8(dateStr) {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        // Convert to UTC+8
        const utc8Time = new Date(date.getTime() + 8 * 60 * 60 * 1000);
        return utc8Time.toLocaleString();
    }

    fetch(currentUrl + "/api/merch/all", {
        method: "GET"
    })
    .then(function(response){
        return response.json();
    })
    .then(function(result){
        console.log("reviewData: ", result)
        let allMerch = result["data"].sort(function(a,b){
            return a.merchId - b.merchId
        });
        console.log(merchId)
        // console.log(allMerch)
        if(allMerch.length == 0){
            let option = document.createElement("option");
            option.textContent = "No merch right now"
            option.value = null;
            merchDropdown.appendChild(option);
        }
        else{
            for (let i = 0; i < allMerch.length; i++) {
                // console.log("VALUE FOR OPTION: " + allMerch[i].merchId);
                let option = document.createElement("option");
                option.value = allMerch[i].merchId;
                option.textContent = allMerch[i].name;
                if(!merchId && i == 0){
                    option.selected = true;
                    reviewFor.innerHTML = "<h2>Reviews for: " + allMerch[0].name + "</h2>";
                }
                else if(option.value == merchId){
                    option.selected = true;
                    reviewFor.innerHTML = "<h2>Reviews for: " + allMerch[i].name + "</h2>";
                }
                merchDropdown.appendChild(option);
            }
            let selectedMerchId = merchDropdown.value;
            fetch(currentUrl + "/api/reviews?merchId=" + selectedMerchId, {
                method: "GET"
            })
            .then(function(response){
                return response.json();
            })
            .then(function(result){
                console.log("ALL REVIEWS FROM MERCH ID " + selectedMerchId + ": ", result);
                let reviews = result.merch.rows;
                if(reviews.length){
                    for (let i = 0; i < reviews.length; i++) {
                        let review = reviews[i];

                        let reviewCard = document.createElement('div');
                        reviewCard.className = "card mb-2 pt-2 px-4 mx-4";

                        // Format the createdAt date
                        let postedDate = formatToUTC8(review.createdAt);

                        // Generate sr
                        let stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

                        let canEdit = false;
                        const token = localStorage.getItem("token");
                        if (token) {
                            try {
                                let decoded = jwt_decode(token);
                                if (decoded.userId === review.userId) {
                                    canEdit = true;
                                }
                            } catch (err) {
                                console.error("Invalid token", err);
                            }
                        }
                        console.log("REVIEW ROW", review);
                        fetch(currentUrl + "/api/reviews/comments?reviewId=" + review.reviewId, {
                            method: "GET"
                        }).then(function(response){
                            return response.json();
                        })
                        .then(function (result) {
                            console.log("REVIEW COMMENTS: ", result.comments);
                            let comments = result.comments;
                            // Build comments
                            let commentsHtml = "";
                            if (comments && comments.length > 0) {
                                for (let i = 0; i < comments.length; i++) {
                                    let c = comments[i];
                                    console.log("COMMENT ROW:", c);
                                    commentsHtml += `
                                        <div class="border rounded p-2 mb-2 d-flex align-items-start">
                                            <!-- User Profile Picture -->
                                            <img src="${c.UserPFP}"
                                                alt="${c.username}"
                                                style="width:50px; height:50px; object-fit:cover; border-radius:50%; margin-right:10px;"
                                            >

                                            <div style="flex:1;">
                                                <!-- Comment image if they got put -->
                                                ${c.imageUrl ? `
                                                    <img src="${c.imageUrl}" 
                                                        alt="Comment Image" 
                                                        style="width:100%; max-width:100px; height:auto; border-radius:6px; margin-bottom:5px;">
                                                ` : ""}

                                                <!-- Comment details -->
                                                <strong><br>${c.username}</strong>
                                                <p class="mb-1">${c.comment}</p>
                                                <small>${formatToUTC8(c.createdAt)}</small>
                                            </div>
                                        </div>
                                    `;
                                }
                            } else {
                                commentsHtml = `<p class="text-muted">No comments yet</p>`;
                            }

                            // Format updated date
                            let updatedDate = review.updatedAt ? formatToUTC8(review.updatedAt) : null;
                            reviewCard.innerHTML = `
                                <div class="d-flex align-items-start mb-2">
                                    <img src="./assets/images/${review.merchimage}" 
                                        alt="${review.merchname}" 
                                        style="height:262px; width:auto; object-fit:cover; border-radius:6px;" 
                                        class="me-3">

                                    <div>
                                        <h4>${review.username} (${review.userfirstname} ${review.userlastname})</h4>
                                        <h5>${review.merchname}</h5>

                                        <p>Rating: <span style="color: gold;">${stars}</span></p>
                                        <p>Comments: ${review.comments || "No comments"}</p>
                                        <p><small>Posted On: ${postedDate}</small></p>
                                        ${updatedDate ? `<p><small>Last Updated: ${updatedDate}</small></p>` : ""}

                                        ${canEdit ? `
                                            <button class="btn btn-warning btn-sm me-2"
                                                onclick="window.location.href='editReview.html?reviewId=${review.reviewId}'">
                                                Edit Review
                                            </button>
                                            <button class="btn btn-danger btn-sm"
                                                onclick="deleteReview(${review.merchId})">
                                                Delete Review
                                            </button>
                                        ` : ""}
                                    </div>
                                </div>

                                <!-- COMMENTS BELOW REVIEW -->
                                <details class="mt-3">
                                    <summary style="cursor:pointer; font-weight:600;">
                                        Comments (${comments.length})
                                    </summary>

                                    <div class="mt-2">
                                        <textarea class="form-control mb-2" rows="2"
                                            placeholder="Leave a comment..."
                                            id="commentInput-${review.reviewId}">
                                        </textarea>

                                        <input type="file"
                                            class="form-control form-control-sm mb-2"
                                            accept="image/*"
                                            id="commentImage-${review.reviewId}"
                                        >

                                        <button type="button" class="btn btn-primary btn-sm"
                                            onclick="postComment(${review.reviewId})">
                                            Post
                                        </button>
                                    </div>

                                    <div class="mt-3" id="commentsList-${review.reviewId}">
                                        ${commentsHtml}
                                    </div>
                                </details>
                            `;

                            reviewsDiv.appendChild(reviewCard);
                        })
                        .catch(function(err){
                            console.error("Error fetching review comments:", err);
                        });
                    }
                }
                else{
                    const noReviews = document.createElement('div');
                    noReviews.innerHTML = `No reviews for this merch yet`
                    noReviews.className = "text-center text-light fs-2"
                    reviewsDiv.appendChild(noReviews);
                }
            });
        }
        // Make deleteReview globally accessible
        window.deleteReview = function(merchId) {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You must be logged in to delete a review!");
                return;
            }

            const decoded = jwt_decode(token);
            const userId = decoded.userId;

            if (!confirm("Are you sure you want to delete this review?")) return;

            fetch(`${currentUrl}/api/reviews/?merchId=${merchId}`, {
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
        //button redirect
        viewReviewsBtn.addEventListener('click', function(){
            let selectedMerchId = merchDropdown.value;
            // console.log(selectedMerchId)
            if(!selectedMerchId){
                window.location.href = currentUrl + "/review.html";
            }
            else{
                window.location.href = currentUrl + "/review.html?merchId=" + selectedMerchId; 
            }
        });
        makeReviewBtn.addEventListener('click', function(e){
            e.preventDefault();

            const token = localStorage.getItem("token");
            if(!token){
                alert("You must be logged in to make a review!");
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
            window.location.href = currentUrl + "/makeReview.html";
        });
        viewUserReviewsBtn.addEventListener('click', function(e){
            e.preventDefault();

            const token = localStorage.getItem("token");
            if(!token){
                alert("You must be logged in to make a review!");
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
            window.location.href = currentUrl + "/userReviews.html";
        });
        //comment posting function
        window.postComment = function (reviewId) {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You must be logged in to comment.");
                return;
            }

            let decoded;
            try {
                decoded = jwt_decode(token);
            } catch (err) {
                console.error("Invalid token", err);
                alert("Invalid token. Please log in again.");
                return;
            }

            const userId = decoded.userId;

            const input = document.getElementById(`commentInput-${reviewId}`);
            const imageInput = document.getElementById(`commentImage-${reviewId}`);
            const comment = input.value.trim();

            if (!comment) {
                alert("Comment cannot be empty.");
                return;
            }

            const formData = new FormData();
            formData.append("reviewId", reviewId);
            formData.append("userId", userId);
            formData.append("comment", comment);

            // defaults to null
            if (imageInput && imageInput.files.length > 0) {
                formData.append("image", imageInput.files[0]);
            } else {
                formData.append("image", null);
            }

            fetch(`${currentUrl}/api/reviews/comments`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    location.reload();
                } else {
                    alert(result.message || "Failed to post comment");
                }
            })
            .catch(err => {
                console.error(err);
                alert("Error posting comment");
            });
        };
    });
});