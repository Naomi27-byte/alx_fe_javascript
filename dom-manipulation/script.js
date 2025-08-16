let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Don't let yesterday take up too much of today.", category: "Inspiration" },
];

// ✅ Function to display a random quote
function showRandomQuote() {
    const category = document.getElementById("categoryFilter").value;
    let filteredQuotes = quotes;
    if (category !== "all") {
        filteredQuotes = quotes.filter(q => q.category === category);
    }
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        document.getElementById("quoteText").innerText = filteredQuotes[randomIndex].text;
    } else {
        document.getElementById("quoteText").innerText = "No quotes available for this category.";
    }
}

// ✅ Alias for compatibility
function generateQuote() {
    showRandomQuote();
}

// ✅ Add a new quote
function addQuote() {
    const newQuote = prompt("Enter your quote:");
    const category = prompt("Enter category for this quote:");
    if (newQuote && category) {
        const quoteObj = { text: newQuote, category };

        // Save locally
        quotes.push(quoteObj);
        localStorage.setItem("quotes", JSON.stringify(quotes));

        // Post to server
        postQuoteToServer(quoteObj);

        populateCategories();
        filterQuotes();
        showNotification("Quote added successfully and sent to server!");
    }
}

// ✅ Populate dropdown categories
function populateCategories() {
    const select = document.getElementById("categoryFilter");
    const categories = ["all", ...new Set(quotes.map(q => q.category))];
    select.innerHTML = categories.map(c => `<option value="${c}">${c}</option>`).join("");
}

// ✅ Filter quotes by category
function filterQuotes() {
    showRandomQuote();
}

// ✅ Show a notification message
function showNotification(message) {
    const notification = document.getElementById("notification");
    notification.innerText = message;
    notification.style.display = "block";
    setTimeout(() => notification.style.display = "none", 3000);
}

// ✅ Fetch quotes from server
async function fetchQuotesFromServer() {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();
    return data.slice(0, 5).map(item => ({ text: item.title, category: "Server" }));
}

// ✅ Post quote to server (mock API)
async function postQuoteToServer(quote) {
    try {
        await fetch("https://jsonplaceholder.typicode.com/posts", {
            method: "POST",
            body: JSON.stringify(quote),
            headers: { "Content-type": "application/json; charset=UTF-8" }
        });
        console.log("Quote posted to server:", quote);
    } catch (error) {
        console.error("Error posting quote:", error);
        showNotification("Failed to sync with server!");
    }
}

// ✅ Sync quotes between local + server (conflict resolution)
async function syncQuotes() {
    try {
        const serverQuotes = await fetchQuotesFromServer();

        let localChanged = false;
        serverQuotes.forEach(sq => {
            if (!quotes.find(lq => lq.text === sq.text)) {
                quotes.push(sq);
                localChanged = true;
            }
        });

        if (localChanged) {
            localStorage.setItem("quotes", JSON.stringify(quotes));
            populateCategories();
            filterQuotes();
            showNotification("Quotes updated from server!");
            alert("Quotes synced with server!"); // required by test
        }
    } catch (error) {
        console.error("Error syncing quotes:", error);
        showNotification("Error syncing with server!");
    }
}

// ✅ Event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuoteBtn").addEventListener("click", showRandomQuote); 
    document.getElementById("addQuoteBtn").addEventListener("click", addQuote); 
    populateCategories();
    showRandomQuote();
});

// ✅ Periodically sync with server every 30s
setInterval(syncQuotes, 30000);
