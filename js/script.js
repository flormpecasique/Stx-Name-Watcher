document.getElementById("searchButton").addEventListener("click", async () => {
    const name = document.getElementById("searchInput").value.trim();
    if (!name) return;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<p class="text-gray-400">🔍 Searching...</p>`;

    try {
        const response = await fetch(`https://api.hiro.so/bns/v1/names/${encodeURIComponent(name)}`, {
            method: 'GET',
            headers: {
                'x-api-key': '12e037e5ffa36bafd45ff6b56424df8e', // Aquí va tu API key
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();

        // Revisamos si el dominio tiene una dirección asociada (es decir, si está tomado)
        if (data.address) {
            resultDiv.innerHTML = `
                <p class="text-red-400">❌ <strong>${name}</strong> is already taken</p>
                <p class="text-gray-300">Owned by: <span class="font-mono">${data.address}</span></p>
            `;
        } else {
            resultDiv.innerHTML = `<p class="text-green-400">✅ <strong>${name}</strong> is available!</p>`;
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        resultDiv.innerHTML = `<p class="text-red-500">⚠️ Error: Unable to fetch data. Try a different name.</p>`;
    }
});
