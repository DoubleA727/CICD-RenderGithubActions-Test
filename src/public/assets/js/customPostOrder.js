// public/assets/js/customPostOrder.js

function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (err) {
    console.error("Invalid token", err);
    return null;
  }
}

function getAuthUserIdOrThrow() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("User not authenticated");
  const decoded = decodeToken(token);
  if (!decoded || !decoded.userId) throw new Error("Invalid token");
  return decoded.userId;
}

const CUSTOM_MERCH_ID = 18;

const addBtn = document.getElementById("addToCartBtn");

function getCustomizationPayload() {
  const state = window.getCustomizationState?.();
  if (!state) throw new Error("Customizer state not available");

  return {
    quantity: state.quantity || 1,
    customization: {
      color: state.color || "black",
      customText: state.customText ?? null,
      badgeKey: state.badgeKey ?? null,
      previewUrl: null,
      previewData: null
    }
  };
}

async function addCustomMerchToCart() {
  try {
    if (!addBtn) throw new Error("Add to Cart button not found");
    addBtn.disabled = true;

    const userId = getAuthUserIdOrThrow();
    const { quantity, customization } = getCustomizationPayload();

    // ✅ DECLARE FIRST
    const estimatedPrice = getEstimatedPriceFromUI();

    // ✅ THEN USE
    if (estimatedPrice == null) {
      throw new Error("Estimated price not found");
    }

    const res = await fetch(`/api/order/postOrder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        merchId: CUSTOM_MERCH_ID,
        quantity,
        priceOverride: estimatedPrice, // ✅ passed to backend
        customization,
      }),
    });

    const result = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(result.message || "Failed to add custom merch");

    alert("Custom merch added successfully!");
    window.location.href = "./cart.html";

  } catch (err) {
    console.error(err);
    alert(err.message || "Error adding custom merch");
  } finally {
    addBtn.disabled = false;
  }
}


function getEstimatedPriceFromUI() {
  const el = document.getElementById("priceText");
  if (!el) return null;

  // "$18.90" -> 18.9
  const num = parseFloat(el.textContent.replace(/[^0-9.]/g, ""));
  return Number.isFinite(num) ? num : null;
}



if (addBtn) addBtn.addEventListener("click", addCustomMerchToCart);
