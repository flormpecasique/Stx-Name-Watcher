document.getElementById("searchButton").addEventListener("click", function() {
    const nameInput = document.getElementById("searchInput").value.trim();

    if (nameInput === "") {
        showResult("Please enter a .btc name.", "error");
        return;
    }

    // Verificamos que el dominio tenga el formato correcto
    const domainPattern = /^[a-zA-Z0-9-]+\.btc$/;
    if (!domainPattern.test(nameInput)) {
        showResult("Please enter a valid .btc name (e.g., flor.btc).", "error");
        return;
    }

    fetch(`/api/hiro-proxy?name=${encodeURIComponent(nameInput)}`)
        .then(response => response.json())
        .then(data => {
            if (data.address) {
                // Si encontramos la dirección, mostramos los resultados
                showResult(`
                    <p class="text-green-400">Domain: ${nameInput}</p>
                    <p class="text-gray-300">Address: ${data.address}</p>
                    <p class="text-gray-300">Zonefile Hash: ${data.zonefile_hash}</p>
                    <p class="text-gray-300">Expiration Block: ${data.expire_block}</p>
                    <a href="https://explorer.stacks.co/address/${data.address}" target="_blank" class="text-blue-400">View on Stacks Explorer</a>
                `);
            } else {
                showResult("No data found for this domain.", "error");
            }
        })
        .catch(error => {
            console.error(error);
            showResult("Error fetching data. Try again later.", "error");
        });
});

// Función para mostrar los resultados en la UI
function showResult(message, type = "success") {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = message;
    resultDiv.classList.remove("text-gray-300", "text-red-400", "text-green-400");
    resultDiv.classList.add(type === "error" ? "text-red-400" : "text-green-400");
}
