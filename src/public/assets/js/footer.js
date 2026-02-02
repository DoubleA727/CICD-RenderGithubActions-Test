document.addEventListener("DOMContentLoaded", () => {
  const footer = `
    <br>
    <hr class="mt-1 mb-1"/>
    <footer class="text-center text-lg-start mt-2">
    <div class="text-center p-3">
        <p>&copy; 2026 Singapore Polytechnic. All rights reserved.</p>
    </div>
    </footer>
  `;

  // Insert the footer HTML at the bottom
  document.body.insertAdjacentHTML("beforeend", footer);
});

