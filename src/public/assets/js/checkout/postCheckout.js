document.addEventListener("DOMContentLoaded", () => {
    const POST_CHECKOUT_URL = "http://localhost:3001/api/checkout/postCheckout";

    const form = document.getElementById("checkoutForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // stop page reload

        // Collect card data
        const cardNum = form.cardNumber.value;
        const expirationDate = form.expiry.value;
        const CVV = form.cvv.value;
        const cardNumValid = isValidCardNumber(cardNum);
        const expirationDateValid = isValidExpiry(expirationDate);
        const CVVValid = isValidCVV(CVV);
        const spinnerDiscount = localStorage.getItem("spinDiscount");

        if (cardNumValid && expirationDateValid && CVVValid) {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("User not authenticated");
                return;
            }

            const decoded = decodeToken(token);
            if (!decoded || !decoded.userId) {
                alert("Invalid token");
                return;
            }

            // Collect form data
            const formData = {
                user_id: decoded.userId,
                spinnerDiscount: spinnerDiscount
            };

            try {
                const res = await fetch(POST_CHECKOUT_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData)
                });

                if (!res.ok) {
                    const errData = await res.json();
                    console.error("Checkout failed:", errData);
                    alert("Checkout failed");
                    return;
                }

                const data = await res.json();
                console.log("Checkout successful:", data);
                alert("Order placed successfully!");

                // redirect to thank you page
                window.location.href = `thankYou.html?qr=${encodeURIComponent(data.qr)}`;

            } catch (err) {
                console.error("Checkout error:", err);
            }
        } else {
            // send error message
            const message = document.getElementById("message");

            message.textContent = "Card Number, Expiry Date or CVV is Wrong";
            message.style.color = "red";
        }
    });
});

// token decode function
function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decoded);
    } catch (err) {
        console.error("Invalid token", err);
        return null;
    }
}

function isValidCardNumber(number) {
    // How Luhn Alogrithm works
    // Start from the right-most digit (the check digit).
    // Moving left, every second digit is doubled.
    // If doubling produces a number > 9, subtract 9.
    // Add all digits.
    // If the sum % 10 == 0 → card number is valid.

    // Remove spaces or dashes
    number = number.replace(/\D/g, '');
    console.log(number)

    // Reject empty or too short inputs
    if (number.length < 13 || number.length > 19) {
        return false;
    }

    let sum = 0;
    let shouldDouble = false;

    // Loop from right to left
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function isValidCVV(cvv, cardNumber) {
    // Remove non-digits
    cvv = cvv.replace(/\D/g, '');
    console.log(cvv)
    if (cvv.length < 3 || cvv.length > 5) {
        console.log(false);
        return false;
    }

    // Detect card type
    const isAmex = /^3[47]/.test(cardNumber); // Amex starts with 34 or 37

    if (isAmex) {
        return /^\d{4}$/.test(cvv);  // Amex → 4 digits
    } else {
        return /^\d{3}$/.test(cvv);  // Others → 3 digits
    }
}

function isValidExpiry(expiry) {
    // Format: MM/YY
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        return false;
    }
    console.log(expiry)

    // splits the inpt along /
    const [monthStr, yearStr] = expiry.split("/");
    const month = parseInt(monthStr, 10);
    const year = parseInt("20" + yearStr, 10);

    if (month < 1 || month > 12) return false;

    // Today's date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0–11
    const currentYear = now.getFullYear();

    // Card expired?
    if (year < currentYear) {
        return false;
    }
    if (year === currentYear && month < currentMonth) {
        return false;
    }

    return true;
}