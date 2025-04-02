document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    const AIRDROP_CONTRACT = "SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.standard-owner-name-aidrop-66"; // Contrato del airdrop BNS

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
                        showAvailableDomain(name);
                    } else if (data.address) {
                        // Consultamos historial de transacciones de la dirección
                        fetch(`https://api.hiro.so/extended/v1/address/${data.address}/transactions`)
                            .then(response => response.json())
                            .then(txHistory => {
                                let expirationDateText = "Unknown";
                                let lastTransactionId = null;

                                if (txHistory.results && txHistory.results.length > 0) {
                                    let airdropTransaction = txHistory.results.find(tx => 
                                        tx.contract_call && tx.contract_call.contract_id === AIRDROP_CONTRACT
                                    );

                                    let lastTransaction = txHistory.results[0]; // Última transacción registrada

                                    if (airdropTransaction) {
                                        lastTransactionId = airdropTransaction.tx_id;
                                        expirationDateText = calculateExpirationDate(airdropTransaction.burn_block_time);
                                    } else if (lastTransaction && lastTransaction.burn_block_time) {
                                        lastTransactionId = lastTransaction.tx_id;
                                        expirationDateText = calculateExpirationDate(lastTransaction.burn_block_time);
                                    }
                                }

                                showOccupiedDomain(data, name, expirationDateText, lastTransactionId);
                            })
                            .catch(error => showUnknownExpiration(data, name));
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

    function calculateExpirationDate(blockTime) {
        const registrationTimestamp = blockTime * 1000; // Convertimos a milisegundos
        let expirationDate = new Date(registrationTimestamp);
        expirationDate.setFullYear(expirationDate.getFullYear() + 5); // Agregamos 5 años
        return expirationDate.toLocaleDateString();
    }

    function showAvailableDomain(name) {
        resultContainer.innerHTML = `
            <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                <strong>Domain:</strong> ${name}<br>
                <strong>Status:</strong> Available 🥳<br>
                <strong>Register it:</strong> 
                <a href="https://bns.foundation" target="_blank" class="underline text-white">BNS Foundation</a>
                <br><strong>Note:</strong> Domains are available for registration. Prices may vary.
            </div>`;
    }

    function showOccupiedDomain(data, name, expirationDateText, txid) {
        resultContainer.innerHTML = `
            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                <strong>Domain:</strong> ${name}<br>
                <strong>Address:</strong> ${data.address}<br>
                <strong>Status:</strong> Occupied ✖️<br>
                <strong>Expiration Date:</strong> ${expirationDateText}<br>
                <strong>Last Transaction:</strong> 
                ${txid ? `<a href="https://explorer.stacks.co/txid/${txid}" target="_blank" class="underline text-blue-300">View on explorer</a>` : 'Not available'}
            </div>`;
    }

    function showUnknownExpiration(data, name) {
        resultContainer.innerHTML = `
            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                <strong>Domain:</strong> ${name}<br>
                <strong>Address:</strong> ${data.address}<br>
                <strong>Status:</strong> Occupied<br>
                <strong>Expiration Date:</strong> Unknown<br>
                <strong>Last Transaction:</strong> Not available
            </div>`;
    }

    function showError(message) {
        resultContainer.innerHTML = `
            <div class="result-card bg-red-500 text-white p-4 rounded-lg">
                <strong>Error:</strong> ${message}. Please try again later.
            </div>`;
    }
});
