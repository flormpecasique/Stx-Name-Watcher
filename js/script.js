document.addEventListener('DOMContentLoaded', function () {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('result');

    searchButton.addEventListener('click', function () {
        let name = searchInput.value.trim().toLowerCase();
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
                            <strong>Status:</strong> Available for registration<br>
                            <strong>Register it here:</strong> 
                            <a href="https://bns.foundation" target="_blank" class="underline text-blue-300">BNS Foundation</a>
                        </div>`;
                    return;
                }

                if (!data.address || isNaN(data.expire_block)) {
                    resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                        <strong>Error:</strong> Invalid domain data. Please try again later.
                    </div>`;
                    return;
                }

                const expireBlock = data.expire_block;
                const address = data.address;  

                fetch('https://api.hiro.so/v2/info')
                    .then(response => response.json())
                    .then(info => {
                        const currentBlock = info.stacks_tip_height;
                        const blocksRemaining = expireBlock - currentBlock;

                        fetch('https://api.hiro.so/v2/blocks?limit=10')
                            .then(response => response.json())
                            .then(blockData => {
                                if (!blockData.results || blockData.results.length < 2) {
                                    resultContainer.innerHTML = `<div class="result-card bg-orange-500 text-white p-4 rounded-lg">
                                        <strong>Warning:</strong> Could not fetch block data.<br>
                                        <strong>Expiration Block:</strong> ${expireBlock}
                                    </div>`;
                                    return;
                                }

                                let totalTime = 0;
                                for (let i = 1; i < blockData.results.length; i++) {
                                    const prevTime = new Date(blockData.results[i - 1].burn_block_time_iso).getTime();
                                    const currentTime = new Date(blockData.results[i].burn_block_time_iso).getTime();
                                    totalTime += (prevTime - currentTime);
                                }

                                const avgBlockTime = totalTime / (blockData.results.length - 1) / 1000;
                                const estimatedTimeSeconds = blocksRemaining * avgBlockTime;
                                const expirationDate = new Date(Date.now() + estimatedTimeSeconds * 1000);
                                const formattedDate = expirationDate.toISOString().replace('T', ' ').split('.')[0];

                                const transactionLink = data.last_txid ? 
                                    `<a href="https://explorer.stacks.co/txid/${data.last_txid}" target="_blank">View on explorer</a>` : 
                                    'Not available';

                                resultContainer.innerHTML = `
                                    <div class="result-card bg-yellow-500 text-white p-4 rounded-lg">
                                        <strong>Domain:</strong> ${name}<br>
                                        <strong>Address:</strong> ${address}<br>
                                        <strong>Status:</strong> Occupied<br>
                                        <strong>Expiration Block:</strong> ${expireBlock}<br>
                                        <strong>Exact Expiration Date:</strong> ${formattedDate} UTC<br>
                                        <strong>Last Transaction:</strong> ${transactionLink}
                                    </div>`;
                            })
                            .catch(() => {
                                resultContainer.innerHTML = `<div class="result-card bg-orange-500 text-white p-4 rounded-lg">
                                    <strong>Warning:</strong> Could not fetch block data.<br>
                                    <strong>Expiration Block:</strong> ${expireBlock}
                                </div>`;
                            });

                    })
                    .catch(() => {
                        resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                            <strong>Error:</strong> Could not fetch blockchain info. Please try again later.
                        </div>`;
                    });

            })
            .catch(() => {
                resultContainer.innerHTML = `<div class="result-card bg-red-500 text-white p-4 rounded-lg">
                    <strong>Error:</strong> Could not fetch blockchain data. Please try again later.
                </div>`;
            });
    });

    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            searchButton.click();
        }
    });
});
