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

            // Consultamos la API de Hiro para obtener los detalles del dominio
            fetch(`https://api.hiro.so/v1/names/${name}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showAvailableDomain(name); // Si no existe, se muestra como disponible
                    } else if (data.address) {
                        // Si está ocupado, buscamos las transacciones de contrato asociadas
                        fetch(`https://api.hiro.so/extended/v1/address/${data.address}/transactions?filter=contract_call`)
                            .then(response => response.json())
                            .then(txData => {
                                // Mostrar la respuesta completa de las transacciones en consola para depuración
                                console.log(txData);

                                // Verificamos si txData tiene un array de resultados
                                if (txData.results && Array.isArray(txData.results)) {
                                    // Filtrar transacciones relacionadas con el contrato BNS
                                    const bnsContractTx = txData.results.filter(tx => tx.contract_id === 'SP000000000000000000002Q6VF78.bns');
                                    
                                    // Buscar funciones de 'name-register' o 'name-update'
                                    const registerTx = bnsContractTx.find(tx => tx.function_name === 'name-register');
                                    const updateTx = bnsContractTx.find(tx => tx.function_name === 'name-update');
                                    
                                    if (registerTx || updateTx) {
                                        // Usamos la transacción de registro o actualización
                                        const txTime = registerTx ? registerTx.burn_block_time : updateTx.burn_block_time;
                                        const registrationTimestamp = txTime * 1000; // Convertir a milisegundos
                                        const expirationDate = new Date(registrationTimestamp);
                                        expirationDate.setFullYear(expirationDate.getFullYear() + 5); // Sumar 5 años
                                        const expirationDateText = expirationDate.toLocaleDateString();

                                        resultContainer.innerHTML = `
                                            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                                <strong>Domain:</strong> ${name}<br>
                                                <strong>Status:</strong> Occupied ✖️<br>
                                                <strong>Expiration Date:</strong> ${expirationDateText}<br>
                                                <strong>Registration Transaction:</strong> 
                                                <a href="https://explorer.stacks.co/txid/${registerTx ? registerTx.txid : updateTx.txid}" target="_blank">View on explorer</a>
                                            </div>`;
                                    } else {
                                        showUnknownExpiration(data, name);
                                    }
                                } else {
                                    // Si txData no tiene resultados, mostrar un mensaje de error
                                    showError("Error: The transaction data is not in the expected format.");
                                }
                            })
                            .catch(error => {
                                showError(`Error: ${error.message}. Please try again later.`);
                            });
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
                <strong>Status:</strong> Available 🥳<br>
                <strong>Register it:</strong> 
                <a href="https://bns.one" target="_blank" class="underline text-white">BNS One</a>
                <br><strong>Note:</strong> Domains are available for registration. Prices may vary.
            </div>`;
    }

    function showUnknownExpiration(data, name) {
        resultContainer.innerHTML = `
            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                <strong>Domain:</strong> ${name}<br>
                <strong>Address:</strong> ${data.address}<br>
                <strong>Status:</strong> Occupied<br>
                <strong>Expiration Date:</strong> Unknown<br>
                <strong>Registration Transaction:</strong> Not available
            </div>`;
    }

    function showError(message) {
        resultContainer.innerHTML = `
            <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                <strong>Error:</strong> ${message}. Please try again later.
            </div>`;
    }
});
