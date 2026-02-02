document.addEventListener("DOMContentLoaded", function () {
    let memberSinceText = ""; // cache the original "Member Since" display

    const usernameHTML = document.getElementById("username");
    const profilePic = document.getElementById("profilePic");
    const userDetails = document.getElementById("userDetails");
    const PurchaseHistory = document.getElementById("PurchaseHistory");

    // Edit Profile elements
    const editProfileForm = document.getElementById("editProfileForm");
    const editUsername = document.getElementById("editUsername");
    const editFirstName = document.getElementById("editFirstName");
    const editLastName = document.getElementById("editLastName");
    const editEmail = document.getElementById("editEmail");
    const editPassword = document.getElementById("editPassword");

    const editWarningCard = document.getElementById("editWarningCard");
    const editWarningText = document.getElementById("editWarningText");

    function showEditError(msg) {
    editWarningText.textContent = msg;
    editWarningCard.classList.remove("d-none");
    }

    function hideEditError() {
    editWarningCard.classList.add("d-none");
    editWarningText.textContent = "";
    }

    const token = localStorage.getItem("token");
    if (token) {
        const decoded = jwt_decode(token);

        const userId = parseInt(decoded.userId);

        fetch(currentUrl + "/api/users/" + userId, {
            method: "GET"
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {

                usernameHTML.innerHTML = `Hello ${data.username}!`

                profilePic.src = data.imageUrl || "./images/defaultPFP.png";

                const createdDate = new Date(data.createdAt);
                const formattedDate = createdDate.toLocaleDateString("en-SG", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });

                memberSinceText = formattedDate;


                userDetails.innerHTML = `
                    <div class="p-3">
                        <p><strong>First Name:</strong> ${data.firstName}</p>
                        <p><strong>Last Name:</strong> ${data.lastName}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Member Since:</strong> ${formattedDate}</p>
                    </div>
                `;

                // Prefill edit form
                const eu = document.getElementById("editUsername");
                const ef = document.getElementById("editFirstName");
                const el = document.getElementById("editLastName");
                const ee = document.getElementById("editEmail");
                const ep = document.getElementById("editPassword");

                if (!eu || !ef || !el || !ee) {
                console.warn("Edit Profile form inputs not found. Check your HTML IDs.");
                } else {
                eu.value = data.username ?? "";
                ef.value = data.firstName ?? "";
                el.value = data.lastName ?? "";
                ee.value = data.email ?? "";
                if (ep) ep.value = "";
                }



                //MERCH GOES HERE
                if (data.merch && data.merch.length > 0) {
                    const carouselId = "userMerchCarousel";
                    const carouselContainer = document.createElement("div");
                    carouselContainer.id = carouselId;
                    carouselContainer.className = "carousel slide";

                    const inner = document.createElement("div");
                    inner.className = "carousel-inner";

                    // SPLIT INTO 3 EACH (THIS IS SLIDES)
                    for (let i = 0; i < data.merch.length; i += 3) {
                        const slide = document.createElement("div");
                        slide.className = "carousel-item" + (i === 0 ? " active" : "");

                        const row = document.createElement("div");
                        row.className = "row";

                        // ADDING 3 MERCH INTO THE SLIDE; i IS SLIDE j IS IS THE MERCH INDEX IN USER MERCH 
                        for (let j = i; j < i + 3 && j < data.merch.length; j++) {
                            const merch = data.merch[j];
                            const col = document.createElement("div");
                            col.className = "col-md-4";
                            col.innerHTML = `
                            <div class="card mb-3">
                                <img src="./assets/images/${merch.imageUrl}" class="card-img-top" alt="${merch.name}" style="height: 300px; object-fit: contain;">
                                <div class="card-body">
                                    <h5 class="card-title">${merch.name}</h5>
                                    <p class="card-text">$${merch.price.toFixed(2)}</p>
                                    <p class="card-text"><small>Collected: ${new Date(merch.collectedAt).toLocaleDateString()}</small></p>
                                </div>
                            </div>
                        `;
                            row.appendChild(col);
                        }

                        slide.appendChild(row);
                        inner.appendChild(slide);
                    }

                    carouselContainer.appendChild(inner);

                    // CAROUSELL BUTTONS AT THE END
                    carouselContainer.innerHTML += `
                    <button class="carousel-control-prev" type="button" data-bs-target="#${carouselId}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon bg-dark rounded-circle" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#${carouselId}" data-bs-slide="next">
                        <span class="carousel-control-next-icon bg-dark rounded-circle" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                `;

                    // Add carousel to page
                    PurchaseHistory.appendChild(carouselContainer);
                }
                else {
                    let noMerch = document.createElement('div');
                    noMerch.innerHTML = `<h3 class="text-light text-center">You have no merch currently</h3>`
                    PurchaseHistory.appendChild(noMerch)
                }
            })
            .catch(function (error) {
                console.error("Error:", error);
            });
    }
    else {
        alert("Token expired, please login again")
    }

    // Edit Profile Form
    if (editProfileForm) {
        editProfileForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            hideEditError();

            const token = localStorage.getItem("token");
            if (!token) {
            showEditError("Not logged in. Please login again.");
            return;
            }

            const decoded = jwt_decode(token);
            const userId = parseInt(decoded.userId);

            const payload = {
            username: editUsername.value.trim(),
            firstName: editFirstName.value.trim(),
            lastName: editLastName.value.trim(),
            email: editEmail.value.trim()
            };

            const newPw = editPassword.value;
            if (newPw && newPw.trim().length > 0) {
            payload.password = newPw;
            }

            try {
            const response = await fetch(currentUrl + "/api/users/" + userId, {
                method: "PUT",
                headers: {
                "Content-Type": "application/json",
                // include this if your backend checks it
                Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                showEditError(result.message || "Failed to update profile.");
                return;
            }

            // Update the top greeting immediately
            usernameHTML.innerHTML = `Hello ${payload.username}!`;

            // Update the displayed User Details immediately
            userDetails.innerHTML = `
                <div class="p-3">
                <p><strong>First Name:</strong> ${payload.firstName}</p>
                <p><strong>Last Name:</strong> ${payload.lastName}</p>
                <p><strong>Email:</strong> ${payload.email}</p>
                <p><strong>Member Since:</strong> ${memberSinceText}</p>
                </div>
            `;

            // Clear password field after save
            editPassword.value = "";

            alert("Profile updated successfully!");
            } catch (err) {
            console.error(err);
            showEditError("Network error while updating profile.");
            }
        });
        }


    const uploadForm = document.getElementById("uploadProfileForm");
    const profilePicInput = document.getElementById("profilePicInput");
    const uploadBtn = uploadForm.querySelector("button[type='submit']");
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    uploadForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const file = profilePicInput.files[0];

        if (!file) {
            alert("Please select a profile picture first.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            alert("File is too large. Maximum allowed size is 10MB.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Not logged in.");
            return;
        }

        const decoded = jwt_decode(token);
        const userId = decoded.userId;

        const formData = new FormData();
        formData.append("profilePic", file);

        uploadBtn.disabled = true;
        uploadBtn.textContent = "Uploading...";

        try {
            const response = await fetch(currentUrl + `/api/users/${userId}/profile-pic`, {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 413) {
                    alert("File is too large. Maximum allowed size is 10MB.");
                } else {
                    alert(data.message || "Upload failed");
                }
                return;
            }

            profilePic.src = data.imageUrl;
            alert("Profile picture updated successfully!");

        } catch (error) {
            console.error(error);
            alert("An error occurred while uploading.");
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload New Profile Picture";
        }
    });
});