const userId = localStorage.getItem("userId");

const link = document.getElementById("adminChatLink");
if (link && userId) {
  link.href = `/chat.html?me=${userId}`;
} else if (link) {
  link.href = `/chat.html`; // fallback
}

// ============================================================
// GLOBAL CHART INSTANCES (to destroy before re-rendering)
// ============================================================
let barChart;
let pieChart;

// ============================================================
// LOAD LEADERBOARD DATA + RENDER TABLE, KPI, CHARTS, BREAKDOWN
// ============================================================
async function loadLeaderboard() {
  // Read filter values from dropdowns
  const category = document.getElementById("categoryFilter").value;
  const sort = document.getElementById("sortFilter").value;

  // Fetch filtered/sorted CCA stats from backend
  const res = await fetch(
    `/api/cca/admin/stats?category=${encodeURIComponent(category)}&sort=${sort}`
  );
  const data = await res.json();
  const ccas = data.data;

  // Update KPI cards, charts, and breakdown summary
  updateKPI(ccas);
  updateCharts(ccas);
  updateBreakdown(ccas);

  // Rebuild leaderboard table
  const tbody = document.querySelector("#ccaTable tbody");
  tbody.innerHTML = "";

  ccas.forEach((cca, index) => {
    // Apply special color highlight for top 3 CCAs
    let highlightClass = "";
    if (index === 0) highlightClass = "gold-row";
    else if (index === 1) highlightClass = "silver-row";
    else if (index === 2) highlightClass = "bronze-row";

    // Append row for each CCA
    tbody.innerHTML += `
      <tr class="${highlightClass}">
        <td class="rank-number">${index + 1}</td>
        <td>${cca.name}</td>
        <td>${cca.category}</td>
        <td><strong>${cca.clicks}</strong></td>

        <td>
          <!-- Edit button -->
          <button class="btn sp-edit-btn" data-id="${cca.ccaId}">
            Edit
          </button>

          <!-- Enable / Disable button (dynamic) -->
          ${
            cca.isActive
              ? `<button class="btn sp-disable-btn" data-id="${cca.ccaId}">Disable</button>`
              : `<button class="btn sp-enable-btn" data-id="${cca.ccaId}">Enable</button>`
          }
        </td>
      </tr>
    `;
  });

  // Attach handlers to action buttons after rebuilding the table
  attachActionButtons();
}

// ============================================================
// ATTACH LOGIC FOR EDIT / ENABLE / DISABLE BUTTONS
// ============================================================
function attachActionButtons() {
  // ----------------------- EDIT BUTTON -----------------------
  document.querySelectorAll(".sp-edit-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id; // Read CCA ID from dataset

      try {
        const res = await fetch(`/api/cca/admin/${id}`);

        if (!res.ok) {
          const text = await res.text();
          console.error("Failed to load CCA. Status:", res.status, text);
          alert(`Failed to load CCA (status ${res.status}).`);
          return;
        }

        const data = await res.json();
        if (!data.success) return alert("Failed to load CCA.");

        const cca = data.data;

        // Pre-fill modal inputs with CCA info
        document.getElementById("editCCAId").value = cca.ccaId;
        document.getElementById("editCCAName").value = cca.name;
        document.getElementById("editCCACategory").value = cca.category;
        document.getElementById("editCCADescription").value =
          cca.description || "";
        document.getElementById("editCCAImageUrl").value = cca.imageUrl || "";

        // Show modal
        const modal = new bootstrap.Modal(
          document.getElementById("editCCAModal")
        );
        modal.show();
      } catch (err) {
        console.error("Unexpected error in edit handler:", err);
        alert("Unexpected error while loading CCA.");
      }
    });
  });

  // ----------------------- DISABLE BUTTON -----------------------
  document.querySelectorAll(".sp-disable-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Are you sure you want to disable this CCA?")) return;

      const res = await fetch(`/api/cca/admin/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        alert("CCA disabled successfully.");
        loadLeaderboard(); // Refresh table
      } else {
        alert("Error: " + data.message);
      }
    });
  });

  // ----------------------- ENABLE BUTTON -----------------------
  document.querySelectorAll(".sp-enable-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("Enable this CCA?")) return;

      const res = await fetch(`/api/cca/admin/enable/${id}`, {
        method: "PUT",
      });

      const data = await res.json();

      if (data.success) {
        alert("CCA enabled successfully!");
        loadLeaderboard();
      } else {
        alert("Error: " + data.message);
      }
    });
  });
}

// ============================================================
// INITIALIZE PAGE + ATTACH FILTER EVENT LISTENERS
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  loadLeaderboard(); // load first time

  // Re-fetch leaderboard when category or sort changes
  document.getElementById("categoryFilter").addEventListener("change", loadLeaderboard);
  document.getElementById("sortFilter").addEventListener("change", loadLeaderboard);
});

// ============================================================
// LIVE IMAGE PREVIEW IN EDIT MODAL
// ============================================================
const imageInput = document.getElementById("editCCAImageUrl");
const previewImg = document.getElementById("ccaImagePreview");
const previewContainer = document.getElementById("ccaImagePreviewContainer");

imageInput.addEventListener("input", () => {
  const url = imageInput.value.trim();

  // Only show preview for non-empty URLs
  if (url.length > 5) {
    previewImg.src = url;
    previewContainer.style.display = "block";
  } else {
    previewContainer.style.display = "none";
  }
});

// ============================================================
// SAVE UPDATED CCA DETAILS (FROM EDIT MODAL)
// ============================================================
document.getElementById("saveCCAChanges").addEventListener("click", async () => {
  // Collect updated data from modal
  const id = document.getElementById("editCCAId").value;
  const name = document.getElementById("editCCAName").value;
  const category = document.getElementById("editCCACategory").value;
  const description = document.getElementById("editCCADescription").value;
  const imageUrl = document.getElementById("editCCAImageUrl").value;

  // Send update request to backend
  const res = await fetch(`/api/cca/admin/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, description, imageUrl }),
  });

  const data = await res.json();

  if (data.success) {
    alert("CCA updated successfully!");

    // Close modal
    bootstrap.Modal.getInstance(
      document.getElementById("editCCAModal")
    ).hide();

    // Refresh leaderboard
    loadLeaderboard();
  } else {
    alert("Error: " + data.message);
  }
});

// ============================================================
// OPEN "ADD NEW CCA" MODAL
// ============================================================
document.getElementById("openAddCCAModal").addEventListener("click", () => {
  const modal = new bootstrap.Modal(document.getElementById("addCCAModal"));
  modal.show();
});

// ============================================================
// SAVE NEW CCA
// ============================================================
document.getElementById("saveNewCCA").addEventListener("click", async () => {
  // Collect inputs
  const name = document.getElementById("newCCAName").value.trim();
  const category = document.getElementById("newCCACategory").value;
  const description = document
    .getElementById("newCCADescription")
    .value.trim();
  const imageUrl = document.getElementById("newCCAImageUrl").value.trim();

  if (!name) return alert("CCA name is required.");

  // Send POST request to backend
  const res = await fetch("/api/cca/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, category, description, imageUrl }),
  });

  const data = await res.json();

  if (data.success) {
    alert("CCA added successfully!");

    // Close modal & reset form
    bootstrap.Modal.getInstance(document.getElementById("addCCAModal")).hide();
    document.getElementById("addCCAForm").reset();

    loadLeaderboard();
  } else {
    alert("Error: " + data.message);
  }
});

// ============================================================
// UPDATE BAR + PIE CHARTS WITH CHART.JS
// ============================================================
function updateCharts(ccas) {
  const labels = ccas.map((c) => c.name);
  const clicks = ccas.map((c) => c.clicks);

  // ----------------------- BAR CHART -----------------------
  const barCtx = document.getElementById("ccaBarChart").getContext("2d");

  if (barChart) barChart.destroy(); // Destroy previous instance

  barChart = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Clicks",
          data: clicks,
          backgroundColor: "rgba(75, 123, 255, 0.6)",
          borderColor: "rgba(75, 123, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true },
      },
    },
  });

  // ----------------------- PIE CHART -----------------------
  const categoryTotals = {};
  ccas.forEach((c) => {
    categoryTotals[c.category] = (categoryTotals[c.category] || 0) + 1;
  });

  const pieCtx = document.getElementById("ccaPieChart").getContext("2d");

  if (pieChart) pieChart.destroy();

  pieChart = new Chart(pieCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryTotals),
      datasets: [
        {
          data: Object.values(categoryTotals),
          backgroundColor: [
            "#4B7BFF",
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#8A56F0",
          ],
        },
      ],
    },
  });
}

// ============================================================
// UPDATE CATEGORY BREAKDOWN LIST
// ============================================================
function updateBreakdown(ccas) {
  const breakdown = {};

  // Count CCAs per category
  ccas.forEach((c) => {
    breakdown[c.category] = (breakdown[c.category] || 0) + 1;
  });

  const total = ccas.length;
  const container = document.getElementById("breakdownList");
  container.innerHTML = "";

  // Colors mapped to category
  const colors = {
    Sports: "#4B7BFF",
    "Performing Arts": "#FF6384",
    Clubs: "#36A2EB",
  };

  Object.entries(breakdown).forEach(([category, count]) => {
    const percentage = ((count / total) * 100).toFixed(1);

    container.innerHTML += `
      <div class="breakdown-row">
        <span class="dot" style="background:${colors[category]}"></span>
        <div class="breakdown-text">
          <span class="breakdown-name">${category}</span>
          <span class="breakdown-value">${count} CCAs (${percentage}%)</span>
        </div>
      </div>
    `;
  });
}

// ============================================================
// UPDATE KPI METRICS (TOTAL CCAs, TOTAL CLICKS, POPULARITY)
// ============================================================
function updateKPI(ccas) {
  if (!ccas.length) return;

  // Total CCAs
  document.getElementById("kpiTotalCCA").textContent = ccas.length;

  // Sum clicks across all CCAs
  const totalClicks = ccas.reduce((sum, c) => sum + c.clicks, 0);
  document.getElementById("kpiTotalClicks").textContent = totalClicks;

  // Find CCA with highest clicks
  const most = [...ccas].sort((a, b) => b.clicks - a.clicks)[0];
  document.getElementById("kpiMostPopular").textContent = `${most.name} (${most.clicks})`;

  // Find CCA with lowest clicks
  const least = [...ccas].sort((a, b) => a.clicks - b.clicks)[0];
  document.getElementById("kpiLeastPopular").textContent = `${least.name} (${least.clicks})`;
}

// ============================================================
// EXPORT TABLE AS EXCEL FILE
// ============================================================
document.getElementById("exportExcel").addEventListener("click", () => {
  const table = document.querySelector("#ccaTable");
  const rows = [];

  // Extract header (skip last column)
  const header = [...table.querySelectorAll("thead th")]
    .slice(0, -1)
    .map((th) => th.innerText.trim());
  rows.push(header);

  // Extract body rows (skip last column)
  table.querySelectorAll("tbody tr").forEach((tr) => {
    const cells = [...tr.querySelectorAll("td")]
      .slice(0, -1)
      .map((td) => td.innerText.trim());
    rows.push(cells);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "CCA Leaderboard");

  XLSX.writeFile(workbook, "CCA_Analytics.xlsx");
});

// ============================================================
// EXPORT ENTIRE DASHBOARD AS PDF
// ============================================================
document.getElementById("exportPDF").addEventListener("click", () => {
  const dashboard = document.querySelector("#dashboard");

  // A short delay ensures charts & layout fully render
  setTimeout(() => {
    html2canvas(dashboard, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jspdf.jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("CCA_Analytics_Report.pdf");
    });
  }, 1000);
});

// ============================================================
// EXPORT CHARTS AS PNG
// ============================================================
document.getElementById("exportBar").addEventListener("click", () => {
  exportElementAsPNG("ccaBarChart", "CCA_Bar_Chart.png");
});

document.getElementById("exportPie").addEventListener("click", () => {
  exportElementAsPNG("ccaPieChart", "CCA_Pie_Chart.png");
});

// Helper: Convert element to PNG
function exportElementAsPNG(elementId, filename) {
  const chart = document.getElementById(elementId);

  html2canvas(chart).then((canvas) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = canvas.toDataURL();
    link.click();
  });
}

// ============================================================
// EXPORT CSV VERSION OF TABLE
// ============================================================
document.getElementById("exportCSV").addEventListener("click", () => {
  const table = document.querySelector("#ccaTable");
  const rows = [];

  // Extract header (skip actions column)
  const header = [...table.querySelectorAll("thead th")]
    .slice(0, -1)
    .map((th) => th.innerText.trim());
  rows.push(header);

  // Extract data rows
  table.querySelectorAll("tbody tr").forEach((tr) => {
    const cells = [...tr.querySelectorAll("td")]
      .slice(0, -1)
      .map((td) => td.innerText.trim());
    rows.push(cells);
  });

  // Convert rows → CSV string
  const csv = rows.map((r) => r.join(",")).join("\n");

  // Download CSV file
  const blob = new Blob([csv], { type: "text/csv" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "CCA_Analytics.csv";
  link.click();
});
