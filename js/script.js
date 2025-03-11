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
                    // Si la API devuelve un error específico de que el dominio no existe, lo mostramos como DISPONIBLE
                    if (data.error && data.error.includes("cannot find name")) {
                        resultContainer.innerHTML = `
                            <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                                <strong>Domain:</strong> ${name}<br>
                                <strong>Status:</strong> Available<br>
                                <strong>Register it:</strong> 
                                <a href="https://bns.foundation" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                                <br><strong>Note:</strong> Domains are available for registration. Prices may vary.
                            </div>`;
                    } 
                    // Si el dominio está ocupado (tiene una dirección)
                    else if (data.address) {
                        const expireBlock = data.expire_block;

                        // Verificamos si expireBlock es un número válido
                        if (isNaN(expireBlock)) {
                            resultContainer.innerHTML = `
                                <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                                    <strong>Error:</strong> Invalid block number. Please try again later.
                                </div>`;
                            return;
                        }

                        const transactionLink = data.last_txid ? `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">View on explorer</a>` : 'Not available';

                        resultContainer.innerHTML = `
                            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                <strong>Domain:</strong> ${name}<br>
                                <strong>Address:</strong> ${data.address}<br>
                                <strong>Status:</strong> Occupied<br>
                                <strong>Expiration Block:</strong> ${expireBlock}<br>
                                <strong>Last Transaction:</strong> ${transactionLink}<br>
                                <strong>Note:</strong> Domains are registered for 5 years from the registration block. Renew after expiration block.
                            </div>`;
                    } 
                    // Si la API devuelve otro error que no sea el de "cannot find name"
                    else if (data.error) {
                        resultContainer.innerHTML = `
                            <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                                <strong>Error:</strong> ${data.error}. Please try again later.
                            </div>`;
                    }
                })
                .catch(error => {
                    // En caso de un error de conexión u otro fallo, mostramos un mensaje de error
                    resultContainer.innerHTML = `
                        <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                            <strong>Error:</strong> ${error.message}. Please try again later.
                        </div>`;
                });
        } else {
            // Si no se ingresa un nombre de dominio
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
