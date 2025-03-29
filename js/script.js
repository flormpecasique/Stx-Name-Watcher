// Esperamos a que el documento esté completamente cargado
document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    // Agregamos un evento de clic al botón de búsqueda
    searchButton.addEventListener('click', function () {
        let name = searchInput.value.trim().toLowerCase(); // Asegura que se usa en minúsculas y elimina espacios

        if (name) {
            // Si el nombre no termina con ".btc", lo agregamos.
            if (!name.endsWith('.btc')) {
                name += '.btc';
            }

            // Llamamos a la API de Hiro con el nombre ajustado
            fetch(`https://api.hiro.so/v1/names/${name}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultContainer.innerHTML = `
                            <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                                <strong>Error:</strong> ${data.error}. Please try again later.
                            </div>`;
                    } else if (data.address) {
                        // Si el dominio está ocupado
                        // Obtener la fecha de expiración
                        const registrationBlock = data.registration_block_height;
                        const blocksPerDay = 144; // Aproximadamente 144 bloques por día en Stacks
                        const daysPerYear = 365;
                        const expirationBlock = registrationBlock + (5 * daysPerYear * blocksPerDay);
                        const currentBlock = data.expire_block; // Bloque actual
                        const blocksRemaining = expirationBlock - currentBlock;
                        const daysRemaining = blocksRemaining / blocksPerDay;
                        const expirationDate = new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000);

                        resultContainer.innerHTML = `
                            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                <strong>Domain:</strong> ${name}<br>
                                <strong>Address:</strong> ${data.address}<br>
                                <strong>Status:</strong> Occupied<br>
                                <strong>Expiration Date:</strong> ${expirationDate.toLocaleDateString()}<br>
                                <strong>Last Transaction:</strong> ${data.last_txid ? `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">View on explorer</a>` : 'Not available'}
                            </div>`;
                    } else {
                        // Si el dominio está disponible
                        resultContainer.innerHTML = `
                            <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                                <strong>Domain:</strong> ${name}<br>
                                <strong>Status:</strong> Available<br>
                                <strong>Register it:</strong> 
                                <a href="https://bns.foundation/" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                            </div>`;
                    }
                })
                .catch(error => {
                    resultContainer.innerHTML = `
                        <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                            <strong>Error:</strong> ${error.message}. Please try again later.
                        </div>`;
                });
        } else {
            resultContainer.innerHTML = `
                <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                    Please enter a domain name to search.
                </div>`;
        }
    });

    // También agregamos la funcionalidad para presionar Enter y realizar la búsqueda
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
