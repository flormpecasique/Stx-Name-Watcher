document.getElementById("searchButton").addEventListener("click", async () => {
    const name = document.getElementById("searchInput").value.trim();
    if (!name) return;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<p class="text-gray-400">Searching...</p>`;

    try {
        const response = await fetch(`https://api.hiro.so/bns/v1/names/${name}.btc`);
        const data = await response.json();

        if (data.error) {
            resultDiv.innerHTML = `<p class="text-green-400">✅ <strong>${name}.btc</strong> is available!</p>`;
        } else {
            resultDiv.innerHTML = `
                <p class="text-red-400">❌ <strong>${name}.btc</strong> is taken</p>
                <p class="text-gray-300">Owned by: <span class="font-mono">${data.address}</span></p>
            `;
        }
    } catch (error) {
        resultDiv.innerHTML = `<p class="text-red-500">Error fetching data. Try again later.</p>`;
    }
});

