document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    searchButton.addEventListener('click', function () {
        let name = searchInput.value.trim().toLowerCase();

        if (name) {
            if (!name.endsWith('.btc')) {
                name += '.btc';
            }

            // Primero obtenemos los detalles del dominio
            fetch(`https://api.hiro.so/v1/names/${name}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showAvailableDomain(name); // Si no existe, se muestra como disponible
                    } else if (data.address) {
                        // Si está ocupado, buscamos su historial de transacciones para calcular su fecha de vencimiento
                        fetch(`https://api.hiro.so/extended/v1/address/${data.address}/transactions?limit=50`)
                            .then(response => response.json())
                            .then(txData => {
                                const registrationTx = txData.results.find(tx => 
                                    tx.tx_type === 'contract_call' && tx.contract_call.function_name === 'name-register'
                                );

                                let expirationDateText = "Unknown";
                                if (registrationTx) {
                                    const registrationTimestamp = registrationTx.burn_block_time * 1000; // Convertimos a milisegundos
                                    const expirationDate = new Date(registrationTimestamp);
                                    expirationDate.setFullYear(expirationDate.getFullYear() + 5); // Sumamos 5 años
                                    expirationDateText = expirationDate.toLocaleDateString();
                                }

                                // Mostramos los datos del dominio registrado
                                resultContainer.innerHTML = `
                                    <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                        <strong>Domain:</strong> ${name}<br>
                                        <strong>Address:</strong> ${data.address}<br>
                                        <strong>Status:</strong> Occupied<br>
                                        <strong>Expiration Date:</strong> ${expirationDateText}<br>
                                        <strong>Last Transaction:</strong> 
                                        ${data.last_txid ? `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">View on explorer</a>` : 'Not available'}
                                    </div>`;
                            })
                            .catch(error => showError(error.message));
                    }
                })
                .catch(error => showError(error.message));
        } else {
            resultContainer.innerHTML = `
                <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                    Please enter a domain name to search.
                </div>`;
        }
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });

    function showAvailableDomain(name) {
        resultContainer.innerHTML = `
            <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                <strong>Domain:</strong> ${name}<br>
                <strong>Status:</strong> Available<br>
                <strong>Register it:</strong> 
                <a href="https://bns.foundation" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                <br><strong>Note:</strong> Domains are available for registration. Prices may vary.
            </div>`;
    }

    function showError(message) {
        resultContainer.innerHTML = `
            <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                <strong>Error:</strong> ${message}. Please try again later.
            </div>`;
    }
});
