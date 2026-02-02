// leaderboard.js - Leaderboard functionality

document.addEventListener("DOMContentLoaded", function () {
    // Set current date
    const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
    document.getElementById("current-date").textContent = currentDate;
    
    // Tab switching logic
    const tabButtons = document.querySelectorAll(".tab-button");
    const tabContents = document.querySelectorAll(".tab-content");
    
    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const tabId = button.getAttribute("data-tab");
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            
            // Show active tab content
            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.id === tabId) {
                    content.classList.add("active");
                    loadTabData(tabId);
                }
            });
        });
    });
    
    // Load data for initially active tab
    loadTabData("top-spenders");
    
    // Function to load data for a specific tab
    function loadTabData(tabId) {
        switch(tabId) {
            case "top-spenders":
                fetchTopSpenders();
                break;
            case "top-merchandise":
                fetchTopMerchandise();
                break;
            case "top-collectors":
                fetchTopCollectors();
                break;
        }
    }
    
    // Fetch top spenders data
    function fetchTopSpenders() {
        const podiumContainer = document.getElementById("spenders-podium");
        const listContainer = document.getElementById("spenders-list");
        
        fetch(currentUrl + "/api/leaderboard/TopSpenders", {
            method: "GET"
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            console.log("TOP SPENDA DATA: ", result);
            
            if (!result.rows || result.rows.length === 0) {
                podiumContainer.innerHTML = '<div class="no-data">No data available</div>';
                listContainer.innerHTML = '<div class="no-data">No data available</div>';
                return;
            }
            
            // Clear containers
            podiumContainer.innerHTML = "";
            listContainer.innerHTML = "";
            
            // Sort by total spent  inscae smth happendsa
            const sortedData = [...result.rows].sort((a, b) => b.totalspent - a.totalspent);
            
            // Create podium for top 3
            const podiumPositions = [
                { position: 2, className: "second-place" },
                { position: 1, className: "first-place" },
                { position: 3, className: "third-place" }
            ];
            
            podiumPositions.forEach(podium => {
                //get user at that position
                if (sortedData[podium.position - 1]) {
                    const user = sortedData[podium.position - 1];
                    const podiumItem = createSpenderPodiumItem(user, podium.position, podium.className);
                    podiumContainer.appendChild(podiumItem);
                }
            });
            
            // Create list for remaining users (starting from 4th place)
            for (let i = 3; i < sortedData.length; i++) {
                const user = sortedData[i];
                const listItem = createSpenderListItem(user, i + 1);
                listContainer.appendChild(listItem);
            }
            
            // If no remaining users, show message
            if (sortedData.length <= 3) {
                const noMoreItem = document.createElement("div");
                noMoreItem.className = "no-data";
                noMoreItem.textContent = "No more users to display";
                listContainer.appendChild(noMoreItem);
            }
        })
        .catch(function(error) {
            console.error("Error fetching top spenders:", error);
            podiumContainer.innerHTML = '<div class="error">Error loading data. Please try again later.</div>';
            listContainer.innerHTML = "";
        });
    }
    
    // Fetch top merchandise data
    function fetchTopMerchandise() {
        const podiumContainer = document.getElementById("merch-podium");
        const listContainer = document.getElementById("merch-list");
        
        fetch(currentUrl + "/api/leaderboard/TopMerchandise", {
            method: "GET"
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            console.log("Top Merchandise Data: ", result);
            
            if (!result.rows || result.rows.length === 0) {
                podiumContainer.innerHTML = '<div class="no-data">No data available</div>';
                listContainer.innerHTML = '<div class="no-data">No data available</div>';
                return;
            }
            
            // Clear containers
            podiumContainer.innerHTML = "";
            listContainer.innerHTML = "";
            
            // Sort by total bought (descending)
            const sortedData = [...result.rows].sort((a, b) => b.totalbought - a.totalbought);
            
            // Create podium for top 3
            const podiumPositions = [
                { position: 2, className: "second-place" },
                { position: 1, className: "first-place" },
                { position: 3, className: "third-place" }
            ];
            
            podiumPositions.forEach(podium => {
                if (sortedData[podium.position - 1]) {
                    const merch = sortedData[podium.position - 1];
                    const podiumItem = createMerchandisePodiumItem(merch, podium.position, podium.className);
                    podiumContainer.appendChild(podiumItem);
                }
            });
            
            // Create list for remaining merchandise (starting from 4th place)
            for (let i = 3; i < sortedData.length; i++) {
                const merch = sortedData[i];
                const listItem = createMerchandiseListItem(merch, i + 1);
                listContainer.appendChild(listItem);
            }
            
            // If no remaining merchandise, show message
            if (sortedData.length <= 3) {
                const noMoreItem = document.createElement("div");
                noMoreItem.className = "no-data";
                noMoreItem.textContent = "No more merchandise to display";
                listContainer.appendChild(noMoreItem);
            }
        })
        .catch(function(error) {
            console.error("Error fetching top merchandise:", error);
            podiumContainer.innerHTML = '<div class="error">Error loading data. Please try again later.</div>';
            listContainer.innerHTML = "";
        });
    }
    
    // Fetch top collectors data
    function fetchTopCollectors() {
        const podiumContainer = document.getElementById("collectors-podium");
        const listContainer = document.getElementById("collectors-list");
        
        fetch(currentUrl + "/api/leaderboard/TopCollectedMerch", {
            method: "GET"
        })
        .then(function(response){
            return response.json();
        })
        .then(function(result){
            console.log("Top Collectors Data: ", result);
            
            if (!result.rows || result.rows.length === 0) {
                podiumContainer.innerHTML = '<div class="no-data">No data available</div>';
                listContainer.innerHTML = '<div class="no-data">No data available</div>';
                return;
            }
            
            // Clear containers
            podiumContainer.innerHTML = "";
            listContainer.innerHTML = "";
            
            // Sort by total collected (descending)
            const sortedData = [...result.rows].sort((a, b) => b.totalCollected - a.totalCollected);
            
            // Create podium for top 3
            const podiumPositions = [
                { position: 2, className: "second-place" },
                { position: 1, className: "first-place" },
                { position: 3, className: "third-place" }
            ];
            
            podiumPositions.forEach(podium => {
                if (sortedData[podium.position - 1]) {
                    const user = sortedData[podium.position - 1];
                    const podiumItem = createCollectorPodiumItem(user, podium.position, podium.className);
                    podiumContainer.appendChild(podiumItem);
                }
            });
            
            // Create list for remaining collectors (starting from 4th place)
            for (let i = 3; i < sortedData.length; i++) {
                const user = sortedData[i];
                const listItem = createCollectorListItem(user, i + 1);
                listContainer.appendChild(listItem);
            }
            
            // If no remaining collectors, show message
            if (sortedData.length <= 3) {
                const noMoreItem = document.createElement("div");
                noMoreItem.className = "no-data";
                noMoreItem.textContent = "No more collectors to display";
                listContainer.appendChild(noMoreItem);
            }
        })
        .catch(function(error) {
            console.error("Error fetching top collectors:", error);
            podiumContainer.innerHTML = '<div class="error">Error loading data. Please try again later.</div>';
            listContainer.innerHTML = "";
        });
    }
    
    // Helper function to create podium
    function createSpenderPodiumItem(user, position, className) {
        const podiumItem = document.createElement("div");
        podiumItem.className = "podium-item " + className;
        
        const fullName = user.firstName + " " + user.lastName;
        const formattedAmount = "$" + parseFloat(user.totalspent).toFixed(2);
        
        podiumItem.innerHTML = `
            <div class="podium-place">${position}</div>
            <img src="${user.imageUrl}" alt="${fullName}" class="podium-avatar" onerror="this.src='./assets/images/profile-pic.png'">
            <div class="podium-name" title="${fullName}">${fullName}</div>
            <div class="podium-amount">${formattedAmount}</div>
            <div class="podium-stand"></div>
        `;
        
        return podiumItem;
    }
    
    // for list items
    function createSpenderListItem(user, position) {
        const listItem = document.createElement("li");
        listItem.className = "leaderboard-item";
        
        const fullName = user.firstName + " " + user.lastName;
        const formattedAmount = "$" + parseFloat(user.totalspent).toFixed(2);
        
        listItem.innerHTML = `
            <div class="list-user-info">
                <div class="list-rank">${position}</div>
                <img src="${user.imageUrl}" alt="${fullName}" class="list-avatar" onerror="this.src='./assets/images/profile-pic.png'">
                <div>
                    <div class="list-name">${fullName}</div>
                    <div class="list-username">@${user.username}</div>
                </div>
            </div>
            <div class="list-amount">${formattedAmount}</div>
        `;
        
        return listItem;
    }
    
    // for merch podium
    function createMerchandisePodiumItem(merch, position, className) {
        const podiumItem = document.createElement("div");
        podiumItem.className = "podium-item " + className;
        
        // Handle image URLs
        let imageUrl = merch.imageUrl;
        if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/") && !imageUrl.startsWith("./")) {
            imageUrl = "./assets/images/" + merch.imageUrl;
        }
        
        podiumItem.innerHTML = `
            <div class="podium-place">${position}</div>
            <img src="${imageUrl}" alt="${merch.name}" class="merch-podium-image" onerror="this.src='./assets/images/profile-pic.png'">
            <div class="podium-name" title="${merch.name}">${merch.name}</div>
            <div class="podium-count">${merch.totalbought} sold</div>
            <div class="podium-stand"></div>
        `;
        
        return podiumItem;
    }
    
    // for merch list items
    function createMerchandiseListItem(merch, position) {
        const listItem = document.createElement("li");
        listItem.className = "leaderboard-item";
        
        // Handle image URLs
        let imageUrl = merch.imageUrl;
        if (!imageUrl.startsWith("http") && !imageUrl.startsWith("/") && !imageUrl.startsWith("./")) {
            imageUrl = "./assets/images/" + merch.imageUrl;
        }
        
        listItem.innerHTML = `
            <div class="list-merch-info">
                <div class="list-rank">${position}</div>
                <img src="${imageUrl}" alt="${merch.name}" class="list-merch-img" onerror="this.src='./assets/images/profile-pic.png'">
                <div>
                    <div class="list-merch-name" title="${merch.name}">${merch.name}</div>
                </div>
            </div>
            <div class="list-count">${merch.totalbought} sold</div>
        `;
        
        return listItem;
    }
    
    // for collector podium
    function createCollectorPodiumItem(user, position, className) {
        const podiumItem = document.createElement("div");
        podiumItem.className = "podium-item " + className;
        
        const fullName = user.firstName + " " + user.lastName;
        
        podiumItem.innerHTML = `
            <div class="podium-place">${position}</div>
            <img src="${user.imageUrl}" alt="${fullName}" class="podium-avatar" onerror="this.src='./assets/images/profile-pic.png'">
            <div class="podium-name" title="${fullName}">${fullName}</div>
            <div class="podium-count">${user.totalCollected} items</div>
            <div class="podium-stand"></div>
        `;
        
        return podiumItem;
    }
    
    // for collector list items
    function createCollectorListItem(user, position) {
        const listItem = document.createElement("li");
        listItem.className = "leaderboard-item";
        
        const fullName = user.firstName + " " + user.lastName;
        
        listItem.innerHTML = `
            <div class="list-user-info">
                <div class="list-rank">${position}</div>
                <img src="${user.imageUrl}" alt="${fullName}" class="list-avatar" onerror="this.src='./assets/images/profile-pic.png'">
                <div>
                    <div class="list-name">${fullName}</div>
                    <div class="list-username">@${user.username}</div>
                </div>
            </div>
            <div class="list-collected">${user.totalCollected} items</div>
        `;
        
        return listItem;
    }
});