// Delete an order item
// Backend route: DELETE /api/order/:order_id
const DELETE_ORDER_URL = (orderItemId) => `/api/order/${orderItemId}`;

async function deleteOrder(orderItemId) {
    try {
        const res = await fetch(DELETE_ORDER_URL(orderItemId), {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!res.ok) {
            let msg = 'Unable to delete order item.';
            try {
                const data = await res.json();
                if (data && data.message) {
                    msg = data.message;
                }
            } catch (e) {
                // ignore JSON parse error, fall back to default msg
            }

            console.error('Delete failed with status', res.status, msg);
            alert(msg);
            return false;               // ❗ important: signal failure
        }

        // Success
        return true;                    // ❗ important: signal success
    } catch (err) {
        console.error('Error in deleteOrder:', err);
        alert('Unable to delete order item.');
        return false;
    }
}
