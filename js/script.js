document.getElementById("lookup-form").addEventListener("submit", async function (event) {
    event.preventDefault();
    
    const inputField = document.getElementById("name-input");
    const name = inputField.value.trim();
    const resultContainer = document.getElementById("result");

    if (!name) {
        resultContainer.innerHTML = "<p class='error'>⚠️ Please enter a name.</p>";
        return;
    }

    resultContainer.innerHTML = "<p>⏳ Searching...</p>";

    try {
        const response = await fetch(`https://stx-name-watcher.vercel.app/api/hiro-proxy?name=${encodeURIComponent(name)}`);

        if (!response.ok) {
            throw new Error(`HTTP Error ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Para depuración

        if (data.error) {
            throw new Error(data.error);
        }

        // Muestra la información obtenida
        resultContainer.innerHTML = `
            <p><strong>Name:</strong> ${data.name || "N/A"}</p>
            <p><strong>Owner Address:</strong> ${data.owner || "N/A"}</p>
            <p><strong>Expires At:</strong> ${data.expiresAt || "N/A"}</p>
        `;
    } catch (error) {
        resultContainer.innerHTML = `<p class='error'>⚠️ Error: ${error.message}</p>`;
    }
});
