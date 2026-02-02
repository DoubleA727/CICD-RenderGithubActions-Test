// public/assets/js/admin.js
// Admin merch dashboard: loads merch (public) and does admin CRUD
const userId = localStorage.getItem("userId");

const link = document.getElementById("adminChatLink");
if (link && userId) {
  link.href = `/chat.html?me=${userId}`;
} else if (link) {
  link.href = `/chat.html`; // fallback
}

document.addEventListener("DOMContentLoaded", async () => {
  const archiveDropZone = document.getElementById("archiveDropZone");

  // Track currently selected merch IDs (for multi-select)
  const selectedMerchIds = new Set();
  // DOM elements
  const merchTableBody = document.querySelector("#merchTable tbody");
  const merchMeta = document.getElementById("merchMeta");
  const merchModalEl = document.getElementById("merchModal");
  const merchForm = document.getElementById("merchForm");
  const merchModalLabel = document.getElementById("merchModalLabel");
  const addMerchBtn = document.getElementById("addMerchBtn");
  const alertContainer = document.getElementById("alertContainer");

  const merchIdInput = document.getElementById("merchId");
  const nameInput = document.getElementById("name");
  const priceInput = document.getElementById("price");
  const ccaSelect = document.getElementById("ccaSelect");
  const tierIdInput = document.getElementById("tierId");
  const storyTextInput = document.getElementById("storyText");
  const descriptionInput = document.getElementById("description");

  const imageFileInput = document.getElementById("imageFile");
  const existingImageUrlInput = document.getElementById("existingImageUrl");
  const imagePreview = document.getElementById("imagePreview");

  if (
    !merchTableBody ||
    !merchModalEl ||
    !merchForm ||
    !merchModalLabel ||
    !addMerchBtn
  ) {
    console.error("admin.js: required DOM elements missing");
    return;
  }

  const merchModal = new bootstrap.Modal(merchModalEl);

  // API endpoints
  const MERCH_GET_API = "/api/merch/all"; // public list
  const MERCH_ADMIN_API = "/api/admin/merch"; // protected CRUD
  const CCA_API = "/api/cca";

  // CCA map: { [ccaId]: name }
  const ccaMap = {};

  // Build headers with token
  function authHeaders(options = {}) {
    const { isJson = false } = options;
    const token = localStorage.getItem("token");
    const headers = {};

    if (isJson) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  function showAlert(message, type = "success") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
    alertContainer.appendChild(wrapper);
  }

  function renderEmptyRow(message, isError = false) {
    merchTableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center ${
          isError ? "text-danger" : "text-muted"
        }">
          ${message}
        </td>
      </tr>
    `;
    if (merchMeta) merchMeta.textContent = "";
  }

  // ===== IMAGE PREVIEW HELPERS =====
  function setImagePreviewUrl(url) {
    if (!imagePreview) return;

    const trimmed = (url || "").trim();

    if (!trimmed) {
      imagePreview.style.display = "none";
      imagePreview.src = "";
      return;
    }

    imagePreview.src = trimmed;
    imagePreview.style.display = "block";
  }

  function setImagePreviewFile(file) {
    if (!file) {
      setImagePreviewUrl("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  if (imageFileInput) {
    imageFileInput.addEventListener("change", () => {
      const file = imageFileInput.files[0];
      setImagePreviewFile(file);
    });
  }

  // ===== CCA DROPDOWN =====
  async function loadCcaOptions() {
    if (!ccaSelect) return;

    ccaSelect.innerHTML = `<option value="">Loading CCAs...</option>`;

    try {
      const res = await fetch(CCA_API, {
        headers: authHeaders({ isJson: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch CCAs");
      }

      const data = await res.json();
      const items = Array.isArray(data.data) ? data.data : [];

      if (!items.length) {
        ccaSelect.innerHTML = `<option value="">No CCAs found</option>`;
        return;
      }

      ccaSelect.innerHTML = `<option value="">Select a CCA...</option>`;

      items
        .sort((a, b) => a.name.localeCompare(b.name))
        .forEach((cca) => {
          ccaMap[String(cca.ccaId)] = cca.name;
          const opt = document.createElement("option");
          opt.value = cca.ccaId;
          opt.textContent = cca.name;
          ccaSelect.appendChild(opt);
        });
    } catch (err) {
      console.error("Error loading CCAs:", err);
      ccaSelect.innerHTML = `<option value="">Error loading CCAs</option>`;
    }
  }

  // ===== MERCH TABLE =====
  async function loadMerch() {
    renderEmptyRow(`
      <div class="d-flex justify-content-center align-items-center gap-2">
        <div class="spinner-border spinner-border-sm" role="status"></div>
        <span>Loading merch...</span>
      </div>
    `);

    try {
      const res = await fetch(MERCH_GET_API, {
        headers: authHeaders({ isJson: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch merch");
      }

      const data = await res.json();
      const items =
        data.result ||
        data.data ||
        data.rows ||
        data.merch ||
        (Array.isArray(data) ? data : []);

      if (!items.length) {
        renderEmptyRow("No merch found.");
        return;
      }

      merchTableBody.innerHTML = "";

      items.forEach((item) => {
        const tr = document.createElement("tr"); // ✅ ADD THIS
        const ccaName =
          ccaMap[String(item.ccaId)] ??
          ccaMap[item.ccaId] ??
          `Unknown CCA (ID ${item.ccaId})`; // ✅ ADD THIS
        const isArchived = item.isActive === false;

        // mark row for styling & data
        tr.classList.add("merch-row");
        tr.dataset.merchId = String(item.merchId);

        tr.innerHTML = `
          <td>${item.merchId ?? ""}</td>
          <td>
            <strong>${item.name ?? ""}</strong>
            ${
              item.description
                ? `<div class="small text-muted text-truncate" style="max-width: 260px;">${item.description}</div>`
                : ""
            }
          </td>
          <td>${ccaName}</td>
          <td>${item.tierId ?? "-"}</td>
          <td>
            ${
              item.storyText
                ? `<div class="small" style="max-width: 260px; white-space: normal; word-wrap: break-word;">${item.storyText}</div>`
                : "-"
            }
          </td>
          <td>$${Number(item.price ?? 0).toFixed(2)}</td>
          <td>
            ${
              item.imageUrl
                ? `<a href="${item.imageUrl}" target="_blank" rel="noopener noreferrer">View</a>`
                : "-"
            }
          </td>
          <td>
            ${
              isArchived
                ? '<span class="badge bg-secondary">Archived</span>'
                : '<span class="badge bg-success">Active</span>'
            }
          </td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-1" data-action="edit">
              Edit
            </button>
            ${
              isArchived
                ? '<button class="btn btn-sm btn-outline-secondary" data-action="unarchive">Unarchive</button>'
                : '<button class="btn btn-sm btn-outline-danger" data-action="delete">Archive</button>'
            }
          </td>
        `;

        // Edit button
        tr.querySelector('[data-action="edit"]').addEventListener(
          "click",
          (e) => {
            e.stopPropagation(); // don't toggle row selection
            openEditModal(item);
          }
        );

        // Archive / Unarchive buttons
        const deleteBtn = tr.querySelector('[data-action="delete"]');
        const unarchiveBtn = tr.querySelector('[data-action="unarchive"]');

        if (deleteBtn) {
          deleteBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleDelete(item);
          });
        }

        if (unarchiveBtn) {
          unarchiveBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            handleUnarchive(item);
          });
        }

        // ===== Row click: toggle multi-selection =====
        tr.addEventListener("click", (e) => {
          // Ignore clicks on links or buttons
          if (e.target.closest("button") || e.target.closest("a")) return;

          const id = String(item.merchId);
          if (selectedMerchIds.has(id)) {
            selectedMerchIds.delete(id);
            tr.classList.remove("merch-row-selected");
          } else {
            selectedMerchIds.add(id);
            tr.classList.add("merch-row-selected");
          }
        });

        // ===== Drag support =====
        tr.setAttribute("draggable", "true");

        tr.addEventListener("dragstart", (e) => {
          const id = String(item.merchId);

          // If nothing selected yet, drag just this row
          if (!selectedMerchIds.size) {
            selectedMerchIds.add(id);
            tr.classList.add("merch-row-selected");
          }

          const ids = Array.from(selectedMerchIds);
          e.dataTransfer.setData("application/json", JSON.stringify(ids));
          e.dataTransfer.effectAllowed = "move";
        });

        merchTableBody.appendChild(tr);
      });

      if (merchMeta) {
        merchMeta.textContent = `${items.length} item${
          items.length === 1 ? "" : "s"
        } loaded`;
      }
    } catch (err) {
      console.error("Error loading merch:", err);
      renderEmptyRow("Error loading merch.", true);
      showAlert("Error loading merch from server.", "danger");
    }
  }
  // ===== BULK ARCHIVE VIA DRAG & DROP =====
  if (archiveDropZone) {
    // Allow drop
    archiveDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      archiveDropZone.classList.add("drag-over");
    });

    archiveDropZone.addEventListener("dragleave", () => {
      archiveDropZone.classList.remove("drag-over");
    });

    archiveDropZone.addEventListener("drop", async (e) => {
      e.preventDefault();
      archiveDropZone.classList.remove("drag-over");

      let ids = [];
      try {
        const raw = e.dataTransfer.getData("application/json") || "[]";
        ids = JSON.parse(raw);
      } catch {
        ids = [];
      }

      ids = Array.from(new Set(ids)); // unique

      if (!ids.length) return;

      if (
        !confirm(
          `Archive ${ids.length} merch item(s)? This will mark them as Archived.`
        )
      ) {
        return;
      }

      const results = await Promise.all(ids.map((id) => archiveMerchById(id)));
      const successCount = results.filter((r) => r.ok).length;
      const failCount = results.length - successCount;

      if (successCount) {
        showAlert(`${successCount} merch item(s) archived.`, "success");
      }
      if (failCount) {
        showAlert(
          `${failCount} merch item(s) failed to archive. Check console/logs.`,
          "danger"
        );
      }

      selectedMerchIds.clear();
      await loadMerch();
    });
  }

  // ===== MODAL HANDLERS =====

  // Reset modal for "Add"
  addMerchBtn.addEventListener("click", () => {
    merchForm.reset();
    merchIdInput.value = "";
    existingImageUrlInput.value = "";
    merchModalLabel.textContent = "Add Merch";
    setImagePreviewUrl("");
    merchForm.classList.remove("was-validated");
  });

  // Open "Edit" modal
  function openEditModal(item) {
    merchForm.reset();
    merchForm.classList.remove("was-validated");
    merchModalLabel.textContent = "Edit Merch";

    merchIdInput.value = item.merchId ?? "";
    nameInput.value = item.name ?? "";
    priceInput.value = item.price ?? "";

    if (ccaSelect) {
      ccaSelect.value = item.ccaId ?? "";
    }

    if (tierIdInput) {
      tierIdInput.value = item.tierId ?? "";
    }

    if (storyTextInput) {
      storyTextInput.value = item.storyText ?? "";
    }

    if (descriptionInput) {
      descriptionInput.value = item.description ?? "";
    }

    const currentImageUrl = item.imageUrl || "";
    existingImageUrlInput.value = currentImageUrl;
    imageFileInput.value = "";
    setImagePreviewUrl(currentImageUrl);

    merchModal.show();
  }

  // ===== SAVE (CREATE / EDIT) =====
  merchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    merchForm.classList.add("was-validated");

    if (!merchForm.checkValidity()) return;

    const merchId = merchIdInput.value;
    const isEdit = !!merchId;

    const file = imageFileInput.files[0];
    const existingImageUrl = existingImageUrlInput.value || "";

    if (!file && !existingImageUrl && !isEdit) {
      showAlert("Image is required.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("name", nameInput.value.trim());
    formData.append("price", priceInput.value);
    formData.append("ccaId", ccaSelect.value);
    formData.append("tierId", tierIdInput.value);
    formData.append("description", (descriptionInput.value || "").trim());
    formData.append("storyText", (storyTextInput.value || "").trim());

    if (isEdit) {
      formData.append("existingImageUrl", existingImageUrl);
    }

    if (file) {
      formData.append("imageFile", file);
    }

    const url = isEdit ? `${MERCH_ADMIN_API}/${merchId}` : MERCH_ADMIN_API;
    const method = isEdit ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(), // don't set Content-Type for FormData
        body: formData,
      });

      const responseData = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg = responseData.message || "Error saving merch.";
        showAlert(msg, "danger");
        return;
      }

      showAlert(
        responseData.message || (isEdit ? "Merch updated." : "Merch created.")
      );
      merchModal.hide();
      await loadMerch();
    } catch (err) {
      console.error("Error saving merch:", err);
      showAlert("Server error. Please try again.", "danger");
    }
  });

  // Archive one merch by ID (used by single + bulk archive)
  async function archiveMerchById(merchId) {
    try {
      const res = await fetch(`${MERCH_ADMIN_API}/${merchId}`, {
        method: "DELETE",
        headers: authHeaders({ isJson: true }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        return {
          ok: false,
          message: data.message || `Error archiving merch ID ${merchId}.`,
        };
      }

      return {
        ok: true,
        message: data.message || `Merch ID ${merchId} archived.`,
      };
    } catch (err) {
      console.error("Error archiving merch:", err);
      return { ok: false, message: "Server error. Please try again." };
    }
  }

  // ===== ARCHIVE (SOFT DELETE) =====
  // ===== ARCHIVE (SOFT DELETE) – single item (button) =====
  async function handleDelete(item) {
    if (
      !confirm(
        `Are you sure you want to archive merch "${item.name}" (ID: ${item.merchId})?`
      )
    ) {
      return;
    }

    const result = await archiveMerchById(item.merchId);
    if (!result.ok) {
      showAlert(result.message, "danger");
    } else {
      showAlert(result.message, "success");
    }

    await loadMerch();
  }

  // ===== UNARCHIVE (SOFT UNDELETE) – single item (button) =====
  async function handleUnarchive(item) {
    if (
      !confirm(
        `Unarchive merch "${item.name}" (ID: ${item.merchId}) so it shows on the merch page again?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`${MERCH_ADMIN_API}/${item.merchId}/restore`, {
        method: "PATCH",
        headers: authHeaders({ isJson: true }),
        body: JSON.stringify({ isActive: true }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showAlert(data.message || "Error unarchiving merch.", "danger");
        return;
      }

      showAlert(data.message || "Merch unarchived.", "success");
      await loadMerch();
    } catch (err) {
      console.error("Error unarchiving merch:", err);
      showAlert("Server error. Please try again.", "danger");
    }
  }

  // ===== INITIAL LOAD =====
  await loadCcaOptions();
  await loadMerch();
});
