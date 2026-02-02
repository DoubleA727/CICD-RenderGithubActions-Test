const form = document.getElementById('orderForm');

// -----------------------------
// COOKIE + LIMITED DEAL HELPERS
// -----------------------------
function getCookie(name) {
    const cookies = document.cookie.split("; ");
    for (let c of cookies) {
        const [key, val] = c.split("=");
        if (key === name) return decodeURIComponent(val);
    }
    return null;
}

let limitedDeals = [];
const limitedDealsCookie = getCookie("limitedDeals");
if (limitedDealsCookie) {
    limitedDeals = JSON.parse(limitedDealsCookie);
}

function getLimitedDeal(merchId) {
    return limitedDeals.find(d => d.merchId == merchId);
}

// -----------------------------
// FORM SUBMIT HANDLER
// -----------------------------
form.addEventListener('submit', async function (event) {
    event.preventDefault();

    // Decode token
    const token = localStorage.getItem("token");
    if (!token) {
        alert('User not authenticated');
        return;
    }

    const decodedToken = decodeToken(token);
    if (!decodedToken || !decodedToken.userId) {
        alert('Invalid token');
        return;
    }

    const userId = decodedToken.userId;

    const params = new URLSearchParams(window.location.search);
    const merchId = parseInt(params.get('merch_id'));
    const quantity = parseInt(document.querySelector('input[name="quantity"]').value);

    // -----------------------------
    // CHECK IF ITEM IS LIMITED DEAL
    // -----------------------------
    const deal = getLimitedDeal(merchId);

    // If limited deal → use discounted price; else → use normal price
    const priceOverride = deal ? Number(deal.newPrice) : null;

    console.log("User:", userId);
    console.log("Merch:", merchId);
    console.log("Qty:", quantity);
    console.log("Limited Deal Applied?:", deal ? "YES" : "NO", "Final Price:", priceOverride);

    try {
        const res = await fetch(`/api/order/postOrder`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                merchId,
                quantity,
                priceOverride   // SEND DISCOUNTED PRICE
            })
        });

        if (!res.ok) {
            throw new Error('Failed to add to order');
        }

        const result = await res.json();
        console.log(result)
        const message = document.getElementById("message");

        message.textContent = result.message;
        message.style.color = result.success ? "green" : "red";
        if (result.success === true) {
            alert('Order added successfully!');
            window.location.reload();
        }

    } catch (err) {
        console.error(err);
        alert('Error adding order');
    }
});

// Decode JWT function
function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (err) {
        console.error('Invalid token', err);
        return null;
    }
}
