document.addEventListener("DOMContentLoaded", () => {
  const orderCardsContainer = document.getElementById("orderCardsContainer");
  const statusText = document.getElementById("orderStatusText");
  const checkoutBtn = document.getElementById("checkoutBtn");

  // ------- Edit modal wiring -------
  let currentEditingOrderItemId = null;
  const editQuantityInput = document.getElementById("editQuantityInput");
  const editOrderForm = document.getElementById("editOrderForm");
  const editOrderModalEl = document.getElementById("editOrderModal");
  const editOrderModal = new bootstrap.Modal(editOrderModalEl);

  editOrderForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newQty = parseInt(editQuantityInput.value, 10);
    if (Number.isNaN(newQty) || newQty <= 0) {
      alert("Please enter a valid quantity.");
      return;
    }

    if (!currentEditingOrderItemId) {
      alert("Something went wrong. Missing order item ID.");
      return;
    }

    const ok = await updateOrder(currentEditingOrderItemId, newQty);
    if (ok) {
      editOrderModal.hide();
      await refreshOrders();
    }
  });

  // ------- Delete modal wiring -------
  let currentDeletingOrderItemId = null;
  const deleteOrderModalEl = document.getElementById("deleteOrderModal");
  const deleteOrderModal = new bootstrap.Modal(deleteOrderModalEl);
  const confirmDeleteOrderBtn = document.getElementById("confirmDeleteOrderBtn");

  confirmDeleteOrderBtn.addEventListener("click", async () => {
    if (!currentDeletingOrderItemId) {
      console.error("Missing order item id for delete");
      deleteOrderModal.hide();
      return;
    }

    const ok = await deleteOrder(currentDeletingOrderItemId);
    if (ok) {
      deleteOrderModal.hide();
      await refreshOrders();
    }
  });

  // ------- Add merch id into form -------
  const params = new URLSearchParams(window.location.search);
  const merchId = params.get("merch_id");

  if (merchId) {
    const merchInput = document.querySelector('input[name="merchId"]');
    merchInput.value = merchId;
    merchInput.readOnly = true;
  }

  // ------- Render order cards -------
  function renderOrders(orders) {
    orderCardsContainer.innerHTML = "";

    if (!orders || orders.length === 0) {
      statusText.textContent = "No items in your order yet.";
      orderCardsContainer.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info mb-0">
            You don’t have any items in your order. Use the form above to add some merch!
          </div>
        </div>`;
      checkoutBtn.style.display = "none";
      return;
    }

    checkoutBtn.style.display = "block";
    statusText.textContent = `${orders.length} item(s) in your order`;

    orders.forEach((order) => {
      const orderItemId =
        order.orderitemid ?? // from get_orders RETURNS TABLE (lowercase)
        order.orderItemId ?? // just in case
        order.order_id ??    // any weird legacy alias
        order.orderId ??     // last fallback
        order.id;            // absolute last resort

      console.log(
        "Row from API:",
        order,
        "=> using orderItemId =",
        orderItemId
      );

      const merchName =
        order.name || `Merch #${order.merchId ?? order.merchid}`;
      const col = document.createElement("div");
      col.className = "col-12 col-md-6 col-lg-4";

      col.innerHTML = `
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="mb-2">
              <h5 class="card-title mb-1">${merchName}</h5>
              <p class="card-text mb-0">
                <strong>Merch ID:</strong> ${order.merchId ?? order.merchid}
              </p>
              <p class="card-text mb-0">
                <strong>Quantity:</strong> <span class="order-qty">${order.quantity}</span>
              </p>
              <p class="card-text mb-1">
                <strong>Price:</strong> $${order.subtotal}
              </p>
            </div>

            <div class="mt-auto d-flex justify-content-between">
              <button class="btn btn-sm btn-outline-primary btn-edit-order">
                Edit
              </button>
              <button class="btn btn-sm btn-outline-danger btn-delete-order">
                Delete
              </button>
            </div>
          </div>
        </div>
      `;

      const editBtn = col.querySelector(".btn-edit-order");
      const deleteBtn = col.querySelector(".btn-delete-order");

      // ---- Edit button: open modal ----
      editBtn.addEventListener("click", () => {
        currentEditingOrderItemId = orderItemId;
        editQuantityInput.value = order.quantity;
        editOrderModal.show();
      });

      // ---- Delete button: open delete modal ----
      deleteBtn.addEventListener("click", () => {
        console.log("Open delete modal for orderItemId =", orderItemId);
        currentDeletingOrderItemId = orderItemId;
        deleteOrderModal.show();
      });

      orderCardsContainer.appendChild(col);
    });
  }

  // ------- Refresh from API -------
  async function refreshOrders() {
    statusText.textContent = "Loading…";
    const orders = await getOrders(); // from getOrder.js
    renderOrders(orders);
  }

  refreshOrders();
});
