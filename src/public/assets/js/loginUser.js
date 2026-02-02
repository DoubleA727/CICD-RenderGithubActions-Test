document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const warningCard = document.getElementById("warningCard");
  const warningText = document.getElementById("warningText");

  const callback = (responseStatus, responseData) => {
        console.log("responseStatus:", responseStatus);
        console.log("responseData:", responseData);

        if (responseStatus === 200) {
            if (responseData.token) {
                localStorage.setItem("token", responseData.token);
                localStorage.setItem("role", responseData.role);
                localStorage.setItem("userId",responseData.userId);
                window.location.href = "profile.html";
            }
        } else {
            // Always show the message returned by backend
            warningCard.classList.remove("d-none");
            warningText.innerText = responseData.message || "Login failed. Please try again.";
        }
    };


  loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const data = {
          username: username,
          password: password,
      };

      // Perform login request
      fetchMethod(currentUrl + "/api/login", callback, "POST", data);

      // Reset the form fields
      loginForm.reset();
  });
});
