// ================== QUOTE GENERATOR WITH SERVER SYNC ==================

const API_URL = "https://jsonplaceholder.typicode.com/posts";

let quotes = JSON.parse(localStorage.getItem("quotes")) || [
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "The purpose of our lives is to be happy.", category: "Happiness" },
    { text: "Get busy living or get busy dying.", category: "Motivation" }
];

const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const notificationArea = document.getElementById("notification");
const importFileInput = document.getElementById("importFile");

// ✅ Fetch quotes from server
async function fetchQuotesFromServer() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        return data.slice(0, 5).map(item => ({
            text: item.title,
            category: "Server"
        }));
    } catch (error) {
        console.error("Error fetching from server:", error);
        return [];
    }
}

// ✅ Post quote to server
async function postQuoteToServer(quote) {
    try {
        await fetch(API_URL, {
            method: "POST",
            body: JSON.stringify(quote),
            headers: { "Content-Type": "application/json" }
        });
        console.log("Quote posted to server:", quote);
    } catch (error) {
        console.error("Error posting to server:", error);
    }
}

// ✅ Sync quotes with server
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
        alert("Quotes Synced with server!");
    }
}
setInterval(syncQuotes, 30000);

// ✅ Show notification
function showNotification(message) {
    notificationArea.textContent = message;
    notificationArea.style.display = "block";
    setTimeout(() => {
        notificationArea.style.display = "none";
    }, 3000);
}

// ✅ Populate categories (with appendChild)
function populateCategories() {
    const categories = ["all", ...new Set(quotes.map(q => q.category))];
    categoryFilter.innerHTML = "";

    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });

    const savedFilter = localStorage.getItem("selectedCategory");
    if (savedFilter && categories.includes(savedFilter)) {
        categoryFilter.value = savedFilter;
    }
}

// ✅ Filter quotes by category
function filterQuotes() {
    const selectedCategory = categoryFilter.value;
    localStorage.setItem("selectedCategory", selectedCategory);

    let filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    displayQuotes(filteredQuotes);
}

// ✅ Display quotes and save last viewed to sessionStorage
function displayQuotes(list) {
    if (!list.length) {
        quoteDisplay.innerHTML = "<p>No quotes available.</p>";
        return;
    }
    quoteDisplay.innerHTML = list
        .map(q => `<p><strong>${q.category}:</strong> ${q.text}</p>`)
        .join("");

    // Save last viewed quote to sessionStorage
    sessionStorage.setItem("lastViewedQuote", JSON.stringify(list[0]));
}

// ✅ Show random quote
function showRandomQuote() {
    const selectedCategory = categoryFilter.value;
    let filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        displayQuotes([filteredQuotes[randomIndex]]);
    } else {
        showNotification("No quotes available for this category.");
    }
}

// ✅ Add quote
function addQuote(text, category) {
    const newQuote = { text, category };
    quotes.push(newQuote);
    localStorage.setItem("quotes", JSON.stringify(quotes));

    postQuoteToServer(newQuote);
    populateCategories();
    filterQuotes();
}

// ✅ Create Add Quote form
function createAddQuoteForm() {
    const container = document.getElementById("addQuoteContainer");
    container.innerHTML = `
        <input type="text" id="newQuoteText" placeholder="Enter a new quote" />
        <input type="text" id="newQuoteCategory" placeholder="Enter category" />
        <button id="addQuoteBtn">Add Quote</button>
    `;

    document.getElementById("addQuoteBtn").addEventListener("click", () => {
        const text = document.getElementById("newQuoteText").value.trim();
        const category = document.getElementById("newQuoteCategory").value.trim();
        if (text && category) {
            addQuote(text, category);
            document.getElementById("newQuoteText").value = "";
            document.getElementById("newQuoteCategory").value = "";
        } else {
            showNotification("Please enter both a quote and a category.");
        }
    });
}

// ✅ Export quotes to JSON
function exportToJsonFile() {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
}

// ✅ Import quotes from JSON file
function importFromJsonFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedQuotes = JSON.parse(e.target.result);
            if (Array.isArray(importedQuotes)) {
                importedQuotes.forEach(q => {
                    if (!quotes.find(lq => lq.text === q.text)) {
                        quotes.push(q);
                    }
                });
                localStorage.setItem("quotes", JSON.stringify(quotes));
                populateCategories();
                filterQuotes();
                showNotification("Quotes imported successfully!");
            }
        } catch (err) {
            showNotification("Error importing quotes file.");
            console.error("Import error:", err);
        }
    };
    reader.readAsText(file);
}

// ✅ Event listeners
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("newQuote").addEventListener("click", showRandomQuote);
    document.getElementById("exportBtn").addEventListener("click", exportToJsonFile);
    importFileInput.addEventListener("change", importFromJsonFile);

    populateCategories();
    filterQuotes();
    createAddQuoteForm();
});
