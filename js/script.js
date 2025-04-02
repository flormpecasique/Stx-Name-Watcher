document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    const BNS_CONTRACTS = [
        "SP000000000000000000002Q6VF78.bns", // Contrato BNS principal
        "SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.standard-owner-name-aidrop-66" // Airdrop BNS
    ];
    const NAME_REGISTER_FUNCTION = "name-register";

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
                        // Buscamos el historial de transacciones de la dirección
                        fetch(`https://api.hiro.so/extended/v1/address/${data.address}/transactions`)
                            .then(response => response.json())
                            .then(txHistory => {
                                let expirationDateText = "Unknown";
                                let registrationTx = null;

                                if (txHistory.results && txHistory.results.length > 0) {
                                    // 1️⃣ Buscamos primero la transacción del Airdrop
                                    let airdropTx = txHistory.results.find(tx =>
                                        tx.contract_call &&
                                        tx.contract_call.contract_id === "SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.standard-owner-name-aidrop-66"
                                    );

                                    if (airdropTx && airdropTx.burn_block_time) {
                                        // Si recibió el Airdrop, tomamos esa fecha
                                        expirationDateText = calculateExpirationDate(airdropTx.burn_block_time);
                                        registrationTx = airdropTx;
                                    } else {
                                        // 2️⃣ Si NO recibió el Airdrop, buscamos `name-register`
                                        let nameRegisterTx = txHistory.results.find(tx =>
                                            tx.contract_call &&
                                            BNS_CONTRACTS.includes(tx.contract_call.contract_id) &&
                                            tx.contract_call.function_name === NAME_REGISTER_FUNCTION
                                        );

                                        if (nameRegisterTx && nameRegisterTx.burn_block_time) {
                                            expirationDateText = calculateExpirationDate(nameRegisterTx.burn_block_time);
                                            registrationTx = nameRegisterTx;
                                        }
                                    }
                                }

                                showOccupiedDomain(data, name, expirationDateText, registrationTx ? registrationTx.tx_id : null);
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
                <strong>Registration Transaction:</strong> 
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
