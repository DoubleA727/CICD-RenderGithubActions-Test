const API_URL = "/api/admin/orders";

// In-memory store
let allOrders = [];
let viewOrders = [];

// Elements
let ordersTableBody, alertContainer, ordersMeta, ordersCount;
let dateFromEl, dateToEl, statusFilterEl, sortByEl;
let applyFiltersBtn, clearFiltersBtn, refreshBtn, exportCsvBtn;

let orderDetailsModal, orderDetailsHeader, orderItemsTbody;

document.addEventListener("DOMContentLoaded", () => {
  // Bind elements
  ordersTableBody = document.querySelector("#ordersTable tbody");
  alertContainer = document.getElementById("alertContainer");
  ordersMeta = document.getElementById("ordersMeta");
  ordersCount = document.getElementById("ordersCount");

  dateFromEl = document.getElementById("dateFrom");
  dateToEl = document.getElementById("dateTo");
  statusFilterEl = document.getElementById("statusFilter");
  sortByEl = document.getElementById("sortBy");

  applyFiltersBtn = document.getElementById("applyFiltersBtn");
  clearFiltersBtn = document.getElementById("clearFiltersBtn");
  refreshBtn = document.getElementById("refreshBtn");
  exportCsvBtn = document.getElementById("exportCsvBtn");

  orderDetailsHeader = document.getElementById("orderDetailsHeader");
  orderItemsTbody = document.getElementById("orderItemsTbody");

  // Bootstrap modal
  const modalEl = document.getElementById("orderDetailsModal");
  if (window.bootstrap && modalEl) {
    orderDetailsModal = new bootstrap.Modal(modalEl);
  }

  // Events
  applyFiltersBtn.addEventListener("click", () => {
    applyFiltersAndRender();
  });

  clearFiltersBtn.addEventListener("click", () => {
    clearFilters();
    applyFiltersAndRender();
  });

  refreshBtn.addEventListener("click", async () => {
    await loadOrders();
    applyFiltersAndRender();
  });

  exportCsvBtn.addEventListener("click", () => {
    exportOrdersToCsv(viewOrders);
  });

  // Initial load
  loadOrders().then(() => applyFiltersAndRender());
});

async function loadOrders() {
  clearAlert();
  setMeta("Loading…");

  try {
    const res = await fetch(API_URL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include" // keep if your admin auth uses cookies
    });

    if (!res.ok) {
      showAlert("danger", `Failed to load orders (HTTP ${res.status})`);
      setMeta("Load failed");
      return;
    }

    const data = await res.json();
    allOrders = Array.isArray(data) ? data : [];
    setMeta(`Loaded ${allOrders.length} orders`);
  } catch (err) {
    console.error(err);
    showAlert("danger", "Network error while loading orders.");
    setMeta("Load failed");
  }
}

function applyFiltersAndRender() {
  viewOrders = filterOrders(allOrders);
  viewOrders = sortOrders(viewOrders);
  renderTable(viewOrders);

  const from = dateFromEl.value ? formatDateDisplay(dateFromEl.value) : "Any";
  const to = dateToEl.value ? formatDateDisplay(dateToEl.value) : "Any";
  const status = statusFilterEl.value || "All";
  const sortLabel = sortByEl.value;

  ordersMeta.textContent = `From: ${from}  |  To: ${to}  |  Status: ${status}  |  Sort: ${sortLabel}`;
  ordersCount.textContent = `(${viewOrders.length})`;
}

function filterOrders(orders) {
  const from = dateFromEl.value ? new Date(dateFromEl.value + "T00:00:00") : null;
  const to = dateToEl.value ? new Date(dateToEl.value + "T23:59:59") : null;
  const status = statusFilterEl.value?.trim() || "";

  return orders.filter((o) => {
    const created = o.createdAt ? new Date(o.createdAt) : null;

    if (from && created && created < from) return false;
    if (to && created && created > to) return false;

    if (status && String(o.status).toUpperCase() !== status.toUpperCase()) return false;

    return true;
  });
}

function sortOrders(orders) {
  const key = sortByEl.value;
  const copy = [...orders];

  copy.sort((a, b) => {
    if (key === "newest" || key === "oldest") {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return key === "newest" ? db - da : da - db;
    }

    if (key === "highestTotal" || key === "lowestTotal") {
      const ta = Number(a.totalPrice ?? 0);
      const tb = Number(b.totalPrice ?? 0);
      return key === "highestTotal" ? tb - ta : ta - tb;
    }

    return 0;
  });

  return copy;
}

function renderTable(orders) {
  ordersTableBody.innerHTML = "";

  if (!orders.length) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="8" class="text-center text-muted py-4">No orders found.</td>`;
    ordersTableBody.appendChild(tr);
    return;
  }

  for (const o of orders) {
    const tr = document.createElement("tr");

    const userText = `${escapeHtml(o.username ?? "Unknown")} <span class="text-muted small">(ID: ${escapeHtml(String(o.userId ?? "-"))})</span>`;
    const itemsCount = Array.isArray(o.items)
    ? o.items.reduce((sum, it) => sum + Number(it.quantity || 0), 0)
    : 0;

    const shipping = Number(o.shippingPrice ?? 0);
    const total = Number(o.totalPrice ?? 0);
    const subtotal = total - shipping;


    tr.innerHTML = `
      <td>${escapeHtml(String(o.orderId ?? ""))}</td>
      <td>${userText}</td>
      <td>${badgeForStatus(o.status)}</td>

      <td>${itemsCount}</td>
      <td class="text-end">${formatMoney(subtotal)}</td>
      <td class="text-end">${formatMoney(shipping)}</td>
      <td class="text-end fw-semibold">${formatMoney(total)}</td>

      <td>${formatDateTime(o.createdAt)}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-secondary" data-action="view" data-id="${escapeAttr(String(o.orderId))}">
          View
        </button>
      </td>
    `;

    ordersTableBody.appendChild(tr);
  }

  // Wire up view buttons
  ordersTableBody.querySelectorAll('button[data-action="view"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const order = orders.find((x) => String(x.orderId) === String(id));
      if (order) openDetailsModal(order);
    });
  });
}

function openDetailsModal(order) {
  if (!orderDetailsModal) {
    showAlert("warning", "Modal unavailable (Bootstrap not loaded).");
    return;
  }

  const items = Array.isArray(order.items) ? order.items : [];

  orderDetailsHeader.innerHTML = `
    <div class="d-flex flex-wrap justify-content-between gap-2">
      <div>
        <div class="fw-bold">Order #${escapeHtml(String(order.orderId))}</div>
        <div class="text-muted small">
          User: ${escapeHtml(order.username ?? "Unknown")}
          (ID: ${escapeHtml(String(order.userId ?? "-"))})
        </div>
      </div>
      <div class="text-end">
        <div>${badgeForStatus(order.status)}</div>
        <div class="text-muted small">${formatDateTime(order.createdAt)}</div>
      </div>
    </div>
    <hr class="my-2" />
    <div class="d-flex justify-content-end gap-4">
      <div class="text-muted">Shipping: <span class="fw-semibold text-dark">${formatMoney(order.shippingPrice)}</span></div>
      <div class="text-muted">Total: <span class="fw-semibold text-dark">${formatMoney(order.totalPrice)}</span></div>
    </div>
  `;

  orderItemsTbody.innerHTML = "";
  if (!items.length) {
    orderItemsTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-3">No items.</td></tr>`;
  } else {
    for (const it of items) {
      const name = it.name ?? `Merch ${it.merchId ?? ""}`;
      orderItemsTbody.innerHTML += `
        <tr>
          <td>${escapeHtml(String(name))}</td>
          <td class="text-end">${formatMoney(it.price)}</td>
          <td class="text-end">${escapeHtml(String(it.quantity ?? 0))}</td>
          <td class="text-end fw-semibold">${formatMoney(it.subtotal)}</td>
        </tr>
      `;
    }
  }

  orderDetailsModal.show();
}

function exportOrdersToCsv(orders) {
  if (!orders || !orders.length) {
    showAlert("warning", "Nothing to export (no orders in the current view).");
    return;
  }

  const rows = orders.map((o) => {
    const items = Array.isArray(o.items) ? o.items : [];
    const itemsSummary = items
      .map((it) => {
        const nm = it.name ?? `Merch ${it.merchId ?? ""}`;
        return `${nm} x${it.quantity ?? 0}`;
      })
      .join(" | ");

    return {
      orderId: o.orderId ?? "",
      status: o.status ?? "",
      createdAt: o.createdAt ?? "",
      shippingPrice: o.shippingPrice ?? 0,
      totalPrice: o.totalPrice ?? 0,
      userId: o.userId ?? "",
      username: o.username ?? "",
      itemsCount: items.length,
      itemsSummary
    };
  });

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvCell(r[h])).join(","))
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `orders_export_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
  showAlert("success", `Exported ${orders.length} orders to CSV.`);
}

/* ---------- helpers ---------- */

function clearFilters() {
  dateFromEl.value = "";
  dateToEl.value = "";
  statusFilterEl.value = "";
  sortByEl.value = "newest";
}

function showAlert(type, message) {
  alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${escapeHtml(message)}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
  `;
}

function clearAlert() {
  alertContainer.innerHTML = "";
}

function setMeta(text) {
  ordersMeta.textContent = text || "";
}

function formatMoney(v) {
  const n = Number(v ?? 0);
  if (Number.isNaN(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString();
}

function formatDateDisplay(yyyyMmDd) {
  try {
    const [y, m, d] = yyyyMmDd.split("-");
    return `${d}/${m}/${y}`;
  } catch {
    return yyyyMmDd;
  }
}

function badgeForStatus(status) {
  const s = String(status ?? "").toUpperCase();
  const map = {
    PENDING: "secondary",
    PAID: "success",
    PROCESSING: "primary",
    SHIPPED: "info",
    DELIVERED: "success",
    CANCELLED: "danger"
  };
  const colour = map[s] || "dark";
  return `<span class="badge text-bg-${colour}">${escapeHtml(s || "UNKNOWN")}</span>`;
}

function csvCell(value) {
  const s = String(value ?? "");
  const needsWrap = /[",\n]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsWrap ? `"${escaped}"` : escaped;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(str) {
  return escapeHtml(str).replace(/`/g, "&#096;");
}
