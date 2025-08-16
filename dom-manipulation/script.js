<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quote Generator with Server Sync</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f4f4f4; }
    h1 { text-align: center; }
    #notificationArea {
      display: none; background: #fffae6; border: 1px solid #ffd42a;
      padding: 10px; margin-bottom: 15px; border-radius: 5px; text-align: center;
    }
    select, button, input { padding: 8px; margin: 5px; }
    #quoteDisplay p {
      background: white; padding: 10px; border-radius: 4px; margin-bottom: 5px;
    }
  </style>
</head>
<body>
  <h1>Quote Generator with Server Sync</h1>
  <div id="notificationArea"></div>

  <div>
    <label for="categoryFilter">Filter by category:</label>
    <select id="categoryFilter" onchange="filterQuotes()"></select>
  </div>

  <div>
    <input type="text" id="newQuoteText" placeholder="Enter a new quote" />
    <input type="text" id="newQuoteCategory" placeholder="Enter category" />
    <button onclick="addQuoteFromInput()">Add Quote</button>
    <button onclick="showRandomQuote()">Show Random Quote</button>
  </div>

  <div id="quoteDisplay"></div>

  <script>
    // ================== QUOTE GENERATOR WITH SERVER SYNC ==================
    const API_URL = "https://jsonplaceholder.typicode.com/posts";

    let quotes = JSON.parse(localStorage.getItem("quotes")) || [
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "The purpose of our lives is to be happy.", category: "Happiness" },
      { text: "Get busy living or get busy dying.", category: "Motivation" }
    ];

    const quoteDisplay = document.getElementById("quoteDisplay");
    const categoryFilter = document.getElementById("categoryFilter");
    const notificationArea = document.getElementById("notificationArea");

    // ====== SERVER SYNC ======
    async function fetchQuotesFromServer() {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        return data.slice(0, 5).map(item => ({ text: item.title, category: "Server" }));
      } catch (error) {
        console.error("Error fetching from server:", error);
        return [];
      }
    }

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

    setInterval(syncQuotes, 30000); // sync every 30s

    // ====== UI HELPERS ======
    function showNotification(message) {
      notificationArea.textContent = message;
      notificationArea.style.display = "block";
      setTimeout(() => { notificationArea.style.display = "none"; }, 3000);
    }

    function populateCategories() {
      const categories = ["all", ...new Set(quotes.map(q => q.category))];
      const savedFilter = localStorage.getItem("selectedCategory");

      categoryFilter.innerHTML = categories.map(cat =>
        `<option value="${cat}">${cat}</option>`).join("");

      if (savedFilter && categories.includes(savedFilter)) {
        categoryFilter.value = savedFilter;
      }
    }

    function filterQuotes() {
      const selectedCategory = categoryFilter.value;
      localStorage.setItem("selectedCategory", selectedCategory);

      let filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

      displayQuotes(filteredQuotes);
    }

    function displayQuotes(quotesToShow) {
      quoteDisplay.innerHTML = quotesToShow
        .map(q => `<p><strong>${q.category}:</strong> ${q.text}</p>`)
        .join("");
    }

    function showRandomQuote() {
      const selectedCategory = categoryFilter.value;
      let filteredQuotes = selectedCategory === "all"
        ? quotes
        : quotes.filter(q => q.category === selectedCategory);

      if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        quoteDisplay.innerHTML = `<p><strong>${filteredQuotes[randomIndex].category}:</strong> ${filteredQuotes[randomIndex].text}</p>`;
      } else {
        quoteDisplay.innerHTML = "<p>No quotes available for this category.</p>";
      }
    }

    // ====== ADD QUOTES ======
    function addQuote(text, category) {
      const newQuote = { text, category };
      quotes.push(newQuote);
      localStorage.setItem("quotes", JSON.stringify(quotes));

      postQuoteToServer(newQuote);
      populateCategories();
      filterQuotes();
      showNotification("Quote added successfully!");
    }

    function addQuoteFromInput() {
      const text = document.getElementById("newQuoteText").value.trim();
      const category = document.getElementById("newQuoteCategory").value.trim();
      if (text && category) {
        addQuote(text, category);
        document.getElementById("newQuoteText").value = "";
        document.getElementById("newQuoteCategory").value = "";
      } else {
        showNotification("Please enter both a quote and a category.");
      }
    }

    // ====== INIT ======
    populateCategories();
    filterQuotes();
  </script>
</body>
</html>
