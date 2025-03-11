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
            fetch(`https://api.hiro.so/v1/names/${name}`) // Usamos la API de Hiro
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        resultContainer.innerHTML = `
                            <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                                <strong>Error:</strong> ${data.error}. Please try again later.
                            </div>`;
                    } else {
                        // Verificamos el estatus y mostramos el resultado correspondiente
                        const status = data.status;
                        const expireBlock = data.expire_block;
                        const transactionLink = data.last_txid ? `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">View on explorer</a>` : 'Not available';

                        if (status === 'registered') {
                            // Si el dominio está registrado
                            resultContainer.innerHTML = `
                                <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                    <strong>Domain:</strong> ${name}<br>
                                    <strong>Status:</strong> Occupied<br>
                                    <strong>Address:</strong> ${data.address}<br>
                                    <strong>Expiration Block:</strong> ${expireBlock}<br>
                                    <strong>Last Transaction:</strong> ${transactionLink}<br>
                                    <strong>Note:</strong> Domains are registered for 5 years from the registration block. Renew after expiration block.
                                </div>`;
                        } else if (status === 'name-update') {
                            // Si el dominio está en proceso de actualización
                            resultContainer.innerHTML = `
                                <div class="result-card bg-orange-500 text-white p-4 rounded-lg">
                                    <strong>Domain:</strong> ${name}<br>
                                    <strong>Status:</strong> In process of update<br>
                                    <strong>Note:</strong> This domain is currently being updated. It may be available soon.
                                </div>`;
                        } else if (status === 'available') {
                            // Si el dominio está disponible
                            resultContainer.innerHTML = `
                                <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                                    <strong>Domain:</strong> ${name}<br>
                                    <strong>Status:</strong> Available<br>
                                    <strong>Register it:</strong> 
                                    <a href="https://bns.foundation" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                                    <br><strong>Note:</strong> Domains are available for registration. Prices may vary.
                                </div>`;
                        } else {
                            // Si el dominio está en algún otro estado desconocido o reservado
                            resultContainer.innerHTML = `
                                <div class="result-card bg-gray-500 text-white p-4 rounded-lg">
                                    <strong>Domain:</strong> ${name}<br>
                                    <strong>Status:</strong> Unknown or Reserved<br>
                                    <strong>Note:</strong> The domain status is currently not clear. Please check again later.
                                </div>`;
                        }
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
