document.addEventListener("DOMContentLoaded", () => {
    const aiBtn = document.getElementById("aiMerchHelpBtn");
    const aiBox = document.getElementById("aiMerchChatBox");
    const aiClose = document.getElementById("aiMerchCloseBtn");
    const sendBtn = document.getElementById("aiMerchSendBtn");
    const input = document.getElementById("aiMerchQuestion");
    const messages = document.getElementById("aiMerchChatMessages");

    // Open/close chat
    aiBtn.addEventListener("click", () => {
        aiBox.style.display = aiBox.style.display === "flex" ? "none" : "flex";
    });

    aiClose.addEventListener("click", () => {
        aiBox.style.display = "none";
    });

    function getMerchandiseOnPage() {
        if (allMerch && allMerch.length > 0) {
            // Get names with prices
            const merchWithPrices = allMerch.map(item => {
                // Check if it's a limited deal
                const deal = getLimitedDeal(item.merchId);
                const price = deal ? deal.newPrice : item.price;
                return `${item.name} (S$${price})`;
            });
            console.log("Merch names with prices:", merchWithPrices);
            return merchWithPrices;
        }
        
        // incase cant get from allMerch
        const merchCards = document.querySelectorAll(".merch-card");
        if (merchCards.length > 0) {
            const merchWithPrices = Array.from(merchCards).map(card => {
                const name = card.querySelector("h6.card-title")?.textContent.trim() || "";
                // Get price from the price-text span
                const priceSpan = card.querySelector(".price-text");
                let price = "";
                
                if (priceSpan) {
                    // Extract just the number from price text (removes "S$" if present)
                    price = priceSpan.textContent.replace("S$", "").trim();
                }
                
                return `${name} (S$${price})`;
            });
            return merchWithPrices;
        }
        
        console.log("No merch data available yet");
        return [];
    }

    // Send question to backend AI route
    async function sendQuestion() {
        const question = input.value.trim();
        if (!question) return;

        // Display user's message
        const userMsg = document.createElement("div");
        userMsg.className = "message userMessage";
        userMsg.textContent = question;
        messages.appendChild(userMsg);
        messages.scrollTop = messages.scrollHeight;
        input.value = "";

        try {
            const res = await fetch("/api/ai/merchHelp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: question,
                    merch: getMerchandiseOnPage()
                })
            });

            const data = await res.json();

            // Display bot's reply
            const botMsg = document.createElement("div");
            botMsg.className = "message botMessage";
            botMsg.textContent = data.answer || "Sorry, I couldn't generate an answer.";
            messages.appendChild(botMsg);
            messages.scrollTop = messages.scrollHeight;

        } catch (err) {
            console.error(err);
            const errorMsg = document.createElement("div");
            errorMsg.className = "message botMessage";
            errorMsg.textContent = "Error connecting to AI assistant.";
            messages.appendChild(errorMsg);
            messages.scrollTop = messages.scrollHeight;
        }
    }

    sendBtn.addEventListener("click", sendQuestion);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") sendQuestion();
    });

    const clearBtn = document.getElementById("aiMerchClearBtn");
    const messagesChat = document.getElementById("aiMerchChatMessages");

    clearBtn.addEventListener("click", () => {
        messagesChat.innerHTML = "";
    });
});