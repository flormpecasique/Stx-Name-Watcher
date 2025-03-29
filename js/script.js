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
                    if (data.error && data.error.includes("cannot find name")) {
                        resultContainer.innerHTML = `
                            <div class="result-card bg-green-500 text-white p-4 rounded-lg">
                                <strong>Domain:</strong> ${name}<br>
                                <strong>Status:</strong> Available<br>
                                <strong>Register it:</strong> 
                                <a href="https://bns.foundation" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                            </div>`;
                    } else if (data.address) {
                        const expireBlock = data.expire_block;

                        if (isNaN(expireBlock)) {
                            resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                                <strong>Error:</strong> Invalid block number. Please try again later.
                            </div>`;
                            return;
                        }

                        // Obtener el bloque actual y calcular el tiempo promedio real de los bloques
                        Promise.all([
                            fetch('https://api.hiro.so/v2/info').then(res => res.json()),
                            fetch('https://api.hiro.so/v2/blocks?limit=5').then(res => res.json())
                        ]).then(([info, blocks]) => {
                            const currentBlock = info.stacks_tip_height;
                            const blocksRemaining = expireBlock - currentBlock;

                            // Calcular el tiempo promedio real de los últimos bloques
                            let totalTime = 0;
                            for (let i = 1; i < blocks.results.length; i++) {
                                const prevTime = new Date(blocks.results[i - 1].burn_block_time_iso).getTime();
                                const currentTime = new Date(blocks.results[i].burn_block_time_iso).getTime();
                                totalTime += (prevTime - currentTime);
                            }
                            const avgBlockTime = totalTime / (blocks.results.length - 1) / 1000; // en segundos

                            // Calcular la fecha de expiración con el tiempo real de bloques
                            const estimatedTimeSeconds = blocksRemaining * avgBlockTime;
                            const expirationDate = new Date(Date.now() + estimatedTimeSeconds * 1000);
                            const formattedDate = expirationDate.toISOString().replace('T', ' ').split('.')[0];

                            const transactionLink = data.last_txid ? 
                                `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">View on explorer</a>` : 
                                'Not available';

                            resultContainer.innerHTML = `
                                <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                    <strong>Domain:</strong> ${name}<br>
                                    <strong>Address:</strong> ${data.address}<br>
                                    <strong>Status:</strong> Occupied<br>
                                    <strong>Expiration Block:</strong> ${expireBlock}<br>
                                    <strong>Estimated Expiration Date:</strong> ${formattedDate} UTC<br>
                                    <strong>Last Transaction:</strong> ${transactionLink}
                                </div>`;

                        }).catch(error => {
                            resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                                <strong>Error:</strong> Could not fetch blockchain data. Please try again later.
                            </div>`;
                        });
                    } else if (data.error) {
                        resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                            <strong>Error:</strong> ${data.error}. Please try again later.
                        </div>`;
                    }
                })
                .catch(error => {
                    resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                        <strong>Error:</strong> ${error.message}. Please try again later.
                    </div>`;
                });
        } else {
            resultContainer.innerHTML = `<div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                Please enter a domain name to search.
            </div>`;
        }
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
