const userId = localStorage.getItem("userId");

const link = document.getElementById("adminChatLink");
if (link && userId) {
  link.href = `/chat.html?me=${userId}`;
} else if (link) {
  link.href = `/chat.html`; // fallback
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("promoEmailForm");
  const alertContainer = document.getElementById("alertContainer");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const subject = document.getElementById("promoSubject").value.trim();
    const htmlContent = document.getElementById("promoContent").value.trim();
    const token = localStorage.getItem("token");

    if (!subject || !htmlContent) {
      showAlert("Please fill in both subject and content.", "danger");
      return;
    }

    try {
      const res = await fetch("/api/admin/promoEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ subject, htmlContent }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        // Show success modal
        const modal = new bootstrap.Modal(
          document.getElementById("promoSuccessModal")
        );
        modal.show();

        form.reset();
      } else {
        showErrorModal(data.message || "Unknown error occurred.");
      }
    } catch (err) {
      console.error("Network error:", err);
      showErrorModal("A server error occurred. Please try again.");
    }
  });

  // --- Helper Functions ---

  function showAlert(message, type) {
    alertContainer.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  }

  function showErrorModal(msg) {
    document.getElementById("promoErrorText").innerText = msg;

    const modal = new bootstrap.Modal(
      document.getElementById("promoErrorModal")
    );
    modal.show();
  }
});
