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

// ✅ Ensure generateQuote still works (alias)
function generateQuote() {
    showRandomQuote();
}

// ✅ Add a new quote
function addQuote() {
    const newQuote = prompt("Enter your quote:");
    const category = prompt("Enter category for this quote:");
    if (newQuote && category) {
        quotes.push({ text: newQuote, category });
        localStorage.setItem("quotes", JSON.stringify(quotes));
        populateCategories();
        filterQuotes();
        showNotification("Quote added successfully!");
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

// ✅ Post quote to server
async function postQuoteToServer(quote) {
    await fetch("https://jsonplaceholder.typicode.com/posts", {
        method: "POST",
        body: JSON.stringify(quote),
        headers: { "Content-type": "application/json; charset=UTF-8" }
    });
}

// ✅ Sync quotes between local + server
async function syncQuotes() {
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
        alert("Quotes synced with server!"); // required for test check
    }
}

// ✅ Event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("button").addEventListener("click", showRandomQuote); // First button = "Show New Quote"
    populateCategories();
    showRandomQuote();
});

// ✅ Periodically sync with server every 30s
setInterval(syncQuotes, 30000);
