// Update an order item's quantity
// Adjust UPDATE_ORDER_URL to match your backend route if needed.
const UPDATE_ORDER_URL = (orderItemId) => `/api/order/${orderItemId}`;

async function updateOrder(orderItemId, newQuantity) {
    try {
        const res = await fetch(UPDATE_ORDER_URL(orderItemId), {
            method: 'PUT',          // or 'PATCH' or 'POST' depending on your API
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include', // include cookies / auth if you use them
            body: JSON.stringify({
                quantity: newQuantity
            })
        });

        if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(err.message || "Unable to update order item.");
    return false;
}


        return true;
    } catch (err) {
        console.error(err);
        alert('Unable to update order item.');
        return false;
    }
}
