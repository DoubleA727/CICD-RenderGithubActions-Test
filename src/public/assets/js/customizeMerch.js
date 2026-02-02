// public/assets/js/customizeMerch.js
// UI + Live Preview ONLY (no POST / add-to-cart logic)

// 1) Define base images + badges (put these files in /public/assets/... folders)
const BASE_IMAGES = {
  tshirt: "./assets/images/custom/whitetee.png",
  hoodie: "./assets/images/custom/whitehoodie.png",
  totebag: "./assets/images/custom/totebag.png",
};

const BADGES = [
  { key: "", name: "None", src: "" },
  { key: "sp", name: "SP", src: "./assets/images/custom/splogo.png" },
  { key: "cca1", name: "CCA 1", src: "./assets/images/custom/ccabadge.png" },
  { key: "gold", name: "Gold", src: "./assets/images/custom/goldbadge.png" },
];

// 2) Simple tint map (overlay colour)
function colorToRGBA(color) {
  const map = {
    black: "rgba(0,0,0,0.35)",
    red: "rgba(220,53,69,0.25)",
    blue: "rgba(13,110,253,0.22)",
    green: "rgba(25,135,84,0.22)",
  };
  return map[color] || "rgba(0,0,0,0)";
}

function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

// 3) Price logic (frontend estimate)
function calcPrice({ base, text, badgeKey, qty }) {
  const basePriceMap = { tshirt: 15.9, hoodie: 29.9, totebag: 12.9 };
  const basePrice = basePriceMap[base] ?? 15.9;
  const textAddon = text?.trim() ? 1.0 : 0;
  const badgeAddon = badgeKey ? 2.0 : 0;
  const unit = basePrice + textAddon + badgeAddon;
  return { unit, total: unit * qty };
}

// ---- DOM (safe getters) ----
const canvas = document.getElementById("previewCanvas");
const ctx = canvas ? canvas.getContext("2d") : null;

const baseSelect = document.getElementById("baseSelect");
const colorSelect = document.getElementById("colorSelect");
const textInput = document.getElementById("textInput");
const textCount = document.getElementById("textCount");
const badgeList = document.getElementById("badgeList");
const qtyInput = document.getElementById("qtyInput");
const priceText = document.getElementById("priceText");

// NOTE: We keep these IDs but do NOT add click handlers here anymore
const addToCartBtn = document.getElementById("addToCartBtn");
const statusMsg = document.getElementById("statusMsg");

// ---- State ----
let selectedBadgeKey = "";
let baseImg = new Image();
let badgeImg = null;
// ---- Drag state (badge + text) ----
const BADGE_DRAW_W = 160;
const BADGE_DRAW_H = 160;

// Default positions (same as your current fixed positions)
let badgePos = { x: 650, y: 90 };
let textPos = { x: 450, y: 780 }; // center-ish

let dragging = {
  active: false,
  target: null, // "badge" | "text"
  offsetX: 0,
  offsetY: 0,
};

// Keep last text bbox for hit-testing
let lastTextBox = null;

// Clamp helper so items don't go out of canvas
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Convert pointer coords to canvas coords
function getCanvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY,
  };
}

function pointInRect(px, py, r) {
  return px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}


// Expose current selection for customPostOrder.js (optional but helpful)
window.getCustomizationState = function () {
  const qty = Math.max(1, parseInt(qtyInput?.value || "1", 10));
  const previewData = canvas ? canvas.toDataURL("image/png") : null;

  return {
    base: baseSelect?.value || "tshirt",
    color: colorSelect?.value || "black",
    customText: (textInput?.value || "").trim() || null,
    badgeKey: selectedBadgeKey || null,
    quantity: qty,
    previewData,

    // NEW: positions (so cart/order can recreate it later)
    badgePos: { ...badgePos },
    textPos: { ...textPos },
  };
};


// Build badge thumbnails
function renderBadges() {
  if (!badgeList) return;

  badgeList.innerHTML = "";

  BADGES.forEach((b) => {
    if (!b.key) {
      const noneBtn = document.createElement("button");
      noneBtn.type = "button";
      noneBtn.className = "btn btn-outline-secondary btn-sm";
      noneBtn.textContent = "None";
      noneBtn.onclick = () => {
        selectedBadgeKey = "";
        badgeImg = null;
        document.querySelectorAll(".badge-thumb").forEach((el) => el.classList.remove("active"));
        update();
      };
      badgeList.appendChild(noneBtn);
      return;
    }

    const img = document.createElement("img");
    img.src = b.src;
    img.alt = b.name;
    img.className = "badge-thumb" + (selectedBadgeKey === b.key ? " active" : "");

    img.onclick = async () => {
      selectedBadgeKey = b.key;

      document.querySelectorAll(".badge-thumb").forEach((el) => el.classList.remove("active"));
      img.classList.add("active");

      badgeImg = new Image();
      badgeImg.src = b.src;
      await new Promise((res) => (badgeImg.onload = res));

      update();
    };

    badgeList.appendChild(img);
  });
}

// Load base image
async function loadBase() {
  if (!baseSelect) return;

  const base = baseSelect.value;
  baseImg = new Image();
  baseImg.src = BASE_IMAGES[base] || BASE_IMAGES.tshirt;
  await new Promise((res) => (baseImg.onload = res));
}

// Draw preview
function draw() {
  if (!canvas || !ctx) return;

  const color = colorSelect?.value || "black";
  const text = (textInput?.value || "").trim();

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1) base image
  ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

  // 2) tint overlay
  ctx.fillStyle = colorToRGBA(color);
  ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 3) badge (draggable)
  if (badgeImg) {
    ctx.drawImage(badgeImg, badgePos.x, badgePos.y, BADGE_DRAW_W, BADGE_DRAW_H);

    // optional: draw selection box when dragging badge
    if (dragging.target === "badge") {
      ctx.strokeStyle = "rgba(220,53,69,0.9)";
      ctx.lineWidth = 3;
      ctx.strokeRect(badgePos.x, badgePos.y, BADGE_DRAW_W, BADGE_DRAW_H);
    }
  }

  // 4) text (draggable)
  if (text) {
    ctx.font = "bold 64px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowBlur = 10;

    ctx.fillText(text.toUpperCase(), textPos.x, textPos.y);

    ctx.shadowBlur = 0;

    // Save a bbox for hit-testing (approx)
    const metrics = ctx.measureText(text.toUpperCase());
    const textW = metrics.width;
    const textH = 64; // approx height (matches font size)
    lastTextBox = {
      x: textPos.x - textW / 2,
      y: textPos.y - textH,
      w: textW,
      h: textH,
    };

    // optional selection box
    if (dragging.target === "text") {
      ctx.strokeStyle = "rgba(220,53,69,0.9)";
      ctx.lineWidth = 3;
      ctx.strokeRect(lastTextBox.x - 6, lastTextBox.y - 6, lastTextBox.w + 12, lastTextBox.h + 12);
    }
  } else {
    lastTextBox = null;
  }

}

function updatePrice() {
  if (!priceText) return;

  const qty = Math.max(1, parseInt(qtyInput?.value || "1", 10));
  const result = calcPrice({
    base: baseSelect?.value || "tshirt",
    text: textInput?.value || "",
    badgeKey: selectedBadgeKey,
    qty,
  });

  priceText.textContent = money(result.total);
}

// One update function
function update() {
  if (textCount && textInput) {
    textCount.textContent = `${textInput.value.length}/16`;
  }
  updatePrice();
  draw();

  // We do NOT submit anything here. But we can clear UI messages if you want:
  if (statusMsg) statusMsg.innerHTML = "";
}

// Init
(async function init() {
  // If the customize page HTML is missing elements, fail gracefully:
  if (!canvas || !ctx || !baseSelect || !colorSelect || !textInput || !qtyInput) {
    console.warn("Customizer: Missing required DOM elements. Check customizeMerch.html IDs.");
    return;
  }

  renderBadges();
  await loadBase();
  update();

  baseSelect.addEventListener("change", async () => {
    await loadBase();
    update();
  });
  colorSelect.addEventListener("change", update);
  textInput.addEventListener("input", update);
  qtyInput.addEventListener("input", update);
    // ---- Drag interactions (badge + text) ----
  canvas.style.touchAction = "none"; // important for mobile drag

  canvas.addEventListener("pointerdown", (e) => {
    const p = getCanvasPoint(e);
    const text = (textInput?.value || "").trim();

    // Check badge hit first (so badge wins if overlapping)
    if (badgeImg) {
      const badgeRect = { x: badgePos.x, y: badgePos.y, w: BADGE_DRAW_W, h: BADGE_DRAW_H };
      if (pointInRect(p.x, p.y, badgeRect)) {
        dragging.active = true;
        dragging.target = "badge";
        dragging.offsetX = p.x - badgePos.x;
        dragging.offsetY = p.y - badgePos.y;
        canvas.setPointerCapture(e.pointerId);
        update();
        return;
      }
    }

    // Check text hit
    if (text && lastTextBox && pointInRect(p.x, p.y, lastTextBox)) {
      dragging.active = true;
      dragging.target = "text";
      dragging.offsetX = p.x - textPos.x;
      dragging.offsetY = p.y - textPos.y;
      canvas.setPointerCapture(e.pointerId);
      update();
      return;
    }

    dragging.active = false;
    dragging.target = null;
    update();
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging.active) return;

    const p = getCanvasPoint(e);

    if (dragging.target === "badge") {
      badgePos.x = clamp(p.x - dragging.offsetX, 0, canvas.width - BADGE_DRAW_W);
      badgePos.y = clamp(p.y - dragging.offsetY, 0, canvas.height - BADGE_DRAW_H);
      update();
    }

    if (dragging.target === "text") {
      // keep text inside canvas area (roughly)
      textPos.x = clamp(p.x - dragging.offsetX, 0, canvas.width);
      textPos.y = clamp(p.y - dragging.offsetY, 64, canvas.height); // y>=font height
      update();
    }
  });

  function stopDrag() {
    dragging.active = false;
    dragging.target = null;
    update();
  }

  canvas.addEventListener("pointerup", stopDrag);
  canvas.addEventListener("pointercancel", stopDrag);
  canvas.addEventListener("pointerleave", () => {
    // optional: stop when leaving canvas
    if (dragging.active) stopDrag();
  });

  // No addToCart click handler here anymore.
  // customPostOrder.js will handle it.
})();
