document.addEventListener("DOMContentLoaded", async () => {
    const GET_CHECKOUT_URL = 'http://localhost:3001/api/checkout/';
    // Decode token inside the handler
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

    // retreive spinner discount if have
    const rewardSpinnerDiscount = localStorage.getItem("spinDiscount");
    console.log(rewardSpinnerDiscount);

    try {
        const res = await fetch(GET_CHECKOUT_URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id: decodedToken.userId })
        });

        if (!res.ok) {
            console.error('Failed to fetch orders, status =', res.status);
            return [];
        }

        const data = await res.json();
        // console.log(data.data)
        const container = document.getElementById('checkoutOrderContainer');
        let subtotal = 0;

        data.data.forEach(item => {
            const itemTotal = item.subtotal;
            subtotal += itemTotal;

            const div = document.createElement('div');
            div.className = 'order-item d-flex justify-content-between';
            div.innerHTML = `
            <span>${item.name} x ${item.quantity}</span>
            <span>$${itemTotal.toFixed(2)}</span>
        `;
            container.appendChild(div);
        });

        const shipping = 5;
        let totalCost = subtotal + shipping;
        let CostDiscounted = totalCost * rewardSpinnerDiscount;
        document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('shippingAmount').textContent = `$${shipping.toFixed(2)}`;
        document.getElementById('sinnerDiscount').textContent = `$${CostDiscounted.toFixed(2)}`;
        document.getElementById('totalAmount').textContent = `$${(totalCost - CostDiscounted).toFixed(2)}`;
    } catch (err) {
        console.error('Error in getOrders:', err);
        return [];
    }
});

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
