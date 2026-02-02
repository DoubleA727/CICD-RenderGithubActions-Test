// assets/js/orders/getOrder.js

// Adjust path if your route is different
const GET_ORDERS_URL = '/api/order';

async function getOrders() {
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

    try {
        const res = await fetch(GET_ORDERS_URL, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: decodedToken.userId })
        });

        if (!res.ok) {
            console.error('Failed to fetch orders, status =', res.status);
            return [];
        }

        const data = await res.json();
        // Your API returns: { message: "...", result: { rows: [...] } }
        const rows = data?.result?.rows || [];
        return rows;
    } catch (err) {
        console.error('Error in getOrders:', err);
        return [];
    }
}

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