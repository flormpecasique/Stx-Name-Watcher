document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("searchInput");
    const searchButton = document.getElementById("searchButton");
    const resultDiv = document.getElementById("result");

    async function fetchBNSData(name) {
        try {
            resultDiv.innerHTML = `<p class="text-gray-400">Searching...</p>`;

            const response = await fetch(`/api/hiro-proxy?name=${encodeURIComponent(name)}`);
            const data = await response.json();

            if (response.ok) {
                resultDiv.innerHTML = `
                    <p class="text-green-400 text-lg font-semibold">Domain: ${name}</p>
                    <p class="text-gray-300">Owner Address: ${data.address || "Not found"}</p>
                    <p class="text-gray-300">Blockchain: ${data.blockchain || "Not found"}</p>
                    <p class="text-gray-300">Last Transaction ID: ${data.last_txid || "Not found"}</p>
                    <p class="text-gray-300">Zonefile Hash: ${data.zonefile_hash || "Not found"}</p>
                    <p class="text-gray-300">Zonefile: <a href="${data.zonefile || "#"}" class="text-blue-500" target="_blank">View Zonefile</a></p>
                `;
            } else {
                throw new Error(data.error || "Unknown error");
            }
        } catch (error) {
            resultDiv.innerHTML = `<p class="text-red-400">⚠️ Error: ${error.message}</p>`;
        }
    }

    searchButton.addEventListener("click", function () {
        const name = searchInput.value.trim();
        if (name) {
            fetchBNSData(name);
        } else {
            resultDiv.innerHTML = `<p class="text-red-400">⚠️ Please enter a .btc name</p>`;
        }
    });

    searchInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });
});
