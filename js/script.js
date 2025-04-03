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

            fetch(`https://api.hiro.so/v1/names/${name}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        showAvailableDomain(name);
                    } else if (data.address) {
                        fetch(`https://api.hiro.so/extended/v1/address/${data.address}/transactions?limit=50`)
                            .then(response => response.json())
                            .then(txData => {
                                console.log(txData);

                                if (txData && txData.results && Array.isArray(txData.results)) {
                                    const bnsContractTx = txData.results.filter(tx => tx.contract_call && tx.contract_call.contract_id.includes('bns'));
                                    
                                    const registerTx = bnsContractTx.find(tx => tx.contract_call.function_name === 'name-register');
                                    const updateTx = bnsContractTx.find(tx => tx.contract_call.function_name === 'name-update');
                                    
                                    if (registerTx || updateTx) {
                                        const txTime = registerTx ? registerTx.burn_block_time : updateTx.burn_block_time;
                                        const registrationTimestamp = txTime * 1000;
                                        const expirationDate = new Date(registrationTimestamp);
                                        expirationDate.setFullYear(expirationDate.getFullYear() + 5);
                                        const expirationDateText = expirationDate.toLocaleDateString();

                                        resultContainer.innerHTML = `
                                            <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                                <strong>Domain:</strong> ${name}<br>
                                                <strong>Status:</strong> Occupied ✖️<br>
                                                <strong>Expiration Date:</strong> ${expirationDateText}<br>
                                                <strong>Registration Transaction:</strong> 
                                                <a href="https://explorer.stacks.co/txid/${registerTx ? registerTx.tx_id : updateTx.tx_id}" target="_blank">View on explorer</a>
                                            </div>`;
                                    } else {
                                        showUnknownExpiration(data, name);
                                    }
                                } else {
                                    showError("Error: The transaction data format is incorrect.");
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
