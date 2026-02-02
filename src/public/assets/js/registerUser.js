document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  signupForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value.trim();
      const firstName = document.getElementById("firstName").value;
      const lastName = document.getElementById("lastName").value;
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Check if passwords match
      if (password !== confirmPassword) {
          warningCard.classList.remove("d-none");
          warningText.innerText = "Passwords do not match.";
          return;
      }

      // Data to send to the server
      const data = {
          username: username,
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password
        };

      // Callback function for handling server response
      const callback = (responseStatus, responseData) => {
        // Helpful while debugging:
        console.log("register response:", responseStatus, responseData);

        if (responseStatus === 200 || responseStatus === 201) {
            if (responseData && responseData.token) {
            localStorage.setItem("token", responseData.token);
            window.location.href = "profile.html";
            return;
            }
            warningCard.classList.remove("d-none");
            warningText.innerText = responseData?.message || "No token returned.";
            return;
        }

        if (responseStatus === 409) {
            warningCard.classList.remove("d-none");
            // Prefer server message if present (e.g. “Email already exists.”)
            warningText.innerText = responseData?.message || "Username or Email already exists.";
            return;
        }

        // 400s, 500s, or network error (status=0)
        warningCard.classList.remove("d-none");
        warningText.innerText = responseData?.message || "Signup failed. Please try again.";
        };


      // Perform signup request (middleware will check username/email)
      fetchMethod(currentUrl + "/api/register", callback, "POST", data);

      // Reset the form fields
      signupForm.reset();
  });
});
