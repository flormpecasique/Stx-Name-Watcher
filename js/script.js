document.getElementById("searchButton").addEventListener("click", async () => {
    const name = document.getElementById("searchInput").value.trim();
    if (!name) return;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<p class="text-gray-400">🔍 Searching...</p>`;

    try {
        const response = await fetch(`https://api.bns.xyz/v1/${encodeURIComponent(name)}.btc`);
        
        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "available") {
            resultDiv.innerHTML = `<p class="text-green-400">✅ <strong>${name}.btc</strong> is available!</p>`;
        } else if (data.owner) {
            resultDiv.innerHTML = `
                <p class="text-red-400">❌ <strong>${name}.btc</strong> is taken</p>
                <p class="text-gray-300">Owned by: <span class="font-mono">${data.owner}</span></p>
            `;
        } else {
            resultDiv.innerHTML = `<p class="text-yellow-400">⚠️ Unexpected response. Try again later.</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        resultDiv.innerHTML = `<p class="text-red-500">⚠️ Error: Unable to fetch data. Try a different name.</p>`;
    }
});
